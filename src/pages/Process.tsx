import React, { useState, useEffect, useRef } from "react";
import { useProcesses, ProcessStep, ProcessRecord } from "@/context/ProcessesContext";

interface ProcessModalProps {
  process?: ProcessRecord | null;
  onClose: () => void;
  onSave: (p: Partial<ProcessRecord>) => void;
}

const dataTypes = ["Text", "Number", "Date", "Image", "File", "Dropdown", "GPS"];

const ProcessModal: React.FC<ProcessModalProps> = ({ process, onClose, onSave }) => {  const [name, setName] = useState(process?.name ?? "");
  const [steps, setSteps] = useState<ProcessStep[]>(
    process?.steps ?? [{ name: "", dataType: "Text" }]
  );

  const addStep = () => setSteps([...steps, { name: "", dataType: "Text" }]);
  const removeStep = (i: number) => setSteps(steps.filter((_, idx) => idx !== i));
  const updateStep = (i: number, field: keyof ProcessStep, val: string) => {
    setSteps(steps.map((s, idx) => {
      if (idx !== i) return s;
      const updated = { ...s, [field]: val };
      // Clear dropdownOptions if type changed away from Dropdown
      if (field === "dataType" && val !== "Dropdown") updated.dropdownOptions = "";
      return updated;
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-800">
            {process ? "Edit Process" : "New Process"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Process Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter process name..."
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">Process Steps</label>
              <button
                onClick={addStep}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                + Add Step
              </button>
            </div>
            <div className="space-y-3">
              {steps.map((step, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 font-mono w-5 text-center">{i + 1}</span>
                    <input
                      type="text"
                      value={step.name}
                      onChange={(e) => updateStep(i, "name", e.target.value)}
                      placeholder="Step name..."
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                    <select
                      value={step.dataType}
                      onChange={(e) => updateStep(i, "dataType", e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 text-gray-600"
                    >
                      {dataTypes.map((dt) => (
                        <option key={dt} value={dt}>{dt}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeStep(i)}
                      className="text-red-400 hover:text-red-600 text-sm px-1"
                    >
                      ✕
                    </button>
                  </div>
                  {/* Conditional: only show dropdown options when type is Dropdown */}
                  {step.dataType === "Dropdown" && (
                    <div className="ml-8">
                      <label className="text-xs text-gray-500 mb-1 block">
                        Dropdown options <span className="text-gray-400">(comma-separated)</span>
                      </label>
                      <input
                        type="text"
                        value={step.dropdownOptions ?? ""}
                        onChange={(e) => updateStep(i, "dropdownOptions", e.target.value)}
                        placeholder="e.g. Option A, Option B, Option C"
                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                      />
                    </div>
                  )}
                </div>
              ))}
              {steps.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">No steps added yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
            Close
          </button>
          <button
            onClick={() => { onSave({ name, steps }); onClose(); }}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            ✓ Save
          </button>
        </div>
      </div>
    </div>
  );
};

const Process: React.FC = () => {
  const { processes, addProcess, updateProcess, deleteProcess } = useProcesses();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editProcess, setEditProcess] = useState<ProcessRecord | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Real-time debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  const filtered = processes.filter(
    (p) => !debouncedSearch || p.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const handleSave = async (data: Partial<ProcessRecord>) => {
    try {
      if (editProcess) {
        await updateProcess(editProcess.id, data);
        setSuccessBanner(`Process "${data.name}" updated successfully.`);
      } else {
        const newId = await addProcess({ name: data.name ?? "", steps: data.steps ?? [], isActive: true });
        setExpandedId(newId);
        setSuccessBanner(`Process "${data.name}" created. You can now add recordings to this process.`);
      }
      setTimeout(() => setSuccessBanner(null), 5000);
    } catch (err: any) {
      alert("❌ Failed to save process: " + (err?.message ?? "Unknown error") + "\n\nCheck the browser console (F12) for more details.");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this process?")) await deleteProcess(id);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Success banner with next steps */}
      {successBanner && (
        <div className="mx-6 mt-4 bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-start gap-3">
          <span className="text-green-500 text-lg mt-0.5">✓</span>
          <div className="flex-1">
            <p className="text-green-800 text-sm font-medium">{successBanner}</p>
            {!editProcess && (
              <p className="text-green-700 text-xs mt-1">
                <strong>Next steps:</strong> Go to <em>Recording</em> to start capturing traceability data for this process.
              </p>
            )}
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-green-400 hover:text-green-600 text-xs">✕</button>
        </div>
      )}

      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-800">Process Management</h2>
        <button
          onClick={() => { setEditProcess(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + New Process
        </button>
      </div>

      <div className="px-6 py-3 border-b border-gray-50">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search processes… (live search)"
            className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">✕</button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-5 py-3 text-left">Actions</th>
              <th className="px-5 py-3 text-left">Process Name</th>
              <th className="px-5 py-3 text-left">Steps</th>
              <th className="px-5 py-3 text-left">Created</th>
              <th className="px-5 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <React.Fragment key={row.id}>
                <tr className="hover:bg-gray-50 transition-colors border-t border-gray-50">
                  <td className="px-5 py-3">
                    <div className="relative group">
                      <button className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded flex items-center gap-1">
                        ⚙ Actions ▾
                      </button>
                      <div className="absolute left-0 top-7 hidden group-hover:block z-10 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[140px]">
                        <button
                          onClick={() => { setEditProcess(row); setShowModal(true); }}
                          className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                        >
                          ✏ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50"
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-800">
                    <button
                      onClick={() => setExpandedId(expandedId === row.id ? null : row.id)}
                      className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                    >
                      <span className="text-xs text-gray-400">{expandedId === row.id ? "▼" : "▶"}</span>
                      {row.name}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                      {row.steps.length} steps
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{row.createdAt}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      row.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {row.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
                {expandedId === row.id && (
                  <tr className="bg-gray-50">
                    <td colSpan={5} className="px-8 py-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Steps Detail</p>
                      <div className="flex flex-wrap gap-2">
                        {row.steps.map((step, i) => (
                          <div key={i} className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
                            <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">
                              {i + 1}
                            </span>
                            <div>
                              <p className="text-xs font-medium text-gray-700">{step.name}</p>
                              <p className="text-xs text-gray-400">{step.dataType}{step.dropdownOptions ? ` · ${step.dropdownOptions}` : ""}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-xs text-gray-500">
        <span>Showing {filtered.length} of {processes.length} processes</span>
        <div className="flex gap-1">
          <button className="px-2 py-1 border border-gray-200 rounded">‹</button>
          <button className="px-2 py-1 border border-blue-500 bg-blue-500 text-white rounded">1</button>
          <button className="px-2 py-1 border border-gray-200 rounded">›</button>
        </div>
      </div>

      {showModal && (
        <ProcessModal
          process={editProcess}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Process;
