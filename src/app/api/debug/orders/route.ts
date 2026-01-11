import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Exakt die gleiche Query wie in orders/page.tsx
  const { data, count, error } = await supabase
    .from('Auftrag')
    .select('*, Kunde(id, name, firma)', { count: 'exact' })
    .order('liefertermin', { ascending: true })
    .range(0, 24);

  return Response.json({
    env: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
    },
    count,
    error: error?.message || null,
    orders: data?.map(o => ({
      auftragsnummer: o.auftragsnummer,
      produkttyp: o.produkttyp,
      status: o.status,
      kunde: o.Kunde,
    })) || [],
  });
}
