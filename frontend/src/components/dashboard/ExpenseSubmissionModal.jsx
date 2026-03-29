import { useState, useRef, useEffect } from 'react';
import { 
  X, Upload, FileText, Loader2, 
  Check, AlertCircle, Sparkles, 
  DollarSign, Calendar, Tag, FileType 
} from 'lucide-react';
import { expensesApi } from '../../services/api';

const CATEGORIES = [
  'travel', 'food', 'accommodation', 'office_supplies',
  'medical', 'training', 'entertainment', 'miscellaneous',
];

export default function ExpenseSubmissionModal({ isOpen, onClose, onRefresh }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user')) || {};

  const [formData, setFormData] = useState({
    amount: '',
    currency_code: user.company?.currencyCode || 'USD',
    category: 'travel',
    description: '',
    expense_date: new Date().toISOString().split('T')[0],
    employee_note: '',
  });

  useEffect(() => {
    if (user.company?.currencyCode) {
      setFormData(prev => ({ ...prev, currency_code: user.company.currencyCode }));
    }
  }, [user.company?.currencyCode]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB.');
        return;
      }
      setFile(selected);
      setError('');
      
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selected);

      // Auto-trigger OCR if it's an image
      if (selected.type.startsWith('image/')) {
        handleOcr(selected);
      }
    }
  };

  const handleOcr = async (fileToScan) => {
    try {
      setIsOcrLoading(true);
      setError('');
      const data = await expensesApi.ocr(fileToScan);
      
      if (data?.ocrData) {
        const { extracted_amount, extracted_date, extracted_description, extracted_vendor } = data.ocrData;
        setFormData(prev => ({
          ...prev,
          amount: extracted_amount || prev.amount,
          expense_date: extracted_date ? new Date(extracted_date).toISOString().split('T')[0] : prev.expense_date,
          description: extracted_vendor ? `Expense at ${extracted_vendor}` : (extracted_description || prev.description),
        }));
      }
    } catch (err) {
      console.warn('OCR failed:', err);
      // Don't show hard error for OCR, it's a "bonus" feature
    } finally {
      setIsOcrLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError('');
      
      if (!formData.amount || isNaN(formData.amount)) throw new Error('Valid amount is required.');
      if (!formData.description) throw new Error('Description is required.');

      const response = await expensesApi.submit(formData, file);
      
      onRefresh();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit expense.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[90vh]">
        {/* Left: Receipt Preview & Upload */}
        <div className="w-full md:w-5/12 bg-slate-50 p-6 flex flex-col overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-600" />
              Receipt Upload
            </h3>
            <p className="text-xs text-slate-500 mt-1">Upload an image or PDF for AI auto-fill.</p>
          </div>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 transition-all cursor-pointer min-h-[200px]
              ${preview ? 'border-indigo-200 bg-white' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-100/50'}
            `}
          >
            {preview ? (
              <div className="relative w-full h-full flex items-center justify-center">
                {file?.type === 'application/pdf' ? (
                   <div className="flex flex-col items-center gap-3">
                      <FileType className="w-16 h-16 text-red-400" />
                      <p className="text-xs font-bold text-slate-600 truncate max-w-[150px]">{file.name}</p>
                   </div>
                ) : (
                  <img src={preview} alt="Receipt" className="max-w-full max-h-full object-contain rounded-lg shadow-sm" />
                )}
                <div className="absolute bottom-2 right-2 flex gap-2">
                   <button 
                     onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                     className="p-1.5 bg-white shadow-md rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                   >
                     <X className="w-4 h-4" />
                   </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-12 h-12 bg-white shadow-sm rounded-xl flex items-center justify-center mx-auto mb-4 text-slate-400 group-hover:text-indigo-600 transition-colors">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-600">Click to upload</p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG or PDF up to 5MB</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*,.pdf" 
            />
          </div>

          {isOcrLoading && (
            <div className="mt-4 p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center gap-3 animate-pulse">
               <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
               <span className="text-xs font-bold text-indigo-700 tracking-tight flex items-center gap-1">
                 <Sparkles className="w-3 h-3" />
                 AI is analyzing the receipt...
               </span>
            </div>
          )}
        </div>

        {/* Right: Form */}
        <div className="w-full md:w-7/12 p-8 flex flex-col overflow-y-auto bg-white border-l border-slate-100">
           <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Expense Details</h2>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
           </div>

           <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                 <div className="col-span-1 space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Amount</label>
                    <div className="relative">
                       <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <input 
                         type="number" 
                         step="0.01"
                         value={formData.amount}
                         onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))}
                         placeholder="0.00"
                         className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                         required
                       />
                    </div>
                 </div>
                 <div className="col-span-1 space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Currency</label>
                    <input 
                      type="text" 
                      value={formData.currency_code}
                      onChange={(e) => setFormData(p => ({ ...p, currency_code: e.target.value.toUpperCase() }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      required
                    />
                 </div>
              </div>

              <div className="space-y-1.5">
                 <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Category</label>
                 <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                      className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none outline-none"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                    </select>
                 </div>
              </div>

              <div className="space-y-1.5">
                 <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Date</label>
                 <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="date" 
                      value={formData.expense_date}
                      onChange={(e) => setFormData(p => ({ ...p, expense_date: e.target.value }))}
                      className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      required
                    />
                 </div>
              </div>

              <div className="space-y-1.5">
                 <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
                 <div className="relative">
                    <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <textarea 
                      rows="2"
                      value={formData.description}
                      onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                      placeholder="What was this expense for?"
                      className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                      required
                    />
                 </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-xs font-bold">
                   <AlertCircle className="w-4 h-4" />
                   {error}
                </div>
              )}

              <div className="pt-4 flex gap-4 mt-auto">
                 <button 
                   type="button" 
                   onClick={onClose}
                   className="flex-1 px-6 py-3.5 border border-slate-200 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all"
                 >
                   Cancel
                 </button>
                 <button 
                   type="submit" 
                   disabled={isSubmitting}
                   className="flex-1 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                 >
                   {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                   {isSubmitting ? 'Submitting...' : 'Submit Request'}
                 </button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
}
