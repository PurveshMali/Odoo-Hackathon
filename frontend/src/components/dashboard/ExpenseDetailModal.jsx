import { useState, useEffect } from 'react';
import { 
  X, Calendar, Tag, FileText, 
  Clock, CheckCircle, XCircle, 
  AlertCircle, Shield, User,
  ExternalLink, Trash2, Loader2
} from 'lucide-react';
import { expensesApi, approvalsApi } from '../../services/api';
import { API_BASE } from '../../constants/api';

const StatusBadge = ({ status }) => {
  const styles = {
    pending:   'bg-amber-50 text-amber-600 border-amber-100',
    approved:  'bg-emerald-50 text-emerald-600 border-emerald-100',
    rejected:  'bg-red-50 text-red-600 border-red-100',
    in_review: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    cancelled: 'bg-slate-50 text-slate-500 border-slate-100',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export default function ExpenseDetailModal({ expenseId, isOpen, onClose, onRefresh }) {
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (isOpen && expenseId) fetchDetails();
  }, [isOpen, expenseId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const data = await expensesApi.getById(expenseId);
      setExpense(data.expense);
    } catch (err) {
      console.error('Failed to fetch expense details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this expense request?')) return;
    try {
      setCancelling(true);
      await expensesApi.cancel(expenseId);
      onRefresh();
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to cancel expense.');
    } finally {
      setCancelling(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh]">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-slate-50">
             <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
             <p className="text-sm font-bold text-slate-500">Loading expense data...</p>
          </div>
        ) : (
          <>
            {/* Left: Receipt Preview */}
            <div className="w-full md:w-1/2 bg-slate-100 p-8 flex flex-col overflow-hidden">
               <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Receipt Document
                  </h3>
                  {expense.receiptUrl && (
                    <a 
                      href={expense.receiptUrl.startsWith('http') ? expense.receiptUrl : `${API_BASE}${expense.receiptUrl.startsWith('/') ? '' : '/'}${expense.receiptUrl}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="p-2 bg-white rounded-xl shadow-sm text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
               </div>
               
               <div className="flex-1 bg-white rounded-2xl border border-slate-200 overflow-hidden relative group">
                  {expense.receiptUrl ? (
                    expense.receiptUrl.endsWith('.pdf') ? (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-slate-50 text-slate-400">
                         <FileText className="w-16 h-16" />
                         <p className="text-xs font-bold">PDF Document Attached</p>
                      </div>
                    ) : (
                      <img 
                        src={expense.receiptUrl.startsWith('http') ? expense.receiptUrl : `${API_BASE}${expense.receiptUrl.startsWith('/') ? '' : '/'}${expense.receiptUrl}`} 
                        alt="Receipt" 
                        className="w-full h-full object-contain p-4"
                        crossOrigin="anonymous"
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-slate-50 text-slate-300">
                       <FileText className="w-16 h-16 opacity-20" />
                       <p className="text-xs font-bold">No receipt uploaded</p>
                    </div>
                  )}
               </div>

               {/* OCR Info if available */}
               {expense.ocrData?.extracted_vendor && (
                  <div className="mt-4 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">OCR Analysis</p>
                     <p className="text-sm font-bold text-slate-800 tracking-tight">Detected at: {expense.ocrData.extracted_vendor}</p>
                     <p className="text-[10px] text-slate-400 mt-1 uppercase font-black">Confidence: {Math.round(expense.ocrData.ocr_confidence * 100)}%</p>
                  </div>
               )}
            </div>

            {/* Right: Details & Timeline */}
            <div className="w-full md:w-1/2 p-8 flex flex-col overflow-y-auto">
               <div className="flex items-center justify-between mb-8">
                  <StatusBadge status={expense.status} />
                  <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all"><X className="w-5 h-5" /></button>
               </div>

               <div className="space-y-8">
                  <div>
                    <div className="flex items-baseline gap-2 mb-1">
                       <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                          {expense.currencyCode === 'USD' 
                            ? `₹${(expense.amount * 83.5).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
                            : `${expense.currencySymbol || '₹'}${expense.amountInCompanyCurrency?.toLocaleString() || expense.amount?.toLocaleString() || '0'}`
                          }
                       </h2>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
                         {expense.currencyCode === 'USD' ? 'Total (Converted to INR)' : 'Total'}
                       </p>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                       <p className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                         Original: {expense.currencyCode} {expense.amount?.toLocaleString()}
                       </p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Rate: {expense.exchangeRate || '1.00'}</p>
                    </div>
                    <p className="text-sm font-medium text-slate-500 line-clamp-2 italic">"{expense.description}"</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                         <Calendar className="w-3 h-3" /> Date
                       </p>
                       <p className="text-sm font-bold text-slate-700">{new Date(expense.expenseDate).toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-1 text-right">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-end gap-1.5">
                         <Tag className="w-3 h-3" /> Category
                       </p>
                       <p className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg inline-block capitalize">{expense.category}</p>
                    </div>
                  </div>

                  {/* Fraud Score & Flags */}
                  <div className={`p-4 rounded-2xl border ${expense.riskScore >= 70 ? 'bg-red-50 border-red-100 text-red-700' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                     <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                          <Shield className="w-3 h-3" /> Fraud Review
                        </p>
                        <span className="text-xs font-black">Risk Score: {expense.riskScore}%</span>
                     </div>
                     {expense.riskFlags?.length > 0 ? (
                        <div className="space-y-2">
                           {expense.riskFlags.map((flag, idx) => (
                              <div key={idx} className="flex gap-2">
                                 <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                 <p className="text-xs font-medium leading-relaxed">{flag.detail}</p>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <p className="text-xs font-medium opacity-60 italic">No suspicious patterns detected.</p>
                     )}
                  </div>

                  {/* Timeline */}
                  <div className="space-y-4">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> Approval Workflow
                     </p>
                     <div className="space-y-4">
                        {expense.approvalTimeline?.map((step, idx) => (
                           <div key={idx} className="flex gap-4 relative">
                              <div className="flex flex-col items-center shrink-0">
                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm font-bold text-[10px] relative z-10
                                    ${step.status === 'approved' ? 'bg-emerald-500 text-white' : 
                                      step.status === 'rejected' ? 'bg-red-500 text-white' : 
                                      'bg-slate-200 text-slate-500'}`}>
                                    {step.status === 'approved' ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                                 </div>
                                 {idx < expense.approvalTimeline.length - 1 && (
                                    <div className="w-0.5 h-full bg-slate-100 -mt-1" />
                                 )}
                              </div>
                              <div className="pb-4">
                                 <div className="flex items-center gap-2">
                                    <p className="text-xs font-bold text-slate-800">{step.approver_name}</p>
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-wide px-1.5 py-0.5 bg-slate-50 rounded-md border border-slate-100">{step.approver_role}</span>
                                 </div>
                                 {step.status !== 'pending' && (
                                    <p className="text-[10px] text-slate-400 font-medium">Decided {new Date(step.decided_at).toLocaleString()}</p>
                                 )}
                                 {step.comment && (
                                    <div className="mt-2 p-3 bg-slate-50 rounded-xl rounded-tl-none border border-slate-100 text-[11px] text-slate-600 font-medium italic">
                                       "{step.comment}"
                                    </div>
                                 )}
                              </div>
                           </div>
                        ))}
                        {expense.status === 'approved' && (
                           <div className="flex gap-4">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border-4 border-white shadow-sm shrink-0">
                                 <Shield className="w-4 h-4" />
                              </div>
                              <p className="text-xs font-black text-emerald-600 mt-2">REIMBURSEMENT READY</p>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Actions */}
                  {expense.status === 'pending' && (
                    <div className="pt-6 border-t border-slate-100 flex gap-4">
                       <button 
                         onClick={handleCancel}
                         disabled={cancelling}
                         className="flex-1 px-6 py-3.5 bg-red-50 text-red-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-all flex items-center justify-center gap-2 mb-10"
                       >
                         {cancelling ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                         Cancel Request
                       </button>
                    </div>
                  )}
               </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
