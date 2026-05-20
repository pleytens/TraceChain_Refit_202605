import React, { useState, useEffect } from "react";
import {
  X, ChevronRight, ChevronLeft, Check, Package, Users, Clock, MapPin,
  Search, CheckCircle2, List
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import PeopleSelector from "@/components/people/PeopleSelector";
import LocationSelector from "@/components/locations/LocationSelector";
import MaterialSelector from "@/components/recordings/MaterialSelector";
import type { LocationType, WhereLocations, WorkerOption } from "@/types/attribute";
import type { RecordingMaterial, RecordingActionData, RecordingData } from "@/types/recording";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ProcessStep {
  id: string;
  name: string;
  is_system: boolean;
  action_key: string;
}

interface ProcessOption {
  id: string;
  name: string;
  description: string;
  status: string;
  actionSteps: ProcessStep[];
  variableDetails: Record<string, { what: boolean; who: boolean; when: boolean; where: boolean }>;
}

interface ActionState {
  actionId: string;
  actionName: string;
  stepOrder: number;
  hasWhat: boolean;
  hasWho: boolean;
  hasWhen: boolean;
  hasWhere: boolean;
  what: RecordingMaterial[];
  who: { ids: string[]; workers: WorkerOption[] };
  when: { startDateTime: string; endDateTime: string };
  whereTypes: LocationType[];
  whereLocations: WhereLocations;
}

type WizardStep = "select-process" | "configure" | "review";

interface Props {
  onClose: () => void;
  onRecordCreated: () => void;
  currentUserId: string;
  currentUserName: string;
}

// ─── Fallback processes (when DB unavailable) ──────────────────────────────────

const FALLBACK_PROCESSES: ProcessOption[] = [
  {
    id: "p1",
    name: "Import in Stock",
    description: "Record materials coming into stock",
    status: "ACTIVE",
    actionSteps: [
      { id: "s1", name: "Process Start", is_system: true, action_key: "PROCESS_START" },
      { id: "s2", name: "Move In", is_system: false, action_key: "move_in" },
      { id: "s3", name: "Process End", is_system: true, action_key: "PROCESS_END" },
    ],
    variableDetails: {
      s2: { what: true, who: true, when: true, where: true },
    },
  },
];

function nowISO() {
  return new Date().toISOString().slice(0, 16);
}

function formatRecordDate(iso: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${y}${mo}${da}-${h}:${m}`;
}

// ─── Step indicator ────────────────────────────────────────────────────────────

const STEPS: { key: WizardStep; label: string }[] = [
  { key: "select-process", label: "Select Process" },
  { key: "configure", label: "Configure Attributes" },
  { key: "review", label: "Review & Confirm" },
];

const StepBar: React.FC<{ current: WizardStep }> = ({ current }) => {
  const idx = STEPS.findIndex((s) => s.key === current);
  return (
    <div className="flex items-center gap-1 px-6 py-3 border-b border-gray-100 bg-gray-50">
      {STEPS.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <React.Fragment key={s.key}>
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
                {done ? <Check size={11} /> : i + 1}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  active ? "text-blue-700" : done ? "text-gray-500" : "text-gray-300"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-px mx-1 ${i < idx ? "bg-blue-300" : "bg-gray-200"}`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── Main wizard ───────────────────────────────────────────────────────────────

const AddRecordWizard: React.FC<Props> = ({
  onClose,
  onRecordCreated,
  currentUserId,
  currentUserName,
}) => {
  const [wizardStep, setWizardStep] = useState<WizardStep>("select-process");
  const [processes, setProcesses] = useState<ProcessOption[]>([]);
  const [loadingProcs, setLoadingProcs] = useState(false);
  const [selectedProcessId, setSelectedProcessId] = useState<string>("");
  const [searchProc, setSearchProc] = useState("");
  const [actionStates, setActionStates] = useState<ActionState[]>([]);
  const [currentActionIdx, setCurrentActionIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Load processes from DB or fallback
  useEffect(() => {
    if (!supabase) {
      setProcesses(FALLBACK_PROCESSES);
      return;
    }
    setLoadingProcs(true);
    Promise.all([
      supabase
        .from("tc_processes")
        .select("id, name, description, status")
        .eq("status", "ACTIVE")
        .order("name"),
      supabase
        .from("tc_process_action_steps")
        .select(
          "id, process_id, step_order, notes, variable_details, tc_action_library(id, action_key, name, is_system)"
        )
        .order("step_order"),
    ]).then(([pRes, sRes]) => {
      setLoadingProcs(false);
      if (pRes.error || !pRes.data) {
        setProcesses(FALLBACK_PROCESSES);
        return;
      }
      const stepsData: any[] = sRes.data || [];
      const procs: ProcessOption[] = pRes.data.map((p: any) => {
        const steps = stepsData.filter((s) => s.process_id === p.id);
        const variableDetails: Record<string, { what: boolean; who: boolean; when: boolean; where: boolean }> = {};
        steps.forEach((s: any) => {
          if (s.variable_details && typeof s.variable_details === "object") {
            variableDetails[s.id] = s.variable_details;
          }
        });
        return {
          id: p.id,
          name: p.name,
          description: p.description,
          status: p.status,
          actionSteps: steps.map((s: any) => ({
            id: s.id,
            name: s.tc_action_library?.name ?? "Unknown",
            is_system: s.tc_action_library?.is_system ?? false,
            action_key: s.tc_action_library?.action_key ?? "",
          })),
          variableDetails,
        };
      });
      setProcesses(procs.length > 0 ? procs : FALLBACK_PROCESSES);
    });
  }, []);

  const selectedProcess = processes.find((p) => p.id === selectedProcessId) ?? null;

  // Build action states for the selected process
  const initActionStates = (proc: ProcessOption) => {
    const userSteps = proc.actionSteps.filter((s) => !s.is_system);
    const states: ActionState[] = userSteps.map((step, i) => {
      const vd = proc.variableDetails[step.id] ?? { what: false, who: false, when: false, where: false };
      return {
        actionId: step.id,
        actionName: step.name,
        stepOrder: i + 1,
        hasWhat: vd.what,
        hasWho: vd.who,
        hasWhen: vd.when,
        hasWhere: vd.where,
        what: [],
        who: { ids: [], workers: [] },
        when: { startDateTime: nowISO(), endDateTime: nowISO() },
        whereTypes: [],
        whereLocations: {},
      };
    });
    setActionStates(states);
    setCurrentActionIdx(0);
  };

  const handleProcessNext = () => {
    if (!selectedProcessId) { setError("Please select a process."); return; }
    const proc = processes.find((p) => p.id === selectedProcessId)!;
    initActionStates(proc);
    setError("");
    setWizardStep("configure");
  };

  const currentAction = actionStates[currentActionIdx] ?? null;

  const updateCurrentAction = (updates: Partial<ActionState>) => {
    setActionStates((prev) =>
      prev.map((a, i) => (i === currentActionIdx ? { ...a, ...updates } : a))
    );
  };

  const handleActionNext = () => {
    if (currentActionIdx < actionStates.length - 1) {
      setCurrentActionIdx((i) => i + 1);
    } else {
      setWizardStep("review");
    }
  };

  const handleActionBack = () => {
    if (currentActionIdx > 0) {
      setCurrentActionIdx((i) => i - 1);
    } else {
      setWizardStep("select-process");
    }
  };

  const handleConfirm = async () => {
    if (!selectedProcess) return;
    setSubmitting(true);
    setError("");
    try {
      const now = new Date().toISOString();
      const recordedAt = now;
      const recordName = `${selectedProcess.name} · ${formatRecordDate(now)}`;

      const data: RecordingData = {
        processId: selectedProcess.id,
        processName: selectedProcess.name,
        actions: actionStates.map((a) => ({
          actionId: a.actionId,
          actionName: a.actionName,
          stepOrder: a.stepOrder,
          what: a.hasWhat ? a.what : undefined,
          who: a.hasWho ? a.who.workers.map((w) => ({ id: w.id, name: w.name, email: w.email })) : undefined,
          when: a.hasWhen ? a.when : undefined,
          whereTypes: a.hasWhere ? a.whereTypes : undefined,
          whereLocations: a.hasWhere ? a.whereLocations : undefined,
        })),
      };

      if (supabase) {
        const { error: dbErr } = await supabase.from("tc_recordings").insert({
          record_name: recordName,
          process_id: selectedProcess.id,
          recorded_by: currentUserId,
          recorded_at: recordedAt,
          user_name: currentUserName,
          status: "Created",
          data,
        });
        if (dbErr) throw new Error(dbErr.message);
      } else {
        // LocalStorage fallback
        const ls = JSON.parse(localStorage.getItem("tc_recordings") ?? "[]");
        ls.unshift({
          id: `rec-${Date.now()}`,
          record_name: recordName,
          process_id: selectedProcess.id,
          recorded_by: currentUserId,
          recorded_at: recordedAt,
          user_name: currentUserName,
          status: "Created",
          data,
        });
        localStorage.setItem("tc_recordings", JSON.stringify(ls));
      }

      onRecordCreated();
    } catch (e: any) {
      setError(e.message ?? "Failed to create record.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProcs = processes.filter(
    (p) =>
      p.name.toLowerCase().includes(searchProc.toLowerCase()) ||
      p.description.toLowerCase().includes(searchProc.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Add New Record</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition p-1 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        {/* Step bar */}
        <StepBar current={wizardStep} />

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* ── Step 1: Select process ── */}
          {wizardStep === "select-process" && (
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Select Process to Record</h3>
                <p className="text-xs text-gray-400">Choose the process you want to record for this activity.</p>
              </div>
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search processes…"
                  value={searchProc}
                  onChange={(e) => setSearchProc(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {loadingProcs ? (
                <div className="py-8 text-center text-sm text-gray-400">Loading processes…</div>
              ) : filteredProcs.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">No active processes found.</div>
              ) : (
                <div className="space-y-2">
                  {filteredProcs.map((p) => {
                    const isSelected = selectedProcessId === p.id;
                    const userSteps = p.actionSteps.filter((s) => !s.is_system);
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedProcessId(p.id)}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                            isSelected ? "border-blue-600 bg-blue-600" : "border-gray-300"
                          }`}
                        >
                          {isSelected && <Check size={10} className="text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                          {p.description && (
                            <p className="text-xs text-gray-400 mt-0.5 truncate">{p.description}</p>
                          )}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {p.actionSteps.map((s) => (
                              <span
                                key={s.id}
                                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                  s.is_system
                                    ? "bg-gray-100 text-gray-500"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {s.name}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 shrink-0">
                          {userSteps.length} action{userSteps.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
          )}

          {/* ── Step 2: Configure attributes ── */}
          {wizardStep === "configure" && currentAction && (
            <div className="p-6">
              <div className="flex gap-6">
                {/* Main form */}
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <span className="text-xs font-bold uppercase tracking-wide text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      Action {currentActionIdx + 1} of {actionStates.length}
                    </span>
                    <h3 className="text-sm font-bold text-gray-800">{currentAction.actionName}</h3>
                  </div>

                  {!currentAction.hasWhat && !currentAction.hasWho && !currentAction.hasWhen && !currentAction.hasWhere && (
                    <div className="text-center py-8 text-sm text-gray-400">
                      <CheckCircle2 size={32} className="mx-auto text-gray-300 mb-2" />
                      <p>No attributes required for this action.</p>
                    </div>
                  )}

                  {/* WHAT */}
                  {currentAction.hasWhat && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-orange-500" />
                        <h4 className="text-sm font-bold text-gray-800">WHAT · Material(s)</h4>
                      </div>
                      <p className="text-xs text-gray-400">Select materials and specify the quantity for each.</p>
                      <MaterialSelector
                        selected={currentAction.what}
                        onChange={(mats) => updateCurrentAction({ what: mats })}
                      />
                    </div>
                  )}

                  {/* WHO */}
                  {currentAction.hasWho && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-blue-500" />
                        <h4 className="text-sm font-bold text-gray-800">WHO · Worker(s)</h4>
                      </div>
                      <p className="text-xs text-gray-400">Select the workers involved in this action.</p>
                      <PeopleSelector
                        selectedIds={currentAction.who.ids}
                        onChange={(ids, workers) => updateCurrentAction({ who: { ids, workers } })}
                      />
                    </div>
                  )}

                  {/* WHEN */}
                  {currentAction.hasWhen && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-green-500" />
                        <h4 className="text-sm font-bold text-gray-800">WHEN · Date / Time</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Start</label>
                          <input
                            type="datetime-local"
                            value={currentAction.when.startDateTime}
                            onChange={(e) =>
                              updateCurrentAction({ when: { ...currentAction.when, startDateTime: e.target.value } })
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">End</label>
                          <input
                            type="datetime-local"
                            value={currentAction.when.endDateTime}
                            onChange={(e) =>
                              updateCurrentAction({ when: { ...currentAction.when, endDateTime: e.target.value } })
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* WHERE */}
                  {currentAction.hasWhere && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-purple-500" />
                        <h4 className="text-sm font-bold text-gray-800">WHERE · Location</h4>
                      </div>
                      <LocationSelector
                        mode="multi"
                        selectedTypes={currentAction.whereTypes}
                        onTypesChange={(types) => updateCurrentAction({ whereTypes: types })}
                        locations={currentAction.whereLocations}
                        onLocationChange={(type, attr) =>
                          updateCurrentAction({
                            whereLocations: { ...currentAction.whereLocations, [type]: attr ?? undefined },
                          })
                        }
                      />
                    </div>
                  )}
                </div>

                {/* Side: process steps */}
                <div className="w-52 shrink-0">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Process Steps</p>
                  <div className="space-y-1">
                    {selectedProcess?.actionSteps.map((s, i) => {
                      const isUserStep = !s.is_system;
                      const userIdx = selectedProcess.actionSteps
                        .filter((x) => !x.is_system)
                        .findIndex((x) => x.id === s.id);
                      const isCurrentAction = isUserStep && userIdx === currentActionIdx;
                      const isDoneAction = isUserStep && userIdx < currentActionIdx;
                      return (
                        <div
                          key={s.id}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition ${
                            isCurrentAction
                              ? "bg-blue-50 text-blue-700 font-semibold"
                              : isDoneAction
                              ? "text-green-600"
                              : s.is_system
                              ? "text-gray-400"
                              : "text-gray-500"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold ${
                              isCurrentAction
                                ? "bg-blue-600 text-white"
                                : isDoneAction
                                ? "bg-green-500 text-white"
                                : s.is_system
                                ? "bg-gray-200 text-gray-400"
                                : "bg-gray-200 text-gray-500"
                            }`}
                          >
                            {isDoneAction ? "✓" : i + 1}
                          </div>
                          <span className="truncate">{s.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Review ── */}
          {wizardStep === "review" && selectedProcess && (
            <div className="p-6 space-y-5">
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Review Your Record</h3>
                <p className="text-xs text-gray-400">Please confirm the details before creating the record.</p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <List size={14} className="text-blue-500" />
                  <p className="text-sm font-bold text-gray-800">{selectedProcess.name}</p>
                </div>
                {selectedProcess.description && (
                  <p className="text-xs text-gray-500 ml-6">{selectedProcess.description}</p>
                )}
              </div>

              {actionStates.map((a, i) => (
                <div key={a.actionId} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-blue-50 px-4 py-3 flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                      Action {i + 1}
                    </span>
                    <span className="text-sm font-semibold text-gray-800">{a.actionName}</span>
                  </div>
                  <div className="p-4 space-y-3 text-xs text-gray-700">
                    {a.hasWhat && (
                      <div>
                        <p className="font-semibold text-gray-500 uppercase tracking-wide mb-1">📦 What</p>
                        {a.what.length === 0 ? (
                          <p className="text-gray-400 italic">No materials selected</p>
                        ) : (
                          <div className="space-y-1">
                            {a.what.map((m) => (
                              <div key={m.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-1.5">
                                <span className="font-medium">{m.name}</span>
                                <span className="text-gray-500">
                                  {m.quantity ?? "—"} {m.importUnitItem || ""}
                                  {m.batchNumber ? ` · #${m.batchNumber}` : ""}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {a.hasWho && (
                      <div>
                        <p className="font-semibold text-gray-500 uppercase tracking-wide mb-1">👥 Who</p>
                        {a.who.workers.length === 0 ? (
                          <p className="text-gray-400 italic">No workers selected</p>
                        ) : (
                          <p>{a.who.workers.map((w) => w.name).join(", ")}</p>
                        )}
                      </div>
                    )}
                    {a.hasWhen && (
                      <div>
                        <p className="font-semibold text-gray-500 uppercase tracking-wide mb-1">⏰ When</p>
                        <p>Start: {a.when.startDateTime}</p>
                        {a.when.endDateTime && <p>End: {a.when.endDateTime}</p>}
                      </div>
                    )}
                    {a.hasWhere && a.whereTypes.length > 0 && (
                      <div>
                        <p className="font-semibold text-gray-500 uppercase tracking-wide mb-1">📍 Where</p>
                        {a.whereTypes.map((t) => {
                          const loc = a.whereLocations[t];
                          return (
                            <p key={t}>
                              <span className="capitalize font-medium">{t}:</span>{" "}
                              {loc
                                ? `${loc.building ? `Bldg ${loc.building}` : ""} ${loc.floor ? `Fl ${loc.floor}` : ""} ${loc.room ?? ""}`
                                : "Not set"}
                            </p>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-700">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-between gap-3">
          <button
            onClick={
              wizardStep === "select-process"
                ? onClose
                : wizardStep === "configure"
                ? handleActionBack
                : () => { setWizardStep("configure"); setCurrentActionIdx(actionStates.length - 1); }
            }
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <ChevronLeft size={14} />
            {wizardStep === "select-process" ? "Cancel" : "Back"}
          </button>

          <button
            onClick={
              wizardStep === "select-process"
                ? handleProcessNext
                : wizardStep === "configure"
                ? handleActionNext
                : handleConfirm
            }
            disabled={submitting}
            className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="animate-spin">⟳</span>
            ) : wizardStep === "review" ? (
              <Check size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
            {submitting
              ? "Saving…"
              : wizardStep === "select-process"
              ? "Next"
              : wizardStep === "configure"
              ? currentActionIdx < actionStates.length - 1
                ? "Next Action"
                : "Review"
              : "Confirm & Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRecordWizard;
