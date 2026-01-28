-- Add token tracking columns to agent_actions for Claude API cost monitoring
-- Phase 3 Moltbot Integration: Cost Monitoring

ALTER TABLE public.agent_actions
ADD COLUMN IF NOT EXISTS input_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS output_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS cost_estimate DECIMAL(10, 6) DEFAULT 0;

-- Add index for cost analysis queries
CREATE INDEX IF NOT EXISTS idx_agent_actions_cost ON public.agent_actions(cost_estimate);
CREATE INDEX IF NOT EXISTS idx_agent_actions_tokens ON public.agent_actions(input_tokens, output_tokens);

-- Comment for documentation
COMMENT ON COLUMN public.agent_actions.input_tokens IS 'Number of input tokens used in Claude API call';
COMMENT ON COLUMN public.agent_actions.output_tokens IS 'Number of output tokens used in Claude API call';
COMMENT ON COLUMN public.agent_actions.cost_estimate IS 'Estimated cost in USD (Sonnet 3.5: $3/M input, $15/M output)';
