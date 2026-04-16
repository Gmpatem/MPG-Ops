import { BusinessSetupForm } from '@/components/forms/business-setup-form';

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-6 sm:py-10">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Set up your business</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tell us about your business to get started with MPG Ops
          </p>
        </div>
        <BusinessSetupForm />
      </div>
    </div>
  );
}
