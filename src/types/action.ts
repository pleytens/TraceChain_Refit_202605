// Action type – updated per TraceChain_Process_Action_Brief_v3.1
// Removed: customParamExample, producesOutput (moved to Process feature)

export type ActionCategory =
  | "Movement"
  | "Transform · Food"
  | "Transform · Chemical"
  | "Transform · Mfg"
  | "Quality"
  | "Handling"
  | "Control";

export interface Action {
  id?: string;
  name: string;
  short: string;       // Previously "action_key" — unique identifier, lowercase with underscores
  category: ActionCategory;
  description: string;
  isActive: boolean;
  isSystem?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

// DB row shape from tc_action_library
export interface ActionLibraryRow {
  id: string;
  action_key: string;
  name: string;
  category: ActionCategory;
  description: string;
  produces_output: boolean;
  custom_param_example: string;
  is_system: boolean;
  is_active: boolean;
  sort_order: number;
}

// Map DB row → frontend Action
export function rowToAction(r: ActionLibraryRow): Action {
  return {
    id: r.id,
    name: r.name,
    short: r.action_key,
    category: r.category,
    description: r.description,
    isActive: r.is_active,
    isSystem: r.is_system,
    sortOrder: r.sort_order,
  };
}
