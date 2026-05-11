import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import axios from "axios";
export default function ContactSupport() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Query',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const next = {}
    if (!formData.name.trim()) next.name = 'Name is required'
    if (!formData.email.trim()) next.email = 'Email is required'
    if (!formData.message.trim()) next.message = 'Message is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  // const handleSubmit = (e) => {
  //   e.preventDefault()
  //   if (!validate()) return
    
  //   console.log('Support ticket submitted:', formData)
  //   setSubmitted(true)
    
  //   setTimeout(() => {
  //     navigate('/')
  //   }, 3000)
  // }

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) return;

  try {
    await axios.post("http://localhost:5000/contact-support", formData);

    setSubmitted(true);

    setTimeout(() => {
      navigate('/');
    }, 3000);

  } catch (error) {
    console.error(error);
    alert("Failed to send message ❌");
  }
};

  return (
    <div className="px-3 pb-8 sm:px-4 md:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-all duration-200 ease-in-out hover:scale-105"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-slate-900">Contact Support</h1>
          <p className="mt-2 text-slate-600">We're here to help. Send us a message and we'll respond as soon as possible.</p>
        </div>

        {submitted ? (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center sm:p-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-green-900">Thank you!</h2>
            <p className="mt-2 text-sm text-green-700">
              Your support ticket has been submitted successfully. We'll get back to you within 24 hours.
            </p>
            <p className="mt-4 text-xs text-green-600">Redirecting to home...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            {/* Name */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/10 ${
                  errors.name ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/10 ${
                  errors.email ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            {/* Subject */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Subject
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
              >
                <option>General Query</option>
                <option>Blood Request Issue</option>
                <option>Technical Issue</option>
                <option>Account Issue</option>
                <option>Donation Concern</option>
                <option>Other</option>
              </select>
            </div>

            {/* Message */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Message <span className="text-red-600">*</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Describe your issue or question..."
                rows="6"
                className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/10 resize-none ${
                  errors.message ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
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
                Send Message
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
