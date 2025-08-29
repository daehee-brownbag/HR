
import React from 'react';
import { GrowthLog } from '../types.ts';

interface LogTableProps {
    data: GrowthLog[];
}

const ScoreIndicator: React.FC<{ score: number }> = ({ score }) => {
    const color = score > 0 ? 'text-green-600' : score < 0 ? 'text-red-600' : 'text-slate-500';
    const symbol = score > 0 ? '▲' : score < 0 ? '▼' : '●';
    const scoreText = score > 0 ? `(+${score})` : `(${score})`;

    return <span className={`${color} font-bold`}>{symbol} {scoreText}</span>;
};

export const LogTable: React.FC<LogTableProps> = ({ data }) => {
    return (
        <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">주간 성장 로그 상세</h2>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {data.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-600">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                                <tr>
                                    <th scope="col" className="px-4 py-3 whitespace-nowrap">주차</th>
                                    <th scope="col" className="px-4 py-3 whitespace-nowrap">담당자</th>
                                    <th scope="col" className="px-4 py-3 w-1/6">목표</th>
                                    <th scope="col" className="px-4 py-3 w-1/4">관찰된 행동/성과</th>
                                    <th scope="col" className="px-4 py-3 whitespace-nowrap">관련 지표</th>
                                    <th scope="col" className="px-4 py-3 whitespace-nowrap">점수</th>
                                    <th scope="col" className="px-4 py-3 w-1/4">코칭 및 피드백</th>
                                    <th scope="col" className="px-4 py-3 w-1/4">팀원 의견</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((log, index) => (
                                    <tr key={`${log.employee}-${log.week}-${log.behavior.slice(0,10)}-${log.metrics[0]}-${index}`} className="bg-white border-b hover:bg-slate-50">
                                        <td className="px-4 py-3 whitespace-nowrap">{log.week}주차</td>
                                        <td className="px-4 py-3 font-semibold">{log.employee}</td>
                                        <td className="px-4 py-3">{log.goal}</td>
                                        <td className="px-4 py-3">{log.behavior}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">{log.metrics.join(', ')}</td>
                                        <td className="px-4 py-3">
                                            <ScoreIndicator score={log.score} />
                                        </td>
                                        <td className="px-4 py-3">{log.feedback}</td>
                                        <td className="px-4 py-3">{log.opinion}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center py-10 text-slate-500">
                        선택한 조건에 해당하는 데이터가 없습니다.
                    </p>
                )}
            </div>
        </section>
    );
};