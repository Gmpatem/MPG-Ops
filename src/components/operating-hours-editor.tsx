'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
type Day = typeof DAYS[number];

type DayHours = {
  isOpen: boolean;
  open: string;
  close: string;
};

type OperatingHours = Record<Day, DayHours>;

const DAY_LABELS: Record<Day, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

const DEFAULT_HOURS: OperatingHours = {
  monday:    { isOpen: true,  open: '09:00', close: '18:00' },
  tuesday:   { isOpen: true,  open: '09:00', close: '18:00' },
  wednesday: { isOpen: true,  open: '09:00', close: '18:00' },
  thursday:  { isOpen: true,  open: '09:00', close: '18:00' },
  friday:    { isOpen: true,  open: '09:00', close: '18:00' },
  saturday:  { isOpen: true,  open: '09:00', close: '15:00' },
  sunday:    { isOpen: false, open: '09:00', close: '18:00' },
};

interface OperatingHoursEditorProps {
  initialHours?: Record<string, { isOpen: boolean; open: string; close: string }> | null;
}

export function OperatingHoursEditor({ initialHours }: OperatingHoursEditorProps) {
  const [hours, setHours] = useState<OperatingHours>(() => {
    if (initialHours && Object.keys(initialHours).length > 0) {
      return { ...DEFAULT_HOURS, ...(initialHours as OperatingHours) };
    }
    return DEFAULT_HOURS;
  });

  const updateDay = (day: Day, field: keyof DayHours, value: boolean | string) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  return (
    <div>
      <input type="hidden" name="operating_hours" value={JSON.stringify(hours)} />
      <div className="space-y-3">
        {DAYS.map((day) => {
          const dayHours = hours[day];
          return (
            <div key={day} className="flex items-center gap-3 min-h-[36px]">
              <Switch
                checked={dayHours.isOpen}
                onCheckedChange={(checked) => updateDay(day, 'isOpen', checked)}
                aria-label={`Toggle ${day}`}
                size="sm"
              />
              <span
                className={`w-8 text-sm font-medium shrink-0 ${
                  dayHours.isOpen ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {DAY_LABELS[day]}
              </span>
              {dayHours.isOpen ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    type="time"
                    value={dayHours.open}
                    onChange={(e) => updateDay(day, 'open', e.target.value)}
                    className="h-9 text-sm flex-1"
                  />
                  <span className="text-muted-foreground text-xs shrink-0">to</span>
                  <Input
                    type="time"
                    value={dayHours.close}
                    onChange={(e) => updateDay(day, 'close', e.target.value)}
                    className="h-9 text-sm flex-1"
                  />
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Closed</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
