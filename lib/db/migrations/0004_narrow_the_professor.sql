CREATE TYPE "public"."appointment_status" AS ENUM('scheduled', 'confirmed', 'in_progress', 'completed', 'no_show', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."branch_status" AS ENUM('active', 'paused', 'closed');--> statement-breakpoint
CREATE TYPE "public"."room_type" AS ENUM('couch', 'functional', 'isokinetic', 'assessment', 'shared');--> statement-breakpoint
CREATE TYPE "public"."practitioner_specialty" AS ENUM('fisioterapia_deportiva', 'readaptacion_funcional', 'fisioterapia_general', 'kinesiologia', 'osteopatia', 'nutricion_deportiva', 'preparacion_fisica', 'medicina_deportiva', 'otra');--> statement-breakpoint
CREATE TABLE "appointment_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"duration_minutes" integer DEFAULT 45 NOT NULL,
	"color" text DEFAULT '#3FBCD4' NOT NULL,
	"bookable_by_patient" text DEFAULT 'false' NOT NULL,
	"price_cents" integer,
	"is_active" text DEFAULT 'true' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"branch_id" uuid NOT NULL,
	"practitioner_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"type_id" uuid NOT NULL,
	"room_id" uuid,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"status" "appointment_status" DEFAULT 'scheduled' NOT NULL,
	"notes" text,
	"cancellation_reason" text,
	"confirmation_token" uuid DEFAULT gen_random_uuid(),
	"source" text DEFAULT 'manual' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "appointments_end_after_start" CHECK ("appointments"."end_at" > "appointments"."start_at")
);
--> statement-breakpoint
CREATE TABLE "branches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"color" text,
	"address_line" text,
	"city" text,
	"state" text,
	"postal_code" text,
	"phone" text,
	"timezone" text DEFAULT 'America/Mexico_City' NOT NULL,
	"default_open_at" time DEFAULT '08:00',
	"default_close_at" time DEFAULT '21:00',
	"status" "branch_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"branch_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" "room_type" DEFAULT 'couch' NOT NULL,
	"capacity" integer DEFAULT 1 NOT NULL,
	"is_active" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "practitioners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"display_name" text NOT NULL,
	"title" text,
	"license_number" text,
	"specialty" "practitioner_specialty" DEFAULT 'fisioterapia_deportiva' NOT NULL,
	"color" text DEFAULT '#3FBCD4' NOT NULL,
	"primary_branch_id" uuid,
	"bio" text,
	"is_active" text DEFAULT 'true' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "appointment_types" ADD CONSTRAINT "appointment_types_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_practitioner_id_practitioners_id_fk" FOREIGN KEY ("practitioner_id") REFERENCES "public"."practitioners"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_type_id_appointment_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."appointment_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branches" ADD CONSTRAINT "branches_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practitioners" ADD CONSTRAINT "practitioners_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practitioners" ADD CONSTRAINT "practitioners_primary_branch_id_branches_id_fk" FOREIGN KEY ("primary_branch_id") REFERENCES "public"."branches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "appointment_types_org_slug_unique" ON "appointment_types" USING btree ("organization_id","slug");--> statement-breakpoint
CREATE INDEX "appointment_types_org_active_idx" ON "appointment_types" USING btree ("organization_id","is_active");--> statement-breakpoint
CREATE INDEX "appointments_branch_start_idx" ON "appointments" USING btree ("branch_id","start_at");--> statement-breakpoint
CREATE INDEX "appointments_practitioner_start_idx" ON "appointments" USING btree ("practitioner_id","start_at");--> statement-breakpoint
CREATE INDEX "appointments_patient_start_idx" ON "appointments" USING btree ("patient_id","start_at");--> statement-breakpoint
CREATE INDEX "appointments_org_status_start_idx" ON "appointments" USING btree ("organization_id","status","start_at");--> statement-breakpoint
CREATE UNIQUE INDEX "branches_org_slug_unique" ON "branches" USING btree ("organization_id","slug");--> statement-breakpoint
CREATE INDEX "branches_org_status_idx" ON "branches" USING btree ("organization_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "rooms_branch_name_unique" ON "rooms" USING btree ("branch_id","name");--> statement-breakpoint
CREATE INDEX "rooms_org_branch_idx" ON "rooms" USING btree ("organization_id","branch_id");--> statement-breakpoint
CREATE UNIQUE INDEX "practitioners_org_user_unique" ON "practitioners" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE INDEX "practitioners_org_active_idx" ON "practitioners" USING btree ("organization_id","is_active");
--> statement-breakpoint

-- ============================================================================
-- RLS multi-tenant + audit triggers + updated_at triggers para tablas de agenda
-- Patrón idéntico al usado en patients (Fase 1.1) y RLS policies (Paso 8).
-- ============================================================================

-- ───── branches ─────────────────────────────────────────────────────────────
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches FORCE ROW LEVEL SECURITY;
--> statement-breakpoint

CREATE POLICY branches_select ON public.branches
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.current_user_orgs()));
--> statement-breakpoint

CREATE POLICY branches_admin_write ON public.branches
  FOR ALL TO authenticated
  USING (
    organization_id IN (
      SELECT cuo.organization_id FROM public.current_user_orgs() cuo
      WHERE cuo.role IN ('admin', 'director')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT cuo.organization_id FROM public.current_user_orgs() cuo
      WHERE cuo.role IN ('admin', 'director')
    )
  );
--> statement-breakpoint

CREATE TRIGGER tg_audit_branch
  AFTER INSERT OR UPDATE OR DELETE ON public.branches
  FOR EACH ROW EXECUTE FUNCTION public.record_audit_event('branch');
--> statement-breakpoint

CREATE TRIGGER tg_branches_updated_at
  BEFORE UPDATE ON public.branches
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
--> statement-breakpoint

-- ───── rooms ────────────────────────────────────────────────────────────────
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms FORCE ROW LEVEL SECURITY;
--> statement-breakpoint

CREATE POLICY rooms_select ON public.rooms
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.current_user_orgs()));
--> statement-breakpoint

CREATE POLICY rooms_admin_write ON public.rooms
  FOR ALL TO authenticated
  USING (
    organization_id IN (
      SELECT cuo.organization_id FROM public.current_user_orgs() cuo
      WHERE cuo.role IN ('admin', 'director')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT cuo.organization_id FROM public.current_user_orgs() cuo
      WHERE cuo.role IN ('admin', 'director')
    )
  );
--> statement-breakpoint

CREATE TRIGGER tg_audit_room
  AFTER INSERT OR UPDATE OR DELETE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.record_audit_event('room');
--> statement-breakpoint

CREATE TRIGGER tg_rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
--> statement-breakpoint

-- ───── practitioners ────────────────────────────────────────────────────────
ALTER TABLE public.practitioners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practitioners FORCE ROW LEVEL SECURITY;
--> statement-breakpoint

CREATE POLICY practitioners_select ON public.practitioners
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.current_user_orgs()));
--> statement-breakpoint

CREATE POLICY practitioners_admin_write ON public.practitioners
  FOR ALL TO authenticated
  USING (
    organization_id IN (
      SELECT cuo.organization_id FROM public.current_user_orgs() cuo
      WHERE cuo.role IN ('admin', 'director')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT cuo.organization_id FROM public.current_user_orgs() cuo
      WHERE cuo.role IN ('admin', 'director')
    )
  );
--> statement-breakpoint

CREATE TRIGGER tg_audit_practitioner
  AFTER INSERT OR UPDATE OR DELETE ON public.practitioners
  FOR EACH ROW EXECUTE FUNCTION public.record_audit_event('practitioner');
--> statement-breakpoint

CREATE TRIGGER tg_practitioners_updated_at
  BEFORE UPDATE ON public.practitioners
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
--> statement-breakpoint

-- ───── appointment_types ────────────────────────────────────────────────────
ALTER TABLE public.appointment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_types FORCE ROW LEVEL SECURITY;
--> statement-breakpoint

CREATE POLICY appointment_types_select ON public.appointment_types
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.current_user_orgs()));
--> statement-breakpoint

CREATE POLICY appointment_types_admin_write ON public.appointment_types
  FOR ALL TO authenticated
  USING (
    organization_id IN (
      SELECT cuo.organization_id FROM public.current_user_orgs() cuo
      WHERE cuo.role IN ('admin', 'director')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT cuo.organization_id FROM public.current_user_orgs() cuo
      WHERE cuo.role IN ('admin', 'director')
    )
  );
--> statement-breakpoint

CREATE TRIGGER tg_audit_appointment_type
  AFTER INSERT OR UPDATE OR DELETE ON public.appointment_types
  FOR EACH ROW EXECUTE FUNCTION public.record_audit_event('appointment_type');
--> statement-breakpoint

CREATE TRIGGER tg_appointment_types_updated_at
  BEFORE UPDATE ON public.appointment_types
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
--> statement-breakpoint

-- ───── appointments ─────────────────────────────────────────────────────────
-- Practitioners + reception pueden crear/modificar citas. DELETE bloqueado
-- (las citas se "cancelan" cambiando status, no se borran — auditoría limpia).
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments FORCE ROW LEVEL SECURITY;
--> statement-breakpoint

CREATE POLICY appointments_select ON public.appointments
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.current_user_orgs()));
--> statement-breakpoint

CREATE POLICY appointments_insert ON public.appointments
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT cuo.organization_id FROM public.current_user_orgs() cuo
      WHERE cuo.role IN ('admin', 'director', 'practitioner', 'reception')
    )
  );
--> statement-breakpoint

CREATE POLICY appointments_update ON public.appointments
  FOR UPDATE TO authenticated
  USING (
    organization_id IN (
      SELECT cuo.organization_id FROM public.current_user_orgs() cuo
      WHERE cuo.role IN ('admin', 'director', 'practitioner', 'reception')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT cuo.organization_id FROM public.current_user_orgs() cuo
      WHERE cuo.role IN ('admin', 'director', 'practitioner', 'reception')
    )
  );
--> statement-breakpoint

CREATE POLICY appointments_no_delete ON public.appointments
  FOR DELETE TO authenticated
  USING (false);
--> statement-breakpoint

CREATE TRIGGER tg_audit_appointment
  AFTER INSERT OR UPDATE OR DELETE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.record_audit_event('appointment');
--> statement-breakpoint

CREATE TRIGGER tg_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();