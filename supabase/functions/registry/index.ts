import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method === 'POST') {
      // Maintainer Registration
      const { owner, repo, supabaseUrl, supabaseAnonKey, githubToken } = await req.json()

      if (!owner || !repo || !supabaseUrl || !supabaseAnonKey || !githubToken) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      // Verify GitHub permissions
      const githubRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'RepoOwl-Edge-Function'
        }
      });

      if (!githubRes.ok) {
        return new Response(
          JSON.stringify({ error: 'Failed to authenticate with GitHub or repository not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        )
      }

      const repoData = await githubRes.json();
      const hasPermission = repoData.permissions?.admin === true || repoData.permissions?.push === true;

      if (!hasPermission) {
        return new Response(
          JSON.stringify({ error: 'User does not have push/admin access to this repository' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        )
      }

      // Insert/Update registry
      const { error } = await supabaseClient
        .from('registry')
        .upsert({ 
          owner, 
          repo, 
          supabase_url: supabaseUrl, 
          supabase_anon_key: supabaseAnonKey 
        }, { 
          onConflict: 'owner,repo' 
        })

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    } else if (req.method === 'GET') {
      // Contributor Discovery
      const url = new URL(req.url)
      const owner = url.searchParams.get('owner')
      const repo = url.searchParams.get('repo')

      if (!owner || !repo) {
        return new Response(
          JSON.stringify({ error: 'Missing owner or repo query parameters' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      const { data, error } = await supabaseClient
        .from('registry')
        .select('supabase_url, supabase_anon_key')
        .eq('owner', owner)
        .eq('repo', repo)
        .single()

      if (error || !data) {
        return new Response(
          JSON.stringify({ error: 'Registry entry not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        )
      }

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
