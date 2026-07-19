'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import AppShell from '@/components/app-shell';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const fmt = (n: number, c = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: c }).format(n);

export default function SendPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading || !profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const balance = currency === 'USD' ? Number(profile.balance_usd) : Number(profile.balance_eur);
  const amountNum = parseFloat(amount) || 0;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!recipient || !amountNum) return;
    if (recipient === profile.email) {
      toast.error("You can't send money to yourself");
      return;
    }
    if (amountNum > balance) {
      toast.error('Insufficient balance');
      return;
    }
    setSending(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session?.access_token}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify({ recipient_email: recipient, amount: amountNum, currency, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Transfer failed');
      toast.success(`Sent ${fmt(amountNum, currency)} to ${recipient}`);
      setRecipient('');
      setAmount('');
      setNote('');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Transfer failed');
    } finally {
      setSending(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-xl space-y-6 p-6 fade-in">
        <div>
          <h1 className="text-2xl font-bold">Send money</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Instant transfer to any Vault user by email.
          </p>
        </div>

        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between rounded-lg bg-primary/5 p-4">
            <div>
              <p className="text-xs text-muted-foreground">Available balance</p>
              <p className="text-xl font-bold">{fmt(balance, currency)}</p>
            </div>
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient email</Label>
              <Input
                id="recipient"
                type="email"
                required
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="friend@example.com"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Note (optional)</Label>
              <Input
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What's it for?"
              />
            </div>

            {amountNum > 0 && (
              <div className="rounded-lg border bg-secondary/50 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">You send</span>
                  <span className="font-semibold">{fmt(amountNum, currency)}</span>
                </div>
                <div className="mt-1 flex justify-between">
                  <span className="text-muted-foreground">Fee</span>
                  <span className="font-semibold text-primary">Free</span>
                </div>
                <div className="mt-2 flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold">{fmt(amountNum, currency)}</span>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full gap-2" disabled={sending}>
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4" /> Send {amountNum > 0 && fmt(amountNum, currency)}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          All transfers are verified and settled server-side. Balances can&apos;t be manipulated from the browser.
        </p>
      </div>
    </AppShell>
  );
}
