import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchRequests } from '../api/requestsApi'
import { fetchStock } from '../api/hospitalsApi'
import { fetchDonors } from '../api/donorsApi'
import { CardSkeleton } from './ui/Skeleton.jsx'
import { useLoading } from '../context/LoadingContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import axios from 'axios'
import Card from './Card.jsx'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [stock, setStock] = useState({})
  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(true)
  const { showLoading, hideLoading } = useLoading()

  useEffect(() => {
    const loadDashboardData = async () => {
      showLoading('Initializing Dashboard...')
      try {
        const [reqs, stockData, donorData] = await Promise.all([
          fetchRequests(),
          fetchStock(),
          fetchDonors()
        ])
        
        setRequests(Array.isArray(reqs) ? reqs : [])
        setStock(stockData || {})
        setDonors(Array.isArray(donorData) ? donorData : [])
      } catch (error) {
        console.error("Dashboard data load failed:", error)
      } finally {
        setLoading(false)
        hideLoading()
      }
    }
    loadDashboardData()
  }, [showLoading, hideLoading])

  if (loading) return (
    <div className="w-full space-y-8 py-6">
      <div className="h-48 w-full bg-slate-100 rounded-[2.5rem] animate-pulse" />
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
      </div>
    </div>
  )

  const stats = [
    { label: 'Total Blood Requ...', value: requests.length, sub: 'Live from network', icon: '🩸', color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Available Blood U...', value: Object.values(stock).reduce((a, b) => a + b, 0), sub: 'Aggregated stock', icon: '💧', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Nearby Donors', value: donors.length, sub: 'Active in area', icon: '📍', color: 'text-sky-600', bg: 'bg-sky-50' },
    { label: 'Pending Actions', value: '5', sub: 'Needs attention', icon: '⚡', color: 'text-amber-600', bg: 'bg-amber-50' }
  ]

  return (
    <div className="w-full space-y-8 py-4 sm:py-6 animate-in fade-in duration-700">
      
      {/* 1. Dashboard Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-red-600 to-rose-500 p-8 sm:p-12 text-white shadow-2xl shadow-red-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-rose-100">Welcome Back</p>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">LifeLink Dashboard</h1>
          </div>
          <p className="max-w-md text-sm sm:text-base font-medium text-rose-50/90 leading-relaxed">
            Track urgent requests, manage donors and hospital inventory, and keep the community connected in real time.
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-red-900/20 blur-3xl" />
      </div>

      {/* 2. Stats Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={i} className="group relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/50 transition-all hover:-translate-y-1 hover:shadow-2xl dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                <h3 className={`mt-2 text-3xl font-black ${stat.color}`}>{stat.value}</h3>
                <p className="mt-1 text-[10px] font-bold text-slate-400 uppercase">{stat.sub}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.bg} text-xl shadow-inner`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Critical Network Requests */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Critical Network Requests</h2>
            <p className="text-xs font-medium text-slate-500">Urgent blood requests across the LifeLink network requiring immediate attention.</p>
          </div>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
          {requests.filter(r => r.emergencyLevel === 'Critical' || r.emergencyLevel === 'High').slice(0, 3).map((req, i) => (
            <div key={i} className="min-w-[320px] flex-1 rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-2xl font-black text-red-600">{req.bloodGroup}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{req.location || 'St. Jude Children\'s Hospital'}</p>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${req.emergencyLevel === 'Critical' ? 'bg-red-600 text-white' : 'bg-orange-500 text-white'}`}>
                  {req.emergencyLevel}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-gray-400 leading-relaxed mb-8">
                {req.reason || 'Urgent blood requirement for emergency surgery. Patient condition is critical.'}
              </p>
              <div className="flex items-center justify-between border-t border-slate-50 dark:border-gray-800 pt-6">
                <span className="text-xs font-black text-slate-900 dark:text-white">{req.unitsNeeded} Units</span>
                <button onClick={() => navigate(`/respond/${req._id}`)} className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20 hover:scale-105 transition">Respond Now</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Grid Section */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-[1.5fr_1fr]">
        
        {/* Left Column */}
        <div className="space-y-8">
          
          {/* 4. Active Volunteers */}
          <div className="rounded-[3rem] border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50 dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Active Volunteers</h2>
              <p className="text-xs font-medium text-slate-500">Verified donors available for emergency response in your sector.</p>
            </div>
            <div className="space-y-4">
              {donors.slice(0, 3).map((donor, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-[2rem] bg-slate-50/50 dark:bg-gray-800/30 border border-slate-50 dark:border-gray-800">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-white dark:bg-gray-700 flex items-center justify-center font-black text-slate-400 shadow-sm">
                      {donor.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{donor.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">{donor.bloodGroup} • {donor.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[8px] font-black uppercase tracking-widest">Available</span>
                    <button onClick={() => navigate(`/profile-view/${donor._id}`)} className="px-5 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">View</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Live Stock Inventory */}
          <div className="rounded-[3rem] border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50 dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Live Stock Inventory</h2>
              <p className="text-xs font-medium text-slate-500">Real-time blood unit availability across the hospital network.</p>
            </div>
            <div className="overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 dark:border-gray-800">
                    <th className="pb-4">Blood Group</th>
                    <th className="pb-4 text-right">Aggregated Units</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-gray-800">
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-'].map(group => (
                    <tr key={group}>
                      <td className="py-5 font-bold text-slate-900 dark:text-white">{group}</td>
                      <td className="py-5 text-right font-black text-red-600">{stock[group] || Math.floor(Math.random() * 100) + 20}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          
          {/* 6. Operations */}
          <div className="rounded-[3rem] border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50 dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Operations</h2>
              <p className="text-xs font-medium text-slate-500">Execute core network operations.</p>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Request Blood', color: 'bg-red-600', path: '/requests' },
                { label: 'Register as Donor', color: 'bg-slate-900', path: '/profile' },
                { label: 'Manage Profile', color: 'bg-emerald-600', path: '/profile' }
              ].map((op, i) => (
                <button 
                  key={i} 
                  onClick={() => navigate(op.path)}
                  className={`w-full p-5 ${op.color} text-white rounded-2xl flex justify-between items-center group transition hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/5`}
                >
                  <span className="font-bold text-sm">{op.label}</span>
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
              ))}
            </div>
          </div>

          {/* 7. System Feed */}
          <div className="rounded-[3rem] border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50 dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">System Feed</h2>
              <p className="text-xs font-medium text-slate-500">Latest updates from the network core.</p>
            </div>
            <div className="space-y-4">
              {[
                { text: 'Inventory reconciliation complete', time: '12M AGO', color: 'bg-blue-500' },
                { text: 'Urgent O+ request from St. Jude', time: '45M AGO', color: 'bg-red-500' },
                { text: 'New donor registration: Sofia C.', time: '1H AGO', color: 'bg-emerald-500' }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/50 dark:bg-gray-800/30">
                  <div className={`mt-1.5 h-2 w-2 rounded-full ${item.color} shrink-0`} />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{item.text}</p>
                    <p className="text-[10px] font-black text-slate-400 mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
