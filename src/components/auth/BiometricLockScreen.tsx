import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Fingerprint, ScanFace, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBiometric } from "@/hooks/useBiometric";
import { cn } from "@/lib/utils";

interface BiometricLockScreenProps {
  isLocked: boolean;
  onUnlock: () => void;
  userName?: string;
}

const BiometricLockScreen: React.FC<BiometricLockScreenProps> = ({ isLocked, onUnlock, userName }) => {
  const { capability, verify } = useBiometric();
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = useCallback(async () => {
    setVerifying(true);
    setError(null);
    const success = await verify();
    if (success) {
      onUnlock();
    } else {
      setError("Verification failed. Please try again.");
    }
    setVerifying(false);
  }, [verify, onUnlock]);

  const BiometricIcon = capability.type === "face" ? ScanFace : Fingerprint;

  return (
    <AnimatePresence>
      {isLocked && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/95 backdrop-blur-3xl" />

          {/* Ambient orbs */}
          <motion.div
            className="absolute top-[20%] left-[30%] w-[400px] h-[400px] rounded-full blur-[200px]"
            style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.08), transparent 70%)" }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm"
          >
            {/* Lock icon */}
            <motion.div
              className="relative mb-8"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="h-24 w-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center relative">
                <Lock className="h-10 w-10 text-primary" />
                <motion.div
                  className="absolute inset-0 rounded-3xl border-2 border-primary/30"
                  animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </motion.div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">
              Vault Locked
            </h1>
            {userName && (
              <p className="text-sm text-muted-foreground/50 mb-6">
                Welcome back, <span className="text-foreground/70">{userName}</span>
              </p>
            )}

            {/* Biometric button */}
            <Button
              onClick={handleUnlock}
              disabled={verifying}
              className={cn(
                "h-14 px-8 rounded-2xl gap-3 text-base font-semibold btn-premium",
                "bg-primary hover:bg-primary/90 text-primary-foreground",
                "shadow-lg shadow-primary/20"
              )}
            >
              {verifying ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <BiometricIcon className="h-5 w-5" />
              )}
              {verifying ? "Verifying..." : `Unlock with ${capability.label}`}
            </Button>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-destructive mt-4"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Branding */}
            <div className="mt-12 flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary/40" />
              <span className="text-[11px] text-muted-foreground/30 font-medium">
                Adi<span className="text-primary/50">Nox</span> Security Vault
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BiometricLockScreen;
