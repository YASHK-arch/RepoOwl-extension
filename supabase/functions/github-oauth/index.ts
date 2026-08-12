import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * GitHub OAuth Token Exchange Edge Function
 *
 * This function securely exchanges a GitHub OAuth authorization code
 * for an access token. The Client Secret never leaves this server.
 *
 * Required Secrets (set via: supabase secrets set KEY=value):
 *   - GITHUB_CLIENT_ID
 *   - GITHUB_CLIENT_SECRET
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { code, redirectUri } = await req.json();

    if (!code || !redirectUri) {
      return new Response(
        JSON.stringify({ error: "Missing code or redirectUri" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const clientId = Deno.env.get("GITHUB_CLIENT_ID");
    const clientSecret = Deno.env.get("GITHUB_CLIENT_SECRET");

    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ error: "GitHub OAuth credentials are not configured on the server." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Exchange the authorization code for an access token with GitHub
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      return new Response(
        JSON.stringify({ error: `GitHub OAuth error: ${tokenData.error_description || tokenData.error}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Verify the token is real by fetching the authenticated user
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        "Authorization": `Bearer ${tokenData.access_token}`,
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "RepoOwl-Extension",
      },
    });

    if (!userRes.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to verify GitHub access token." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const userData = await userRes.json();

    return new Response(
      JSON.stringify({
        access_token: tokenData.access_token,
        scope: tokenData.scope,
        login: userData.login,
        avatar_url: userData.avatar_url,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
