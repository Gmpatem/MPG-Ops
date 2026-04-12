'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { FormStatus } from '@/components/form-status';

interface Customer {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
  duration_minutes: number;
}

interface BookingFormProps {
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  customers: Customer[];
  services: Service[];
}

export function BookingForm({ action, customers, services }: BookingFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedService, setSelectedService] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');

  // Calculate end time when service or start time changes
  useEffect(() => {
    if (selectedService) {
      const service = services.find(s => s.id === selectedService);
      const startTimeInput = document.getElementById('startTime') as HTMLInputElement;
      if (service && startTimeInput?.value) {
        const [hours, minutes] = startTimeInput.value.split(':').map(Number);
        const startDateTime = new Date();
        startDateTime.setHours(hours, minutes, 0, 0);
        const endDateTime = new Date(startDateTime.getTime() + service.duration_minutes * 60000);
        setEndTime(`${String(endDateTime.getHours()).padStart(2, '0')}:${String(endDateTime.getMinutes()).padStart(2, '0')}`);
      }
    }
  }, [selectedService, services]);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    setErrors({});

    // Client-side validation
    const customerId = formData.get('customerId') as string;
    const serviceId = formData.get('serviceId') as string;
    const startTime = formData.get('startTime') as string;

    const newErrors: Record<string, string> = {};

    if (!customerId) {
      newErrors.customerId = 'Please select a customer';
    }

    if (!serviceId) {
      newErrors.serviceId = 'Please select a service';
    }

    if (!startTime) {
      newErrors.startTime = 'Please select a start time';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    // Add the selected date to form data
    formData.set('bookingDate', format(selectedDate, 'yyyy-MM-dd'));

    const result = await action(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  const selectedServiceData = services.find(s => s.id === selectedService);

  return (
    <form action={handleSubmit} className="space-y-5 pt-2">
      {error && <FormStatus type="error" message={error} />}

      {/* Customer Select */}
      <div className="space-y-2">
        <Label htmlFor="customerId" className="text-sm font-medium">
          Customer *
        </Label>
        <Select name="customerId">
          <SelectTrigger className={`h-12 ${errors.customerId ? 'border-red-500' : ''}`}>
            <SelectValue placeholder="Select a customer" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.customerId && (
          <p className="text-sm text-red-600">{errors.customerId}</p>
        )}
      </div>

      {/* Service Select */}
      <div className="space-y-2">
        <Label htmlFor="serviceId" className="text-sm font-medium">
          Service *
        </Label>
        <Select name="serviceId" onValueChange={(value: string | null) => setSelectedService(value || '')}>
          <SelectTrigger className={`h-12 ${errors.serviceId ? 'border-red-500' : ''}`}>
            <SelectValue placeholder="Select a service" />
          </SelectTrigger>
          <SelectContent>
            {services.map((service) => (
              <SelectItem key={service.id} value={service.id}>
                {service.name} ({service.duration_minutes} min)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.serviceId && (
          <p className="text-sm text-red-600">{errors.serviceId}</p>
        )}
      </div>

      {/* Date Picker */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Date *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full h-12 justify-start text-left font-normal',
                !selectedDate && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Time Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime" className="text-sm font-medium">
            Start Time *
          </Label>
          <Input
            id="startTime"
            name="startTime"
            type="time"
            className={`h-12 ${errors.startTime ? 'border-red-500' : ''}`}
            onChange={(e) => {
              if (selectedServiceData && e.target.value) {
                const [hours, minutes] = e.target.value.split(':').map(Number);
                const startDateTime = new Date();
                startDateTime.setHours(hours, minutes, 0, 0);
                const endDateTime = new Date(startDateTime.getTime() + selectedServiceData.duration_minutes * 60000);
                setEndTime(`${String(endDateTime.getHours()).padStart(2, '0')}:${String(endDateTime.getMinutes()).padStart(2, '0')}`);
              }
            }}
          />
          {errors.startTime && (
            <p className="text-sm text-red-600">{errors.startTime}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">End Time</Label>
          <Input
            type="text"
            value={endTime || '--:--'}
            disabled
            className="h-12 bg-muted"
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm font-medium">
          Notes
        </Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Any special requests or notes..."
          className="min-h-[80px] resize-none"
        />
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          type="submit"
          className="w-full h-12 text-base font-medium"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Create Booking'}
        </Button>
      </div>
    </form>
  );
}
