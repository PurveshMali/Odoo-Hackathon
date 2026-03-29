import { useState, useEffect } from 'react';
import { 
  ClipboardCheck, Search, Filter, 
  ExternalLink, CheckCircle, XCircle,
  AlertCircle, ArrowRight, User, Loader2
} from 'lucide-react';
import { approvalsApi } from '../../services/api';
import DecisionModal      from './DecisionModal';
import ExpenseDetailModal from './ExpenseDetailModal';

const RiskLevel = ({ score }) => {
  const color = score >= 70 ? 'text-red-600 bg-red-50' : score >= 40 ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50';
  return (
    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border border-current ${color}`}>
      Risk: {score}%
    </span>
  );
};

export default function ApprovalsPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);
  const [decision, setDecision] = useState(null); // { expense, action }

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const data = await approvalsApi.pending();
      setItems(data.expenses);
    } catch (err) {
      console.error('Failed to fetch approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Pending Approvals</h1>
          <p className="text-sm text-slate-500 mt-0.5">Review and process reimbursement requests from your team.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200/70 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
           <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
             <ClipboardCheck className="w-4 h-4 text-indigo-500" />
             Inbox ({items.length})
           </div>
           <div className="flex items-center gap-2">
             <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><Search className="w-4 h-4" /></button>
             <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><Filter className="w-4 h-4" /></button>
           </div>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="p-6 animate-pulse flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                  <div className="h-3 bg-slate-50 rounded w-1/4"></div>
                </div>
                <div className="w-24 h-8 bg-slate-50 rounded-xl"></div>
              </div>
            ))
          ) : items.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                 <CheckCircle className="w-8 h-8 text-slate-200" />
               </div>
               <p className="font-semibold text-slate-600">Inbox Clear!</p>
               <p className="text-sm mt-1">You have no pending approval requests at the moment.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="p-5 hover:bg-slate-50/50 transition-all group flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg shrink-0 border border-indigo-100 group-hover:scale-110 transition-transform">
                     {item.employeeName?.charAt(0) || '?'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-slate-800">{item.employeeName}</p>
                      <ArrowRight className="w-3 h-3 text-slate-300" />
                      <p className="text-sm font-medium text-slate-500">{item.category}</p>
                      {item.isFlaggedForReview && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 px-1.5 py-0.5 bg-amber-50 rounded-lg border border-amber-100">
                          <AlertCircle className="w-3 h-3" /> FLAG
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 truncate max-w-[400px]">{item.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <RiskLevel score={item.riskScore} />
                      <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">•</span>
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase">
                         <User className="w-3 h-3" /> Step {item.currentStep}
                      </span>
                    </div>
                   </div>
                </div>

                <div className="flex flex-col md:items-end gap-1 shrink-0">
                   <p className="text-sm font-black text-slate-800 leading-none">
                      {item.currencySymbol}{item.amountInCompanyCurrency?.toLocaleString() || '0'}
                   </p>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                      HQ Total ({item.currencyCode} {item.amount?.toLocaleString()})
                   </p>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                    <button 
                      onClick={() => setDecision({ expense: item, action: 'approve' })}
                        className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100"
                        title="Quick Approve"
                      >
                         <CheckCircle className="w-4.5 h-4.5" />
                      </button>
                      <button 
                         onClick={() => setDecision({ expense: item, action: 'reject' })}
                         className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100"
                         title="Reject"
                      >
                         <XCircle className="w-4.5 h-4.5" />
                      </button>
                      <button 
                        onClick={() => setSelectedExpenseId(item.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all shadow-sm ml-2"
                      >
                         Details
                         <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                   </div>
              </div>
            ))
          )}
        </div>
      </div>

      {decision && (
        <DecisionModal 
          isOpen={!!decision}
          expense={decision.expense}
          action={decision.action}
          onClose={() => setDecision(null)}
          onRefresh={fetchPending}
        />
      )}

      {selectedExpenseId && (
        <ExpenseDetailModal 
          isOpen={!!selectedExpenseId}
          expenseId={selectedExpenseId}
          onClose={() => setSelectedExpenseId(null)}
          onRefresh={fetchPending}
        />
      )}
    </div>
  );
}
