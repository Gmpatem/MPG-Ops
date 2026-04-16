import {
  format,
  addDays,
  isToday,
  isTomorrow,
  parseISO,
  startOfDay,
} from 'date-fns';

export type OperatingHours = Record<
  string,
  { isOpen: boolean; open: string; close: string }
> | null;

const WEEKDAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

export function getDayNameFromDate(date: Date): string {
  return WEEKDAYS[date.getDay()];
}

export function parseDateString(dateStr: string): Date {
  return parseISO(dateStr);
}

export function todayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function formatTime12h(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h < 12 ? 'AM' : 'PM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

export function formatBookingDate(dateStr: string): string {
  return format(parseISO(dateStr), 'EEEE, MMMM do, yyyy');
}

export function formatShortWeekday(dateStr: string): string {
  return format(parseISO(dateStr), 'EEE');
}

export function formatDayNumber(dateStr: string): string {
  return format(parseISO(dateStr), 'd');
}

export function formatMonthDay(dateStr: string): string {
  return format(parseISO(dateStr), 'd MMM');
}

export function isBookingDateToday(dateStr: string): boolean {
  return isToday(parseISO(dateStr));
}

export function isBookingDateTomorrow(dateStr: string): boolean {
  return isTomorrow(parseISO(dateStr));
}

export interface BookingDateOption {
  value: string; // yyyy-MM-dd
  label: string; // Today | Tomorrow | Mon
  subLabel: string; // 16 Apr
}

export function getUpcomingBookingDates(days = 7): BookingDateOption[] {
  const options: BookingDateOption[] = [];
  const start = startOfDay(new Date());

  for (let i = 0; i < days; i++) {
    const d = addDays(start, i);
    const value = format(d, 'yyyy-MM-dd');
    let label: string;
    if (i === 0) label = 'Today';
    else if (i === 1) label = 'Tomorrow';
    else label = format(d, 'EEE');

    options.push({
      value,
      label,
      subLabel: format(d, 'd MMM'),
    });
  }

  return options;
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function addMinutesToTime(time: string, minutes: number): string {
  return minutesToTime(timeToMinutes(time) + minutes);
}

export function formatDurationMinutes(totalMinutes: number): string {
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export function getOperatingDay(
  dateStr: string,
  operatingHours: OperatingHours
): { isOpen: boolean; open: string; close: string } | null {
  if (!operatingHours || Object.keys(operatingHours).length === 0) return null;
  const dayName = getDayNameFromDate(parseISO(dateStr));
  const day = operatingHours[dayName];
  if (!day) return null;
  return day;
}

export function getTimeSlots(
  dateStr: string,
  operatingHours: OperatingHours,
  totalDurationMinutes: number,
  existingBookings: { start_time: string; end_time: string }[] = []
): string[] {
  const day = getOperatingDay(dateStr, operatingHours);

  let openMin = 9 * 60;
  let closeMin = 18 * 60;

  if (day) {
    if (!day.isOpen) return [];
    openMin = timeToMinutes(day.open);
    closeMin = timeToMinutes(day.close);
  }

  const slots: string[] = [];
  let cur = openMin;

  // For today, don't suggest past times
  if (isBookingDateToday(dateStr)) {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    cur = Math.max(Math.ceil((nowMin + 1) / 30) * 30, openMin);
  }

  while (cur + totalDurationMinutes <= closeMin) {
    const slotEnd = cur + totalDurationMinutes;
    const conflicts = existingBookings.some((b) => {
      const bStart = timeToMinutes(b.start_time);
      const bEnd = timeToMinutes(b.end_time);
      // Overlap if not completely before or after
      return cur < bEnd && slotEnd > bStart;
    });

    if (!conflicts) {
      slots.push(minutesToTime(cur));
    }
    cur += 30;
  }

  return slots;
}

export function computeNextAvailableSlot(
  operatingHours: OperatingHours
): string | null {
  if (!operatingHours || Object.keys(operatingHours).length === 0) return null;

  const now = new Date();

  for (let offset = 0; offset < 7; offset++) {
    const d = addDays(now, offset);
    const dayName = getDayNameFromDate(d);
    const hours = operatingHours[dayName];

    if (!hours?.isOpen) continue;

    const openMin = timeToMinutes(hours.open);
    const closeMin = timeToMinutes(hours.close);

    let slotMin: number;
    if (offset === 0) {
      const nowMin = now.getHours() * 60 + now.getMinutes();
      slotMin = Math.max(Math.ceil((nowMin + 1) / 30) * 30, openMin);
    } else {
      slotMin = openMin;
    }

    if (slotMin >= closeMin) continue;

    const timeStr = formatTime12h(minutesToTime(slotMin));

    if (offset === 0) return `Today · ${timeStr}`;
    if (offset === 1) return `Tomorrow · ${timeStr}`;
    return `${format(d, 'EEEE')} · ${timeStr}`;
  }

  return null;
}
