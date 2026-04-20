import type { PublicService } from '@/app/actions/public-booking';
import type { UploadedPublicPaymentProof } from '@/app/actions/public-booking';

export type BookingPaymentChoice = 'pay_now' | 'pay_on_site';

export interface WizardState {
  step: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  services: PublicService[];
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  name: string;
  phone: string;
  email: string;
  notes: string;
  paymentChoice: BookingPaymentChoice;
  manualPaymentProof: UploadedPublicPaymentProof | null;
}

export interface BookingWizardProps {
  business: import('@/app/actions/public-booking').PublicBusiness;
  services: PublicService[];
}
