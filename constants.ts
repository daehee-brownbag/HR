import { Metric } from './types.ts';

// The initial data is now empty. User must import from a Google Sheet.
export const INITIAL_GROWTH_LOG_DATA = [];

export const METRICS: Metric[] = [
    { id: '①', label: '① 오너십', header: '압도적 오너십' },
    { id: '②', label: '② 생존력', header: '유연한 생존력' },
    { id: '③', label: '③ 관계 형성', header: '관계 형성 능력' },
    { id: '④', label: '④ 개선력', header: '주도적 개선력' },
    { id: '⑤', label: '⑤ 학습 실행', header: '학습 실행력' },
    { id: '⑥', label: '⑥ 데이터 활용', header: '데이터 활용 능력' },
];

export const METRIC_LABELS = METRICS.map(m => m.label);

export const METRIC_MAP: { [key: string]: number } = METRICS.reduce((acc, metric, index) => {
    acc[metric.id] = index;
    return acc;
}, {});

// For parsing: maps Google Sheet header name to our internal metric ID
export const METRIC_HEADER_MAP: { [key: string]: string } = METRICS.reduce((acc, metric) => {
    acc[metric.header] = metric.id;
    return acc;
}, {});