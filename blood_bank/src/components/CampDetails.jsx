import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { registerForCamp, fetchRegistrationStatus } from '../api/campsApi'
import { useAuth } from '../context/AuthContext'
import { useLoading } from '../context/LoadingContext'
import { toast } from 'react-hot-toast'
import axios from 'axios'

export default function CampDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showLoading, hideLoading } = useLoading()
  
  const [camp, setCamp] = useState(null)
  const [registration, setRegistration] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [campData, regData] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/camps/${id}`).then(res => res.data),
          user?.role === 'donor' ? fetchRegistrationStatus(id, user._id) : Promise.resolve(null)
        ])
        setCamp(campData)
        setRegistration(regData)
      } catch (e) {
        console.error("Failed to load camp details", e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id, user])

  const handleRegister = async () => {
    showLoading('Securing your spot...')
    try {
      await registerForCamp(id, {
        userId: user._id,
        bloodGroup: user.bloodGroup,
        contactInfo: user.phone
      })
      toast.success('Registration Confirmed! See you there ❤️')
      // Refresh status
      const [regData, campData] = await Promise.all([
        fetchRegistrationStatus(id, user._id),
        axios.get(`${import.meta.env.VITE_API_URL}/api/camps/${id}`).then(res => res.data)
      ])
      setRegistration(regData)
      setCamp(campData)
    } catch (error) {
      toast.error(error.message || 'Registration failed')
    } finally {
      hideLoading()
    }
  }

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your registration?')) return
    
    showLoading('Cancelling registration...')
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/camps/${id}/register/${user._id}`)
      toast.success('Registration cancelled')
      setRegistration(null)
      const campData = await axios.get(`${import.meta.env.VITE_API_URL}/api/camps/${id}`).then(res => res.data)
      setCamp(campData)
    } catch (error) {
      toast.error('Failed to cancel')
    } finally {
      hideLoading()
    }
  }

  if (loading) return null
  
  if (!camp) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mx-auto text-red-600">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Camp Not Found</h2>
        <p className="text-slate-500 font-medium max-w-xs mx-auto">This camp may have been archived or the ID is incorrect.</p>
        <button onClick={() => navigate('/camps')} className="px-8 py-3 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-500/20 hover:scale-105 transition">Discover Camps</button>
      </div>
    </div>
  )

  const isOrganizer = user?.role === 'admin' || camp.organizerId === user?._id || (user?.role === 'hospital' && camp.organizerId === user?._id)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-10">
          <button 
            onClick={() => navigate(-1)}
            className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-slate-100 bg-white text-slate-600 shadow-xl shadow-slate-200/50 transition-all hover:-translate-x-1 hover:bg-slate-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:shadow-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          
          {isOrganizer && (
            <button 
              onClick={() => navigate(`/camp-management/${id}`)}
              className="px-8 py-4 rounded-2xl bg-emerald-600 text-white text-sm font-black shadow-lg shadow-emerald-500/20 hover:scale-105 transition"
            >
              Management Console
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-10">
            <div className="relative h-[25rem] rounded-[3rem] overflow-hidden shadow-2xl">
              <img src={camp.bannerImage || 'https://images.unsplash.com/photo-1615461066159-fea0960485d5'} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-10 left-10 right-10">
                <span className="px-4 py-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-4 inline-block">
                  {camp.status}
                </span>
                <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">{camp.title}</h1>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-10 border border-slate-100 dark:border-gray-700 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">About the Campaign</h2>
              <p className="text-slate-600 dark:text-gray-400 font-medium leading-relaxed text-lg">
                {camp.description}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-10">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/10 flex items-center justify-center text-red-600 shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21z" fill="currentColor"/></svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Organizer</p>
                    <p className="font-black text-slate-900 dark:text-white">Medical Network Authorized</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 flex items-center justify-center text-emerald-600 shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timing</p>
                    <p className="font-black text-slate-900 dark:text-white">{camp.startTime} - {camp.endTime}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-10 border border-slate-100 dark:border-gray-700 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-red-50 dark:bg-red-900/10 mb-6">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">{camp.location}</h3>
                <p className="mt-2 text-slate-500 font-bold uppercase tracking-tighter">{new Date(camp.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>

              <div className="space-y-6 pt-8 border-t border-slate-50 dark:border-gray-700">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Spots</span>
                  <span className="text-2xl font-black text-red-600">{camp.capacity - camp.registeredCount}</span>
                </div>
                <div className="h-3 bg-slate-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-red-600" style={{ width: `${(camp.registeredCount / camp.capacity) * 100}%` }} />
                </div>
              </div>

              <div className="mt-10">
                {user?.role === 'donor' ? (
                  registration ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-2xl text-center">
                        <p className="text-sm font-black text-emerald-600">You're Registered!</p>
                      </div>
                      <button 
                        onClick={handleCancel}
                        className="w-full py-4 rounded-2xl bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition"
                      >
                        Cancel Registration
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={handleRegister}
                      disabled={camp.registeredCount >= camp.capacity}
                      className="w-full py-5 rounded-[2rem] bg-red-600 text-white text-lg font-black shadow-xl shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50"
                    >
                      {camp.registeredCount >= camp.capacity ? 'Camp Full' : 'Register Now'}
                    </button>
                  )
                ) : (
                  <p className="text-center text-slate-400 text-xs font-bold uppercase">Sign in as donor to register</p>
                )}
              </div>
            </div>

            {camp.healthCheckup && (
              <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-emerald-500/20">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h4 className="font-black uppercase tracking-tight">Free Health Checkup</h4>
                </div>
                <p className="text-sm font-medium opacity-80 leading-relaxed">
                  Every donor receives a complimentary vitals checkup and health report.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
