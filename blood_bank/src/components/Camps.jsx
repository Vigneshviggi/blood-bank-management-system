import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchCamps } from '../api/campsApi'
import Card from './Card.jsx'
import { CampSkeleton } from './ui/Skeleton.jsx'
import { useLoading } from '../context/LoadingContext.jsx'


export default function Camps() {
  const navigate = useNavigate()
  const [camps, setCamps] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    location: '',
    type: '',
    date: ''
  })
  const { showLoading, hideLoading } = useLoading()


  useEffect(() => {
    const loadCamps = async () => {
      showLoading('Locating Donation Camps...')
      try {
        const data = await fetchCamps()
        setCamps(data)
      } catch (error) {
        console.error("Failed to fetch camps:", error)
      } finally {
        setLoading(false)
        hideLoading()
      }
    }
    loadCamps()
  }, [showLoading, hideLoading])


  const uniqueLocations = [...new Set(camps.map(camp => camp.location))]
  const uniqueTypes = [...new Set(camps.map(camp => camp.type))]

  const filteredCamps = camps.filter(camp => {
    return (
      (!filters.location || camp.location === filters.location) &&
      (!filters.type || camp.type === filters.type) &&
      (!filters.date || camp.date === filters.date)
    )
  })

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="px-4 pb-12 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate(-1)}
              className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-slate-100 bg-white text-slate-600 shadow-xl shadow-slate-200/50 transition-all hover:-translate-x-1 hover:bg-slate-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:shadow-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white sm:text-4xl">Blood Donation Camps</h1>
              <p className="mt-1 text-slate-500 dark:text-gray-400 font-medium">Join a life-saving mission near you.</p>
            </div>
          </div>
          <Link
            to="/create-camp"
            className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-red-500/30 transition hover:bg-red-700 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Host a New Camp
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-10 grid gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none sm:grid-cols-3 sm:p-8">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</label>
            <select
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-red-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-300"
            >
              <option value="">All Locations</option>
              {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Camp Type</label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-red-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-300"
            >
              <option value="">All Types</option>
              {uniqueTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ location: '', type: '', date: '' })}
              className="w-full rounded-2xl border border-slate-100 bg-slate-100 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest transition hover:bg-slate-200 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Camps Grid */}
        {loading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <CampSkeleton key={i} />)}
          </div>
        ) : filteredCamps.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCamps.map(camp => (
              <div
                key={camp._id}
                onClick={() => navigate(`/camp/${camp._id}`)}
                className="group relative cursor-pointer overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:border-gray-800 dark:bg-gray-900 dark:shadow-none"
              >
                {/* Image & Status Tag */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={camp.imageUrl || 'https://images.unsplash.com/photo-1615461066159-fea0960485d5?auto=format&fit=crop&q=80'}
                    alt={camp.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => e.target.src = 'https://via.placeholder.com/500x300?text=LifeLink+Camp'}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-4 right-4">
                    <span className={`rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md ${
                      camp.status === 'Ongoing' ? 'bg-emerald-500/80' : 'bg-blue-500/80'
                    }`}>
                      {camp.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="mb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 dark:text-red-400">
                      {camp.type}
                    </span>
                    <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-red-600 transition">
                      {camp.name}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm font-medium text-slate-500 dark:text-gray-400">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 dark:bg-gray-800">
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </div>
                      <span className="truncate">{camp.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-medium text-slate-500 dark:text-gray-400">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 dark:bg-gray-800">
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                      <span>{new Date(camp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="mt-6 border-t border-slate-50 pt-6 dark:border-gray-800">
                    <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      <span>Participants</span>
                      <span className="text-slate-900 dark:text-white">{camp.participants} / {camp.maxParticipants}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-gray-800">
                      <div 
                        className="h-full bg-red-600 transition-all duration-1000 group-hover:bg-red-500" 
                        style={{ width: `${(camp.participants / camp.maxParticipants) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-20 w-20 rounded-full bg-slate-100 p-5 dark:bg-gray-800">
                <svg className="h-full w-full text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">No live camps found</h3>
              <p className="mt-2 text-slate-500 dark:text-gray-400">We're curating new life-saving missions. Check out our featured past successes or host your own!</p>
            </div>

            {/* Featured Fallback Section */}
            <div className="mt-12">
              <div className="mb-8 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-gray-800">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Featured Community Missions</h2>
                <span className="rounded-full bg-red-50 px-4 py-1 text-xs font-bold text-red-600 dark:bg-red-900/20 dark:text-red-400">Community Choice</span>
              </div>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { name: "City Center Mega Drive", location: "Central Plaza", type: "Community", participants: 120, maxParticipants: 150, imageUrl: "https://images.unsplash.com/photo-1536856789559-1cb63a99c88e?auto=format&fit=crop&q=80" },
                  { name: "Tech Park Health Week", location: "Innovation Hub", type: "Corporate", participants: 45, maxParticipants: 100, imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80" },
                  { name: "University Youth Camp", location: "South Campus", type: "Educational", participants: 89, maxParticipants: 200, imageUrl: "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&q=80" }
                ].map((mock, i) => (
                  <div key={i} className="group overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/40 transition hover:-translate-y-1 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
                    <div className="relative h-40 overflow-hidden">
                      <img src={mock.imageUrl} className="h-full w-full object-cover grayscale opacity-60" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                      <div className="absolute bottom-4 left-6">
                         <span className="text-white text-sm font-bold">{mock.name}</span>
                      </div>
                    </div>
                    <div className="p-6">
                       <p className="text-xs text-slate-500 mb-4">A standard mission hosted by LifeLink partners to maintain regional blood reserves.</p>
                       <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
                         <span>{mock.location}</span>
                         <span className="text-red-600">{mock.type}</span>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
