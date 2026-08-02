-- A/B claim-invite outreach types (must commit before use in view)
ALTER TYPE "public"."outreach_type" ADD VALUE IF NOT EXISTS 'ownership_claim_invite';
ALTER TYPE "public"."outreach_type" ADD VALUE IF NOT EXISTS 'lead_claim_invite';
