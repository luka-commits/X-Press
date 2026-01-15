import { Suspense } from 'react';
import { MainLayout } from '@/components/layout';
import { OrderTable } from '@/components/orders/OrderTable';
import { OrderSearch } from '@/components/orders/OrderSearch';
import { OrderFilters } from '@/components/orders/OrderFilters';
import { supabase, type Auftrag, type Kunde } from '@/lib/supabase';
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

// Disable caching - always fetch fresh data
export const dynamic = 'force-dynamic';

const TIMEZONE = 'Europe/Berlin';

interface OrdersPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    deadline?: string;
    produkttyp?: string;
    sachbearbeiter?: string;
    page?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

type OrderWithKunde = Auftrag & {
  Kunde: Pick<Kunde, 'id' | 'name' | 'firma'> | null;
};

async function getOrders(searchParams: OrdersPageProps['searchParams']) {
  const params = await searchParams;

  const search = params.search || '';
  const status = params.status || 'all';
  const deadline = params.deadline || 'all';
  const produkttyp = params.produkttyp || '';
  const sachbearbeiter = params.sachbearbeiter || '';
  const page = parseInt(params.page || '1', 10);
  const limit = 25;
  const sortBy = params.sortBy || 'liefertermin';
  const sortOrder = (params.sortOrder || 'asc') as 'asc' | 'desc';

  // Datum-Berechnungen für Filter
  const now = toZonedTime(new Date(), TIMEZONE);
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  // Bei Kundensuche: Erst passende Kunden-IDs finden
  let kundeIds: number[] = [];
  if (search) {
    const { data: matchingKunden } = await supabase
      .from('Kunde')
      .select('id')
      .or(`name.ilike.%${search}%,firma.ilike.%${search}%`);

    kundeIds = matchingKunden?.map((k) => k.id) || [];
  }

  // Basis-Query mit Kunde-Relation
  let query = supabase
    .from('Auftrag')
    .select('*, Kunde(id, name, firma)', { count: 'exact' });

  // Status-Filter
  if (status === 'aktiv') {
    query = query.eq('status', 'aktiv');
  } else if (status === 'abgeschlossen') {
    query = query.eq('status', 'abgeschlossen');
  }

  // Deadline-Filter
  if (deadline === 'today') {
    query = query
      .gte('liefertermin', todayStart.toISOString())
      .lte('liefertermin', todayEnd.toISOString());
  } else if (deadline === 'week') {
    query = query
      .gte('liefertermin', weekStart.toISOString())
      .lte('liefertermin', weekEnd.toISOString());
  } else if (deadline === 'overdue') {
    query = query
      .lt('liefertermin', todayStart.toISOString())
      .eq('status', 'aktiv');
  }

  // Produkttyp-Filter
  if (produkttyp) {
    query = query.eq('produkttyp', produkttyp);
  }

  // Sachbearbeiter-Filter
  if (sachbearbeiter) {
    query = query.eq('sachbearbeiter', sachbearbeiter);
  }

  // Volltext-Suche (OR-Bedingung) - jetzt inkl. Kunde
  if (search) {
    // Baue OR-Bedingung: Auftragsnummer, Produkttyp, oder Kunde-ID
    let orCondition = `auftragsnummer.ilike.%${search}%,produkttyp.ilike.%${search}%`;

    // Wenn passende Kunden gefunden wurden, auch nach deren IDs filtern
    if (kundeIds.length > 0) {
      orCondition += `,kundeId.in.(${kundeIds.join(',')})`;
    }

    query = query.or(orCondition);
  }

  // Sortierung (Kunde-Sortierung nicht direkt möglich, daher Fallback)
  const sortColumn = sortBy === 'kunde' ? 'produkttyp' : sortBy;
  query = query.order(sortColumn, { ascending: sortOrder === 'asc' });

  // Pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  // Query ausführen
  const { data: orders, count, error } = await query;

  if (error) {
    console.error('Supabase error:', error);
    return { orders: [], total: 0, page, totalPages: 0 };
  }

  // Automatischer Status-Wechsel + Format für Client
  const ordersWithStatus = (orders as OrderWithKunde[] || []).map((order) => {
    let computedStatus = order.status;
    if (order.liefertermin && new Date(order.liefertermin) < todayStart && order.status === 'aktiv') {
      computedStatus = 'abgeschlossen';
    }
    return {
      auftragsnummer: order.auftragsnummer,
      produkttyp: order.produkttyp,
      liefertermin: order.liefertermin,
      status: order.status,
      computedStatus,
      istStatus: order.istStatus,
      kunde: order.Kunde ? {
        id: order.Kunde.id,
        name: order.Kunde.name,
        firma: order.Kunde.firma,
      } : null,
      _count: { arbeitsgaenge: 0 }, // Wird nicht mehr benötigt
    };
  });

  const total = count || 0;

  return {
    orders: ordersWithStatus,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

async function getProdukttypen() {
  const { data, error } = await supabase
    .from('Auftrag')
    .select('produkttyp')
    .not('produkttyp', 'is', null);

  if (error) {
    console.error('Supabase error:', error);
    return [];
  }

  // Deduplizieren und sortieren
  const allTypes = data?.map((p) => p.produkttyp).filter(Boolean) || [];
  const unique = Array.from(new Set(allTypes)) as string[];
  return unique.sort();
}

async function getSachbearbeiter() {
  const { data, error } = await supabase
    .from('Auftrag')
    .select('sachbearbeiter')
    .not('sachbearbeiter', 'is', null);

  if (error) {
    console.error('Supabase error:', error);
    return [];
  }

  // Deduplizieren und sortieren
  const allSb = data?.map((p) => p.sachbearbeiter).filter(Boolean) || [];
  const unique = Array.from(new Set(allSb)) as string[];
  return unique.sort();
}

function OrdersLoading() {
  return (
    <div className="bg-white rounded-lg p-6 border border-neutral-200">
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-neutral-100 rounded w-1/3"></div>
        <div className="h-64 bg-neutral-100 rounded"></div>
      </div>
    </div>
  );
}

async function OrdersContent({ searchParams }: OrdersPageProps) {
  const [ordersData, produkttypen, sachbearbeiter] = await Promise.all([
    getOrders(searchParams),
    getProdukttypen(),
    getSachbearbeiter(),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full lg:w-96">
          <OrderSearch />
        </div>
        <OrderFilters produkttypen={produkttypen} sachbearbeiter={sachbearbeiter} />
      </div>

      <OrderTable
        orders={ordersData.orders}
        total={ordersData.total}
        page={ordersData.page}
        totalPages={ordersData.totalPages}
      />
    </div>
  );
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  return (
    <MainLayout>
      <Suspense fallback={<OrdersLoading />}>
        <OrdersContent searchParams={searchParams} />
      </Suspense>
    </MainLayout>
  );
}
