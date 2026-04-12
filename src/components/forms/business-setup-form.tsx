'use client';

import { useState } from 'react';
import { setupBusiness } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const businessTypes = [
  { value: 'salon', label: 'Salon', icon: '✂️' },
  { value: 'barbershop', label: 'Barbershop', icon: '💈' },
  { value: 'spa', label: 'Spa', icon: '🧘' },
];

export function BusinessSetupForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    
    const result = await setupBusiness(formData);
    
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="name">Business Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="e.g., Glamour Salon"
          required
          className="h-12"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessType">Business Type</Label>
        <Select name="businessType" required>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Select your business type" />
          </SelectTrigger>
          <SelectContent>
            {businessTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                <span className="mr-2">{type.icon}</span>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="+1 234 567 8900"
          className="h-12"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Business Email (optional)</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="business@example.com"
          className="h-12"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address (optional)</Label>
        <Input
          id="address"
          name="address"
          type="text"
          placeholder="123 Main St, City"
          className="h-12"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full h-12"
        disabled={isLoading}
      >
        {isLoading ? 'Setting up...' : 'Complete Setup'}
      </Button>
    </form>
  );
}
