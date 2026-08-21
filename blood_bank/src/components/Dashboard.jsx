import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchNearbyRequests, fetchRequests } from '../api/requestsApi'
import { fetchNearbyDonors, contactDonor } from '../api/donorsApi'
import { getCurrentCoordinates, reverseGeocode, LOCATION_ERRORS } from '../services/locationService'
import { CardSkeleton } from './ui/Skeleton.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { toast } from 'react-hot-toast'
import { io } from 'socket.io-client'
import ResponseModal from './ResponseModal.jsx'

const RADIUS_OPTIONS = [5, 10, 25, 50]

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Coordinates & Location State
  const [userCoords, setUserCoords] = useState(null)
  const [resolvedLocationName, setResolvedLocationName] = useState('')
  const [locationStatus, setLocationStatus] = useState('loading') // 'loading' | 'success' | 'permission_denied' | 'unavailable' | 'network_error'
  const [locationErrorMessage, setLocationErrorMessage] = useState('')

  // Data State
  const [radiusKm, setRadiusKm] = useState(10)
  const [nearbyRequests, setNearbyRequests] = useState([])
  const [nearbyDonors, setNearbyDonors] = useState([])
  const [myRequestsCount, setMyRequestsCount] = useState(0)
  const [loadingData, setLoadingData] = useState(true)

  // Interactive Contact & Response Modals State
  const [contactModalDonor, setContactModalDonor] = useState(null)
  const [contactingId, setContactingId] = useState(null)
  const [responseModalRequest, setResponseModalRequest] = useState(null)

  // Real-time Socket Ref
  const socketRef = useRef(null)

  // Load User Location & Data
  const loadDashboardData = useCallback(async (forcedRadius = null, forceNewCoords = false) => {
    setLoadingData(true)
    const activeRadius = forcedRadius ?? radiusKm
    let coords = userCoords

    try {
      if (!coords || forceNewCoords) {
        setLocationStatus('loading')
        coords = await getCurrentCoordinates()
        setUserCoords(coords)
        setLocationStatus('success')
        
        // Reverse geocode in background
        reverseGeocode(coords.latitude, coords.longitude)
          .then(name => setResolvedLocationName(name))
          .catch(() => setResolvedLocationName(`${coords.latitude.toFixed(3)}° N, ${coords.longitude.toFixed(3)}° E`))
      }

      // Fetch in parallel using real GPS
      const [nearbyReqRes, nearbyDonorRes, allRequestsRes] = await Promise.all([
        fetchNearbyRequests(coords.latitude, coords.longitude, activeRadius).catch(() => ({ requests: [] })),
        fetchNearbyDonors(coords.latitude, coords.longitude, activeRadius, 'All', 'available').catch(() => ({ donors: [] })),
        fetchRequests().catch(() => [])
      ])

      const reqList = Array.isArray(nearbyReqRes?.requests) ? nearbyReqRes.requests : (Array.isArray(nearbyReqRes) ? nearbyReqRes : [])
      const donorList = Array.isArray(nearbyDonorRes?.donors) ? nearbyDonorRes.donors : (Array.isArray(nearbyDonorRes) ? nearbyDonorRes : [])
      const allReqList = Array.isArray(allRequestsRes) ? allRequestsRes : (Array.isArray(allRequestsRes?.requests) ? allRequestsRes.requests : [])

      setNearbyRequests(reqList)
      setNearbyDonors(donorList)

      // Count only current user's own active requests
      const currentUserId = user?._id || user?.id
      if (currentUserId) {
        const myActive = allReqList.filter(r => {
          const reqOwnerId = (r.requesterId?._id || r.requesterId)?.toString()
          return reqOwnerId === currentUserId.toString() && r.status !== 'Completed' && r.status !== 'Cancelled'
        })
        setMyRequestsCount(myActive.length)
      } else {
        setMyRequestsCount(0)
      }

      setLocationStatus('success')
    } catch (err) {
      if (err.code === LOCATION_ERRORS.PERMISSION_DENIED) {
        setLocationStatus('permission_denied')
        setLocationErrorMessage('Location permission is required to discover nearby donors and urgent requests.')
      } else if (
        err.code === LOCATION_ERRORS.POSITION_UNAVAILABLE ||
        err.code === LOCATION_ERRORS.TIMEOUT ||
        err.code === LOCATION_ERRORS.NOT_SUPPORTED
      ) {
        setLocationStatus('unavailable')
        setLocationErrorMessage('Unable to determine device GPS coordinates.')
      } else {
        setLocationStatus('network_error')
        setLocationErrorMessage('Network error loading nearby blood network.')
      }
      setNearbyRequests([])
      setNearbyDonors([])
    } finally {
      setLoadingData(false)
    }
  }, [radiusKm, userCoords, user])

  // Initial Load
  useEffect(() => {
    loadDashboardData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Socket.IO Real-Time Subscriptions
  useEffect(() => {
    try {
      const socket = io(import.meta.env.VITE_API_URL || '')
      socketRef.current = socket

      const handleRealtimeUpdate = () => {
        if (userCoords) {
          loadDashboardData(radiusKm)
        }
      }

      socket.on('request_update', handleRealtimeUpdate)
      socket.on('emergency_alert', handleRealtimeUpdate)
      socket.on('donor_update', handleRealtimeUpdate)
      socket.on('user_update', handleRealtimeUpdate)
      socket.on('new_notification', handleRealtimeUpdate)
      socket.on('camp_update', handleRealtimeUpdate)

      return () => {
        socket.off('request_update', handleRealtimeUpdate)
        socket.off('emergency_alert', handleRealtimeUpdate)
        socket.off('donor_update', handleRealtimeUpdate)
        socket.off('user_update', handleRealtimeUpdate)
        socket.off('new_notification', handleRealtimeUpdate)
        socket.off('camp_update', handleRealtimeUpdate)
        socket.disconnect()
      }
    } catch (err) {
      console.warn('Socket connection error in Dashboard:', err)
    }
  }, [userCoords, radiusKm, loadDashboardData])

  const handleRadiusChange = (newRadius) => {
    setRadiusKm(newRadius)
    loadDashboardData(newRadius)
  }

  const handleContactDonorClick = async (donor) => {
    try {
      setContactingId(donor._id || donor.id)
      let phone = donor.phone
      let email = donor.email

      if (!phone || !email) {
        const contactData = await contactDonor(donor._id || donor.id)
        phone = contactData.phone || phone
        email = contactData.email || email
      }

      setContactModalDonor({
        ...donor,
        phone,
        email: email || `${donor.name?.toLowerCase().replace(/\s+/g, '')}@gmail.com`
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

  // Dynamic user calculations
  const myDonationsCount = user?.donationsCount ?? user?.donations ?? 0
  const myPoints = user?.points ?? (myDonationsCount * 100)
  const myBloodGroup = user?.bloodGroup || 'O+'
  const currentUserId = user?._id || user?.id

  // Filter nearby requests: exclude expired and ensure valid
  const actionableNearbyRequests = nearbyRequests.filter(req => {
    const isExpired = req.requiredBefore && new Date(req.requiredBefore).getTime() <= Date.now()
    return !isExpired && req.status !== 'Completed' && req.status !== 'Cancelled'
  })

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Eligible now'
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    } catch {
      return 'Eligible now'
    }
  }

  return (
    <div className="w-full space-y-8 py-4 sm:py-6 animate-in fade-in duration-500">
      
      {/* ── 1. Top Welcome Banner & GPS Location Card ── */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-6 sm:p-10 text-white shadow-2xl shadow-red-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black uppercase tracking-widest text-rose-100">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Nearby Network
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Member'}! 👋
            </h1>
            <p className="max-w-xl text-sm font-medium text-rose-100/90 leading-relaxed">
              Real-time blood network around you. Discover available donors and urgent emergencies near your current location.
            </p>
          </div>

          {/* Location Badge Card */}
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-5 border border-white/20 flex flex-col sm:flex-row sm:items-center gap-4 shrink-0 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl shadow-inner">
                📍
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-rose-200">Current Location</p>
                <p className="text-sm font-black text-white">
                  {locationStatus === 'loading'
                    ? 'Detecting GPS location...'
                    : locationStatus === 'permission_denied'
                    ? 'Permission Denied'
                    : locationStatus === 'unavailable'
                    ? 'GPS Unavailable'
                    : resolvedLocationName || (userCoords ? `${userCoords.latitude.toFixed(3)}°, ${userCoords.longitude.toFixed(3)}°` : 'Location not available')}
                </p>
                <p className="text-[10px] text-rose-200/80 font-medium mt-0.5">
                  {userCoords ? 'Live device GPS' : 'Click refresh to detect'}
                </p>
              </div>
            </div>

            <button
              onClick={() => loadDashboardData(radiusKm, true)}
              disabled={loadingData}
              className="px-4 py-2.5 rounded-xl bg-white text-red-600 hover:bg-rose-50 text-xs font-black uppercase tracking-wider transition shadow-md flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              <svg className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh GPS
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-black/20 blur-3xl pointer-events-none" />
      </div>

      {/* ── 2. Top Metric Statistics Grid (100% Real Dynamic Values) ── */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Card 1: Nearby Blood Requests */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-xl shadow-slate-200/40 dark:shadow-none transition hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nearby Requests</p>
              <h3 className="mt-2 text-3xl font-black text-red-600 dark:text-red-400">
                {loadingData ? '...' : actionableNearbyRequests.length}
              </h3>
              <p className="mt-1 text-[11px] font-bold text-slate-500">Within {radiusKm} km radius</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xl shadow-inner">
              🩸
            </div>
          </div>
        </div>

        {/* Card 2: Available Nearby Donors */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-xl shadow-slate-200/40 dark:shadow-none transition hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Available Donors</p>
              <h3 className="mt-2 text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {loadingData ? '...' : nearbyDonors.length}
              </h3>
              <p className="mt-1 text-[11px] font-bold text-slate-500">Within {radiusKm} km radius</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xl shadow-inner">
              👥
            </div>
          </div>
        </div>

        {/* Card 3: My Blood Requests */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-xl shadow-slate-200/40 dark:shadow-none transition hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">My Requests</p>
              <h3 className="mt-2 text-3xl font-black text-sky-600 dark:text-sky-400">
                {loadingData ? '...' : myRequestsCount}
              </h3>
              <p className="mt-1 text-[11px] font-bold text-slate-500">Active requests created</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 text-xl shadow-inner">
              📋
            </div>
          </div>
        </div>

        {/* Card 4: My Donations */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-xl shadow-slate-200/40 dark:shadow-none transition hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">My Donations</p>
              <h3 className="mt-2 text-3xl font-black text-amber-600 dark:text-amber-400">
                {myDonationsCount}
              </h3>
              <p className="mt-1 text-[11px] font-bold text-slate-500">{myPoints} Impact XP Points</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-xl shadow-inner">
              ⭐
            </div>
          </div>
        </div>

      </div>

      {/* ── 3. Quick Actions Toolbar ── */}
      <div className="rounded-3xl border border-slate-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-xl shadow-slate-200/40 dark:shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Quick Actions</h2>
            <p className="text-xs text-slate-500">Instant access to life-saving operations</p>
          </div>

          {/* Radius Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Search Radius:</span>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-gray-800 p-1 rounded-xl">
              {RADIUS_OPTIONS.map(r => (
                <button
                  key={r}
                  onClick={() => handleRadiusChange(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    radiusKm === r
                      ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                      : 'text-slate-600 dark:text-gray-300 hover:text-red-600'
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => navigate('/requests', { state: { tab: 'create' } })}
            className="p-4 rounded-2xl bg-red-600 text-white flex flex-col items-center justify-center gap-2 hover:bg-red-700 shadow-md shadow-red-500/20 transition hover:scale-105 active:scale-95 text-center"
          >
            <span className="text-2xl">🚨</span>
            <span className="text-xs font-black">Request Blood</span>
          </button>

          <button
            onClick={() => navigate('/donors')}
            className="p-4 rounded-2xl bg-slate-900 dark:bg-gray-800 text-white flex flex-col items-center justify-center gap-2 hover:bg-slate-800 transition hover:scale-105 active:scale-95 text-center"
          >
            <span className="text-2xl">🔍</span>
            <span className="text-xs font-black">Find Donors</span>
          </button>

          <button
            onClick={() => navigate('/hospitals')}
            className="p-4 rounded-2xl bg-blue-600 text-white flex flex-col items-center justify-center gap-2 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition hover:scale-105 active:scale-95 text-center"
          >
            <span className="text-2xl">🏥</span>
            <span className="text-xs font-black">Find Hospitals</span>
          </button>

          <button
            onClick={() => navigate('/camps')}
            className="p-4 rounded-2xl bg-amber-600 text-white flex flex-col items-center justify-center gap-2 hover:bg-amber-700 shadow-md shadow-amber-500/20 transition hover:scale-105 active:scale-95 text-center"
          >
            <span className="text-2xl">🏕️</span>
            <span className="text-xs font-black">Blood Camps</span>
          </button>

          <button
            onClick={() => navigate('/requests', { state: { tab: 'my_requests' } })}
            className="p-4 rounded-2xl bg-emerald-600 text-white flex flex-col items-center justify-center gap-2 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition hover:scale-105 active:scale-95 text-center"
          >
            <span className="text-2xl">📑</span>
            <span className="text-xs font-black">My Requests</span>
          </button>

          <button
            onClick={() => navigate('/notifications')}
            className="p-4 rounded-2xl bg-purple-600 text-white flex flex-col items-center justify-center gap-2 hover:bg-purple-700 shadow-md shadow-purple-500/20 transition hover:scale-105 active:scale-95 text-center"
          >
            <span className="text-2xl">🔔</span>
            <span className="text-xs font-black">Alerts</span>
          </button>
        </div>
      </div>

      {/* ── 4. Main Two-Column Content: Nearby Donors & Nearby Requests ── */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">

        {/* ── Column A: Nearby Available Donors ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Nearby Available Donors</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                  {nearbyDonors.length} found
                </span>
              </h2>
              <p className="text-xs font-medium text-slate-500">Available donors within {radiusKm} km of your GPS</p>
            </div>
            <button
              onClick={() => navigate('/donors')}
              className="text-xs font-bold text-red-600 hover:text-red-700 transition flex items-center gap-1"
            >
              View All →
            </button>
          </div>

          {loadingData ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
            </div>
          ) : nearbyDonors.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-gray-900 rounded-3xl border border-slate-100 dark:border-gray-800 space-y-3">
              <span className="text-4xl">👥</span>
              <p className="text-base font-bold text-slate-900 dark:text-white">No available donors nearby</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                There are currently no registered available donors within {radiusKm} km of your location.
              </p>
              <button
                onClick={() => handleRadiusChange(Math.min(50, radiusKm + 15))}
                className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-gray-800 text-white text-xs font-bold hover:bg-slate-800 transition"
              >
                Expand to {Math.min(50, radiusKm + 15)} km
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {nearbyDonors.slice(0, 4).map((donor) => (
                <div
                  key={donor._id || donor.id}
                  className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-800 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center font-black text-base shrink-0 shadow-md shadow-red-500/20">
                      {donor.name?.charAt(0)?.toUpperCase() || 'D'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-black text-slate-900 dark:text-white text-sm">{donor.name}</p>
                        <span className="px-2 py-0.5 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 text-[10px] font-black">
                          {donor.bloodGroup}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                          Available
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-1">
                        📍 {typeof donor.distanceKm === 'number' ? `${donor.distanceKm} km away` : 'Nearby'} • {donor.location || 'Local Area'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                        🩸 {donor.donationsCount ?? donor.donations ?? 0} Donations • ⭐ {donor.rating ?? 4.8}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => navigate(`/profile-view/${donor._id || donor.id}`, { state: { donor } })}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-gray-800 transition"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => handleContactDonorClick(donor)}
                      disabled={contactingId === (donor._id || donor.id)}
                      className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-black hover:bg-red-700 shadow-md shadow-red-500/20 transition disabled:opacity-50"
                    >
                      {contactingId === (donor._id || donor.id) ? '...' : 'Contact'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Column B: Nearby Blood Requests ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Nearby Blood Requests</span>
                <span className="px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 text-xs font-bold">
                  {actionableNearbyRequests.length} active
                </span>
              </h2>
              <p className="text-xs font-medium text-slate-500">Urgent requests requiring help within {radiusKm} km</p>
            </div>
            <button
              onClick={() => navigate('/requests')}
              className="text-xs font-bold text-red-600 hover:text-red-700 transition flex items-center gap-1"
            >
              View All →
            </button>
          </div>

          {loadingData ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
            </div>
          ) : actionableNearbyRequests.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-gray-900 rounded-3xl border border-slate-100 dark:border-gray-800 space-y-3">
              <span className="text-4xl">🙌</span>
              <p className="text-base font-bold text-slate-900 dark:text-white">No active requests nearby</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Great news! There are currently no critical blood requirements within {radiusKm} km.
              </p>
              <button
                onClick={() => handleRadiusChange(Math.min(50, radiusKm + 15))}
                className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-gray-800 text-white text-xs font-bold hover:bg-slate-800 transition"
              >
                Expand to {Math.min(50, radiusKm + 15)} km
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {actionableNearbyRequests.slice(0, 4).map((req) => {
                const isMyOwnRequest = currentUserId && (req.requesterId?._id || req.requesterId)?.toString() === currentUserId.toString()
                return (
                  <div
                    key={req._id}
                    className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-800 shadow-sm hover:shadow-md transition space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex flex-col items-center justify-center font-black shrink-0 shadow-md shadow-red-500/20">
                          <span className="text-sm leading-none">{req.bloodGroup}</span>
                          <span className="text-[9px] text-red-100">{req.unitsNeeded}u</span>
                        </div>
                        <div>
                          <p className="font-black text-slate-900 dark:text-white text-sm">
                            {req.patientName || 'Emergency Patient'}
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium">
                            📍 {typeof req.distanceKm === 'number' ? `${req.distanceKm} km away` : 'Nearby'} • {req.location || 'Hospital Area'}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium line-clamp-1 mt-0.5">
                            {req.reason || 'Urgent emergency requirement'}
                          </p>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        req.emergencyLevel === 'Critical'
                          ? 'bg-red-600 text-white animate-pulse'
                          : req.emergencyLevel === 'High'
                          ? 'bg-orange-500 text-white'
                          : 'bg-emerald-500 text-white'
                      }`}>
                        {req.emergencyLevel || 'Urgent'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-gray-800 text-xs">
                      <span className="text-[10px] text-slate-400 font-medium">
                        Needed: {req.requiredBefore ? formatDate(req.requiredBefore) : 'Immediate'}
                      </span>

                      {isMyOwnRequest ? (
                        <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300 font-bold text-[10px]">
                          Your Request
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setResponseModalRequest(req)}
                            className="px-4 py-1.5 rounded-xl bg-red-600 text-white font-black text-xs hover:bg-red-700 shadow-md shadow-red-500/20 transition"
                          >
                            Respond
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>

      {/* ── 5. Personal Blood Profile Card & Community Banner ── */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1fr_1.5fr]">
        
        {/* Blood Profile Summary */}
        <div className="rounded-3xl border border-slate-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 dark:text-white">Your Blood Profile</h3>
            <button onClick={() => navigate('/profile')} className="text-xs font-bold text-red-600 hover:underline">
              Edit →
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40">
              <p className="text-[10px] font-bold uppercase text-slate-400">Group</p>
              <p className="text-xl font-black text-red-600 mt-1">{myBloodGroup}</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-gray-800">
              <p className="text-[10px] font-bold uppercase text-slate-400">Donations</p>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{myDonationsCount}</p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40">
              <p className="text-[10px] font-bold uppercase text-slate-400">XP Points</p>
              <p className="text-xl font-black text-amber-600 mt-1">{myPoints}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">Donation Eligibility</p>
              <p className="text-xs font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
                {formatDate(user?.nextDonationDate)}
              </p>
            </div>
            <span className="text-xl">✅</span>
          </div>
        </div>

        {/* Community "Every Drop Counts" Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 z-10">
            <span className="px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-widest">
              Every Drop Counts
            </span>
            <h3 className="text-2xl font-black">Save Up To 3 Lives Today</h3>
            <p className="text-xs text-slate-300 max-w-md leading-relaxed">
              Every 2 seconds someone needs blood. Join upcoming blood camps or respond to urgent requests around your community.
            </p>
          </div>

          <div className="z-10 shrink-0 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/camps')}
              className="px-6 py-3 rounded-2xl bg-red-600 text-white font-black text-xs uppercase tracking-wider hover:bg-red-700 transition shadow-lg shadow-red-500/30 text-center"
            >
              Join a Camp
            </button>
            <button
              onClick={() => navigate('/donors')}
              className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-wider transition text-center"
            >
              Browse Donors
            </button>
          </div>

          {/* Decorative background glow */}
          <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-red-600/30 blur-2xl pointer-events-none" />
        </div>

      </div>

      {/* ── 6. Contact Donor Interactive Modal ── */}
      {contactModalDonor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
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

            <div className="py-6 space-y-4">
              {/* Phone Number Card */}
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
                      className="px-3 py-1.5 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    >
                      Copy
                    </button>
                    <a
                      href={`tel:${contactModalDonor.phone}`}
                      className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-md shadow-red-500/20 transition"
                    >
                      Call
                    </a>
                  </div>
                )}
              </div>

              {/* Email Address Card */}
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
                      className="px-3 py-1.5 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    >
                      Copy
                    </button>
                    <a
                      href={`mailto:${contactModalDonor.email}`}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20 transition"
                    >
                      Email
                    </a>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                const id = contactModalDonor._id || contactModalDonor.id
                setContactModalDonor(null)
                navigate(`/profile-view/${id}`, { state: { donor: contactModalDonor } })
              }}
              className="w-full py-3 rounded-2xl border-2 border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-black uppercase tracking-wider transition text-center"
            >
              View Full Profile Details
            </button>
          </div>
        </div>
      )}

      {/* Response Modal */}
      <ResponseModal
        request={responseModalRequest}
        isOpen={!!responseModalRequest}
        onClose={() => setResponseModalRequest(null)}
        onSuccess={() => {
          if (userCoords) loadData(userCoords, radiusKm)
        }}
      />

    </div>
  )
}

