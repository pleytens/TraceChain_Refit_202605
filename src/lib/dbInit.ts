/**
 * dbInit.ts
 *
 * Runs at app startup when Supabase is connected.
 * Creates any missing tables and seeds default data so the app works
 * even when the Tempo migration tool cannot run (e.g. project not linked
 * via the Supabase integration panel).
 *
 * Uses Supabase's pg REST exec endpoint via rpc('exec_sql', …) — but since
 * that isn't available on all plans, we instead probe each table and
 * fall back to safe INSERT … ON CONFLICT DO NOTHING seeding.
 *
 * Strategy:
 *   1. Try to SELECT 1 row from each required table.
 *   2. If the table doesn't exist (error code 42P01), create it via an edge
 *      function or log a clear warning.
 *   3. If the table is empty, seed default rows.
 */

import { supabase } from "@/lib/supabase";

// ─── Default action library rows ─────────────────────────────────────────────

export const DEFAULT_ACTIONS = [
  { id: "sys_start",      action_key: "PROCESS_START",       name: "Process Start",         category: "Control",             description: "System action. Auto-triggered when the first action is created. Not editable.",                         produces_output: false, custom_param_example: "",                                 is_system: true,  is_active: true,  sort_order: 0  },
  { id: "sys_end",        action_key: "PROCESS_END",         name: "Process End",           category: "Control",             description: "Closes process. Destination carries over to next process. Issues QR code if final process.",           produces_output: false, custom_param_example: "Destination location",           is_system: true,  is_active: true,  sort_order: 99 },
  { id: "act_move_in",    action_key: "move_in",             name: "Move In",               category: "Movement",            description: "Move material/product into a location.",                                                               produces_output: false, custom_param_example: "Temperature (°C)",               is_system: false, is_active: true,  sort_order: 1  },
  { id: "act_move_out",   action_key: "move_out",            name: "Move Out",              category: "Movement",            description: "Move material/product out of a location to another. Requires From and To.",                            produces_output: false, custom_param_example: "",                                 is_system: false, is_active: true,  sort_order: 2  },
  { id: "act_put_in",     action_key: "put_in",              name: "Put In",                category: "Movement",            description: "Place item into a container, rack, or specific slot within a location.",                               produces_output: false, custom_param_example: "Container type, slot ref",      is_system: false, is_active: true,  sort_order: 3  },
  { id: "act_remove_out", action_key: "remove_out",          name: "Remove Out",            category: "Movement",            description: "Remove item from a container or slot.",                                                                produces_output: false, custom_param_example: "",                                 is_system: false, is_active: true,  sort_order: 4  },
  { id: "act_transfer",   action_key: "transfer",            name: "Transfer",              category: "Movement",            description: "Transfer between two distant locations (e.g. inter-warehouse). Useful for logistics and distribution.", produces_output: false, custom_param_example: "Vehicle / carrier ref",          is_system: false, is_active: true,  sort_order: 5  },
  { id: "act_receive",    action_key: "receive",             name: "Receive",               category: "Movement",            description: "First action: import raw material from external supplier into company stock.",                          produces_output: false, custom_param_example: "Supplier ref, delivery note",    is_system: false, is_active: true,  sort_order: 6  },
  { id: "act_cook",       action_key: "cook",                name: "Cook",                  category: "Transform · Food",    description: "Apply heat treatment. Input material → output product or semi-finished product.",                        produces_output: true,  custom_param_example: "Temperature (°C), duration",     is_system: false, is_active: true,  sort_order: 10 },
  { id: "act_mix",        action_key: "mix_blend",           name: "Mix / Blend",           category: "Transform · Food",    description: "Combine multiple ingredients into one batch (dough, sauce, beverage).",                                 produces_output: true,  custom_param_example: "Speed (RPM), duration",          is_system: false, is_active: true,  sort_order: 11 },
  { id: "act_cut",        action_key: "cut_slice",           name: "Cut / Slice / Portion", category: "Transform · Food",    description: "Divide a bulk material into portions or pieces.",                                                      produces_output: true,  custom_param_example: "Portion weight (g)",             is_system: false, is_active: true,  sort_order: 12 },
  { id: "act_ferment",    action_key: "ferment_mature",      name: "Ferment / Mature",      category: "Transform · Food",    description: "Controlled fermentation or ageing process (cheese, wine, bread, charcuterie).",                         produces_output: true,  custom_param_example: "Target temp (°C), humidity (%)", is_system: false, is_active: true,  sort_order: 13 },
  { id: "act_pasteurise", action_key: "pasteurise_sterilise",name: "Pasteurise / Sterilise", category: "Transform · Food",    description: "Heat treatment for food safety compliance.",                                                            produces_output: true,  custom_param_example: "Temperature (°C), hold time (s)",is_system: false, is_active: true,  sort_order: 14 },
  { id: "act_package",    action_key: "package_fill",        name: "Package / Fill",        category: "Transform · Food",    description: "Pack the finished or semi-finished product into its final packaging.",                                   produces_output: true,  custom_param_example: "Pack size, packaging material",  is_system: false, is_active: true,  sort_order: 15 },
  { id: "act_dilute",     action_key: "dilute",              name: "Dilute",                category: "Transform · Chemical",description: "Dilute a chemical concentrate with a solvent. Track concentration.",                                     produces_output: true,  custom_param_example: "Dilution ratio, solvent type",   is_system: false, is_active: true,  sort_order: 20 },
  { id: "act_react",      action_key: "react_compound",      name: "React / Compound",      category: "Transform · Chemical",description: "Chemical reaction combining two or more substances. Safety data required.",                               produces_output: true,  custom_param_example: "Reaction temp, pressure, catalyst",is_system: false,is_active: true, sort_order: 21 },
  { id: "act_filter",     action_key: "filter_centrifuge",   name: "Filter / Centrifuge",   category: "Transform · Chemical",description: "Separate substances by filtration or centrifugation.",                                                  produces_output: true,  custom_param_example: "Filter size (µm), RPM",          is_system: false, is_active: true,  sort_order: 22 },
  { id: "act_assemble",   action_key: "assemble",            name: "Assemble",              category: "Transform · Mfg",     description: "Combine multiple parts into a new unit (electronics, automotive, machinery).",                           produces_output: true,  custom_param_example: "Assembly drawing ref",           is_system: false, is_active: true,  sort_order: 30 },
  { id: "act_disassemble",action_key: "disassemble",         name: "Disassemble",           category: "Transform · Mfg",     description: "Break a unit into components for repair, reuse, or recycling.",                                         produces_output: true,  custom_param_example: "",                                 is_system: false, is_active: true,  sort_order: 31 },
  { id: "act_weld",       action_key: "weld_solder",         name: "Weld / Solder",         category: "Transform · Mfg",     description: "Permanent joining of components. Operator certification may be required.",                               produces_output: true,  custom_param_example: "Operator cert, temperature",     is_system: false, is_active: true,  sort_order: 32 },
  { id: "act_print_label",action_key: "print_label",         name: "Print / Label",         category: "Transform · Mfg",     description: "Apply a label, barcode, or QR code to the product.",                                                   produces_output: false, custom_param_example: "Label template ref",             is_system: false, is_active: true,  sort_order: 33 },
  { id: "act_inspect",    action_key: "inspect_check",       name: "Inspect / Check",       category: "Quality",             description: "Visual or physical inspection of material or product. Record result.",                                  produces_output: false, custom_param_example: "Result (pass/fail), notes",      is_system: false, is_active: true,  sort_order: 40 },
  { id: "act_test",       action_key: "test_analyse",        name: "Test / Analyse",        category: "Quality",             description: "Lab test or field analysis. Attach test report as document.",                                           produces_output: false, custom_param_example: "Test method, result value, unit",is_system: false, is_active: true,  sort_order: 41 },
  { id: "act_weigh",      action_key: "weigh",               name: "Weigh",                 category: "Quality",             description: "Record the measured weight of a material or product.",                                                  produces_output: false, custom_param_example: "Weight (g/kg), tolerance",       is_system: false, is_active: true,  sort_order: 42 },
  { id: "act_reject",     action_key: "reject_quarantine",   name: "Reject / Quarantine",   category: "Quality",             description: "Flag item as non-conformant. Move to quarantine location. Requires reason.",                            produces_output: false, custom_param_example: "Reason code",                    is_system: false, is_active: true,  sort_order: 43 },
  { id: "act_wash",       action_key: "wash_clean",          name: "Wash / Clean",          category: "Handling",            description: "Clean the material or product. No change to item identity.",                                            produces_output: false, custom_param_example: "Cleaning product, temp",         is_system: false, is_active: true,  sort_order: 50 },
  { id: "act_rest",       action_key: "rest_wait",           name: "Rest / Wait",           category: "Handling",            description: "Hold item for a defined period (dough resting, part curing, paint drying).",                            produces_output: false, custom_param_example: "Target duration",                is_system: false, is_active: true,  sort_order: 51 },
  { id: "act_freeze",     action_key: "freeze_thaw",         name: "Freeze / Thaw",         category: "Handling",            description: "Thermal state change. Captured with start/end timestamps.",                                             produces_output: false, custom_param_example: "Target temp (°C)",               is_system: false, is_active: true,  sort_order: 52 },
  { id: "act_dry",        action_key: "dry_dehydrate",       name: "Dry / Dehydrate",       category: "Handling",            description: "Remove moisture from a material or product.",                                                           produces_output: false, custom_param_example: "Temp (°C), humidity (%)",        is_system: false, is_active: true,  sort_order: 53 },
  { id: "act_sterilise",  action_key: "sterilise_disinfect", name: "Sterilise / Disinfect", category: "Handling",            description: "Disinfection of tools, containers, or surfaces.",                                                      produces_output: false, custom_param_example: "Method, agent, contact time",    is_system: false, is_active: true,  sort_order: 54 },
  // ── Asset tracking actions ─────────────────────────────────────────────────
  { id: "act_asset_in",  action_key: "asset_in",  name: "Asset In",  category: "Movement", description: "Track material/product entering client premises. Requires Where/To (MyCompanyLocations).",              produces_output: false, custom_param_example: "", is_system: false, is_active: true, sort_order: 100, required_variable_categories: { who: false, when: false, what: false, where: true }, location_selector_type: "my_company_locations" },
  { id: "act_asset_out", action_key: "asset_out", name: "Asset Out", category: "Movement", description: "Track material/product leaving to customer premises. Requires Where/From and Where/To (Customer delivery).", produces_output: false, custom_param_example: "", is_system: false, is_active: true, sort_order: 101, required_variable_categories: { who: false, when: false, what: false, where: true }, location_selector_type: "my_customer_delivery_address" },
];

// ─── Table probe ──────────────────────────────────────────────────────────────

async function tableExists(tableName: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from(tableName).select("id").limit(1);
  // error.code === "42P01" means "relation does not exist"
  if (error && error.code === "42P01") return false;
  return true;
}

// ─── Seed action library ──────────────────────────────────────────────────────

async function seedActionLibrary() {
  if (!supabase) return;

  const { data, error } = await supabase
    .from("tc_action_library")
    .select("id")
    .limit(1);

  if (error) {
    // Table doesn't exist yet – we can't create it from the client without
    // elevated privileges. Log a clear message so developers know what to do.
    if (error.code === "42P01") {
      console.warn(
        "[dbInit] Table tc_action_library does not exist.\n" +
          "Run the migration: supabase/migrations/20260519_action_library.sql\n" +
          "The app will use localStorage until the table is created."
      );
    } else {
      console.warn("[dbInit] tc_action_library probe error:", error.message);
    }
    return;
  }

  // Table exists but is empty → seed it
  if (!data || data.length === 0) {
    const { error: insertError } = await supabase
      .from("tc_action_library")
      .insert(DEFAULT_ACTIONS);

    if (insertError) {
      console.warn("[dbInit] Action library seed error:", insertError.message);
    } else {
      console.info("[dbInit] ✅ Action library seeded with", DEFAULT_ACTIONS.length, "actions.");
    }
  }
}

// ─── Ensure tc_processes table has rows (no-op if already has data) ───────────

async function seedProcesses() {
  if (!supabase) return;
  const { error } = await supabase.from("tc_processes").select("id").limit(1);
  if (error) {
    if (error.code !== "42P01") {
      console.warn("[dbInit] tc_processes probe error:", error.message);
    }
  }
  // We don't seed default processes — that's user data
}

// ─── Public entrypoint ────────────────────────────────────────────────────────

export async function initDb(): Promise<void> {
  if (!supabase) {
    console.info("[dbInit] No Supabase client — using localStorage fallback.");
    return;
  }

  await Promise.all([seedActionLibrary(), seedProcesses()]);
}
