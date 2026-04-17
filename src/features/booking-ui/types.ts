import type { PublicService } from '@/app/actions/public-booking';

export interface WizardState {
  step: 1 | 2 | 3 | 4 | 5 | 6;
  services: PublicService[];
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  name: string;
  phone: string;
  email: string;
  notes: string;
}

export interface BookingWizardProps {
  business: import('@/app/actions/public-booking').PublicBusiness;
  services: PublicService[];
}
