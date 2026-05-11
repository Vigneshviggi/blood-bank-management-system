import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDarkMode } from '../context/DarkModeContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Settings() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  
  const [activeTab, setActiveTab] = useState('account')
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '+1 (555) 000-0000',
    bloodGroup: user?.bloodGroup || 'O+',
    location: user?.location || 'New York, USA',
  })

  const [notifications, setNotifications] = useState({
    emergency: true,
    camps: true,
    general: false
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = () => {
    alert('Settings saved successfully! (Demo Mode)')
  }

  const tabs = [
    { id: 'account', label: 'Account', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    { id: 'notifications', label: 'Notifications', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0h6z" /></svg> },
    { id: 'security', label: 'Security', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> },
    { id: 'preferences', label: 'Preferences', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  ]

  return (
    <div className="px-4 pb-12 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Settings</h1>
            <p className="mt-2 text-slate-600 dark:text-gray-400">Configure your personal preferences and security</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Sidebar Tabs */}
          <aside className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-sm font-bold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/30 translate-x-2'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
              >
                <span className={`p-2 rounded-lg ${activeTab === tab.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-gray-800'}`}>
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            ))}
            
            <div className="mt-8 border-t border-slate-100 pt-6 dark:border-gray-800">
              <button
                onClick={logout}
                className="flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <span className="p-2 bg-red-100 rounded-lg dark:bg-red-900/40">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </span>
                Sign Out
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none sm:p-10">
            {activeTab === 'account' && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-6">
                  <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-red-100 text-3xl font-bold text-red-600 shadow-inner dark:bg-red-900/30">
                    {formData.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Profile Picture</h3>
                    <p className="text-sm text-slate-500 dark:text-gray-400">Click to update your avatar</p>
                    <button className="mt-3 text-sm font-bold text-red-600 hover:underline">Change Photo</button>
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-gray-300">Full Name</label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/5 dark:border-gray-800 dark:bg-gray-800/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-gray-300">Email Address</label>
                    <input
                      name="email"
                      value={formData.email}
                      readOnly
                      className="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-500 outline-none dark:border-gray-800 dark:bg-gray-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-gray-300">Phone Number</label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/5 dark:border-gray-800 dark:bg-gray-800/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-gray-300">Blood Group</label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/5 dark:border-gray-800 dark:bg-gray-800/50"
                    >
                      {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-gray-300">Primary Location</label>
                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/5 dark:border-gray-800 dark:bg-gray-800/50"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSave}
                    className="rounded-2xl bg-red-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-red-500/30 transition hover:bg-red-700 active:scale-95"
                  >
                    Save Account Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="rounded-3xl bg-slate-50 p-6 dark:bg-gray-800/50">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Email Notifications</h3>
                  <p className="text-sm text-slate-500 dark:text-gray-400">Manage how you receive alerts and updates</p>
                  
                  <div className="mt-6 space-y-4">
                    {[
                      { id: 'emergency', label: 'Emergency Alerts', desc: 'Instant alerts for critical blood needs in your area' },
                      { id: 'camps', label: 'Donation Camps', desc: 'Weekly updates on upcoming blood drives' },
                      { id: 'general', label: 'System Updates', desc: 'Monthly newsletter and feature announcements' },
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex-1 pr-4">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{item.label}</p>
                          <p className="text-xs text-slate-500 dark:text-gray-400">{item.desc}</p>
                        </div>
                        <button
                          onClick={() => toggleNotification(item.id)}
                          className={`relative flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                            notifications[item.id] ? 'bg-red-600' : 'bg-slate-300 dark:bg-gray-700'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                            notifications[item.id] ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="rounded-3xl bg-slate-50 p-6 dark:bg-gray-800/50">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Authentication</h3>
                  <p className="text-sm text-slate-500 dark:text-gray-400">Keep your account secure with a strong password</p>
                  
                  {!showPasswordForm ? (
                    <button
                      onClick={() => setShowPasswordForm(true)}
                      className="mt-6 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-50 dark:bg-gray-700 dark:text-white"
                    >
                      Update Password
                    </button>
                  ) : (
                    <div className="mt-6 space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Current Password</label>
                        <input type="password" placeholder="••••••••" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-red-500 dark:border-gray-700 dark:bg-gray-900" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">New Password</label>
                        <input type="password" placeholder="••••••••" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-red-500 dark:border-gray-700 dark:bg-gray-900" />
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => setShowPasswordForm(false)} className="rounded-xl bg-red-600 px-6 py-2 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-700">Save Password</button>
                        <button onClick={() => setShowPasswordForm(false)} className="rounded-xl border border-slate-200 px-6 py-2 text-sm font-bold text-slate-600 dark:border-gray-700">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-3xl border border-red-100 bg-red-50/50 p-6 dark:border-red-900/30 dark:bg-red-900/10">
                  <h3 className="text-lg font-bold text-red-900 dark:text-red-400">Danger Zone</h3>
                  <p className="text-sm text-red-700/70 dark:text-red-400/70">Permanently delete your account and all data</p>
                  <button className="mt-4 rounded-xl bg-red-600 px-6 py-2 text-sm font-bold text-white transition hover:bg-red-700">Delete Account</button>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between rounded-3xl bg-slate-50 p-8 dark:bg-gray-800/50">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Dark Mode</h3>
                    <p className="text-sm text-slate-500 dark:text-gray-400">Switch between light and dark themes</p>
                  </div>
                  <button
                    onClick={toggleDarkMode}
                    className={`relative flex h-8 w-14 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                      isDarkMode ? 'bg-red-600' : 'bg-slate-300 dark:bg-gray-700'
                    }`}
                  >
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200 ${
                      isDarkMode ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-gray-300">Display Language</label>
                  <select className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium outline-none focus:border-red-500 dark:border-gray-800 dark:bg-gray-800/50">
                    <option>English (United States)</option>
                    <option>Hindi (India)</option>
                    <option>Spanish (Mexico)</option>
                    <option>French (France)</option>
                  </select>
                </div>
              </div>
            )}


          </div>
        </div>
      </div>
    </div>
  )
}
