'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Send,
  PlusCircle,
  CreditCard,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

import AppShell from '@/components/app-shell';
import { useAuth } from '@/components/auth-provider';
import { useTransactions } from '@/hooks/use-transactions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const fmt = (n: number, c = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: c,
  }).format(n);

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

export default function DashboardPage() {
  const router = useRouter();

  const { user, profile, loading } = useAuth();
  const { txs } = useTransactions();

  const [chartData, setChartData] = useState<
    { date: string; volume: number }[]
  >([]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    const map = new Map<string, number>();

    txs.forEach((t) => {
      const d = new Date(t.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      map.set(d, (map.get(d) ?? 0) + Number(t.amount));
    });

    setChartData(
      Array.from(map, ([date, volume]) => ({
        date,
        volume,
      })).slice(-12)
    );
  }, [txs]);

  // انتظار تحميل الجلسة فقط
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // إذا لم يوجد مستخدم
  if (!user) {
    return null;
  }

  // إذا كان المستخدم موجود لكن profile لم يتم إنشاؤه بعد
  if (!profile) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Preparing your account...
        </p>
      </div>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6 p-6 fade-in">

        <div>
          <p className="text-sm text-muted-foreground">
            Welcome back,
          </p>

          <h1 className="text-2xl font-bold">
            {profile.full_name || profile.email}
          </h1>
        </div>


        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <Card className="p-5">
            <p className="text-sm text-muted-foreground">
              USD Balance
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight">
              {fmt(Number(profile.balance_usd))}
            </p>
          </Card>


          <Card className="p-5">
            <p className="text-sm text-muted-foreground">
              EUR Balance
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight">
              {fmt(Number(profile.balance_eur), 'EUR')}
            </p>
          </Card>


          <Card className="p-5">
            <p className="text-sm text-muted-foreground">
              Transactions
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight">
              {txs.length}
            </p>
          </Card>


          <Card className="p-5">
            <p className="text-sm text-muted-foreground">
              Total moved
            </p>

            <p className="mt-2 text-3xl font-bold tracking-tight">
              {fmt(
                txs.reduce(
                  (s, t) => s + Number(t.amount),
                  0
                )
              )}
            </p>
          </Card>

        </div>


        <div className="grid gap-4 lg:grid-cols-3">

          <Card className="p-5 lg:col-span-2">

            <div className="mb-4 flex items-center justify-between">

              <div>
                <h2 className="font-semibold">
                  Activity
                </h2>

                <p className="text-sm text-muted-foreground">
                  Transfer volume over time
                </p>
              </div>

              <TrendingUp className="h-4 w-4 text-primary" />

            </div>


            <div className="h-64">

              <ResponsiveContainer width="100%" height="100%">

                <AreaChart data={chartData}>

                  <defs>

                    <linearGradient
                      id="g"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="5%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0.3}
                      />

                      <stop
                        offset="95%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0}
                      />

                    </linearGradient>

                  </defs>


                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />

                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />

                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />

                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#g)"
                  />

                </AreaChart>

              </ResponsiveContainer>

            </div>

          </Card>


          <Card className="p-5">

            <h2 className="mb-4 font-semibold">
              Quick actions
            </h2>

            <div className="space-y-2">


              <Link href="/send">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                >
                  <Send className="h-4 w-4 text-primary" />
                  Send money
                </Button>
              </Link>


              <Link href="/topup">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                >
                  <PlusCircle className="h-4 w-4 text-primary" />
                  Top up
                </Button>
              </Link>


              <Link href="/cards">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                >
                  <CreditCard className="h-4 w-4 text-primary" />
                  Virtual card
                </Button>
              </Link>


            </div>

          </Card>

        </div>


        <Card className="p-5">

          <h2 className="mb-4 font-semibold">
            Recent transactions
          </h2>


          {txs.length === 0 ? (

            <div className="py-12 text-center text-sm text-muted-foreground">
              No transactions yet. Send money or top up to get started.
            </div>

          ) : (

            <div className="divide-y">

              {txs.slice(0, 10).map((t) => {

                const sent = t.sender_id === user.id;

                const Icon = sent
                  ? ArrowUpRight
                  : ArrowDownLeft;


                return (

                  <div
                    key={t.id}
                    className="flex items-center justify-between py-3"
                  >

                    <div className="flex items-center gap-3">

                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-full',
                          sent
                            ? 'bg-destructive/10'
                            : 'bg-primary/10'
                        )}
                      >

                        <Icon
                          className={cn(
                            'h-4 w-4',
                            sent
                              ? 'text-destructive'
                              : 'text-primary'
                          )}
                        />

                      </div>


                      <div>

                        <p className="text-sm font-medium">

                          {sent ? 'To' : 'From'}{' '}
                          {t.recipient_email}

                        </p>


                        <p className="text-xs text-muted-foreground">
                          {fmtDate(t.created_at)}
                        </p>

                      </div>

                    </div>


                    <div className="text-right">

                      <p
                        className={cn(
                          'text-sm font-semibold',
                          sent
                            ? 'text-destructive'
                            : 'text-primary'
                        )}
                      >

                        {sent ? '-' : '+'}

                        {fmt(
                          Number(t.amount),
                          t.currency
                        )}

                      </p>


                      <Badge className="mt-1 text-xs">
                        {t.status}
                      </Badge>

                    </div>


                  </div>

                );

              })}

            </div>

          )}

        </Card>


      </div>
    </AppShell>
  );
}
