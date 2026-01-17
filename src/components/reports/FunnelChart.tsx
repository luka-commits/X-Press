'use client';

import { FunnelStage } from '@/lib/reporting-queries';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LabelList
} from 'recharts';

interface FunnelChartProps {
    data: FunnelStage[];
}

export function FunnelChart({ data }: FunnelChartProps) {
    // Calculate conversion rates for "Next Step Conversion" simulation
    // Detailed label formatting
    const formattedData = data.map((stage, index) => {
        const prevValue = index === 0 ? stage.value : data[index - 1].value;
        // Prevent division by zero
        const conversion = prevValue > 0 ? Math.round((stage.value / data[0].value) * 100) : 0;

        return {
            ...stage,
            fullLabel: `${stage.name}`,
            conversion: `${conversion}%`,
            percentage: `${conversion}%` // Cumulative
        };
    });

    return (
        <div className="bg-white rounded-lg border border-ghl-border shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-ghl-text">Funnel</h2>
                    <p className="text-sm text-ghl-text-secondary">Produktions-Pipeline</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-red-50 text-red-500 text-xs px-2 py-1 rounded-md font-medium">
                        ↓ 12% vs Last 30 Days
                    </div>
                </div>
            </div>

            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={formattedData}
                        margin={{ top: 5, right: 100, left: 10, bottom: 5 }}
                        barSize={40}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={140}
                            tick={{ fontSize: 13, fill: '#6B7280' }}
                            interval={0}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const d = payload[0].payload;
                                    return (
                                        <div className="bg-white border border-ghl-border shadow-lg rounded-md p-3">
                                            <p className="font-semibold text-ghl-text mb-1">{d.name}</p>
                                            <p className="text-sm text-ghl-blue font-medium">{d.value} Aufträge</p>
                                            <p className="text-xs text-ghl-text-secondary mt-1">{d.percentage} Conversion</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 4, 4]} background={{ fill: '#F9FAFB', radius: 4 }}>
                            <LabelList
                                dataKey="value"
                                position="right"
                                fill="#111827"
                                fontWeight={500}
                                formatter={(val: number) => val}
                            />
                            {/* Render Cells specific colors */}
                            {formattedData.map((entry, index) => (
                                <rect key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Custom Column Headers Simulation (Visual match) */}
            <div className="grid grid-cols-4 text-xs font-medium text-ghl-text-secondary mt-2 px-4 border-t border-gray-100 pt-4">
                <div>Stage</div>
                <div className="col-span-2"></div>
                <div className="text-right">Total: {data[0]?.value} Orders</div>
            </div>
        </div>
    );
}
