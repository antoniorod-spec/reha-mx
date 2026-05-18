-- ============================================================================
-- Audit log helpers — Paso 9 de Fase 0
-- Append-only por compliance NOM-004-SSA3 + LFPDPPP.
--
-- Tres piezas:
--   1. RLS append-only en `audit_logs`:
--      - INSERT permitido a authenticated (si la org coincide con una del user).
--      - SELECT bloqueado a authenticated — solo vía función SECURITY DEFINER.
--      - UPDATE/DELETE NUNCA — ni para service_role (regla compliance).
--   2. Función SECURITY DEFINER `read_audit_logs(org_id, ...)` que solo
--      admin/director pueden invocar.
--   3. Función genérica `record_audit_event()` lista para usar como TRIGGER
--      sobre tablas clínicas cuando existan (Fase 2: clinical_records, etc.).
-- ============================================================================

-- ───── 1a. RLS append-only en audit_logs ────────────────────────────────────
-- (audit_logs ya existe, drizzle la creó en 0000_daily_medusa.sql)

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- INSERT: solo si el organization_id es uno del current user
CREATE POLICY audit_logs_insert ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM public.current_user_orgs())
  );

-- SELECT directo: bloqueado para authenticated. Se lee vía read_audit_logs().
-- (sin policy de SELECT = nadie puede SELECT con role authenticated)

-- UPDATE/DELETE: append-only ABSOLUTO. Bloqueamos con FORCE para que service_role
-- tampoco pueda alterar history (excepción legítima: nunca debe ocurrir).
ALTER TABLE public.audit_logs FORCE ROW LEVEL SECURITY;

CREATE POLICY audit_logs_no_update ON public.audit_logs
  FOR UPDATE TO public
  USING (false);

CREATE POLICY audit_logs_no_delete ON public.audit_logs
  FOR DELETE TO public
  USING (false);

COMMENT ON TABLE public.audit_logs IS
  'Audit log append-only (NOM-004-SSA3). INSERT vía RLS. SELECT solo vía read_audit_logs(). UPDATE/DELETE bloqueado por policy FORCE.';


-- ───── 2. Función SECURITY DEFINER para leer audit logs ─────────────────────
-- Solo admin/director del tenant pueden invocarla. Devuelve los logs filtrados
-- por organización + rango de fechas + acción opcional.

CREATE OR REPLACE FUNCTION public.read_audit_logs(
  p_org_id uuid,
  p_since timestamptz DEFAULT (now() - interval '30 days'),
  p_until timestamptz DEFAULT now(),
  p_action text DEFAULT NULL,
  p_resource_type text DEFAULT NULL,
  p_resource_id uuid DEFAULT NULL,
  p_limit int DEFAULT 500
)
RETURNS TABLE(
  id uuid,
  organization_id uuid,
  user_id uuid,
  action text,
  resource_type text,
  resource_id uuid,
  metadata jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  -- Authz: solo admin/director del tenant.
  IF NOT EXISTS (
    SELECT 1
    FROM public.current_user_orgs() cuo
    WHERE cuo.organization_id = p_org_id
      AND cuo.role IN ('admin', 'director')
  ) THEN
    RAISE EXCEPTION 'forbidden: read_audit_logs requires admin or director role for org %', p_org_id
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  RETURN QUERY
    SELECT
      al.id,
      al.organization_id,
      al.user_id,
      al.action,
      al.resource_type,
      al.resource_id,
      al.metadata,
      al.ip_address,
      al.user_agent,
      al.created_at
    FROM public.audit_logs al
    WHERE al.organization_id = p_org_id
      AND al.created_at >= p_since
      AND al.created_at <= p_until
      AND (p_action IS NULL OR al.action = p_action)
      AND (p_resource_type IS NULL OR al.resource_type = p_resource_type)
      AND (p_resource_id IS NULL OR al.resource_id = p_resource_id)
    ORDER BY al.created_at DESC
    LIMIT LEAST(p_limit, 5000);
END;
$$;

COMMENT ON FUNCTION public.read_audit_logs IS
  'Lee audit logs de una organización. Solo admin/director del tenant. SECURITY DEFINER (bypassea RLS de audit_logs que bloquea SELECT directo).';


-- ───── 3. Trigger genérico para tablas clínicas (template) ──────────────────
-- Aplicable a clinical_records, soap_notes, assessments, etc. en Fase 2.
-- Se invoca como:
--   CREATE TRIGGER tg_audit_<table> AFTER INSERT OR UPDATE OR DELETE
--     ON public.<table>
--     FOR EACH ROW EXECUTE FUNCTION public.record_audit_event('<resource_type>');

CREATE OR REPLACE FUNCTION public.record_audit_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_resource_type text := TG_ARGV[0];
  v_action text;
  v_org_id uuid;
  v_resource_id uuid;
  v_metadata jsonb;
BEGIN
  -- Verbo según la operación
  v_action := v_resource_type || '.' || lower(TG_OP); -- 'patient.insert' | '.update' | '.delete'

  -- Mapeo de columnas estándar (organization_id, id) — todas las tablas clínicas
  -- las tienen por convención (master plan §3 y §4.2).
  IF TG_OP = 'DELETE' THEN
    v_org_id := (row_to_json(OLD) ->> 'organization_id')::uuid;
    v_resource_id := (row_to_json(OLD) ->> 'id')::uuid;
    v_metadata := jsonb_build_object('before', row_to_json(OLD));
  ELSIF TG_OP = 'UPDATE' THEN
    v_org_id := (row_to_json(NEW) ->> 'organization_id')::uuid;
    v_resource_id := (row_to_json(NEW) ->> 'id')::uuid;
    v_metadata := jsonb_build_object(
      'before', row_to_json(OLD),
      'after', row_to_json(NEW)
    );
  ELSE -- INSERT
    v_org_id := (row_to_json(NEW) ->> 'organization_id')::uuid;
    v_resource_id := (row_to_json(NEW) ->> 'id')::uuid;
    v_metadata := jsonb_build_object('after', row_to_json(NEW));
  END IF;

  -- Si no hay organization_id (tabla mal configurada), no rompemos — solo skip.
  IF v_org_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  INSERT INTO public.audit_logs (
    organization_id,
    user_id,
    action,
    resource_type,
    resource_id,
    metadata
  ) VALUES (
    v_org_id,
    auth.uid(),
    v_action,
    v_resource_type,
    v_resource_id,
    v_metadata
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION public.record_audit_event IS
  'Trigger function genérica AFTER INSERT/UPDATE/DELETE para tablas clínicas. Espera un argumento: el resource_type (ej: "patient"). Captura before/after en metadata. Usa SECURITY DEFINER porque audit_logs.INSERT requiere RLS que el auth.uid del trigger podría no cumplir en cron jobs.';
