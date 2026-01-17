import { supabase } from './supabase';

export interface FunnelStage {
    name: string;
    value: number;
    fill: string;
}

export interface FunnelData {
    stages: FunnelStage[];
    totalValue: number;
    trend: number;
}

/**
 * Calculates the Production Funnel metrics using real-time order data.
 * Uses the same pipeline stages as the Auftragsliste:
 * - Offen: No istStatus set
 * - In Produktion: istStatus = 'in_produktion'
 * - Fertig: istStatus = 'fertig'
 * - Versandbereit: versandStatus = 'versandbereit'
 * - Versendet: versandStatus = 'versendet'
 * - Problem: istStatus = 'problem'
 */
export async function getFunnelData(): Promise<FunnelData> {
    const { data: orders, error } = await supabase
        .from('Auftrag')
        .select(`
            auftragsnummer,
            status,
            istStatus,
            versandStatus
        `)
        .eq('status', 'aktiv');

    if (error || !orders) {
        console.error('Error fetching funnel data:', error);
        return { stages: [], totalValue: 0, trend: 0 };
    }

    // Initialize counters matching Auftragsliste pipeline
    let countOffen = 0;
    let countInProduktion = 0;
    let countFertig = 0;
    let countVersandbereit = 0;
    let countVersendet = 0;
    let countProblem = 0;

    // Categorize orders using same logic as OrderTable.getPipelineBadge()
    for (const order of orders) {
        // Problem overrides everything
        if (order.istStatus === 'problem') {
            countProblem++;
            continue;
        }

        // Versand phases (later pipeline stages)
        if (order.versandStatus === 'versendet') {
            countVersendet++;
            continue;
        }

        if (order.versandStatus === 'versandbereit') {
            countVersandbereit++;
            continue;
        }

        // Production phases
        if (order.istStatus === 'fertig') {
            countFertig++;
            continue;
        }

        if (order.istStatus === 'in_produktion') {
            countInProduktion++;
            continue;
        }

        // Default: Offen (nothing started)
        countOffen++;
    }

    const countTotal = orders.length;

    // Colors matching OrderTable badges
    const stages: FunnelStage[] = [
        { name: 'Offen', value: countOffen, fill: '#737373' },                  // neutral-500
        { name: 'In Produktion', value: countInProduktion, fill: '#F59E0B' },   // amber-500
        { name: 'Fertig', value: countFertig, fill: '#22C55E' },                // green-500
        { name: 'Versandbereit', value: countVersandbereit, fill: '#A855F7' },  // purple-500
        { name: 'Versendet', value: countVersendet, fill: '#3B82F6' },          // blue-500
    ];

    // Add Problem count if > 0 (separate indicator)
    if (countProblem > 0) {
        stages.push({ name: 'Problem', value: countProblem, fill: '#EF4444' }); // red-500
    }

    return {
        stages,
        totalValue: countTotal,
        trend: 0, // TODO: Calculate real trend from historical data
    };
}

/**
 * Stage Distribution for Pie Chart
 * Returns all pipeline stages for the Donut view
 */
export async function getStageDistribution() {
    const funnel = await getFunnelData();

    return {
        data: funnel.stages,
        total: funnel.totalValue
    };
}
