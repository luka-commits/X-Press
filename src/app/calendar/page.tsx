import { MainLayout } from '@/components/layout';
import { WeekNavigation, MachineCalendarGrid } from '@/components/calendar';
import {
  getMachineCapacityForWeek,
  getWeekInfo,
  getWeekStart,
} from '@/lib/calendar-queries';
import { startOfWeek } from 'date-fns';

// Revalidate every 60 seconds
export const revalidate = 60;

interface CalendarPageProps {
  searchParams: Promise<{
    year?: string;
    week?: string;
  }>;
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const params = await searchParams;

  // Determine which week to show
  let weekStart: Date;

  if (params.year && params.week) {
    // Use URL params
    weekStart = getWeekStart(parseInt(params.year), parseInt(params.week));
  } else {
    // Default to current week
    weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  }

  const weekInfo = getWeekInfo(weekStart);
  const machines = await getMachineCapacityForWeek(weekStart);

  return (
    <MainLayout
      title="Maschinen-Kalender"
      subtitle="Wochenansicht der Leitmaschinen-Auslastung"
    >
      <div className="space-y-4">
        <WeekNavigation currentWeek={weekInfo} />
        <MachineCalendarGrid machines={machines} />
      </div>
    </MainLayout>
  );
}
