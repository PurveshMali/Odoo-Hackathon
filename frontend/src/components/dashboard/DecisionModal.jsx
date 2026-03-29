import { useState } from 'react';
import { 
  X, CheckCircle, XCircle, 
  MessageSquare, Loader2, AlertCircle 
} from 'lucide-react';
import { approvalsApi } from '../../services/api';

export default function DecisionModal({ expense, action, isOpen, onClose, onRefresh }) {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !expense) return null;

  const isReject = action === 'reject';
  const color   = isReject ? 'bg-red-600' : 'bg-emerald-600';
  const Icon    = isReject ? XCircle : CheckCircle;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReject && !comment.trim()) {
      setError('A reason is required for rejection.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      if (isReject) {
        await approvalsApi.reject(expense.id, comment);
      } else {
        await approvalsApi.approve(expense.id, comment);
      }
      onRefresh();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to process decision.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-8">
        <div className="flex items-center justify-between mb-8">
          <div className={`w-12 h-12 rounded-2xl ${isReject ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'} flex items-center justify-center border border-current opacity-80`}>
            <Icon className="w-6 h-6" />
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            {isReject ? 'Reject Expense' : 'Approve Expense'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Request from <span className="font-bold text-slate-800">{expense.employeeName}</span> for <span className="font-black text-slate-800 tracking-tight">{expense.currencySymbol}{expense.amountInCompanyCurrency?.toLocaleString() || '0'}</span>.
          </p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5 flex items-center gap-2">
            Original: {expense.currencyCode} {expense.amount?.toLocaleString()} <span className="text-slate-200">|</span> Rate: {expense.exchangeRate || '1.00'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                 <MessageSquare className="w-3 h-3" /> {isReject ? 'Rejection Reason' : 'Approval Comment (Optional)'}
              </label>
              <textarea 
                rows="3"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={isReject ? "Please explain why this is being rejected..." : "Add a note for the employee..."}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                autoFocus
              />
           </div>

           {error && (
             <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-xs font-bold">
                <AlertCircle className="w-4 h-4" />
                {error}
             </div>
           )}

           <div className="flex gap-4">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 px-6 py-3.5 border border-slate-200 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className={`flex-1 px-6 py-3.5 ${color} text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2`}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
                {loading ? 'Processing...' : (isReject ? 'Confirm Reject' : 'Confirm Approve')}
              </button>
           </div>
        </form>
      </div>
    </div>
  );
}
