import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createCamp } from '../api/campsApi'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'
import LoadingButton from './ui/LoadingButton.jsx'

export default function CreateCamp() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    startTime: '',
    endTime: '',
    capacity: 50,
    bannerImage: '',
    organizerId: user?._id,
    healthCheckup: false
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createCamp(formData)
      toast.success('Donation Camp hosted successfully!')
      navigate('/camps')
    } catch (error) {
      toast.error('Failed to create camp: ' + (error.response?.data?.message || error.message))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-6 mb-12">
          <button 
            onClick={() => navigate(-1)}
            className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-slate-100 bg-white text-slate-600 shadow-xl shadow-slate-200/50 transition-all hover:-translate-x-1 hover:bg-slate-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:shadow-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Host Donation Camp</h1>
            <p className="mt-1 text-slate-500 font-medium">Empower your community through organized donation drives.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-[3rem] border border-slate-100 dark:border-gray-700 p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Title */}
            <div className="md:col-span-2 space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Camp Title</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Annual City Blood Drive 2024"
                className="w-full px-6 py-4 bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-700 rounded-2xl font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-red-500 transition-all"
              />
            </div>

            {/* Banner URL */}
            <div className="md:col-span-2 space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Banner Image URL</label>
              <input
                type="url"
                name="bannerImage"
                value={formData.bannerImage}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-6 py-4 bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-700 rounded-2xl font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-red-500 transition-all"
              />
            </div>

            {/* Location */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder="Full address or venue name"
                className="w-full px-6 py-4 bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-700 rounded-2xl font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-red-500 transition-all"
              />
            </div>

            {/* Capacity */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Donor Capacity</label>
              <input
                type="number"
                name="capacity"
                required
                min="1"
                value={formData.capacity}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-700 rounded-2xl font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-red-500 transition-all"
              />
            </div>

            {/* Date */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Event Date</label>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-700 rounded-2xl font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-red-500 transition-all"
              />
            </div>

            {/* Time Slot */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Start</label>
                <input
                  type="time"
                  name="startTime"
                  required
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-700 rounded-2xl font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-red-500 transition-all"
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">End</label>
                <input
                  type="time"
                  name="endTime"
                  required
                  value={formData.endTime}
                  onChange={handleChange}
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-700 rounded-2xl font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-red-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Campaign Description</label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="What should donors know about this camp?"
              className="w-full px-6 py-4 bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-700 rounded-2xl font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none"
            />
          </div>

          <div className="flex items-center gap-4 p-6 bg-slate-50 dark:bg-gray-900 rounded-3xl">
            <input 
              type="checkbox"
              name="healthCheckup"
              checked={formData.healthCheckup}
              onChange={handleChange}
              className="w-6 h-6 rounded-lg text-red-600 focus:ring-red-500 border-slate-300"
            />
            <div className="flex flex-col">
              <span className="text-sm font-black text-slate-900 dark:text-white">Include Free Health Checkup</span>
              <span className="text-xs font-medium text-slate-500">Provide vitals and basic screening for all donors.</span>
            </div>
          </div>

          <LoadingButton
            type="submit"
            loading={isSubmitting}
            loadingText="Creating Campaign..."
            className="w-full py-6 rounded-[2rem] bg-red-600 text-xl font-black text-white shadow-2xl shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Launch Donation Camp
          </LoadingButton>
        </form>
      </div>
    </div>
  )
}

