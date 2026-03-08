import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export type BiometricCapability = {
  available: boolean;
  type: "face" | "fingerprint" | "iris" | "unknown";
  label: string;
  icon: string;
};

async function detectBiometricCapabilities(): Promise<BiometricCapability> {
  if (!window.PublicKeyCredential) {
    return { available: false, type: "unknown", label: "Not Supported", icon: "ban" };
  }
  try {
    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    if (!available) {
      return { available: false, type: "unknown", label: "No Biometric Hardware", icon: "ban" };
    }
    const ua = navigator.userAgent.toLowerCase();
    const platform = navigator.platform?.toLowerCase() || "";

    if (/iphone|ipad/.test(ua) || /mac/.test(platform)) {
      if (/iphone/.test(ua)) {
        return window.screen.height >= 812
          ? { available: true, type: "face", label: "Face ID", icon: "scan-face" }
          : { available: true, type: "fingerprint", label: "Touch ID", icon: "fingerprint" };
      }
      return { available: true, type: "fingerprint", label: "Touch ID", icon: "fingerprint" };
    }
    if (/android/.test(ua)) {
      return { available: true, type: "fingerprint", label: "Biometric Unlock", icon: "fingerprint" };
    }
    if (/win/.test(platform)) {
      return { available: true, type: "face", label: "Windows Hello", icon: "scan-face" };
    }
    return { available: true, type: "fingerprint", label: "Biometric Auth", icon: "fingerprint" };
  } catch {
    return { available: false, type: "unknown", label: "Detection Failed", icon: "ban" };
  }
}

function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = "";
  for (const byte of bytes) str += String.fromCharCode(byte);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function base64urlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  const padded = pad ? base64 + "=".repeat(4 - pad) : base64;
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function getDeviceName(): string {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (/Mac/.test(ua)) return "MacBook";
  if (/Windows/.test(ua)) return "Windows PC";
  if (/Android/.test(ua)) return "Android Device";
  if (/Linux/.test(ua)) return "Linux Device";
  return "Unknown Device";
}

async function invokeEdge(action: string, body?: Record<string, unknown>) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const url = `https://${projectId}.supabase.co/functions/v1/biometric-auth/${action}`;

  const res = await fetch(url, {
    method: body ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Edge function error");
  return json;
}

export function useBiometric() {
  const { user } = useAuth();
  const [capability, setCapability] = useState<BiometricCapability>({
    available: false, type: "unknown", label: "Detecting...", icon: "loader",
  });
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolledDevices, setEnrolledDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    detectBiometricCapabilities().then(setCapability);
  }, []);

  const fetchEnrolled = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { devices } = await invokeEdge("devices");
      setEnrolledDevices(devices || []);
      setIsEnrolled((devices || []).length > 0);
    } catch {
      // Fallback to direct query
      const { data } = await supabase
        .from("biometric_credentials" as any)
        .select("*")
        .eq("user_id", user.id);
      const creds = (data as any[]) || [];
      setEnrolledDevices(creds);
      setIsEnrolled(creds.length > 0);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchEnrolled(); }, [fetchEnrolled]);

  const enroll = useCallback(async (): Promise<boolean> => {
    if (!user || !capability.available) return false;
    try {
      // 1. Get challenge from server
      const challengeData = await invokeEdge("register-challenge");
      const challenge = base64urlToBuffer(challengeData.challenge);
      const userId = new TextEncoder().encode(user.id);

      // 2. Create credential with platform authenticator
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: challengeData.rpName, id: window.location.hostname },
          user: {
            id: userId,
            name: challengeData.userName,
            displayName: challengeData.displayName,
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" },
            { alg: -257, type: "public-key" },
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
            residentKey: "preferred",
          },
          excludeCredentials: (challengeData.excludeCredentials || []).map((id: string) => ({
            id: base64urlToBuffer(id),
            type: "public-key" as const,
          })),
          timeout: 60000,
          attestation: "none",
        },
      }) as PublicKeyCredential;

      if (!credential) return false;

      const response = credential.response as AuthenticatorAttestationResponse;
      const credentialId = bufferToBase64url(credential.rawId);
      const publicKey = bufferToBase64url(response.getPublicKey?.() || new ArrayBuffer(0));

      // 3. Verify with server and store
      await invokeEdge("register-verify", {
        credentialId,
        publicKey,
        deviceName: getDeviceName(),
        authenticatorType: capability.type,
      });

      await fetchEnrolled();
      return true;
    } catch (e) {
      console.error("Biometric enrollment failed:", e);
      return false;
    }
  }, [user, capability, fetchEnrolled]);

  const verify = useCallback(async (): Promise<boolean> => {
    if (!user || enrolledDevices.length === 0) return false;
    try {
      // 1. Get challenge from server
      const challengeData = await invokeEdge("auth-challenge");
      const challenge = base64urlToBuffer(challengeData.challenge);

      const allowCredentials = (challengeData.allowCredentials || []).map((id: string) => ({
        id: base64urlToBuffer(id),
        type: "public-key" as const,
        transports: ["internal" as const],
      }));

      // 2. Get assertion from authenticator
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials,
          userVerification: "required",
          timeout: 60000,
          rpId: window.location.hostname,
        },
      }) as PublicKeyCredential;

      if (!assertion) return false;

      const credentialId = bufferToBase64url(assertion.rawId);

      // 3. Verify with server
      const result = await invokeEdge("auth-verify", { credentialId });
      return result.verified === true;
    } catch (e) {
      console.error("Biometric verification failed:", e);
      return false;
    }
  }, [user, enrolledDevices]);

  const removeCredential = useCallback(async (deviceId: string) => {
    if (!user) return;
    try {
      await invokeEdge("remove-device", { deviceId });
    } catch {
      // Fallback
      await supabase
        .from("biometric_credentials" as any)
        .delete()
        .eq("id", deviceId)
        .eq("user_id", user.id);
    }
    await fetchEnrolled();
  }, [user, fetchEnrolled]);

  return {
    capability,
    isEnrolled,
    enrolledDevices,
    loading,
    enroll,
    verify,
    removeCredential,
    refetch: fetchEnrolled,
  };
}
