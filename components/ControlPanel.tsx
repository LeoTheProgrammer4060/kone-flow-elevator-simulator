import React, { useState } from 'react';
import { koneService } from '../services/koneService';
import { Equipment, EquipmentType, Direction } from '../types';

interface Props {
  onClose: () => void;
  defaultSource?: number;
  defaultDestination?: number;
  equipment?: Equipment | null;
}

const ControlPanel: React.FC<Props> = ({ onClose, defaultSource, defaultDestination, equipment }) => {
  const [source, setSource] = useState<number>(defaultSource ?? 0);
  const [destination, setDestination] = useState<number>(defaultDestination ?? 1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const floors = Array.from({ length: 11 }, (_, i) => i); // Floors 0-10

  const isEscalator = equipment?.type === EquipmentType.ESCALATOR;

  const handleCall = async () => {
    setLoading(true);
    try {
      await koneService.callElevator(source, destination);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEscalatorUpdate = async (updates: Partial<Equipment>) => {
    if (!equipment) return;
    setLoading(true);
    try {
        await koneService.updateEquipment(equipment.id, updates);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  // --------------------------------------------------------------------------------
  // SUCCESS STATE (Elevator Call)
  // --------------------------------------------------------------------------------
  if (success && !isEscalator) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center animate-bounce-in">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">Elevator Called!</h3>
          <p className="text-gray-500 mt-2">Please wait at Floor {source}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/40 pointer-events-auto" onClick={onClose} />
      
      <div className="bg-white pointer-events-auto w-full max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden relative max-h-[90vh]">
        
        {/* HEADER */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span className={`w-2 h-6 rounded-sm ${isEscalator ? 'bg-orange-500' : 'bg-blue-600'}`}></span>
            {isEscalator ? equipment?.name || 'Control Escalator' : 'Call Elevator'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* CONTENT */}
        <div className="overflow-y-auto">
          
          {/* --------------------------------------------------------------------------------
             ESCALATOR CONTROLS
             -------------------------------------------------------------------------------- */}
          {isEscalator && equipment ? (
             <div className="p-8 flex flex-col items-center justify-center space-y-8">
                {/* Status Circle */}
                <div className={`relative w-40 h-40 rounded-full border-8 flex items-center justify-center transition-all duration-500 ${
                    equipment.isMoving 
                    ? (equipment.direction === Direction.UP ? 'border-blue-500 bg-blue-50' : 'border-orange-500 bg-orange-50')
                    : 'border-gray-200 bg-gray-100'
                }`}>
                    {loading && (
                        <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-gray-300 animate-spin"></div>
                    )}
                    <div className={`transform transition-transform duration-500 ${equipment.direction === Direction.DOWN ? 'rotate-180' : ''}`}>
                        <svg className={`w-16 h-16 ${equipment.isMoving ? (equipment.direction === Direction.UP ? 'text-blue-600 animate-bounce' : 'text-orange-500 animate-bounce') : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                    </div>
                </div>

                <div className="text-center">
                    <div className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Current Status</div>
                    <div className={`text-2xl font-bold ${equipment.isMoving ? 'text-gray-900' : 'text-gray-500'}`}>
                        {equipment.isMoving 
                            ? (equipment.direction === Direction.UP ? 'MOVING UP' : 'MOVING DOWN') 
                            : 'STOPPED'}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="w-full grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => handleEscalatorUpdate({ isMoving: !equipment.isMoving })}
                        disabled={loading}
                        className={`h-28 rounded-2xl font-bold text-lg flex flex-col items-center justify-center gap-3 transition-all transform active:scale-95 shadow-sm border-b-4 ${
                            equipment.isMoving 
                            ? 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200' 
                            : 'bg-green-50 text-green-600 hover:bg-green-100 border-green-200'
                        }`}
                    >
                         <div className={`p-2 rounded-full ${equipment.isMoving ? 'bg-red-200' : 'bg-green-200'}`}>
                            {equipment.isMoving ? (
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            )}
                         </div>
                         {equipment.isMoving ? 'STOP' : 'START'}
                    </button>

                    <button 
                         onClick={() => handleEscalatorUpdate({ 
                             direction: equipment.direction === Direction.UP ? Direction.DOWN : Direction.UP,
                             isMoving: true // Auto-start on direction switch? Typically yes, or keep current state. Let's force start for UX.
                         })}
                         disabled={loading}
                         className="h-28 bg-white border-2 border-gray-100 hover:border-blue-200 border-b-4 rounded-2xl font-bold text-gray-700 flex flex-col items-center justify-center gap-3 transition-all transform active:scale-95 shadow-sm"
                    >
                         <div className="p-2 rounded-full bg-gray-100">
                            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                         </div>
                         {equipment.direction === Direction.UP ? 'SWITCH DOWN' : 'SWITCH UP'}
                    </button>
                </div>
             </div>
          ) : (
          /* --------------------------------------------------------------------------------
             ELEVATOR CONTROLS (Default)
             -------------------------------------------------------------------------------- */
            <div className="p-6 space-y-8">
              
              {/* Source Floor Selection */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">From Floor</label>
                <div className="grid grid-cols-4 gap-2">
                  {floors.map(f => (
                    <button
                      key={`src-${f}`}
                      onClick={() => setSource(f)}
                      className={`h-12 rounded-lg font-medium transition-colors ${
                        source === f 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {f === 0 ? 'G' : f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="border-t w-full border-gray-200"></div>
                <div className="absolute bg-white px-3 text-gray-300">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>

              {/* Destination Floor Selection */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">To Floor</label>
                <div className="grid grid-cols-4 gap-2">
                  {floors.map(f => (
                    <button
                      key={`dest-${f}`}
                      onClick={() => setDestination(f)}
                      disabled={source === f}
                      className={`h-12 rounded-lg font-medium transition-colors ${
                        destination === f 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                        : source === f
                        ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {f === 0 ? 'G' : f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER (Only for Elevator) */}
        {!isEscalator && (
          <div className="p-4 border-t bg-gray-50">
            <button
              onClick={handleCall}
              disabled={loading || source === destination}
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl shadow-xl shadow-blue-600/20 transition-all transform active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending Request...
                </>
              ) : (
                "CONFIRM CALL"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ControlPanel;