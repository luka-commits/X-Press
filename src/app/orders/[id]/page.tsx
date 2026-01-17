import { format } from 'date-fns';
import { startOfDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { toZonedTime } from 'date-fns-tz';
import { ArrowLeft, Phone, Mail, MapPin } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { MainLayout } from '@/components/layout';
import {
  OrderStageSelector,
  IstStatusType,
  VersandStatusType,
} from '@/components/orders/OrderStageSelector';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/lib/supabase';

const TIMEZONE = 'Europe/Berlin';

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getOrder(id: string) {
  const { data: order, error } = await supabase
    .from('Auftrag')
    .select(
      `
      *,
      Kunde(*),
      Arbeitsgang(
        *,
        Maschine(*)
      )
    `
    )
    .eq('auftragsnummer', id)
    .single();

  if (error || !order) {
    console.error('Supabase error:', error);
    return null;
  }

  // Gesamtzeit berechnen
  const gesamtZeit =
    order.Arbeitsgang?.reduce(
      (sum: number, ag: { zeitMinuten: number | null }) => sum + (ag.zeitMinuten || 0),
      0
    ) || 0;

  // Computed Status berechnen
  const now = toZonedTime(new Date(), TIMEZONE);
  const todayStart = startOfDay(now);
  let computedStatus = order.status;
  if (order.liefertermin && new Date(order.liefertermin) < todayStart && order.status === 'aktiv') {
    computedStatus = 'abgeschlossen';
  }

  // Format für UI (lowercase keys für Konsistenz)
  return {
    auftragsnummer: order.auftragsnummer,
    produkttyp: order.produkttyp,
    produktbeschreibung: order.produktbeschreibung,
    liefertermin: order.liefertermin,
    drucktermin: order.drucktermin,
    wtvTermin: order.wtvTermin,
    status: order.status,
    computedStatus,
    istStatus: order.istStatus as IstStatusType,
    versandStatus: order.versandStatus as VersandStatusType,
    kunde: order.Kunde
      ? {
          id: order.Kunde.id,
          name: order.Kunde.name,
          firma: order.Kunde.firma,
          telefon: order.Kunde.telefon,
          mobil: order.Kunde.mobil,
          email: order.Kunde.email,
          adresse: order.Kunde.adresse,
        }
      : null,
    arbeitsgaenge: (order.Arbeitsgang || []).map(
      (ag: {
        id: number;
        sortOrder: number | null;
        beschreibung: string | null;
        zeitMinuten: number | null;
        Maschine: { name: string; kurzname: string | null } | null;
      }) => ({
        id: ag.id,
        sortOrder: ag.sortOrder,
        beschreibung: ag.beschreibung,
        zeitMinuten: ag.zeitMinuten,
        maschine: ag.Maschine
          ? {
              name: ag.Maschine.name,
              kurzname: ag.Maschine.kurzname,
            }
          : null,
      })
    ),
    gesamtZeit,
  };
}

function formatDate(dateString: string | null) {
  if (!dateString) return '–';
  try {
    return format(new Date(dateString), 'dd.MM.yyyy', { locale: de });
  } catch {
    return '–';
  }
}

function formatMinutes(minutes: number | null) {
  if (!minutes) return '–';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}min`;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Kopfbereich */}
        <div className="flex items-center justify-between">
          <Link href="/orders">
            <Button variant="ghost" className="text-ghl-blue">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zur Übersicht
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <OrderStageSelector
              orderId={order.auftragsnummer}
              istStatus={order.istStatus}
              versandStatus={order.versandStatus}
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Kundendaten */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-ghl-text mb-4">Kunde</h2>
            {order.kunde ? (
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-ghl-text">
                    {order.kunde.firma || order.kunde.name || '–'}
                  </p>
                  {order.kunde.firma && order.kunde.name && (
                    <p className="text-neutral-500">{order.kunde.name}</p>
                  )}
                </div>

                {(order.kunde.telefon || order.kunde.mobil) && (
                  <div className="flex items-center gap-2 text-neutral-600">
                    <Phone className="h-4 w-4" />
                    <span>{order.kunde.telefon || order.kunde.mobil}</span>
                  </div>
                )}

                {order.kunde.email && (
                  <div className="flex items-center gap-2 text-neutral-600">
                    <Mail className="h-4 w-4" />
                    <a
                      href={`mailto:${order.kunde.email}`}
                      className="text-ghl-blue hover:underline"
                    >
                      {order.kunde.email}
                    </a>
                  </div>
                )}

                {order.kunde.adresse && (
                  <div className="flex items-start gap-2 text-neutral-600">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    <span className="whitespace-pre-line">{order.kunde.adresse}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-neutral-500">Keine Kundendaten vorhanden</p>
            )}
          </div>

          {/* Produktdaten */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-ghl-text mb-4">Produkt</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-neutral-500">Produkttyp</p>
                <p className="font-medium text-ghl-text">{order.produkttyp || '–'}</p>
              </div>
              {order.produktbeschreibung && (
                <div>
                  <p className="text-sm text-neutral-500">Beschreibung</p>
                  <p className="text-ghl-text">{order.produktbeschreibung}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Termine */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-ghl-text mb-4">Termine (SOLL)</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-neutral-500">Drucktermin</p>
              <p className="font-medium text-ghl-text">{formatDate(order.drucktermin)}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">WTV-Termin</p>
              <p className="font-medium text-ghl-text">{formatDate(order.wtvTermin)}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">Liefertermin</p>
              <p className="font-medium text-ghl-text">{formatDate(order.liefertermin)}</p>
            </div>
          </div>
        </div>

        {/* Arbeitsgänge */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-ghl-text">Arbeitsgänge</h2>
            <p className="text-sm text-neutral-500">
              {order.arbeitsgaenge.length} Schritte · Gesamt:{' '}
              <span className="font-medium">{formatMinutes(order.gesamtZeit)}</span>
            </p>
          </div>

          {order.arbeitsgaenge.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Beschreibung</TableHead>
                  <TableHead>Maschine</TableHead>
                  <TableHead className="text-right">Zeit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.arbeitsgaenge.map(
                  (
                    ag: {
                      id: number;
                      sortOrder: number | null;
                      beschreibung: string | null;
                      maschine: { name: string; kurzname: string | null } | null;
                      zeitMinuten: number | null;
                    },
                    index: number
                  ) => (
                    <TableRow key={ag.id}>
                      <TableCell className="text-neutral-500">
                        {ag.sortOrder || index + 1}
                      </TableCell>
                      <TableCell>{ag.beschreibung || '–'}</TableCell>
                      <TableCell>
                        {ag.maschine ? ag.maschine.kurzname || ag.maschine.name : '–'}
                      </TableCell>
                      <TableCell className="text-right">
                        {ag.zeitMinuten ? `${Math.round(ag.zeitMinuten)} min` : '–'}
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          ) : (
            <p className="text-neutral-500">Keine Arbeitsgänge vorhanden</p>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
