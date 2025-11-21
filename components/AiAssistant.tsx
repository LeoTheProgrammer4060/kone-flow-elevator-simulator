import React, { useState } from 'react';
import { interpretCommand } from '../services/geminiService';
import { koneService } from '../services/koneService';

const AiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    {role: 'ai', text: "Hi! I'm your KONE building assistant. Tell me where you need to go."}
  ]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, {role: 'user', text: userMsg}]);
    setInput('');
    setIsProcessing(true);

    try {
      const command = await interpretCommand(userMsg);
      
      if (!command || command.intent === 'unknown') {
        setMessages(prev => [...prev, {role: 'ai', text: "I didn't quite catch that. Could you try saying 'Take me to floor 5'?"}]);
      } else if (command.intent === 'call_elevator') {
        const dest = command.destinationFloor;
        const src = command.sourceFloor && command.sourceFloor >= 0 ? command.sourceFloor : 0; // Default to lobby if unknown
        
        if (dest !== undefined) {
             await koneService.callElevator(src, dest);
             setMessages(prev => [...prev, {role: 'ai', text: `Sure! Calling an elevator from Floor ${src} to Floor ${dest}.`}]);
        } else {
            setMessages(prev => [...prev, {role: 'ai', text: "I know you want an elevator, but which floor are you going to?"}]);
        }
      } else {
         setMessages(prev => [...prev, {role: 'ai', text: "I can only help with elevator calls right now."}]);
      }
    } catch (e) {
       setMessages(prev => [...prev, {role: 'ai', text: "Sorry, I'm having trouble connecting to the building network."}]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* FAB Trigger */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform z-40"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      </button>

      {/* Chat Interface */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-end sm:justify-end sm:p-6 pointer-events-none">
          <div className="absolute inset-0 bg-black/20 sm:bg-transparent pointer-events-auto" onClick={() => setIsOpen(false)} />
          
          <div className="bg-white pointer-events-auto w-full sm:w-96 h-[500px] sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-xs font-bold">AI</span>
                 </div>
                 <h3 className="font-bold">KONE Assistant</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    m.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 shadow-sm rounded-tl-none border border-gray-100'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Try 'Take me to floor 4'..."
                  className="flex-1 bg-gray-100 border-0 rounded-full px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isProcessing}
                  className="w-10 h-10 bg-blue-600 rounded-full text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              <p className="text-center text-xs text-gray-400 mt-2">Powered by Gemini 2.5 Flash</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AiAssistant;
