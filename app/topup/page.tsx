'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { PlusCircle, Loader2, ShieldCheck } from 'lucide-react';
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

const PRESETS = [25, 50, 100, 250];

declare global {
  interface Window {
    paypal?: any;
  }
}

export default function TopUpPage() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();
  const [amount, setAmount] = useState('50');
  const [currency, setCurrency] = useState('USD');
  const [paypalReady, setPaypalReady] = useState(false);
  const [crediting, setCrediting] = useState(false);
  const paypalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (!paypalReady || !paypalRef.current) return;
    if (paypalRef.current.childNodes.length > 0) return;

    const amountNum = parseFloat(amount) || 0;
    if (amountNum < 1) return;

    window.paypal!.Buttons({
      style: { layout: 'vertical', color: 'green', shape: 'rect', label: 'paypal' },
      createOrder: (_data: any, actions: any) =>
        actions.order.create({
          purchase_units: [
            {
              amount: { value: (parseFloat(amount) || 0).toFixed(2), currency_code: currency },
              description: 'Vault wallet top-up',
            },
          ],
        }),
      onApprove: async (_data: any, actions: any) => {
        const details = await actions.order.capture();
        setCrediting(true);
        try {
          const { data: session } = await supabase.auth.getSession();
          const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/topup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.session?.access_token}`,
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            },
            body: JSON.stringify({
              amount: amountNum,
              currency,
              order_id: details.id,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Top-up failed');
          toast.success(`Added ${fmt(amountNum, currency)} to your wallet`);
          await refreshProfile();
          router.push('/dashboard');
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'Top-up failed');
        } finally {
          setCrediting(false);
        }
      },
      onError: (err: any) => {
        toast.error('PayPal error');
        console.error(err);
      },
    }).render(paypalRef.current);
  }, [paypalReady, amount, currency, router, refreshProfile]);

  // Clear PayPal buttons when amount/currency changes so they re-render
  useEffect(() => {
    if (paypalRef.current) paypalRef.current.innerHTML = '';
  }, [amount, currency]);

  if (loading || !profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const balance = currency === 'USD' ? Number(profile.balance_usd) : Number(profile.balance_eur);

  return (
    <AppShell>
      <Script
        src="https://www.paypal.com/sdk/js?client-id=test&currency=USD&intent=capture"
        onLoad={() => setPaypalReady(true)}
      />
      <div className="mx-auto max-w-xl space-y-6 p-6 fade-in">
        <div>
          <h1 className="text-2xl font-bold">Top up</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add money to your wallet with PayPal (sandbox).
          </p>
        </div>

        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between rounded-lg bg-primary/5 p-4">
            <div>
              <p className="text-xs text-muted-foreground">Current {currency} balance</p>
              <p className="text-xl font-bold">{fmt(balance, currency)}</p>
            </div>
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>

          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Quick amount</Label>
              <div className="grid grid-cols-4 gap-2">
                {PRESETS.map((p) => (
                  <Button
                    key={p}
                    type="button"
                    variant={amount === String(p) ? 'default' : 'outline'}
                    onClick={() => setAmount(String(p))}
                  >
                    {currency === 'EUR' ? '€' : '$'}
                    {p}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="amount">Custom amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
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

            <div className="rounded-lg border bg-secondary/50 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">You pay</span>
                <span className="font-semibold">{fmt(parseFloat(amount) || 0, currency)}</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-muted-foreground">Fee</span>
                <span className="font-semibold text-primary">Free</span>
              </div>
              <div className="mt-2 flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Credited to wallet</span>
                <span className="font-bold">{fmt(parseFloat(amount) || 0, currency)}</span>
              </div>
            </div>

            <div className="pt-2">
              {crediting ? (
                <div className="flex items-center justify-center gap-2 rounded-lg border bg-secondary/30 p-4 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Crediting your wallet…
                </div>
              ) : (
                <div ref={paypalRef} className="min-h-[120px]" />
              )}
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Sandbox mode — use a PayPal sandbox account to test. No real charges.
            </p>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
