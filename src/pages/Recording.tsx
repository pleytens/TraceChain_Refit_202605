import React, { useState, useEffect, useRef } from "react";

interface RecordRow {
  id: number;
  processName: string;
  stepCount: number;
  createdBy: string;
  createdAt: string;
  status: "done" | "in-progress" | "received";
}

const sampleRecords: RecordRow[] = [
  { id: 1, processName: "Rice Farming Process", stepCount: 5, createdBy: "Sokha Chea", createdAt: "2024-04-01", status: "done" },
  { id: 2, processName: "Fish Processing Line A", stepCount: 3, createdBy: "Dara Kim", createdAt: "2024-04-05", status: "in-progress" },
  { id: 3, processName: "Dragon Fruit Harvest", stepCount: 4, createdBy: "Kosal Ly", createdAt: "2024-04-08", status: "received" },
  { id: 4, processName: "Pepper Drying Process", stepCount: 6, createdBy: "Rathana Sok", createdAt: "2024-04-10", status: "done" },
  { id: 5, processName: "Honey Extraction", stepCount: 2, createdBy: "Pich Vanna", createdAt: "2024-04-12", status: "in-progress" },
  { id: 6, processName: "Tea Leaf Processing", stepCount: 4, createdBy: "Mony Chhun", createdAt: "2024-04-14", status: "done" },
];

// Simulated shared-file notifications
const sharedNotifications = [
  { id: "n1", from: "Dara Kim", file: "Fish_Record_April.pdf", time: "2 min ago" },
  { id: "n2", from: "Sokha Chea", file: "Rice_Batch_Q1.xlsx", time: "15 min ago" },
];

const statusColors: Record<string, string> = {
  done: "bg-green-100 text-green-700",
  "in-progress": "bg-yellow-100 text-yellow-700",
  received: "bg-blue-100 text-blue-700",
};

type SortDir = "asc" | "desc" | null;

const Recording: React.FC = () => {
  const [records] = useState<RecordRow[]>(sampleRecords);
  const [search, setSearch] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [dismissedNotifs, setDismissedNotifs] = useState<string[]>([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const activeNotifs = sharedNotifications.filter((n) => !dismissedNotifs.includes(n.id));

  // Close notification panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifPanel(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleSort = () => {
    setSortDir((prev) => (prev === null ? "asc" : prev === "asc" ? "desc" : null));
  };

  const filtered = records
    .filter((r) => {
      const q = search.toLowerCase();
      return !q || r.processName.toLowerCase().includes(q) || r.createdBy.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortDir === "asc") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortDir === "desc") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });

  return (
    <div className="space-y-4">
      {/* Real-time notification banner */}
      {activeNotifs.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 flex items-start gap-3">
          <span className="text-blue-500 text-lg mt-0.5">🔔</span>
          <div className="flex-1">
            <p className="text-blue-800 text-sm font-medium">
              {activeNotifs.length} new file{activeNotifs.length > 1 ? "s" : ""} shared with you
            </p>
            <div className="mt-1 space-y-1">
              {activeNotifs.map((n) => (
                <div key={n.id} className="flex items-center gap-2 text-xs text-blue-700">
                  <span>📄 <strong>{n.file}</strong> shared by {n.from} · {n.time}</span>
                  <button
                    onClick={() => setDismissedNotifs((prev) => [...prev, n.id])}
                    className="ml-1 text-blue-400 hover:text-blue-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Recording</h2>
          {/* Notification bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifPanel((v) => !v)}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition"
              title="Shared file notifications"
            >
              <span className="text-lg">🔔</span>
              {activeNotifs.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
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
                      onClick={() => setDismissedNotifs(sharedNotifications.map((n) => n.id))}
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
                      <span className="text-2xl">📄</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{n.file}</p>
                        <p className="text-xs text-gray-500">Shared by {n.from} · {n.time}</p>
                      </div>
                      <button
                        onClick={() => setDismissedNotifs((prev) => [...prev, n.id])}
                        className="text-gray-300 hover:text-gray-500 text-xs shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-gray-50 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search records..."
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button className="border border-gray-200 rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-50">🔍</button>
          </div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs text-blue-500 hover:text-blue-700"
          >
            {showAdvanced ? "▲" : "▼"} Advanced Filter
          </button>

          {showAdvanced && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
              <select className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400">
                <option value="">All Processes</option>
                <option>Rice Farming Process</option>
                <option>Fish Processing Line A</option>
                <option>Dragon Fruit Harvest</option>
              </select>
              <select className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400">
                <option value="">All Users</option>
                <option>Sokha Chea</option>
                <option>Dara Kim</option>
                <option>Kosal Ly</option>
              </select>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                placeholder="From date"
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                placeholder="To date"
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Actions</th>
                <th className="px-5 py-3 text-left">Process Name</th>
                <th className="px-5 py-3 text-left">Steps</th>
                <th className="px-5 py-3 text-left">Created By</th>
                {/* Sortable recording date column – ASC/DESC toggle */}
                <th className="px-5 py-3 text-left">
                  <button
                    onClick={toggleSort}
                    className="flex items-center gap-1 group hover:text-blue-600 transition-colors font-semibold uppercase tracking-wide"
                    title={`Sort: ${sortDir === "asc" ? "Ascending" : sortDir === "desc" ? "Descending" : "Default"}`}
                  >
                    <span>Recording Date</span>
                    <span className={`transition-colors ${sortDir ? "text-blue-500" : "text-gray-400"} group-hover:text-blue-500`}>
                      {sortDir === "asc" ? " ↑" : sortDir === "desc" ? " ↓" : " ↕"}
                    </span>
                  </button>
                </th>
                <th className="px-5 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                  <td className="px-5 py-3">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded">
                      📝 Record
                    </button>
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-800">{row.processName}</td>
                  <td className="px-5 py-3 text-gray-600 text-center">
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">{row.stepCount}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{row.createdBy}</td>
                  <td className="px-5 py-3 text-gray-500">{row.createdAt}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[row.status]}`}>
                      {row.status === "in-progress" ? "In Progress" : row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-xs text-gray-500">
          <span>Showing {filtered.length} of {records.length} records</span>
          <div className="flex gap-1">
            <button className="px-2 py-1 border border-gray-200 rounded">‹</button>
            <button className="px-2 py-1 border border-blue-500 bg-blue-500 text-white rounded">1</button>
            <button className="px-2 py-1 border border-gray-200 rounded">›</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recording;
