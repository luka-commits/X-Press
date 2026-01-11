import { MainLayout } from '@/components/layout';
import { getMachineOrdersForDay } from '@/lib/calendar-queries';
import { supabase } from '@/lib/supabase';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface CalendarDetailPageProps {
  params: Promise<{
    machineId: string;
    date: string;
  }>;
}

export default async function CalendarDetailPage({
  params,
}: CalendarDetailPageProps) {
  const { machineId, date } = await params;
  const machineIdNum = parseInt(machineId);
  const dateObj = parseISO(date);

  // Get machine info
  const { data: machine } = await supabase
    .from('Maschine')
    .select('id, name, kurzname, tageskapazitaetMinuten')
    .eq('id', machineIdNum)
    .single();

  // Get orders for this machine on this day
  const orders = await getMachineOrdersForDay(machineIdNum, dateObj);

  // Calculate totals
  const gesamtZeit = orders.reduce((sum, o) => sum + o.zeitMinuten, 0);
  const kapazitaet = machine?.tageskapazitaetMinuten || 480;
  const auslastung = Math.round((gesamtZeit / kapazitaet) * 100 * 10) / 10;

  // Format date
  const dateFormatted = format(dateObj, 'EEEE, dd. MMMM yyyy', { locale: de });

  // Ampel color
  const getStatusColor = (a: number) => {
    if (a > 90) return '#ef4444';
    if (a > 70) return '#eab308';
    return '#22c55e';
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Back button */}
        <Link
          href="/calendar"
          className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-ghl-blue transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zum Kalender
        </Link>

        {/* Summary card */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-ghl-text">
                {machine?.kurzname || machine?.name}
              </h2>
              {machine?.kurzname && (
                <p className="text-sm text-neutral-500">{machine.name}</p>
              )}
            </div>
            <div className="text-right">
              <p
                className="text-3xl font-bold"
                style={{ color: getStatusColor(auslastung) }}
              >
                {auslastung}%
              </p>
              <p className="text-sm text-neutral-500">
                {Math.round(gesamtZeit)} / {kapazitaet} min
              </p>
            </div>
          </div>

          {/* Capacity bar */}
          <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(auslastung, 100)}%`,
                backgroundColor: getStatusColor(auslastung),
              }}
            />
          </div>
        </div>

        {/* Orders list */}
        <div className="bg-white rounded-lg border border-neutral-200">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h3 className="font-semibold text-ghl-text">
              Aufträge ({orders.length})
            </h3>
          </div>

          {orders.length === 0 ? (
            <div className="p-6 text-center text-neutral-500">
              Keine Aufträge für diesen Tag geplant
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {orders.map((order) => (
                <Link
                  key={order.auftragsnummer}
                  href={`/orders/${order.auftragsnummer}`}
                  className="block px-6 py-4 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-ghl-blue">
                        {order.auftragsnummer}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {order.kunde}
                        {order.produkttyp && ` • ${order.produkttyp}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-neutral-700">
                        {Math.round(order.zeitMinuten)} min
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
