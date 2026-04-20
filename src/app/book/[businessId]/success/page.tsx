import { notFound } from 'next/navigation';
import { getPublicBusiness } from '@/app/actions/public-booking';
import { BookingSuccessView } from '@/features/booking-ui';
import { normalizeBusinessRegionPaymentConfig } from '@/lib/business-payment-settings';

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
    currency?: string;
  }>;
}

// Accent color CSS overrides (mirrors the booking page accent injection)
const ACCENT_CSS: Record<string, string> = {
  blue:   '--primary: oklch(0.546 0.174 255.05); --primary-foreground: oklch(0.985 0 0); --ring: oklch(0.546 0.174 255.05);',
  green:  '--primary: oklch(0.516 0.143 151.1);  --primary-foreground: oklch(0.985 0 0); --ring: oklch(0.516 0.143 151.1);',
  purple: '--primary: oklch(0.558 0.177 291.1);  --primary-foreground: oklch(0.985 0 0); --ring: oklch(0.558 0.177 291.1);',
  rose:   '--primary: oklch(0.575 0.196 8.3);    --primary-foreground: oklch(0.985 0 0); --ring: oklch(0.575 0.196 8.3);',
};

export async function generateMetadata({ params }: SuccessPageProps) {
  const { businessId } = await params;
  const business = await getPublicBusiness(businessId);
  if (!business) return { title: 'Booking Confirmed' };
  return {
    title: `Booking Confirmed — ${business.name}`,
    description: `Your appointment at ${business.name} has been confirmed.`,
  };
}

export default async function BookingSuccessPage({ params, searchParams }: SuccessPageProps) {
  const { businessId } = await params;
  const sp = await searchParams;

  // Fetch business for accent color injection and name fallback
  const business = await getPublicBusiness(businessId);
  if (!business) {
    notFound();
  }

  const accent = business.public_site_settings?.accent;
  const accentCss = accent && accent !== 'default' && ACCENT_CSS[accent]
    ? `:root { ${ACCENT_CSS[accent]} }`
    : null;

  const businessName = sp.business ?? business.name ?? 'the business';
  const servicesText = sp.services ?? sp.service ?? 'your service';
  const date = sp.date ?? '';
  const time = sp.time ?? '';
  const customerName = sp.name ?? 'you';
  const duration = sp.duration ? parseInt(sp.duration, 10) : null;
  const price = sp.price ? parseFloat(sp.price) : null;
  const fallbackCurrency = normalizeBusinessRegionPaymentConfig({
    country: business.country,
    currency: business.currency,
    defaultPaymentMethod: business.default_payment_method,
    paymentSettingsRaw: business.payment_settings,
  }).currency;
  const currency = sp.currency ?? fallbackCurrency;

  return (
    <>
      {accentCss && (
        <style dangerouslySetInnerHTML={{ __html: accentCss }} />
      )}
      <BookingSuccessView
        businessId={businessId}
        businessName={businessName}
        servicesText={servicesText}
        date={date}
        time={time}
        customerName={customerName}
        duration={duration}
        price={price}
        currency={currency}
      />
    </>
  );
}
