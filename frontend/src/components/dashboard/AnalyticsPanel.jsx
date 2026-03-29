import { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, DollarSign, 
  Users, Briefcase, Calendar, 
  ArrowUpRight, ArrowDownRight,
  PieChart, Activity, Shield, Clock, AlertCircle
} from 'lucide-react';
import { dashboardApi } from '../../services/api';

const StatCard = ({ label, value, subtext, icon: Icon, color, trend }) => (
  <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
    <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl`} />
    <div className="flex items-start justify-between relative z-10">
      <div className={`p-2.5 rounded-xl ${color} bg-opacity-10 text-opacity-100 shadow-sm border border-black/5`}>
        <Icon className="w-5 h-5" />
      </div>
      {trend && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-lg flex items-center gap-0.5 
          ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div className="mt-4 relative z-10">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <div className="flex items-baseline gap-1 mt-1">
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">{value}</h3>
      </div>
      <p className="text-xs text-slate-400 mt-1 font-medium">{subtext}</p>
    </div>
  </div>
);

export default function AnalyticsPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const companyCurrency = user.company?.currencyCode || 'USD';
  const companySymbol   = user.company?.currencySymbol || '$';

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getAdmin();
      setData(res);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-40 bg-white border border-slate-200/70 rounded-2xl animate-pulse" />
      ))}
    </div>
  );

  const { summary, expensesByCategory, monthlyTrend, flaggedExpenses } = data || {};

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Workspace Analytics</h1>
        <p className="text-sm text-slate-500 mt-0.5">Performance metrics and reimbursement trends.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Approved Total" 
          value={`${companySymbol}${summary?.totalApprovedAmount?.toLocaleString() || '0'}`} 
          subtext={`Total in ${companyCurrency}`}
          icon={BarChart3}
          color="bg-emerald-500 text-emerald-600"
          trend={12}
        />
        <StatCard 
          label="Pending Requests" 
          value={`${summary?.pendingCount || '0'}`} 
          subtext={`${companySymbol}${summary?.totalPendingAmount?.toLocaleString() || '0'} pending`}
          icon={Clock}
          color="bg-amber-500 text-amber-600"
          trend={-5}
        />
        <StatCard 
          label="Flagged Items" 
          value={`${summary?.flaggedCount}`} 
          subtext="High risk expenses identified"
          icon={AlertCircle}
          color="bg-red-500 text-red-600"
        />
        <StatCard 
          label="Process Time" 
          value="1.8 d" 
          subtext="Avg. time to decision"
          icon={TrendingUp}
          color="bg-indigo-500 text-indigo-600"
          trend={8}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Expenses by Category */}
        <div className="lg:col-span-1 bg-white border border-slate-200/70 rounded-2xl p-6 shadow-sm flex flex-col">
           <div className="flex items-center justify-between mb-6">
             <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
               <PieChart className="w-4 h-4 text-indigo-500" />
               Category Distribution
             </h3>
           </div>
           
           <div className="flex-1 flex flex-col justify-center space-y-5">
              {expensesByCategory?.length > 0 ? expensesByCategory.map((cat, idx) => {
                const colors = ['bg-indigo-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-sky-500'];
                const color  = colors[idx % colors.length];
                const percentage = Math.round((cat.totalAmount / summary.totalApprovedAmount) * 100) || 0;
                
                return (
                  <div key={cat.category} className="space-y-1.5">
                    <div className="flex justify-between items-end">
                       <span className="text-[11px] font-bold text-slate-500 capitalize">{cat.category}</span>
                       <span className="text-xs font-black text-slate-800">{companySymbol}{cat.totalAmount?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                       <div 
                         className={`h-full ${color} rounded-full transition-all duration-1000`} 
                         style={{ width: `${percentage}%` }}
                       />
                    </div>
                    <div className="flex justify-between">
                       <span className="text-[9px] font-bold text-slate-400 capitalize">{percentage}% of total</span>
                       <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">{cat.count} expenses</span>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-12">
                   <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <PieChart className="w-6 h-6 text-slate-200" />
                   </div>
                   <p className="text-xs font-medium text-slate-400 italic">No category data available yet.</p>
                </div>
              )}
           </div>
        </div>

        {/* Recent Flagged Expenses */}
        <div className="lg:col-span-2 bg-white border border-slate-200/70 rounded-2xl p-6 shadow-sm overflow-hidden">
           <div className="flex items-center justify-between mb-6">
             <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
               <Activity className="w-4 h-4 text-red-500" />
               High-Risk Alerts
             </h3>
             <button className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:text-indigo-700">View All</button>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                       <th className="pb-3 px-2">Employee</th>
                       <th className="pb-3 px-2">Reason</th>
                       <th className="pb-3 px-2">Amount</th>
                       <th className="pb-3 px-2 text-right">Risk</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {flaggedExpenses?.map((fe) => (
                       <tr key={fe.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="py-4 px-2">
                             <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[10px]">
                                   {fe.employeeName?.charAt(0)}
                                </div>
                                <span className="text-xs font-semibold text-slate-700">{fe.employeeName}</span>
                             </div>
                          </td>
                          <td className="py-4 px-2">
                             <span className="text-[10px] font-medium text-slate-500 truncate max-w-[150px] inline-block">
                                {fe.riskFlags?.[0]?.detail || 'Suspicious patterns'}
                             </span>
                          </td>
                          <td className="py-4 px-2">
                             <span className="text-xs font-black text-slate-800">{companySymbol}{fe.amountInCompanyCurrency?.toLocaleString() || '0'}</span>
                          </td>
                          <td className="py-4 px-2 text-right">
                             <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black border ${fe.riskScore >= 70 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                {fe.riskScore}%
                             </span>
                          </td>
                       </tr>
                    ))}
                    {(!flaggedExpenses || flaggedExpenses.length === 0) && (
                       <tr><td colSpan="4" className="py-10 text-center text-slate-400 text-xs italic">All clear! No flagged items.</td></tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
         <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-white/10 flex-shrink-0">
               <TrendingUp className="w-8 h-8" />
            </div>
            <div className="flex-1 text-center md:text-left">
               <h4 className="text-xl font-bold text-white mb-2 tracking-tight">Financial Health Score: 94/100</h4>
               <p className="text-slate-400 text-sm max-w-lg">
                 Your company is maintaining healthy reimbursement cycles. Average audit risk remains low, 
                 and policy compliance is exceeding industry benchmarks.
               </p>
            </div>
            <div className="flex gap-4">
               <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-all active:scale-95">Download Report</button>
            </div>
         </div>
      </div>
    </div>
  );
}
