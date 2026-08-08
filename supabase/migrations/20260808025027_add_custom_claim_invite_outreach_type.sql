-- Must commit before use in outreach_business_list view
ALTER TYPE "public"."outreach_type" ADD VALUE IF NOT EXISTS 'custom_claim_invite';
