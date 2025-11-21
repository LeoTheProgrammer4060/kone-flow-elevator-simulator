import React, { useEffect, useState } from 'react';
import { koneService } from './services/koneService';
import EquipmentCard from './components/EquipmentCard';
import ControlPanel from './components/ControlPanel';
import AiAssistant from './components/AiAssistant';
import { Equipment } from './types';

const App: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [showControl, setShowControl] = useState(false);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = koneService.subscribe((data) => {
      setEquipment(data);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Derive selected equipment from the live list so updates reflect in real-time
  const selectedEquipment = selectedEquipmentId 
    ? equipment.find(e => e.id === selectedEquipmentId) || null 
    : null;

  const handleCardClick = (item: Equipment) => {
    setSelectedEquipmentId(item.id);
    setShowControl(true);
  };

  const handleManualCall = () => {
    setSelectedEquipmentId(null);
    setShowControl(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      
      {/* Top Navigation Bar */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* KONE-ish Logo style */}
            <div className="bg-[#005596] text-white font-bold px-2 py-1 rounded text-lg tracking-tighter">
              KONE
            </div>
            <span className="text-gray-500 font-medium pl-2 border-l"></span>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden sm:flex flex-col items-end text-xs text-gray-500">
               <span className="font-semibold text-gray-900">KONE Headquarters</span>
               <span>Espoo, Finland</span>
             </div>
             <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
                <img src="https://picsum.photos/100/100" alt="User" className="h-full w-full object-cover" />
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-6">
        
        {/* Welcome Section */}
        <div className="mb-8">
           <h1 className="text-2xl font-bold text-gray-900">Good Morning, User.</h1>
           <p className="text-gray-500 mt-1">Here is the status of the building equipment.</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <button 
            onClick={handleManualCall}
            className="w-full bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center justify-between group hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                 </svg>
               </div>
               <div className="text-left">
                 <h3 className="font-bold text-gray-900 text-lg">Call Elevator</h3>
                 <p className="text-sm text-gray-500">Manually select floors</p>
               </div>
            </div>
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
               </svg>
            </div>
          </button>
        </div>

        {/* Equipment List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 text-lg">Nearby Equipment</h2>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">Online</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {equipment.map(item => (
              <EquipmentCard 
                key={item.id} 
                item={item} 
                onSelect={handleCardClick}
              />
            ))}
          </div>
        </div>

        {/* Building Visualizer (Simplified) */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4">Building Traffic</h2>
          <div className="h-32 flex items-end justify-around px-4 relative bg-gray-50 rounded-lg overflow-hidden">
            {/* Floor lines */}
            {Array.from({length: 5}).map((_, i) => (
               <div key={i} className="absolute w-full border-t border-gray-200" style={{bottom: `${i * 25}%`}}></div>
            ))}
            
            {/* Elevator Shafts */}
            {equipment.filter(e => e.type === 'elevator').map((lift, idx) => (
               <div key={lift.id} className="h-full w-12 bg-gray-200 relative mx-2 rounded-t-sm">
                  {/* The Cabin */}
                  <div 
                    className="absolute w-full bg-[#005596] rounded-sm shadow-md transition-all duration-1000 ease-linear flex items-center justify-center text-[10px] text-white font-bold"
                    style={{
                      height: '20%',
                      bottom: `${(lift.currentFloor || 0) * 10}%`, // Approximate scale 0-10 floors
                    }}
                  >
                    {lift.currentFloor}
                  </div>
               </div>
            ))}
          </div>
          <p className="text-xs text-center text-gray-400 mt-2">Live monitoring of Elevator Shafts A & B</p>
        </div>

      </main>

      {/* Overlays */}
      {showControl && (
        <ControlPanel 
          onClose={() => setShowControl(false)} 
          defaultSource={selectedEquipment?.currentFloor}
          equipment={selectedEquipment}
        />
      )}

      <AiAssistant />
    </div>
  );
};

export default App;