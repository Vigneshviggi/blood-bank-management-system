import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function ProfileView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${id}`)
        if (!response.ok) throw new Error('Profile not found')
        const data = await response.json()
        setProfile(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [id])

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
    </div>
  )

  if (error) return (
    <div className="flex h-96 flex-col items-center justify-center gap-4">
      <p className="text-xl font-bold text-slate-900">{error}</p>
      <button 
        onClick={() => navigate(-1)}
        className="rounded-xl bg-red-600 px-6 py-2 text-white font-semibold"
      >
        Go Back
      </button>
    </div>
  )

  if (!profile) return null;

  return (
    <div className="px-3 pb-8 sm:px-4 md:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        {/* Header with Back Button */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-100 transition shadow-sm"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Profile Details</h1>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
          {/* Cover/Header */}
          <div className="h-32 bg-gradient-to-r from-red-600 to-rose-500 sm:h-48"></div>
          
          <div className="px-6 pb-10 sm:px-10">
            {/* Profile Info */}
            <div className="relative -mt-16 flex flex-col items-center sm:-mt-24 sm:flex-row sm:items-end sm:gap-6">
              <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-blue-400 to-blue-600 text-4xl font-bold text-white shadow-lg sm:h-48 sm:w-48">
                {profile.name.charAt(0)}
              </div>
              <div className="mt-4 flex-1 text-center sm:mb-4 sm:text-left">
                <h2 className="text-3xl font-bold text-slate-900">{profile.name}</h2>
                <p className="text-slate-600 font-medium uppercase tracking-widest">{profile.role}</p>
              </div>
              <div className="mt-6 flex gap-3 sm:mb-4">
                <button 
                   onClick={() => navigate('/contact')}
                   className="rounded-xl bg-red-600 px-8 py-3 font-semibold text-white shadow-lg shadow-red-500/30 transition hover:bg-red-700 active:scale-95"
                >
                  Contact
                </button>
              </div>
            </div>

            <hr className="my-10 border-slate-100" />

            {/* Grid Stats */}
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="rounded-3xl bg-slate-50 p-6 text-center">
                <p className="text-sm font-semibold text-slate-500 uppercase">Blood Group</p>
                <p className="mt-2 text-3xl font-bold text-red-600">{profile.bloodGroup}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-6 text-center">
                <p className="text-sm font-semibold text-slate-500 uppercase">Location</p>
                <p className="mt-2 text-xl font-bold text-slate-900">{profile.location}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-6 text-center">
                <p className="text-sm font-semibold text-slate-500 uppercase">Email</p>
                <p className="mt-2 text-lg font-bold text-slate-900 truncate">{profile.email}</p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-10 space-y-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900">About</h3>
                <p className="mt-3 text-slate-600 leading-relaxed">
                  Dedicated {profile.role} committed to the LifeLink mission. Available for blood donations and emergency support in the {profile.location} area.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
