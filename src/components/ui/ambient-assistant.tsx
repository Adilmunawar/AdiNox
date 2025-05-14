
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Shield, MicOff, Mic, Sparkles, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useVoiceCommands } from "@/hooks/use-voice-commands";
import { useIsMobile } from "@/hooks/use-mobile"; 

interface AmbientAssistantProps {
  className?: string;
}

export const AmbientAssistant = ({ className }: AmbientAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Sample insights about token security
  const possibleInsights = [
    "Your tokens are protected with military-grade encryption",
    "Voice commands can help you navigate AdiNox quickly",
    "Enable two-factor authentication for all your important accounts",
    "Remember to log out from shared devices",
    "AdiNox encrypts your token data with cutting-edge algorithms",
    "Keep your recovery codes in a safe place",
    "AdiNox refreshes your tokens automatically for high security",
    "In AdiNox, your tokens never leave your device unencrypted",
    "Try sorting tokens by issuer to organize them better",
    "Use secure passwords together with your authentication tokens",
    "AdiNox employs world's top notch security features"
  ];

  const {
    isListening,
    startListening,
    stopListening,
    isSupported
  } = useVoiceCommands({
    commands: {
      "open tokens": () => {
        toast({
          title: "Voice command detected",
          description: "Opening token list",
        });
      },
      "add token": () => {
        toast({
          title: "Voice command detected",
          description: "Opening add token form",
        });
      },
      "show security tips": () => {
        toast({
          title: "Voice command detected",
          description: "Showing security insights",
        });
        setIsOpen(true);
      },
      "close assistant": () => {
        setIsOpen(false);
      }
    },
    continuous: false
  });

  // Randomly select and rotate insights
  useEffect(() => {
    if (!isOpen) return;

    // Shuffle insights 
    const shuffled = [...possibleInsights].sort(() => 0.5 - Math.random());
    setInsights(shuffled.slice(0, 4));

    // Rotate insights every 8 seconds
    const interval = setInterval(() => {
      const shuffled = [...possibleInsights].sort(() => 0.5 - Math.random());
      setInsights(shuffled.slice(0, 4));
    }, 8000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Animation variants
  const containerVariants = {
    closed: {
      width: "48px",
      height: "48px",
      borderRadius: "24px",
    },
    open: {
      width: isMobile ? "calc(100% - 2rem)" : "320px",
      height: "auto",
      borderRadius: "12px",
    },
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <motion.div
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={containerVariants}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        className={cn(
          "bg-card/95 backdrop-blur-md border border-border shadow-lg overflow-hidden",
          className
        )}
      >
        {/* Button when closed */}
        <AnimatePresence mode="wait">
          {!isOpen && (
            <motion.div
              key="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full flex items-center justify-center"
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-adinox-purple/20 to-adinox-red/20 border border-white/10"
                      onClick={() => setIsOpen(true)}
                    >
                      <motion.div
                        animate={{
                          rotate: [0, 10, -10, 0],
                        }}
                        transition={{
                          duration: 3,
                          ease: "easeInOut",
                          repeat: Infinity,
                          repeatDelay: 5,
                        }}
                      >
                        <Shield className="h-5 w-5 text-primary" />
                      </motion.div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>AdiNox Assistant</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          )}

          {/* Panel when open */}
          {isOpen && (
            <motion.div
              key="panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="p-4"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <h3 className="text-sm font-medium">AdiNox Assistant</h3>
                </div>
                <div className="flex items-center gap-2">
                  {isSupported && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-8 w-8 rounded-full",
                              isListening && "bg-primary/20"
                            )}
                            onClick={() => {
                              if (isListening) {
                                stopListening();
                              } else {
                                startListening();
                              }
                            }}
                          >
                            <AnimatePresence mode="wait">
                              {isListening ? (
                                <motion.div
                                  key="listening"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                >
                                  <Mic className="h-4 w-4 text-primary" />
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="not-listening"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                >
                                  <MicOff className="h-4 w-4 text-muted-foreground" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          {isListening ? "Stop listening" : "Voice commands"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <p className="text-xs font-medium">Security Insights</p>
                </div>

                <div className="space-y-2">
                  <AnimatePresence mode="wait">
                    {insights.map((insight, i) => (
                      <motion.div
                        key={insight}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{
                          duration: 0.3,
                          delay: i * 0.1,
                        }}
                        className="flex gap-2 items-start"
                      >
                        <div className="mt-1">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {insight}
                        </p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              <div className="border-t border-border pt-3">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    {isSupported
                      ? "Try voice commands like 'add token' or 'show security tips'"
                      : "Voice commands are not supported in your browser"}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ripple animation effect */}
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0.5, scale: 1 }}
              animate={{
                opacity: 0,
                scale: 1.5,
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 1,
              }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-full bg-primary/20 -z-10"
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
