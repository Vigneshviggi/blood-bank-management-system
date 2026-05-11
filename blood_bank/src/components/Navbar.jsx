import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDarkMode } from '../context/DarkModeContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import NotificationDropdown from './NotificationDropdown.jsx'

export default function Navbar({ onMenuToggle }) {
  const [profileOpen, setProfileOpen] = useState(false)
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl dark:border-gray-700 dark:bg-gray-900/95">
      <div className="mx-auto flex h-16 max-w-full items-center justify-between gap-2 px-3 sm:px-4 md:px-6 lg:px-8 lg:h-20">
        {/* ... mobile menu toggle ... */}
        <button
          onClick={onMenuToggle}
          className="inline-flex xl:hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>

        {/* Logo */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-500/20 sm:h-12 sm:w-12">
            <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z" />
              <path d="M12 11v6m-3-3h6" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-slate-900 dark:text-white sm:text-sm tracking-tight">LifeLink</p>
            <p className="text-[10px] text-slate-500 dark:text-gray-400 sm:text-xs">Professional Blood Network</p>
          </div>
        </div>

        {/* Search bar */}
        <div className="hidden flex-1 items-center gap-2 md:flex md:max-w-xs lg:max-w-sm">
          <div className="flex w-full items-center rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
            <svg className="h-4 w-4 shrink-0 text-slate-400 dark:text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="search"
              placeholder="Search data..."
              className="ml-2 w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400 dark:text-gray-300 dark:placeholder:text-gray-500 lg:text-sm"
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleDarkMode}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:text-white lg:h-11 lg:w-11"
          >
            {isDarkMode ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {!user ? (
            <Link
              to="/login"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-xs font-bold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-700 sm:text-sm lg:h-11"
            >
              Sign In
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              {/* Notifications Dropdown */}
              <NotificationDropdown />

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((open) => !open)}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 shadow-sm transition hover:border-slate-300 sm:gap-2 sm:px-3 sm:text-sm lg:h-11 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-sm font-semibold text-red-700 sm:h-9 sm:w-9">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </span>
                  <span className="hidden sm:inline font-semibold">{user.name || 'User'}</span>
                  <svg className={`h-3 w-3 text-slate-500 sm:h-4 w-4 transition-transform ${profileOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 z-20 mt-2 w-40 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl sm:mt-3 sm:w-48 dark:border-gray-700 dark:bg-gray-800 animate-in fade-in slide-in-from-top-2 duration-200">
                    {user.role === 'admin' && (
                      <Link to="/admin-panel" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-red-600 transition rounded-xl hover:bg-red-50 sm:text-sm sm:py-3 dark:text-red-400 dark:hover:bg-red-900/20">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        Admin Center
                      </Link>
                    )}
                    <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-700 transition rounded-xl hover:bg-slate-100 sm:text-sm sm:py-3 dark:text-gray-300 dark:hover:bg-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      Profile
                    </Link>
                    <Link to="/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-700 transition rounded-xl hover:bg-slate-100 sm:text-sm sm:py-3 dark:text-gray-300 dark:hover:bg-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 border-t border-slate-100 mt-1 px-3 py-2 text-xs font-bold text-red-600 transition rounded-xl hover:bg-red-50 sm:text-sm sm:py-3 dark:border-gray-700 dark:hover:bg-red-900/20"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
