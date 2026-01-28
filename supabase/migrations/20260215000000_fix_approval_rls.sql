-- Fix: Allow venue owners to create approval requests
CREATE POLICY "approval_requests_authenticated_insert" ON public.approval_requests
    FOR INSERT 
    WITH CHECK (
        auth.uid() = requested_by 
        AND 
        EXISTS (
            SELECT 1 FROM public.venues v 
            WHERE v.id = venue_id 
            AND v.owner_id = auth.uid()
        )
    );

-- Trigger to automatically handle approval resolution
CREATE OR REPLACE FUNCTION public.handle_approval_resolved()
RETURNS TRIGGER AS $$
DECLARE
    draft_record RECORD;
BEGIN
    -- Only act when status changes to 'approved'
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        
        -- 1. Handle Menu Publish
        IF NEW.request_type = 'menu_publish' THEN
            SELECT * INTO draft_record FROM public.menu_item_drafts WHERE id = NEW.entity_id;
            
            IF FOUND THEN
                -- Insert into real menu_items
                -- Note: Currently assumes NEW items. For updates, we'd need original_item_id link.
                INSERT INTO public.menu_items (
                    venue_id, category_id, name, description, price, 
                    image_url, available, dietary_flags, sort_order
                ) VALUES (
                    draft_record.venue_id, draft_record.category_id, draft_record.name, 
                    draft_record.description, draft_record.price, draft_record.image_url, 
                    true, draft_record.dietary_flags, 999 -- default sort
                );

                -- Update draft status
                UPDATE public.menu_item_drafts 
                SET status = 'published' 
                WHERE id = NEW.entity_id;
            END IF;
        END IF;

        -- 2. Handle Promo Publish (Future)
        -- IF NEW.request_type = 'promo_publish' ...

    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid conflicts in dev
DROP TRIGGER IF EXISTS on_approval_resolved ON public.approval_requests;

CREATE TRIGGER on_approval_resolved
    AFTER UPDATE ON public.approval_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_approval_resolved();
