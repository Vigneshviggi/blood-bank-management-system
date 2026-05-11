import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Card from './Card.jsx'

export default function AdminPanel() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('users')
  const [data, setData] = useState({
    users: [],
    requests: [],
    donors: [],
    camps: []
  })
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDonations: 0,
    activeRequests: 0,
    upcomingCamps: 0
  })

  // Edit Modal State
  const [editingItem, setEditingItem] = useState(null)
  const [editFormData, setEditFormData] = useState({})

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [u, r, d, c] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/users`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/requests`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/donors`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/camps`)
      ])

      setData({
        users: u.data,
        requests: r.data,
        donors: d.data,
        camps: c.data
      })

      setStats({
        totalUsers: u.data.length,
        totalDonations: d.data.length,
        activeRequests: r.data.filter(req => req.status !== 'Completed').length,
        upcomingCamps: c.data.length
      })
    } catch (error) {
      console.error("Failed to fetch admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePromote = async (userId) => {
    if (!window.confirm('Are you sure you want to promote this user to Admin?')) return
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/users/${userId}`, { role: 'admin' })
      alert('User promoted to Admin! 👑')
      fetchAllData()
    } catch (error) {
      alert('Promotion failed: ' + error.message)
    }
  }

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type.slice(0, -1)}? This action cannot be undone.`)) return
    
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/${type}/${id}`)
      alert('Record deleted successfully from database! 🗑️')
      fetchAllData()
    } catch (error) {
      alert('Delete failed: ' + error.message)
    }
  }

  const handleEditClick = (item) => {
    setEditingItem(item)
    setEditFormData({ ...item })
  }

  const handleSaveEdit = async () => {
    const id = editingItem._id || editingItem.id;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/${activeTab}/${id}`, editFormData)
      alert('Record updated in database successfully! ✅')
      setEditingItem(null)
      fetchAllData()
    } catch (error) {
      alert('Update failed: ' + error.message)
    }
  }

  const tabs = [
    { id: 'users', label: 'Users', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
    { id: 'requests', label: 'Requests', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { id: 'donors', label: 'Donors', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg> },
    { id: 'camps', label: 'Camps', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  ]

  return (
    <div className="px-4 pb-12 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="mx-auto max-w-7xl">
        {/* Back Button & Header */}
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-slate-100 bg-white text-slate-600 shadow-xl shadow-slate-200/50 transition-all hover:-translate-x-1 hover:bg-slate-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:shadow-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white sm:text-5xl">Master Control Center</h1>
              <p className="mt-2 text-slate-500 dark:text-gray-400 font-medium italic">Monitoring and managing the entire LifeLink network infrastructure.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={fetchAllData} className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-600 hover:bg-slate-50 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400">
                <svg className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
             </button>
          </div>
        </div>

        {/* System Overview Stats */}
        <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Network Users', value: stats.totalUsers, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Active Requests', value: stats.activeRequests, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Total Donations', value: stats.totalDonations, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Live Camps', value: stats.upcomingCamps, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map(stat => (
            <div key={stat.label} className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
              <h2 className={`mt-4 text-4xl font-black ${stat.color}`}>{stat.value}</h2>
            </div>
          ))}
        </div>

        {/* Management Interface */}
        <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
          {/* Sidebar Tabs */}
          <aside className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-4 rounded-2xl px-6 py-5 text-sm font-bold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/20 translate-x-2 dark:bg-white dark:text-slate-900'
                    : 'text-slate-500 hover:bg-white hover:shadow-lg dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </aside>

          {/* Table Area - No scrollable container */}
          <div className="rounded-[2.5rem] border border-slate-100 bg-white shadow-2xl shadow-slate-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50 bg-slate-50/50 dark:border-gray-800 dark:bg-gray-800/30">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Identity / Info</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Meta Details</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                    <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-gray-800">
                  {loading ? (
                    <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-500 italic">Refreshing data core...</td></tr>
                  ) : data[activeTab].length === 0 ? (
                    <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-500 italic">No records found in this vector.</td></tr>
                  ) : data[activeTab].map((item) => (
                    <tr key={item._id} className="group hover:bg-slate-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-gray-800 flex items-center justify-center font-black text-slate-400 uppercase">
                            {item.name?.[0] || item.bloodType?.[0] || '?' }
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{item.name || item.bloodType || 'Unnamed Record'}</p>
                            <p className="text-xs text-slate-500">{item.email || item.location || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-700 dark:text-gray-300">
                            {activeTab === 'users' ? item.role : activeTab === 'requests' ? item.quantity + ' Units' : item.type || item.bloodGroup}
                          </p>
                          <p className="text-[10px] font-medium text-slate-400">{item._id}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          Verified
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {activeTab === 'users' && item.role !== 'admin' && (
                            <button 
                              onClick={() => handlePromote(item._id)}
                              className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-100 dark:border-emerald-900/30 dark:bg-emerald-900/20 dark:text-emerald-400"
                            >
                              Promote
                            </button>
                          )}
                          <button 
                            onClick={() => handleEditClick(item)}
                            className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-100 dark:border-blue-900/30 dark:bg-blue-900/20 dark:text-blue-400"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => {
                              const id = item._id || item.id;
                              if (activeTab === 'users' || activeTab === 'donors') navigate(`/profile-view/${id}`);
                              else if (activeTab === 'camps') navigate(`/camp/${id}`);
                              else if (activeTab === 'requests') navigate(`/respond/${id}`);
                            }}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => handleDelete(activeTab, item._id || item.id)}
                            className="rounded-xl bg-red-600 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-red-500/20 hover:bg-red-700"
                          >
                            Purge
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-2xl rounded-[2.5rem] bg-white p-8 shadow-2xl dark:bg-gray-900">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Modify Data Core</h2>
            
            <div className="grid gap-6 sm:grid-cols-2 mb-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Name / Title</label>
                <input 
                  type="text" 
                  value={editFormData.name || editFormData.bloodType || ''} 
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-red-500 dark:border-gray-800 dark:bg-gray-800"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Location</label>
                <input 
                  type="text" 
                  value={editFormData.location || ''} 
                  onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-red-500 dark:border-gray-800 dark:bg-gray-800"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Blood Group / Type</label>
                <input 
                  type="text" 
                  value={editFormData.bloodGroup || editFormData.type || ''} 
                  onChange={(e) => setEditFormData({ ...editFormData, bloodGroup: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-red-500 dark:border-gray-800 dark:bg-gray-800"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Role / Units</label>
                <input 
                  type="text" 
                  value={editFormData.role || editFormData.quantity || ''} 
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-red-500 dark:border-gray-800 dark:bg-gray-800"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setEditingItem(null)}
                className="flex-1 rounded-2xl border border-slate-200 py-4 font-bold text-slate-600 hover:bg-slate-50 dark:border-gray-800 dark:text-gray-400"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                className="flex-1 rounded-2xl bg-slate-900 py-4 font-bold text-white shadow-xl shadow-slate-900/20 hover:bg-black dark:bg-white dark:text-slate-900"
              >
                Save Changes to DB
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
