/**
 * CTAS-7 Pure ElevenLabs Voice Integration
 * Tesla/SpaceX/Apple Standards Compliant
 *
 * PURE 11 LABS - No other voice services
 */

import { useState, useCallback, useRef } from "react";

export interface ElevenLabsAgent {
  id: string;
  name: string;
  voiceId: string;
  accent: string;
  specialty: string;
}

export const CTAS_AGENTS: ElevenLabsAgent[] = [
  {
    id: "natasha",
    name: "Natasha Volkov",
    voiceId: "EXAVITQu4vr4xnSDxMaL",
    accent: "🇷🇺 Russian",
    specialty: "Neural Mux, XSD Reasoning",
  },
  {
    id: "elena",
    name: "Elena Rodriguez",
    voiceId: "H9mEgO8K5PWTUMrk9TS0",
    accent: "🇵🇷 Nuyorican",
    specialty: "PhD Analysis, GIS, Haversine",
  },
  {
    id: "lachlan",
    name: "Lachlan Harris",
    voiceId: "HhGr1ybtHUOflpQ4AZto",
    accent: "🇦🇺 Australian",
    specialty: "Repo Agent, System Design",
  },
  {
    id: "marcus",
    name: "Marcus Chen",
    voiceId: "pqHfZKP75CvOlQylNhV4",
    accent: "🇨🇳 Chinese",
    specialty: "Trivariate Hash, XSD Orchestration",
  },
];

interface UseElevenLabsVoiceProps {
  agent?: ElevenLabsAgent;
  model?: string;
  stability?: number;
  similarityBoost?: number;
}

export function useElevenLabsVoice({
  agent = CTAS_AGENTS[0], // Default to Natasha
  model = "eleven_monolingual_v1",
  stability = 0.5,
  similarityBoost = 0.8,
}: UseElevenLabsVoiceProps = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const synthesizeSpeech = useCallback(
    async (text: string): Promise<void> => {
      if (!text.trim()) {
        setError("Text cannot be empty");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const apiKey =
          process.env.REACT_APP_ELEVENLABS_API_KEY ||
          import.meta.env.VITE_ELEVENLABS_API_KEY;

        if (!apiKey) {
          throw new Error("ElevenLabs API key not configured");
        }

        const response = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${agent.voiceId}`,
          {
            method: "POST",
            headers: {
              Accept: "audio/mpeg",
              "Content-Type": "application/json",
              "xi-api-key": apiKey,
            },
            body: JSON.stringify({
              text,
              model_id: model,
              voice_settings: {
                stability,
                similarity_boost: similarityBoost,
              },
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.detail?.message ||
              `ElevenLabs API error: ${response.status}`
          );
        }

        const audioBlob = await response.blob();
        const audioObjectUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioObjectUrl);

        // Auto-play if audio ref exists
        if (audioRef.current) {
          audioRef.current.src = audioObjectUrl;
          await audioRef.current.play();
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        console.error("[ElevenLabs] Speech synthesis error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [agent.voiceId, model, stability, similarityBoost]
  );

  const playAudio = useCallback(async (): Promise<void> => {
    if (!audioUrl || !audioRef.current) return;

    try {
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
    } catch (err) {
      console.error("[ElevenLabs] Audio playback error:", err);
    }
  }, [audioUrl]);

  const stopAudio = useCallback((): void => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  const cleanup = useCallback((): void => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    stopAudio();
  }, [audioUrl, stopAudio]);

  return {
    // State
    isLoading,
    error,
    audioUrl,
    agent,

    // Methods
    synthesizeSpeech,
    playAudio,
    stopAudio,
    cleanup,

    // Audio ref for component use
    audioRef,
  };
}

export default useElevenLabsVoice;
