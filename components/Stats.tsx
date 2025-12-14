import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { TimeLog, TimerMode } from '../types';

interface StatsProps {
  logs: TimeLog[];
  onAnalyze: () => void;
  isAnalyzing: boolean;
  analysisResult: string | null;
}

const COLORS = ['#06b6d4', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];

const Stats: React.FC<StatsProps> = ({ logs, onAnalyze, isAnalyzing, analysisResult }) => {
  
  // 1. Data for Pie Chart (Distribution by Tag)
  const tagData = useMemo(() => {
    const tagMap: Record<string, number> = {};
    logs.forEach(log => {
      // If no tags, label as 'Untagged'
      const labels = log.tags.length > 0 ? log.tags : ['无标签'];
      labels.forEach(tag => {
        // Distribute duration among tags equally if multiple
        const partialDuration = log.durationSeconds / labels.length;
        tagMap[tag] = (tagMap[tag] || 0) + partialDuration;
      });
    });

    return Object.entries(tagMap)
      .map(([name, value]) => ({ name, value: Math.round(value / 60) })) // Minutes
      .sort((a, b) => b.value - a.value);
  }, [logs]);

  // 2. Data for Bar Chart (Work vs Break per Day - simplified for this demo to just last 7 sessions)
  const sessionData = useMemo(() => {
    return logs.slice(-10).map((log, idx) => ({
      id: idx + 1,
      type: log.mode,
      duration: Math.round(log.durationSeconds / 60),
    }));
  }, [logs]);

  // Calculate efficiency
  const totalWork = logs.filter(l => l.mode === TimerMode.WORK).reduce((acc, curr) => acc + curr.durationSeconds, 0);
  const totalBreak = logs.filter(l => l.mode === TimerMode.BREAK).reduce((acc, curr) => acc + curr.durationSeconds, 0);
  const totalTime = totalWork + totalBreak;
  const efficiency = totalTime > 0 ? Math.round((totalWork / totalTime) * 100) : 0;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 pb-20 overflow-y-auto max-h-[calc(100vh-100px)] custom-scrollbar">
        
        {/* KPI Cards - Added text-center to avoid clipping corners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-800/50 p-6 border border-slate-700 clip-shard-left flex flex-col items-center justify-center text-center">
                <h3 className="text-slate-400 text-xs uppercase tracking-wider mb-1">总工作时间</h3>
                <p className="text-3xl font-bold text-cyan-400">{(totalWork / 3600).toFixed(1)}小时</p>
            </div>
             <div className="bg-slate-800/50 p-6 border border-slate-700 clip-hex flex flex-col items-center justify-center text-center">
                <h3 className="text-slate-400 text-xs uppercase tracking-wider mb-1">完成时段</h3>
                <p className="text-3xl font-bold text-white">{logs.filter(l => l.mode === TimerMode.WORK).length}</p>
            </div>
             <div className="bg-slate-800/50 p-6 border border-slate-700 clip-shard-right flex flex-col items-center justify-center text-center">
                <h3 className="text-slate-400 text-xs uppercase tracking-wider mb-1">时间效率</h3>
                <p className="text-3xl font-bold text-emerald-400">{efficiency}%</p>
            </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Tag Distribution */}
            <div className="bg-slate-800/50 p-4 border border-slate-700 rounded-lg shadow-lg">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <span className="w-2 h-6 bg-purple-500 block"></span>
                    分类分布 (分钟)
                </h3>
                <div className="h-64">
                    {tagData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={tagData}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {tagData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    ) : <div className="flex h-full items-center justify-center text-slate-500">暂无数据</div>}
                </div>
            </div>

            {/* Recent Sessions */}
             <div className="bg-slate-800/50 p-4 border border-slate-700 rounded-lg shadow-lg">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <span className="w-2 h-6 bg-cyan-500 block"></span>
                    近期时段 (分钟)
                </h3>
                <div className="h-64">
                    {sessionData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sessionData}>
                            <XAxis dataKey="id" hide />
                            <YAxis stroke="#64748b" />
                            <Tooltip 
                                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                            />
                            <Bar dataKey="duration" radius={[4, 4, 0, 0]}>
                                {sessionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.type === TimerMode.WORK ? '#06b6d4' : '#10b981'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    ) : <div className="flex h-full items-center justify-center text-slate-500">暂无数据</div>}
                </div>
            </div>
        </div>

        {/* AI Analysis Section */}
        <div className="bg-slate-800 border border-slate-600 p-6 relative overflow-hidden mb-8 shadow-xl">
             <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500 to-purple-600"></div>
             <div className="flex justify-between items-start mb-4">
                 <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                     柳比歇夫智能分析
                 </h2>
                 <button 
                    onClick={onAnalyze}
                    disabled={isAnalyzing}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors"
                    style={{ clipPath: 'polygon(5% 0, 100% 0, 95% 100%, 0% 100%)' }}
                 >
                     {isAnalyzing ? '分析中...' : '生成洞察'}
                 </button>
             </div>
             
             <div className="bg-slate-900/50 p-4 min-h-[100px] text-slate-300 text-sm leading-relaxed whitespace-pre-wrap border border-slate-700/50 rounded">
                 {analysisResult || "点击“生成洞察”以获取基于您时间日志的 AI 分析报告。"}
             </div>
        </div>

        {/* History Log List - Improved Styling */}
        <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-lg shadow-xl backdrop-blur-sm">
             <h3 className="text-white font-bold mb-4 flex items-center gap-2 border-b border-slate-700 pb-2">
                 <span className="w-2 h-6 bg-slate-500 block"></span>
                 详细日志记录 (标签历史)
             </h3>
             <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                     <thead>
                         <tr className="border-b border-slate-600 text-slate-400 text-sm uppercase">
                             <th className="p-3">类型</th>
                             <th className="p-3">时间</th>
                             <th className="p-3">时长</th>
                             <th className="p-3">标签</th>
                         </tr>
                     </thead>
                     <tbody className="text-sm font-mono">
                         {logs.length > 0 ? (
                            [...logs].reverse().map((log) => (
                             <tr key={log.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                                 <td className="p-3">
                                     <span className={`px-2 py-1 text-xs font-bold rounded ${log.mode === TimerMode.WORK ? 'bg-cyan-900/50 text-cyan-400' : 'bg-emerald-900/50 text-emerald-400'}`}>
                                         {log.mode === TimerMode.WORK ? '工作' : '休息'}
                                     </span>
                                 </td>
                                 <td className="p-3 text-slate-300">
                                     {new Date(log.endTime).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                 </td>
                                 <td className="p-3 text-slate-300">{Math.round(log.durationSeconds / 60)} 分钟</td>
                                 <td className="p-3">
                                     <div className="flex flex-wrap gap-1">
                                         {log.tags.length > 0 ? log.tags.map(t => (
                                             <span key={t} className="text-xs text-indigo-300 bg-indigo-900/30 px-2 py-0.5 rounded border border-indigo-500/30">{t}</span>
                                         )) : <span className="text-slate-600 italic text-xs">无标签</span>}
                                     </div>
                                 </td>
                             </tr>
                            ))
                         ) : (
                             <tr>
                                 <td colSpan={4} className="p-8 text-center text-slate-500 italic">
                                     暂无记录。开始一个番茄钟并完成后，标签将显示在此处。
                                 </td>
                             </tr>
                         )}
                     </tbody>
                 </table>
             </div>
        </div>

    </div>
  );
};

export default Stats;