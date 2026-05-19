-- Drop and recreate tc_processes with TEXT primary key to match action step FKs
-- (the original 20260424 migration created tc_processes with id BIGINT)
DROP TABLE IF EXISTS tc_process_action_steps CASCADE;
DROP TABLE IF EXISTS tc_processes CASCADE;
DROP TABLE IF EXISTS tc_action_custom_params CASCADE;
DROP TABLE IF EXISTS tc_action_library CASCADE;

CREATE TABLE IF NOT EXISTS tc_action_library (
  id TEXT PRIMARY KEY,
  action_key TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Movement',
  description TEXT NOT NULL DEFAULT '',
  produces_output BOOLEAN NOT NULL DEFAULT false,
  custom_param_example TEXT NOT NULL DEFAULT '',
  is_system BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tc_action_custom_params (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  action_id TEXT NOT NULL REFERENCES tc_action_library(id) ON DELETE CASCADE,
  param_name TEXT NOT NULL,
  param_type TEXT NOT NULL DEFAULT 'text',
  param_unit TEXT NOT NULL DEFAULT '',
  is_required BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tc_processes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  is_final BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tc_process_action_steps (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  process_id TEXT NOT NULL REFERENCES tc_processes(id) ON DELETE CASCADE,
  action_id TEXT NOT NULL REFERENCES tc_action_library(id),
  step_order INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN NOT NULL DEFAULT true,
  notes TEXT NOT NULL DEFAULT ''
);

ALTER TABLE tc_action_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_action_custom_params ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_process_action_steps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public full access" ON tc_action_library;
CREATE POLICY "Public full access" ON tc_action_library FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access" ON tc_action_custom_params;
CREATE POLICY "Public full access" ON tc_action_custom_params FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access" ON tc_processes;
CREATE POLICY "Public full access" ON tc_processes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access" ON tc_process_action_steps;
CREATE POLICY "Public full access" ON tc_process_action_steps FOR ALL USING (true) WITH CHECK (true);

INSERT INTO tc_action_library (id, action_key, name, category, description, produces_output, custom_param_example, is_system, is_active, sort_order) VALUES
('sys_start', 'PROCESS_START', 'Process Start', 'Control', 'System action. Auto-triggered when the first action is created. Not editable.', false, '', true, true, 0),
('sys_end', 'PROCESS_END', 'Process End', 'Control', 'Closes process. Destination carries over to next process. Issues QR code if final process.', false, 'Destination location', true, true, 99),
('act_move_in', 'move_in', 'Move In', 'Movement', 'Move material/product into a location.', false, 'Temperature (°C)', false, true, 1),
('act_move_out', 'move_out', 'Move Out', 'Movement', 'Move material/product out of a location to another. Requires From and To.', false, '', false, true, 2),
('act_put_in', 'put_in', 'Put In', 'Movement', 'Place item into a container, rack, or specific slot within a location.', false, 'Container type, slot ref', false, true, 3),
('act_remove_out', 'remove_out', 'Remove Out', 'Movement', 'Remove item from a container or slot.', false, '', false, true, 4),
('act_transfer', 'transfer', 'Transfer', 'Movement', 'Transfer between two distant locations (e.g. inter-warehouse). Useful for logistics and distribution.', false, 'Vehicle / carrier ref', false, true, 5),
('act_receive', 'receive', 'Receive', 'Movement', 'First action: import raw material from external supplier into company stock.', false, 'Supplier ref, delivery note', false, true, 6),
('act_cook', 'cook', 'Cook', 'Transform · Food', 'Apply heat treatment. Input material → output product or semi-finished product.', true, 'Temperature (°C), duration', false, true, 10),
('act_mix', 'mix_blend', 'Mix / Blend', 'Transform · Food', 'Combine multiple ingredients into one batch (dough, sauce, beverage).', true, 'Speed (RPM), duration', false, true, 11),
('act_cut', 'cut_slice', 'Cut / Slice / Portion', 'Transform · Food', 'Divide a bulk material into portions or pieces.', true, 'Portion weight (g)', false, true, 12),
('act_ferment', 'ferment_mature', 'Ferment / Mature', 'Transform · Food', 'Controlled fermentation or ageing process (cheese, wine, bread, charcuterie).', true, 'Target temp (°C), humidity (%)', false, true, 13),
('act_pasteurise', 'pasteurise_sterilise', 'Pasteurise / Sterilise', 'Transform · Food', 'Heat treatment for food safety compliance.', true, 'Temperature (°C), hold time (s)', false, true, 14),
('act_package', 'package_fill', 'Package / Fill', 'Transform · Food', 'Pack the finished or semi-finished product into its final packaging.', true, 'Pack size, packaging material', false, true, 15),
('act_dilute', 'dilute', 'Dilute', 'Transform · Chemical', 'Dilute a chemical concentrate with a solvent. Track concentration.', true, 'Dilution ratio, solvent type', false, true, 20),
('act_react', 'react_compound', 'React / Compound', 'Transform · Chemical', 'Chemical reaction combining two or more substances. Safety data required.', true, 'Reaction temp, pressure, catalyst', false, true, 21),
('act_filter', 'filter_centrifuge', 'Filter / Centrifuge', 'Transform · Chemical', 'Separate substances by filtration or centrifugation.', true, 'Filter size (µm), RPM', false, true, 22),
('act_assemble', 'assemble', 'Assemble', 'Transform · Mfg', 'Combine multiple parts into a new unit (electronics, automotive, machinery).', true, 'Assembly drawing ref', false, true, 30),
('act_disassemble', 'disassemble', 'Disassemble', 'Transform · Mfg', 'Break a unit into components for repair, reuse, or recycling.', true, '', false, true, 31),
('act_weld', 'weld_solder', 'Weld / Solder', 'Transform · Mfg', 'Permanent joining of components. Operator certification may be required.', true, 'Operator cert, temperature', false, true, 32),
('act_print_label', 'print_label', 'Print / Label', 'Transform · Mfg', 'Apply a label, barcode, or QR code to the product.', false, 'Label template ref', false, true, 33),
('act_inspect', 'inspect_check', 'Inspect / Check', 'Quality', 'Visual or physical inspection of material or product. Record result.', false, 'Result (pass/fail), notes', false, true, 40),
('act_test', 'test_analyse', 'Test / Analyse', 'Quality', 'Lab test or field analysis. Attach test report as document.', false, 'Test method, result value, unit', false, true, 41),
('act_weigh', 'weigh', 'Weigh', 'Quality', 'Record the measured weight of a material or product.', false, 'Weight (g/kg), tolerance', false, true, 42),
('act_reject', 'reject_quarantine', 'Reject / Quarantine', 'Quality', 'Flag item as non-conformant. Move to quarantine location. Requires reason.', false, 'Reason code', false, true, 43),
('act_wash', 'wash_clean', 'Wash / Clean', 'Handling', 'Clean the material or product. No change to item identity.', false, 'Cleaning product, temp', false, true, 50),
('act_rest', 'rest_wait', 'Rest / Wait', 'Handling', 'Hold item for a defined period (dough resting, part curing, paint drying).', false, 'Target duration', false, true, 51),
('act_freeze', 'freeze_thaw', 'Freeze / Thaw', 'Handling', 'Thermal state change. Captured with start/end timestamps.', false, 'Target temp (°C)', false, true, 52),
('act_dry', 'dry_dehydrate', 'Dry / Dehydrate', 'Handling', 'Remove moisture from a material or product.', false, 'Temp (°C), humidity (%)', false, true, 53),
('act_sterilise', 'sterilise_disinfect', 'Sterilise / Disinfect', 'Handling', 'Disinfection of tools, containers, or surfaces.', false, 'Method, agent, contact time', false, true, 54)
ON CONFLICT (id) DO NOTHING;
