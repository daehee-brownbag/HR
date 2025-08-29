import React, { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GrowthLog } from '../types.ts';
import { METRIC_LABELS, METRIC_MAP, METRICS } from '../constants.ts';

interface PerformanceChartProps {
    currentEmployee: string;
    currentMetric: string;
    filteredData: GrowthLog[];
}

const TeamChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        // Filter out the non-data reference line from the tooltip
        const filteredPayload = payload.filter((p: any) => p.dataKey !== 'threshold');
        return (
            <div className="p-2 bg-white border border-slate-300 rounded-md shadow-lg text-sm">
                <p className="font-bold mb-1">{label}</p>
                {filteredPayload.map((entry: any) => (
                    <div key={entry.dataKey} style={{ color: entry.stroke }} className="flex items-center justify-between">
                        <span>{`${entry.name}: ${entry.value}`}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};


const GenericRadarChart: React.FC<{ data: GrowthLog[] }> = ({ data }) => {
    const { chartData, domain, latestWeek } = useMemo(() => {
        if (data.length === 0) {
            const emptyData = METRIC_LABELS.map(label => ({
                metric: label.split(' ')[1],
                baseline: 0,
                latest: 0,
                threshold: 2,
            }));
            return { chartData: emptyData, domain: [0, 5], latestWeek: 0 };
        }

        const latestWeekNum = Math.max(0, ...data.map(d => d.week));

        const baselineScores = Array(METRIC_LABELS.length).fill(0);
        const latestCumulativeScores = Array(METRIC_LABELS.length).fill(0);
        
        data.forEach(log => {
            log.metrics.forEach(metricId => {
                const metricIndex = METRIC_MAP[metricId.substring(0, 1)];
                if (metricIndex !== undefined) {
                    latestCumulativeScores[metricIndex] += log.score;
                }
            });
        });
        
        data.filter(log => log.week === 0).forEach(log => {
             log.metrics.forEach(metricId => {
                const metricIndex = METRIC_MAP[metricId.substring(0, 1)];
                if (metricIndex !== undefined) {
                    baselineScores[metricIndex] += log.score;
                }
            });
        });

        const finalChartData = METRIC_LABELS.map((label, index) => {
            return {
                metric: label.split(' ')[1], // e.g., "오너십"
                baseline: baselineScores[index],
                latest: latestCumulativeScores[index],
                threshold: 2, // Threshold line data
            };
        });
        
        const allValues = finalChartData.flatMap(d => [d.baseline, d.latest, d.threshold]);
        let min = Math.min(0, ...allValues);
        let max = Math.max(0, ...allValues);

        // Add some padding to the domain
        min = Math.floor(min * 1.1) || 0;
        max = Math.ceil(max * 1.1) || 5;

        if (min === max) {
            min = Math.min(0, min - 2);
            max = max + 2;
        }


        return { chartData: finalChartData, domain: [min, max], latestWeek: latestWeekNum };

    }, [data]);

    return (
        <ResponsiveContainer width="100%" height={400}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={30} domain={domain} allowDecimals={false} />
                <Tooltip content={<TeamChartTooltip />} />
                <Legend />
                <Radar 
                    name="신규 사업 참여 기준" 
                    dataKey="threshold" 
                    stroke="#f59e0b" // amber-500
                    strokeDasharray="5 5"
                    fill="none" 
                    strokeWidth={2}
                />
                <Radar 
                    name="0주차 베이스라인" 
                    dataKey="baseline" 
                    stroke="#a1a1aa" /* gray */
                    fill="#a1a1aa" 
                    fillOpacity={0.3} 
                />
                <Radar 
                    name={`합산 점수 (${latestWeek > 0 ? `${latestWeek}주차까지` : '0주차'})`} 
                    dataKey="latest" 
                    stroke="#16a34a" /* green */
                    fill="#16a34a" 
                    fillOpacity={0.5}
                />
            </RadarChart>
        </ResponsiveContainer>
    );
};


export const PerformanceChart: React.FC<PerformanceChartProps> = ({ currentEmployee, currentMetric, filteredData }) => {
    
    const getChartTitle = () => {
        const employeeText = currentEmployee === 'all' ? '팀 전체' : `담당자 ${currentEmployee}`;
        const metricObj = METRICS.find(m => m.id === currentMetric);
        const metricText = metricObj ? `'${metricObj.label.split(' ')[1]}'` : '전체';

        if (currentMetric !== 'all') {
            return `${employeeText} ${metricText} 관련 역량 분석`;
        }
        return `${employeeText} 역량 변화 (0주차 대비)`;
    };

    return (
        <section className="p-6 bg-white rounded-xl shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
                {getChartTitle()}
            </h2>
            <div className="w-full h-[400px]">
                <GenericRadarChart data={filteredData} />
            </div>
        </section>
    );
};