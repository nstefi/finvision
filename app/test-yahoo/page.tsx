"use client";

import { useState, useEffect } from "react";

export default function TestYahooPage() {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const response = await fetch('/api/stock-data?symbols=AAPL,MSFT&period=1m');
                console.log("Response status:", response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("API Error:", errorText);
                    setError(`API Error (${response.status}): ${errorText}`);
                    return;
                }

                const result = await response.json();
                console.log("API Result:", result);
                setData(result);
            } catch (err: any) {
                console.error("Fetch error:", err);
                setError(err.message || "An error occurred");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Yahoo Finance API Test</h1>

            {loading && <p>Loading...</p>}

            {error && (
                <div className="p-4 mb-4 bg-red-100 border border-red-400 rounded">
                    <h2 className="text-xl font-semibold text-red-700">Error</h2>
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {data && (
                <div className="mt-4">
                    <h2 className="text-xl font-semibold mb-2">Data Received</h2>
                    <p>Data points: {data.length}</p>
                    <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full border border-gray-300">
                            <thead>
                                <tr>
                                    <th className="border px-4 py-2">Date</th>
                                    <th className="border px-4 py-2">AAPL</th>
                                    <th className="border px-4 py-2">MSFT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.slice(0, 10).map((item: any, index: number) => (
                                    <tr key={index}>
                                        <td className="border px-4 py-2">{item.formattedDate}</td>
                                        <td className="border px-4 py-2">{item.AAPL?.toFixed(2) || 'N/A'}</td>
                                        <td className="border px-4 py-2">{item.MSFT?.toFixed(2) || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p className="mt-2 text-sm text-gray-600">Showing 10 of {data.length} records</p>
                    </div>
                </div>
            )}
        </div>
    );
} 