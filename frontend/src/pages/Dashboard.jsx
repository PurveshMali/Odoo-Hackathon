import Navbar from '../components/Navbar';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user')) || {};

  return (
    <div className="min-h-screen bg-slate-50 relative">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Dashboard
          </h1>
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-600 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {user.currency_code ? `Currency: ${user.currency_code}` : 'Currency: USD'}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 border border-indigo-100 text-indigo-700 shadow-sm">
              Role: {user.role || 'Employee'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-12 text-center h-[50vh] flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Dashboard Coming Soon</h2>
          <p className="text-slate-500 max-w-sm">
            We are currently building features for the {user.role?.toLowerCase() || 'employee'} view. Please check back later!
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
