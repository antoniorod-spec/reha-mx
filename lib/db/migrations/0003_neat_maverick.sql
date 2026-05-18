CREATE TYPE "public"."patient_sex" AS ENUM('female', 'male', 'intersex', 'unspecified');--> statement-breakpoint
CREATE TYPE "public"."patient_status" AS ENUM('active', 'discharged', 'inactive', 'archived');--> statement-breakpoint
CREATE TYPE "public"."sport_level" AS ENUM('recreational', 'amateur', 'semipro', 'professional', 'elite');--> statement-breakpoint
CREATE TABLE "patients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"external_id" text,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"phone" text,
	"birth_date" date,
	"sex" "patient_sex",
	"curp" text,
	"rfc" text,
	"sport" text,
	"sport_level" "sport_level",
	"functional_goal" text,
	"estimated_return_date" date,
	"notes" text,
	"status" "patient_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "patients_org_last_name_idx" ON "patients" USING btree ("organization_id","last_name");--> statement-breakpoint
CREATE INDEX "patients_org_status_idx" ON "patients" USING btree ("organization_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "patients_org_email_unique" ON "patients" USING btree ("organization_id","email") WHERE "patients"."email" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "patients_org_external_id_unique" ON "patients" USING btree ("organization_id","external_id") WHERE "patients"."external_id" IS NOT NULL;
--> statement-breakpoint

-- ============================================================================
-- RLS multi-tenant para `patients`
-- Cualquier miembro activo de la org puede SELECT/INSERT/UPDATE.
-- DELETE bloqueado por compliance NOM-004-SSA3 (no se borra expediente).
-- ============================================================================

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients FORCE ROW LEVEL SECURITY;
--> statement-breakpoint

CREATE POLICY patients_select ON public.patients
  FOR SELECT TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM public.current_user_orgs())
  );
--> statement-breakpoint

CREATE POLICY patients_insert ON public.patients
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT cuo.organization_id FROM public.current_user_orgs() cuo
      WHERE cuo.role IN ('admin', 'director', 'practitioner', 'reception')
    )
  );
--> statement-breakpoint

CREATE POLICY patients_update ON public.patients
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

-- DELETE: bloqueado a authenticated. Solo service_role (admin Rehai) puede.
CREATE POLICY patients_no_delete ON public.patients
  FOR DELETE TO authenticated
  USING (false);
--> statement-breakpoint

-- Audit trigger: cada insert/update/delete de paciente queda en audit_logs.
CREATE TRIGGER tg_audit_patient
  AFTER INSERT OR UPDATE OR DELETE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.record_audit_event('patient');
--> statement-breakpoint

-- updated_at automático al modificar la row.
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
--> statement-breakpoint

CREATE TRIGGER tg_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.tg_set_updated_at();