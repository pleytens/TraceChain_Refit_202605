// Recording types for TraceChain recording workflow

export interface RecordingMaterial {
  id: string;
  name: string;
  supplierName?: string;
  importPackingItem?: string;
  importUnitItem?: string;
  batchNumber?: string;
  quantity?: number;
  storageRequirementCode?: string;
}

export interface RecordingWorker {
  id: string;
  name: string;
  email?: string;
}

export interface RecordingWhen {
  startDateTime: string; // ISO 8601
  endDateTime?: string;
}

export interface RecordingWhereEntry {
  type: "from" | "at" | "to";
  storageRoomId?: string;
  locationName?: string;
  building?: string;
  floor?: string;
  room?: string;
  storageRequirementCode?: string;
  storageRequirementName?: string;
}

export interface RecordingActionData {
  actionId: string;
  actionName: string;
  stepOrder: number;
  what?: RecordingMaterial[];
  who?: RecordingWorker[];
  when?: RecordingWhen;
  whereTypes?: ("from" | "at" | "to")[];
  whereLocations?: Partial<Record<"from" | "at" | "to", RecordingWhereEntry>>;
}

export interface RecordingData {
  processId: string;
  processName: string;
  actions: RecordingActionData[];
}

export interface Recording {
  id: string;
  recordName: string;
  processId: string;
  processName: string;
  isFinalProcess?: boolean; // true if the linked process has is_final = true
  recordedBy: string;
  recordedAt: string;
  userName: string;
  batchLotNumber?: string;
  expiryDate?: string;
  status: "Created" | "Locked";
  lockedAt?: string;
  lockedBy?: string;
  lockedByName?: string;
  data: RecordingData;
}
