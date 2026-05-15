import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "TraceChainAdminPortalAdmin" | "TraceChainClientPortalAdmin" | "SuperAdmin" | "Admin" | "User" | "User-Worker" | "Worker" | "Role1" | "Role2" | "Role3";

export type Portal = "admin" | "client";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: "Active" | "Inactive";
  phone?: string;
  createdAt: string;
  portal: Portal;
  notificationsEnabled?: boolean;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: string;
  field: string;
  oldValue?: string;
  newValue?: string;
  portal: Portal;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "file_shared" | "user_created" | "process_updated" | "info";
  targetId?: string;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  activePortal: Portal | null;
  login: (email: string, password: string, portal: Portal) => { success: boolean; error?: string };
  logout: () => void;
  getUsers: (portal: Portal) => AuthUser[];
  addUser: (user: Omit<AuthUser, "id" | "createdAt">, password: string) => { success: boolean; error?: string };
  updateUser: (id: string, updates: Partial<AuthUser>) => void;
  updatePassword: (id: string, newPassword: string) => void;
  getPassword: (id: string) => string;
  deleteUser: (id: string) => void;
  getAuditLog: (portal: Portal) => AuditEntry[];
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  unreadCount: number;
}

// ── Initial seed data ───────────────────────────────────────────────────────

const initialUsers: AuthUser[] = [
  // TraceChain Admin Portal users
  {
    id: "admin-1",
    email: "admin@traceverified.com",
    firstName: "Admin",
    lastName: "",
    role: "TraceChainAdminPortalAdmin",
    status: "Active",
    createdAt: "2024-01-01T00:00:00Z",
    portal: "admin",
    notificationsEnabled: true,
  },
  {
    id: "admin-2",
    email: "manager@traceverified.com",
    firstName: "John",
    lastName: "Manager",
    role: "Role1",
    status: "Active",
    createdAt: "2024-01-02T00:00:00Z",
    portal: "admin",
    notificationsEnabled: true,
  },
  // TraceChain Client Portal users
  {
    id: "client-1",
    email: "superadmin@client.com",
    firstName: "Super",
    lastName: "Admin",
    role: "SuperAdmin",
    status: "Active",
    createdAt: "2024-01-01T00:00:00Z",
    portal: "client",
    notificationsEnabled: true,
  },
  {
    id: "client-sa2",
    email: "superadmin2@client.com",
    firstName: "Sarah",
    lastName: "SuperAdmin",
    role: "SuperAdmin",
    status: "Active",
    createdAt: "2024-01-01T00:00:00Z",
    portal: "client",
    notificationsEnabled: true,
  },
  {
    id: "client-admin",
    email: "admin@client.com",
    firstName: "Client",
    lastName: "Admin",
    role: "Admin",
    status: "Active",
    createdAt: "2024-01-01T00:00:00Z",
    portal: "client",
    notificationsEnabled: true,
  },
  {
    id: "client-2",
    email: "user@client.com",
    firstName: "Demo",
    lastName: "User",
    role: "User",
    status: "Active",
    createdAt: "2024-01-02T00:00:00Z",
    portal: "client",
    notificationsEnabled: true,
  },
];

const initialPasswords: Record<string, string> = {
  "admin-1": "TCpassword",
  "admin-2": "TCpassword",
  "client-1": "TCpassword",
  "client-sa2": "TCpassword",
  "client-admin": "TCpassword",
  "client-2": "TCpassword",
};

const initialNotifications: Notification[] = [
  {
    id: "notif-1",
    title: "File Shared With You",
    message: "Green Farm Co. shared a traceability report with you.",
    timestamp: "2024-04-24T09:15:00Z",
    read: false,
    type: "file_shared",
    targetId: "recording",
  },
  {
    id: "notif-2",
    title: "New User Created",
    message: "A new user 'Demo User' has been added to your portal.",
    timestamp: "2024-04-23T14:30:00Z",
    read: false,
    type: "user_created",
    targetId: "users",
  },
  {
    id: "notif-3",
    title: "Process Updated",
    message: "The process 'Mango Traceability v2' was updated by Admin.",
    timestamp: "2024-04-22T11:00:00Z",
    read: false,
    type: "process_updated",
    targetId: "settings-processes",
  },
  {
    id: "notif-4",
    title: "File Shared With You",
    message: "Mekong Fish Ltd. shared a new product document.",
    timestamp: "2024-04-21T08:45:00Z",
    read: true,
    type: "file_shared",
  },
  {
    id: "notif-5",
    title: "System Info",
    message: "Your subscription renews in 30 days. Please review your plan.",
    timestamp: "2024-04-20T16:00:00Z",
    read: true,
    type: "info",
  },
];

// ── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [activePortal, setActivePortal] = useState<Portal | null>(null);
  const [users, setUsers] = useState<AuthUser[]>(initialUsers);
  const [passwords, setPasswords] = useState<Record<string, string>>(initialPasswords);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const addAuditEntry = (entry: Omit<AuditEntry, "id" | "timestamp">) => {
    setAuditLog((prev) => [
      {
        ...entry,
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const login = (
    email: string,
    password: string,
    portal: Portal
  ): { success: boolean; error?: string } => {
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.portal === portal
    );
    if (!user) return { success: false, error: "No account found with this email address in this portal." };
    if (user.role === "Worker") return { success: false, error: "Workers cannot log in to the system." };
    if (user.status === "Inactive") return { success: false, error: "This account is inactive. Contact your administrator." };
    if (passwords[user.id] !== password) return { success: false, error: "Incorrect password. Please try again." };
    setCurrentUser(user);
    setActivePortal(portal);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    setActivePortal(null);
  };

  const getUsers = (portal: Portal) => users.filter((u) => u.portal === portal);

  const getAuditLog = (portal: Portal) => auditLog.filter((e) => e.portal === portal);

  const addUser = (
    userData: Omit<AuthUser, "id" | "createdAt">,
    password: string
  ): { success: boolean; error?: string } => {
    const isWorker = userData.role === "Worker";
    // For non-workers, check email uniqueness
    if (
      !isWorker &&
      users.find(
        (u) =>
          u.email.toLowerCase() === userData.email.toLowerCase() &&
          u.portal === userData.portal
      )
    ) {
      return { success: false, error: "A user with this email already exists in this portal." };
    }
    const newUser: AuthUser = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    if (!isWorker) {
      setPasswords((prev) => ({ ...prev, [newUser.id]: password }));
    }
    if (currentUser) {
      addAuditEntry({
        userId: currentUser.id,
        userEmail: currentUser.email,
        action: "CREATE_USER",
        field: "User",
        newValue: newUser.email,
        portal: newUser.portal,
      });
    }
    return { success: true };
  };

  const updateUser = (id: string, updates: Partial<AuthUser>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        const updated = { ...u, ...updates };
        if (currentUser) {
          Object.keys(updates).forEach((key) => {
            const k = key as keyof AuthUser;
            if (u[k] !== updates[k]) {
              addAuditEntry({
                userId: currentUser.id,
                userEmail: currentUser.email,
                action: "UPDATE_USER",
                field: key,
                oldValue: String(u[k] ?? ""),
                newValue: String(updates[k] ?? ""),
                portal: u.portal,
              });
            }
          });
        }
        return updated;
      })
    );
    if (currentUser?.id === id) {
      setCurrentUser((prev) => (prev ? { ...prev, ...updates } : prev));
    }
  };

  const updatePassword = (id: string, newPassword: string) => {
    setPasswords((prev) => ({ ...prev, [id]: newPassword }));
  };

  const getPassword = (id: string): string => {
    return passwords[id] ?? "";
  };

  const deleteUser = (id: string) => {
    const user = users.find((u) => u.id === id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setPasswords((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (currentUser && user) {
      addAuditEntry({
        userId: currentUser.id,
        userEmail: currentUser.email,
        action: "DELETE_USER",
        field: "User",
        oldValue: user.email,
        portal: user.portal,
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        activePortal,
        login,
        logout,
        getUsers,
        addUser,
        updateUser,
        updatePassword,
        getPassword,
        deleteUser,
        getAuditLog,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        unreadCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
