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
            cumulative: `${cumulative}%`,
            nextStep: `${nextStepConversion}%`,
            barWidth: (stage.value / maxValue) * 100
        };
    });

    return (
        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-ghl-text">Funnel</h2>
            </div>

            {/* Main Value */}
            <div className="mb-2">
                <span className="text-4xl font-light text-ghl-text">{totalOrders}</span>
            </div>

            {/* Trend Badge - placeholder for now */}
            <div className="flex items-center gap-2 mb-6">
                <span className="text-xs px-2 py-0.5 rounded bg-neutral-100 text-neutral-500">
                    Offene Aufträge
                </span>
            </div>

            {/* Column Headers */}
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-neutral-500 mb-3 px-1">
                <div className="col-span-6"></div>
                <div className="col-span-3 text-center">Kumulativ</div>
                <div className="col-span-3 text-center">Nächster Schritt</div>
            </div>

            {/* Funnel Bars */}
            <div className="space-y-2">
                {formattedData.map((stage, index) => (
                    <div key={stage.name} className="grid grid-cols-12 gap-2 items-center">
                        {/* Bar with label */}
                        <div className="col-span-6">
                            <div
                                className="relative h-10 rounded flex items-center px-3 cursor-pointer hover:opacity-80 transition"
                                style={{
                                    backgroundColor: stage.fill,
                                    width: `${Math.max(stage.barWidth, 20)}%`,
                                    minWidth: '100px'
                                }}
                                role="button"
                                tabIndex={0}
                                onClick={() => onStageClick?.(getStageKey(stage.name))}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        onStageClick?.(getStageKey(stage.name));
                                    }
                                }}
                            >
                                <span className="text-white text-sm font-medium truncate">
                                    {stage.name}
                                </span>
                            </div>
                            <span className="text-xs text-neutral-500 ml-1">{stage.value}</span>
                        </div>

                        {/* Cumulative */}
                        <div className="col-span-3 text-center">
                            <div className="h-8 bg-neutral-100 rounded flex items-center justify-center">
                                <span className="text-sm text-neutral-600">{stage.cumulative}</span>
                            </div>
                        </div>

                        {/* Next Step Conversion */}
                        <div className="col-span-3 text-center">
                            <div className="h-8 bg-neutral-100 rounded flex items-center justify-center">
                                <span className="text-sm text-neutral-600">{stage.nextStep}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
