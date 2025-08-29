import { GrowthLog } from '../types.ts';
import { METRIC_HEADER_MAP } from '../constants.ts';

export function parseGoogleSheetURL(url: string): { sheetId: string | null; gid: string | null } {
    const sheetIdMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    const gidMatch = url.match(/[#&]gid=([0-9]+)/);
    return {
        sheetId: sheetIdMatch ? sheetIdMatch[1] : null,
        gid: gidMatch ? gidMatch[1] : null,
    };
}

function parseCsvRow(row: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
            if (inQuotes && row[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

export function parseCSVToGrowthLogs(csvText: string): GrowthLog[] {
    const rows = csvText.trim().replace(/\r\n/g, '\n').split('\n');
    if (rows.length < 2) {
        console.error("CSV data has no rows or only a header row.");
        return [];
    }

    const header = parseCsvRow(rows[0]);
    const dataRows = rows.slice(1);

    const baseHeaders = ['주차', '시작일', '담당자', '목표', '관찰된 행동/성과', '코칭 및 피드백', '팀원 의견'];
    const headerIndices: { [key: string]: number } = {};

    baseHeaders.forEach(h => {
        const index = header.indexOf(h);
        if (index === -1) {
            throw new Error(`CSV is missing required header: "${h}". Found headers: ${header.join(', ')}`);
        }
        headerIndices[h] = index;
    });

    const metricColumns = header
        .map((h, index) => ({ header: h, index }))
        .filter(col => METRIC_HEADER_MAP[col.header]);

    if (metricColumns.length === 0) {
        throw new Error("No metric columns found in the CSV header. Expected headers like '압도적 오너십', '유연한 생존력', etc.");
    }

    const allLogs: GrowthLog[] = [];

    dataRows.forEach((rowStr, rowIndex) => {
        if (!rowStr) return; // Skip empty rows

        const values = parseCsvRow(rowStr);
        if (values.length < header.length) {
            console.warn(`Row ${rowIndex + 2} has fewer columns than header. Skipping.`);
            return;
        }

        const baseLogData = {
            week: parseInt(values[headerIndices['주차']], 10) || 0,
            date: values[headerIndices['시작일']] || '',
            employee: values[headerIndices['담당자']] || '',
            goal: values[headerIndices['목표']] || '',
            behavior: values[headerIndices['관찰된 행동/성과']] || '',
            feedback: values[headerIndices['코칭 및 피드백']] || '',
            opinion: values[headerIndices['팀원 의견']] || '',
        };

        metricColumns.forEach(metricCol => {
            const scoreStr = values[metricCol.index];
            const score = parseInt(scoreStr, 10);

            if (!isNaN(score)) {
                allLogs.push({
                    ...baseLogData,
                    metrics: [METRIC_HEADER_MAP[metricCol.header]],
                    score: score,
                });
            }
        });
    });

    return allLogs;
}