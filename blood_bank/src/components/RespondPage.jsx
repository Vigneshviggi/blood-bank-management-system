import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchRequestById } from '../api/requestsApi'
import { submitResponse } from '../api/responsesApi'
import { useLoading } from '../context/LoadingContext'
import { toast } from 'react-hot-toast'
import LoadingButton from './ui/LoadingButton.jsx'

export default function RespondPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showLoading, hideLoading } = useLoading()
  
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    available: true,
    arrivalTime: '30',
    contactNumber: '',
    message: ''
  })

  useEffect(() => {
    const loadRequest = async () => {
      try {
        const data = await fetchRequestById(id)
        setRequest(data)
      } catch (error) {
        toast.error("Request details unavailable")
        navigate('/requests')
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
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.contactNumber.trim()) {
      toast.error('Please provide a contact number')
      return
    }

    setIsSubmitting(true)
    try {
      await submitResponse({
        requestId: id,
        ...formData
      })
      toast.success('Your response has been sent! ❤️')
      setTimeout(() => navigate('/requests'), 2000)
    } catch (error) {
      toast.error('Failed to send response')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return null
  
  if (!request) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mx-auto text-red-600">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Request Not Found</h2>
        <p className="text-slate-500 font-medium max-w-xs mx-auto">This request may have been fulfilled or deleted.</p>
        <button onClick={() => navigate('/requests')} className="px-8 py-3 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-500/20 hover:scale-105 transition">View All Requests</button>
      </div>
    </div>
  )

  const urgencyLevels = {
    'Critical': 'from-red-600 to-red-800',
    'High': 'from-orange-500 to-orange-700',
    'Normal': 'from-blue-500 to-blue-700'
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-6 mb-12">
          <button 
            onClick={() => navigate(-1)}
            className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-slate-100 bg-white text-slate-600 shadow-xl shadow-slate-200/50 transition-all hover:-translate-x-1 hover:bg-slate-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:shadow-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Respond to Request</h1>
            <p className="mt-1 text-slate-500 font-medium">Your contribution can save a life today.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Request Card */}
          <div className="lg:col-span-1">
            <div className={`bg-gradient-to-br ${urgencyLevels[request.priority] || urgencyLevels.Normal} rounded-[3rem] p-10 text-white shadow-2xl shadow-red-500/20 relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
              <div className="relative z-10">
                <span className="px-4 py-1.5 bg-white/20 text-[10px] font-black uppercase tracking-widest rounded-full">
                  {request.emergencyLevel || request.priority} Priority
                </span>
                <div className="mt-8 flex items-center gap-6">
                  <div className="w-20 h-20 rounded-[1.5rem] bg-white text-red-600 flex items-center justify-center text-3xl font-black shadow-lg">
                    {request.bloodGroup || request.bloodType}
                  </div>
                  <div>
                    <p className="text-sm font-bold opacity-80">Required Units</p>
                    <p className="text-3xl font-black">{request.unitsNeeded || request.quantity} Units</p>
                  </div>
                </div>

                <div className="mt-10 space-y-6">
                  <div className="flex gap-4">
                    <svg className="w-5 h-5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                    <p className="text-sm font-bold">{request.location || 'Hospital Direct'}</p>
                  </div>
                  <div className="flex gap-4">
                    <svg className="w-5 h-5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="text-sm font-bold">Needed by {new Date(request.dateRequired).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-white/10">
                  <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-2">Reason</p>
                  <p className="text-sm font-medium italic">"{request.reason}"</p>
                </div>
              </div>
            </div>
          </div>

          {/* Response Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-[3.5rem] p-12 border border-slate-100 dark:border-gray-700 shadow-2xl shadow-slate-200/50 dark:shadow-none space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Contact Number</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    required
                    value={formData.contactNumber}
                    onChange={handleChange}
                    placeholder="e.g. +91 9876543210"
                    className="w-full px-6 py-5 bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-700 rounded-2xl font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-red-500 transition-all"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Arrival Time</label>
                  <select
                    name="arrivalTime"
                    value={formData.arrivalTime}
                    onChange={handleChange}
                    className="w-full px-6 py-5 bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-700 rounded-2xl font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-red-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="15">Within 15 mins</option>
                    <option value="30">Within 30 mins</option>
                    <option value="60">Within 1 hour</option>
                    <option value="120">Within 2 hours</option>
                    <option value="later">Sometime today</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Message to Hospital</label>
                <textarea
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="I can be there in 30 minutes, I have the required blood group..."
                  className="w-full px-6 py-5 bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-700 rounded-2xl font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none"
                />
              </div>

              <div className="flex items-center gap-5 p-8 bg-red-50 dark:bg-red-950/20 rounded-[2rem] border border-red-100 dark:border-red-900/30">
                <input 
                  type="checkbox"
                  name="available"
                  required
                  checked={formData.available}
                  onChange={handleChange}
                  className="w-6 h-6 rounded-lg text-red-600 focus:ring-red-500 border-red-300"
                />
                <p className="text-sm font-black text-red-900 dark:text-red-200 leading-tight">
                  I confirm that I am available to fulfill this request and meet the health criteria for donation.
                </p>
              </div>

              <LoadingButton
                type="submit"
                loading={isSubmitting}
                loadingText="Sending Response..."
                className="w-full py-6 rounded-[2rem] bg-slate-900 dark:bg-red-600 text-xl font-black text-white shadow-2xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Send Response Now
              </LoadingButton>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

