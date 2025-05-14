
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

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

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
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
