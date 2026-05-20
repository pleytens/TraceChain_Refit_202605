// Attribute type definitions for the Action Wizard
// WHO / WHEN / WHERE progressive disclosure attributes

export type AttributeType = "who" | "when" | "where";
export type LocationType = "from" | "at" | "to";

export interface WhoAttribute {
  workerIds: string[];
  workerNames?: string[]; // Resolved for display
}

export interface WhenAttribute {
  startDateTime?: string;   // ISO 8601
  endDateTime?: string;     // ISO 8601
}

export interface WhereAttribute {
  type: LocationType;
  locationId?: string;      // tc_locations.id
  storageRoomId?: string;   // tc_storage_rooms.id
  // Resolved display info
  locationName?: string;
  building?: string;
  floor?: string;
  room?: string;
  storageRequirementCode?: string;
  storageRequirementName?: string;
}

/** Per-type location entry for multi-type where */
export type WhereLocations = Partial<Record<LocationType, WhereAttribute>>;

/** Simple on/off flags — what data categories this action requires during Recording */
export interface ActionAttributeFlags {
  who: boolean;
  when: boolean;
  what: boolean;
  where: boolean;
}

export interface ActionAttributes {
  /** Category flags — the only thing stored during Action creation */
  flags?: ActionAttributeFlags;
  // Legacy fields kept for backwards-compat (populated during Recording, not Action creation)
  who?: WhoAttribute;
  when?: WhenAttribute;
  where?: WhereAttribute;
  /** New: multi-type location selection */
  whereTypes?: LocationType[];
  whereLocations?: WhereLocations;
}

// Flat API payload for action creation
export interface CreateActionPayload {
  name: string;
  short: string;
  category: string;
  description: string;
  isActive: boolean;
  attributes?: ActionAttributes;
}

// Location hierarchy types (from tc_locations + tc_storage_rooms)
export interface LocationOption {
  id: string;
  name: string;
  streetAddress?: string;
  city?: string;
}

export interface StorageRoomOption {
  id: string;
  locationId: string;
  building: string;
  floor: string;
  room: string;
  storageRequirementId?: string;
  storageRequirementCode?: string;
  storageRequirementName?: string;
}

// Worker option (from tc_users or people management)
export interface WorkerOption {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
}
