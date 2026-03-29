import { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, ShieldCheck, 
  Trash2, Edit3, ChevronRight, Scale,
  Layers, Users, ArrowRight, User, Loader2
} from 'lucide-react';
import { rulesApi } from '../../services/api';
import RuleEditorModal from './RuleEditorModal';

const RuleCard = ({ rule, onEdit, onDelete }) => {
  const typeLabels = {
    sequential: 'Sequential Approvals',
    percentage: 'Majority/Percentage',
    specific:   'Specific Approver Only',
    hybrid:     'Hybrid (Percentage or Specific)',
  };

  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
      {/* Accent bar */}
      <div className={`absolute top-0 left-0 w-1 h-full ${rule.isActive ? 'bg-indigo-500' : 'bg-slate-300'}`} />

      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 mb-4 group-hover:scale-105 transition-transform">
             <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => onEdit(rule)}
              className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onDelete(rule.id)}
              className="p-2 text-slate-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mb-4">
           <h3 className="text-base font-bold text-slate-800">{rule.name}</h3>
           <p className="text-xs text-slate-400 mt-1 line-clamp-2">{rule.description || 'No description provided.'}</p>
        </div>

        <div className="space-y-3 mt-auto">
           <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
             <Scale className="w-3.5 h-3.5 text-slate-400" />
             {typeLabels[rule.approvalType] || rule.approvalType}
           </div>

           <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
             <Layers className="w-3.5 h-3.5 text-slate-400" />
             {rule.steps?.length || 0} Step{rule.steps?.length !== 1 ? 's' : ''} {rule.isManagerFirst && '+ Manager'}
           </div>

           {rule.category && (
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg w-max border border-indigo-100">
                Category: <span className="capitalize">{rule.category}</span>
              </div>
           )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
           <div className="flex -space-x-2">
              {rule.steps?.slice(0, 3).map((s, i) => (
                <div key={i} className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600 bg-gradient-to-br from-indigo-50 to-indigo-100">
                  {s.approver_name?.charAt(0) || '?'}
                </div>
              ))}
              {(rule.steps?.length || 0) > 3 && (
                <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-400">
                  +{(rule.steps?.length || 0) - 3}
                </div>
              )}
           </div>
           {!rule.isActive && (
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inactive</span>
           )}
        </div>
      </div>
    </div>
  );
};

export default function RulesPanel() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRuleId, setSelectedRuleId] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const data = await rulesApi.list();
      setRules(data.rules);
    } catch (err) {
      console.error('Failed to fetch rules:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Approval Workflow Rules</h1>
          <p className="text-sm text-slate-500 mt-0.5">Define logic for how reimbursements are processed.</p>
        </div>
        <button 
          onClick={() => { setSelectedRuleId(null); setShowEditor(true); }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Create Rule
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-200/70 rounded-2xl p-6 shadow-sm animate-pulse space-y-4">
               <div className="w-12 h-12 bg-slate-100 rounded-2xl mb-4"></div>
               <div className="h-5 bg-slate-100 rounded w-2/3"></div>
               <div className="h-3 bg-slate-50 rounded w-full"></div>
               <div className="h-20 bg-slate-50/50 rounded-xl"></div>
            </div>
          ))
        ) : rules.length === 0 ? (
          <div className="md:col-span-2 xl:col-span-3 p-12 text-center bg-white border border-slate-200/70 rounded-2xl shadow-sm">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
               <ShieldCheck className="w-8 h-8 text-slate-200" />
             </div>
             <p className="font-semibold text-slate-600">No Rules Defined</p>
             <p className="text-sm mt-1 text-slate-400">All expenses will currently route to admins by default.</p>
          </div>
        ) : (
          rules.map((rule) => (
            <RuleCard 
              key={rule.id} 
              rule={rule} 
              onEdit={(r) => { setSelectedRuleId(r.id); setShowEditor(true); }} 
              onDelete={async (id) => {
                if (window.confirm('Delete this rule?')) {
                  await rulesApi.delete(id);
                  fetchRules();
                }
              }} 
            />
          ))
        )}
      </div>

      <RuleEditorModal 
        isOpen={showEditor}
        ruleId={selectedRuleId}
        onClose={() => { setShowEditor(false); setSelectedRuleId(null); }}
        onRefresh={fetchRules}
      />

      <div className="bg-indigo-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-indigo-200">
         {/* Decorative circles */}
         <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
         <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-600 rounded-full -ml-16 -mb-16 blur-xl" />

         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-md">
               <h4 className="text-lg font-bold mb-2">Multi-Tenant Routing Logic</h4>
               <p className="text-indigo-100 text-sm">
                 You can create rules based on expense categories, amount thresholds, and team structure. 
                 Rules are evaluated in order of priority (specific categories first).
               </p>
            </div>
            <div className="flex gap-4">
               <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 text-center min-w-[100px]">
                  <p className="text-xs text-indigo-200 font-semibold uppercase tracking-wider mb-1">HQ Currency</p>
                  <p className="text-xl font-black">{JSON.parse(localStorage.getItem('user'))?.company?.currencyCode || 'USD'}</p>
               </div>
               <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 text-center min-w-[100px]">
                  <p className="text-xs text-indigo-200 font-semibold uppercase tracking-wider mb-1">Active Rules</p>
                  <p className="text-xl font-black">{rules.length}</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
