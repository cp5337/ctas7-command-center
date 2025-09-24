import React, { useState, useRef, useEffect } from 'react';
import { Message, Persona, Channel } from '../types';
import { Send, Mic, MicOff, Paperclip, Phone, Video, MoreVertical } from 'lucide-react';
import { VoiceMessage } from './VoiceMessage';

interface ChatInterfaceProps {
  channel: Channel;
  messages: Message[];
  personas: Persona[];
  currentUserId: string;
  onSendMessage: (content: string) => void;
  onSendVoice: (audioBlob: Blob) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  channel,
  messages,
  personas,
  currentUserId,
  onSendMessage,
  onSendVoice
}) => {
  const [messageText, setMessageText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      onSendMessage(messageText);
      setMessageText('');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        onSendVoice(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
      setIsRecording(false);
    }
  };

  const getPersonaById = (id: string) => personas.find(p => p.id === id);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-slate-800 rounded-lg border border-slate-600">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-600">
        <div className="flex items-center space-x-3">
          {channel.type === 'direct' && (
            <>
              {channel.participants
                .filter(id => id !== currentUserId)
                .map(participantId => {
                  const persona = getPersonaById(participantId);
                  return persona ? (
                    <div key={participantId} className="flex items-center space-x-2">
                      <img 
                        src={persona.avatar} 
                        alt={persona.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <h3 className="text-slate-100 font-medium">{persona.name}</h3>
                        <p className="text-slate-400 text-xs">{persona.status}</p>
                      </div>
                    </div>
                  ) : null;
                })}
            </>
          )}
          {channel.type === 'group' && (
            <div>
              <h3 className="text-slate-100 font-medium">{channel.name}</h3>
              <p className="text-slate-400 text-xs">{channel.participants.length} members</p>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-md transition-colors">
            <Phone size={18} />
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-md transition-colors">
            <Video size={18} />
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-md transition-colors">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const sender = getPersonaById(message.senderId);
          const isOwn = message.senderId === currentUserId;
          
          return (
            <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'} space-x-2`}>
                {!isOwn && sender && (
                  <img 
                    src={sender.avatar} 
                    alt={sender.name}
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                )}
                
                <div className={`${isOwn ? 'mr-2' : 'ml-2'}`}>
                  {!isOwn && sender && (
                    <p className="text-slate-400 text-xs mb-1">{sender.name}</p>
                  )}
                  
                  <div className={`rounded-lg px-4 py-2 ${
                    isOwn 
                      ? 'bg-cyan-600 text-white' 
                      : 'bg-slate-700 text-slate-100'
                  }`}>
                    {message.type === 'voice' && message.voiceData ? (
                      <VoiceMessage voiceData={message.voiceData} />
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                  </div>
                  
                  <p className="text-slate-500 text-xs mt-1">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-slate-600">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-md transition-colors"
          >
            <Paperclip size={18} />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="w-full bg-slate-700 text-slate-100 rounded-lg px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <button
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-cyan-400 hover:text-cyan-300 disabled:text-slate-500 transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
          
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-2 rounded-md transition-colors ${
              isRecording 
                ? 'bg-red-600 text-white animate-pulse' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
          >
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          onChange={(e) => {
            // Handle file uploads
            console.log('Files selected:', e.target.files);
          }}
        />
      </div>
    </div>
  );
};