import React, { useState } from 'react';
import { ExecutivePulse, RegionalBrief } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import InteractiveMap from './InteractiveMap';
import { fetchRegionalBrief } from '../services/geminiService';

interface DashboardProps {
  pulse: ExecutivePulse;
}

const Dashboard: React.FC<DashboardProps> = ({ pulse }) => {
  const { header, stats, visuals, executiveAudit, actionSteps, decisionLogic, supplierTrends } = pulse;
  const [regionalBrief, setRegionalBrief] = useState<RegionalBrief | null>(null);
  const [isBriefLoading, setIsBriefLoading] = useState(false);

  const handleRegionSelect = async (region: string) => {
    setIsBriefLoading(true);
    setRegionalBrief(null);
    try {
      const brief = await fetchRegionalBrief(region);
      setRegionalBrief(brief);
    } catch (err) {
      console.error("Failed to fetch regional intelligence", err);
    } finally {
      setIsBriefLoading(false);
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="bg-gray-900 p-8 rounded-xl shadow-2xl w-full max-w-6xl mx-auto border border-gray-800 mb-8 font-sans overflow-hidden relative">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 relative z-10">
        <div className="flex-1">
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">{header.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`px-3 py-1 rounded text-xs font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(0,0,0,0.3)]`} style={{ backgroundColor: header.colorCode, color: '#000' }}>
              LEVEL: {header.riskLevel}
            </span>
            <span className="text-gray-500 font-mono text-[10px] tracking-widest">SHIELDCHAIN_CORE_ID: 2026.AX.09</span>
          </div>
        </div>
        <div className="bg-gray-800/80 backdrop-blur-md p-4 rounded-lg border border-gray-700 w-full md:w-auto text-right shadow-xl">
          <p className="text-gray-400 text-[10px] uppercase font-bold mb-1 tracking-widest">Financial Impact Identified</p>
          <p className="text-2xl font-mono text-emerald-400 font-bold">{stats.financialLiability}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 relative z-10">
        <div className="space-y-4">
          <div className="bg-gray-800/50 backdrop-blur p-5 rounded-lg border border-gray-700 flex justify-between items-center hover:border-gray-600 transition-colors group">
            <div>
              <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Compliance</p>
              <p className="text-3xl font-mono text-white font-bold group-hover:text-indigo-400 transition-colors">{stats.complianceScore}%</p>
            </div>
            <div className="w-16 h-16 relative">
               <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                 <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#374151" strokeWidth="3" />
                 <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={header.colorCode} strokeWidth="3" strokeDasharray={`${stats.complianceScore}, 100`} />
               </svg>
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur p-5 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
            <p className="text-gray-500 text-xs uppercase font-bold mb-1 tracking-wider">Supplier Risk Index</p>
            <div className="flex items-center gap-4">
               <span className={`text-4xl font-mono font-bold ${getRiskScoreColor(stats.supplierRiskScore)}`}>{stats.supplierRiskScore}</span>
               <div className="flex-1 bg-gray-700 h-2 rounded-full overflow-hidden">
                 <div className="h-full bg-indigo-500" style={{ width: `${stats.supplierRiskScore}%` }}></div>
               </div>
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur p-5 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
            <p className="text-gray-500 text-xs uppercase font-bold mb-1 tracking-wider">Impact Status</p>
            <p className={`text-2xl font-bold uppercase italic ${stats.deliveryImpact === 'Delayed' ? 'text-red-500' : 'text-indigo-400'}`}>
              {stats.deliveryImpact}
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 relative">
          <div className="bg-gray-800/30 rounded-lg overflow-hidden border border-gray-800 shadow-inner">
             <InteractiveMap 
               lat={visuals.mapCoordinates.lat} 
               lng={visuals.mapCoordinates.lng} 
               heatmapPoints={visuals.heatmapData}
               glowColor={header.colorCode}
               onRegionSelect={handleRegionSelect}
             />
          </div>

          {(regionalBrief || isBriefLoading) && (
            <div className="absolute top-4 left-4 right-4 sm:right-auto sm:w-80 bg-gray-900/95 backdrop-blur-xl border border-indigo-500/50 p-4 rounded shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-indigo-400 font-bold text-sm tracking-widest uppercase">
                  {isBriefLoading ? 'Syncing...' : `${regionalBrief?.region} Sector`}
                </h4>
                <button onClick={() => setRegionalBrief(null)} className="text-gray-500 hover:text-white transition-colors">✕</button>
              </div>
              
              {isBriefLoading ? (
                <div className="space-y-2 py-4">
                  <div className="h-4 bg-gray-800 animate-pulse rounded w-full"></div>
                  <div className="h-4 bg-gray-800 animate-pulse rounded w-3/4"></div>
                </div>
              ) : (
                <div className="space-y-3 font-mono text-[11px]">
                  <div className="flex justify-between border-b border-gray-800 pb-1">
                    <span className="text-gray-500">EFFICIENCY</span>
                    <span className="text-white">{regionalBrief?.efficiency}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-800 pb-1">
                    <span className="text-gray-500">RISK_INDEX</span>
                    <span className={getRiskScoreColor(regionalBrief?.riskIndex || 0)}>{regionalBrief?.riskIndex}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">GEOPOLITICAL_VECTOR</span>
                    <p className="text-gray-300 leading-tight italic">{regionalBrief?.geopoliticalNotes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 relative z-10">
        <div className="bg-gray-800/50 backdrop-blur p-6 rounded-lg border border-gray-700">
          <h3 className="text-indigo-400 text-xs font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Strategic Audit Brief
          </h3>
          <p className="text-xl text-white leading-relaxed font-light italic">"{executiveAudit}"</p>
          <div className="mt-6 space-y-3">
             {actionSteps.map((step, i) => (
               <div key={i} className="flex gap-3 items-start group">
                 <span className="text-indigo-500 mt-1">▶</span>
                 <span className="text-gray-300 text-sm group-hover:text-white transition-colors">{step}</span>
               </div>
             ))}
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur p-6 rounded-lg border border-gray-700 flex flex-col">
          <h3 className="text-indigo-400 text-xs font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Decision Protocol
          </h3>
          <div className="space-y-4 flex-1">
             <div className="bg-black/60 p-4 rounded font-mono text-[11px] text-green-500/90 border border-green-900/30 max-h-[140px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 relative">
               <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-20"></div>
               {decisionLogic.thought_process.map((t, i) => (
                 <div key={i} className="mb-1 flex gap-2">
                   <span className="text-green-500/50 select-none">&gt;</span>
                   <span className="text-green-400/90">{t}</span>
                 </div>
               ))}
               <div className="inline-block w-2 h-4 bg-green-500/50 animate-pulse ml-1 align-middle"></div>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
               <div className="bg-gray-900/40 p-3 rounded border border-gray-700/50">
                 <p className="text-gray-500 text-[9px] uppercase font-black tracking-widest">Engine Confidence</p>
                 <p className="text-lg font-bold text-indigo-400">{(decisionLogic.confidence_score * 100).toFixed(1)}%</p>
               </div>
               <div className="bg-gray-900/40 p-3 rounded border border-gray-700/50">
                 <p className="text-gray-500 text-[9px] uppercase font-black tracking-widest">Final Verdict</p>
                 <p className="text-lg font-bold text-white uppercase tracking-tighter">{decisionLogic.final_verdict}</p>
               </div>
             </div>

             <div className="pt-2">
               <div className="px-4 py-3 bg-indigo-500/10 text-indigo-300 rounded text-sm border border-indigo-500/30 italic relative overflow-hidden group">
                 <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                 <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent pointer-events-none"></div>
                 <span className="relative z-10 font-mono text-[9px] font-bold opacity-60 mr-2 uppercase tracking-tighter">Automatic Response:</span>
                 <span className="relative z-10 group-hover:text-white transition-colors">{decisionLogic.automated_action}</span>
               </div>
             </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur p-6 rounded-lg border border-gray-700 relative z-10">
        <h3 className="text-indigo-400 text-xs font-bold uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
          Logistical Velocity History
        </h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={supplierTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" vertical={false} opacity={0.3} />
              <XAxis dataKey="month" stroke="#4A5568" tick={{ fontSize: 10, fill: '#718096' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#4A5568" tick={{ fontSize: 10, fill: '#718096' }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(26, 32, 44, 0.95)', border: '1px solid #4A5568', borderRadius: '8px', color: '#fff', fontSize: '11px', backdropFilter: 'blur(10px)' }} 
                itemStyle={{ color: header.colorCode }}
                cursor={{ stroke: '#4A5568', strokeWidth: 1 }}
              />
              <Line 
                type="monotone" 
                dataKey="performance" 
                stroke={header.colorCode} 
                strokeWidth={3} 
                dot={{ r: 4, fill: header.colorCode, strokeWidth: 2, stroke: '#111827' }}
                activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                animationDuration={2000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;