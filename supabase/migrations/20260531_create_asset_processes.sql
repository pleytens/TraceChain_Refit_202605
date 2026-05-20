-- Insert Asset_in action into action library
INSERT INTO tc_action_library (id, action_key, name, category, description, produces_output, custom_param_example, is_system, is_active, sort_order)
VALUES (
  'act_asset_in',
  'asset_in',
  'Asset In',
  'Movement',
  'Track material/product entering client premises. Records Where and To location.',
  false,
  '',
  false,
  true,
  100
) ON CONFLICT (id) DO NOTHING;

-- Insert Asset_out action into action library
INSERT INTO tc_action_library (id, action_key, name, category, description, produces_output, custom_param_example, is_system, is_active, sort_order)
VALUES (
  'act_asset_out',
  'asset_out',
  'Asset Out',
  'Movement',
  'Track material/product leaving to customer premises. Records Where, From and To location.',
  false,
  '',
  false,
  true,
  101
) ON CONFLICT (id) DO NOTHING;

-- Insert Asset_in process (pinned at top with sort_order -2)
INSERT INTO tc_processes (id, name, description, is_final, sort_order, status, is_used)
VALUES (
  'proc_asset_in',
  'Asset_in',
  'Process for tracking materials/products entering client premises',
  false,
  -2,
  'ACTIVE',
  false
) ON CONFLICT (id) DO NOTHING;

-- Insert Asset_out process (pinned 2nd with sort_order -1)
INSERT INTO tc_processes (id, name, description, is_final, sort_order, status, is_used)
VALUES (
  'proc_asset_out',
  'Asset_out',
  'Process for tracking materials/products leaving to customer premises',
  false,
  -1,
  'ACTIVE',
  false
) ON CONFLICT (id) DO NOTHING;

-- Link Asset_in action to Asset_in process
INSERT INTO tc_process_action_steps (id, process_id, action_id, step_order, is_required, notes)
VALUES (
  'step_asset_in_action',
  'proc_asset_in',
  'act_asset_in',
  1,
  true,
  ''
) ON CONFLICT (id) DO NOTHING;

-- Link Asset_out action to Asset_out process
INSERT INTO tc_process_action_steps (id, process_id, action_id, step_order, is_required, notes)
VALUES (
  'step_asset_out_action',
  'proc_asset_out',
  'act_asset_out',
  1,
  true,
  ''
) ON CONFLICT (id) DO NOTHING;
