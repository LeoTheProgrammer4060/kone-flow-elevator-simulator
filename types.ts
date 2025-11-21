export enum EquipmentType {
  ELEVATOR = 'elevator',
  ESCALATOR = 'escalator'
}

export enum Direction {
  UP = 'up',
  DOWN = 'down',
  STATIONARY = 'stationary'
}

export enum DoorStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  OPENING = 'opening',
  CLOSING = 'closing'
}

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  buildingId: string;
  currentFloor?: number;
  direction?: Direction;
  doorStatus?: DoorStatus;
  isMoving?: boolean;
  maxFloor?: number;
  minFloor?: number;
  maintenanceMode?: boolean;
}

export interface CallRequest {
  requestId: string;
  equipmentId: string | null; // null if "any elevator in building"
  sourceFloor: number;
  destinationFloor: number;
  status: 'queued' | 'allocated' | 'active' | 'completed';
  allocatedEquipmentId?: string;
}

export interface GeminiCommandResponse {
  sourceFloor?: number;
  destinationFloor?: number;
  intent: 'call_elevator' | 'check_status' | 'unknown';
}
