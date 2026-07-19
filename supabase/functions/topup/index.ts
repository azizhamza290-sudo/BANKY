import { createClient } from 'npm:@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace('Bearer ', '');

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const amount = Number(body.amount);
    const currency = String(body.currency || 'USD').toUpperCase();
    const orderId = String(body.order_id || '');

    if (!amount || amount <= 0) throw new Error('Invalid amount');
    if (!['USD', 'EUR'].includes(currency)) throw new Error('Invalid currency');
    if (!orderId) throw new Error('Missing PayPal order id');

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const { data: profile, error: pErr } = await admin
      .from('profiles')
      .select('id, balance_usd, balance_eur')
      .eq('id', userData.user.id)
      .maybeSingle();
    if (pErr) throw pErr;
    if (!profile) throw new Error('Profile not found');

    const balCol = currency === 'USD' ? 'balance_usd' : 'balance_eur';
    const newBal = Number(profile[balCol]) + amount;

    const { error: updateErr } = await admin
      .from('profiles')
      .update({ [balCol]: newBal })
      .eq('id', userData.user.id);
    if (updateErr) throw updateErr;

    return new Response(
      JSON.stringify({ success: true, credited: amount, currency, new_balance: newBal }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Top-up failed' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
