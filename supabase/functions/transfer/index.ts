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
    const senderId = userData.user.id;

    const body = await req.json();
    const recipientEmail = String(body.recipient_email || '').trim().toLowerCase();
    const amount = Number(body.amount);
    const currency = String(body.currency || 'USD').toUpperCase();
    const note = String(body.note || '');

    if (!recipientEmail) throw new Error('Recipient email is required');
    if (!['USD', 'EUR'].includes(currency)) throw new Error('Invalid currency');
    if (!amount || amount <= 0) throw new Error('Amount must be greater than zero');
    if (userData.user.email?.toLowerCase() === recipientEmail) {
      throw new Error("You can't send money to yourself");
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const { data: sender, error: sErr } = await admin
      .from('profiles')
      .select('id, email, balance_usd, balance_eur')
      .eq('id', senderId)
      .maybeSingle();
    if (sErr) throw sErr;
    if (!sender) throw new Error('Sender profile not found');

    const { data: recipient, error: rErr } = await admin
      .from('profiles')
      .select('id, email, balance_usd, balance_eur')
      .eq('email', recipientEmail)
      .maybeSingle();
    if (rErr) throw rErr;
    if (!recipient) throw new Error(`No Vault user found with email ${recipientEmail}`);

    const balCol = currency === 'USD' ? 'balance_usd' : 'balance_eur';
    const senderBal = Number(sender[balCol]);
    if (senderBal < amount) throw new Error('Insufficient balance');

    const { error: debitErr } = await admin
      .from('profiles')
      .update({ [balCol]: Number(sender[balCol]) - amount })
      .eq('id', senderId);
    if (debitErr) throw debitErr;

    const { error: creditErr } = await admin
      .from('profiles')
      .update({ [balCol]: Number(recipient[balCol]) + amount })
      .eq('id', recipient.id);
    if (creditErr) throw creditErr;

    const { error: txErr } = await admin.from('transactions').insert({
      sender_id: senderId,
      recipient_id: recipient.id,
      recipient_email: recipient.email,
      amount,
      currency,
      status: 'completed',
      note,
    });
    if (txErr) throw txErr;

    return new Response(
      JSON.stringify({ success: true, amount, currency, recipient: recipient.email }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Transfer failed' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
