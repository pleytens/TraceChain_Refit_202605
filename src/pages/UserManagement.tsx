import React, { useState } from "react";
import { useAuth, AuthUser, UserRole } from "@/context/AuthContext";

// ── Role hierarchy helpers ─────────────────────────────────────────────────

// Numeric rank: higher = more powerful
const roleRank: Record<string, number> = {
  SuperAdmin: 3,
  Admin: 2,
  User: 1,
  TraceChainAdminPortalAdmin: 4,
  TraceChainCustomerPortalAdmin: 3,
  Role1: 1,
  Role2: 1,
  Role3: 1,
};

// Roles an actor can create (based on their rank)
function creatableRoles(actorRole: UserRole, portal: string): UserRole[] {
  if (portal === "admin") {
    return ["TraceChainAdminPortalAdmin", "Role1", "Role2", "Role3"];
  }
  // Customer portal
  if (actorRole === "SuperAdmin") return ["SuperAdmin", "Admin", "User", "User-Worker", "Worker"];
  if (actorRole === "Admin") return ["Admin", "User", "User-Worker", "Worker"];
  return [];
}

const isWorkerRole = (role: UserRole) => role === "Worker";

// Can actor edit/delete target?
function canActOn(actor: AuthUser, target: AuthUser): boolean {
  if (actor.id === target.id) return true; // always can edit self
  const actorRank = roleRank[actor.role] ?? 0;
  const targetRank = roleRank[target.role] ?? 0;
  return actorRank >= targetRank;
}

// Password policy checker
function checkPassword(pw: string): { minLength: boolean; hasLetter: boolean; hasNumber: boolean; hasCapital: boolean; maxLength: boolean } {
  return {
    minLength: pw.length >= 6,
    maxLength: pw.length <= 12,
    hasLetter: /[a-zA-Z]/.test(pw),
    hasNumber: /[0-9]/.test(pw),
    hasCapital: /[A-Z]/.test(pw),
  };
}

interface PasswordPolicyProps {
  password: string;
}
function PasswordPolicy({ password }: PasswordPolicyProps) {
  const checks = checkPassword(password);
  const rules = [
    { label: "Minimum 6 characters", met: checks.minLength },
    { label: "Maximum 12 characters", met: checks.maxLength },
    { label: "At least 1 letter", met: checks.hasLetter },
    { label: "At least 1 number", met: checks.hasNumber },
    { label: "At least 1 capital letter", met: checks.hasCapital },
  ];
  return (
    <div className="mt-1.5 space-y-1">
      {rules.map((r) => (
        <div key={r.label} className={`flex items-center gap-2 text-xs font-medium ${r.met ? "text-green-600" : "text-red-500"}`}>
          <span>{r.met ? "✓" : "✗"}</span>
          <span>{r.label}</span>
        </div>
      ))}
    </div>
  );
}

// Country codes
const countryCodes = [
  { flag: "🇻🇳", code: "+84", name: "Vietnam" },
  { flag: "🇰🇭", code: "+855", name: "Cambodia" },
  { flag: "🇹🇭", code: "+66", name: "Thailand" },
  { flag: "🇸🇬", code: "+65", name: "Singapore" },
  { flag: "🇲🇾", code: "+60", name: "Malaysia" },
  { flag: "🇮🇩", code: "+62", name: "Indonesia" },
  { flag: "🇵🇭", code: "+63", name: "Philippines" },
  { flag: "🇲🇲", code: "+95", name: "Myanmar" },
  { flag: "🇱🇦", code: "+856", name: "Laos" },
  { flag: "🇧🇳", code: "+673", name: "Brunei" },
  { flag: "🇺🇸", code: "+1", name: "United States" },
  { flag: "🇬🇧", code: "+44", name: "United Kingdom" },
  { flag: "🇫🇷", code: "+33", name: "France" },
  { flag: "🇩🇪", code: "+49", name: "Germany" },
  { flag: "🇮🇹", code: "+39", name: "Italy" },
  { flag: "🇪🇸", code: "+34", name: "Spain" },
  { flag: "🇵🇹", code: "+351", name: "Portugal" },
  { flag: "🇳🇱", code: "+31", name: "Netherlands" },
  { flag: "🇧🇪", code: "+32", name: "Belgium" },
  { flag: "🇨🇭", code: "+41", name: "Switzerland" },
  { flag: "🇦🇹", code: "+43", name: "Austria" },
  { flag: "🇸🇪", code: "+46", name: "Sweden" },
  { flag: "🇳🇴", code: "+47", name: "Norway" },
  { flag: "🇩🇰", code: "+45", name: "Denmark" },
  { flag: "🇫🇮", code: "+358", name: "Finland" },
  { flag: "🇵🇱", code: "+48", name: "Poland" },
  { flag: "🇷🇺", code: "+7", name: "Russia" },
  { flag: "🇺🇦", code: "+380", name: "Ukraine" },
  { flag: "🇨🇳", code: "+86", name: "China" },
  { flag: "🇯🇵", code: "+81", name: "Japan" },
  { flag: "🇰🇷", code: "+82", name: "South Korea" },
  { flag: "🇮🇳", code: "+91", name: "India" },
  { flag: "🇵🇰", code: "+92", name: "Pakistan" },
  { flag: "🇧🇩", code: "+880", name: "Bangladesh" },
  { flag: "🇱🇰", code: "+94", name: "Sri Lanka" },
  { flag: "🇳🇵", code: "+977", name: "Nepal" },
  { flag: "🇦🇺", code: "+61", name: "Australia" },
  { flag: "🇳🇿", code: "+64", name: "New Zealand" },
  { flag: "🇿🇦", code: "+27", name: "South Africa" },
  { flag: "🇳🇬", code: "+234", name: "Nigeria" },
  { flag: "🇰🇪", code: "+254", name: "Kenya" },
  { flag: "🇬🇭", code: "+233", name: "Ghana" },
  { flag: "🇪🇹", code: "+251", name: "Ethiopia" },
  { flag: "🇹🇿", code: "+255", name: "Tanzania" },
  { flag: "🇺🇬", code: "+256", name: "Uganda" },
  { flag: "🇲🇽", code: "+52", name: "Mexico" },
  { flag: "🇧🇷", code: "+55", name: "Brazil" },
  { flag: "🇦🇷", code: "+54", name: "Argentina" },
  { flag: "🇨🇱", code: "+56", name: "Chile" },
  { flag: "🇨🇴", code: "+57", name: "Colombia" },
  { flag: "🇵🇪", code: "+51", name: "Peru" },
  { flag: "🇸🇦", code: "+966", name: "Saudi Arabia" },
  { flag: "🇦🇪", code: "+971", name: "UAE" },
  { flag: "🇶🇦", code: "+974", name: "Qatar" },
  { flag: "🇰🇼", code: "+965", name: "Kuwait" },
  { flag: "🇧🇭", code: "+973", name: "Bahrain" },
  { flag: "🇴🇲", code: "+968", name: "Oman" },
  { flag: "🇮🇷", code: "+98", name: "Iran" },
  { flag: "🇹🇷", code: "+90", name: "Turkey" },
  { flag: "🇮🇱", code: "+972", name: "Israel" },
  { flag: "🇯🇴", code: "+962", name: "Jordan" },
  { flag: "🇱🇧", code: "+961", name: "Lebanon" },
  { flag: "🇨🇦", code: "+1", name: "Canada" },
];

// Custom country picker with search
function CountryPicker({ value, onChange }: { value: string; onChange: (code: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const ref = React.useRef<HTMLDivElement>(null);

  const selected = countryCodes.find((c) => c.code === value) ?? countryCodes[0];
  const filtered = countryCodes.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.includes(search)
  );

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative w-32" ref={ref}>
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setSearch(""); }}
        className="w-full flex items-center gap-1.5 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
      >
        <span>{selected.flag}</span>
        <span>{selected.code}</span>
        <svg className="ml-auto w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 left-0 w-56 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country..."
              className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="overflow-y-auto max-h-52">
            {filtered.length === 0 ? (
              <div className="text-sm text-gray-400 px-3 py-2">No results</div>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.name + c.code}
                  type="button"
                  onClick={() => { onChange(c.code); setOpen(false); setSearch(""); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-green-50 text-left ${value === c.code && selected.name === c.name ? "bg-green-50 font-medium" : ""}`}
                >
                  <span className="text-base">{c.flag}</span>
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="text-gray-400">{c.code}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface UserFormState {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: "Active" | "Inactive";
  countryCode: string;
  localPhone: string;
  password: string;
  confirmPassword: string;
}

const emptyForm = (defaultRole: UserRole = "User"): UserFormState => ({
  firstName: "",
  lastName: "",
  email: "",
  role: defaultRole,
  status: "Active",
  countryCode: "+84",
  localPhone: "",
  password: "",
  confirmPassword: "",
});

type ModalMode = "create" | "edit" | "view" | null;

export default function UserManagement() {
  const { getUsers, addUser, updateUser, updatePassword, getPassword, deleteUser, currentUser, getAuditLog, activePortal } = useAuth();
  const portal = activePortal ?? "admin";
  const users = getUsers(portal);
  const auditLog = getAuditLog(portal);
  const [activeTab, setActiveTab] = useState<"users" | "audit">("users");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editTarget, setEditTarget] = useState<AuthUser | null>(null);

  const actorRole = currentUser?.role ?? "User";
  const allowedRoles = creatableRoles(actorRole as UserRole, portal);

  const [form, setForm] = useState<UserFormState>(emptyForm(allowedRoles[0] ?? "User"));
  const [formError, setFormError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AuthUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [search, setSearch] = useState("");

  const isPasswordValid = (pw: string) => {
    const c = checkPassword(pw);
    return c.minLength && c.maxLength && c.hasLetter && c.hasNumber && c.hasCapital;
  };

  const openCreate = () => {
    setForm(emptyForm(allowedRoles[0] ?? "User"));
    setFormError("");
    setEditTarget(null);
    setModalMode("create");
  };

  const openEdit = (u: AuthUser) => {
    setForm({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: u.role,
      status: u.status,
      countryCode: u.phone?.split("-")[0] ?? "+855",
      localPhone: u.phone?.split("-")[1] ?? "",
      password: "",
      confirmPassword: "",
    });
    setFormError("");
    setEditTarget(u);
    setModalMode("edit");
  };

  const validateForm = (isEdit: boolean): string | null => {
    if (!form.firstName.trim()) return "First name is required.";
    if (form.firstName.trim().length > 25) return "First name must be 25 characters or less.";
    if (form.lastName.trim().length > 25) return "Last name must be 25 characters or less.";
    const workerRole = isWorkerRole(form.role);
    if (!workerRole) {
      if (!form.email.trim()) return "Email address is required.";
    }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return "Please enter a valid email address.";
    if (form.localPhone && form.localPhone.length > 12) return "Local phone number must be max 12 digits.";
    if (!workerRole) {
      if (!isEdit) {
        if (!form.password) return "Password is required.";
        if (!isPasswordValid(form.password)) return "Password does not meet requirements.";
        if (form.password !== form.confirmPassword) return "Passwords do not match.";
      } else if (form.password) {
        if (!isPasswordValid(form.password)) return "Password does not meet requirements.";
        if (form.password !== form.confirmPassword) return "Passwords do not match.";
      }
    }
    return null;
  };

  const handleSave = () => {
    const isEdit = modalMode === "edit";
    const err = validateForm(isEdit);
    if (err) { setFormError(err); return; }

    const phone = form.localPhone ? `${form.countryCode}-${form.localPhone}` : undefined;

    if (isEdit && editTarget) {
      updateUser(editTarget.id, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        role: form.role,
        status: form.status,
        phone,
      });
      if (form.password) {
        updatePassword(editTarget.id, form.password);
      }
      setModalMode(null);
    } else {
      const result = addUser(
        { firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim(), role: form.role, status: form.status, phone, portal },
        form.password
      );
      if (!result.success) { setFormError(result.error ?? "Failed to create user."); return; }
      setModalMode(null);
    }
  };

  const roleColor: Record<string, string> = {
    TraceChainAdminPortalAdmin: "bg-purple-100 text-purple-700",
    TraceChainCustomerPortalAdmin: "bg-indigo-100 text-indigo-700",
    SuperAdmin: "bg-red-100 text-red-700",
    Admin: "bg-orange-100 text-orange-700",
    User: "bg-blue-100 text-blue-700",
    "User-Worker": "bg-cyan-100 text-cyan-700",
    Worker: "bg-gray-100 text-gray-600",
    Role1: "bg-blue-100 text-blue-700",
    Role2: "bg-orange-100 text-orange-700",
    Role3: "bg-gray-100 text-gray-600",
  };

  const roleLabel: Record<string, string> = {
    TraceChainAdminPortalAdmin: "TV Admin",
    TraceChainCustomerPortalAdmin: "Portal Admin",
    SuperAdmin: "SuperAdmin",
    Admin: "Admin",
    User: "User",
    "User-Worker": "User-Worker",
    Worker: "Worker",
    Role1: "Role 1",
    Role2: "Role 2",
    Role3: "Role 3",
  };

  const filteredUsers = users.filter(
    (u) =>
      u.firstName.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {(["users", "audit"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            {tab === "users" ? "👥 People" : "📋 Audit Log"}
          </button>
        ))}
      </div>

      {activeTab === "users" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-base">
              {portal === "admin" ? "TraceChain Admin Portal People" : "TraceChain Customer Portal People"}
            </h2>
            <div className="flex items-center gap-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 w-48"
              />
              <button
                onClick={openCreate}
                className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2 shadow-sm"
              >
                <span>+</span> Create People
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3 text-center">Worker</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length === 0 && (
                  <tr><td colSpan={8} className="text-center text-gray-400 py-10">No users found.</td></tr>
                )}
                {filteredUsers.map((u) => (
                  <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${u.id === currentUser?.id ? "bg-green-50/40" : ""}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {u.firstName[0]?.toUpperCase()}{u.lastName[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{u.firstName} {u.lastName}</div>
                          {u.id === currentUser?.id && <div className="text-xs text-green-600 font-medium">You</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{u.email}</td>
                    <td className="px-6 py-4 text-gray-500">{u.phone || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleColor[u.role] ?? "bg-gray-100 text-gray-600"}`}>
                        {roleLabel[u.role] ?? u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        readOnly
                        checked={u.role === "Worker" || u.role === "User-Worker"}
                        className="w-4 h-4 accent-green-600 cursor-default"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${u.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === "Active" ? "bg-green-500" : "bg-red-500"}`} />
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {currentUser && canActOn(currentUser, u) && (
                          <button onClick={() => openEdit(u)} className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline">Edit</button>
                        )}
                        {u.id !== currentUser?.id && currentUser && canActOn(currentUser, u) && (
                          <>
                            <span className="text-gray-300">|</span>
                            <button onClick={() => setDeleteTarget(u)} className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline">Delete</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "audit" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-base">Audit Log – Field & Label Changes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left">
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">Performed By</th>
                  <th className="px-6 py-3">Action</th>
                  <th className="px-6 py-3">Field</th>
                  <th className="px-6 py-3">Old Value</th>
                  <th className="px-6 py-3">New Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {auditLog.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-gray-400 py-10">No audit entries yet.</td></tr>
                )}
                {auditLog.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-xs text-gray-400 whitespace-nowrap">{new Date(entry.timestamp).toLocaleString()}</td>
                    <td className="px-6 py-3 text-xs text-gray-600">{entry.userEmail}</td>
                    <td className="px-6 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        entry.action === "CREATE_USER" ? "bg-green-100 text-green-700" :
                        entry.action === "DELETE_USER" ? "bg-red-100 text-red-600" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {entry.action.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs text-gray-700 font-mono">{entry.field}</td>
                    <td className="px-6 py-3 text-xs text-gray-400">{entry.oldValue || "—"}</td>
                    <td className="px-6 py-3 text-xs text-gray-700">{entry.newValue || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {(modalMode === "create" || modalMode === "edit") && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base">{modalMode === "create" ? "Create New People" : "Edit People"}</h3>
              <button onClick={() => setModalMode(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-red-700 text-sm">{formError}</div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* First Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">First Name <span className="text-red-500">*</span></label>
                  <input
                    value={form.firstName}
                    onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                    maxLength={25}
                    placeholder="First name"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <p className="text-xs text-gray-400">{form.firstName.length}/25</p>
                </div>

                {/* Last Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    value={form.lastName}
                    onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                    maxLength={25}
                    placeholder="Last name"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <p className="text-xs text-gray-400">{form.lastName.length}/25</p>
                </div>

                {/* Role - placed right after names */}
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => {
                      const newRole = e.target.value as UserRole;
                      setForm((p) => ({
                        ...p,
                        role: newRole,
                        // Clear password fields when switching to Worker
                        password: isWorkerRole(newRole) ? "" : p.password,
                        confirmPassword: isWorkerRole(newRole) ? "" : p.confirmPassword,
                      }));
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {portal === "admin" ? (
                      <>
                        <option value="TraceChainAdminPortalAdmin">TV Admin</option>
                        <option value="Role1">Role 1</option>
                        <option value="Role2">Role 2</option>
                        <option value="Role3">Role 3</option>
                      </>
                    ) : (
                      allowedRoles.map((r) => (
                        <option key={r} value={r}>{roleLabel[r] ?? r}</option>
                      ))
                    )}
                  </select>
                  {isWorkerRole(form.role) && (
                    <p className="text-xs text-amber-600 mt-0.5">⚠ Workers have no credentials and cannot log in.</p>
                  )}
                </div>

                {/* Email - always visible, optional for Workers */}
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Email Address {!isWorkerRole(form.role) && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="email@example.com"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Phone */}
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Telephone Number</label>
                  <div className="flex gap-2">
                    <CountryPicker
                      value={form.countryCode}
                      onChange={(code) => setForm((p) => ({ ...p, countryCode: code }))}
                    />
                    <input
                      value={form.localPhone}
                      onChange={(e) => setForm((p) => ({ ...p, localPhone: e.target.value.replace(/\D/g, "").slice(0, 12) }))}
                      placeholder="Local number (max 12 digits)"
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as "Active" | "Inactive" }))}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>

                {/* Password - hidden for Worker */}
                {!isWorkerRole(form.role) && (
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Password {modalMode === "create" && <span className="text-red-500">*</span>}
                    {modalMode === "edit" && <span className="text-xs text-gray-400 ml-1">(leave blank to keep current)</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                      placeholder="Enter password"
                      maxLength={12}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 pr-16"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {form.password && <PasswordPolicy password={form.password} />}
                </div>
                )}

                {/* Confirm Password - hidden for Worker */}
                {!isWorkerRole(form.role) && form.password && (
                  <div className="col-span-2 flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Confirm Password <span className="text-red-500">*</span></label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                      placeholder="Confirm password"
                      maxLength={12}
                      className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${form.confirmPassword && form.password !== form.confirmPassword ? "border-red-300 bg-red-50" : "border-gray-300"}`}
                    />
                    {form.confirmPassword && form.password !== form.confirmPassword && (
                      <p className="text-xs text-red-500">Passwords do not match.</p>
                    )}
                    {form.confirmPassword && form.password === form.confirmPassword && (
                      <p className="text-xs text-green-600">✓ Passwords match.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setModalMode(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium">Cancel</button>
              <button onClick={handleSave} className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition shadow-sm">
                {modalMode === "create" ? "Create People" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="font-bold text-gray-900 text-base mb-2">Delete People</h3>
            <p className="text-sm text-gray-600 mb-5">Are you sure you want to delete <strong>{deleteTarget.firstName} {deleteTarget.lastName}</strong>?</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteTarget(null)} className="px-5 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 font-medium">Cancel</button>
              <button onClick={() => { deleteUser(deleteTarget.id); setDeleteTarget(null); }} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
