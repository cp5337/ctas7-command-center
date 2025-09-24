import React from 'react';
import { Persona } from '../types';
import { MessageCircle, Phone, Video, Settings } from 'lucide-react';

interface PersonaCardProps {
  persona: Persona;
  onStartChat: (personaId: string) => void;
  onVoiceCall: (personaId: string) => void;
}

export const PersonaCard: React.FC<PersonaCardProps> = ({ 
  persona, 
  onStartChat, 
  onVoiceCall 
}) => {
  const statusColors = {
    online: 'bg-green-400',
    busy: 'bg-red-400',
    away: 'bg-yellow-400',
    offline: 'bg-gray-400'
  };

  return (
    <div className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-all border border-slate-600 hover:border-cyan-400/40">
      <div className="flex items-center space-x-3 mb-3">
        <div className="relative">
          <img 
            src={persona.avatar} 
            alt={persona.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-slate-500"
          />
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${statusColors[persona.status]} rounded-full border-2 border-slate-700 ${persona.status === 'online' ? 'animate-pulse' : ''}`}></div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-slate-100 font-semibold truncate">{persona.name}</h3>
          <p className="text-slate-400 text-sm truncate">{persona.role}</p>
          <p className="text-cyan-400 text-xs">{persona.model}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {persona.capabilities.slice(0, 3).map((capability, index) => (
          <span 
            key={index}
            className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded-full"
          >
            {capability}
          </span>
        ))}
        {persona.capabilities.length > 3 && (
          <span className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded-full">
            +{persona.capabilities.length - 3}
          </span>
        )}
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => onStartChat(persona.id)}
          className="flex-1 flex items-center justify-center space-x-1 bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-2 rounded-md text-sm transition-colors"
        >
          <MessageCircle size={14} />
          <span>Chat</span>
        </button>
        <button
          onClick={() => onVoiceCall(persona.id)}
          className="flex items-center justify-center bg-slate-600 hover:bg-slate-500 text-white px-3 py-2 rounded-md transition-colors"
        >
          <Phone size={14} />
        </button>
        <button className="flex items-center justify-center bg-slate-600 hover:bg-slate-500 text-white px-3 py-2 rounded-md transition-colors">
          <Video size={14} />
        </button>
      </div>

      <div className="mt-2 text-xs text-slate-400">
        Last seen: {persona.lastSeen}
      </div>
    </div>
  );
};