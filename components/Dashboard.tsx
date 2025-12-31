
import React from 'react';
import { MemberFormData, Group } from '../types';

interface DashboardProps {
  members: MemberFormData[];
}

const Dashboard: React.FC<DashboardProps> = ({ members }) => {
  const groupCounts = Object.values(Group).reduce((acc, group) => {
    acc[group] = members.filter(m => m.group === group).length;
    return acc;
  }, {} as Record<string, number>);

  const maxCount = Math.max(...Object.values(groupCounts), 1);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-900">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
             </svg>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Registrados</p>
            <p className="text-4xl font-black text-blue-900">{members.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de Barras: Participación por Grupo */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-black text-blue-900 uppercase mb-8 tracking-tighter">Participación por Grupo</h3>
          <div className="h-64 flex items-end justify-between gap-2 px-4">
            {Object.entries(groupCounts).map(([group, count]) => (
              <div key={group} className="flex flex-col items-center flex-1 group">
                <div 
                  className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg transition-all duration-500 relative"
                  style={{ height: `${(count / maxCount) * 100}%`, minHeight: '4px' }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {count}
                  </div>
                </div>
                <span className="text-[9px] font-bold text-gray-400 mt-4 uppercase">{group}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-gray-100 pt-4 flex justify-between">
            <span className="text-[10px] text-gray-400 font-bold uppercase">0</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase">{maxCount}</span>
          </div>
        </div>

        {/* Gráfico Circular: Distribución (Simplificado con SVG) */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-black text-blue-900 uppercase mb-8 tracking-tighter">Distribución Iglesia</h3>
          <div className="flex items-center justify-center h-64 relative">
             <svg className="w-48 h-48 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f3f4f6" strokeWidth="12" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f97316" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * 0.4)} strokeLinecap="round" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#dc2626" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * 0.2)} strokeLinecap="round" className="rotate-45 origin-center" />
             </svg>
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-white rounded-full flex flex-center items-center justify-center shadow-inner">
                   <p className="text-xs font-bold text-gray-400 uppercase">Universal</p>
                </div>
             </div>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-2">
            {Object.keys(groupCounts).map((g, idx) => (
              <div key={g} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: ['#f97316', '#ef4444', '#7f1d1d', '#facc15', '#2563eb', '#8b5cf6'][idx % 6] }}></div>
                <span className="text-[9px] font-bold text-gray-500 uppercase">{g}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
