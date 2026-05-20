import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import ActionWizard, { type ActionFormData } from "@/components/actions/ActionWizard";
import type { ActionCategory } from "@/types/action";
import { supabase } from "@/lib/supabase";

// ─── Action row shape (structurally matches tc_action_library row) ────────────

export interface ActionRow {
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

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  /** null = creating new action, non-null = editing */
  action: ActionRow | null;
  existingActions: ActionRow[];
  onClose: () => void;
  /** If provided, loads categories from tc_client_action_categories for this client */
  clientId?: string;
  /** Called with the DB-ready payload after wizard completes */
  onSave: (payload: {
    id?: string;
    name: string;
    action_key: string;
    category: ActionCategory;
    description: string;
    is_active: boolean;
    // attributes stored externally, not in tc_action_library
    attributes?: ActionFormData["attributes"];
  }) => Promise<void>;
}

// ─── Component ────────────────────────────────────────────────────────────────

const NewActionModal: React.FC<Props> = ({ action, existingActions, onClose, onSave, clientId }) => {
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<ActionCategory[]>([]);
  const isEditing = !!action && !action.is_system;

  useEffect(() => {
    const fetchCategories = async () => {
      if (clientId) {
        // Fetch client-specific categories
        const { data, error } = await supabase.functions.invoke(
          "supabase-functions-get-client-categories",
          { body: { client_id: clientId } }
        );
        if (!error && data?.data?.length > 0) {
          const names = (data.data as { name: string }[]).map((c) => c.name) as ActionCategory[];
          setCategories(names);
          return;
        }
      }
      // Fallback: fetch from global action library
      const { data, error } = await supabase
        .from("tc_action_library")
        .select("category")
        .neq("category", null)
        .eq("is_active", true);

      if (!error && data) {
        const unique = Array.from(new Set(data.map((r: { category: string }) => r.category)))
          .filter(Boolean) as ActionCategory[];
        if (unique.length > 0) setCategories(unique);
      }
    };
    fetchCategories();
  }, [clientId]);

  const existingShorts = existingActions
    .filter((a) => !action || a.id !== action.id)
    .map((a) => a.action_key);

  const handleSubmit = async (data: ActionFormData) => {
    setSubmitting(true);
    try {
      await onSave({
        ...(action?.id ? { id: action.id } : {}),
        name: data.name.trim(),
        action_key: data.short.trim().toLowerCase(),
        category: data.category,
        description: data.description.trim(),
        is_active: data.isActive,
        attributes: Object.keys(data.attributes).length > 0 ? data.attributes : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              {action?.is_system
                ? "View System Action"
                : isEditing
                ? "Edit Action"
                : "Create New Action"}
            </h3>
            {!action?.is_system && (
              <p className="text-xs text-gray-400 mt-0.5">
                {isEditing ? "Update action details." : "Follow the steps to define your action."}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* System action – read-only view */}
        {action?.is_system ? (
          <div className="px-6 py-5 space-y-4 overflow-y-auto max-h-[70vh]">
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
              <span className="mt-0.5">ℹ️</span>
              <span>This is a <strong>system action</strong> and cannot be edited. System actions are automatically managed by TraceChain.</span>
            </div>
            <dl className="space-y-3 text-sm">
              {[
                { label: "Name", value: action.name },
                { label: "Action Short", value: action.action_key },
                { label: "Category", value: action.category },
                { label: "Description", value: action.description || "—" },
              ].map((row) => (
                <div key={row.label}>
                  <dt className="text-xs font-semibold text-gray-500">{row.label}</dt>
                  <dd className="text-gray-800 mt-0.5">{row.value}</dd>
                </div>
              ))}
            </dl>
            <div className="flex justify-end pt-2 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Wizard */
          <ActionWizard
            initial={
              action
                ? {
                    name: action.name,
                    short: action.action_key,
                    category: action.category,
                    description: action.description,
                    isActive: action.is_active,
                    attributes: {},
                  }
                : undefined
            }
            existingShorts={existingShorts}
            categories={categories.length > 0 ? categories : undefined}
            isEditing={isEditing}
            onSubmit={handleSubmit}
            onCancel={onClose}
            submitting={submitting}
          />
        )}
      </div>
    </div>
  );
};

export default NewActionModal;
