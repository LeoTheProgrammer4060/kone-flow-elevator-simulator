import React from 'react';
import { Equipment, EquipmentType, Direction, DoorStatus } from '../types';

interface Props {
  item: Equipment;
  onSelect?: (item: Equipment) => void;
}

const EquipmentCard: React.FC<Props> = ({ item, onSelect }) => {
  const isElevator = item.type === EquipmentType.ELEVATOR;

  const getStatusColor = () => {
    if (item.maintenanceMode) return 'bg-red-100 text-red-700 border-red-200';
    if (item.isMoving) return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-green-50 text-green-700 border-green-200';
  };

  const getDirectionIcon = () => {
    if (item.direction === Direction.UP) return '▲';
    if (item.direction === Direction.DOWN) return '▼';
    return '●';
  };

  return (
    <div 
      onClick={() => onSelect?.(item)}
      className={`relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-md bg-white ${isElevator ? 'border-gray-100' : 'border-orange-100'}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-lg ${isElevator ? 'bg-blue-600' : 'bg-orange-500'} text-white`}>
            {isElevator ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{item.name}</h3>
            <span className="text-xs text-gray-500 uppercase tracking-wider">{item.type}</span>
          </div>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor()}`}>
          {item.maintenanceMode ? 'MAINTENANCE' : item.isMoving ? 'MOVING' : 'IDLE'}
        </div>
      </div>

      {isElevator && (
        <div className="mt-4 flex items-center justify-between bg-gray-50 rounded-lg p-3">
          <div className="text-center">
            <p className="text-xs text-gray-500">Current Floor</p>
            <p className="text-2xl font-bold text-gray-800">{item.currentFloor}</p>
          </div>
          <div className="flex flex-col items-center">
             <span className={`text-xl font-bold ${item.direction === Direction.UP ? 'text-blue-600' : item.direction === Direction.DOWN ? 'text-blue-600' : 'text-gray-300'}`}>
               {getDirectionIcon()}
             </span>
             <span className="text-xs text-gray-400">{item.direction}</span>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Doors</p>
            <p className={`text-sm font-medium ${item.doorStatus === DoorStatus.OPEN ? 'text-green-600' : 'text-gray-700'}`}>
              {item.doorStatus?.toUpperCase()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentCard;
