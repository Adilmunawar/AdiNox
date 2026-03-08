import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Loader2, CheckCircle2, XCircle, ScanFace, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFaceAuth, FaceScanStatus } from "@/hooks/useFaceAuth";
import { cn } from "@/lib/utils";

interface FaceScannerProps {
  mode: "enroll" | "verify";
  onSuccess: () => void;
  onCancel?: () => void;
}

const statusMessages: Record<FaceScanStatus, string> = {
  idle: "Ready to scan",
  "loading-models": "Loading AI models...",
  "camera-ready": "Position your face in the frame",
  scanning: "Scanning your face...",
  processing: "Processing deep scan...",
  success: "Face recognized!",
  failed: "Face not recognized",
  "no-face": "No face detected. Try again.",
  error: "Something went wrong",
};

const FaceScanner: React.FC<FaceScannerProps> = ({ mode, onSuccess, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanProgress, setScanProgress] = useState({ step: 0, total: 5 });
  const { status, modelsReady, initModels, enrollFace, verifyFace } = useFaceAuth();

  // Initialize models on mount
  useEffect(() => {
    initModels();
    return () => {
      // Cleanup camera on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [initModels]);

  // Start camera
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
    }
  }, []);

  // Start camera when models ready
  useEffect(() => {
    if (modelsReady) startCamera();
  }, [modelsReady, startCamera]);

  const handleScan = useCallback(async () => {
    if (!videoRef.current || !cameraActive) return;

    if (mode === "enroll") {
      const success = await enrollFace(videoRef.current, (step, total) => {
        setScanProgress({ step, total });
      });
      if (success) {
        setTimeout(onSuccess, 1200);
      }
    } else {
      const matched = await verifyFace(videoRef.current);
      if (matched) {
        setTimeout(onSuccess, 800);
      }
    }
  }, [mode, cameraActive, enrollFace, verifyFace, onSuccess]);

  const isScanning = status === "scanning" || status === "processing" || status === "loading-models";
  const isSuccess = status === "success";
  const isFailed = status === "failed" || status === "no-face";

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Camera viewport */}
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-3xl overflow-hidden bg-secondary/20 border border-border/20">
        <video
          ref={videoRef}
          className="w-full h-full object-cover mirror"
          style={{ transform: "scaleX(-1)" }}
          playsInline
          muted
        />

        {/* Scan overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Corner brackets */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" fill="none">
            <path d="M 20 5 L 5 5 L 5 20" stroke="hsl(var(--primary))" strokeWidth="0.8" strokeLinecap="round" opacity={isScanning ? "1" : "0.4"} />
            <path d="M 80 5 L 95 5 L 95 20" stroke="hsl(var(--primary))" strokeWidth="0.8" strokeLinecap="round" opacity={isScanning ? "1" : "0.4"} />
            <path d="M 20 95 L 5 95 L 5 80" stroke="hsl(var(--primary))" strokeWidth="0.8" strokeLinecap="round" opacity={isScanning ? "1" : "0.4"} />
            <path d="M 80 95 L 95 95 L 95 80" stroke="hsl(var(--primary))" strokeWidth="0.8" strokeLinecap="round" opacity={isScanning ? "1" : "0.4"} />
          </svg>

          {/* Scan line animation */}
          {isScanning && (
            <motion.div
              className="absolute left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
              animate={{ top: ["15%", "85%", "15%"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
          )}

          {/* Face oval guide */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={cn(
              "w-44 h-56 sm:w-48 sm:h-60 rounded-[50%] border-2 border-dashed transition-all duration-500",
              isScanning ? "border-primary/60 shadow-[0_0_30px_hsl(var(--primary)/0.15)]" : 
              isSuccess ? "border-emerald-500/60 shadow-[0_0_30px_rgba(52,211,153,0.2)]" :
              isFailed ? "border-destructive/60" :
              "border-muted-foreground/20"
            )} />
          </div>

          {/* Status overlay */}
          <AnimatePresence mode="wait">
            {isSuccess && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-emerald-500/10 backdrop-blur-sm flex items-center justify-center"
              >
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                  <p className="text-sm font-bold text-emerald-400">
                    {mode === "enroll" ? "Face Enrolled!" : "Verified!"}
                  </p>
                </div>
              </motion.div>
            )}
            {isFailed && (
              <motion.div
                key="failed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-destructive/5 backdrop-blur-sm flex items-center justify-center"
              >
                <div className="flex flex-col items-center gap-2">
                  <XCircle className="h-12 w-12 text-destructive/70" />
                  <p className="text-sm font-medium text-destructive">
                    {status === "no-face" ? "No face detected" : "Not recognized"}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Not loaded yet */}
        {!cameraActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary/30">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground/50">
                {status === "loading-models" ? "Loading AI models..." : "Starting camera..."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Progress & status */}
      <div className="text-center space-y-2">
        <p className="text-sm font-medium text-foreground">
          {statusMessages[status]}
        </p>
        {status === "scanning" && mode === "enroll" && (
          <div className="flex items-center gap-2 justify-center">
            <div className="flex gap-1">
              {Array.from({ length: scanProgress.total }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 w-6 rounded-full transition-all duration-300",
                    i < scanProgress.step ? "bg-primary" : "bg-secondary/30"
                  )}
                />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground/40">
              {scanProgress.step}/{scanProgress.total}
            </span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            className="rounded-xl"
            disabled={isScanning}
          >
            Cancel
          </Button>
        )}
        {!isSuccess && (
          <Button
            onClick={handleScan}
            disabled={!cameraActive || isScanning}
            className="rounded-xl gap-2 btn-premium min-w-[160px]"
          >
            {isScanning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isFailed ? (
              <RotateCcw className="h-4 w-4" />
            ) : (
              <ScanFace className="h-4 w-4" />
            )}
            {isScanning
              ? "Scanning..."
              : isFailed
              ? "Try Again"
              : mode === "enroll"
              ? "Start Deep Scan"
              : "Verify Face"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default FaceScanner;
