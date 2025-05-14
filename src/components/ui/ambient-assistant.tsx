
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Brain, HelpCircle, X, Mic, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useVoiceCommands } from "@/hooks/use-voice-commands";
import { useMobile } from "@/hooks/use-mobile"; 

interface AmbientAssistantProps {
  className?: string;
}

export function AmbientAssistant({ className }: AmbientAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);
  const { toast } = useToast();
  const isMobile = useMobile();

  // Sample insights about token security
  const possibleInsights = [
    "Use unique tokens for each service to improve security.",
    "Remember to enable 2FA on all your important accounts.",
    "Verify the token issuer before scanning any QR codes.",
    "Use a password manager alongside your authentication tokens.",
    "Regularly check your account activity for suspicious logins.",
    "Keep your token backup codes in a secure location.",
    "Consider using hardware security keys for critical accounts.",
    "Update your recovery email and phone number regularly.",
    "Token-based authentication is more secure than SMS codes.",
    "AdiNox securely stores your tokens with military-grade encryption."
  ];

  // Define voice commands
  const voiceCommands = useVoiceCommands([
    { 
      command: "add token", 
      action: () => {
        document.getElementById("add-token-button")?.click();
      },
      description: "Opens the add token form"
    },
    { 
      command: "security tips", 
      action: () => {
        speakRandomInsight();
      },
      description: "Provides a security tip"
    },
    { 
      command: "help", 
      action: () => {
        setIsOpen(true);
      },
      description: "Opens the assistant panel"
    },
    { 
      command: "close", 
      action: () => {
        setIsOpen(false);
      },
      description: "Closes any open panels"
    }
  ]);

  // Function to speak text using Speech Synthesis API
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Speech Unavailable",
        description: "Your browser doesn't support text-to-speech."
      });
    }
  };

  // Function to speak a random security insight
  const speakRandomInsight = () => {
    const insight = possibleInsights[Math.floor(Math.random() * possibleInsights.length)];
    setInsights([insight, ...insights.slice(0, 4)]);
    speak(insight);
  };

  // Generate a new insight periodically
  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      const newInsight = possibleInsights[Math.floor(Math.random() * possibleInsights.length)];
      if (insights.length === 0 || newInsight !== insights[0]) {
        setInsights(prev => [newInsight, ...prev.slice(0, 4)]);
      }
    }, 15000);
    
    return () => clearInterval(interval);
  }, [isOpen, insights]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className={cn(
              "fixed bottom-20 right-4 md:right-8 w-80 md:w-96 bg-background/90 backdrop-blur-md",
              "rounded-xl border border-primary/20 shadow-lg shadow-primary/5 z-50",
              className
            )}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between p-3 border-b border-muted">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-primary animate-pulse" />
                <h3 className="font-medium">AdiNox Assistant</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-4 space-y-4 max-h-[300px] overflow-y-auto">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Security Insights</h4>
                <ul className="space-y-2">
                  {insights.length > 0 ? (
                    insights.map((insight, i) => (
                      <motion.li 
                        key={insight + i}
                        className="text-sm bg-muted/50 p-2 rounded-md flex items-start"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Volume2 className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5 text-muted-foreground" />
                        <span>{insight}</span>
                      </motion.li>
                    ))
                  ) : (
                    <li className="text-sm text-muted-foreground">
                      No insights yet. Click the speaker button below.
                    </li>
                  )}
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Voice Commands</h4>
                <ul className="grid grid-cols-1 gap-1">
                  {voiceCommands.availableCommands.map((cmd) => (
                    <li key={cmd.command} className="text-xs bg-muted/30 p-1.5 rounded">
                      <span className="font-medium">{cmd.command}</span>: {cmd.description}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 border-t border-muted">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs"
                onClick={speakRandomInsight}
                disabled={isSpeaking}
              >
                <Volume2 className={cn("h-4 w-4 mr-1", isSpeaking && "text-primary animate-pulse")} />
                {isSpeaking ? "Speaking..." : "Speak insight"}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => voiceCommands.startListening()}
                disabled={voiceCommands.isListening}
              >
                <Mic className={cn("h-4 w-4 mr-1", voiceCommands.isListening && "text-primary animate-pulse")} />
                {voiceCommands.isListening ? "Listening..." : "Voice command"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              className={cn(
                "fixed bottom-4 right-4 md:right-8 z-50",
                "h-12 w-12 rounded-full bg-primary flex items-center justify-center",
                "shadow-lg shadow-primary/30 cursor-pointer"
              )}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              {isOpen ? (
                <X className="h-5 w-5 text-primary-foreground" />
              ) : (
                <HelpCircle className="h-5 w-5 text-primary-foreground" />
              )}
              
              <motion.div 
                className="absolute inset-0 rounded-full bg-primary/50"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 0.2, 0.7]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>{isOpen ? "Close assistant" : "Open AdiNox assistant"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
}
