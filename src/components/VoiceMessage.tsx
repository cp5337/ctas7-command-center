import React, { useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { VoiceMessage as VoiceMessageType } from '../types';

interface VoiceMessageProps {
  voiceData: VoiceMessageType;
}

export const VoiceMessage: React.FC<VoiceMessageProps> = ({ voiceData }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    // Here you would implement actual audio playback
  };

  return (
    <div className="flex items-center space-x-3 py-1">
      <button
        onClick={togglePlayback}
        className="flex items-center justify-center w-8 h-8 bg-slate-600 hover:bg-slate-500 rounded-full transition-colors"
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
      </button>
      
      <div className="flex-1">
        <div className="flex items-center space-x-1 h-6">
          {voiceData.waveform.map((height, index) => (
            <div
              key={index}
              className="bg-current opacity-60"
              style={{
                width: '2px',
                height: `${Math.max(2, height * 20)}px`,
              }}
            />
          ))}
        </div>
      </div>
      
      <span className="text-xs opacity-75">
        {formatDuration(voiceData.duration)}
      </span>
    </div>
  );
};