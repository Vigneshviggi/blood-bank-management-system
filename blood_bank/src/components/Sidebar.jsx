import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const baseMenuItems = [
    { label: 'Dashboard', icon: 'M3 12h18M3 6h18M3 18h18', path: '/' },
    { label: 'Donors', icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z', path: '/donors' },
    { label: 'Requests', icon: 'M9 12h6M12 9v6M20 6H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Z', path: '/requests' },
    { label: 'Hospitals', icon: 'M12 3 4 7v13h16V7l-8-4Zm0 2.236 5.754 2.877V19H6.246V8.113L12 5.236ZM11 11h2v4h3v2h-3v3h-2v-3H8v-2h3v-4Z', path: '/hospitals' },
    { label: 'Inventory', icon: 'M6 7h12M6 12h12M6 17h12', path: '/inventory' },
    { label: 'Camps', icon: 'M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5Z', path: '/camps' },
  ]

  const adminItems = user?.role === 'admin' ? [
    { label: 'Admin Center', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', path: '/admin-panel' }
  ] : []

  const menuItems = [
    ...baseMenuItems,
    ...adminItems,
    { label: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 1 1-6 0h6Z', path: '/notifications' },
    { label: 'My Camps', icon: 'M9 11H7v2h2v-2Zm6 0h-2v2h2v-2Zm4-7H3c-1.1 0-1.99.9-1.99 2L1 20c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 18H3V9h18v13Z', path: '/my-camps' },
    { label: 'Settings', icon: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l1.72-1.34c.15-.12.19-.34.1-.51l-1.63-2.82c-.12-.22-.37-.29-.59-.22l-2.03.81c-.42-.32-.9-.6-1.42-.82l-.3-2.16c-.04-.24-.24-.41-.5-.41h-3.26c-.26 0-.46.17-.49.41l-.3 2.16c-.52.22-1 .5-1.42.82l-2.03-.81c-.22-.09-.47 0-.59.22L2.74 8.87c-.09.17-.05.39.1.51l1.72 1.34c-.05.3-.07.62-.07.94s.02.64.07.94l-1.72 1.34c-.15.12-.19.34-.1.51l1.63 2.82c.12.22.37.29.59.22l2.03-.81c.42.32.9.6 1.42.82l.3 2.16c.03.24.23.41.49.41h3.26c.26 0 .46-.17.49-.41l.3-2.16c.52-.22 1-.5 1.42-.82l2.03.81c.22.09.47 0 .59-.22l1.63-2.82c.09-.17.05-.39-.1-.51l-1.72-1.34ZM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6Z', path: '/settings' },
    { label: 'Profile', icon: 'M12 12c2.485 0 4.5-2.015 4.5-4.5S14.485 3 12 3 7.5 5.015 7.5 7.5 9.515 12 12 12Zm0 2c-3.314 0-6 1.79-6 4v1h12v-1c0-2.21-2.686-4-6-4Z', path: '/profile' },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 xl:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-16 bottom-0 z-30 w-64 transform border-r border-slate-200 bg-white px-4 py-6 overflow-y-auto transition-transform duration-300 ease-in-out sm:top-16 lg:top-20 xl:static xl:translate-x-0 xl:w-72 xl:px-5 xl:py-8 dark:border-gray-700 dark:bg-gray-900 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-red-600 dark:text-red-400">Main navigation</p>
        </div>
        <nav className="space-y-1 sm:space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition sm:rounded-3xl sm:px-4 sm:py-3 ${isActive ? 'bg-red-600 text-white shadow-lg shadow-red-200/50' : 'text-slate-600 hover:bg-slate-100 dark:text-gray-300 dark:hover:bg-gray-800'}`}
              >
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:mt-10 sm:rounded-3xl sm:p-5 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs font-semibold text-slate-900 dark:text-white sm:text-sm">Help Center</p>
          <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-gray-400 sm:text-sm">Manage donors, requests and inventory from one place.</p>
          <button
            onClick={() => {
              navigate('/contact-support')
              onClose()
            }}
            className="mt-3 w-full rounded-full bg-red-600 px-3 py-2 text-xs font-semibold text-white transition-all duration-200 ease-in-out hover:bg-red-700 hover:scale-105 hover:shadow-md active:scale-95 sm:mt-4 sm:rounded-2xl sm:px-4 sm:py-2 sm:text-sm"
          >
            Contact Support
          </button>
        </div>
      </aside>
    </>
  )
}
