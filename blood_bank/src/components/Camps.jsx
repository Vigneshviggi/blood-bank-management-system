import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchCamps } from '../api/campsApi'
import Card from './Card.jsx'
import { CampSkeleton } from './ui/Skeleton.jsx'
import { useLoading } from '../context/LoadingContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { toast } from 'react-hot-toast'
import axios from 'axios'

export default function Camps() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [camps, setCamps] = useState([])
  const [loading, setLoading] = useState(true)
  const [userRegistrations, setUserRegistrations] = useState([])
  const [filters, setFilters] = useState({
    location: '',
    status: 'Upcoming'
  })
  const { showLoading, hideLoading } = useLoading()

  useEffect(() => {
    const loadCamps = async () => {
      showLoading('Locating Donation Camps...')
      try {
        const data = await fetchCamps()
        setCamps(data)

        if (user && user.role === 'donor') {
          // Fetch user registrations if needed or handle via a separate API
          // For now, we'll assume we check status individually or fetch all
        }
      } catch (error) {
        console.error("Failed to fetch camps:", error)
      } finally {
        setLoading(false)
        hideLoading()
      }
    }
    loadCamps()
  }, [showLoading, hideLoading, user])

  const handleRegister = async (campId) => {
    try {
      showLoading('Processing registration...')
      await axios.post(`${import.meta.env.VITE_API_URL}/api/camps/${campId}/register`, {
        userId: user._id,
        bloodGroup: user.bloodGroup,
        contactInfo: user.phone
      })
      toast.success('Registered successfully! ❤️')
      // Refresh camps
      const data = await fetchCamps()
      setCamps(data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      hideLoading()
    }
  }

  const filteredCamps = camps.filter(camp => {
    return (
      (!filters.location || camp.location.toLowerCase().includes(filters.location.toLowerCase())) &&
      (!filters.status || camp.status === filters.status)
    )
  })

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
              <h1 className="text-3xl font-black text-slate-900 dark:text-white sm:text-4xl">Donation Camps</h1>
              <p className="mt-1 text-slate-500 dark:text-gray-400 font-medium">Join a life-saving mission near you.</p>
            </div>
          </div>
          {(user?.role === 'hospital' || user?.role === 'admin') && (
            <Link
              to="/create-camp"
              className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-red-500/30 transition hover:bg-red-700 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              Host a New Camp
            </Link>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-10 flex gap-4">
          <input 
            type="text"
            placeholder="Search by location..."
            value={filters.location}
            onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
            className="flex-1 rounded-2xl border border-slate-100 bg-white px-6 py-4 text-sm font-bold text-slate-700 outline-none shadow-xl shadow-slate-200/50 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:shadow-none"
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="rounded-2xl border border-slate-100 bg-white px-6 py-4 text-sm font-bold text-slate-700 outline-none shadow-xl shadow-slate-200/50 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:shadow-none"
          >
            <option value="Upcoming">Upcoming</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Camps Grid */}
        {loading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map(i => <CampSkeleton key={i} />)}
          </div>
        ) : filteredCamps.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCamps.map(camp => (
              <div key={camp._id} className="group relative overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/50 transition-all duration-500 hover:shadow-2xl dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={camp.bannerImage || 'https://images.unsplash.com/photo-1615461066159-fea0960485d5?auto=format&fit=crop&q=80'}
                    alt={camp.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="rounded-full bg-red-600 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                      {camp.status}
                    </span>
                  </div>
                </div>

                <div className="p-8">
                  <div className="mb-6">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-red-600 transition">{camp.title}</h3>
                    <p className="mt-2 text-sm text-slate-500 line-clamp-2">{camp.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-gray-800 flex items-center justify-center text-red-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                      </div>
                      <span className="text-xs font-bold text-slate-600 dark:text-gray-400 truncate">{camp.location}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-gray-800 flex items-center justify-center text-blue-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                      <span className="text-xs font-bold text-slate-600 dark:text-gray-400">{new Date(camp.date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-gray-800">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registrations</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white">{camp.registeredCount} / {camp.capacity}</span>
                    </div>
                    
                    {user?.role === 'donor' ? (
                      <button 
                        onClick={() => handleRegister(camp._id)}
                        disabled={camp.registeredCount >= camp.capacity}
                        className="rounded-2xl bg-slate-900 dark:bg-red-600 px-6 py-3 text-xs font-black text-white transition hover:scale-105 active:scale-95 disabled:opacity-50"
                      >
                        Register Now
                      </button>
                    ) : (camp.organizerId === user?._id || user?.role === 'admin') ? (
                      <button 
                        onClick={() => navigate(`/camp/${camp._id}`)}
                        className="rounded-2xl bg-emerald-600 px-6 py-3 text-xs font-black text-white transition hover:scale-105 active:scale-95"
                      >
                        Manage
                      </button>
                    ) : (
                      <button 
                        onClick={() => navigate(`/camp/${camp._id}`)}
                        className="rounded-2xl bg-slate-100 dark:bg-gray-800 px-6 py-3 text-xs font-black text-slate-600 dark:text-gray-400 transition hover:bg-slate-200"
                      >
                        Details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">No camps found</h3>
            <p className="mt-2 text-slate-500 font-medium">Try adjusting your filters or check back later.</p>
          </div>
        )}
      </div>
    </div>
  )
}

