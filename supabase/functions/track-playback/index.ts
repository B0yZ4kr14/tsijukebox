import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrackPlaybackData {
  track_id: string;
  track_name: string;
  artist_name: string;
  album_name?: string;
  album_art?: string;
  provider: string;
  duration_ms?: number;
  completed?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method === 'POST') {
      // Record a new playback event
      const body: TrackPlaybackData = await req.json();
      
      if (!body.track_id || !body.track_name || !body.artist_name || !body.provider) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: track_id, track_name, artist_name, provider' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabase.from('playback_stats').insert({
        track_id: body.track_id,
        track_name: body.track_name,
        artist_name: body.artist_name,
        album_name: body.album_name || null,
        album_art: body.album_art || null,
        provider: body.provider,
        duration_ms: body.duration_ms || null,
        completed: body.completed || false,
        user_agent: req.headers.get('user-agent') || null,
        client_ip: req.headers.get('x-forwarded-for')?.split(',')[0] || null
      }).select().single();

      if (error) {
        console.error('Error recording playback:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to record playback', details: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Recorded playback: ${body.track_name} by ${body.artist_name}`);
      
      return new Response(
        JSON.stringify({ success: true, data }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'GET') {
      // Get aggregated statistics
      const url = new URL(req.url);
      const period = url.searchParams.get('period') || 'week';
      
      let startDate: Date | null = null;
      const now = new Date();
      
      switch (period) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(now);
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'all':
          startDate = null;
          break;
      }

      let query = supabase
        .from('playback_stats')
        .select('*')
        .order('played_at', { ascending: false });

      if (startDate) {
        query = query.gte('played_at', startDate.toISOString());
      }

      const { data: plays, error } = await query.limit(1000);

      if (error) {
        console.error('Error fetching stats:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch statistics', details: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Calculate aggregated stats
      const uniqueTracks = new Set(plays?.map(p => p.track_id) || []);
      const uniqueArtists = new Set(plays?.map(p => p.artist_name) || []);
      const totalMinutes = (plays || []).reduce((acc, p) => acc + ((p.duration_ms || 0) / 60000), 0);

      // Top tracks
      const trackCounts: Record<string, any> = {};
      for (const p of plays || []) {
        if (!trackCounts[p.track_id]) {
          trackCounts[p.track_id] = {
            track_id: p.track_id,
            track_name: p.track_name,
            artist_name: p.artist_name,
            album_art: p.album_art,
            plays: 0
          };
        }
        trackCounts[p.track_id].plays++;
      }

      const topTracks = Object.values(trackCounts)
        .sort((a: any, b: any) => b.plays - a.plays)
        .slice(0, 10);

      // Top artists
      const artistCounts: Record<string, any> = {};
      for (const p of plays || []) {
        if (!artistCounts[p.artist_name]) {
          artistCounts[p.artist_name] = { artist_name: p.artist_name, plays: 0 };
        }
        artistCounts[p.artist_name].plays++;
      }

      const topArtists = Object.values(artistCounts)
        .sort((a: any, b: any) => b.plays - a.plays)
        .slice(0, 10);

      // Hourly activity
      const hourlyCounts: Record<number, number> = {};
      for (const p of plays || []) {
        const hour = new Date(p.played_at).getHours();
        hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
      }

      const hourlyActivity = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        count: hourlyCounts[hour] || 0
      }));

      // Provider stats
      const providerCounts: Record<string, number> = {};
      for (const p of plays || []) {
        providerCounts[p.provider] = (providerCounts[p.provider] || 0) + 1;
      }

      const providerStats = Object.entries(providerCounts).map(([provider, plays]) => ({
        provider,
        plays
      }));

      const stats = {
        totalPlays: plays?.length || 0,
        uniqueTracks: uniqueTracks.size,
        uniqueArtists: uniqueArtists.size,
        totalMinutes: Math.round(totalMinutes),
        topTracks,
        topArtists,
        hourlyActivity,
        recentPlays: (plays || []).slice(0, 20),
        providerStats,
        period
      };

      return new Response(
        JSON.stringify(stats),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
