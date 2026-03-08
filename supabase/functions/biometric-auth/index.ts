import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// In-memory challenge store (short-lived, per-instance)
const challengeStore = new Map<string, { challenge: string; expires: number }>();

function generateChallenge(): string {
  const buffer = new Uint8Array(32);
  crypto.getRandomValues(buffer);
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const action = url.pathname.split("/").pop();
    const body = req.method === "POST" ? await req.json() : {};

    switch (action) {
      // ─── Generate a registration challenge ───
      case "register-challenge": {
        const challenge = generateChallenge();
        challengeStore.set(user.id + ":register", {
          challenge,
          expires: Date.now() + 120_000, // 2 min
        });

        // Get existing credentials to exclude
        const { data: existingCreds } = await supabase
          .from("biometric_credentials")
          .select("credential_id")
          .eq("user_id", user.id);

        return new Response(
          JSON.stringify({
            challenge,
            userId: user.id,
            userName: user.email || "user",
            displayName: user.user_metadata?.username || user.email || "User",
            excludeCredentials: (existingCreds || []).map((c: any) => c.credential_id),
            rpName: "AdiNox Vault",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ─── Verify registration and store credential ───
      case "register-verify": {
        const stored = challengeStore.get(user.id + ":register");
        if (!stored || Date.now() > stored.expires) {
          challengeStore.delete(user.id + ":register");
          return new Response(JSON.stringify({ error: "Challenge expired" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        challengeStore.delete(user.id + ":register");

        const { credentialId, publicKey, deviceName, authenticatorType } = body;
        if (!credentialId || !publicKey) {
          return new Response(JSON.stringify({ error: "Missing credential data" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { error: insertError } = await supabase
          .from("biometric_credentials")
          .insert({
            user_id: user.id,
            credential_id: credentialId,
            public_key: publicKey,
            device_name: deviceName || "Unknown Device",
            authenticator_type: authenticatorType || "platform",
          });

        if (insertError) {
          return new Response(JSON.stringify({ error: insertError.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(
          JSON.stringify({ success: true, message: "Biometric credential registered" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ─── Generate an authentication challenge ───
      case "auth-challenge": {
        const { data: creds } = await supabase
          .from("biometric_credentials")
          .select("credential_id")
          .eq("user_id", user.id);

        if (!creds || creds.length === 0) {
          return new Response(JSON.stringify({ error: "No biometric credentials enrolled" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const challenge = generateChallenge();
        challengeStore.set(user.id + ":auth", {
          challenge,
          expires: Date.now() + 120_000,
        });

        return new Response(
          JSON.stringify({
            challenge,
            allowCredentials: creds.map((c: any) => c.credential_id),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ─── Verify authentication assertion ───
      case "auth-verify": {
        const stored = challengeStore.get(user.id + ":auth");
        if (!stored || Date.now() > stored.expires) {
          challengeStore.delete(user.id + ":auth");
          return new Response(JSON.stringify({ error: "Challenge expired" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        challengeStore.delete(user.id + ":auth");

        const { credentialId } = body;
        if (!credentialId) {
          return new Response(JSON.stringify({ error: "Missing credential ID" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Verify credential exists for this user
        const { data: matchedCred } = await supabase
          .from("biometric_credentials")
          .select("id")
          .eq("user_id", user.id)
          .eq("credential_id", credentialId)
          .maybeSingle();

        if (!matchedCred) {
          return new Response(JSON.stringify({ error: "Credential not found" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Update last used
        await supabase
          .from("biometric_credentials")
          .update({ last_used_at: new Date().toISOString() })
          .eq("id", matchedCred.id);

        return new Response(
          JSON.stringify({ success: true, verified: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ─── List enrolled devices ───
      case "devices": {
        const { data: devices, error: listError } = await supabase
          .from("biometric_credentials")
          .select("id, device_name, authenticator_type, created_at, last_used_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (listError) {
          return new Response(JSON.stringify({ error: listError.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ devices: devices || [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ─── Remove a device ───
      case "remove-device": {
        const { deviceId } = body;
        if (!deviceId) {
          return new Response(JSON.stringify({ error: "Missing device ID" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { error: deleteError } = await supabase
          .from("biometric_credentials")
          .delete()
          .eq("id", deviceId)
          .eq("user_id", user.id);

        if (deleteError) {
          return new Response(JSON.stringify({ error: deleteError.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(
          JSON.stringify({ success: true, message: "Device removed" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({
            error: "Unknown action",
            availableActions: [
              "register-challenge",
              "register-verify",
              "auth-challenge",
              "auth-verify",
              "devices",
              "remove-device",
            ],
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
