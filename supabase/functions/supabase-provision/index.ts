import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DATABASE_SCHEMA_SQL } from "../_shared/schema.ts";

/**
 * Supabase Project Provisioning Edge Function
 *
 * Given a Management API access token and a chosen project ref, this function:
 *   1. Fetches the project's anon key and API URL.
 *   2. Runs the full DATABASE_SCHEMA_SQL migration automatically.
 *   3. Returns { supabaseUrl, supabaseAnonKey } to the extension for storage.
 *
 * This is the "magic" step that makes zero-click database setup work.
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
    const { access_token, project_ref } = await req.json();

    if (!access_token || !project_ref) {
      return new Response(
        JSON.stringify({ error: "Missing access_token or project_ref" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const mgmtHeaders = {
      "Authorization": `Bearer ${access_token}`,
      "Content-Type": "application/json",
    };

    // Step 1: Fetch the project's API keys (to get the anon key)
    const keysRes = await fetch(`https://api.supabase.com/v1/projects/${project_ref}/api-keys`, {
      headers: mgmtHeaders,
    });

    if (!keysRes.ok) {
      const body = await keysRes.text();
      return new Response(
        JSON.stringify({ error: `Failed to fetch project API keys: ${body}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const apiKeys = await keysRes.json();
    // The keys response is an array: [{ name: 'anon', api_key: '...' }, { name: 'service_role', api_key: '...' }]
    const anonKey = apiKeys.find((k: any) => k.name === "anon")?.api_key;

    if (!anonKey) {
      return new Response(
        JSON.stringify({ error: "Could not find the anon key for this project." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    const supabaseUrl = `https://${project_ref}.supabase.co`;

    // Step 2: Run the database schema migration
    const migrationRes = await fetch(`https://api.supabase.com/v1/projects/${project_ref}/database/query`, {
      method: "POST",
      headers: mgmtHeaders,
      body: JSON.stringify({ query: DATABASE_SCHEMA_SQL }),
    });

    if (!migrationRes.ok) {
      const body = await migrationRes.text();
      return new Response(
        JSON.stringify({ error: `Schema migration failed: ${body}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Step 3: Return the credentials to the extension
    return new Response(
      JSON.stringify({
        supabaseUrl,
        supabaseAnonKey: anonKey,
        projectRef: project_ref,
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
