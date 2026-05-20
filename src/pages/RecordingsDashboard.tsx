import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus, Search, Bell, Eye, Lock, RefreshCw, ChevronUp, ChevronDown,
  Package, Users, Clock, MapPin, X, FileText, PlayCircle, AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import AddRecordWizard from "@/components/recordings/AddRecordWizard";
import RunConfirmationModal from "@/components/recordings/RunConfirmationModal";
import type { Recording } from "@/types/recording";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatRecordDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${y}${mo}${da}-${h}:${m}`;
}

function rowToRecording(r: any): Recording {
  return {
    id: r.id,
    recordName: r.record_name,
    processId: r.process_id,
    processName: r.data?.processName ?? r.tc_processes?.name ?? "—",
    isFinalProcess: r.tc_processes?.is_final ?? r._is_final ?? undefined,
    recordedBy: r.recorded_by,
    recordedAt: r.recorded_at,
    userName: r.user_name,
    batchLotNumber: r.batch_lot_number ?? undefined,
    expiryDate: r.expiry_date ?? undefined,
    status: r.status as "Created" | "Locked",
    lockedAt: r.locked_at ?? undefined,
    lockedBy: r.locked_by ?? undefined,
    lockedByName: r.locked_by_name ?? undefined,
    data: r.data ?? {},
  };
}

// ─── Validation ────────────────────────────────────────────────────────────────

function validateRecordingForRun(recording: Recording): { valid: boolean; message?: string } {
  if (recording.isFinalProcess === false) {
    return {
      valid: false,
      message: "A Final Process is missing. Please add one.",
    };
  }
  // isFinalProcess === true or undefined (unknown) → allow run
  return { valid: true };
}

// ─── Record detail modal ────────────────────────────────────────────────────────

const RecordDetailModal: React.FC<{ record: Recording; onClose: () => void }> = ({
  record,
  onClose,
}) => {
  const actions = record.data?.actions ?? [];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900">{record.recordName}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{record.processName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Header info */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-gray-50 rounded-xl p-3 space-y-1">
              <p className="text-gray-400 font-semibold uppercase tracking-wide">Date</p>
              <p className="text-gray-800 font-medium">{formatRecordDate(record.recordedAt)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 space-y-1">
              <p className="text-gray-400 font-semibold uppercase tracking-wide">Created By</p>
              <p className="text-gray-800 font-medium">{record.userName}</p>
            </div>
            {record.batchLotNumber && (
              <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                <p className="text-gray-400 font-semibold uppercase tracking-wide">Batch / Lot #</p>
                <p className="text-gray-800 font-medium">{record.batchLotNumber}</p>
              </div>
            )}
            {record.expiryDate && (
              <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                <p className="text-gray-400 font-semibold uppercase tracking-wide">Expiry Date</p>
                <p className="text-gray-800 font-medium">{record.expiryDate}</p>
              </div>
            )}
            {record.lockedByName && (
              <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                <p className="text-gray-400 font-semibold uppercase tracking-wide">Locked By</p>
                <p className="text-gray-800 font-medium">{record.lockedByName}</p>
              </div>
            )}
            <div className="bg-gray-50 rounded-xl p-3 space-y-1">
              <p className="text-gray-400 font-semibold uppercase tracking-wide">Status</p>
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  record.status === "Locked"
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {record.status === "Locked" && <Lock size={10} />}
                {record.status}
              </span>
            </div>
          </div>

          {/* Actions */}
          {actions.map((a: any, i: number) => (
            <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-blue-50 px-4 py-2.5 flex items-center gap-2">
                <span className="text-xs font-bold text-blue-700">Action {i + 1}</span>
                <span className="text-sm font-semibold text-gray-800">{a.actionName}</span>
              </div>
              <div className="p-4 space-y-2 text-xs text-gray-700">
                {a.what && a.what.length > 0 && (
                  <div>
                    <p className="font-semibold text-gray-500 uppercase mb-1 flex items-center gap-1">
                      <Package size={11} /> Materials
                    </p>
                    {a.what.map((m: any, mi: number) => (
                      <div key={mi} className="flex justify-between bg-gray-50 rounded px-3 py-1.5">
                        <span className="font-medium">{m.name}</span>
                        <span className="text-gray-500">
                          {m.quantity ?? "—"} {m.importUnitItem || ""}
                          {m.batchNumber ? ` · #${m.batchNumber}` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {a.who && a.who.length > 0 && (
                  <div>
                    <p className="font-semibold text-gray-500 uppercase mb-1 flex items-center gap-1">
                      <Users size={11} /> Workers
                    </p>
                    <p>{a.who.map((w: any) => w.name).join(", ")}</p>
                  </div>
                )}
                {a.when && (
                  <div>
                    <p className="font-semibold text-gray-500 uppercase mb-1 flex items-center gap-1">
                      <Clock size={11} /> When
                    </p>
                    <p>Start: {a.when.startDateTime}</p>
                    {a.when.endDateTime && <p>End: {a.when.endDateTime}</p>}
                  </div>
                )}
                {a.whereTypes && a.whereTypes.length > 0 && (
                  <div>
                    <p className="font-semibold text-gray-500 uppercase mb-1 flex items-center gap-1">
                      <MapPin size={11} /> Where
                    </p>
                    {a.whereTypes.map((t: string) => {
                      const loc = a.whereLocations?.[t];
                      return (
                        <p key={t}>
                          <span className="capitalize font-medium">{t}:</span>{" "}
                          {loc
                            ? [loc.building && `Bldg ${loc.building}`, loc.floor && `Fl ${loc.floor}`, loc.room]
                                .filter(Boolean)
                                .join(" → ")
                            : "Not set"}
                          {loc?.storageRequirementName && (
                            <span className="ml-2 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                              {loc.storageRequirementName}
                            </span>
                          )}
                        </p>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main page ─────────────────────────────────────────────────────────────────

type SortDir = "asc" | "desc" | null;

const RecordingsDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [runTarget, setRunTarget] = useState<Recording | null>(null);
  const [viewTarget, setViewTarget] = useState<Recording | null>(null);

  // Notification state (real-time shared files)
  const [sharedNotifs, setSharedNotifs] = useState<{ id: string; message: string; time: string }[]>([
    { id: "n1", message: "Green Farm Co. shared a traceability report with you.", time: "2 min ago" },
  ]);
  const [dismissedNotifs, setDismissedNotifs] = useState<string[]>([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const activeNotifs = sharedNotifs.filter((n) => !dismissedNotifs.includes(n.id));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifPanel(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchRecordings = useCallback(async () => {
    setLoading(true);
    if (supabase) {
      const { data, error } = await supabase
        .from("tc_recordings")
        .select("*, tc_processes(id, name, is_final)")
        .order("recorded_at", { ascending: false });
      setLoading(false);
      if (!error && data) {
        setRecordings(data.map(rowToRecording));
        return;
      }
    }
    // LocalStorage fallback
    const ls = JSON.parse(localStorage.getItem("tc_recordings") ?? "[]");
    setRecordings(ls.map(rowToRecording));
    setLoading(false);
  }, []);

  useEffect(() => { fetchRecordings(); }, [fetchRecordings]);

  const handleRunConfirm = async (batchLot: string, expiryDate: string) => {
    if (!runTarget || !currentUser) return;
    const lockedByName = `${currentUser.firstName}${currentUser.lastName ? " - " + currentUser.lastName : ""}`;
    const now = new Date().toISOString();

    if (supabase) {
      // 1. Lock the recording
      const { error: recordingError } = await supabase
        .from("tc_recordings")
        .update({
          batch_lot_number: batchLot,
          expiry_date: expiryDate,
          status: "Locked",
          locked_at: now,
          locked_by: currentUser.id,
          locked_by_name: lockedByName,
          user_name: lockedByName,
          updated_at: now,
        })
        .eq("id", runTarget.id);
      if (recordingError) throw new Error(recordingError.message);

      // 2. Mark the process as used
      if (runTarget.processId) {
        const { error: processError } = await supabase
          .from("tc_processes")
          .update({
            is_used: true,
            updated_at: now,
          })
          .eq("id", runTarget.processId);
        if (processError) console.error("Failed to mark process as used:", processError.message);
      }

      // 3. Mark all actions used in this recording as is_used
      const actionIds: string[] = (runTarget.data?.actions ?? [])
        .map((a: any) => a.actionId)
        .filter(Boolean);
      if (actionIds.length > 0) {
        // These are step IDs from tc_process_action_steps; get the actual action_ids
        const { data: stepRows } = await supabase
          .from("tc_process_action_steps")
          .select("action_id")
          .in("id", actionIds);
        const libActionIds = (stepRows ?? []).map((r: any) => r.action_id).filter(Boolean);
        if (libActionIds.length > 0) {
          await supabase
            .from("tc_action_library")
            .update({ is_used: true })
            .in("id", libActionIds);
        }
      }
    } else {
      const ls: any[] = JSON.parse(localStorage.getItem("tc_recordings") ?? "[]");
      const idx = ls.findIndex((r) => r.id === runTarget.id);
      if (idx !== -1) {
        ls[idx] = {
          ...ls[idx],
          batch_lot_number: batchLot,
          expiry_date: expiryDate,
          status: "Locked",
          locked_at: now,
          locked_by: currentUser.id,
          locked_by_name: lockedByName,
          user_name: lockedByName,
        };
        localStorage.setItem("tc_recordings", JSON.stringify(ls));
      }
      // Also update process in localStorage
      if (runTarget.processId) {
        const lsProcesses: any[] = JSON.parse(localStorage.getItem("tc_processes") ?? "[]");
        const pIdx = lsProcesses.findIndex((p) => p.id === runTarget.processId);
        if (pIdx !== -1) {
          lsProcesses[pIdx].is_used = true;
          localStorage.setItem("tc_processes", JSON.stringify(lsProcesses));
        }
      }
    }
    setRunTarget(null);
    fetchRecordings();
  };

  const toggleSort = () => setSortDir((prev) => (prev === null ? "asc" : prev === "asc" ? "desc" : null));

  const filtered = recordings
    .filter((r) => {
      const q = search.toLowerCase();
      return (
        !q ||
        r.recordName.toLowerCase().includes(q) ||
        r.processName.toLowerCase().includes(q) ||
        r.userName.toLowerCase().includes(q) ||
        (r.batchLotNumber ?? "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortDir === "asc") return new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime();
      if (sortDir === "desc") return new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime();
      return 0;
    });

  const currentUserName = currentUser
    ? `${currentUser.firstName}${currentUser.lastName ? " - " + currentUser.lastName : ""}`
    : "Unknown User";

  return (
    <div className="space-y-4">
      {/* Notification banner */}
      {activeNotifs.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 flex items-start gap-3">
          <Bell size={16} className="text-blue-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-blue-800 text-sm font-medium">
              {activeNotifs.length} new file{activeNotifs.length > 1 ? "s" : ""} shared with you
            </p>
            <div className="mt-1 space-y-1">
              {activeNotifs.map((n) => (
                <div key={n.id} className="flex items-center gap-2 text-xs text-blue-700">
                  <span>📄 {n.message} · {n.time}</span>
                  <button
                    onClick={() => setDismissedNotifs((prev) => [...prev, n.id])}
                    className="ml-1 text-blue-400 hover:text-blue-600"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Recordings</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchRecordings}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
              title="Refresh"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>

            {/* Notification bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifPanel((v) => !v)}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition"
                title="Notifications"
              >
                <Bell size={16} className="text-gray-500" />
                {activeNotifs.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                    {activeNotifs.length}
                  </span>
                )}
              </button>
              {showNotifPanel && (
                <div className="absolute right-0 top-10 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-20">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800">Shared Files</span>
                    {activeNotifs.length > 0 && (
                      <button
                        onClick={() => setDismissedNotifs(sharedNotifs.map((n) => n.id))}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  {activeNotifs.length === 0 ? (
                    <div className="px-4 py-6 text-xs text-gray-400 text-center">No new notifications</div>
                  ) : (
                    activeNotifs.map((n) => (
                      <div key={n.id} className="px-4 py-3 border-b border-gray-50 last:border-0 flex items-start gap-3 hover:bg-gray-50">
                        <span className="text-xl">📄</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-800">{n.message}</p>
                          <p className="text-xs text-gray-500">{n.time}</p>
                        </div>
                        <button
                          onClick={() => setDismissedNotifs((prev) => [...prev, n.id])}
                          className="text-gray-300 hover:text-gray-500 shrink-0"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowWizard(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
            >
              <Plus size={14} />
              Add Record
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-gray-50">
          <div className="relative max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search records…"
              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Record Name</th>
                <th className="px-5 py-3 text-left">
                  <button
                    onClick={toggleSort}
                    className="flex items-center gap-1 group hover:text-blue-600 transition-colors font-semibold uppercase tracking-wide"
                  >
                    Date
                    {sortDir === "asc" ? (
                      <ChevronUp size={12} className="text-blue-500" />
                    ) : sortDir === "desc" ? (
                      <ChevronDown size={12} className="text-blue-500" />
                    ) : (
                      <span className="text-gray-400 text-[10px]">↕</span>
                    )}
                  </button>
                </th>
                <th className="px-5 py-3 text-left">User Name</th>
                <th className="px-5 py-3 text-left">Batch / Lot #</th>
                <th className="px-5 py-3 text-left">Expiry Date</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-sm text-gray-400">
                    Loading recordings…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <FileText size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-400">
                      {recordings.length === 0
                        ? "No recordings yet. Click \"Add Record\" to get started."
                        : "No records match your search."}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{row.recordName}</p>
                        <p className="text-xs text-gray-400">{row.processName}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600 text-sm font-mono text-xs">
                      {formatRecordDate(row.recordedAt)}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{row.userName}</td>
                    <td className="px-5 py-3 text-gray-500">
                      {row.batchLotNumber ? (
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-mono">
                          {row.batchLotNumber}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {row.expiryDate ? (
                        <span className="font-mono text-xs">{row.expiryDate}</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          row.status === "Locked"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {row.status === "Locked" && <Lock size={10} />}
                        {row.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {row.status === "Locked" ? (
                          <button
                            onClick={() => setViewTarget(row)}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-50 transition"
                          >
                            <Eye size={12} />
                            View
                          </button>
                        ) : (() => {
                          const { valid, message } = validateRecordingForRun(row);
                          return (
                            <>
                              <button
                                onClick={() => valid && setRunTarget(row)}
                                disabled={!valid}
                                title={!valid ? message : "Lock this recording and issue QR"}
                                className={`flex items-center gap-1 text-xs font-semibold rounded-lg px-3 py-1.5 transition ${
                                  valid
                                    ? "bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                }`}
                              >
                                {valid ? (
                                  <>
                                    <PlayCircle size={12} />
                                    RUN
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle size={12} />
                                    Incomplete
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => setViewTarget(row)}
                                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-50 transition"
                              >
                                <Eye size={12} />
                                View
                              </button>
                            </>
                          );
                        })()}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-xs text-gray-500">
          <span>
            Showing {filtered.length} of {recordings.length} record{recordings.length !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Created: {recordings.filter((r) => r.status === "Created").length}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Locked: {recordings.filter((r) => r.status === "Locked").length}
            </span>
          </div>
        </div>
      </div>

      {/* Add Record Wizard */}
      {showWizard && (
        <AddRecordWizard
          onClose={() => setShowWizard(false)}
          onRecordCreated={() => {
            setShowWizard(false);
            fetchRecordings();
          }}
          currentUserId={currentUser?.id ?? "unknown"}
          currentUserName={currentUserName}
        />
      )}

      {/* Run Confirmation Modal */}
      {runTarget && (
        <RunConfirmationModal
          record={runTarget}
          onCancel={() => setRunTarget(null)}
          onConfirm={handleRunConfirm}
        />
      )}

      {/* View Record Modal */}
      {viewTarget && (
        <RecordDetailModal
          record={viewTarget}
          onClose={() => setViewTarget(null)}
        />
      )}
    </div>
  );
};

export default RecordingsDashboard;
