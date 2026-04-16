import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '₱0',
    limits: ['1 business', 'Up to 10 services', 'Basic scheduling', 'MPG branding'],
  },
  {
    name: 'Pro',
    price: '₱499/mo',
    limits: ['Unlimited services', 'Custom branding', 'Multi-service booking', 'Smart scheduling', 'Customer management'],
  },
  {
    name: 'Business',
    price: '₱999/mo',
    limits: ['Everything in Pro', 'Payments integration', 'Advanced analytics', 'Priority support', 'Team/staff features (soon)'],
  },
];

export default function PlatformPlansPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Plans</h1>
        <p className="text-sm text-muted-foreground">Platform plan definitions and limits.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-base">{plan.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="text-2xl font-bold mb-4">{plan.price}</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {plan.limits.map((limit) => (
                  <li key={limit} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {limit}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
