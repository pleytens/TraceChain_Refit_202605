ALTER TABLE tc_action_library
  ADD COLUMN IF NOT EXISTS required_variable_categories JSONB DEFAULT '{"who":false,"when":false,"what":false,"where":false}',
  ADD COLUMN IF NOT EXISTS is_used BOOLEAN NOT NULL DEFAULT false;
