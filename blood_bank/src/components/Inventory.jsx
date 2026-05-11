import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchInventory } from '../api/inventoryApi'
import Card from './Card.jsx'
import { TableSkeleton } from './ui/Skeleton.jsx'
import LoadingButton from './ui/LoadingButton.jsx'
import { toast } from 'react-hot-toast'

const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

export default function Inventory() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [newStock, setNewStock] = useState({ blood: 'O+', units: 0 })
  const [inventory, setInventory] = useState({
    'O+': 0, 'O-': 0, 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadInventory = async () => {
      try {
        const data = await fetchInventory()
        setInventory(data)
      } catch (error) {
        console.error("Failed to fetch inventory:", error)
      } finally {
        setLoading(false)
      }
    }
    loadInventory()
  }, [])

  const bloodTypes = BLOOD_GROUPS;
  const totalUnits = Object.values(inventory).reduce((sum, units) => sum + units, 0)
  const criticalLevels = bloodTypes.filter((blood) => inventory[blood] < 200).length

  const handleAddStock = () => {
    if (newStock.units > 0) {
      toast.success(`Added ${newStock.units} units of ${newStock.blood} (Demo Mode)`)
      setNewStock({ blood: 'O+', units: 0 })
    }
  }

  const getStockStatus = (units) => {
    if (units < 200) return { status: 'critical', color: 'bg-red-100 text-red-700', label: 'Critical' }
    if (units < 400) return { status: 'low', color: 'bg-orange-100 text-orange-700', label: 'Low' }
    return { status: 'healthy', color: 'bg-emerald-100 text-emerald-700', label: 'Healthy' }
  }

  return (
    <div className="px-4 pb-12 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Blood Inventory</h1>
            <p className="mt-2 text-slate-600 dark:text-gray-400">Live network-wide blood stock monitoring</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-slate-100 bg-white text-slate-600 shadow-xl shadow-slate-200/50 transition-all hover:-translate-x-1 hover:bg-slate-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:shadow-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
              onClick={() => setActiveTab('add-stock')}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-black/20 transition hover:bg-black active:scale-95 dark:bg-red-600"
            >
              Update Stock
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Total Units', value: totalUnits.toLocaleString(), color: 'text-red-600', icon: '📦' },
            { label: 'Critical Stock', value: criticalLevels, color: 'text-orange-600', icon: '⚠️' },
            { label: 'Live Centers', value: '24', color: 'text-blue-600', icon: '🏥' },
          ].map((stat) => (
            <Card key={stat.label}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                  <h3 className={`mt-2 text-3xl font-bold ${stat.color}`}>{stat.value}</h3>
                </div>
                <span className="text-3xl">{stat.icon}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Card className="!p-0 overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50">
             <div className="flex gap-8">
               {['overview', 'add-stock', 'transactions'].map((tab) => (
                 <button
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`relative py-2 text-sm font-bold transition-colors ${
                     activeTab === tab ? 'text-red-600' : 'text-slate-500 hover:text-slate-900'
                   }`}
                 >
                   {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
                   {activeTab === tab && <div className="absolute -bottom-4 left-0 h-1 w-full rounded-full bg-red-600" />}
                 </button>
               ))}
             </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700 dark:text-gray-300">
                  <thead className="text-slate-500 uppercase text-[10px] font-bold tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Blood Group</th>
                      <th className="px-6 py-4">Stock Level</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Aggregated Units</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                    {loading ? (
                      <tr><td colSpan="4" className="px-6 py-4"><TableSkeleton rows={8} /></td></tr>
                    ) : (
                      bloodTypes.map((blood) => {
                        const units = inventory[blood]
                        const status = getStockStatus(units)
                        return (
                          <tr key={blood} className="group transition hover:bg-slate-50 dark:hover:bg-gray-800/50">
                            <td className="px-6 py-5 font-bold text-slate-900 dark:text-white">{blood}</td>
                            <td className="px-6 py-5">
                              <div className="flex w-32 items-center gap-2 sm:w-48">
                                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-gray-800">
                                  <div
                                    className={`h-full rounded-full transition-all duration-1000 ${
                                      status.status === 'critical' ? 'bg-red-600' : status.status === 'low' ? 'bg-orange-500' : 'bg-emerald-500'
                                    }`}
                                    style={{ width: `${Math.min(100, (units / 1000) * 100)}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${status.color}`}>
                                {status.label}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right font-mono font-bold text-slate-900 dark:text-white">
                              {units.toLocaleString()}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'add-stock' && (
              <div className="max-w-xl animate-in slide-in-from-bottom-4 duration-300">
                <div className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Blood Type</label>
                      <select
                        value={newStock.blood}
                        onChange={(e) => setNewStock({ ...newStock, blood: e.target.value })}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-red-500 dark:border-gray-800 dark:bg-gray-900"
                      >
                        {bloodTypes.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Units to Add</label>
                      <input
                        type="number"
                        value={newStock.units}
                        onChange={(e) => setNewStock({ ...newStock, units: parseInt(e.target.value) || 0 })}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-red-500 dark:border-gray-800 dark:bg-gray-900"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <LoadingButton
                    onClick={handleAddStock}
                    loading={false}
                    className="w-full"
                  >
                    Confirm Inventory Update
                  </LoadingButton>
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="py-12 text-center text-slate-500 italic">
                No recent inventory transactions recorded.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
