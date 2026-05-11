import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from './Card.jsx'
import { fetchRequests } from '../api/requestsApi'
import { fetchStock } from '../api/hospitalsApi'
import { fetchDonors } from '../api/donorsApi'
import { CardSkeleton, TableSkeleton } from './ui/Skeleton.jsx'
import { useLoading } from '../context/LoadingContext.jsx'


const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

export default function Dashboard() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [stock, setStock] = useState({})
  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(true)
  const { showLoading, hideLoading } = useLoading()


  useEffect(() => {
    const loadDashboardData = async () => {
      showLoading('Fetching Dashboard Data...')
      try {
        const [reqs, stockData, donorData] = await Promise.all([
          fetchRequests(),
          fetchStock(),
          fetchDonors()
        ])
        setRequests(Array.isArray(reqs) ? reqs.slice(0, 3) : [])
        setStock(stockData || {})
        setDonors(Array.isArray(donorData) ? donorData.slice(0, 3) : [])
      } catch (error) {
        console.error("Dashboard data load failed:", error)
      } finally {
        setLoading(false)
        hideLoading()
      }
    }
    loadDashboardData()
  }, [showLoading, hideLoading])


  const totalRequests = requests.length
  const totalUnits = Object.values(stock).reduce((a, b) => a + (Number(b) || 0), 0)

  const summaryCards = [
    { title: 'Total Blood Requests', value: totalRequests, detail: 'Live from network', accent: 'bg-red-50 text-red-700', icon: 'M12 21v-2.25' },
    { title: 'Available Blood Units', value: totalUnits.toLocaleString(), detail: 'Aggregated stock', accent: 'bg-emerald-50 text-emerald-700', icon: 'M12 3v18' },
    { title: 'Nearby Donors', value: '76', detail: 'Active in area', accent: 'bg-sky-50 text-sky-700', icon: 'M3 7h18' },
    { title: 'Pending Actions', value: '5', detail: 'Needs attention', accent: 'bg-orange-50 text-orange-700', icon: 'M5 12h14' },
  ]
  const quickActions = [
    { label: 'Request Blood', color: 'bg-red-600', page: '/requests' },
    { label: 'Register as Donor', color: 'bg-slate-900', page: '/donors' },
    { label: 'Manage Profile', color: 'bg-emerald-600', page: '/profile' },
  ]

  const nearbyDonors = [
    { name: 'Nina Patel', group: 'O+', location: 'Downtown', status: 'Available' },
    { name: 'Jae Kim', group: 'A-', location: 'West End', status: 'Not Available' },
    { name: 'Amir Hassan', group: 'B+', location: 'Lakeside', status: 'Available' },
  ]

  if (loading) return (
    <div className="w-full space-y-8 py-6 animate-in fade-in duration-500">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
      </div>
      <div className="grid gap-8 grid-cols-1 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-8">
          <div className="rounded-[2rem] border border-slate-100 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
             <TableSkeleton rows={3} />
          </div>
          <div className="rounded-[2rem] border border-slate-100 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
             <TableSkeleton rows={4} />
          </div>
        </div>
        <div className="space-y-8">
           <CardSkeleton />
           <CardSkeleton />
        </div>
      </div>
    </div>
  )

  return (
    <div className="w-full space-y-4 py-4 sm:space-y-6 sm:py-6 animate-in fade-in duration-500">
      {/* Summary Cards */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {summaryCards.map((item) => (
          <Card key={item.title} className="overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-500 dark:text-gray-400 sm:text-sm truncate uppercase tracking-wider">{item.title}</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white sm:mt-3 sm:text-4xl">{item.value}</h2>
              </div>
              <div className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ${item.accent}`}>
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z" />
                  <path d="M12 11v6m-3-3h6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-gray-400 sm:mt-4 sm:text-sm font-medium">{item.detail}</p>
          </Card>
        ))}
      </div>

      {/* Emergency Requests */}
      <Card title="Critical Network Requests" subtitle="Urgent blood requests across the LifeLink network requiring immediate attention.">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {requests.length === 0 ? (
            <div className="col-span-full py-8 text-center text-slate-500 dark:text-gray-400 italic">No active urgent requests.</div>
          ) : (
            requests.map((request) => (
              <div key={request._id} className="rounded-3xl border border-red-100 bg-red-50/50 p-5 dark:border-red-900/30 dark:bg-red-900/10 hover:shadow-lg hover:shadow-red-500/5 transition-all duration-300">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">{request.bloodType}</p>
                    <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-tighter">{request.hospitalName || 'Blekinge Hospital'}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    request.priority === 'Urgent' || request.priority === 'High' ? 'bg-red-600 text-white' : 'bg-orange-500 text-white'
                  }`}>
                    {request.priority}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-slate-700 dark:text-gray-300 line-clamp-2 min-h-[40px]">{request.reason}</p>
                <div className="mt-5 flex items-center justify-between border-t border-red-100 dark:border-red-900/20 pt-4">
                  <span className="text-xs font-bold text-slate-500 dark:text-gray-400">{request.quantity} Units</span>
                  <button
                    onClick={() => navigate(`/respond/${request._id}`)}
                    className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-red-700 active:scale-95 shadow-md shadow-red-500/20"
                  >
                    Respond Now
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Main content grid */}
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          {/* Nearby Donors */}
          <Card title="Active Volunteers" subtitle="Verified donors available for emergency response in your sector.">
            <div className="space-y-3">
              {donors.length === 0 ? (
                <div className="py-4 text-center text-slate-500 italic">No active donors found.</div>
              ) : (
                donors.map((donor) => (
                  <div key={donor._id || donor.name} className="flex items-center justify-between rounded-3xl border border-slate-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900/50 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors duration-200">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-lg font-bold text-slate-900 dark:text-white">
                        {donor.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{donor.name}</p>
                        <p className="text-xs font-medium text-slate-500 dark:text-gray-400 mt-0.5">{donor.bloodGroup} • {donor.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`hidden sm:inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700`}>
                        Available
                      </span>
                      <button 
                        onClick={() => navigate('/donors')}
                        className="rounded-xl bg-slate-900 dark:bg-gray-700 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-black active:scale-95"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Hospital Inventory */}
          <Card title="Live Stock Inventory" subtitle="Real-time blood unit availability across the hospital network.">
            <div className="overflow-hidden rounded-3xl border border-slate-100 dark:border-gray-800">
              <table className="w-full text-left text-sm text-slate-700 dark:text-gray-300">
                <thead className="bg-slate-50 dark:bg-gray-800/50 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Blood Group</th>
                    <th className="px-6 py-4 text-right">Aggregated Units</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-800 bg-white dark:bg-gray-900/30">
                  {Object.entries(stock).length === 0 ? (
                    <tr><td colSpan="2" className="px-6 py-8 text-center text-slate-500 italic">No inventory data available.</td></tr>
                  ) : (
                    BLOOD_GROUPS.map((group) => {
                      const units = stock[group] || 0;
                      return (
                        <tr key={group} className="transition hover:bg-slate-50 dark:hover:bg-gray-800/50">
                          <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{group}</td>
                          <td className="px-6 py-4 text-right font-mono font-bold text-red-600 dark:text-red-400">{units}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Quick Actions */}
          <Card title="Operations" subtitle="Execute core network operations.">
            <div className="grid gap-3">
              {quickActions.map((action) => (
                <button 
                  key={action.label} 
                  onClick={() => navigate(action.page)}
                  className={`${action.color} rounded-2xl px-5 py-4 text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/5 flex items-center justify-between group`}
                >
                  {action.label}
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
              ))}
            </div>
          </Card>

          {/* Activity & Feed */}
          <Card title="System Feed" subtitle="Latest updates from the network core.">
            <div className="space-y-3">
              {[
                { label: 'Inventory reconciliation complete', time: '12m ago', type: 'system' },
                { label: 'Urgent O+ request from St. Jude', time: '45m ago', type: 'alert' },
                { label: 'New donor registration: Sofia C.', time: '1h ago', type: 'user' },
              ].map((activity, i) => (
                <div key={i} className="flex items-start gap-4 rounded-2xl bg-slate-50 dark:bg-gray-800/50 p-4">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${activity.type === 'alert' ? 'bg-red-500 animate-pulse' : activity.type === 'system' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{activity.label}</p>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tighter">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
