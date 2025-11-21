import { Equipment, EquipmentType, Direction, DoorStatus, CallRequest } from '../types';

// Mock Data Initializer
const MOCK_EQUIPMENT: Equipment[] = [
  {
    id: 'lift-101',
    name: 'Passenger Lift A',
    type: EquipmentType.ELEVATOR,
    buildingId: 'bldg-1',
    currentFloor: 1,
    direction: Direction.STATIONARY,
    doorStatus: DoorStatus.CLOSED,
    isMoving: false,
    minFloor: 0,
    maxFloor: 10
  },
  {
    id: 'lift-102',
    name: 'Passenger Lift B',
    type: EquipmentType.ELEVATOR,
    buildingId: 'bldg-1',
    currentFloor: 5,
    direction: Direction.STATIONARY,
    doorStatus: DoorStatus.CLOSED,
    isMoving: false,
    minFloor: 0,
    maxFloor: 10
  },
  {
    id: 'esc-201',
    name: 'Lobby Escalator Up',
    type: EquipmentType.ESCALATOR,
    buildingId: 'bldg-1',
    direction: Direction.UP,
    isMoving: true
  },
  {
    id: 'esc-202',
    name: 'Lobby Escalator Down',
    type: EquipmentType.ESCALATOR,
    buildingId: 'bldg-1',
    direction: Direction.DOWN,
    isMoving: true
  }
];

class KoneService {
  private equipment: Equipment[] = [...MOCK_EQUIPMENT];
  private activeCalls: CallRequest[] = [];
  private listeners: Set<(equipment: Equipment[]) => void> = new Set();
  private simulationInterval: number | null = null;

  constructor() {
    this.startSimulation();
  }

  // Simulate realtime movement
  private startSimulation() {
    if (this.simulationInterval) return;
    
    this.simulationInterval = window.setInterval(() => {
      let stateChanged = false;

      // Process Active Calls
      this.activeCalls.forEach(call => {
        if (call.status === 'completed') return;

        const lift = this.equipment.find(e => e.id === call.allocatedEquipmentId);
        if (!lift || lift.maintenanceMode) return;

        // Allocation Logic (Simplified)
        if (call.status === 'queued') {
           // Find best lift (omitted complex logic, just picking first idle or the allocated one)
           if (!call.allocatedEquipmentId) {
             const available = this.equipment.find(e => e.type === EquipmentType.ELEVATOR && !e.isMoving);
             if (available) {
               call.allocatedEquipmentId = available.id;
               call.status = 'allocated';
               stateChanged = true;
             }
           } else {
             call.status = 'allocated';
             stateChanged = true;
           }
        }

        // Movement Logic
        if (call.status === 'allocated' || call.status === 'active') {
           const target = call.status === 'allocated' ? call.sourceFloor : call.destinationFloor;
           
           if (lift.currentFloor !== target) {
             lift.isMoving = true;
             lift.doorStatus = DoorStatus.CLOSED;
             
             if ((lift.currentFloor ?? 0) < target) {
               lift.direction = Direction.UP;
               lift.currentFloor = (lift.currentFloor ?? 0) + 1;
             } else {
               lift.direction = Direction.DOWN;
               lift.currentFloor = (lift.currentFloor ?? 0) - 1;
             }
             stateChanged = true;
           } else {
             // Arrived
             lift.isMoving = false;
             lift.direction = Direction.STATIONARY;
             lift.doorStatus = DoorStatus.OPEN;
             
             if (call.status === 'allocated') {
               call.status = 'active'; // Picked up passenger
               // Auto close doors after delay (simulated in next tick visually, but logic here)
             } else {
               call.status = 'completed'; // Dropped off
             }
             stateChanged = true;
           }
        }
      });

      // Cleanup completed calls
      this.activeCalls = this.activeCalls.filter(c => c.status !== 'completed');

      if (stateChanged) {
        this.notifyListeners();
      }
    }, 2000); // Update every 2 seconds for visual clarity
  }

  public subscribe(callback: (equipment: Equipment[]) => void) {
    this.listeners.add(callback);
    callback(this.equipment);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners() {
    this.listeners.forEach(cb => cb([...this.equipment]));
  }

  public async getEquipment(): Promise<Equipment[]> {
    // Simulate API latency
    return new Promise(resolve => {
      setTimeout(() => resolve([...this.equipment]), 500);
    });
  }

  public async callElevator(source: number, destination: number): Promise<CallRequest> {
    return new Promise(resolve => {
      setTimeout(() => {
        const requestId = `req-${Date.now()}`;
        // Simple logic: assign to first elevator for demo
        const allocatedLift = this.equipment.find(e => e.type === EquipmentType.ELEVATOR); 
        
        const newCall: CallRequest = {
          requestId,
          equipmentId: null,
          allocatedEquipmentId: allocatedLift?.id, // Immediate allocation for demo
          sourceFloor: source,
          destinationFloor: destination,
          status: 'queued'
        };
        
        this.activeCalls.push(newCall);
        this.notifyListeners();
        resolve(newCall);
      }, 800);
    });
  }

  public async updateEquipment(id: string, updates: Partial<Equipment>): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        const index = this.equipment.findIndex(e => e.id === id);
        if (index !== -1) {
          this.equipment[index] = { ...this.equipment[index], ...updates };
          this.notifyListeners();
        }
        resolve();
      }, 300);
    });
  }
}

export const koneService = new KoneService();