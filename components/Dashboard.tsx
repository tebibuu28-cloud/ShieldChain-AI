import React from 'react';
import { ExecutivePulse } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  pulse: ExecutivePulse;
}

const Dashboard: React.FC<DashboardProps> = ({ pulse }) => {
  const { header, stats, visuals, executiveAudit, actionSteps, decisionLogic } = pulse;

  const chartDisplayData = visuals.chartData.map((value, index) => ({
    name: `Metric ${index + 1}`,
    value: value,
  }));

  const glowClass = visuals.glowEffect === 'pulse-red' ? 'animate-pulse bg-red-500' : 'bg-blue-500';

  // Determine color for supplier risk score: green for low, yellow for medium, red for high
  const getRiskScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-4xl mx-auto border border-gray-700 mb-8">
      {/* Header */}
      <div className={`p-6 rounded-lg text-center mb-8 border-b-4 ${header.riskLevel === 'CRITICAL' ? 'border-red-500' : header.riskLevel === 'WARNING' ? 'border-yellow-500' : 'border-blue-500'}`} style={{ backgroundColor: header.colorCode }}>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 drop-shadow-lg">{header.title}</h1>
        <p className={`text-xl font-semibold uppercase ${header.riskLevel === 'CRITICAL' ? 'text-red-900' : header.riskLevel === 'WARNING' ? 'text-yellow-900' : 'text-blue-900'} drop-shadow`}>
          Risk Level: {header.riskLevel}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 text-center">
        <div className="bg-gray-700 p-5 rounded-lg shadow-md border border-gray-600">
          <h3 className="text-gray-300 text-lg font-medium mb-2">Compliance Score</h3>
          <div className="relative w-full bg-gray-600 rounded-full h-4">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.complianceScore}%`, backgroundColor: header.colorCode }}
            ></div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{stats.complianceScore}%</p>
        </div>
        <div className="bg-gray-700 p-5 rounded-lg shadow-md border border-gray-600">
          <h3 className="text-gray-300 text-lg font-medium mb-2">Financial Liability</h3>
          <p className="text-3xl font-bold text-orange-400">{stats.financialLiability}</p>
        </div>
        <div className="bg-gray-700 p-5 rounded-lg shadow-md border border-gray-600">
          <h3 className="text-gray-300 text-lg font-medium mb-2">Delivery Impact</h3>
          <p className={`text-3xl font-bold ${stats.deliveryImpact === 'Delayed' ? 'text-red-400' : 'text-green-400'}`}>
            {stats.deliveryImpact}
          </p>
        </div>
        {/* New Supplier Risk Score */}
        <div className="bg-gray-700 p-5 rounded-lg shadow-md border border-gray-600">
          <h3 className="text-gray-300 text-lg font-medium mb-2">Supplier Risk Score</h3>
          <div className="relative w-full bg-gray-600 rounded-full h-4">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${stats.supplierRiskScore}%`, 
                backgroundColor: stats.supplierRiskScore >= 70 ? '#EF4444' : stats.supplierRiskScore >= 40 ? '#F59E0B' : '#10B981' // Tailwind red-500, yellow-500, green-500
              }}
            ></div>
          </div>
          <p className={`text-2xl font-bold mt-2 ${getRiskScoreColor(stats.supplierRiskScore)}`}>
            {stats.supplierRiskScore}%
          </p>
        </div>
      </div>

      {/* Visuals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-700 p-5 rounded-lg shadow-md border border-gray-600 flex flex-col justify-center items-center">
          <h3 className="text-gray-300 text-lg font-medium mb-4">Risk Metrics Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartDisplayData}>
              <XAxis dataKey="name" stroke="#cbd5e1" />
              <YAxis stroke="#cbd5e1" />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.1)' }} contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#9ca3af' }} />
              <Bar dataKey="value" fill={header.colorCode} radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-700 p-5 rounded-lg shadow-md border border-gray-600 flex flex-col justify-center items-center">
          <h3 className="text-gray-300 text-lg font-medium mb-4">Incident Hotspot</h3>
          <div className={`w-32 h-32 rounded-full flex items-center justify-center ${glowClass}`} style={{ transition: 'background-color 0.5s ease-in-out' }}>
            <span className="text-gray-900 font-bold text-xs p-2 rounded-full bg-white opacity-90">
              LAT: {visuals.mapCoordinates.lat.toFixed(2)}<br/>LNG: {visuals.mapCoordinates.lng.toFixed(2)}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-4">Geopolitical Zone: {header.title.split(' ')[0]}</p>
        </div>
      </div>

      {/* Executive Audit */}
      <div className="bg-gray-700 p-6 rounded-lg shadow-md mb-8 border border-gray-600">
        <h3 className="text-gray-300 text-xl font-semibold mb-3">Executive Audit - Strategic Summary for COO</h3>
        <p className="text-white text-lg leading-relaxed italic">"{executiveAudit}"</p>
      </div>

      {/* Action Steps */}
      <div className="bg-gray-700 p-6 rounded-lg shadow-md border border-gray-600">
        <h3 className="text-gray-300 text-xl font-semibold mb-4">Immediate & Long-Term Action Steps</h3>
        <ul className="list-disc list-inside space-y-2 text-white text-lg">
          {actionSteps.map((step, index) => (
            <li key={index} className="flex items-start">
              <span className="mr-2 text-indigo-400 font-bold">●</span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* New Decision Logic Section */}
      <div className="bg-gray-700 p-6 rounded-lg shadow-md border border-gray-600 mb-8">
        <h3 className="text-gray-300 text-xl font-semibold mb-4 flex items-center">
          <span className="mr-2 text-indigo-400">🧠</span> Decision Engine Protocol
        </h3>
        <div className="space-y-4">
          <div>
            <p className="text-gray-400 text-sm mb-1">Reasoning Path:</p>
            <ul className="list-disc list-inside text-white text-base pl-4">
              {decisionLogic.thought_process.map((thought, index) => (
                <li key={index}>{thought}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Final Verdict:</p>
            <p className="text-xl font-bold text-indigo-300">{decisionLogic.final_verdict}</p>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Confidence Score:</p>
              <p className="text-xl font-bold text-green-400">{decisionLogic.confidence_score.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Automated Action:</p>
              <p className="text-lg font-medium text-purple-300">{decisionLogic.automated_action}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;