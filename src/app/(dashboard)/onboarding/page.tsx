import { BusinessSetupForm } from '@/components/forms/business-setup-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Set up your business</CardTitle>
            <CardDescription>
              Tell us about your business to get started with MPG Ops
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BusinessSetupForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
