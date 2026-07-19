'use client';

import { useState, useMemo, FormEvent } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  ArrowRight,
  Globe,
  Send,
  CreditCard,
  Lock,
  Zap,
  TrendingUp,
  Users,
  Star,
  CheckCircle2,
  Wallet,
  Smartphone,
  Building2,
  User,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  AED: 3.67,
  SAR: 3.75,
};
const CURRENCY_SYMBOL: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'د.إ',
  SAR: '﷼',
};
const FEE_RATE = 0.004; // 0.4%

function fmt(n: number, c: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: c,
    maximumFractionDigits: 2,
  }).format(n);
}

export default function LandingPage() {
  const [sendAmount, setSendAmount] = useState('1000');
  const [sendCur, setSendCur] = useState('USD');
  const [recvCur, setRecvCur] = useState('EUR');

  const calc = useMemo(() => {
    const amt = parseFloat(sendAmount) || 0;
    const fee = amt * FEE_RATE;
    const converted = (amt - fee) * (RATES[recvCur] / RATES[sendCur]);
    return { amt, fee, converted };
  }, [sendAmount, sendCur, recvCur]);

  const onSubscribe = (e: FormEvent) => {
    e.preventDefault();
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Vault</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#calculator" className="hover:text-foreground transition-colors">Calculator</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#stats" className="hover:text-foreground transition-colors">Why Vault</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button className="gap-2">
                Get started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div className="fade-in">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Globe className="h-3.5 w-3.5" />
              One account. Many currencies. Zero hidden fees.
            </div>
            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Move money<br />
              <span className="text-primary">like the world</span><br />
              does business.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              Send and receive money locally and internationally in seconds. Hold USD, EUR, and more.
              Top up with PayPal, issue a virtual card, and run your finances from one secure wallet.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  Open a free account <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="gap-2">
                  <Smartphone className="h-4 w-4" /> Sign in to dashboard
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> No hidden fees
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Bank-grade security
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Instant transfers
              </div>
            </div>
          </div>

          {/* Visual: card + dashboard mock */}
          <div className="relative fade-in">
            <div className="relative mx-auto max-w-md">
              {/* Dashboard card behind */}
              <div className="absolute -right-6 -top-6 h-44 w-72 rounded-2xl border bg-card p-4 shadow-xl rotate-6 opacity-90 hidden sm:block">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Total balance</span>
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                </div>
                <p className="mt-1 text-2xl font-bold">$12,480.50</p>
                <div className="mt-3 flex gap-2">
                  <div className="flex-1 rounded-lg bg-primary/10 p-2">
                    <p className="text-[10px] text-muted-foreground">USD</p>
                    <p className="text-sm font-semibold">$8,200</p>
                  </div>
                  <div className="flex-1 rounded-lg bg-secondary p-2">
                    <p className="text-[10px] text-muted-foreground">EUR</p>
                    <p className="text-sm font-semibold">€3,950</p>
                  </div>
                </div>
                <div className="mt-3 h-12 rounded-lg bg-gradient-to-r from-primary/20 to-transparent" />
              </div>

              {/* Main card */}
              <div className="card-shine relative aspect-[1.586] rounded-3xl p-7 text-white shadow-2xl">
                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-white/60">Vault</p>
                      <p className="text-sm font-medium">Virtual Card</p>
                    </div>
                    <div className="flex h-8 w-10 items-center justify-center rounded bg-yellow-400/90">
                      <span className="text-[10px] font-bold text-black">VISA</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-9 w-12 rounded bg-gradient-to-br from-yellow-300/80 to-yellow-500/80" />
                    <p className="font-mono text-xl tracking-widest">4729 •••• •••• 3081</p>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-white/60">Card holder</p>
                        <p className="text-sm font-medium">JANE DOE</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-white/60">Expires</p>
                        <p className="text-sm font-medium">08/29</p>
                      </div>
                      <ShieldCheck className="h-6 w-6 text-white/70" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-5 -left-5 flex items-center gap-2 rounded-xl border bg-card px-4 py-3 shadow-xl">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Transfer sent</p>
                  <p className="text-sm font-bold">€920.00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Currency Calculator */}
      <section id="calculator" className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              See exactly what they receive
            </h2>
            <p className="mt-3 text-muted-foreground">
              Transparent pricing. No hidden margins. Real exchange rates.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-3xl rounded-2xl border bg-background p-6 shadow-sm sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">You send</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="1"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    className="text-lg font-semibold"
                  />
                  <Select value={sendCur} onValueChange={setSendCur}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(RATES).map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">They receive</label>
                <div className="flex gap-2">
                  <div className="flex flex-1 items-center rounded-md border bg-secondary/50 px-3 text-lg font-bold">
                    {fmt(calc.converted, recvCur)}
                  </div>
                  <Select value={recvCur} onValueChange={setRecvCur}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(RATES).map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-2 rounded-xl bg-secondary/40 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Exchange rate</span>
                <span className="font-medium">
                  1 {sendCur} = {(RATES[recvCur] / RATES[sendCur]).toFixed(4)} {recvCur}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Our fee (0.4%)</span>
                <span className="font-medium">{fmt(calc.fee, sendCur)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount received</span>
                <span className="font-bold text-primary">{fmt(calc.converted, recvCur)}</span>
              </div>
            </div>

            <Link href="/signup" className="mt-6 block">
              <Button className="w-full gap-2" size="lg">
                Send this amount <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Star className="h-3.5 w-3.5" /> Why Vault
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to manage money
            </h2>
            <p className="mt-3 text-muted-foreground">
              Built for individuals and businesses who want speed, transparency, and control.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Zap, title: 'Instant free transfers', desc: 'Send money to any Vault user by email in seconds. No fees, no delays.' },
              { icon: Lock, title: 'Secure PayPal top-ups', desc: 'Charge your wallet with PayPal Smart Buttons. Sandbox-ready, production-ready.' },
              { icon: CreditCard, title: 'Instant virtual cards', desc: 'Issue a digital card in one click for online spending and subscriptions.' },
              { icon: Building2, title: 'Personal & business', desc: 'Run both your personal and company finances from a single, unified wallet.' },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group rounded-2xl border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-lg fade-in"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary group-hover:text-white">
                    <Icon className="h-6 w-6 text-primary group-hover:text-white" />
                  </div>
                  <h3 className="mb-2 font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Account type cards */}
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border bg-gradient-to-br from-primary/5 to-transparent p-8">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Personal account</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Hold multiple currencies, send money to friends and family, and spend online with a virtual card.
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {['Free instant transfers', 'Multi-currency balances', 'Virtual card included'].map((i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" /> {i}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border bg-gradient-to-br from-primary/5 to-transparent p-8">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Business account</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Pay suppliers, manage team spending, and issue cards to employees — all from one dashboard.
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {['Team access control', 'Bulk payments', 'Accounting exports'].map((i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" /> {i}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Get started in minutes</h2>
            <p className="mt-3 text-muted-foreground">
              No paperwork. No waiting. Just sign up and start moving money.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-4">
            {[
              { icon: User, step: '01', title: 'Create your account', desc: 'Sign up with your email in under a minute. No documents required.' },
              { icon: Wallet, step: '02', title: 'Top up your wallet', desc: 'Add funds instantly with PayPal or receive money from other users.' },
              { icon: Send, step: '03', title: 'Send money', desc: 'Transfer to anyone by email. They receive it in seconds, free.' },
              { icon: CreditCard, step: '04', title: 'Activate your card', desc: 'Issue a virtual card and start spending online right away.' },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="relative fade-in">
                  {i < 3 && (
                    <div className="absolute left-full top-8 hidden h-px w-full -translate-x-8 bg-border md:block" />
                  )}
                  <div className="relative">
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-bold text-primary">{s.step}</span>
                    <h3 className="mt-1 font-semibold">{s.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Start now <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="relative overflow-hidden border-b bg-[#0a3d2e] text-white">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="relative mx-auto max-w-7xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Trusted by millions worldwide
            </h2>
            <p className="mt-3 text-white/70">
              The numbers speak for themselves. Join a global community that moves money with confidence.
            </p>
          </div>

          <div className="mt-14 grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Users, value: '8M+', label: 'Active users' },
              { icon: TrendingUp, value: '$12B+', label: 'Moved annually' },
              { icon: Globe, value: '160+', label: 'Countries served' },
              { icon: ShieldCheck, value: '100%', label: 'Secure transfers' },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="fade-in">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-4xl font-bold tracking-tight sm:text-5xl">{s.value}</p>
                  <p className="mt-2 text-sm text-white/60">{s.label}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-8 text-white/70">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-2 text-sm">4.8/5 on Trustpilot</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ShieldCheck className="h-5 w-5" /> PCI DSS compliant
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Lock className="h-5 w-5" /> 256-bit encryption
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-b">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Open your free account today
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Join millions who send, hold, and manage money without borders. It takes less than a minute.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Get started free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">Sign in</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a3d2e] text-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-10 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="text-lg font-bold">Vault</span>
              </Link>
              <p className="mt-4 max-w-sm text-sm text-white/60">
                The cheapest way to send, hold, and manage money across borders.
                One account, many currencies, zero hidden fees.
              </p>
              <div className="mt-6 flex gap-3">
                {[Twitter, Linkedin, Facebook, Instagram].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-white/20"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {[
              { title: 'Product', links: ['Personal account', 'Business account', 'Virtual cards', 'Currency calculator'] },
              { title: 'Company', links: ['About us', 'Careers', 'Press', 'Blog'] },
              { title: 'Support', links: ['Help center', 'Security', 'Terms & conditions', 'Privacy policy'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/80">{col.title}</h4>
                <ul className="space-y-3 text-sm text-white/60">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="transition-colors hover:text-white">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-white/50 sm:flex-row">
            <p>© {new Date().getFullYear()} Vault. All rights reserved.</p>
            <p>Vault is a demo product. Not a real financial institution.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
