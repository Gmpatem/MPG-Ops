import { notFound } from 'next/navigation';
import { getPublicBusiness, getPublicServices } from '@/app/actions/public-booking';
import { BookingWizard } from '@/components/public/booking-wizard';

interface BookingPageProps {
  params: Promise<{ businessId: string }>;
}

// oklch values for each accent — primary + primary-foreground (white)
const ACCENT_CSS: Record<string, string> = {
  blue:   '--primary: oklch(0.546 0.174 255.05); --primary-foreground: oklch(0.985 0 0); --ring: oklch(0.546 0.174 255.05);',
  green:  '--primary: oklch(0.516 0.143 151.1);  --primary-foreground: oklch(0.985 0 0); --ring: oklch(0.516 0.143 151.1);',
  purple: '--primary: oklch(0.558 0.177 291.1);  --primary-foreground: oklch(0.985 0 0); --ring: oklch(0.558 0.177 291.1);',
  rose:   '--primary: oklch(0.575 0.196 8.3);    --primary-foreground: oklch(0.985 0 0); --ring: oklch(0.575 0.196 8.3);',
};

export async function generateMetadata({ params }: BookingPageProps) {
  const { businessId } = await params;
  const business = await getPublicBusiness(businessId);
  if (!business) return { title: 'Book an Appointment' };
  return {
    title: `Book at ${business.name}`,
    description: `Book your appointment at ${business.name} online.`,
  };
}

export default async function PublicBookingPage({ params }: BookingPageProps) {
  const { businessId } = await params;

  const [business, services] = await Promise.all([
    getPublicBusiness(businessId),
    getPublicServices(businessId),
  ]);

  if (!business) {
    notFound();
  }

  const accent = business.public_site_settings?.accent;
  const accentCss = accent && accent !== 'default' && ACCENT_CSS[accent]
    ? `:root { ${ACCENT_CSS[accent]} }`
    : null;

  return (
    <>
      {accentCss && (
        <style dangerouslySetInnerHTML={{ __html: accentCss }} />
      )}
      <BookingWizard business={business} services={services} />
    </>
  );
}
