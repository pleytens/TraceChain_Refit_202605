import React, { useState } from "react";
import { Users, Clock, MapPin, CheckCircle2 } from "lucide-react";
import PeopleSelector from "@/components/people/PeopleSelector";
import LocationSelector, { validateLocationTypes } from "@/components/locations/LocationSelector";
import type { ActionAttributes, WorkerOption, LocationType, WhereLocations, WhereAttribute } from "@/types/attribute";

interface Props {
  attributes: ActionAttributes;
  onChange: (attrs: ActionAttributes) => void;
  disabled?: boolean;
}

type AttributeSection = "who" | "when" | "where";

const AttributeStep: React.FC<Props> = ({ attributes, onChange, disabled = false }) => {
  // "yes" | "no" | null for each section (null = not answered)
  const [whoAnswer,  setWhoAnswer]  = useState<"yes" | "no" | null>(attributes.who  ? "yes" : null);
  const [whenAnswer, setWhenAnswer] = useState<"yes" | "no" | null>(attributes.when ? "yes" : null);

  // --- WHO ---
  const handleWhoYes = () => {
    setWhoAnswer("yes");
    if (!attributes.who) onChange({ ...attributes, who: { workerIds: [] } });
  };
  const handleWhoNo = () => {
    setWhoAnswer("no");
    const { who: _removed, ...rest } = attributes;
    onChange(rest);
  };
  const handleWorkersChange = (ids: string[], workers: WorkerOption[]) => {
    onChange({ ...attributes, who: { workerIds: ids, workerNames: workers.map((w) => w.name) } });
  };

  // --- WHEN ---
  const handleWhenYes = () => {
    setWhenAnswer("yes");
    if (!attributes.when) {
      const now = new Date().toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"
      onChange({ ...attributes, when: { startDateTime: now } });
    }
  };
  const handleWhenNo = () => {
    setWhenAnswer("no");
    const { when: _removed, ...rest } = attributes;
    onChange(rest);
  };
  const handleWhenChange = (field: "startDateTime" | "endDateTime", val: string) => {
    onChange({ ...attributes, when: { ...(attributes.when ?? {}), [field]: val || undefined } });
  };

  // Compute duration display
  const duration = (() => {
    const start = attributes.when?.startDateTime;
    const end   = attributes.when?.endDateTime;
    if (!start || !end) return null;
    const diff = new Date(end).getTime() - new Date(start).getTime();
    if (diff < 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  })();

  const dateTimeError =
    attributes.when?.startDateTime &&
    attributes.when?.endDateTime &&
    new Date(attributes.when.endDateTime) < new Date(attributes.when.startDateTime)
      ? "End date/time must be after start date/time."
      : null;

  // --- WHERE ---
  // Multi-type state: derive from attributes.whereTypes / attributes.whereLocations
  const [whereAnswer, setWhereAnswer] = useState<"yes" | "no" | null>(
    attributes.whereTypes ? "yes" : attributes.where ? "yes" : null
  );

  const selectedTypes: LocationType[] = attributes.whereTypes ?? (attributes.where ? [attributes.where.type] : []);
  const whereLocations: WhereLocations = attributes.whereLocations ?? {};

  const handleWhereYes = () => {
    setWhereAnswer("yes");
    if (!attributes.whereTypes && !attributes.where) {
      onChange({ ...attributes, whereTypes: [], whereLocations: {} });
    }
  };
  const handleWhereNo = () => {
    setWhereAnswer("no");
    const { where: _w, whereTypes: _wt, whereLocations: _wl, ...rest } = attributes;
    onChange(rest);
  };

  const handleTypesChange = (types: LocationType[]) => {
    onChange({ ...attributes, whereTypes: types });
  };

  const handleLocationChange = (type: LocationType, attr: WhereAttribute | null) => {
    const current = attributes.whereLocations ?? {};
    if (!attr) {
      const { [type]: _removed, ...rest } = current;
      onChange({ ...attributes, whereLocations: rest });
    } else {
      onChange({ ...attributes, whereLocations: { ...current, [type]: attr } });
    }
  };

  const whereTypeError = validateLocationTypes(selectedTypes);
  const whereIsValid = whereAnswer !== "yes" || (selectedTypes.length > 0 && !whereTypeError);

  const renderYesNo = (
    section: AttributeSection,
    answer: "yes" | "no" | null,
    onYes: () => void,
    onNo: () => void
  ) => (
    <div className="flex gap-3">
      <button
        type="button"
        disabled={disabled}
        onClick={onYes}
        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition ${
          answer === "yes"
            ? "bg-blue-600 border-blue-600 text-white"
            : "bg-white border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600"
        } disabled:opacity-50`}
      >
        ✓ Yes
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onNo}
        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition ${
          answer === "no"
            ? "bg-gray-700 border-gray-700 text-white"
            : "bg-white border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-700"
        } disabled:opacity-50`}
      >
        ✗ No
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* ── WHO ─────────────────────────────────────────────────────── */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 bg-gray-50">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${whoAnswer === "yes" ? "bg-blue-600" : "bg-gray-200"}`}>
            <Users size={15} className={whoAnswer === "yes" ? "text-white" : "text-gray-500"} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">Who performed this action?</p>
            <p className="text-xs text-gray-500">Add dedicated workers as operators for this action.</p>
          </div>
          {whoAnswer !== null && (
            <CheckCircle2 size={16} className={whoAnswer === "yes" ? "text-blue-500" : "text-gray-300"} />
          )}
        </div>

        <div className="px-5 py-4 space-y-4">
          {renderYesNo("who", whoAnswer, handleWhoYes, handleWhoNo)}

          {whoAnswer === "yes" && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Select Workers <span className="text-red-500">*</span>
              </label>
              <PeopleSelector
                selectedIds={attributes.who?.workerIds ?? []}
                onChange={handleWorkersChange}
                disabled={disabled}
              />
              {attributes.who?.workerIds.length === 0 && (
                <p className="text-xs text-red-500 mt-1">Please select at least one worker.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── WHEN ─────────────────────────────────────────────────────── */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 bg-gray-50">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${whenAnswer === "yes" ? "bg-blue-600" : "bg-gray-200"}`}>
            <Clock size={15} className={whenAnswer === "yes" ? "text-white" : "text-gray-500"} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">When did this happen?</p>
            <p className="text-xs text-gray-500">Add start and/or finish timestamps for this action.</p>
          </div>
          {whenAnswer !== null && (
            <CheckCircle2 size={16} className={whenAnswer === "yes" ? "text-blue-500" : "text-gray-300"} />
          )}
        </div>

        <div className="px-5 py-4 space-y-4">
          {renderYesNo("when", whenAnswer, handleWhenYes, handleWhenNo)}

          {whenAnswer === "yes" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Start Date / Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  disabled={disabled}
                  value={attributes.when?.startDateTime ?? ""}
                  onChange={(e) => handleWhenChange("startDateTime", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  End Date / Time{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="datetime-local"
                  disabled={disabled}
                  value={attributes.when?.endDateTime ?? ""}
                  onChange={(e) => handleWhenChange("endDateTime", e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400 ${dateTimeError ? "border-red-400" : "border-gray-300"}`}
                />
                {dateTimeError && <p className="text-xs text-red-500 mt-1">{dateTimeError}</p>}
              </div>

              {duration && (
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                  <Clock size={12} />
                  <span>Duration: <strong className="text-gray-700">{duration}</strong></span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── WHERE ─────────────────────────────────────────────────────── */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 bg-gray-50">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${whereAnswer === "yes" ? (whereIsValid ? "bg-blue-600" : "bg-amber-500") : "bg-gray-200"}`}>
            <MapPin size={15} className={whereAnswer === "yes" ? "text-white" : "text-gray-500"} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">Where did this happen?</p>
            <p className="text-xs text-gray-500">
              Select location types. If <strong>From</strong> is selected, <strong>To</strong> is mandatory.{" "}
              <strong>At</strong> can be used alone.
            </p>
          </div>
          {whereAnswer !== null && (
            <CheckCircle2 size={16} className={whereAnswer === "yes" && whereIsValid ? "text-blue-500" : "text-gray-300"} />
          )}
        </div>

        <div className="px-5 py-4 space-y-4">
          {renderYesNo("where", whereAnswer, handleWhereYes, handleWhereNo)}

          {whereAnswer === "yes" && (
            <LocationSelector
              mode="multi"
              selectedTypes={selectedTypes}
              onTypesChange={handleTypesChange}
              locations={whereLocations}
              onLocationChange={handleLocationChange}
              disabled={disabled}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AttributeStep;
