import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { createRequest, fetchNearbyRequests, fetchRequests, acceptDonorResponse, completeDonation } from '../api/requestsApi'
import { useAuth } from '../context/AuthContext'
import { getCurrentCoordinates, reverseGeocode, LOCATION_ERRORS } from '../services/locationService'
import LoadingButton from './ui/LoadingButton.jsx'
import { toast } from 'react-hot-toast'
import ResponseModal from './ResponseModal.jsx'

const bloodGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
const emergencyLevels = ['Normal', 'High', 'Critical']
const RADIUS_OPTIONS = [5, 10, 25, 50]

export default function Requests() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const initialTab = location.state?.tab || (location.state?.openCreateModal ? 'create' : 'nearby')
  const [activeTab, setActiveTab] = useState(initialTab)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [responseModalRequest, setResponseModalRequest] = useState(null)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [actionLoadingId, setActionLoadingId] = useState(null)

  // Form State
  const [formData, setFormData] = useState({
    patientName: user?.name || '',
    bloodGroup: 'O+',
    unitsNeeded: 1,
    emergencyLevel: 'Normal',
    patientCondition: '',
    location: user?.location || '',
    latitude: '',
    longitude: '',
    requiredBefore: '',
    contactNumber: user?.phone || '',
    reason: '',
  })

  // Synchronize activeTab if location.state changes
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab)
    } else if (location.state?.openCreateModal) {
      setActiveTab('create')
    }
  }, [location.state])

  // Nearby Feed State
  const [nearbyRequests, setNearbyRequests] = useState([])
  const [radiusKm, setRadiusKm] = useState(10)
  const [feedLoading, setFeedLoading] = useState(true)
  const [locationStatus, setLocationStatus] = useState('idle')
  const [userCoords, setUserCoords] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  // My Requests State
  const [myRequests, setMyRequests] = useState([])
  const [myRequestsLoading, setMyRequestsLoading] = useState(false)

  const loadNearby = useCallback(async (forcedCoords = null, forcedRadius = null) => {
    setFeedLoading(true)
    const targetRadius = forcedRadius ?? radiusKm
    let coords = forcedCoords ?? userCoords

    try {
      if (!coords) {
        setLocationStatus('loading')
        coords = await getCurrentCoordinates()
        setUserCoords(coords)
        setLocationStatus('success')
      }

      const res = await fetchNearbyRequests(coords.latitude, coords.longitude, targetRadius)
      const list = Array.isArray(res?.requests) ? res.requests : (Array.isArray(res) ? res : [])
      
      const filtered = list.filter(r => {
        const creatorId = (r.requesterId?._id || r.requesterId)?.toString()
        const currentUserId = (user?._id || user?.id)?.toString()
        return !creatorId || !currentUserId || creatorId !== currentUserId
      })
      setNearbyRequests(filtered)
    } catch (err) {
      if (err.code === LOCATION_ERRORS.PERMISSION_DENIED) {
        setLocationStatus('permission_denied')
        setErrorMessage('Location permission is required to find nearby blood requests.')
      } else if (err.code === LOCATION_ERRORS.POSITION_UNAVAILABLE || err.code === LOCATION_ERRORS.TIMEOUT || err.code === LOCATION_ERRORS.NOT_SUPPORTED) {
        setLocationStatus('unavailable')
        setErrorMessage('Unable to determine your current location.')
      } else {
        setLocationStatus('network_error')
        setErrorMessage('Unable to load nearby blood requests. Please try again.')
      }
      setNearbyRequests([])
    } finally {
      setFeedLoading(false)
    }
  }, [radiusKm, userCoords, user])

  const loadMyRequests = useCallback(async () => {
    if (!user) return
    setMyRequestsLoading(true)
    try {
      const data = await fetchRequests()
      const list = Array.isArray(data) ? data : []
      const currentUserId = (user._id || user.id)?.toString()
      const userOwn = list.filter(r => {
        const creatorId = (r.requesterId?._id || r.requesterId)?.toString()
        return creatorId === currentUserId
      })
      setMyRequests(userOwn)
    } catch (err) {
      console.error('Failed to load user requests:', err)
    } finally {
      setMyRequestsLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (activeTab === 'nearby') {
      loadNearby(null, radiusKm)
    } else if (activeTab === 'my_requests') {
      loadMyRequests()
    }
  }, [activeTab, radiusKm, loadNearby, loadMyRequests])

  const captureLocation = async () => {
    setGpsLoading(true)
    try {
      const coords = await getCurrentCoordinates()
      let readableLocation = `GPS (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`
      try {
        const address = await reverseGeocode(coords.latitude, coords.longitude)
        if (address) readableLocation = address
      } catch (_e) {
      }

      setFormData(prev => ({
        ...prev,
        latitude: coords.latitude,
        longitude: coords.longitude,
        location: readableLocation,
      }))
      toast.success(`Location acquired: ${readableLocation}`)
    } catch (err) {
      toast.error(err.message || 'Unable to fetch current location.')
    } finally {
      setGpsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.patientName.trim()) {
      toast.error('Please provide the patient name.')
      return
    }
    if (!formData.contactNumber.trim()) {
      toast.error('Please provide an emergency contact number.')
      return
    }

    setIsSubmitting(true)
    try {
      const submitData = {
        patientName: formData.patientName,
        bloodGroup: formData.bloodGroup,
        unitsNeeded: Number(formData.unitsNeeded) || 1,
        emergencyLevel: formData.emergencyLevel,
        patientCondition: formData.patientCondition,
        location: formData.location || 'Local Area',
        contactNumber: formData.contactNumber,
        contactInfo: formData.contactNumber,
        reason: formData.reason || formData.patientCondition || 'Urgent blood request',
        requiredBefore: formData.requiredBefore || undefined
      }

      if (
        formData.latitude !== '' &&
        formData.longitude !== '' &&
        !isNaN(Number(formData.latitude)) &&
        !isNaN(Number(formData.longitude))
      ) {
        submitData.latitude = Number(formData.latitude)
        submitData.longitude = Number(formData.longitude)
      }
      
      await createRequest(submitData)
      toast.success('Emergency blood request broadcasted successfully! 🚨')
      setFormData({
        patientName: user?.name || '',
        bloodGroup: 'O+',
        unitsNeeded: 1,
        emergencyLevel: 'Normal',
        patientCondition: '',
        location: user?.location || '',
        latitude: '',
        longitude: '',
        requiredBefore: '',
        contactNumber: user?.phone || '',
        reason: '',
      })
      setActiveTab('my_requests')
      loadMyRequests()
    } catch (err) {
      toast.error(err.message || 'Failed to create blood request.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAcceptDonor = async (donationId) => {
    setActionLoadingId(donationId)
    try {
      await acceptDonorResponse(donationId)
      toast.success('Donor response accepted! (+20 XP awarded) 🎉')
      loadMyRequests()
    } catch (err) {
      toast.error(err.message || 'Failed to accept donor response.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleCompleteDonation = async (donationId) => {
    if (!window.confirm('Are you sure the donor has completed the blood donation? This will record the completed donation and award donor XP.')) {
      return
    }
    setActionLoadingId(donationId)
    try {
      await completeDonation(donationId)
      toast.success('Donation marked as completed! (+50 XP awarded, donation count +1) ❤️')
      loadMyRequests()
    } catch (err) {
      toast.error(err.message || 'Failed to complete donation.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-slate-100 dark:border-gray-700 p-8 sm:p-10 space-y-8 shadow-xl shadow-slate-200/50 dark:shadow-none animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Blood Group Needed</label>
          <div className="grid grid-cols-4 gap-2">
            {bloodGroups.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({ ...formData, bloodGroup: type })}
                className={`py-3 rounded-2xl font-bold text-sm transition-all border-2 ${
                  formData.bloodGroup === type
                    ? 'border-red-600 bg-red-50 dark:bg-red-900/30 text-red-600'
                    : 'border-slate-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-500 hover:border-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Units Required</label>
          <div className="flex items-center gap-4 pt-1">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, unitsNeeded: Math.max(1, formData.unitsNeeded - 1) })}
              className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-gray-700 rounded-2xl text-xl font-bold text-slate-700 dark:text-white hover:bg-slate-200 transition"
            >
              −
            </button>
            <span className="text-2xl font-black w-12 text-center text-slate-900 dark:text-white">{formData.unitsNeeded}</span>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, unitsNeeded: formData.unitsNeeded + 1 })}
              className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-gray-700 rounded-2xl text-xl font-bold text-slate-700 dark:text-white hover:bg-slate-200 transition"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Priority / Urgency Level</label>
        <div className="grid grid-cols-3 gap-3">
          {emergencyLevels.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setFormData({ ...formData, emergencyLevel: level })}
              className={`py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border-2 ${
                formData.emergencyLevel === level
                  ? level === 'Critical'
                    ? 'border-red-600 bg-red-600 text-white'
                    : level === 'High'
                    ? 'border-orange-500 bg-orange-500 text-white'
                    : 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-500'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Patient Name</label>
          <input
            type="text"
            required
            value={formData.patientName}
            onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
            placeholder="Full name of patient"
            className="w-full px-5 py-4 bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-700 rounded-2xl font-medium focus:ring-2 focus:ring-red-500 outline-none text-slate-900 dark:text-white"
          />
        </div>
        <div className="space-y-3">
          <label className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Emergency Contact Number</label>
          <input
            type="tel"
            required
            value={formData.contactNumber}
            onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
            placeholder="Primary phone number for donors"
            className="w-full px-5 py-4 bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-700 rounded-2xl font-medium focus:ring-2 focus:ring-red-500 outline-none text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Patient Condition / Reason</label>
          <input
            type="text"
            value={formData.patientCondition}
            onChange={(e) => setFormData({ ...formData, patientCondition: e.target.value })}
            placeholder="e.g. Critical Surgery, Accident, Chemotherapy"
            className="w-full px-5 py-4 bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-700 rounded-2xl font-medium focus:ring-2 focus:ring-red-500 outline-none text-slate-900 dark:text-white"
          />
        </div>
        <div className="space-y-3">
          <label className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Required By Date</label>
          <input
            type="date"
            value={formData.requiredBefore}
            onChange={(e) => setFormData({ ...formData, requiredBefore: e.target.value })}
            className="w-full px-5 py-4 bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-700 rounded-2xl font-medium focus:ring-2 focus:ring-red-500 outline-none text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Location / Pickup Address</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Hospital name, room number, or street address"
            className="flex-1 px-5 py-4 bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-700 rounded-2xl font-medium focus:ring-2 focus:ring-red-500 outline-none text-slate-900 dark:text-white"
          />
          <button
            type="button"
            onClick={captureLocation}
            disabled={gpsLoading}
            className="px-6 py-4 rounded-2xl bg-slate-900 dark:bg-slate-700 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition flex items-center gap-2 shrink-0"
          >
            {gpsLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>📍</span>
            )}
            <span>Get GPS</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Additional Description (Optional)</label>
        <textarea
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          rows={3}
          placeholder="Provide any specific medical requirements, hospital gate instructions, or timing..."
          className="w-full px-5 py-4 bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-700 rounded-2xl font-medium focus:ring-2 focus:ring-red-500 outline-none text-slate-900 dark:text-white"
        />
      </div>

      <LoadingButton
        type="submit"
        loading={isSubmitting}
        loadingText="Broadcasting Request..."
        className="w-full py-5 rounded-2xl bg-red-600 text-white text-sm font-black uppercase tracking-widest shadow-xl shadow-red-500/30 hover:bg-red-700 transition active:scale-98"
      >
        Broadcast Blood Request 🚨
      </LoadingButton>
    </form>
  )

  const renderNearbyFeed = () => {
    if (feedLoading) {
      return (
        <div className="w-full py-20 flex flex-col items-center justify-center space-y-4 rounded-[2.5rem] bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-600 dark:text-gray-300">Finding nearby blood requests...</p>
        </div>
      )
    }

    if (locationStatus === 'permission_denied' || locationStatus === 'unavailable' || locationStatus === 'network_error') {
      return (
        <div className="w-full py-16 px-6 text-center space-y-4 rounded-[2.5rem] bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <span className="text-4xl">📍</span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">Location Access Needed</h3>
          <p className="text-sm text-slate-500 dark:text-gray-400 max-w-md mx-auto">{errorMessage}</p>
          <button
            onClick={() => loadNearby(null, radiusKm)}
            className="px-8 py-3 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-500/20 hover:scale-105 transition"
          >
            Retry GPS Location
          </button>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-slate-100 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">Radius:</span>
            <div className="flex gap-1.5">
              {RADIUS_OPTIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRadiusKm(r)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    radiusKm === r
                      ? 'bg-red-600 text-white shadow-md shadow-red-500/30'
                      : 'bg-white dark:bg-gray-700 text-slate-600 dark:text-gray-300 hover:bg-slate-50'
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span>{nearbyRequests.length} results</span>
            <button onClick={() => loadNearby(null, radiusKm)} className="p-1.5 rounded-lg bg-white dark:bg-gray-700 hover:bg-slate-50 transition">
              🔄
            </button>
          </div>
        </div>

        {nearbyRequests.length === 0 ? (
          <div className="w-full py-16 px-6 text-center space-y-3 rounded-[2.5rem] bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700">
            <span className="text-4xl">🔍</span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">No Requests Nearby</h3>
            <p className="text-sm text-slate-500 dark:text-gray-400">No active blood requests found within {radiusKm} km.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearbyRequests.map((req) => (
              <div key={req._id} className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-3xl font-black text-red-600">{req.bloodGroup}</p>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-500 mt-1">
                        {typeof req.distanceKm === 'number' ? `📍 ${req.distanceKm} km away` : '📍 Nearby'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{req.location || 'Location details specified'}</p>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      req.emergencyLevel === 'Critical' ? 'bg-red-600 text-white animate-pulse' : req.emergencyLevel === 'High' ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'
                    }`}>
                      {req.emergencyLevel || 'Normal'}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-slate-600 dark:text-gray-400 leading-relaxed mb-6">
                    {req.reason || req.patientCondition || 'Urgent blood requirement for emergency patient.'}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-50 dark:border-gray-800 pt-6 mt-4">
                  <div>
                    <span className="text-sm font-black text-slate-900 dark:text-white">{req.unitsNeeded} Units</span>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Needed: {req.requiredBefore ? new Date(req.requiredBefore).toLocaleDateString() : 'Immediate'}
                    </p>
                  </div>
                  <button
                    onClick={() => setResponseModalRequest(req)}
                    className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-red-500/20 hover:scale-105 transition"
                  >
                    Respond
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderMyRequests = () => {
    if (myRequestsLoading) {
      return (
        <div className="w-full py-20 flex flex-col items-center justify-center space-y-4 rounded-[2.5rem] bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-600 dark:text-gray-300">Loading your created requests...</p>
        </div>
      )
    }

    if (myRequests.length === 0) {
      return (
        <div className="w-full py-16 px-6 text-center space-y-4 rounded-[2.5rem] bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700">
          <span className="text-4xl">📋</span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">No Requests Created Yet</h3>
          <p className="text-sm text-slate-500 dark:text-gray-400 max-w-sm mx-auto">
            You haven't broadcasted any blood requests. Click "New Request" to create one.
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myRequests.map((req) => {
            const responders = req.responses || []
            return (
              <div key={req._id} className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-3xl font-black text-red-600">{req.bloodGroup}</p>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400 mt-1">
                        Patient: {req.patientName || 'Emergency'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{req.location || 'Location specified'}</p>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      req.status === 'Completed' ? 'bg-green-500 text-white' : req.status === 'Accepted' ? 'bg-blue-600 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {req.status || 'Pending'}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-slate-600 dark:text-gray-400 leading-relaxed mb-4">
                    {req.reason || req.patientCondition || 'Emergency request active and awaiting responder fulfillment.'}
                  </p>

                  {responders.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-gray-800 space-y-3">
                      <p className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-gray-300">
                        Active Responders ({responders.length})
                      </p>
                      <div className="space-y-2">
                        {responders.map((resp, idx) => (
                          <div key={resp._id || idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-gray-800/80 border border-slate-100 dark:border-gray-700 text-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span>🩸 {resp.responderName || resp.donor?.name || 'Verified Donor'}</span>
                                {resp.eta && (
                                  <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-black">
                                    ETA ~{resp.eta}m
                                  </span>
                                )}
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                resp.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                resp.status === 'Accepted' ? 'bg-blue-100 text-blue-700' :
                                'bg-amber-100 text-amber-700'
                              }`}>
                                {resp.status || 'Pending'}
                              </span>
                            </div>

                            {resp.contactNumber && (
                              <div className="flex items-center justify-between text-slate-500 dark:text-gray-400 pt-1">
                                <span>📞 {resp.contactNumber}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(resp.contactNumber)
                                    toast.success('Phone copied!')
                                  }}
                                  className="text-[10px] font-bold text-red-600 hover:underline"
                                >
                                  Copy
                                </button>
                              </div>
                            )}

                            {resp.note && (
                              <p className="text-[11px] italic text-slate-500 dark:text-gray-400">
                                "{resp.note}"
                              </p>
                            )}

                            {req.status !== 'Completed' && resp.status !== 'Completed' && (
                              <div className="flex gap-2 pt-2 border-t border-slate-200/60 dark:border-gray-700">
                                {resp.status !== 'Accepted' && (
                                  <button
                                    type="button"
                                    onClick={() => handleAcceptDonor(resp._id)}
                                    disabled={actionLoadingId === resp._id}
                                    className="flex-1 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-[11px] hover:bg-blue-700 transition shadow-sm"
                                  >
                                    {actionLoadingId === resp._id ? 'Accepting...' : 'Accept Donor'}
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleCompleteDonation(resp._id)}
                                  disabled={actionLoadingId === resp._id}
                                  className="flex-1 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition shadow-sm"
                                >
                                  {actionLoadingId === resp._id ? 'Completing...' : 'Mark Completed'}
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-slate-50 dark:border-gray-800 pt-6 mt-4">
                  <span className="text-sm font-black text-slate-900 dark:text-white">{req.unitsNeeded} Units</span>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    {responders.length} Responses
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Blood Requests</h1>
            <p className="mt-3 text-slate-500 dark:text-gray-400 font-medium">Discover nearby emergency requests or broadcast urgent blood requirements.</p>
          </div>
          
          <div className="flex bg-slate-100 dark:bg-gray-800 p-1.5 rounded-[2rem] overflow-x-auto">
            <button 
              onClick={() => setActiveTab('nearby')}
              className={`px-6 sm:px-8 py-3 rounded-[1.75rem] text-xs sm:text-sm font-black transition-all ${activeTab === 'nearby' ? 'bg-white dark:bg-gray-700 text-red-600 shadow-md' : 'text-slate-500'}`}
            >
              Nearby Feed
            </button>
            <button 
              onClick={() => setActiveTab('my_requests')}
              className={`px-6 sm:px-8 py-3 rounded-[1.75rem] text-xs sm:text-sm font-black transition-all ${activeTab === 'my_requests' ? 'bg-white dark:bg-gray-700 text-red-600 shadow-md' : 'text-slate-500'}`}
            >
              My Requests
            </button>
            <button 
              onClick={() => setActiveTab('create')}
              className={`px-6 sm:px-8 py-3 rounded-[1.75rem] text-xs sm:text-sm font-black transition-all ${activeTab === 'create' ? 'bg-white dark:bg-gray-700 text-red-600 shadow-md' : 'text-slate-500'}`}
            >
              New Request
            </button>
          </div>
        </div>

        {activeTab === 'nearby' && renderNearbyFeed()}
        {activeTab === 'my_requests' && renderMyRequests()}
        {activeTab === 'create' && (
          <div className="max-w-3xl mx-auto space-y-6">
            {renderForm()}
          </div>
        )}
      </div>

      <ResponseModal
        request={responseModalRequest}
        isOpen={!!responseModalRequest}
        onClose={() => setResponseModalRequest(null)}
        onSuccess={() => {
          if (userCoords) loadNearby(userCoords, radiusKm)
        }}
      />
    </div>
  )
}
