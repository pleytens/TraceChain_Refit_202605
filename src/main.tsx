import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { initDb } from "@/lib/dbInit";

// Initialise DB tables / seed data as soon as the app loads.
// This is a no-op when Supabase is not connected (falls back to localStorage).
initDb().catch((e) => console.warn("[dbInit] Unexpected error:", e));

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
