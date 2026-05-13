-- ============================================================================
-- RLS policies — Paso 8 de Fase 0
-- Aislamiento multi-tenant por organization_id.
--
-- Estrategia:
--   1. Función helper `current_user_orgs()` SECURITY DEFINER que devuelve
--      las orgs activas del current user. Bypassea RLS internamente para
--      evitar infinite recursion en policies de `members`.
--   2. ENABLE ROW LEVEL SECURITY en las 5 tablas.
--   3. Policies por tabla (SELECT/INSERT/UPDATE/DELETE separadas).
--
-- Service role bypassea RLS por default — admin actions corren con service
-- role (lib/supabase/service.ts), ESLint bloquea su import fuera de
-- server/actions/admin/** (regla 11 CLAUDE.md).
-- ============================================================================

-- ───── Helper: orgs activas del current user (evita recursion en members) ───
CREATE OR REPLACE FUNCTION public.current_user_orgs()
RETURNS TABLE(organization_id uuid, role public.member_role)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT m.organization_id, m.role
  FROM public.members m
  WHERE m.user_id = auth.uid() AND m.status = 'active'
$$;

COMMENT ON FUNCTION public.current_user_orgs() IS
  'Orgs activas del current user. SECURITY DEFINER para evitar recursion en policies de members.';

GRANT EXECUTE ON FUNCTION public.current_user_orgs() TO authenticated, anon;

-- ===== organizations =====
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "organizations_select_members" ON public.organizations
  FOR SELECT
  TO authenticated
  USING (
    id IN (SELECT organization_id FROM public.current_user_orgs())
  );

-- INSERT/UPDATE/DELETE: sólo service role (sin policy → deny default).

-- ===== tenant_domains =====
ALTER TABLE public.tenant_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_domains_select" ON public.tenant_domains
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.current_user_orgs()
      WHERE role IN ('admin', 'director')
    )
  );

CREATE POLICY "tenant_domains_insert_admin" ON public.tenant_domains
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.current_user_orgs()
      WHERE role = 'admin'
    )
  );

CREATE POLICY "tenant_domains_update_admin" ON public.tenant_domains
  FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.current_user_orgs()
      WHERE role = 'admin'
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.current_user_orgs()
      WHERE role = 'admin'
    )
  );

CREATE POLICY "tenant_domains_delete_admin" ON public.tenant_domains
  FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.current_user_orgs()
      WHERE role = 'admin'
    )
  );

-- ===== tenant_branding =====
-- Selectable público (logo/colores del tenant son info pública para landing
-- y signup). Modificable solo por admins del tenant.
ALTER TABLE public.tenant_branding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_branding_select_public" ON public.tenant_branding
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "tenant_branding_insert_admin" ON public.tenant_branding
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.current_user_orgs()
      WHERE role = 'admin'
    )
  );

CREATE POLICY "tenant_branding_update_admin" ON public.tenant_branding
  FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.current_user_orgs()
      WHERE role = 'admin'
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.current_user_orgs()
      WHERE role = 'admin'
    )
  );

CREATE POLICY "tenant_branding_delete_admin" ON public.tenant_branding
  FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.current_user_orgs()
      WHERE role = 'admin'
    )
  );

-- ===== members =====
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- SELECT: self O admins/directores de la misma org.
-- Sin la función helper esto causaría infinite recursion.
CREATE POLICY "members_select_self_or_org_admin" ON public.members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR organization_id IN (
      SELECT organization_id FROM public.current_user_orgs()
      WHERE role IN ('admin', 'director')
    )
  );

CREATE POLICY "members_insert_admin" ON public.members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.current_user_orgs()
      WHERE role = 'admin'
    )
  );

CREATE POLICY "members_update_admin" ON public.members
  FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.current_user_orgs()
      WHERE role = 'admin'
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.current_user_orgs()
      WHERE role = 'admin'
    )
  );

CREATE POLICY "members_delete_admin" ON public.members
  FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.current_user_orgs()
      WHERE role = 'admin'
    )
  );

-- ===== audit_logs =====
-- Append-only via trigger SECURITY DEFINER (Paso 9). Sin policies → todo
-- bloqueado para usuarios normales. Solo se accede vía función helper que
-- corre con SECURITY DEFINER (Paso 9).
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
-- No CREATE POLICY: deny all default a usuarios authenticated/anon.
