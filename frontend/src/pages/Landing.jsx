import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, Receipt, CheckCircle, Globe, Zap, Shield } from 'lucide-react';

const Landing = () => {
  // If user is already logged in, they shouldn't see the landing page
  const token = localStorage.getItem('token');
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 font-sans selection:bg-indigo-500/30">
      
      {/* Navigation */}
      <nav className="absolute top-0 w-full z-10 bg-transparent py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 flex items-center justify-center bg-indigo-500 rounded-md text-white font-black text-lg shadow-lg shadow-indigo-500/20">E</span>
            <span className="text-xl font-bold tracking-tight text-white">Expensio</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Login
            </Link>
            <Link 
              to="/signup" 
              className="text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/10 px-5 py-2.5 rounded-lg transition-all backdrop-blur-md"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] -z-0"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px] -z-0"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-xs font-semibold uppercase tracking-widest mb-8 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Reimbursement Management
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white mb-8 leading-tight">
            Streamline your <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              company reimbursements.
            </span>
          </h1>
          
          <p className="mt-4 max-w-2xl text-lg sm:text-xl text-slate-400 mx-auto mb-10 leading-relaxed">
            Fast, accurate, and completely transparent. Submit your claims, get manager approval, and receive payments in your local currency without the hassle.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/signup" 
              className="group flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-lg text-base font-semibold transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 w-full sm:w-auto"
            >
              Start using Expensio
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/login" 
              className="flex items-center justify-center bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-3.5 rounded-lg text-base font-medium transition-all w-full sm:w-auto backdrop-blur-sm"
            >
              Sign in to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Section (White content area transition) */}
      <div className="relative bg-white text-slate-800 py-24 sm:py-32 rounded-t-[3rem] sm:rounded-t-[4rem] shadow-2xl z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-4">
              Everything you need for Reimbursements
            </h2>
            <p className="text-lg text-slate-500">
              We've built a robust platform that handles everything from request submissions to multi-currency payouts seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            
            {/* Feature 1 */}
            <div className="group bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <Receipt className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Tracking</h3>
              <p className="text-slate-600 leading-relaxed">
                Log your requests instantly. Keep track of exactly where your reimbursement stands in the queue at any moment.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:border-emerald-100 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Quick Approvals</h3>
              <p className="text-slate-600 leading-relaxed">
                Managers receive instant notifications for new requests. Approve or request modifications with a single click.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:border-cyan-100 hover:shadow-xl hover:shadow-cyan-500/5 transition-all duration-300">
              <div className="w-14 h-14 bg-cyan-100 text-cyan-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <Globe className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Global Accounts</h3>
              <p className="text-slate-600 leading-relaxed">
                Seamless multi-currency support. We dynamically handle base currencies so cross-border teams are always paid accurately.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 py-12 border-t border-slate-800 relative z-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-slate-500 text-sm">
          <div className="flex items-center gap-2 mb-4 sm:mb-0 grayscale opacity-70">
            <span className="w-6 h-6 flex items-center justify-center bg-indigo-500 rounded text-white font-black text-xs">E</span>
            <span className="font-bold tracking-tight text-white">Expensio</span>
          </div>
          <p>© {new Date().getFullYear()} Expensio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
