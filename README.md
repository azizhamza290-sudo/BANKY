# Vault — Digital Banking (Wise-style)

A complete digital wallet: hold USD & EUR, send money by email, top up with PayPal sandbox, and issue virtual cards. Server-side balances — the browser can never manipulate money.

## Tech
- **Next.js 13** (App Router) + TypeScript + Tailwind + shadcn/ui
- **Supabase** — Postgres database, auth, and edge functions
- **Edge functions** — `transfer` and `topup` (service-role, bypass RLS for ledger writes)
- **PayPal Smart Buttons** (sandbox mode)

## Folder structure
```
app/
  layout.tsx            Root layout + AuthProvider
  page.tsx              Landing page
  login/page.tsx        Sign in
  signup/page.tsx       Sign up
  dashboard/page.tsx    Balances, chart, transactions
  send/page.tsx         Send money (calls /functions/v1/transfer)
  topup/page.tsx        PayPal sandbox top-up (calls /functions/v1/topup)
  cards/page.tsx         Virtual cards
components/
  app-shell.tsx         Sidebar nav layout
  auth-provider.tsx     Auth context
  ui/                   shadcn/ui components
hooks/
  use-transactions.ts   Transaction fetching hook
lib/
  supabase.ts           Supabase client
supabase/functions/
  transfer/index.ts     Server-side transfer (debit/credit/ledger)
  topup/index.ts        Server-side credit after PayPal capture
```

## Database
The schema (profiles, transactions, virtual_cards) is created via a Supabase migration with row-level security. A trigger auto-creates a profile row on signup.

## Deploy to Vercel (for non-programmers)

1. **Download this project** as a ZIP from your computer, or clone it.
2. **Create a GitHub account** (free) at github.com if you don't have one.
3. **Create a new repository**:
   - Go to GitHub → click the `+` icon (top right) → **New repository**.
   - Name it `vault-bank` (or anything).
   - Choose **Private** or **Public**, then **Create repository**.
4. **Upload the files**:
   - The easiest way: install [GitHub Desktop](https://desktop.github.com/).
   - Open it → **Add an Existing Repository** → select this project folder.
   - Write a summary like "Initial commit" → click **Commit to main**.
   - Click **Publish repository**.
5. **Create a Vercel account** (free) at vercel.com — sign in with GitHub.
6. **Import the project**:
   - Vercel dashboard → **Add New…** → **Project**.
   - Find `vault-bank` in the list → **Import**.
   - Framework preset: **Next.js** (auto-detected).
   - **Environment Variables** — add these (copy values from your Supabase project → Settings → API):
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Click **Deploy**. Wait ~2 minutes.
7. **Done** — Vercel gives you a live URL like `vault-bank.vercel.app`.

## PayPal sandbox testing
The top-up page loads PayPal in sandbox mode (`client-id=test`). To test:
- Use a [PayPal sandbox personal account](https://developer.paypal.com/dashboard/applications/sandbox) at checkout.
- No real money moves. The `topup` edge function credits your wallet after the sandbox order is captured.

## Security model
- All balance changes happen in edge functions using the **service role key**, which bypasses RLS.
- The client can only **read** its own profile and transactions (RLS-enforced).
- The client can never write to `transactions` or update `profiles.balance_*` directly.
