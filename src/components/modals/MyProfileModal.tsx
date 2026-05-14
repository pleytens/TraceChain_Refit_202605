import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

// ── Password strength rules ────────────────────────────────────────────────

const pwRules = [
  { label: "At least 6 characters", test: (p: string) => p.length >= 6 },
  { label: "Maximum 12 characters", test: (p: string) => p.length <= 12 && p.length > 0 },
  { label: "Contains a capital letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Contains a number", test: (p: string) => /[0-9]/.test(p) },
];

// ── Phone country codes (abbreviated list) ────────────────────────────────

const countryCodes = [
  { flag: "🇦🇺", code: "+61", name: "Australia" },
  { flag: "🇰🇭", code: "+855", name: "Cambodia" },
  { flag: "🇨🇳", code: "+86", name: "China" },
  { flag: "🇫🇷", code: "+33", name: "France" },
  { flag: "🇩🇪", code: "+49", name: "Germany" },
  { flag: "🇮🇳", code: "+91", name: "India" },
  { flag: "🇯🇵", code: "+81", name: "Japan" },
  { flag: "🇰🇷", code: "+82", name: "Korea" },
  { flag: "🇬🇧", code: "+44", name: "UK" },
  { flag: "🇺🇸", code: "+1", name: "USA" },
  { flag: "🇻🇳", code: "+84", name: "Vietnam" },
];

interface Props {
  onClose: () => void;
}

const MyProfileModal: React.FC<Props> = ({ onClose }) => {
  const { currentUser, updateUser, updatePassword, getPassword } = useAuth();

  const [firstName, setFirstName] = useState(currentUser?.firstName ?? "");
  const [lastName, setLastName] = useState(currentUser?.lastName ?? "");
  const [email, setEmail] = useState(currentUser?.email ?? "");
  const [countryCode, setCountryCode] = useState("+1");
  const [phone, setPhone] = useState(currentUser?.phone ?? "");
  const [password, setPassword] = useState(getPassword(currentUser?.id ?? ""));
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const role = currentUser?.role ?? "";

  // Which fields are editable depends on role
  const isUser = role === "User";
  // Users can only edit firstName, lastName, phone, password
  // Admin & SuperAdmin can edit everything (they edit themselves here)

  const validate = () => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = "First name is required";
    if (firstName.length > 25) e.firstName = "Max 25 characters";
    if (lastName.length > 25) e.lastName = "Max 25 characters";
    if (!email.trim()) e.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(email)) e.email = "Invalid email";
    if (!password) e.password = "Password is required";
    const allPwOk = pwRules.every((r) => r.test(password));
    if (!allPwOk) e.password = "Password does not meet requirements";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    if (!currentUser) return;
    updateUser(currentUser.id, { firstName, lastName, email, phone: `${countryCode} ${phone}` });
    updatePassword(currentUser.id, password);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {firstName[0]?.toUpperCase()}{lastName[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">My Profile</h2>
              <p className="text-xs text-gray-500">Update your personal information</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl transition">✕</button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Role (read-only) */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Role</label>
            <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-700 font-medium">
              {role}
            </div>
          </div>

          {/* First Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => { setFirstName(e.target.value); setErrors((p) => ({ ...p, firstName: "" })); }}
              maxLength={25}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.firstName ? "border-red-400" : "border-gray-300"}`}
            />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => { setLastName(e.target.value); setErrors((p) => ({ ...p, lastName: "" })); }}
              maxLength={25}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.lastName ? "border-red-400" : "border-gray-300"}`}
            />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
              disabled={isUser}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? "border-red-400" : "border-gray-300"} ${isUser ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Mobile Phone */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Mobile Phone Number</label>
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {countryCodes.map((c) => (
                  <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                ))}
              </select>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 12);
                  setPhone(val);
                }}
                placeholder="Phone number"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
                className={`w-full border rounded-lg px-3 py-2 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? "border-red-400" : "border-gray-300"}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            {/* Password rules */}
            <ul className="mt-2 space-y-1">
              {pwRules.map((rule) => {
                const met = password ? rule.test(password) : false;
                return (
                  <li key={rule.label} className={`text-xs flex items-center gap-1.5 ${met ? "text-green-600" : "text-red-500"}`}>
                    <span>{met ? "✓" : "✗"}</span>
                    {rule.label}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition flex items-center gap-2"
          >
            {saved ? "✓ Saved!" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyProfileModal;
