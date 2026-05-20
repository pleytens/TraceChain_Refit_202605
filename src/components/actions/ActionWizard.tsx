import React, { useState, useEffect } from "react";
import { Check, ChevronRight, Users, Clock, MapPin, Sparkles } from "lucide-react";
import AttributeStep from "@/components/actions/AttributeStep";
import type { ActionCategory } from "@/types/action";
import type { ActionAttributes } from "@/types/attribute";

// ─── Wizard steps ────────────────────────────────────────────────────────────

export type WizardStep = 1 | 2 | 3 | 4;

export interface ActionFormData {
  name: string;
  short: string;
  category: ActionCategory;
  description: string;
  isActive: boolean;
  attributes: ActionAttributes;
}

interface Props {
  initial?: Partial<ActionFormData>;
  categories?: ActionCategory[];
  existingShorts: string[];       // For uniqueness check
  isEditing?: boolean;            // True = short field locked
  onSubmit: (data: ActionFormData) => Promise<void>;
  onCancel: () => void;
  submitting?: boolean;
}

const ALL_CATEGORIES: ActionCategory[] = [
  "Movement",
  "Transform · Food",
  "Transform · Chemical",
  "Transform · Mfg",
  "Quality",
  "Handling",
  "Control",
];

const STEP_LABELS = ["Basic Info", "Add Attributes?", "Select Attributes", "Review"];

// ─── Step indicator ──────────────────────────────────────────────────────────

const StepIndicator: React.FC<{ current: WizardStep; total: number }> = ({ current, total }) => (
  <div className="flex items-center gap-1 px-6 py-3 border-b border-gray-100 bg-gray-50">
    {STEP_LABELS.map((label, idx) => {
      const step = (idx + 1) as WizardStep;
      const done = step < current;
      const active = step === current;
      return (
        <React.Fragment key={step}>
          <div className="flex items-center gap-1.5">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                done
                  ? "bg-blue-600 text-white"
                  : active
                  ? "bg-blue-600 text-white ring-2 ring-blue-200"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              {done ? <Check size={11} /> : step}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${active ? "text-blue-700" : done ? "text-gray-500" : "text-gray-300"}`}>
              {label}
            </span>
          </div>
          {idx < total - 1 && (
            <div className={`flex-1 h-px mx-1 ${step < current ? "bg-blue-300" : "bg-gray-200"}`} />
          )}
        </React.Fragment>
      );
    })}
    <span className="ml-auto text-[11px] text-gray-400 shrink-0">Step {current} of {total}</span>
  </div>
);

// ─── Wizard ───────────────────────────────────────────────────────────────────

const ActionWizard: React.FC<Props> = ({
  initial,
  categories = [],
  existingShorts,
  isEditing = false,
  onSubmit,
  onCancel,
  submitting = false,
}) => {
  const [step, setStep] = useState<WizardStep>(1);
  const [wantsAttributes, setWantsAttributes] = useState<boolean | null>(
    initial?.attributes?.flags
      ? Object.values(initial.attributes.flags).some(Boolean)
        ? true
        : null
      : initial?.attributes && Object.keys(initial.attributes).length > 0
      ? true
      : null
  );

  const [form, setForm] = useState<ActionFormData>({
    name: initial?.name ?? "",
    short: initial?.short ?? "",
    category: initial?.category ?? "Movement",
    description: initial?.description ?? "",
    isActive: initial?.isActive ?? true,
    attributes: initial?.attributes ?? {},
  });

  const [step1Errors, setStep1Errors] = useState<{ name?: string; short?: string }>({});
  const [shortChecked, setShortChecked] = useState<"ok" | "taken" | "invalid" | null>(null);

  // Short format validation
  const validateShortFormat = (val: string) => /^[a-z][a-z0-9_]*$/.test(val);

  const checkShort = () => {
    if (!form.short.trim()) { setShortChecked(null); return; }
    if (!validateShortFormat(form.short)) { setShortChecked("invalid"); return; }
    const taken = existingShorts.includes(form.short.toLowerCase()) && !isEditing;
    setShortChecked(taken ? "taken" : "ok");
  };

  // ── Validation per step ───────────────────────────────────────────

  const validateStep1 = (): boolean => {
    const errs: { name?: string; short?: string } = {};
    if (!form.name.trim()) errs.name = "Action name is required.";
    if (!form.short.trim()) {
      errs.short = "Action Short is required.";
    } else if (!validateShortFormat(form.short)) {
      errs.short = "Must be lowercase with underscores only (e.g. cook, mix_blend).";
    } else if (!isEditing && existingShorts.includes(form.short)) {
      errs.short = "This Action Short is already taken.";
    }
    setStep1Errors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Navigation ────────────────────────────────────────────────────

  const goNext = () => {
    if (step === 1) {
      if (!validateStep1()) return;
      setStep(2);
    } else if (step === 2) {
      if (wantsAttributes === null) return; // must choose
      if (wantsAttributes === false) {
        setStep(4); // skip to review
      } else {
        setStep(3);
      }
    } else if (step === 3) {
      setStep(4);
    }
  };

  const goBack = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
    else if (step === 4) setStep(wantsAttributes ? 3 : 2);
  };

  const handleWantsAttributes = (val: boolean) => {
    setWantsAttributes(val);
    if (!val) {
      // Clear attributes
      setForm((f) => ({ ...f, attributes: {} }));
    }
  };

  const handleSubmit = async () => {
    await onSubmit(form);
  };

  // ── Summary helpers ───────────────────────────────────────────────

  const summaryItems = [
    { icon: "✅", label: "Action Name", value: form.name },
    { icon: "✅", label: "Action Short", value: form.short },
    { icon: "✅", label: "Category", value: form.category },
    form.description ? { icon: "✅", label: "Description", value: form.description } : null,
  ].filter(Boolean) as { icon: string; label: string; value: string }[];

  return (
    <div className="flex flex-col max-h-[85vh]">
      <StepIndicator current={step} total={4} />

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {/* ── STEP 1: Basic Information ──────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-0.5">Basic Information</h4>
              <p className="text-xs text-gray-500">Fill in the core details for this action.</p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Action Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={60}
                value={form.name}
                onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setStep1Errors((e) => ({ ...e, name: undefined })); }}
                placeholder="e.g. Cook, Mix, Transfer…"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${step1Errors.name ? "border-red-400" : "border-gray-300"}`}
              />
              {step1Errors.name && <p className="text-xs text-red-500 mt-1">{step1Errors.name}</p>}
            </div>

            {/* Action Short */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Action Short <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled={isEditing}
                  maxLength={40}
                  value={form.short}
                  onChange={(e) => {
                    const val = e.target.value.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
                    setForm((f) => ({ ...f, short: val }));
                    setStep1Errors((e) => ({ ...e, short: undefined }));
                    setShortChecked(null);
                  }}
                  onBlur={checkShort}
                  placeholder="e.g. cook, mix_blend, transfer"
                  className={`w-full border rounded-lg px-3 py-2 pr-10 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400 ${step1Errors.short ? "border-red-400" : shortChecked === "ok" ? "border-green-400" : "border-gray-300"}`}
                />
                {shortChecked === "ok" && <Check size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Unique identifier. Lowercase with underscores.{isEditing ? " Cannot be changed after creation." : ""}
              </p>
              {step1Errors.short && <p className="text-xs text-red-500">{step1Errors.short}</p>}
              {shortChecked === "taken" && <p className="text-xs text-red-500">This Action Short is already taken.</p>}
              {shortChecked === "invalid" && <p className="text-xs text-red-500">Must be lowercase letters and underscores only.</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ActionCategory }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {(categories.length > 0 ? categories : ALL_CATEGORIES).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">Select from categories provided by Traceverified.</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                placeholder="Describe what this action does…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-700">Active</p>
                <p className="text-xs text-gray-400">Inactive actions are hidden from the process wizard.</p>
              </div>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${form.isActive ? "bg-blue-600" : "bg-gray-300"}`}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${form.isActive ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Add Attributes? ────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="text-center pb-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-50 mb-3">
                <Sparkles size={26} className="text-blue-500" />
              </div>
              <h4 className="text-sm font-bold text-gray-900 mb-1">Add Attributes?</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Attributes help track <strong>who</strong> performed the action, <strong>when</strong> it happened, and <strong>where</strong> it took place.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleWantsAttributes(true)}
                className={`p-4 rounded-xl border-2 text-left transition ${wantsAttributes === true ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-blue-300 bg-white"}`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  {[Users, Clock, MapPin].map((Icon, i) => (
                    <Icon key={i} size={13} className={wantsAttributes === true ? "text-blue-500" : "text-gray-400"} />
                  ))}
                </div>
                <p className="text-sm font-semibold text-gray-800">Yes, add attributes</p>
                <p className="text-xs text-gray-500 mt-0.5">Track who, when, and where.</p>
              </button>

              <button
                type="button"
                onClick={() => handleWantsAttributes(false)}
                className={`p-4 rounded-xl border-2 text-left transition ${wantsAttributes === false ? "border-gray-600 bg-gray-50" : "border-gray-200 hover:border-gray-400 bg-white"}`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Check size={13} className={wantsAttributes === false ? "text-gray-500" : "text-gray-300"} />
                </div>
                <p className="text-sm font-semibold text-gray-800">No, just save</p>
                <p className="text-xs text-gray-500 mt-0.5">Skip to confirmation.</p>
              </button>
            </div>

            {wantsAttributes === null && (
              <p className="text-xs text-red-500 text-center">Please choose an option to continue.</p>
            )}
          </div>
        )}

        {/* ── STEP 3: Select Attributes ─────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-0.5">Select Attributes</h4>
              <p className="text-xs text-gray-500">Choose which data categories will be collected during Recording.</p>
            </div>
            <AttributeStep
              attributes={form.attributes}
              onChange={(attrs) => setForm((f) => ({ ...f, attributes: attrs }))}
            />
          </div>
        )}

        {/* ── STEP 4: Review ────────────────────────────────────────────── */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-0.5">Review & Confirm</h4>
              <p className="text-xs text-gray-500">Check the details before {isEditing ? "saving" : "creating"} the action.</p>
            </div>

            {/* Basic info summary */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 divide-y divide-gray-100">
              {summaryItems.map((item) => (
                <div key={item.label} className="flex items-start gap-3 px-4 py-3">
                  <span className="text-base leading-none mt-0.5">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
                    <p className="text-sm font-medium text-gray-900 break-words">{item.value}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="text-base">✅</span>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Status</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${form.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {form.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            {/* Attributes summary */}
            {wantsAttributes && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <span className="text-base">📌</span> Required Attributes
                </p>
                <div className="bg-gray-50 rounded-xl border border-gray-200 divide-y divide-gray-100">
                  {(
                    [
                      { key: "who",   icon: <Users size={13} />,  label: "Who",   desc: "Workers / operators" },
                      { key: "when",  icon: <Clock size={13} />,  label: "When",  desc: "Timestamps" },
                      { key: "what",  icon: <span className="text-xs font-bold">W</span>, label: "What", desc: "Materials / products" },
                      { key: "where", icon: <MapPin size={13} />, label: "Where", desc: "Location" },
                    ] as const
                  ).map(({ key, icon, label, desc }) => {
                    const enabled = form.attributes.flags?.[key] ?? false;
                    return (
                      <div key={key} className="flex items-center gap-3 px-4 py-2.5">
                        <span className={`shrink-0 ${enabled ? "text-blue-500" : "text-gray-300"}`}>{icon}</span>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-700">{label}</p>
                          <p className="text-xs text-gray-400">{desc}</p>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            enabled
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {enabled ? "Required" : "Not used"}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Actual details will be collected during Recording.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Footer buttons ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
        <button
          type="button"
          onClick={step === 1 ? onCancel : goBack}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
        >
          {step === 1 ? "Cancel" : "← Back"}
        </button>

        <div className="flex items-center gap-3">
          {step < 4 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={step === 2 && wantsAttributes === null}
              className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next <ChevronRight size={15} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {submitting ? "Saving…" : isEditing ? "Save Changes" : "Create Action"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActionWizard;
