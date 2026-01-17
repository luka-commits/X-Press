'use client';

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface StageData {
    name: string;
    value: number;
    fill: string;
    [key: string]: any;
}

interface StageDistributionChartProps {
    data: StageData[];
    total: number;
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

export function StageDistributionChart({ data, total, onStageClick }: StageDistributionChartProps) {
    // 1. Calculate Percentages
    // 2. Sort or map to GHL Colors if needed, but reporting-queries already does this?
    //    Actually, let's enforce the GHL sequence here to be safe.
    const ghlColors = [
        '#3B82F6', // Blue
        '#06B6D4', // Cyan
        '#818CF8', // Indigo
        '#A78BFA', // Violet
        '#C084FC', // Purple
    ];

    const formattedData = data.map((d, i) => ({
        ...d,
        fill: ghlColors[i % ghlColors.length]
    }));

    return (
        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-semibold text-ghl-text">Stage Distribution</h2>
                <div className="bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-sm text-neutral-600 flex items-center gap-2 cursor-pointer">
                    <span>Amira NEU</span>
                    <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* Main Value */}
            <div className="mb-6">
                <span className="text-4xl font-bold text-ghl-text">{total}</span>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded bg-red-50 text-red-500 font-medium">
                        ↓ 66.67%
                    </span>
                    <span className="text-xs text-neutral-500">vs Last 31 Days</span>
                </div>
            </div>

            <div className="flex-1 flex items-start mt-2">
                {/* Chart */}
                <div className="relative w-[160px] h-[160px] flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={formattedData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="none"
                                cornerRadius={4}
                            >
                                {formattedData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const d = payload[0].payload;
                                        const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : 0;
                                        return (
                                            <div className="bg-white border border-neutral-200 shadow-lg rounded-md p-2 text-xs">
                                                <span className="font-semibold text-ghl-text">{d.name}</span>
                                                <br />
                                                <span className="text-neutral-600">{d.value} ({pct}%)</span>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Centered Total */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-semibold text-ghl-text">{total}</span>
                    </div>
                </div>

                {/* Legend - Right Side List */}
                <div className="flex-1 pl-8 space-y-3">
                    {formattedData.map((item) => {
                        const pct = total > 0 ? ((item.value / total) * 100).toFixed(2) : '0.00';
                        return (
                            <div
                                key={item.name}
                                className="flex items-start justify-between group cursor-pointer"
                                role="button"
                                tabIndex={0}
                                onClick={() => onStageClick?.(getStageKey(item.name))}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-4 h-4 rounded-[4px] flex-shrink-0"
                                        style={{ backgroundColor: item.fill }}
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-xs font-medium text-neutral-600 group-hover:text-ghl-blue transition-colors">
                                            {item.name}
                                        </span>
                                        <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                                            <span>€0 ({pct}%)</span>
                                            <span>- {item.value}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
