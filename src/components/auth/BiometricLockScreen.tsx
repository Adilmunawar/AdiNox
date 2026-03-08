import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Fingerprint, ScanFace, Lock, Loader2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBiometric } from "@/hooks/useBiometric";
import { useFaceAuth } from "@/hooks/useFaceAuth";
import { cn } from "@/lib/utils";

interface BiometricLockScreenProps {
  isLocked: boolean;
  onUnlock: () => void;
  userName?: string;
}

const BiometricLockScreen: React.FC<BiometricLockScreenProps> = ({ isLocked, onUnlock, userName }) => {
  const { capability, verify, isEnrolled: bioEnrolled } = useBiometric();
  const { isEnrolled: faceEnrolled, verifyFace, initModels, modelsReady } = useFaceAuth();
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"biometric" | "face">("biometric");
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Auto-select best available mode
  useEffect(() => {
    if (!isLocked) return;
    if (bioEnrolled && capability.available) {
      setMode("biometric");
    } else if (faceEnrolled) {
      setMode("face");
      initModels();
    }
  }, [isLocked, bioEnrolled, faceEnrolled, capability.available, initModels]);

  // Start camera for face mode
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (e) {
      console.error("Camera error:", e);
      setError("Camera access denied");
    }
  }, []);

  // Cleanup camera
  useEffect(() => {
    if (!isLocked && streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      setCameraActive(false);
    }
  }, [isLocked]);

  useEffect(() => {
    if (mode === "face" && isLocked && modelsReady) {
      startCamera();
    }
  }, [mode, isLocked, modelsReady, startCamera]);

  const handleBiometricUnlock = useCallback(async () => {
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

  const handleFaceUnlock = useCallback(async () => {
    if (!videoRef.current || !cameraActive) return;
    setVerifying(true);
    setError(null);
    const success = await verifyFace(videoRef.current);
    if (success) {
      // Stop camera before unlocking
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      onUnlock();
    } else {
      setError("Face not recognized. Please try again.");
    }
    setVerifying(false);
  }, [verifyFace, onUnlock, cameraActive]);

  const BiometricIcon = capability.type === "face" ? ScanFace : Fingerprint;
  const hasBothMethods = bioEnrolled && capability.available && faceEnrolled;

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
          <div className="absolute inset-0 bg-background/95 backdrop-blur-3xl" />

          <motion.div
            className="absolute top-[20%] left-[30%] w-[400px] h-[400px] rounded-full blur-[200px]"
            style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.08), transparent 70%)" }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm w-full"
          >
            {mode === "biometric" ? (
              <>
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

                <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">Vault Locked</h1>
                {userName && (
                  <p className="text-sm text-muted-foreground/50 mb-6">
                    Welcome back, <span className="text-foreground/70">{userName}</span>
                  </p>
                )}

                <Button
                  onClick={handleBiometricUnlock}
                  disabled={verifying}
                  className={cn(
                    "h-14 px-8 rounded-2xl gap-3 text-base font-semibold btn-premium",
                    "bg-primary hover:bg-primary/90 text-primary-foreground",
                    "shadow-lg shadow-primary/20"
                  )}
                >
                  {verifying ? <Loader2 className="h-5 w-5 animate-spin" /> : <BiometricIcon className="h-5 w-5" />}
                  {verifying ? "Verifying..." : `Unlock with ${capability.label}`}
                </Button>
              </>
            ) : (
              <>
                {/* Face scan camera */}
                <div className="relative w-56 h-56 rounded-3xl overflow-hidden bg-secondary/20 border border-border/20 mb-6">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    style={{ transform: "scaleX(-1)" }}
                    playsInline
                    muted
                  />

                  {/* Face oval guide */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className={cn(
                      "w-32 h-40 rounded-[50%] border-2 border-dashed transition-all duration-500",
                      verifying ? "border-primary/60" : "border-muted-foreground/20"
                    )} />
                  </div>

                  {/* Scan line */}
                  {verifying && (
                    <motion.div
                      className="absolute left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent pointer-events-none"
                      animate={{ top: ["15%", "85%", "15%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}

                  {!cameraActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-secondary/30">
                      <Loader2 className="h-6 w-6 text-primary animate-spin" />
                    </div>
                  )}
                </div>

                <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">Face Unlock</h1>
                {userName && (
                  <p className="text-sm text-muted-foreground/50 mb-6">
                    Look at the camera, <span className="text-foreground/70">{userName}</span>
                  </p>
                )}

                <Button
                  onClick={handleFaceUnlock}
                  disabled={verifying || !cameraActive}
                  className={cn(
                    "h-14 px-8 rounded-2xl gap-3 text-base font-semibold btn-premium",
                    "bg-primary hover:bg-primary/90 text-primary-foreground",
                    "shadow-lg shadow-primary/20"
                  )}
                >
                  {verifying ? <Loader2 className="h-5 w-5 animate-spin" /> : <ScanFace className="h-5 w-5" />}
                  {verifying ? "Scanning..." : "Verify Face"}
                </Button>
              </>
            )}

            {/* Error */}
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

            {/* Switch method */}
            {hasBothMethods && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 text-xs text-muted-foreground/40 hover:text-foreground"
                onClick={() => {
                  setMode(mode === "biometric" ? "face" : "biometric");
                  setError(null);
                  if (mode === "biometric") initModels();
                }}
              >
                {mode === "biometric" ? (
                  <><Camera className="h-3.5 w-3.5 mr-1.5" /> Use Face Scan instead</>
                ) : (
                  <><Fingerprint className="h-3.5 w-3.5 mr-1.5" /> Use {capability.label} instead</>
                )}
              </Button>
            )}

            {/* Branding */}
            <div className="mt-10 flex items-center gap-2">
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
