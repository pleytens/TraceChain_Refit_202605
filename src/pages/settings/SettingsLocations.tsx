import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Check,
  ChevronDown,
  ChevronRight,
  MapPin,
  Building2,
  Layers,
  DoorOpen,
  AlertCircle,
  Search,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StorageRequirement {
  id: string;
  name: string;
  code: string;
  description: string;
  requires_cold_chain: boolean;
  requires_hazmat: boolean;
  is_active: boolean;
}

interface StorageRoom {
  id: string;
  location_id: string;
  building: string;
  floor: string;
  room: string;
  storage_requirement_id: string | null;
  notes: string;
  is_active: boolean;
  created_at: string;
}

interface Location {
  id: string;
  name: string;
  street_address: string;
  city: string;
  postal_code: string;
  country: string;
  notes: string;
  is_active: boolean;
  created_at: string;
  rooms?: StorageRoom[];
}

const EMPTY_LOCATION: Omit<Location, "id" | "created_at"> = {
  name: "",
  street_address: "",
  city: "",
  postal_code: "",
  country: "",
  notes: "",
  is_active: true,
};

const EMPTY_ROOM: Omit<StorageRoom, "id" | "location_id" | "created_at"> = {
  building: "",
  floor: "",
  room: "",
  storage_requirement_id: null,
  notes: "",
  is_active: true,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAddress(loc: Location) {
  const parts = [loc.street_address, loc.city, loc.postal_code, loc.country].filter(Boolean);
  return parts.join(", ") || "No address";
}

function roomLabel(r: StorageRoom) {
  const parts = [r.building, r.floor, r.room].filter(Boolean);
  return parts.join(" › ") || "Unnamed room";
}

// ─── Main Component ───────────────────────────────────────────────────────────

const SettingsLocations: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [storageRequirements, setStorageRequirements] = useState<StorageRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Expanded accordion state: locationId → boolean
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Modal state
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<StorageRoom | null>(null);
  const [roomLocationId, setRoomLocationId] = useState<string>("");

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "location" | "room"; id: string; name: string } | null>(null);

  // ─── Load ──────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [{ data: locs, error: le }, { data: rooms, error: re }, { data: reqs, error: reqe }] =
        await Promise.all([
          supabase.from("tc_locations").select("*").order("name"),
          supabase.from("tc_storage_rooms").select("*").order("building").order("floor").order("room"),
          supabase.from("tc_storage_requirements").select("*").eq("is_active", true).order("name"),
        ]);
      if (le) throw new Error(le.message);
      if (re) throw new Error(re.message);
      if (reqe) throw new Error(reqe.message);

      const roomsByLoc: Record<string, StorageRoom[]> = {};
      (rooms ?? []).forEach((r) => {
        if (!roomsByLoc[r.location_id]) roomsByLoc[r.location_id] = [];
        roomsByLoc[r.location_id].push(r as StorageRoom);
      });

      const result: Location[] = (locs ?? []).map((l) => ({
        ...(l as Location),
        rooms: roomsByLoc[l.id] ?? [],
      }));
      setLocations(result);
      setStorageRequirements((reqs ?? []) as StorageRequirement[]);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ─── Filtered ──────────────────────────────────────────────────────────────

  const filtered = locations.filter((l) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      l.name.toLowerCase().includes(q) ||
      l.city.toLowerCase().includes(q) ||
      l.country.toLowerCase().includes(q) ||
      (l.rooms ?? []).some(
        (r) =>
          r.building.toLowerCase().includes(q) ||
          r.floor.toLowerCase().includes(q) ||
          r.room.toLowerCase().includes(q)
      )
    );
  });

  // Helper to get requirement by id
  const reqById = (id: string | null) =>
    storageRequirements.find((r) => r.id === id) ?? null;

  // ─── Location CRUD ─────────────────────────────────────────────────────────

  const handleSaveLocation = async (data: typeof EMPTY_LOCATION, id?: string) => {
    if (!data.name.trim()) return "Location name is required.";
    const payload = { ...data, updated_at: new Date().toISOString() };
    if (id) {
      const { error: e } = await supabase.from("tc_locations").update(payload).eq("id", id);
      if (e) return e.message;
    } else {
      const newId = crypto.randomUUID();
      const { error: e } = await supabase.from("tc_locations").insert({ ...payload, id: newId });
      if (e) return e.message;
    }
    await load();
    return null;
  };

  const handleDeleteLocation = async (id: string) => {
    const { error: e } = await supabase.from("tc_locations").delete().eq("id", id);
    if (e) { setError(e.message); return; }
    await load();
    setDeleteConfirm(null);
  };

  // ─── Room CRUD ─────────────────────────────────────────────────────────────

  const handleSaveRoom = async (
    data: typeof EMPTY_ROOM,
    locationId: string,
    id?: string
  ) => {
    const payload = {
      ...data,
      location_id: locationId,
      storage_requirement_id: data.storage_requirement_id || null,
      updated_at: new Date().toISOString(),
    };
    if (id) {
      const { error: e } = await supabase.from("tc_storage_rooms").update(payload).eq("id", id);
      if (e) return e.message;
    } else {
      const newId = crypto.randomUUID();
      const { error: e } = await supabase.from("tc_storage_rooms").insert({ ...payload, id: newId });
      if (e) return e.message;
    }
    await load();
    return null;
  };

  const handleDeleteRoom = async (id: string) => {
    const { error: e } = await supabase.from("tc_storage_rooms").delete().eq("id", id);
    if (e) { setError(e.message); return; }
    await load();
    setDeleteConfirm(null);
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Locations</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage warehouse addresses and their storage rooms (Building → Floor → Room)
          </p>
        </div>
        <button
          onClick={() => { setEditingLocation(null); setShowLocationModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm"
        >
          <Plus size={16} />
          Add Location
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search locations or rooms…"
          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mr-3" />
          Loading locations…
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
          <MapPin size={40} className="mb-3 text-gray-300" />
          <p className="font-medium text-gray-500">No locations found</p>
          <p className="text-sm mt-1">
            {search ? "Try a different search term" : 'Click "Add Location" to get started'}
          </p>
        </div>
      )}

      {/* Location list */}
      {!loading && filtered.map((loc) => (
        <div key={loc.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Location header row */}
          <div className="flex items-center gap-3 px-5 py-4">
            <button
              onClick={() => setExpanded((p) => ({ ...p, [loc.id]: !p[loc.id] }))}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition"
            >
              {expanded[loc.id]
                ? <ChevronDown size={18} />
                : <ChevronRight size={18} />
              }
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <MapPin size={15} className="text-blue-500 flex-shrink-0" />
                <span className="font-semibold text-gray-900 truncate">{loc.name}</span>
                {!loc.is_active && (
                  <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-medium">
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5 pl-5 truncate">{formatAddress(loc)}</p>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-xs text-gray-400 mr-2">
                {(loc.rooms ?? []).length} room{(loc.rooms ?? []).length !== 1 ? "s" : ""}
              </span>
              <button
                onClick={() => {
                  setRoomLocationId(loc.id);
                  setEditingRoom(null);
                  setShowRoomModal(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                title="Add room"
              >
                <Plus size={12} /> Room
              </button>
              <button
                onClick={() => { setEditingLocation(loc); setShowLocationModal(true); }}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                title="Edit location"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => setDeleteConfirm({ type: "location", id: loc.id, name: loc.name })}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Delete location"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Rooms accordion */}
          {expanded[loc.id] && (
            <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-3 space-y-2">
              {(loc.rooms ?? []).length === 0 ? (
                <p className="text-xs text-gray-400 italic py-2">
                  No storage rooms yet. Click "+ Room" to add one.
                </p>
              ) : (
                (loc.rooms ?? []).map((room) => {
                  const req = reqById(room.storage_requirement_id);
                  return (
                    <div
                      key={room.id}
                      className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 px-4 py-2.5"
                    >
                      <div className="flex items-center gap-1.5 text-gray-400 flex-shrink-0">
                        {room.building && <span className="flex items-center gap-1 text-xs"><Building2 size={12} />{room.building}</span>}
                        {room.floor && <span className="flex items-center gap-1 text-xs"><Layers size={12} />{room.floor}</span>}
                        {room.room && <span className="flex items-center gap-1 text-xs"><DoorOpen size={12} />{room.room}</span>}
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-800">{roomLabel(room)}</span>
                        {req && (
                          <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            req.requires_cold_chain
                              ? "bg-blue-50 text-blue-600"
                              : req.requires_hazmat
                              ? "bg-red-50 text-red-600"
                              : "bg-green-50 text-green-600"
                          }`}>
                            {req.name}
                          </span>
                        )}
                        {!room.is_active && (
                          <span className="ml-1 text-[10px] px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full font-medium">
                            Inactive
                          </span>
                        )}
                        {room.notes && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{room.notes}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => {
                            setRoomLocationId(loc.id);
                            setEditingRoom(room);
                            setShowRoomModal(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit room"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirm({ type: "room", id: room.id, name: roomLabel(room) })
                          }
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete room"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      ))}

      {/* ── Location Modal ── */}
      {showLocationModal && (
        <LocationModal
          initial={editingLocation}
          onSave={handleSaveLocation}
          onClose={() => setShowLocationModal(false)}
        />
      )}

      {/* ── Room Modal ── */}
      {showRoomModal && (
        <RoomModal
          initial={editingRoom}
          locationId={roomLocationId}
          storageRequirements={storageRequirements}
          onSave={handleSaveRoom}
          onClose={() => setShowRoomModal(false)}
        />
      )}

      {/* ── Delete confirm ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Trash2 size={18} className="text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Delete {deleteConfirm.type}?</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  "<span className="font-medium">{deleteConfirm.name}</span>"{" "}
                  {deleteConfirm.type === "location" && "and all its rooms"} will be permanently removed.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  deleteConfirm.type === "location"
                    ? handleDeleteLocation(deleteConfirm.id)
                    : handleDeleteRoom(deleteConfirm.id)
                }
                className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Location Modal ───────────────────────────────────────────────────────────

interface LocationModalProps {
  initial: Location | null;
  onSave: (data: typeof EMPTY_LOCATION, id?: string) => Promise<string | null>;
  onClose: () => void;
}

const LocationModal: React.FC<LocationModalProps> = ({ initial, onSave, onClose }) => {
  const [form, setForm] = useState<typeof EMPTY_LOCATION>(
    initial
      ? {
          name: initial.name,
          street_address: initial.street_address,
          city: initial.city,
          postal_code: initial.postal_code,
          country: initial.country,
          notes: initial.notes,
          is_active: initial.is_active,
        }
      : { ...EMPTY_LOCATION }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof EMPTY_LOCATION, v: string | boolean) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    setSaving(true);
    setError("");
    const err = await onSave(form, initial?.id);
    setSaving(false);
    if (err) { setError(err); return; }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {initial ? "Edit Location" : "Add Location"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Warehouse address</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><X size={20} /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle size={14} />{error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Location Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Main Warehouse"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Street Address</label>
            <input
              type="text"
              value={form.street_address}
              onChange={(e) => set("street_address", e.target.value)}
              placeholder="e.g. 12 Industrial Road"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="City"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Postal Code</label>
              <input
                type="text"
                value={form.postal_code}
                onChange={(e) => set("postal_code", e.target.value)}
                placeholder="00000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Country</label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
                placeholder="Country"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={2}
              placeholder="Optional notes"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => set("is_active", e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Active</span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check size={14} />
            )}
            {initial ? "Save Changes" : "Add Location"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Room Modal ───────────────────────────────────────────────────────────────

interface RoomModalProps {
  initial: StorageRoom | null;
  locationId: string;
  storageRequirements: StorageRequirement[];
  onSave: (data: typeof EMPTY_ROOM, locationId: string, id?: string) => Promise<string | null>;
  onClose: () => void;
}

const RoomModal: React.FC<RoomModalProps> = ({ initial, locationId, storageRequirements, onSave, onClose }) => {
  const [form, setForm] = useState<typeof EMPTY_ROOM>(
    initial
      ? {
          building: initial.building,
          floor: initial.floor,
          room: initial.room,
          storage_requirement_id: initial.storage_requirement_id,
          notes: initial.notes,
          is_active: initial.is_active,
        }
      : { ...EMPTY_ROOM }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof EMPTY_ROOM, v: string | boolean | null) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.room.trim()) { setError("Room name/number is required."); return; }
    setSaving(true);
    setError("");
    const err = await onSave(form, locationId, initial?.id);
    setSaving(false);
    if (err) { setError(err); return; }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {initial ? "Edit Storage Room" : "Add Storage Room"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Building → Floor → Room</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><X size={20} /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle size={14} />{error}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                <span className="flex items-center gap-1"><Building2 size={11} /> Building</span>
              </label>
              <input
                type="text"
                value={form.building}
                onChange={(e) => set("building", e.target.value)}
                placeholder="A / Block 1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                <span className="flex items-center gap-1"><Layers size={11} /> Floor</span>
              </label>
              <input
                type="text"
                value={form.floor}
                onChange={(e) => set("floor", e.target.value)}
                placeholder="Ground / 1F"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                <span className="flex items-center gap-1"><DoorOpen size={11} /> Room <span className="text-red-500">*</span></span>
              </label>
              <input
                type="text"
                value={form.room}
                onChange={(e) => { set("room", e.target.value); setError(""); }}
                placeholder="Cold Room 1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Storage Requirement</label>
            <select
              value={form.storage_requirement_id ?? ""}
              onChange={(e) => set("storage_requirement_id", e.target.value || null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
            >
              <option value="">— None —</option>
              {storageRequirements.map((req) => (
                <option key={req.id} value={req.id}>
                  {req.name}{req.description ? ` — ${req.description.slice(0, 40)}` : ""}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Storage requirements are managed at the system level (Ambient, Chilled, Frozen, etc.)
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={2}
              placeholder="Optional notes"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => set("is_active", e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Active</span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check size={14} />
            )}
            {initial ? "Save Changes" : "Add Room"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsLocations;
