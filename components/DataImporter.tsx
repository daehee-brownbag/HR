
import React, { useState } from 'react';

interface DataImporterProps {
    onImport: (url: string) => Promise<void>;
    isLoading: boolean;
    error: string | null;
}

export const DataImporter: React.FC<DataImporterProps> = ({ onImport, isLoading, error }) => {
    const [url, setUrl] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!url || isLoading) return;
        onImport(url);
    };

    return (
        <section className="p-6 bg-white rounded-xl shadow-sm">
            <form onSubmit={handleSubmit}>
                <h3 className="text-lg font-semibold mb-3 text-slate-700">Import from Google Sheet</h3>
                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Paste a public Google Sheet URL here"
                        className="flex-grow px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400"
                        aria-label="Google Sheet URL"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center"
                        disabled={isLoading || !url}
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Importing...
                            </>
                        ) : 'Import Data'}
                    </button>
                </div>
                 {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                 <p className="mt-2 text-xs text-slate-500">
                    Ensure your Google Sheet is public ("Anyone with the link can view"). The first row must be a header. Required columns: <strong>주차, 시작일, 담당자, 목표, 관찰된 행동/성과, 코칭 및 피드백, 팀원 의견</strong>, and metric columns like <strong>압도적 오너십, 유연한 생존력,</strong> etc. Enter scores directly in the metric columns.
                </p>
            </form>
        </section>
    );
};