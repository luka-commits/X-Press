'use client';

import { FunnelStage } from '@/lib/reporting-queries';

interface FunnelChartProps {
    data: FunnelStage[];
    onStageClick?: (stage: string) => void;
}

// Map display names to API stage keys
function getStageKey(name: string): string {
    const mapping: Record<string, string> = {
        'Offen': 'offen',
        'In Produktion': 'in_produktion',
        'Fertig': 'fertig',
        'Versandbereit': 'versandbereit',
        'Versendet': 'versendet',
        'Problem': 'problem',
    };
    return mapping[name] || name.toLowerCase().replace(/\s+/g, '_');
}

export function FunnelChart({ data, onStageClick }: FunnelChartProps) {
    // Calculate total orders
    const totalOrders = data.reduce((sum, stage) => sum + stage.value, 0);

    // Find max value for bar width calculation
    const maxValue = Math.max(...data.map(s => s.value), 1);

    // GHL Colors Sequence
    const ghlColors = [
        '#3B82F6', // Blue-500
        '#06B6D4', // Cyan-500
        '#818CF8', // Indigo-400
        '#A78BFA', // Violet-400
        '#C084FC', // Purple-400
    ];

    // Calculate cumulative and next-step conversion
    const formattedData = data.map((stage, index) => {
        const cumulative = totalOrders > 0
            ? ((stage.value / totalOrders) * 100).toFixed(2)
            : '0.00';

        // Next step conversion: current / previous (or 100% for first)
        let nextStepConversion = '100.00';
        if (index > 0 && data[index - 1].value > 0) {
            nextStepConversion = ((stage.value / data[index - 1].value) * 100).toFixed(2);
        }

        return {
            ...stage,
            fill: ghlColors[index % ghlColors.length], // Override color with GHL sequence
            cumulative: `${cumulative}%`,
            nextStep: `${nextStepConversion}%`,
            barWidth: (stage.value / maxValue) * 100
        };
    });

    return (
        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-semibold text-ghl-text">Funnel</h2>
                <div className="bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-sm text-neutral-600 flex items-center gap-2 cursor-pointer">
                    <span>Amira NEU</span>
                    <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* Main Value */}
            <div className="mb-6">
                <span className="text-4xl font-bold text-ghl-text">{totalOrders}</span>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded bg-red-50 text-red-500 font-medium">
                        ↓ 100%
                    </span>
                    <span className="text-xs text-neutral-500">vs Last 31 Days</span>
                </div>
            </div>

            {/* Column Headers */}
            <div className="grid grid-cols-12 gap-4 text-[10px] uppercase font-bold text-neutral-400 mb-2 px-1">
                <div className="col-span-6"></div>
                <div className="col-span-3 text-center">Cumulative</div>
                <div className="col-span-3 text-center">Next Step Conversion</div>
            </div>

            {/* Funnel Bars */}
            <div className="space-y-3">
                {formattedData.map((stage, index) => (
                    <div key={stage.name} className="grid grid-cols-12 gap-4 items-center group">
                        {/* Bar with label */}
                        <div className="col-span-6 relative">
                            {/* Bar Overlay */}
                            <div
                                className="relative h-12 rounded-md flex flex-col justify-center px-4 cursor-pointer hover:opacity-90 transition shadow-sm border-l-4 border-black/5"
                                style={{
                                    backgroundColor: stage.fill,
                                    width: '100%' // Use visual full width for the "card effect" but maybe color fill?
                                    // Wait, GHL reference has blue bars filling the space.
                                    // Let's mimic the blue block with left alignment.
                                }}
                                role="button"
                                tabIndex={0}
                                onClick={() => onStageClick?.(getStageKey(stage.name))}
                            >
                                <span className="text-white text-sm font-medium z-10 truncate">
                                    {stage.name}
                                </span>
                                <div className="text-white/90 text-xs font-normal z-10">
                                    €0
                                </div>
                            </div>
                        </div>

                        {/* Cumulative */}
                        <div className="col-span-3">
                            <div className="h-12 bg-neutral-50 rounded-md border border-neutral-100 flex items-center justify-center relative arrow-left-decoration">
                                <span className="text-sm font-semibold text-neutral-700">{stage.cumulative}</span>
                            </div>
                        </div>

                        {/* Next Step Conversion */}
                        <div className="col-span-3">
                            <div className="h-12 bg-neutral-50 rounded-md border border-neutral-100 flex items-center justify-center">
                                <span className="text-sm font-semibold text-neutral-700">{stage.nextStep}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
