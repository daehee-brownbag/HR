import React, { useEffect, useRef, useMemo } from 'react';
import { GrowthLog } from '../types.ts';
import { METRIC_LABELS, METRIC_MAP, METRICS } from '../constants.ts';

// Chart.js를 전역에서 찾을 수 있도록 타입 선언
declare var Chart: any;

interface PerformanceChartProps {
    currentEmployee: string;
    currentMetric: string;
    filteredData: GrowthLog[];
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ currentEmployee, currentMetric, filteredData }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const chartRef = useRef<any>(null); // To hold the chart instance

    const { chartData, domain, latestWeek } = useMemo(() => {
        if (filteredData.length === 0) {
             const emptyData = {
                labels: METRIC_LABELS.map(label => label.split(' ')[1]),
                datasets: [
                    {
                        label: '신규 사업 참여 기준',
                        data: Array(METRIC_LABELS.length).fill(2),
                        borderColor: '#f59e0b',
                        borderWidth: 2,
                        pointBackgroundColor: '#f59e0b',
                        borderDash: [5, 5],
                        fill: false,
                    },
                    {
                        label: '0주차 베이스라인',
                        data: Array(METRIC_LABELS.length).fill(0),
                        borderColor: '#a1a1aa',
                        backgroundColor: 'rgba(161, 161, 170, 0.3)',
                        pointBackgroundColor: '#a1a1aa',
                    },
                     {
                        label: '합산 점수 (0주차)',
                        data: Array(METRIC_LABELS.length).fill(0),
                        borderColor: '#16a34a',
                        backgroundColor: 'rgba(22, 163, 74, 0.5)',
                        pointBackgroundColor: '#16a34a',
                    },
                ]
            };
            return { chartData: emptyData, domain: [0, 5], latestWeek: 0 };
        }

        const latestWeekNum = Math.max(0, ...filteredData.map(d => d.week));

        const baselineScores = Array(METRIC_LABELS.length).fill(0);
        const latestCumulativeScores = Array(METRIC_LABELS.length).fill(0);

        filteredData.forEach(log => {
            log.metrics.forEach(metricId => {
                const metricIndex = METRIC_MAP[metricId.substring(0, 1)];
                if (metricIndex !== undefined) {
                    latestCumulativeScores[metricIndex] += log.score;
                }
            });
        });

        filteredData.filter(log => log.week === 0).forEach(log => {
             log.metrics.forEach(metricId => {
                const metricIndex = METRIC_MAP[metricId.substring(0, 1)];
                if (metricIndex !== undefined) {
                    baselineScores[metricIndex] += log.score;
                }
            });
        });
        
        const threshold = 2;
        const allValues = [...baselineScores, ...latestCumulativeScores, threshold];
        let min = Math.min(0, ...allValues);
        let max = Math.max(0, ...allValues);
        
        min = Math.floor(min * 1.1);
        max = Math.ceil(max * 1.2) || 5;
        if(min === max) {
            min -= 2;
            max += 2;
        }

        const finalChartData = {
            labels: METRIC_LABELS.map(label => label.split(' ')[1]),
            datasets: [
                {
                    label: '신규 사업 참여 기준',
                    data: Array(METRIC_LABELS.length).fill(threshold),
                    borderColor: '#f59e0b', // amber-500
                    borderWidth: 2,
                    pointBackgroundColor: '#f59e0b',
                    borderDash: [5, 5],
                    fill: false,
                },
                {
                    label: '0주차 베이스라인',
                    data: baselineScores,
                    borderColor: '#a1a1aa', // gray
                    backgroundColor: 'rgba(161, 161, 170, 0.3)',
                    pointBackgroundColor: '#a1a1aa',
                },
                {
                    label: `합산 점수 (${latestWeekNum > 0 ? `${latestWeekNum}주차까지` : '0주차'})`,
                    data: latestCumulativeScores,
                    borderColor: '#16a34a', // green
                    backgroundColor: 'rgba(22, 163, 74, 0.5)',
                    pointBackgroundColor: '#16a34a',
                },
            ],
        };

        return { chartData: finalChartData, domain: [min, max], latestWeek: latestWeekNum };
    }, [filteredData]);

    useEffect(() => {
        if (canvasRef.current) {
            // Destroy previous chart instance if it exists
            if (chartRef.current) {
                chartRef.current.destroy();
            }

            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                chartRef.current = new Chart(ctx, {
                    type: 'radar',
                    data: chartData,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            r: {
                                min: domain[0],
                                max: domain[1],
                                ticks: {
                                    stepSize: 1,
                                    backdropColor: 'rgba(255, 255, 255, 0.75)',
                                    color: '#475569',
                                },
                                pointLabels: {
                                    font: {
                                        size: 14,
                                    },
                                    color: '#1e293b'
                                },
                                grid: {
                                    color: '#e2e8f0',
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context: any) {
                                        return `${context.dataset.label}: ${context.raw}`;
                                    }
                                }
                            }
                        }
                    }
                });
            }
        }

        // Cleanup function to destroy chart on component unmount
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [chartData, domain]);

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
            <div className="relative w-full h-[400px]">
                <canvas ref={canvasRef}></canvas>
            </div>
        </section>
    );
};
