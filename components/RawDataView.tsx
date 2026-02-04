import React from 'react';
import { RawShippingData } from '../types';

interface RawDataViewProps {
  data: RawShippingData[];
}

const RawDataView: React.FC<RawDataViewProps> = ({ data }) => {
  return (
    <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-4xl mx-auto border border-gray-700 mb-8 overflow-hidden">
      <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-indigo-400">⚡</span> ShieldChain Data API Output
          </h2>
          <p className="text-gray-400 text-sm">JSON Response Protocol: API-v2.0-2026</p>
        </div>
        <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-mono border border-green-500/30">
          200 OK
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-700/50 text-gray-400 text-sm uppercase tracking-wider">
              <th className="px-4 py-3 font-semibold border-b border-gray-600">BOL #</th>
              <th className="px-4 py-3 font-semibold border-b border-gray-600">Supplier</th>
              <th className="px-4 py-3 font-semibold border-b border-gray-600">Route</th>
              <th className="px-4 py-3 font-semibold border-b border-gray-600">Performance</th>
              <th className="px-4 py-3 font-semibold border-b border-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="text-gray-200">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-gray-700/30 transition-colors border-b border-gray-700/50">
                <td className="px-4 py-4 font-mono text-indigo-300">{row.BOL}</td>
                <td className="px-4 py-4">{row.Supplier}</td>
                <td className="px-4 py-4 text-sm">{row.Route}</td>
                <td className="px-4 py-4">
                  <span className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-300 text-xs">
                    {row.Performance}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    row.Status.toLowerCase().includes('delayed') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                  }`}>
                    {row.Status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 bg-black/40 p-4 rounded-lg border border-gray-700 font-mono text-xs text-indigo-400 overflow-x-auto">
        <p className="text-gray-500 mb-2">// Raw JSON Stream Output</p>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
};

export default RawDataView;
