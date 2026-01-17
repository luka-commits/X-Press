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
        <div className="bg-white rounded-lg border border-ghl-border shadow-sm p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-lg font-semibold text-ghl-text">Stage Distribution</h2>
                    <p className="text-sm text-ghl-text-secondary">Verteilung nach Phase</p>
                </div>
                <div className="bg-red-50 text-red-500 text-xs px-2 py-1 rounded-md font-medium">
                    ↓ 5% vs Last 30 Days
                </div>
            </div>

            <div className="flex-1 flex items-center">
                {/* Chart */}
                <div className="relative w-1/2 h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={100}
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
                                        return (
                                            <div className="bg-white border border-ghl-border shadow-sm rounded-md p-2 text-xs">
                                                <span className="font-semibold text-ghl-text">{d.name}:</span> {d.value}
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
                        <span className="text-3xl font-bold text-ghl-text">{total}</span>
                        <span className="text-xs text-ghl-text-secondary mt-1">Aufträge</span>
                    </div>
                </div>

                {/* Legend */}
                <div className="w-1/2 pl-4 space-y-3">
                    {data.map((item) => (
                        <div key={item.name} className="flex items-start justify-between text-sm group cursor-default">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full mt-0.5"
                                    style={{ backgroundColor: item.fill }}
                                />
                                <span className="text-ghl-text-secondary group-hover:text-ghl-text transition-colors">
                                    {item.name}
                                </span>
                            </div>
                            <div className="text-right">
                                <div className="font-medium text-ghl-text">{item.value}</div>
                                <div className="text-xs text-neutral-400">
                                    {total > 0 ? Math.round((item.value / total) * 100) : 0}%
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
