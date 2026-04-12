import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <span className="font-bold text-xl">MPG Ops</span>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="container flex flex-col items-center justify-center gap-6 py-24 md:py-32">
          <h1 className="text-4xl font-bold tracking-tight text-center md:text-6xl">
            Run your service business<br />
            <span className="text-primary">without the chaos</span>
          </h1>
          <p className="max-w-[600px] text-center text-lg text-muted-foreground md:text-xl">
            MPG Ops helps salons, barbershops, and spas manage bookings, 
            customers, and revenue — all from your phone.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="h-12 px-8">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="h-12 px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="container py-16 md:py-24">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-4 text-3xl">📅</div>
              <h3 className="font-semibold mb-2">Smart Bookings</h3>
              <p className="text-sm text-muted-foreground">
                Never miss an appointment. Manage your schedule with ease.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-4 text-3xl">👥</div>
              <h3 className="font-semibold mb-2">Customer Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Know your customers. Access service history and preferences.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-4 text-3xl">💰</div>
              <h3 className="font-semibold mb-2">Revenue Insights</h3>
              <p className="text-sm text-muted-foreground">
                Track daily revenue and payments. Know your numbers.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <p>© 2026 MPG Ops. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
