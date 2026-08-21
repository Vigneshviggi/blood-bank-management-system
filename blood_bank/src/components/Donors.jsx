import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchNearbyDonors, contactDonor } from '../api/donorsApi'
import { getCurrentCoordinates, LOCATION_ERRORS } from '../services/locationService'
import { TableSkeleton } from './ui/Skeleton.jsx'
import { toast } from 'react-hot-toast'

const BLOOD_TYPES = ['All', 'O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
const RADIUS_OPTIONS = [5, 10, 25, 50]

export default function Donors() {
  const navigate = useNavigate()
  const [donorsData, setDonorsData] = useState([])
  const [filterBlood, setFilterBlood] = useState('All')
  const [filterAvailability, setFilterAvailability] = useState('Available')
  const [radiusKm, setRadiusKm] = useState(10)
  const [sortBy, setSortBy] = useState('distance')
  const [loading, setLoading] = useState(true)
  const [locationStatus, setLocationStatus] = useState('idle') // 'idle' | 'loading' | 'success' | 'permission_denied' | 'unavailable' | 'network_error'
  const [userCoords, setUserCoords] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [contactingId, setContactingId] = useState(null)
  const [contactModalDonor, setContactModalDonor] = useState(null)

  const loadDonors = useCallback(async (forcedCoords = null, forcedRadius = null, forcedBlood = null, forcedAvail = null) => {
    setLoading(true)
    const targetRadius = forcedRadius ?? radiusKm
    const targetBlood = forcedBlood ?? filterBlood
    const targetAvail = forcedAvail ?? filterAvailability
    let coords = forcedCoords ?? userCoords

    try {
      if (!coords) {
        setLocationStatus('loading')
        coords = await getCurrentCoordinates()
        setUserCoords(coords)
        setLocationStatus('success')
      }

      const res = await fetchNearbyDonors(
        coords.latitude,
        coords.longitude,
        targetRadius,
        targetBlood,
        targetAvail
      )
      const list = Array.isArray(res?.donors) ? res.donors : (Array.isArray(res) ? res : [])
      setDonorsData(list)
      setLocationStatus('success')
    } catch (err) {
      if (err.code === LOCATION_ERRORS.PERMISSION_DENIED) {
        setLocationStatus('permission_denied')
        setErrorMessage('Location permission is required to find nearby donors.')
      } else if (
        err.code === LOCATION_ERRORS.POSITION_UNAVAILABLE ||
        err.code === LOCATION_ERRORS.TIMEOUT ||
        err.code === LOCATION_ERRORS.NOT_SUPPORTED
      ) {
        setLocationStatus('unavailable')
        setErrorMessage('Unable to determine your current location.')
      } else {
        setLocationStatus('network_error')
        setErrorMessage('Unable to load nearby donors.')
      }
      setDonorsData([])
    } finally {
      setLoading(false)
    }
  }, [radiusKm, filterBlood, filterAvailability, userCoords])

  useEffect(() => {
    loadDonors()
  }, [loadDonors])

  const handleRadiusChange = (newRadius) => {
    setRadiusKm(newRadius)
    loadDonors(userCoords, newRadius, filterBlood, filterAvailability)
  }

  const handleBloodChange = (newBlood) => {
    setFilterBlood(newBlood)
    loadDonors(userCoords, radiusKm, newBlood, filterAvailability)
  }

  const handleAvailabilityChange = (newAvail) => {
    setFilterAvailability(newAvail)
    loadDonors(userCoords, radiusKm, filterBlood, newAvail)
  }

  const handleContactDonor = async (donor) => {
    try {
      setContactingId(donor._id || donor.id)
      let phoneNumber = donor.phone
      let emailAddress = donor.email

      if (!phoneNumber || !emailAddress) {
        const contactData = await contactDonor(donor._id || donor.id)
        phoneNumber = contactData.phone || phoneNumber
        emailAddress = contactData.email || emailAddress
      }

      setContactModalDonor({
        ...donor,
        phone: phoneNumber,
        email: emailAddress || `${donor.name?.toLowerCase().replace(/\s+/g, '')}@gmail.com`
      })
    } catch (err) {
      setContactModalDonor({
        ...donor,
        phone: donor.phone,
        email: donor.email || `${donor.name?.toLowerCase().replace(/\s+/g, '')}@gmail.com`
      })
    } finally {
      setContactingId(null)
    }
  }

  const sortedDonors = [...donorsData].sort((a, b) => {
    if (sortBy === 'distance') return (Number(a.distanceKm) || 0) - (Number(b.distanceKm) || 0)
    if (sortBy === 'rating') return (Number(b.rating) || 0) - (Number(a.rating) || 0)
    if (sortBy === 'donations') return (Number(b.donationsCount) || 0) - (Number(a.donationsCount) || 0)
    return 0
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-100 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Available Donors</h1>
              <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">Real-time GPS discovery of verified donors near your location.</p>
            </div>
          </div>

          {/* Radius Selector Pills */}
          <div className="flex items-center gap-2 self-start md:self-auto bg-slate-100 dark:bg-gray-900 p-1.5 rounded-2xl">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-2">Radius:</span>
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r}
                onClick={() => handleRadiusChange(r)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                  radiusKm === r
                    ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                    : 'text-slate-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
                }`}
              >
                {r} km
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Blood Type Filter */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">Blood Group</label>
              <select
                value={filterBlood}
                onChange={(e) => handleBloodChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {BLOOD_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">Availability</label>
              <select
                value={filterAvailability}
                onChange={(e) => handleAvailabilityChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="Available">Available</option>
                <option value="All">All</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="distance">Distance (Nearest First)</option>
                <option value="donations">Total Donations</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Donors List Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-200 dark:border-gray-700 p-8 space-y-4">
            <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
              <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              <span>Finding available donors near you...</span>
            </div>
            <TableSkeleton rows={4} />
          </div>
        ) : locationStatus === 'permission_denied' ? (
          <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-200 dark:border-gray-700 p-12 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl">
              📍
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Location Permission Required</h3>
            <p className="text-sm text-slate-500 dark:text-gray-400 max-w-md mx-auto">{errorMessage}</p>
            <button
              onClick={() => loadDonors()}
              className="px-8 py-3 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-500/20 hover:scale-105 transition"
            >
              Try Again
            </button>
          </div>
        ) : locationStatus === 'unavailable' || locationStatus === 'network_error' ? (
          <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-200 dark:border-gray-700 p-12 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-full flex items-center justify-center mx-auto text-2xl">
              ⚠️
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Location Unavailable</h3>
            <p className="text-sm text-slate-500 dark:text-gray-400 max-w-md mx-auto">{errorMessage}</p>
            <button
              onClick={() => loadDonors()}
              className="px-8 py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-2xl font-bold hover:scale-105 transition"
            >
              Try Again
            </button>
          </div>
        ) : sortedDonors.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-200 dark:border-gray-700 p-12 text-center space-y-3">
            <span className="text-4xl">🔍</span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">No Donors Nearby</h3>
            <p className="text-sm text-slate-500 dark:text-gray-400">
              No available donors found within {radiusKm} km matching your filters.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => handleRadiusChange(Math.min(50, radiusKm + 15))}
                className="px-6 py-2.5 bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-white rounded-xl text-xs font-bold hover:bg-slate-200 transition"
              >
                Expand Radius
              </button>
              <button
                onClick={() => loadDonors()}
                className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedDonors.map((donor) => (
              <div
                key={donor._id || donor.id}
                className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 sm:p-7 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col sm:flex-row gap-6 sm:items-center sm:justify-between">
                  {/* Left: Avatar & Info */}
                  <div className="flex items-center gap-5">
                    {donor.imageUrl ? (
                      <img
                        src={donor.imageUrl}
                        alt={donor.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-100 dark:border-gray-700"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md shadow-red-500/20">
                        {donor.name?.charAt(0) || 'D'}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-black text-gray-900 dark:text-white">{donor.name}</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {donor.location || 'Local Area'} •{' '}
                        <span className="font-bold text-red-600 dark:text-red-400">
                          {typeof donor.distanceKm === 'number' ? `📍 ${donor.distanceKm} km away` : '📍 Nearby'}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Middle: Stats */}
                  <div className="grid grid-cols-2 sm:flex gap-4 sm:gap-6 items-center">
                    <div className="text-left sm:text-right">
                      <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">Blood Group</p>
                      <p className="text-lg font-black text-red-600 dark:text-red-400">{donor.bloodGroup}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">Donations</p>
                      <p className="text-lg font-black text-gray-900 dark:text-white">{donor.donationsCount ?? donor.donations ?? 0}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">Rating</p>
                      <p className="text-lg font-black text-amber-500">★ {donor.rating ?? 4.8}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          donor.availability
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${donor.availability ? 'bg-emerald-600' : 'bg-gray-400'}`}></span>
                        {donor.availability ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-3 sm:justify-end">
                  <button
                    onClick={() => navigate(`/profile-view/${donor._id || donor.id}`, { state: { donor } })}
                    className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => handleContactDonor(donor)}
                    disabled={contactingId === (donor._id || donor.id)}
                    className="px-6 py-2.5 bg-red-600 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-red-500/20 hover:scale-105 active:scale-95 transition disabled:opacity-50"
                  >
                    {contactingId === (donor._id || donor.id) ? 'Connecting...' : 'Contact Donor'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Contact Donor Modal ── */}
      {contactModalDonor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-5 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center text-lg font-black shadow-lg shadow-red-500/20">
                  {contactModalDonor.name?.charAt(0)?.toUpperCase() || 'D'}
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">{contactModalDonor.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Blood Group: <span className="text-red-600 font-bold">{contactModalDonor.bloodGroup || 'O+'}</span> • {contactModalDonor.distanceKm} km away
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setContactModalDonor(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contact Items */}
            <div className="py-6 space-y-4">
              {/* Phone Number */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Mobile Number</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {contactModalDonor.phone || 'Not available'}
                    </p>
                  </div>
                </div>
                {contactModalDonor.phone && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(contactModalDonor.phone)
                        toast.success('Phone number copied to clipboard!')
                      }}
                      className="px-3 py-1.5 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </button>
                    <a
                      href={`tel:${contactModalDonor.phone}`}
                      className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-md shadow-red-500/20 transition flex items-center gap-1"
                    >
                      Call
                    </a>
                  </div>
                )}
              </div>

              {/* Email Address */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Email Address</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {contactModalDonor.email || 'Not available'}
                    </p>
                  </div>
                </div>
                {contactModalDonor.email && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(contactModalDonor.email)
                        toast.success('Email copied to clipboard!')
                      }}
                      className="px-3 py-1.5 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </button>
                    <a
                      href={`mailto:${contactModalDonor.email}`}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20 transition flex items-center gap-1"
                    >
                      Email
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* View Full Profile button */}
            <button
              onClick={() => {
                const id = contactModalDonor._id || contactModalDonor.id;
                setContactModalDonor(null);
                navigate(`/profile-view/${id}`, { state: { donor: contactModalDonor } });
              }}
              className="w-full py-3 rounded-2xl border-2 border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-black uppercase tracking-wider transition text-center"
            >
              View Full Profile Details
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
