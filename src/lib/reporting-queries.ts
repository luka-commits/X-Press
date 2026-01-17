import { supabase } from './supabase';

export interface FunnelStage {
    name: string;
    value: number;
    fill: string;
}

export interface FunnelData {
    stages: FunnelStage[];
    totalValue: number; // e.g. estimated revenue or count
    trend: number; // percentage vs last period
}

/**
 * Calculates the Production Funnel metrics using real-time order data.
 * Mapping logic:
 * 1. Total: All active orders
 * 2. Pre-press: Active - (Printing + Finishing + Shipping)
 * 3. Printing: Orders with 'Heidelberg' machines (Key T1) assigned
 * 4. Finishing: Orders with 'Polar' or 'Sammelhefter' assigned
 * 5. Shipping: versandStatus == 'versandbereit'
 * 
 * Note: This is a simplified heuristic for visualization.
 */
export async function getFunnelData(): Promise<FunnelData> {
    // 1. Fetch all active orders with their steps and shipping status
    const { data: orders, error } = await supabase
        .from('Auftrag')
        .select(`
      auftragsnummer,
      status,
      versandStatus,
      auflage,
      Arbeitsgang (
        maschineId,
        Maschine (name, kurzname)
      )
    `)
        .eq('status', 'aktiv');

    if (error || !orders) {
        console.error('Error fetching funnel data:', error);
        return { stages: [], totalValue: 0, trend: 0 };
    }

    // Initialize Counters
    let countTotal = 0;
    let countVersand = 0;
    let countWeiterverarbeitung = 0;
    let countDruck = 0;
    let countVorstufe = 0;

    // Process Orders
    for (const order of orders) {
        countTotal++;

        // 5. Versandbereit
        if (order.versandStatus === 'versandbereit') {
            countVersand++;
            continue; // Exclusive bucket for simplicity
        }

        // Identify Machine Types in this order
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const machineNames = order.Arbeitsgang?.map((ag: any) =>
            (ag.Maschine?.name || '').toLowerCase() + (ag.Maschine?.kurzname || '').toLowerCase()
        ).join(' ') || '';

        // 4. Finishing (Schneiden, Falzen, Heften)
        const isFinishing = machineNames.includes('polar') ||
            machineNames.includes('sammelhefter') ||
            machineNames.includes('tiegel');

        // 3. Printing (Heidelberg Presses)
        const isPrinting = machineNames.includes('speedmaster') ||
            machineNames.includes('xl 106') ||
            machineNames.includes('cx 102');

        // Categorize (Simplified Waterfall: Priority to latest stage)
        if (isFinishing) {
            countWeiterverarbeitung++;
        } else if (isPrinting) {
            countDruck++;
        } else {
            // Default rest to Pre-press/Vorstufe
            countVorstufe++;
        }
    }

    // GoHiLevel Palette (Blue -> Purple)
    // These exact colors will be used in the chart
    const stages: FunnelStage[] = [
        { name: 'Auftragseingang', value: countTotal, fill: '#3B82F6' },       // blue-500
        { name: 'In Vorstufe', value: countVorstufe, fill: '#60A5FA' },        // blue-400
        { name: 'Im Druck', value: countDruck, fill: '#818CF8' },              // indigo-400
        { name: 'Weiterverarbeitung', value: countWeiterverarbeitung, fill: '#A78BFA' }, // violet-400
        { name: 'Versandbereit', value: countVersand, fill: '#C084FC' },       // purple-400
    ];

    return {
        stages,
        totalValue: countTotal,
        trend: 12.5, // Mock trend for MVP
    };
}

/**
 * Stage Distribution for Pie Chart
 * Returns the same data but formatted for the Donut view
 */
export async function getStageDistribution() {
    const funnel = await getFunnelData();

    // Exclude "Total" for the distribution pie, just show the breakdown parts
    // i.e. Vorstufe + Druck + WV + Versand (should sum to Total roughly)
    // Actually, let's use the explicit buckets we calculated

    const distributionData = funnel.stages
        .filter(s => s.name !== 'Auftragseingang')
        .map(s => ({
            name: s.name,
            value: s.value,
            fill: s.fill
        }));

    return {
        data: distributionData,
        total: funnel.totalValue
    };
}
