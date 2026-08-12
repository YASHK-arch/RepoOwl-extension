import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * Supabase OAuth Token Exchange Edge Function
 *
 * This function securely exchanges a Supabase OAuth authorization code
 * for a Management API access token, then fetches the user's projects list.
 * The Client Secret never leaves this server.
 *
 * Required Secrets (set via: supabase secrets set KEY=value):
 *   - SPB_OAUTH_CLIENT_ID
 *   - SPB_OAUTH_CLIENT_SECRET
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

    const clientId = Deno.env.get("SPB_OAUTH_CLIENT_ID");
    const clientSecret = Deno.env.get("SPB_OAUTH_CLIENT_SECRET");

    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ error: "Supabase OAuth credentials are not configured on the server." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Exchange the authorization code for a Management API access token
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    });

    const tokenRes = await fetch("https://api.supabase.com/v1/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!tokenRes.ok) {
      const body = await tokenRes.text();
      return new Response(
        JSON.stringify({ error: `Supabase token exchange failed: ${body}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Use the access token to list the user's Supabase projects
    const projectsRes = await fetch("https://api.supabase.com/v1/projects", {
      headers: { "Authorization": `Bearer ${accessToken}` },
    });

    if (!projectsRes.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to list Supabase projects with the obtained token." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const projects = await projectsRes.json();

    // Return the access token and the list of projects to the extension.
    // The extension will prompt the user to pick one, then call /supabase-provision.
    return new Response(
      JSON.stringify({
        access_token: accessToken,
        projects: projects.map((p: any) => ({
          id: p.id,
          name: p.name,
          region: p.region,
          organization_id: p.organization_id,
        })),
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
