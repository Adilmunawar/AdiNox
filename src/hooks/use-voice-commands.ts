
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Define the SpeechRecognition types that TypeScript doesn't have built-in
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionError extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal?: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (event: Event) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionError) => void;
  onend: (event: Event) => void;
  start(): void;
  stop(): void;
  abort(): void;
}

// Declare global variables for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

type VoiceCommandCallback = () => void;

interface VoiceCommand {
  command: string;
  action: VoiceCommandCallback;
  description: string;
}

export function useVoiceCommands(commands: VoiceCommand[]) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const { toast } = useToast();

  const startListening = () => {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      toast({
        title: "Voice Commands Unavailable",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive"
      });
      return;
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setIsListening(true);
      toast({
        title: "Listening...",
        description: "Say a command like 'add token' or 'help'",
      });
    };
    
    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript.toLowerCase().trim();
      setTranscript(speechResult);
      
      // Find matching command
      const matchedCommand = commands.find(cmd => 
        speechResult.includes(cmd.command.toLowerCase())
      );
      
      if (matchedCommand) {
        toast({
          title: "Command recognized",
          description: `Executing: ${matchedCommand.command}`
        });
        matchedCommand.action();
      } else {
        toast({
          title: "Unknown command",
          description: `Try saying: ${commands.map(c => c.command).join(", ")}`
        });
      }
    };
    
    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      toast({
        title: "Voice Recognition Error",
        description: `Error: ${event.error}. Please try again.`,
        variant: "destructive"
      });
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };

  return {
    startListening,
    isListening,
    transcript,
    availableCommands: commands.map(c => ({ command: c.command, description: c.description }))
  };
}
