-- Migration: Add research_proposal to approval_requests request_type
-- Date: 2026-02-28

-- Update the check constraint to include 'research_proposal'
ALTER TABLE public.approval_requests 
DROP CONSTRAINT IF EXISTS approval_requests_request_type_check;

ALTER TABLE public.approval_requests 
ADD CONSTRAINT approval_requests_request_type_check 
CHECK (request_type IN (
    'menu_publish', 'promo_publish', 'promo_pause',
    'venue_claim', 'access_grant', 'access_revoke',
    'refund', 'research_proposal'
));

-- Add comment for clarity
COMMENT ON COLUMN public.approval_requests.request_type IS 
    'Type of approval request: menu_publish, promo_publish, promo_pause, venue_claim, access_grant, access_revoke, refund, research_proposal';
