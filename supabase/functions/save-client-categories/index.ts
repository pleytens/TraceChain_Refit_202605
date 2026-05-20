const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const { client_id, categories } = await req.json();

    if (!client_id || !Array.isArray(categories)) {
      return new Response(JSON.stringify({ error: 'client_id and categories are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    const headers = {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    };

    // Delete existing categories for this client
    await fetch(
      `${supabaseUrl}/rest/v1/tc_client_action_categories?client_id=eq.${encodeURIComponent(client_id)}`,
      { method: 'DELETE', headers }
    );

    // Insert new categories (skip empty names)
    const toInsert = categories
      .filter((c: { name?: string }) => c.name?.trim())
      .map((c: { name: string; description?: string; sort_order?: number }, i: number) => ({
        client_id,
        name: c.name.trim(),
        description: c.description?.trim() ?? '',
        sort_order: c.sort_order ?? i,
        is_active: true,
      }));

    if (toInsert.length > 0) {
      const insertRes = await fetch(
        `${supabaseUrl}/rest/v1/tc_client_action_categories`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(toInsert),
        }
      );

      if (!insertRes.ok) {
        const err = await insertRes.json();
        throw new Error(err.message ?? 'Insert failed');
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
