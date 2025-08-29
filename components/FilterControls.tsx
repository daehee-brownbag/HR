
import React from 'react';
import { Metric } from '../types';

interface FilterControlsProps {
    employees: string[];
    metrics: Metric[];
    currentEmployee: string;
    onEmployeeChange: (employee: string) => void;
    currentMetric: string;
    onMetricChange: (metric: string) => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
    employees,
    metrics,
    currentEmployee,
    onEmployeeChange,
    currentMetric,
    onMetricChange,
}) => {
    return (
        <section className="p-6 bg-white rounded-xl shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-semibold mb-3 text-slate-700">담당자 선택</h3>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => onEmployeeChange('all')}
                            className={`px-4 py-2 text-sm font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors ${currentEmployee === 'all' ? 'bg-slate-600 text-white shadow-md' : ''}`}
                        >
                            전체
                        </button>
                        {employees.map(emp => (
                            <button
                                key={emp}
                                onClick={() => onEmployeeChange(emp)}
                                className={`px-4 py-2 text-sm font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors ${currentEmployee === emp ? 'bg-slate-600 text-white shadow-md' : ''}`}
                            >
                                {emp}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-3 text-slate-700">평가 지표 선택</h3>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => onMetricChange('all')}
                             className={`px-3 py-2 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors ${currentMetric === 'all' ? 'bg-slate-600 text-white shadow-md' : ''}`}
                        >
                            전체
                        </button>
                        {metrics.map(metric => (
                            <button
                                key={metric.id}
                                onClick={() => onMetricChange(metric.id)}
                                className={`px-3 py-2 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors ${currentMetric === metric.id ? 'bg-slate-600 text-white shadow-md' : ''}`}
                            >
                                {metric.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
