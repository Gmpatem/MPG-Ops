import { getPlatformBusinessPaymentRows } from '@/app/actions/platform-payments';
import { PaymentsAdminWorkspace } from '@/components/platform/payments-admin-workspace';

export default async function PlatformPaymentsPage() {
  const businesses = await getPlatformBusinessPaymentRows();

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Payment Management</h1>
        <p className="text-sm text-muted-foreground">
          Review and correct client payment setup, country, currency, and manual methods.
        </p>
      </div>

      <PaymentsAdminWorkspace businesses={businesses} />
    </div>
  );
}
