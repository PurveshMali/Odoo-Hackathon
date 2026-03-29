import { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, FileText, 
  ChevronRight, Calendar, AlertCircle,
  Clock, CheckCircle, XCircle 
} from 'lucide-react';
import { expensesApi } from '../../services/api';
import ExpenseSubmissionModal from './ExpenseSubmissionModal';
import ExpenseDetailModal    from './ExpenseDetailModal';

const StatusBadge = ({ status }) => {
  const styles = {
    pending:   'bg-amber-50 text-amber-600 border-amber-100',
    approved:  'bg-emerald-50 text-emerald-600 border-emerald-100',
    rejected:  'bg-red-50 text-red-600 border-red-100',
    in_review: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    cancelled: 'bg-slate-50 text-slate-500 border-slate-100',
    draft:     'bg-slate-50 text-slate-500 border-slate-100',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status] || styles.pending}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export default function ExpensesPanel() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmit, setShowSubmit] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const companySymbol = user.company?.currencySymbol || '$';

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await expensesApi.list();
      setExpenses(data.expenses);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 text-center sm:text-left">My Expenses</h1>
          <p className="text-sm text-slate-500 text-center sm:text-left mt-0.5">Track and manage your reimbursement requests.</p>
        </div>
        <button 
          onClick={() => setShowSubmit(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Submit Expense
        </button>
      </div>

      <div className="bg-white border border-slate-200/70 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search expenses..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
          <button className="p-2 text-slate-500 hover:bg-white hover:text-slate-800 rounded-xl border border-transparent hover:border-slate-200 transition-all">
            <Filter className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">
                <th className="px-6 py-4">Expense Details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-5"><div className="h-4 bg-slate-100 rounded w-48 mb-2"></div><div className="h-3 bg-slate-50 rounded w-32"></div></td>
                    <td className="px-6 py-5"><div className="h-4 bg-slate-100 rounded w-20"></div></td>
                    <td className="px-6 py-5"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                    <td className="px-6 py-5"><div className="h-4 bg-slate-100 rounded w-16"></div></td>
                    <td className="px-6 py-5"><div className="h-4 bg-slate-100 rounded ml-auto w-20"></div></td>
                  </tr>
                ))
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">No expenses found</p>
                    <p className="text-xs text-slate-400 mt-1">Start by submitting your first reimbursement request.</p>
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr 
                    key={exp.id} 
                    onClick={() => setSelectedExpenseId(exp.id)}
                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-100">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-700 truncate max-w-[200px]">{exp.description}</p>
                          {exp.isFlaggedForReview && (
                             <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 mt-0.5">
                               <AlertCircle className="w-3 h-3" /> Flagged for review
                             </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-slate-500 capitalize px-2 py-1 bg-slate-100 rounded-lg">{exp.category}</span>
                    </td>
                    <td className="px-6 py-4 text-left">
                       <p className="text-sm font-bold text-slate-800">{exp.currencyCode} {exp.amount?.toLocaleString() || '0'}</p>
                       <p className="text-[10px] text-slate-400 font-medium">
                         ≈ {companySymbol}{exp.amountInCompanyCurrency?.toLocaleString() || '0'}
                       </p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={exp.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-xs font-semibold text-slate-600">{new Date(exp.expenseDate).toLocaleDateString()}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Submitted</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Basic Footer Stats */}
      {!loading && expenses.length > 0 && (
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-sm flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending</p>
                  <p className="text-lg font-bold text-slate-800">{expenses.filter(e => e.status === 'pending').length}</p>
               </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-sm flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Approved</p>
                  <p className="text-lg font-bold text-slate-800">{expenses.filter(e => e.status === 'approved').length}</p>
               </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-sm flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                  <XCircle className="w-5 h-5" />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rejected</p>
                  <p className="text-lg font-bold text-slate-800">{expenses.filter(e => e.status === 'rejected').length}</p>
               </div>
            </div>
         </div>
      )}

      {/* Modals */}
      <ExpenseSubmissionModal 
        isOpen={showSubmit} 
        onClose={() => setShowSubmit(false)} 
        onRefresh={fetchExpenses} 
      />

      {selectedExpenseId && (
        <ExpenseDetailModal 
          expenseId={selectedExpenseId} 
          isOpen={!!selectedExpenseId} 
          onClose={() => setSelectedExpenseId(null)} 
          onRefresh={fetchExpenses}
        />
      )}
    </div>
  );
}
