import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createCamp } from '../api/campsApi'

export default function CreateCamp() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    type: 'Blood Donation',
    location: '',
    date: '',
    time: '',
    organizer: '',
    contact: '',
    description: '',
    maxParticipants: ''
  })

  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = 'Camp name is required'
    if (!formData.location.trim()) newErrors.location = 'Location is required'
    if (!formData.date) newErrors.date = 'Date is required'
    if (!formData.time) newErrors.time = 'Time is required'
    if (!formData.organizer.trim()) newErrors.organizer = 'Organizer name is required'
    if (!formData.contact.trim()) newErrors.contact = 'Contact is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.maxParticipants) newErrors.maxParticipants = 'Max participants is required'
    if (formData.maxParticipants && parseInt(formData.maxParticipants) < 1) {
      newErrors.maxParticipants = 'Max participants must be at least 1'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      try {
        await createCamp(formData)
        alert('Camp created successfully!')
        navigate('/camps')
      } catch (error) {
        alert('Failed to create camp: ' + error.error)
      }
    }
  }

  return (
    <div className="px-3 pb-8 sm:px-4 md:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4 sm:mb-8">
          <button
            onClick={() => navigate('/camps')}
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-100 transition shadow-sm"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Create New Camp</h1>
            <p className="mt-1 text-sm text-slate-600">Fill in the details to create a new camp</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            {/* Camp Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-900">Camp Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Summer Blood Donation Drive"
                className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 ${
                  errors.name
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                    : 'border-slate-300 focus:border-red-500 focus:ring-red-500/10'
                }`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>

            {/* Camp Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-900">Camp Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
              >
                <option value="Blood Donation">Blood Donation</option>
                <option value="Health Checkup">Health Checkup</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-slate-900">Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Downtown Community Center"
                className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 ${
                  errors.location
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                    : 'border-slate-300 focus:border-red-500 focus:ring-red-500/10'
                }`}
              />
              {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location}</p>}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-900">Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 ${
                  errors.date
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                    : 'border-slate-300 focus:border-red-500 focus:ring-red-500/10'
                }`}
              />
              {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-semibold text-slate-900">Time *</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 ${
                  errors.time
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                    : 'border-slate-300 focus:border-red-500 focus:ring-red-500/10'
                }`}
              />
              {errors.time && <p className="mt-1 text-xs text-red-600">{errors.time}</p>}
            </div>

            {/* Organizer */}
            <div>
              <label className="block text-sm font-semibold text-slate-900">Organizer Name *</label>
              <input
                type="text"
                name="organizer"
                value={formData.organizer}
                onChange={handleChange}
                placeholder="e.g., Red Cross"
                className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 ${
                  errors.organizer
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                    : 'border-slate-300 focus:border-red-500 focus:ring-red-500/10'
                }`}
              />
              {errors.organizer && <p className="mt-1 text-xs text-red-600">{errors.organizer}</p>}
            </div>

            {/* Contact */}
            <div>
              <label className="block text-sm font-semibold text-slate-900">Contact Number *</label>
              <input
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="e.g., +1 (555) 123-4567"
                className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 ${
                  errors.contact
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                    : 'border-slate-300 focus:border-red-500 focus:ring-red-500/10'
                }`}
              />
              {errors.contact && <p className="mt-1 text-xs text-red-600">{errors.contact}</p>}
            </div>

            {/* Max Participants */}
            <div>
              <label className="block text-sm font-semibold text-slate-900">Max Participants *</label>
              <input
                type="number"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleChange}
                placeholder="e.g., 100"
                min="1"
                className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 ${
                  errors.maxParticipants
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                    : 'border-slate-300 focus:border-red-500 focus:ring-red-500/10'
                }`}
              />
              {errors.maxParticipants && <p className="mt-1 text-xs text-red-600">{errors.maxParticipants}</p>}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-900">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the camp details and objectives..."
                rows="4"
                className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 resize-none ${
                  errors.description
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                    : 'border-slate-300 focus:border-red-500 focus:ring-red-500/10'
                }`}
              />
              {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex gap-3 border-t border-slate-200 pt-6 sm:gap-4">
            <button
              type="button"
              onClick={() => navigate('/camps')}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Create Camp
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
