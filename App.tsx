import React, { useState, useMemo } from 'react';
import { Header } from './components/Header.tsx';
import { FilterControls } from './components/FilterControls.tsx';
import { PerformanceChart } from './components/PerformanceChart.tsx';
import { LogTable } from './components/LogTable.tsx';
import { DataImporter } from './components/DataImporter.tsx';
import { INITIAL_GROWTH_LOG_DATA, METRICS } from './constants.ts';
import { parseGoogleSheetURL, parseCSVToGrowthLogs } from './utils/csvParser.ts';
import { GrowthLog } from './types.ts';

const App: React.FC = () => {
    const [currentEmployee, setCurrentEmployee] = useState('all');
    const [currentMetric, setCurrentMetric] = useState('all');
    const [growthLogData, setGrowthLogData] = useState<GrowthLog[]>(INITIAL_GROWTH_LOG_DATA);
    const [isImporting, setIsImporting] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);

    const handleImport = async (url: string) => {
        setIsImporting(true);
        setImportError(null);
        try {
            const { sheetId, gid } = parseGoogleSheetURL(url);
            if (!sheetId) {
                throw new Error("Invalid Google Sheet URL. Please provide a valid URL.");
            }
            
            const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gid ? `&gid=${gid}` : ''}`;
            
            const response = await fetch(exportUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch data (status: ${response.status}). Make sure the Google Sheet is public.`);
            }
            const csvText = await response.text();
            
            const newData = parseCSVToGrowthLogs(csvText);
            if (newData.length === 0) {
                setImportError("No data found in the sheet or failed to parse. Please check the sheet format and content.");
            } else {
                setGrowthLogData(newData);
            }

        } catch (err: any) {
            console.error(err);
            setImportError(err.message || "An unknown error occurred during import.");
        } finally {
            setIsImporting(false);
        }
    };
    
    const filteredData = useMemo(() => {
        return growthLogData.filter((log: GrowthLog) => {
            const employeeMatch = currentEmployee === 'all' || log.employee === currentEmployee;
            const metricMatch = currentMetric === 'all' || log.metrics.some(m => m.startsWith(currentMetric));
            return employeeMatch && metricMatch;
        });
    }, [currentEmployee, currentMetric, growthLogData]);
    
    const dynamicEmployees = useMemo(() => {
        const employeeSet = new Set(growthLogData.map(log => log.employee));
        return Array.from(employeeSet).sort();
    }, [growthLogData]);

    return (
        <div className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 text-slate-800">
            <Header />
            <main className="space-y-8">
                <DataImporter
                    onImport={handleImport}
                    isLoading={isImporting}
                    error={importError}
                />
                <FilterControls
                    employees={dynamicEmployees}
                    metrics={METRICS}
                    currentEmployee={currentEmployee}
                    onEmployeeChange={setCurrentEmployee}
                    currentMetric={currentMetric}
                    onMetricChange={setCurrentMetric}
                />
                <PerformanceChart
                    currentEmployee={currentEmployee}
                    currentMetric={currentMetric}
                    filteredData={filteredData}
                />
                <LogTable data={filteredData} />
            </main>
        </div>
    );
};

export default App;