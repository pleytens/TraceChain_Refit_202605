import React, { useState, useEffect } from "react";
import { ChevronDown, MapPin, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { LocationOption, StorageRoomOption, LocationType, WhereAttribute, WhereLocations } from "@/types/attribute";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface SingleProps {
  mode?: "single";
  locationType: LocationType;
  onLocationTypeChange: (t: LocationType) => void;
  selectedRoomId?: string;
  onRoomSelect: (room: StorageRoomOption | null) => void;
  materialStorageRequirementCode?: string;
  disabled?: boolean;
}

interface MultiProps {
  mode: "multi";
  selectedTypes: LocationType[];
  onTypesChange: (types: LocationType[]) => void;
  locations: WhereLocations;
  onLocationChange: (type: LocationType, attr: WhereAttribute | null) => void;
  materialStorageRequirementCode?: string;
  disabled?: boolean;
}

type Props = SingleProps | MultiProps;

// ─── Shared data loader ────────────────────────────────────────────────────────

function useLocationData() {
  const [locationOptions, setLocationOptions] = useState<LocationOption[]>([]);
  const [rooms, setRooms] = useState<StorageRoomOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    setLoading(true);
    Promise.all([
      supabase.from("tc_locations").select("id, name, street_address, city").eq("is_active", true).order("name"),
      supabase
        .from("tc_storage_rooms")
        .select("id, location_id, building, floor, room, storage_requirement_id, tc_storage_requirements(code, name)")
        .eq("is_active", true)
        .order("building")
        .order("floor")
        .order("room"),
    ]).then(([locRes, roomRes]) => {
      setLoading(false);
      if (!locRes.error && locRes.data) {
        setLocationOptions(
          locRes.data.map((l: any) => ({
            id: l.id,
            name: l.name,
            streetAddress: l.street_address,
            city: l.city,
          }))
        );
      }
      if (!roomRes.error && roomRes.data) {
        setRooms(
          roomRes.data.map((r: any) => ({
            id: r.id,
            locationId: r.location_id,
            building: r.building,
            floor: r.floor,
            room: r.room,
            storageRequirementId: r.storage_requirement_id,
            storageRequirementCode: r.tc_storage_requirements?.code,
            storageRequirementName: r.tc_storage_requirements?.name,
          }))
        );
      }
    });
  }, []);

  return { locationOptions, rooms, loading };
}

// ─── Room picker (shared) ──────────────────────────────────────────────────────

const RoomPicker: React.FC<{
  locationOptions: LocationOption[];
  rooms: StorageRoomOption[];
  selectedRoomId?: string;
  onRoomSelect: (room: StorageRoomOption | null) => void;
  materialStorageRequirementCode?: string;
  disabled?: boolean;
}> = ({ locationOptions, rooms, selectedRoomId, onRoomSelect, materialStorageRequirementCode, disabled }) => {
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");

  useEffect(() => {
    if (selectedRoomId && rooms.length > 0) {
      const room = rooms.find((r) => r.id === selectedRoomId);
      if (room) setSelectedLocationId(room.locationId);
    }
  }, [selectedRoomId, rooms]);

  const filteredRooms = rooms.filter((r) => r.locationId === selectedLocationId);
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
  const hasMismatch =
    !!materialStorageRequirementCode &&
    !!selectedRoom?.storageRequirementCode &&
    selectedRoom.storageRequirementCode !== materialStorageRequirementCode;

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          <MapPin size={12} className="inline mr-1" />
          Address / Warehouse
        </label>
        {locationOptions.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No locations configured.</p>
        ) : (
          <div className="relative">
            <select
              disabled={disabled}
              value={selectedLocationId}
              onChange={(e) => { setSelectedLocationId(e.target.value); onRoomSelect(null); }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8 disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">— Select address —</option>
              {locationOptions.map((l) => (
                <option key={l.id} value={l.id}>{l.name}{l.city ? ` · ${l.city}` : ""}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        )}
      </div>

      {selectedLocationId && (
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Room <span className="text-red-500">*</span>
          </label>
          {filteredRooms.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No rooms configured for this location.</p>
          ) : (
            <div className="relative">
              <select
                disabled={disabled}
                value={selectedRoomId ?? ""}
                onChange={(e) => { onRoomSelect(rooms.find((r) => r.id === e.target.value) ?? null); }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8 disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">— Select room —</option>
                {Array.from(new Set(filteredRooms.map((r) => r.building))).map((building) => (
                  <optgroup key={building} label={`Building: ${building}`}>
                    {Array.from(new Set(filteredRooms.filter((r) => r.building === building).map((r) => r.floor))).map((floor) => (
                      <React.Fragment key={`${building}-${floor}`}>
                        {filteredRooms.filter((r) => r.building === building && r.floor === floor).map((room) => (
                          <option key={room.id} value={room.id}>
                            Floor {floor} → {room.room}{room.storageRequirementName ? ` (${room.storageRequirementName})` : ""}
                          </option>
                        ))}
                      </React.Fragment>
                    ))}
                  </optgroup>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          )}
        </div>
      )}

      {selectedRoom && (
        <div className="bg-gray-50 rounded-lg px-4 py-3 text-xs space-y-1 border border-gray-200">
          <div className="flex items-center gap-2 font-medium text-gray-700">
            <MapPin size={12} className="text-blue-500" />
            {locationOptions.find((l) => l.id === selectedRoom.locationId)?.name}
            <span className="text-gray-400">→</span> Building {selectedRoom.building}
            <span className="text-gray-400">→</span> Floor {selectedRoom.floor}
            <span className="text-gray-400">→</span> {selectedRoom.room}
          </div>
          {selectedRoom.storageRequirementName && (
            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold">
              {selectedRoom.storageRequirementName}
            </span>
          )}
        </div>
      )}

      {hasMismatch && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-300 rounded-lg px-3 py-2.5 text-xs text-amber-800">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-500" />
          <span>
            <strong>Storage mismatch:</strong> Material requires <strong>{materialStorageRequirementCode}</strong> but selected room is{" "}
            <strong>{selectedRoom?.storageRequirementCode ?? "unknown"}</strong>. Proceeding may compromise product quality.
          </span>
        </div>
      )}
    </div>
  );
};

// ─── Validation ────────────────────────────────────────────────────────────────

export function validateLocationTypes(types: LocationType[]): string | null {
  const hasFrom = types.includes("from");
  const hasTo   = types.includes("to");
  if (types.length === 0) return null;
  if (hasFrom && !hasTo) return "'From' requires a 'To' location.";
  if (hasTo && !hasFrom) return "'To' requires a 'From' location.";
  return null;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const LOCATION_TYPE_OPTIONS: { value: LocationType; label: string; hint: string; color: string }[] = [
  { value: "from", label: "From", hint: "Where item is coming from",       color: "blue"   },
  { value: "at",   label: "At",   hint: "Where item is currently located", color: "green"  },
  { value: "to",   label: "To",   hint: "Where item is going to",          color: "purple" },
];

const BORDER_MAP: Record<string, string> = {
  blue:   "border-blue-400 bg-blue-50",
  green:  "border-green-400 bg-green-50",
  purple: "border-purple-400 bg-purple-50",
};
const BADGE_MAP: Record<string, string> = {
  blue:   "bg-blue-600 text-white",
  green:  "bg-green-600 text-white",
  purple: "bg-purple-600 text-white",
};

// ─── Main ──────────────────────────────────────────────────────────────────────

const LocationSelector: React.FC<Props> = (props) => {
  const { locationOptions, rooms, loading } = useLocationData();

  // ── SINGLE MODE (legacy) ────────────────────────────────────────────────────
  if (!props.mode || props.mode === "single") {
    const { locationType, onLocationTypeChange, selectedRoomId, onRoomSelect, materialStorageRequirementCode, disabled = false } = props as SingleProps;
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Location Type <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            {LOCATION_TYPE_OPTIONS.map((btn) => (
              <button key={btn.value} type="button" disabled={disabled} onClick={() => onLocationTypeChange(btn.value)} title={btn.hint}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold border transition ${
                  locationType === btn.value ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600"
                } disabled:opacity-50 disabled:cursor-not-allowed`}>
                {btn.label}
              </button>
            ))}
          </div>
        </div>
        {loading ? <div className="text-xs text-gray-400 py-2">Loading locations…</div> : (
          <RoomPicker locationOptions={locationOptions} rooms={rooms} selectedRoomId={selectedRoomId} onRoomSelect={onRoomSelect} materialStorageRequirementCode={materialStorageRequirementCode} disabled={disabled} />
        )}
      </div>
    );
  }

  // ── MULTI MODE ──────────────────────────────────────────────────────────────
  const { selectedTypes, onTypesChange, locations, onLocationChange, materialStorageRequirementCode, disabled = false } = props as MultiProps;

  const handleCheckbox = (type: LocationType, checked: boolean) => {
    let newTypes: LocationType[] = checked
      ? [...selectedTypes, type]
      : selectedTypes.filter((t) => t !== type);

    if (!checked) {
      // Auto-unselect "To" when "From" is unchecked
      if (type === "from" && selectedTypes.includes("to")) {
        newTypes = newTypes.filter((t) => t !== "to");
        onLocationChange("to", null);
        toast.info("'From' was unselected. 'To' was also unselected as they must be used together.");
      }
      // Auto-unselect "From" when "To" is unchecked
      else if (type === "to" && selectedTypes.includes("from")) {
        newTypes = newTypes.filter((t) => t !== "from");
        onLocationChange("from", null);
        toast.info("'To' was unselected. 'From' was also unselected as they must be used together.");
      }
      // Clear the location data for the directly unchecked type
      onLocationChange(type, null);
    }

    onTypesChange(newTypes);
  };

  return (
    <div className="space-y-4">
      {/* Checkbox group */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Location Type <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-400 mb-3">
          Select location types. If <strong>From</strong> is selected, <strong>To</strong> is mandatory. <strong>At</strong> can be used alone.
        </p>
        <div className="flex gap-3">
          {LOCATION_TYPE_OPTIONS.map((opt) => {
            const isChecked = selectedTypes.includes(opt.value);
            return (
              <label key={opt.value} title={opt.hint}
                className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition select-none ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${
                  isChecked ? BORDER_MAP[opt.color] : "border-gray-200 bg-white hover:border-gray-300"
                }`}>
                <input type="checkbox" disabled={disabled} checked={isChecked}
                  onChange={(e) => handleCheckbox(opt.value, e.target.checked)} className="hidden" />
                <span className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold border-2 transition ${
                  isChecked ? `${BADGE_MAP[opt.color]} border-transparent` : "border-gray-300 bg-white"
                }`}>
                  {isChecked ? "✓" : ""}
                </span>
                <span className="text-sm font-semibold text-gray-700">{opt.label}</span>
              </label>
            );
          })}
        </div>
        {/* Validation error is shown only on submit, not inline */}
      </div>

      {/* Per-type room pickers */}
      {loading ? (
        <div className="text-xs text-gray-400 py-2">Loading locations…</div>
      ) : (
        <div className="space-y-4">
          {LOCATION_TYPE_OPTIONS.filter((opt) => selectedTypes.includes(opt.value)).map((opt) => (
            <div key={opt.value} className={`border-2 rounded-xl p-4 ${BORDER_MAP[opt.color]}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${BADGE_MAP[opt.color]}`}>{opt.label}</span>
                <span className="text-xs text-gray-500">{opt.hint}</span>
              </div>
              <RoomPicker
                locationOptions={locationOptions} rooms={rooms}
                selectedRoomId={locations[opt.value]?.storageRoomId}
                onRoomSelect={(room) => {
                  if (!room) { onLocationChange(opt.value, null); return; }
                  onLocationChange(opt.value, {
                    type: opt.value,
                    storageRoomId: room.id,
                    building: room.building,
                    floor: room.floor,
                    room: room.room,
                    storageRequirementCode: room.storageRequirementCode,
                    storageRequirementName: room.storageRequirementName,
                  });
                }}
                materialStorageRequirementCode={materialStorageRequirementCode}
                disabled={disabled}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
