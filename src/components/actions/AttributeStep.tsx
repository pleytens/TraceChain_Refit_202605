import React from "react";
import { Users, Clock, Package, MapPin, CheckCircle2 } from "lucide-react";
import type { ActionAttributes } from "@/types/attribute";

interface Props {
  attributes: ActionAttributes;
  onChange: (attrs: ActionAttributes) => void;
  disabled?: boolean;
}

interface AttributeCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onEnable: () => void;
  onDisable: () => void;
  disabled?: boolean;
}

const AttributeCard: React.FC<AttributeCardProps> = ({
  icon,
  title,
  description,
  enabled,
  onEnable,
  onDisable,
  disabled = false,
}) => (
  <div
    className={`border-2 rounded-xl overflow-hidden transition-all ${
      enabled ? "border-blue-500 bg-blue-50/40" : "border-gray-200 bg-white"
    }`}
  >
    <div className="flex items-center gap-3 px-5 py-3">
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
          enabled ? "bg-blue-600" : "bg-gray-100"
        }`}
      >
        <span className={enabled ? "text-white" : "text-gray-400"}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <CheckCircle2
        size={16}
        className={enabled ? "text-blue-500" : "text-gray-200"}
      />
    </div>

    <div className="px-5 pb-3">
      <div className="flex gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={onEnable}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition ${
            enabled
              ? "bg-blue-600 border-blue-600 text-white"
              : "bg-white border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600"
          } disabled:opacity-50`}
        >
          ✓ Yes
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onDisable}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition ${
            !enabled
              ? "bg-gray-600 border-gray-600 text-white"
              : "bg-white border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-700"
          } disabled:opacity-50`}
        >
          ✗ No
        </button>
      </div>
    </div>
  </div>
);

const AttributeStep: React.FC<Props> = ({
  attributes,
  onChange,
  disabled = false,
}) => {
  const flags = attributes.flags ?? {
    who: false,
    when: false,
    what: false,
    where: false,
  };

  const setFlag = (key: "who" | "when" | "what" | "where", value: boolean) => {
    onChange({
      ...attributes,
      flags: { ...flags, [key]: value },
    });
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-700">
          ℹ️ Select which attributes are needed for this action. Actual details
          (workers, dates, materials, locations) will be collected later during{" "}
          <strong>Recording</strong>.
        </p>
      </div>

      <AttributeCard
        icon={<Users size={16} />}
        title="Who"
        description="Dedicated workers / operators performed this action."
        enabled={flags.who}
        onEnable={() => setFlag("who", true)}
        onDisable={() => setFlag("who", false)}
        disabled={disabled}
      />

      <AttributeCard
        icon={<Clock size={16} />}
        title="When"
        description="Start / end timestamps for this action."
        enabled={flags.when}
        onEnable={() => setFlag("when", true)}
        onDisable={() => setFlag("when", false)}
        disabled={disabled}
      />

      <AttributeCard
        icon={<Package size={16} />}
        title="What"
        description="Materials or products involved in this action."
        enabled={flags.what}
        onEnable={() => setFlag("what", true)}
        onDisable={() => setFlag("what", false)}
        disabled={disabled}
      />

      <AttributeCard
        icon={<MapPin size={16} />}
        title="Where"
        description="Location details — from, at, or to a specific place."
        enabled={flags.where}
        onEnable={() => setFlag("where", true)}
        onDisable={() => setFlag("where", false)}
        disabled={disabled}
      />
    </div>
  );
};

export default AttributeStep;
