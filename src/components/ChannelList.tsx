import React from 'react';
import { Channel, Persona } from '../types';
import { Hash, Lock, Users, MessageCircle } from 'lucide-react';

interface ChannelListProps {
  channels: Channel[];
  personas: Persona[];
  activeChannelId?: string;
  onChannelSelect: (channelId: string) => void;
}

export const ChannelList: React.FC<ChannelListProps> = ({
  channels,
  personas,
  activeChannelId,
  onChannelSelect
}) => {
  const getChannelIcon = (channel: Channel) => {
    switch (channel.type) {
      case 'direct':
        return <MessageCircle size={16} className="text-slate-400" />;
      case 'group':
        return <Users size={16} className="text-slate-400" />;
      case 'system':
        return <Hash size={16} className="text-slate-400" />;
      default:
        return <Hash size={16} className="text-slate-400" />;
    }
  };

  const getChannelName = (channel: Channel) => {
    if (channel.type === 'direct') {
      const otherParticipant = channel.participants.find(id => id !== 'current-user');
      const persona = personas.find(p => p.id === otherParticipant);
      return persona ? persona.name : 'Unknown User';
    }
    return channel.name;
  };

  const getChannelAvatar = (channel: Channel) => {
    if (channel.type === 'direct') {
      const otherParticipant = channel.participants.find(id => id !== 'current-user');
      const persona = personas.find(p => p.id === otherParticipant);
      return persona?.avatar;
    }
    return null;
  };

  const formatLastMessageTime = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="space-y-1">
      {channels.map((channel) => {
        const avatar = getChannelAvatar(channel);
        const isActive = channel.id === activeChannelId;
        
        return (
          <div
            key={channel.id}
            onClick={() => onChannelSelect(channel.id)}
            className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
              isActive 
                ? 'bg-cyan-600/20 border border-cyan-400/40' 
                : 'hover:bg-slate-700/50'
            }`}
          >
            <div className="flex-shrink-0">
              {avatar ? (
                <img 
                  src={avatar} 
                  alt={getChannelName(channel)}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                  {getChannelIcon(channel)}
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className={`font-medium truncate ${
                  isActive ? 'text-cyan-400' : 'text-slate-200'
                }`}>
                  {getChannelName(channel)}
                </h3>
                {channel.lastMessage && (
                  <span className="text-slate-500 text-xs">
                    {formatLastMessageTime(channel.lastMessage.timestamp)}
                  </span>
                )}
              </div>
              
              {channel.lastMessage && (
                <p className="text-slate-400 text-sm truncate">
                  {channel.lastMessage.type === 'voice' ? '<µ Voice message' : channel.lastMessage.content}
                </p>
              )}
            </div>
            
            {channel.unreadCount > 0 && (
              <div className="flex-shrink-0">
                <span className="bg-cyan-600 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                  {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};