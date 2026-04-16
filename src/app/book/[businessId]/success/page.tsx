import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, Clock, Scissors, User } from 'lucide-react';
import {
  formatTime12h,
  formatBookingDate,
  formatDurationMinutes,
} from '@/lib/booking-dates';

interface SuccessPageProps {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{
    business?: string;
    service?: string;
    services?: string;
    date?: string;
    time?: string;
    name?: string;
    duration?: string;
    price?: string;
  }>;
}

export default async function BookingSuccessPage({ params, searchParams }: SuccessPageProps) {
  const { businessId } = await params;
  const sp = await searchParams;

  const businessName = sp.business ?? 'the business';
  const servicesText = sp.services ?? sp.service ?? 'your service';
  const date = sp.date ?? '';
  const time = sp.time ?? '';
  const customerName = sp.name ?? 'you';
  const duration = sp.duration ? parseInt(sp.duration, 10) : null;
  const price = sp.price ? parseFloat(sp.price) : null;

  const details = [
    {
      icon: <Scissors className="w-4 h-4" />,
      label: 'Services',
      value: servicesText,
    },
    {
      icon: <Calendar className="w-4 h-4" />,
      label: 'Date',
      value: date ? formatBookingDate(date) : '—',
    },
    {
      icon: <Clock className="w-4 h-4" />,
      label: 'Time',
      value: time ? formatTime12h(time) : '—',
    },
    {
      icon: <User className="w-4 h-4" />,
      label: 'Name',
      value: customerName,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-sm w-full text-center">
          {/* Success icon */}
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold mb-2">You&apos;re booked!</h1>
          <p className="text-muted-foreground mb-1">
            Your appointment at{' '}
            <span className="font-semibold text-foreground">{businessName}</span>{' '}
            has been confirmed.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            We look forward to seeing you, {customerName.split(' ')[0]}.
          </p>

          {/* Booking summary card */}
          <div className="rounded-xl border bg-card overflow-hidden mb-8 text-left">
            {details.map((row, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 px-4 py-3 ${
                  i < details.length - 1 ? 'border-b' : ''
                }`}
              >
                <span className="text-muted-foreground shrink-0">{row.icon}</span>
                <span className="text-sm text-muted-foreground w-16 shrink-0">{row.label}</span>
                <span className="text-sm font-medium">{row.value}</span>
              </div>
            ))}
            {(duration !== null || price !== null) && (
              <div className="flex items-center justify-between gap-3 px-4 py-3 bg-primary/5 border-t border-primary/10">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-sm font-semibold text-primary">
                  {price !== null && `₱${price.toFixed(2)}`}
                  {price !== null && duration !== null && ' • '}
                  {duration !== null && formatDurationMinutes(duration)}
                </span>
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            Please arrive on time for your appointment. Contact the business directly if you need to cancel or reschedule.
          </p>

          <Link href={`/book/${businessId}`}>
            <Button variant="outline" className="w-full h-12">
              Book Another Appointment
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
