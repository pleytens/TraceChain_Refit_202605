import React, { useState } from "react";
import { useAuth, UserRole } from "@/context/AuthContext";

const roleLabels: Record<UserRole, string> = {
  TraceChainAdminPortalAdmin: "Admin Portal Administrator",
  TraceChainCustomerPortalAdmin: "Customer Portal Administrator",
  SuperAdmin: "Super Admin",
  Admin: "Admin",
  User: "User",
  Role1: "Role 1",
  Role2: "Role 2",
  Role3: "Role 3",
};

const roleColors: Record<UserRole, string> = {
  TV2AdminPortalAdmin: "bg-purple-100 text-purple-700",
  TV2CustomerPortalAdmin: "bg-indigo-100 text-indigo-700",
  SuperAdmin: "bg-red-100 text-red-700",
  Admin: "bg-orange-100 text-orange-700",
  User: "bg-blue-100 text-blue-700",
  Role1: "bg-blue-100 text-blue-700",
  Role2: "bg-orange-100 text-orange-700",
  Role3: "bg-gray-100 text-gray-600",
};

const ProfileSettings: React.FC = () => {
  const { currentUser, updateUser } = useAuth();

  const [firstName, setFirstName] = useState(currentUser?.firstName ?? "");
  const [lastName, setLastName] = useState(currentUser?.lastName ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  if (!currentUser) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!firstName.trim()) {
      setError("First name is required.");
      return;
    }
    if (firstName.trim().length > 25) {
      setError("First name must be 25 characters or less.");
      return;
    }
    if (lastName.trim().length > 25) {
      setError("Last name must be 25 characters or less.");
      return;
    }
    updateUser(currentUser.id, { firstName: firstName.trim(), lastName: lastName.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-xl space-y-6">
      {/* Avatar + identity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-5 mb-5">
          {/* Avatar with initials */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-md select-none">
            {currentUser.firstName[0]?.toUpperCase() ?? ""}
            {currentUser.lastName[0]?.toUpperCase() ?? ""}
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {currentUser.firstName} {currentUser.lastName}
            </h2>
            <p className="text-sm text-gray-500">{currentUser.email}</p>
          </div>
        </div>

        {/* Role – read-only as required */}
        <div className="mb-5 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium">Your Role</p>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleColors[currentUser.role]}`}>
              {roleLabels[currentUser.role]}
            </span>
            <span className="text-xs text-gray-400">(read-only – managed by your administrator)</span>
          </div>
        </div>

        {/* Edit form */}
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-red-700 text-sm">
              ⚠ {error}
            </div>
          )}
          {saved && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-green-700 text-sm">
              ✓ Profile updated successfully.
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                maxLength={25}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400">{firstName.length}/25</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Last Name</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                maxLength={25}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400">{lastName.length}/25</p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Email Address</label>
            <input
              value={currentUser.email}
              disabled
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400">Email cannot be changed here.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Account Status</label>
            <input
              value={currentUser.status}
              disabled
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-400 bg-gray-50 cursor-not-allowed w-32"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
