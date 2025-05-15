
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

interface CommandConfig {
  [key: string]: () => void;
}

export function useVoiceCommands({
  commands,
  continuous = false
}: {
  commands: CommandConfig;
  continuous?: boolean;
}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const { toast } = useToast();
  
  // Check if browser supports speech recognition
  const isSupported = typeof window !== 'undefined' && 
    (('SpeechRecognition' in window) || ('webkitSpeechRecognition' in window));

  const startListening = () => {
    if (!isSupported) {
      toast({
        title: "Voice Commands Unavailable",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive"
      });
      return;
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognitionAPI();
    
    recognitionInstance.continuous = continuous;
    recognitionInstance.interimResults = false;
    recognitionInstance.lang = 'en-US';
    
    recognitionInstance.onstart = () => {
      setIsListening(true);
      toast({
        title: "Listening...",
        description: "Say a command like 'add token' or 'help'",
      });
    };
    
    recognitionInstance.onresult = (event) => {
      const speechResult = event.results[0][0].transcript.toLowerCase().trim();
      setTranscript(speechResult);
      
      // Find matching command
      const commandKeys = Object.keys(commands);
      const matchedCommand = commandKeys.find(cmd => 
        speechResult.includes(cmd.toLowerCase())
      );
      
      if (matchedCommand) {
        toast({
          title: "Command recognized",
          description: `Executing: ${matchedCommand}`
        });
        commands[matchedCommand]();
      } else {
        toast({
          title: "Unknown command",
          description: `Try saying: ${commandKeys.join(", ")}`
        });
      }
    };
    
    recognitionInstance.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      toast({
        title: "Voice Recognition Error",
        description: `Error: ${event.error}. Please try again.`,
        variant: "destructive"
      });
    };
    
    recognitionInstance.onend = () => {
      setIsListening(false);
    };
    
    setRecognition(recognitionInstance);
    recognitionInstance.start();
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  return {
    startListening,
    stopListening,
    isListening,
    transcript,
    isSupported,
    availableCommands: Object.keys(commands).map(command => ({ 
      command, 
      description: command 
    }))
  };
}
