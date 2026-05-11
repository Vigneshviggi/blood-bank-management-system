import { Link } from 'react-router-dom'

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-white/20 dark:border-gray-800 overflow-hidden z-10">
        
        {/* Branding Side */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-red-600 to-rose-700 text-white relative">
          {/* Subtle Pattern Overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-600 shadow-lg">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z" />
                  <path d="M12 11v6m-3-3h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-2xl font-bold tracking-tight">LifeLink</span>
            </div>
            
            <div className="mt-20">
              <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight">
                Empowering the <br /> 
                <span className="text-red-200">Life-Saving</span> Network.
              </h1>
              <p className="mt-6 text-lg text-rose-100/90 leading-relaxed max-w-md">
                A professional ecosystem connecting donors, hospitals, and coordinators with precision and care.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-start gap-4 p-5 rounded-3xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div>
                <h3 className="font-bold text-base">Bank-Grade Security</h3>
                <p className="text-sm text-rose-100/70 mt-1">Your donation and health data are encrypted and protected.</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-rose-200/60 font-medium pt-8 border-t border-white/10">
              <span>© 2026 LifeLink Global</span>
              <div className="flex gap-4">
                <a href="#" className="hover:text-white transition">Privacy</a>
                <a href="#" className="hover:text-white transition">Terms</a>
              </div>
            </div>
          </div>
        </div>

        {/* Form Side */}
        <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16 bg-white/40 dark:bg-transparent">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-10">
              <div className="lg:hidden flex items-center gap-2 mb-8">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z" />
                    <path d="M12 11v6m-3-3h6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-white">LifeLink</span>
              </div>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h2>
              <p className="mt-3 text-slate-500 dark:text-gray-400 leading-relaxed">{subtitle}</p>
            </div>
            
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
