import { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, DollarSign, 
  Users, Briefcase, Calendar, 
  ArrowUpRight, ArrowDownRight,
  PieChart, Activity, Shield, Clock, AlertCircle
} from 'lucide-react';
import { dashboardApi } from '../../services/api';

const StatCard = ({ label, value, subtext }) => (
  <div className="bg-surface border border-border-default rounded-[6px] p-[24px] border-l-2 border-l-accent flex flex-col justify-end min-h-[100px]">
    <p className="text-[24px] font-mono text-primary leading-none">{value}</p>
    <p className="text-[12px] text-muted mt-[8px]">
      {label} {subtext && `- ${subtext}`}
    </p>
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
    <div className="space-y-[24px] pb-[64px]">
      <div>
        <h1 className="text-[28px] font-medium tracking-[-0.01em] text-primary">Workspace Analytics</h1>
        <p className="text-[13px] text-secondary mt-1">Performance metrics and reimbursement trends.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px]">
        <StatCard 
          label="Approved Total" 
          value={`${companySymbol}${summary?.totalApprovedAmount?.toLocaleString() || '0'}`} 
          subtext={`Total in ${companyCurrency}`}
        />
        <StatCard 
          label="Pending Requests" 
          value={`${summary?.pendingCount || '0'}`} 
          subtext={`${companySymbol}${summary?.totalPendingAmount?.toLocaleString() || '0'} pending`}
        />
        <StatCard 
          label="Flagged Items" 
          value={`${summary?.flaggedCount}`} 
          subtext="High risk expenses identified"
        />
        <StatCard 
          label="Process Time" 
          value="1.8 d" 
          subtext="Avg. time to decision"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[16px]">
        {/* Expenses by Category */}
        <div className="lg:col-span-1 bg-surface border border-border-default rounded-[6px] p-[24px] flex flex-col">
           <h3 className="text-[14px] font-medium text-primary mb-[24px]">Category Distribution</h3>
           
           <div className="flex-1 flex flex-col justify-center space-y-[16px]">
              {expensesByCategory?.length > 0 ? expensesByCategory.map((cat, idx) => {
                const percentage = Math.round((cat.totalAmount / summary.totalApprovedAmount) * 100) || 0;
                
                return (
                  <div key={cat.category} className="space-y-[8px]">
                    <div className="flex justify-between items-end">
                       <span className="text-[13px] text-secondary capitalize">{cat.category}</span>
                       <span className="text-[13px] font-mono text-primary">{companySymbol}{cat.totalAmount?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="h-[4px] w-full bg-border-default flex">
                       <div 
                         className="h-full bg-primary" 
                         style={{ width: `${percentage}%` }}
                       />
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-12">
                   <p className="text-[14px] text-muted">No category data available</p>
                </div>
              )}
           </div>
        </div>

        {/* Recent Flagged Expenses */}
        <div className="lg:col-span-2 bg-surface border border-border-default rounded-[6px] overflow-hidden pt-[24px]">
           <div className="flex items-center justify-between mb-[16px] px-[24px]">
             <h3 className="text-[14px] font-medium text-primary">High-Risk Alerts</h3>
             <button className="text-[11px] font-mono uppercase tracking-[0.03em] text-accent hover:text-accent-hover">View All</button>
           </div>
           
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-page text-[11px] uppercase font-mono tracking-[0.08em] text-secondary border-b border-t border-border-default h-[48px]">
                    <th className="px-[24px] font-normal">Employee</th>
                    <th className="px-[24px] font-normal">Reason</th>
                    <th className="px-[24px] font-normal">Amount</th>
                    <th className="px-[24px] font-normal text-right">Risk</th>
                 </tr>
              </thead>
              <tbody>
                 {flaggedExpenses?.map((fe) => (
                    <tr key={fe.id} className="h-[48px] border-b border-border-default even:bg-[#FAFAF8] text-[13px] text-primary">
                       <td className="px-[24px]">{fe.employeeName}</td>
                       <td className="px-[24px] text-secondary truncate max-w-[200px]">{fe.riskFlags?.[0]?.detail || 'Suspicious patterns'}</td>
                       <td className="px-[24px] font-mono">{companySymbol}{fe.amountInCompanyCurrency?.toLocaleString() || '0'}</td>
                       <td className="px-[24px] text-right font-mono flex flex-col items-end justify-center h-[48px]">
                         <span>{fe.riskScore}%</span>
                         <div className={`w-[24px] border-b-[2px] mt-1 ${fe.riskScore >= 70 ? 'border-danger' : 'border-warning'}`} />
                       </td>
                    </tr>
                 ))}
                 {(!flaggedExpenses || flaggedExpenses.length === 0) && (
                    <tr><td colSpan="4" className="py-[40px] text-center text-[14px] text-muted">All clear. No flagged items.</td></tr>
                 )}
              </tbody>
           </table>
        </div>
      </div>

      <div className="bg-surface border border-border-default rounded-[6px] p-[24px] flex flex-col md:flex-row items-center gap-[24px] justify-between">
        <div>
           <h4 className="text-[18px] font-medium text-primary tracking-[-0.01em] mb-[8px]">Financial Health Score: <span className="font-mono">94/100</span></h4>
           <p className="text-[13px] text-secondary max-w-2xl">
             Your company is maintaining healthy reimbursement cycles. Average audit risk remains low, 
             and policy compliance is exceeding industry benchmarks.
           </p>
        </div>
        <button className="h-[36px] px-[16px] bg-primary text-white rounded-[4px] text-[13px] font-medium hover:bg-[#2A2A2A] whitespace-nowrap">
           Download Report
        </button>
      </div>
    </div>
  );
}
