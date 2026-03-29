import { useState, useEffect } from 'react';
import { 
  X, Plus, Trash2, Shield, 
  Settings, Users, Layers, 
  Save, AlertCircle, Loader2,
  ChevronDown, UserCheck
} from 'lucide-react';
import { rulesApi, usersApi } from '../../services/api';

const APPROVAL_TYPES = [
  { id: 'sequential', label: 'Sequential Steps', desc: 'Each approver reviews in order.' },
  { id: 'percentage', label: 'Percentage Threshold', desc: 'Requires X% of named approvers to sign off.' },
  { id: 'specific',   label: 'Specific Approver', desc: 'A single designated person must approve.' },
  { id: 'hybrid',     label: 'Hybrid Logic', desc: 'Either specific approver OR percentage threshold.' },
];

const CATEGORIES = [
  'travel', 'food', 'accommodation', 'office_supplies',
  'medical', 'training', 'entertainment', 'miscellaneous',
];

export default function RuleEditorModal({ ruleId, isOpen, onClose, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [approvers, setApprovers] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: null,
    min_amount: '',
    max_amount: '',
    is_manager_first: false,
    approval_type: 'sequential',
    percentage_threshold: '',
    specific_approver_id: '',
    steps: [], // { approver_id, step_order }
  });

  useEffect(() => {
    if (isOpen) {
      fetchApprovers();
      if (ruleId) fetchRule();
      else resetForm();
    }
  }, [isOpen, ruleId]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: null,
      min_amount: '',
      max_amount: '',
      is_manager_first: false,
      approval_type: 'sequential',
      percentage_threshold: '100',
      specific_approver_id: '',
      steps: [],
    });
  };

  const fetchApprovers = async () => {
    try {
      const res = await usersApi.getManagers();
      setApprovers(res.managers || []);
    } catch (err) { console.error('Failed to fetch approvers:', err); }
  };

  const fetchRule = async () => {
    try {
      setLoading(true);
      const res = await rulesApi.list(); // Usually there'd be a getById but list works if cached
      const rule = res.rules.find(r => r.id === ruleId);
      if (rule) {
        setFormData({
          name: rule.name,
          description: rule.description || '',
          category: rule.category || null,
          min_amount: rule.minAmount || '',
          max_amount: rule.maxAmount || '',
          is_manager_first: rule.isManagerFirst || false,
          approval_type: rule.approvalType,
          percentage_threshold: rule.percentageThreshold || '',
          specific_approver_id: rule.specificApproverId || '',
          steps: rule.steps?.map(s => ({ approver_id: s.approver_id, step_order: s.step_order })) || [],
        });
      }
    } catch (err) { console.error('Failed to fetch rule:', err); }
    finally { setLoading(false); }
  };

  const addStep = () => {
    setFormData(p => ({
      ...p,
      steps: [...p.steps, { approver_id: '', step_order: p.steps.length + 1 }]
    }));
  };

  const removeStep = (idx) => {
    const newSteps = formData.steps.filter((_, i) => i !== idx)
      .map((s, i) => ({ ...s, step_order: i + 1 }));
    setFormData(p => ({ ...p, steps: newSteps }));
  };

  const updateStepAt = (idx, approverId) => {
    const newSteps = [...formData.steps];
    newSteps[idx].approver_id = approverId;
    setFormData(p => ({ ...p, steps: newSteps }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      
      const payload = {
        ...formData,
        min_amount: formData.min_amount === '' ? null : parseFloat(formData.min_amount),
        max_amount: formData.max_amount === '' ? null : parseFloat(formData.max_amount),
        percentage_threshold: formData.percentage_threshold === '' ? null : parseInt(formData.percentage_threshold),
        specific_approver_id: formData.specific_approver_id || null,
      };

      if (ruleId) await rulesApi.update(ruleId, payload);
      else await rulesApi.create(payload);

      onRefresh();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save rule.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
         {/* Header */}
         <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100">
                  <Shield className="w-5 h-5" />
               </div>
               <div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">
                    {ruleId ? 'Edit Approval Rule' : 'New Approval Rule'}
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">Define hierarchical routing for expense reimbursements.</p>
               </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all"><X className="w-5 h-5" /></button>
         </div>

         {/* Content */}
         <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Col: Basics */}
            <div className="lg:col-span-4 space-y-6">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rule Name</label>
                  <input 
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Travel & Food Logic"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
               </div>

               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category (Optional)</label>
                  <select 
                    value={formData.category || ''}
                    onChange={(e) => setFormData(p => ({ ...p, category: e.target.value || null }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                  >
                    <option value="">Apply to all categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                  </select>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Min Amount</label>
                    <input 
                      type="number"
                      value={formData.min_amount}
                      onChange={(e) => setFormData(p => ({ ...p, min_amount: e.target.value }))}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Max Amount</label>
                    <input 
                      type="number"
                      value={formData.max_amount}
                      onChange={(e) => setFormData(p => ({ ...p, max_amount: e.target.value }))}
                      placeholder="None"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
               </div>

               <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-700">Manager First</p>
                    <p className="text-[10px] text-slate-400">Route to employee's manager first.</p>
                  </div>
                  <button 
                    onClick={() => setFormData(p => ({ ...p, is_manager_first: !p.is_manager_first }))}
                    type="button"
                    className={`w-11 h-6 rounded-full transition-colors relative shadow-inner ${formData.is_manager_first ? 'bg-indigo-600' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${formData.is_manager_first ? 'left-6' : 'left-1'}`} />
                  </button>
               </div>
            </div>

            {/* Middle Col: Logic Type */}
            <div className="lg:col-span-4 space-y-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                 <Settings className="w-3.5 h-3.5" /> Approval Strategy
               </label>
               
               <div className="space-y-3">
                  {APPROVAL_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setFormData(p => ({ ...p, approval_type: type.id }))}
                      className={`w-full text-left p-4 rounded-2xl border transition-all 
                        ${formData.approval_type === type.id 
                          ? 'border-indigo-600 bg-white shadow-md shadow-indigo-100 ring-2 ring-indigo-500/10' 
                          : 'border-slate-200 hover:border-slate-300 bg-white/50'}`}
                    >
                      <p className={`text-sm font-bold ${formData.approval_type === type.id ? 'text-indigo-600' : 'text-slate-700'}`}>
                        {type.label}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{type.desc}</p>
                    </button>
                  ))}
               </div>

               {/* Conditional Inputs for Logic */}
               {(formData.approval_type === 'percentage' || formData.approval_type === 'hybrid') && (
                 <div className="pt-4 space-y-1.5 animate-in fade-in slide-in-from-top-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Minimum Approval %</label>
                    <input 
                      type="number"
                      min="1" max="100"
                      value={formData.percentage_threshold}
                      onChange={(e) => setFormData(p => ({ ...p, percentage_threshold: e.target.value }))}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                 </div>
               )}

               {(formData.approval_type === 'specific' || formData.approval_type === 'hybrid') && (
                 <div className="pt-4 space-y-1.5 animate-in fade-in slide-in-from-top-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Designated Approver</label>
                    <select 
                      value={formData.specific_approver_id}
                      onChange={(e) => setFormData(p => ({ ...p, specific_approver_id: e.target.value }))}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                    >
                      <option value="">Select individual...</option>
                      {approvers.map(a => <option key={a.id} value={a.id}>{a.name} ({a.role})</option>)}
                    </select>
                 </div>
               )}
            </div>

            {/* Right Col: Steps */}
            <div className="lg:col-span-4 space-y-6">
               <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> Approval Steps
                  </label>
                  <button 
                    onClick={addStep}
                    className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg"
                  >
                    Add Step
                  </button>
               </div>

               <div className="space-y-4">
                  {formData.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-3 relative group">
                       <div className="flex flex-col items-center shrink-0 pt-3">
                          <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-200">
                             {idx + 1}
                          </div>
                          {idx < formData.steps.length - 1 && <div className="w-px flex-1 bg-slate-100 my-1" />}
                       </div>
                       <div className="flex-1 space-y-2 pb-2">
                          <div className="relative">
                             <select 
                               value={step.approver_id}
                               onChange={(e) => updateStepAt(idx, e.target.value)}
                               className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-500 transition-all outline-none appearance-none"
                             >
                               <option value="">Choose approver...</option>
                               {approvers.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                             </select>
                             <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <ChevronDown className="w-3 h-3" />
                             </div>
                             <button 
                               onClick={() => removeStep(idx)}
                               className="absolute -right-2 -top-2 w-6 h-6 bg-white shadow-md border border-slate-100 rounded-full flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                             >
                                <X className="w-3 h-3" />
                             </button>
                          </div>
                       </div>
                    </div>
                  ))}

                  {formData.steps.length === 0 && (
                    <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                       <Users className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No manual steps defined</p>
                    </div>
                  )}
               </div>
            </div>
         </div>

         {/* Footer */}
         <div className="px-8 py-6 border-t border-slate-100 shrink-0 bg-slate-50/30 flex items-center justify-between">
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-[11px] font-bold">
                 <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}
            <div className="ml-auto flex gap-4">
               <button 
                 onClick={onClose}
                 className="px-6 py-3 border border-slate-200 text-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white transition-all shadow-sm"
               >
                 Discard
               </button>
               <button 
                 onClick={handleSubmit}
                 disabled={saving}
                 className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2 active:scale-95 disabled:opacity-50"
               >
                 {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                 {saving ? 'Saving...' : 'Save Configuration'}
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
