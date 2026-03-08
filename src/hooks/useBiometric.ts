import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export type BiometricCapability = {
  available: boolean;
  type: "face" | "fingerprint" | "iris" | "unknown";
  label: string;
  icon: string;
};

// Detect what biometric capabilities the device supports
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

    // iOS / macOS — Face ID or Touch ID
    if (/iphone|ipad/.test(ua) || /mac/.test(platform)) {
      // Face ID devices (iPhone X+)
      if (/iphone/.test(ua)) {
        const screenHeight = window.screen.height;
        if (screenHeight >= 812) {
          return { available: true, type: "face", label: "Face ID", icon: "scan-face" };
        }
        return { available: true, type: "fingerprint", label: "Touch ID", icon: "fingerprint" };
      }
      // macOS — Touch ID on MacBooks
      return { available: true, type: "fingerprint", label: "Touch ID", icon: "fingerprint" };
    }

    // Android
    if (/android/.test(ua)) {
      return { available: true, type: "fingerprint", label: "Biometric Unlock", icon: "fingerprint" };
    }

    // Windows Hello
    if (/win/.test(platform)) {
      return { available: true, type: "face", label: "Windows Hello", icon: "scan-face" };
    }

    // Linux / Other
    return { available: true, type: "fingerprint", label: "Biometric Auth", icon: "fingerprint" };
  } catch {
    return { available: false, type: "unknown", label: "Detection Failed", icon: "ban" };
  }
}

// Convert ArrayBuffer to Base64 URL string
function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = "";
  for (const byte of bytes) str += String.fromCharCode(byte);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

// Convert Base64 URL string to ArrayBuffer
function base64urlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  const padded = pad ? base64 + "=".repeat(4 - pad) : base64;
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export function useBiometric() {
  const { user } = useAuth();
  const [capability, setCapability] = useState<BiometricCapability>({
    available: false, type: "unknown", label: "Detecting...", icon: "loader",
  });
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolledDevices, setEnrolledDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Detect capabilities
  useEffect(() => {
    detectBiometricCapabilities().then(setCapability);
  }, []);

  // Fetch enrolled credentials
  const fetchEnrolled = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("biometric_credentials" as any)
      .select("*")
      .eq("user_id", user.id);
    
    const creds = (data as any[]) || [];
    setEnrolledDevices(creds);
    setIsEnrolled(creds.length > 0);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchEnrolled(); }, [fetchEnrolled]);

  // Register a new biometric credential
  const enroll = useCallback(async (): Promise<boolean> => {
    if (!user || !capability.available) return false;

    try {
      const userId = new TextEncoder().encode(user.id);
      const challenge = crypto.getRandomValues(new Uint8Array(32));

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: "AdiNox Vault",
            id: window.location.hostname,
          },
          user: {
            id: userId,
            name: user.email || "user",
            displayName: user.user_metadata?.username || user.email || "User",
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" },   // ES256
            { alg: -257, type: "public-key" },  // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
            residentKey: "preferred",
          },
          timeout: 60000,
          attestation: "none",
        },
      }) as PublicKeyCredential;

      if (!credential) return false;

      const response = credential.response as AuthenticatorAttestationResponse;
      const credentialId = bufferToBase64url(credential.rawId);
      const publicKey = bufferToBase64url(response.getPublicKey?.() || new ArrayBuffer(0));

      // Determine device name
      const ua = navigator.userAgent;
      let deviceName = "Unknown Device";
      if (/iPhone/.test(ua)) deviceName = "iPhone";
      else if (/iPad/.test(ua)) deviceName = "iPad";
      else if (/Mac/.test(ua)) deviceName = "MacBook";
      else if (/Windows/.test(ua)) deviceName = "Windows PC";
      else if (/Android/.test(ua)) deviceName = "Android Device";
      else if (/Linux/.test(ua)) deviceName = "Linux Device";

      const { error } = await supabase.from("biometric_credentials" as any).insert({
        user_id: user.id,
        credential_id: credentialId,
        public_key: publicKey,
        device_name: deviceName,
        authenticator_type: capability.type,
      });

      if (error) throw error;

      await fetchEnrolled();
      return true;
    } catch (e) {
      console.error("Biometric enrollment failed:", e);
      return false;
    }
  }, [user, capability, fetchEnrolled]);

  // Verify biometric (re-authenticate)
  const verify = useCallback(async (): Promise<boolean> => {
    if (!user || enrolledDevices.length === 0) return false;

    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const allowCredentials = enrolledDevices.map((d: any) => ({
        id: base64urlToBuffer(d.credential_id),
        type: "public-key" as const,
        transports: ["internal" as const],
      }));

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials,
          userVerification: "required",
          timeout: 60000,
          rpId: window.location.hostname,
        },
      });

      if (!assertion) return false;

      // Update last_used_at
      const credId = bufferToBase64url((assertion as PublicKeyCredential).rawId);
      await supabase
        .from("biometric_credentials" as any)
        .update({ last_used_at: new Date().toISOString() })
        .eq("credential_id", credId)
        .eq("user_id", user.id);

      return true;
    } catch (e) {
      console.error("Biometric verification failed:", e);
      return false;
    }
  }, [user, enrolledDevices]);

  // Remove a credential
  const removeCredential = useCallback(async (credId: string) => {
    if (!user) return;
    await supabase
      .from("biometric_credentials" as any)
      .delete()
      .eq("id", credId)
      .eq("user_id", user.id);
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
