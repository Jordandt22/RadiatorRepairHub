
-- Claim RPC: set owner on businesses; do not insert business_profiles
CREATE OR REPLACE FUNCTION public.complete_business_claim(
  p_claim_request_id uuid,
  p_business_id uuid,
  p_uid uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  insert into public.users (uid, role)
  values (p_uid, 'business_owner'::user_roles)
  on conflict (uid) do nothing;

  update public.claim_requests
  set status = 'success'::claim_request_statuses,
      completed_by = p_uid,
      completed_at = now()
  where claim_request_id = p_claim_request_id
    and business_id = p_business_id;

  update public.businesses
  set is_claimed = true,
      owner_uid = p_uid,
      last_edited_at = coalesce(last_edited_at, now())
  where id = p_business_id;
end;
$function$;

