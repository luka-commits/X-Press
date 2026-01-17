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
}

export function StageDistributionChart({ data, total }: StageDistributionChartProps) {
    return (
        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6 flex flex-col">
            {/* Header */}
            <div className="mb-4">
                <h2 className="text-base font-semibold text-ghl-text">Stage Distribution</h2>
            </div>

            {/* Main Value */}
            <div className="mb-1">
                <span className="text-4xl font-light text-ghl-text">{total}</span>
            </div>
            <p className="text-xs text-neutral-500 mb-4">Aktive Aufträge</p>

            <div className="flex-1 flex items-center">
                {/* Chart */}
                <div className="relative w-[180px] h-[180px] flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={75}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
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

                {/* Legend */}
                <div className="flex-1 pl-6 space-y-2">
                    {data.map((item) => {
                        const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
                        return (
                            <div key={item.name} className="flex items-center gap-2 text-sm">
                                <div
                                    className="w-3 h-3 rounded flex-shrink-0"
                                    style={{ backgroundColor: item.fill }}
                                />
                                <span className="text-ghl-text flex-1 truncate">{item.name}</span>
                                <span className="text-neutral-500 text-xs">{pct}%</span>
                                <span className="font-medium text-ghl-text w-6 text-right">{item.value}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
