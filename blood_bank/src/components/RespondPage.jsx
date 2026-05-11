import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchRequestById } from '../api/requestsApi'
import { submitResponse } from '../api/responsesApi'

export default function RespondPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    available: true,
    arrivalTime: '30',
    contactNumber: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const loadRequest = async () => {
      try {
        const data = await fetchRequestById(id)
        setRequest(data)
      } catch (error) {
        console.error("Failed to fetch request:", error)
      } finally {
        setLoading(false)
      }
    }
    loadRequest()
  }, [id])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const next = {}
    if (!formData.available) {
      next.available = 'You must confirm availability'
    }
    if (!formData.contactNumber.trim()) {
      next.contactNumber = 'Contact number is required'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    try {
      await submitResponse({
        requestId: id,
        ...formData
      })
      setSubmitted(true)
      setTimeout(() => {
        navigate('/')
      }, 3000)
    } catch (error) {
      console.error('Failed to submit response:', error)
      alert('Failed to submit response. Please try again.')
    }
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'Critical':
        return 'bg-red-100 text-red-700 border-red-300'
      case 'Urgent':
        return 'bg-orange-100 text-orange-700 border-orange-300'
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-300'
    }
  }

  return (
    <div className="px-3 pb-8 sm:px-4 md:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-100 transition shadow-sm"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Respond to Blood Request</h1>
            <p className="mt-1 text-sm text-slate-600">Provide your availability and details to help this urgent request.</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading request details...</div>
        ) : !request ? (
          <div className="text-center py-12 text-gray-500">Request not found.</div>
        ) : submitted ? (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center sm:p-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-green-900">Thank you!</h2>
            <p className="mt-2 text-sm text-green-700">
              Your response has been recorded. The hospital will contact you shortly to confirm.
            </p>
            <p className="mt-4 text-xs text-green-600">Redirecting to home...</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Request Details */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Request Details</h2>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-slate-600 uppercase">Blood Group</p>
                    <p className="mt-1 text-lg font-bold text-red-600">{request.bloodType}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-600 uppercase">Urgency</p>
                    <span className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-semibold border ${getUrgencyColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-600 uppercase">Location</p>
                    <p className="mt-1 text-sm text-slate-700">{request.location || 'Not specified'}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-600 uppercase">Hospital</p>
                    <p className="mt-1 text-sm text-slate-700">{request.hospitalName || 'Blekinge Hospital'}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-600 uppercase">Quantity Needed</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{request.quantity} units</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-600 uppercase">Date Needed</p>
                    <p className="mt-1 text-sm text-slate-700">{new Date(request.dateRequired).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <p className="text-xs font-medium text-slate-600 uppercase mb-2">Description</p>
                    <p className="text-sm leading-6 text-slate-700">{request.reason}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Response Form */}
            <form onSubmit={handleSubmit} className="lg:col-span-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-6">Your Response</h2>

                {/* Availability Toggle */}
                <div className="mb-6">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-slate-50">
                    <div>
                      <p className="font-medium text-slate-900">Confirm Availability</p>
                      <p className="text-xs text-slate-600 mt-1">Are you available to donate now?</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="available"
                        checked={formData.available}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className={`w-14 h-8 rounded-full border-2 transition-all duration-200 ease-in-out ${
                        formData.available 
                          ? 'bg-red-600 border-red-600' 
                          : 'bg-slate-300 border-slate-300'
                      }`} />
                      <span className={`absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform duration-200 ${
                        formData.available ? 'translate-x-6' : ''
                      }`} />
                    </label>
                  </div>
                  {errors.available && <p className="mt-2 text-xs text-red-600">{errors.available}</p>}
                </div>

                {/* Arrival Time */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Estimated Arrival Time (minutes)
                  </label>
                  <select
                    name="arrivalTime"
                    value={formData.arrivalTime}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>

                {/* Contact Number */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Contact Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/10 ${
                      errors.contactNumber ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {errors.contactNumber && <p className="mt-1 text-xs text-red-600">{errors.contactNumber}</p>}
                </div>

                {/* Optional Message */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Additional Message (optional)
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Any additional information for the hospital..."
                    rows="4"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/10 resize-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 border-t border-slate-200 pt-6">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition-all duration-200 ease-in-out hover:bg-slate-50 hover:scale-105 active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 ease-in-out hover:bg-red-700 hover:scale-105 hover:shadow-md active:scale-95"
                  >
                    Confirm Response
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
