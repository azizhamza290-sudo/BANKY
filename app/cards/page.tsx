'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Loader2, Plus, ShieldCheck } from 'lucide-react';
import AppShell from '@/components/app-shell';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type VCard = {
  id: string;
  card_number: string;
  card_holder: string;
  expiry: string;
  cvv: string;
  currency: string;
  status: string;
  created_at: string;
};

function genNumber() {
  const seg = () => Math.floor(1000 + Math.random() * 9000);
  return `${seg()} ${seg()} ${seg()} ${seg()}`;
}
function genExpiry() {
  const m = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const y = String(new Date().getFullYear() + 4).slice(-2);
  return `${m}/${y}`;
}
const genCvv = () => String(Math.floor(Math.random() * 900) + 100);

export default function CardsPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [cards, setCards] = useState<VCard[]>([]);
  const [creating, setCreating] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('virtual_cards')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setCards((data as VCard[]) ?? []));
  }, [user]);

  if (loading || !profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const createCard = async () => {
    setCreating(true);
    const { data, error } = await supabase
      .from('virtual_cards')
      .insert({
        user_id: user!.id,
        card_number: genNumber(),
        card_holder: (profile.full_name || profile.email).toUpperCase(),
        expiry: genExpiry(),
        cvv: genCvv(),
        currency: 'USD',
        status: 'active',
      })
      .select()
      .single();
    setCreating(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setCards([data as VCard, ...cards]);
    toast.success('Virtual card issued');
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6 p-6 fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Virtual cards</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Issue a digital card for online spending.
            </p>
          </div>
          <Button onClick={createCard} disabled={creating} className="gap-2">
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            New card
          </Button>
        </div>

        {cards.length === 0 ? (
          <Card className="flex flex-col items-center justify-center gap-4 p-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">No cards yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Issue your first virtual card to start spending online.
              </p>
            </div>
            <Button onClick={createCard} disabled={creating} className="gap-2">
              <Plus className="h-4 w-4" /> Issue a card
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {cards.map((c) => {
              const isRevealed = revealed[c.id];
              return (
                <div key={c.id} className="space-y-3 fade-in">
                  <div className="card-shine relative aspect-[1.586] rounded-2xl p-6 text-white shadow-xl">
                    <div className="relative z-10 flex h-full flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <div className="flex h-8 w-10 items-center justify-center rounded bg-yellow-400/90">
                          <span className="text-[10px] font-bold text-black">VISA</span>
                        </div>
                        <ShieldCheck className="h-5 w-5 text-white/60" />
                      </div>
                      <div className="space-y-3">
                        <div className="h-8 w-12 rounded bg-gradient-to-br from-yellow-300/80 to-yellow-500/80" />
                        <p className="font-mono text-lg tracking-widest">
                          {isRevealed ? c.card_number : `•••• •••• •••• ${c.card_number.slice(-4)}`}
                        </p>
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-[10px] uppercase tracking-wide text-white/60">Card holder</p>
                            <p className="text-sm font-medium">{c.card_holder}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wide text-white/60">Expires</p>
                            <p className="text-sm font-medium">{isRevealed ? c.expiry : '••/••'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wide text-white/60">CVV</p>
                            <p className="text-sm font-medium">{isRevealed ? c.cvv : '•••'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {c.currency} • {c.status}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRevealed((r) => ({ ...r, [c.id]: !r[c.id] }))}
                    >
                      {isRevealed ? 'Hide' : 'Reveal'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground">
          Virtual cards are display-only and not linked to real payment networks.
        </p>
      </div>
    </AppShell>
  );
}
