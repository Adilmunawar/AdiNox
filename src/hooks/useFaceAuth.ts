import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import * as faceapi from "face-api.js";

const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model";
const MATCH_THRESHOLD = 0.5; // Lower = stricter matching (euclidean distance)

let modelsLoaded = false;

async function loadModels() {
  if (modelsLoaded) return;
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);
  modelsLoaded = true;
}

export type FaceScanStatus =
  | "idle"
  | "loading-models"
  | "camera-ready"
  | "scanning"
  | "processing"
  | "success"
  | "failed"
  | "no-face"
  | "error";

export function useFaceAuth() {
  const { user } = useAuth();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<FaceScanStatus>("idle");
  const [modelsReady, setModelsReady] = useState(false);

  // Load ML models
  const initModels = useCallback(async () => {
    setStatus("loading-models");
    try {
      await loadModels();
      setModelsReady(true);
      setStatus("idle");
    } catch (e) {
      console.error("Failed to load face models:", e);
      setStatus("error");
    }
  }, []);

  // Check enrollment
  const checkEnrollment = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("user_face_data" as any)
      .select("id")
      .eq("user_id", user.id);
    setIsEnrolled(((data as any[]) || []).length > 0);
    setLoading(false);
  }, [user]);

  useEffect(() => { checkEnrollment(); }, [checkEnrollment]);

  // Extract face descriptor from video element
  const extractDescriptor = useCallback(async (
    video: HTMLVideoElement
  ): Promise<{ descriptor: Float32Array; quality: number } | null> => {
    if (!modelsLoaded) await loadModels();

    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });
    const detection = await faceapi
      .detectSingleFace(video, options)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) return null;

    const quality = detection.detection.score;
    return { descriptor: detection.descriptor, quality };
  }, []);

  // Multi-scan enrollment: captures multiple descriptors for accuracy
  const enrollFace = useCallback(async (
    video: HTMLVideoElement,
    onProgress?: (step: number, total: number) => void
  ): Promise<boolean> => {
    if (!user) return false;
    setStatus("scanning");

    const SCAN_COUNT = 5;
    const descriptors: number[][] = [];
    let bestQuality = 0;

    for (let i = 0; i < SCAN_COUNT; i++) {
      onProgress?.(i + 1, SCAN_COUNT);
      // Small delay between scans for different micro-expressions
      if (i > 0) await new Promise(r => setTimeout(r, 800));

      const result = await extractDescriptor(video);
      if (result) {
        descriptors.push(Array.from(result.descriptor));
        bestQuality = Math.max(bestQuality, result.quality);
      }
    }

    if (descriptors.length < 3) {
      setStatus("no-face");
      return false;
    }

    setStatus("processing");

    // Capture a snapshot for visual reference
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const snapshot = canvas.toDataURL("image/jpeg", 0.6);

    // Store in Supabase
    const { error } = await supabase.from("user_face_data" as any).upsert({
      user_id: user.id,
      label: "primary",
      descriptors: descriptors,
      scan_quality: bestQuality,
      image_snapshot: snapshot,
    }, { onConflict: "user_id,label" });

    if (error) {
      console.error("Failed to store face data:", error);
      setStatus("error");
      return false;
    }

    setIsEnrolled(true);
    setStatus("success");
    return true;
  }, [user, extractDescriptor]);

  // Verify face against stored descriptors
  const verifyFace = useCallback(async (video: HTMLVideoElement): Promise<boolean> => {
    if (!user) return false;
    setStatus("scanning");

    // Get stored descriptors
    const { data } = await supabase
      .from("user_face_data" as any)
      .select("descriptors")
      .eq("user_id", user.id)
      .eq("label", "primary")
      .maybeSingle();

    if (!data) {
      setStatus("failed");
      return false;
    }

    const storedDescriptors = ((data as any).descriptors as number[][]).map(
      (d: number[]) => new Float32Array(d)
    );

    // Extract current face
    const result = await extractDescriptor(video);
    if (!result) {
      setStatus("no-face");
      return false;
    }

    setStatus("processing");

    // Compare against all stored descriptors, take best match
    const distances = storedDescriptors.map((stored) =>
      faceapi.euclideanDistance(result.descriptor, stored)
    );
    const bestDistance = Math.min(...distances);
    const matched = bestDistance < MATCH_THRESHOLD;

    if (matched) {
      setStatus("success");
      // Update last_used
      await supabase
        .from("user_face_data" as any)
        .update({ updated_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("label", "primary");
    } else {
      setStatus("failed");
    }

    return matched;
  }, [user, extractDescriptor]);

  // Delete face data
  const removeFaceData = useCallback(async () => {
    if (!user) return;
    await supabase
      .from("user_face_data" as any)
      .delete()
      .eq("user_id", user.id);
    setIsEnrolled(false);
  }, [user]);

  return {
    isEnrolled,
    loading,
    status,
    modelsReady,
    initModels,
    enrollFace,
    verifyFace,
    removeFaceData,
    checkEnrollment,
  };
}
