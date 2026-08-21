import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import toast from "react-hot-toast"

const API = import.meta.env.VITE_API_URL

const ICONS = {
  user:    "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  clock:   "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  heart:   "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  pin:     "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
  refresh: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  search:  "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  back:    "M15 19l-7-7 7-7",
  close:   "M6 18L18 6M6 6l12 12",
}

function Icon({ d, className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={d} />
    </svg>
  )
}

function StatusBadge({ label }) {
  const s = (label || "").toUpperCase()
  const map = {
    PENDING:   "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    ACCEPTED:  "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
    PROCESSING:"bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    DISPATCHED:"bg-blue-100 text-blue-700",
    COMPLETED: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    CANCELLED: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
    REJECTED:  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    UPCOMING:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    ONGOING:   "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    ACTIVE:    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    INACTIVE:  "bg-gray-100 text-gray-500",
    SUSPENDED: "bg-red-100 text-red-700",
    DONOR:     "bg-emerald-100 text-emerald-700",
    HOSPITAL:  "bg-blue-100 text-blue-700",
    ADMIN:     "bg-purple-100 text-purple-700",
  }
  const cls = map[s] || "bg-slate-100 text-slate-600"
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${cls}`}>
      {label || "Active"}
    </span>
  )
}

function Avatar({ text, colorClass }) {
  return (
    <div className={`h-11 w-11 shrink-0 rounded-2xl flex items-center justify-center font-black uppercase text-sm ${colorClass}`}>
      {(text || "?").charAt(0)}
    </div>
  )
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-red-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
    </div>
  )
}

export default function AdminPanel() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab]     = useState("users")
  const [search, setSearch]           = useState("")
  const [data, setData]               = useState({ users: [], requests: [], donors: [], camps: [] })
  const [loading, setLoading]         = useState(true)
  const [stats, setStats]             = useState({ totalUsers: 0, totalDonors: 0, activeRequests: 0, upcomingCamps: 0 })
  const [editingItem, setEditingItem] = useState(null)
  const [editFormData, setEditFormData] = useState({})

  useEffect(() => { fetchAllData() }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [u, r, d, c] = await Promise.all([
        axios.get(`${API}/api/users`),
        axios.get(`${API}/api/requests`),
        axios.get(`${API}/api/donors`),
        axios.get(`${API}/api/camps`),
      ])
      const users    = Array.isArray(u.data) ? u.data : []
      const requests = Array.isArray(r.data) ? r.data : []
      const donors   = Array.isArray(d.data) ? d.data : []
      const camps    = Array.isArray(c.data) ? c.data : []
      setData({ users, requests, donors, camps })
      setStats({
        totalUsers:     users.length,
        totalDonors:    donors.length,
        activeRequests: requests.filter(x => x.status !== "Completed" && x.status !== "Cancelled").length,
        upcomingCamps:  camps.filter(x => x.status === "Upcoming" || x.status === "Ongoing").length,
      })
    } catch (err) {
      toast.error("Failed to load admin data")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handlePromote = async (userId) => {
    if (!window.confirm("Promote this user to Admin?")) return
    const tid = toast.loading("Promoting...")
    try {
      await axios.put(`${API}/api/users/${userId}`, { role: "admin" })
      toast.success("Promoted to Admin", { id: tid }); fetchAllData()
    } catch { toast.error("Promotion failed", { id: tid }) }
  }

  const handleSuspend = async (userId, currentStatus) => {
    const nextStatus = currentStatus === "suspended" ? "active" : "suspended"
    const tid = toast.loading("Updating...")
    try {
      await axios.put(`${API}/api/users/${userId}`, { status: nextStatus })
      toast.success(`User ${nextStatus}`, { id: tid }); fetchAllData()
    } catch { toast.error("Update failed", { id: tid }) }
  }

  const handleDelete = async (type, id) => {
    if (!window.confirm("Permanently delete this record?")) return
    const tid = toast.loading("Deleting...")
    try {
      await axios.delete(`${API}/api/${type}/${id}`)
      toast.success("Deleted", { id: tid }); fetchAllData()
    } catch { toast.error("Delete failed", { id: tid }) }
  }

  const handleSaveEdit = async () => {
    const id  = editingItem._id
    const tid = toast.loading("Saving...")
    const ep  = activeTab === "donors" ? "users" : activeTab
    try {
      await axios.put(`${API}/api/${ep}/${id}`, editFormData)
      toast.success("Saved", { id: tid }); setEditingItem(null); fetchAllData()
    } catch { toast.error("Save failed", { id: tid }) }
  }

  const buildRow = (item) => {
    if (activeTab === "users" || activeTab === "donors") {
      return {
        avatar:    item.name || "U",
        avatarCls: "bg-slate-100 text-slate-500 dark:bg-gray-800 dark:text-gray-400",
        title:     item.name  || "Unnamed User",
        subtitle:  item.email || item.phone || "No contact info",
        meta1:     item.role  ? `Role: ${item.role.replace(/_/g, " ")}` : "Role: user",
        meta2:     item.bloodGroup ? `Blood: ${item.bloodGroup}` : (item.location || "No location"),
        status:    item.status || "active",
      }
    }
    if (activeTab === "requests") {
      return {
        avatar:    item.bloodGroup || "?",
        avatarCls: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
        title:     item.patientName ? item.patientName : `Blood Request (${item.bloodGroup || "?"})`,
        subtitle:  item.location || item.contactNumber || "No location",
        meta1:     `${item.unitsNeeded || 1} Units  |  ${item.bloodGroup || "?"}`,
        meta2:     `Priority: ${item.emergencyLevel || "Normal"}`,
        status:    item.status || "Pending",
      }
    }
    if (activeTab === "camps") {
      return {
        avatar:    item.title || "C",
        avatarCls: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
        title:     item.title    || "Unnamed Camp",
        subtitle:  item.location || item.venueName || "No location",
        meta1:     item.date ? new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "No date",
        meta2:     item.organizerName ? `Organizer: ${item.organizerName}` : `Capacity: ${item.capacity || "?"}`,
        status:    item.status || "Upcoming",
      }
    }
    return { avatar: "?", avatarCls: "bg-slate-100 text-slate-400", title: "Unknown", subtitle: "", meta1: "", meta2: "", status: "" }
  }

  const q    = search.toLowerCase()
  const rows = (data[activeTab] || []).filter(item => {
    const r = buildRow(item)
    return !q || r.title.toLowerCase().includes(q) || r.subtitle.toLowerCase().includes(q) || r.meta1.toLowerCase().includes(q)
  })

  const tabs = [
    { id: "users",    label: "Users",    count: data.users.length,    icon: ICONS.user,  color: "text-blue-600" },
    { id: "requests", label: "Requests", count: data.requests.length, icon: ICONS.clock, color: "text-red-600" },
    { id: "donors",   label: "Donors",   count: data.donors.length,   icon: ICONS.heart, color: "text-emerald-600" },
    { id: "camps",    label: "Camps",    count: data.camps.length,    icon: ICONS.pin,   color: "text-indigo-600" },
  ]

  const statCards = [
    { label: "Network Users",     value: stats.totalUsers,     color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-900/20",      iconCls: "text-blue-500",    icon: ICONS.user  },
    { label: "Active Requests",   value: stats.activeRequests, color: "text-red-600",     bg: "bg-red-50 dark:bg-red-900/20",        iconCls: "text-red-500",     icon: ICONS.clock },
    { label: "Registered Donors", value: stats.totalDonors,    color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20", iconCls: "text-emerald-500", icon: ICONS.heart },
    { label: "Upcoming Camps",    value: stats.upcomingCamps,  color: "text-indigo-600",  bg: "bg-indigo-50 dark:bg-indigo-900/20",  iconCls: "text-indigo-500",  icon: ICONS.pin   },
  ]

  return (
    <div className="px-4 pb-16 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)}
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-lg transition hover:-translate-x-1 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
              <Icon d={ICONS.back} className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white sm:text-4xl">Master Control Center</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">LifeLink network administration - live database view.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Icon d={ICONS.search} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input placeholder="Search records..." value={search} onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-sm font-medium outline-none focus:border-red-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
            </div>
            <button onClick={fetchAllData}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
              <Icon d={ICONS.refresh} className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map(s => (
            <div key={s.label} className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/40 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
                  <h2 className={`mt-2 text-4xl font-black ${s.color}`}>{s.value}</h2>
                </div>
                <div className={`h-12 w-12 rounded-2xl ${s.bg} flex items-center justify-center`}>
                  <Icon d={s.icon} className={`w-6 h-6 ${s.iconCls}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">

          {/* Sidebar */}
          <aside className="space-y-2">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSearch("") }}
                className={`flex w-full items-center justify-between gap-3 rounded-2xl px-5 py-4 text-sm font-bold transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-slate-900 text-white shadow-xl dark:bg-white dark:text-slate-900"
                    : "text-slate-500 hover:bg-white hover:shadow-md dark:text-gray-400 dark:hover:bg-gray-800"
                }`}>
                <span className="flex items-center gap-3">
                  <Icon d={tab.icon} className="w-4 h-4" />
                  {tab.label}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                  activeTab === tab.id ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900" : "bg-slate-100 text-slate-500 dark:bg-gray-800"
                }`}>{tab.count}</span>
              </button>
            ))}

            <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Quick Stats</p>
              <div className="space-y-2 text-xs text-slate-600 dark:text-gray-400">
                <div className="flex justify-between"><span>Total Records</span><span className="font-bold text-slate-900 dark:text-white">{data.users.length + data.requests.length + data.donors.length + data.camps.length}</span></div>
                <div className="flex justify-between"><span>Pending Requests</span><span className="font-bold text-amber-600">{data.requests.filter(r => r.status === "Pending").length}</span></div>
                <div className="flex justify-between"><span>Completed</span><span className="font-bold text-slate-600">{data.requests.filter(r => r.status === "Completed").length}</span></div>
                <div className="flex justify-between"><span>Ongoing Camps</span><span className="font-bold text-indigo-600">{data.camps.filter(c => c.status === "Ongoing").length}</span></div>
              </div>
            </div>
          </aside>

          {/* Table */}
          <div className="rounded-[2.5rem] border border-slate-100 bg-white shadow-2xl shadow-slate-200/40 dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-50 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/30 px-8 py-4">
              <div>
                <p className="font-black text-slate-900 dark:text-white capitalize">{activeTab}</p>
                <p className="text-xs text-slate-400">{rows.length} record{rows.length !== 1 ? "s" : ""} found</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50 dark:border-gray-800">
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Identity / Info</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Details</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                    <th className="px-8 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-gray-800">
                  {loading ? (
                    <tr><td colSpan={4} className="px-8 py-24 text-center text-slate-400 italic">Loading data...</td></tr>
                  ) : rows.length === 0 ? (
                    <tr><td colSpan={4} className="px-8 py-24 text-center text-slate-400 italic">No records found.</td></tr>
                  ) : rows.map(item => {
                    const r = buildRow(item)
                    return (
                      <tr key={item._id} className="group hover:bg-slate-50/60 dark:hover:bg-gray-800/20 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <Avatar text={r.avatar} colorClass={r.avatarCls} />
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white leading-tight">{r.title}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{r.subtitle}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-xs font-bold text-slate-700 dark:text-gray-300">{r.meta1}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{r.meta2}</p>
                        </td>
                        <td className="px-8 py-5">
                          <StatusBadge label={r.status} />
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {activeTab === "users" && item.role !== "admin" && item.role !== "super_admin" && (
                              <button onClick={() => handlePromote(item._id)}
                                className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase text-emerald-700 hover:bg-emerald-100">
                                Promote
                              </button>
                            )}
                            {activeTab === "users" && (
                              <button onClick={() => handleSuspend(item._id, item.status)}
                                className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] font-black uppercase text-amber-700 hover:bg-amber-100">
                                {item.status === "suspended" ? "Unsuspend" : "Suspend"}
                              </button>
                            )}
                            <button onClick={() => { setEditingItem(item); setEditFormData({ ...item }) }}
                              className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase text-blue-700 hover:bg-blue-100">
                              Edit
                            </button>
                            <button onClick={() => {
                              if (activeTab === "users" || activeTab === "donors") navigate(`/profile-view/${item._id}`)
                              else if (activeTab === "camps") navigate(`/camp/${item._id}`)
                              else if (activeTab === "requests") navigate(`/respond/${item._id}`)
                            }}
                              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                              View
                            </button>
                            <button onClick={() => handleDelete(activeTab, item._id)}
                              className="rounded-xl bg-red-600 px-3 py-1.5 text-[10px] font-black uppercase text-white hover:bg-red-700 shadow-lg shadow-red-500/20">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[2rem] bg-white p-8 shadow-2xl dark:bg-gray-900">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Edit Record</h2>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-600">
                <Icon d={ICONS.close} className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 mb-6">
              {(activeTab === "users" || activeTab === "donors") && (<>
                <Field label="Name"        value={editFormData.name || ""}       onChange={v => setEditFormData({...editFormData, name: v})} />
                <Field label="Location"    value={editFormData.location || ""}   onChange={v => setEditFormData({...editFormData, location: v})} />
                <Field label="Blood Group" value={editFormData.bloodGroup || ""} onChange={v => setEditFormData({...editFormData, bloodGroup: v})} />
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Role</label>
                  <select value={editFormData.role || "donor"} onChange={e => setEditFormData({...editFormData, role: e.target.value})}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-red-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                    {["donor", "hospital", "admin", "super_admin"].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </>)}
              {activeTab === "requests" && (<>
                <Field label="Patient Name"  value={editFormData.patientName || ""} onChange={v => setEditFormData({...editFormData, patientName: v})} />
                <Field label="Location"      value={editFormData.location || ""}    onChange={v => setEditFormData({...editFormData, location: v})} />
                <Field label="Units Needed"  value={editFormData.unitsNeeded || ""} onChange={v => setEditFormData({...editFormData, unitsNeeded: v})} type="number" />
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</label>
                  <select value={editFormData.status || "Pending"} onChange={e => setEditFormData({...editFormData, status: e.target.value})}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-red-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                    {["Pending","Accepted","Processing","Dispatched","Completed","Rejected","Cancelled"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </>)}
              {activeTab === "camps" && (<>
                <Field label="Camp Title" value={editFormData.title || ""}    onChange={v => setEditFormData({...editFormData, title: v})} />
                <Field label="Location"  value={editFormData.location || ""} onChange={v => setEditFormData({...editFormData, location: v})} />
                <Field label="Capacity"  value={editFormData.capacity || ""} onChange={v => setEditFormData({...editFormData, capacity: v})} type="number" />
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</label>
                  <select value={editFormData.status || "Upcoming"} onChange={e => setEditFormData({...editFormData, status: e.target.value})}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-red-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                    {["Upcoming","Ongoing","Completed","Cancelled"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </>)}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditingItem(null)}
                className="flex-1 rounded-2xl border border-slate-200 py-3 font-bold text-slate-600 hover:bg-slate-50 dark:border-gray-700 dark:text-gray-300">
                Cancel
              </button>
              <button onClick={handleSaveEdit}
                className="flex-1 rounded-2xl bg-slate-900 py-3 font-bold text-white hover:bg-black dark:bg-white dark:text-slate-900">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}