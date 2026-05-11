import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { submitContactMessage } from '../api/contactApi'

const initialContact = {
  name: '',
  email: '',
  phone: '',
  subject: 'General Query',
  message: ''
}

const contactInfo = [
  { 
    id: 'address', 
    label: 'Headquarters', 
    value: '123 LifeLink Hospital Rd, Downtown City', 
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    color: 'bg-red-50 text-red-600'
  },
  { 
    id: 'phone', 
    label: 'Call Us', 
    value: '+1 (555) 987-6543', 
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
    color: 'bg-blue-50 text-blue-600'
  },
  { 
    id: 'email', 
    label: 'Email Support', 
    value: 'support@lifelink.org', 
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    color: 'bg-emerald-50 text-emerald-600'
  },
  { 
    id: 'hours', 
    label: 'Operating Hours', 
    value: 'Mon - Fri: 8:00 AM - 8:00 PM', 
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    color: 'bg-amber-50 text-amber-600'
  }
]

export default function Contact() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(initialContact)
  const [loading, setLoading] = useState(false)
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await submitContactMessage(formData)
      alert('Message sent successfully! Our team will get back to you shortly.')
      setFormData(initialContact)
    } catch (error) {
      alert('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 pb-12 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="mx-auto max-w-7xl">
        {/* Back Button */}
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
        </div>

        {/* Hero Section */}
        <div className="relative mb-12 overflow-hidden rounded-[2.5rem] bg-slate-900 px-6 py-12 text-white shadow-2xl dark:bg-black/40 sm:px-12 sm:py-20">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-600/20 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />
          
          <div className="relative z-10 max-w-3xl">
            <span className="inline-block rounded-full bg-red-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-red-500 backdrop-blur-md">Contact Us</span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">Get in touch with the <span className="text-red-500">LifeLink</span> team.</h1>
            <p className="mt-6 text-lg text-slate-400 leading-relaxed">
              Whether you're a donor, hospital coordinator, or volunteer, we're here to support your mission in saving lives.
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Contact Form */}
          <div className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none sm:p-10">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Send a Message</h2>
            <p className="mt-2 text-slate-500 dark:text-gray-400">We typically respond within 2-4 business hours.</p>

            <form onSubmit={handleSubmit} className="mt-10 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Name</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full rounded-2xl border bg-slate-50/50 px-4 py-4 text-sm font-medium outline-none transition focus:ring-4 dark:bg-gray-800/50 ${
                      errors.name ? 'border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-red-500 focus:ring-red-500/5'
                    }`}
                    placeholder="John Doe"
                  />
                  {errors.name && <p className="text-[10px] font-bold text-red-500 uppercase">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full rounded-2xl border bg-slate-50/50 px-4 py-4 text-sm font-medium outline-none transition focus:ring-4 dark:bg-gray-800/50 ${
                      errors.email ? 'border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-red-500 focus:ring-red-500/5'
                    }`}
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="text-[10px] font-bold text-red-500 uppercase">{errors.email}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Subject</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-4 text-sm font-medium outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/5 dark:bg-gray-800/50"
                >
                  <option>General Query</option>
                  <option>Emergency Blood Need</option>
                  <option>Hospital Partnership</option>
                  <option>Technical Support</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className={`w-full rounded-2xl border bg-slate-50/50 px-4 py-4 text-sm font-medium outline-none transition focus:ring-4 dark:bg-gray-800/50 ${
                    errors.message ? 'border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-red-500 focus:ring-red-500/5'
                  }`}
                  placeholder="How can we help you today?"
                />
                {errors.message && <p className="text-[10px] font-bold text-red-500 uppercase">{errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-red-600 py-5 font-bold text-white shadow-xl shadow-red-500/30 transition hover:bg-red-700 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
              >
                {loading ? 'Sending Message...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Info & Map */}
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2">
              {contactInfo.map((info) => (
                <div key={info.id} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-200/40 dark:border-gray-800 dark:bg-gray-900/50 dark:shadow-none">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${info.color}`}>
                    {info.icon}
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-slate-400 uppercase tracking-widest">{info.label}</h3>
                  <p className="mt-2 font-bold text-slate-900 dark:text-white leading-tight">{info.value}</p>
                </div>
              ))}
            </div>

            <div className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white p-4 shadow-xl shadow-slate-200/50 dark:border-gray-800 dark:bg-gray-900/50 dark:shadow-none">
              <div className="relative h-[360px] w-full overflow-hidden rounded-[2rem]">
                <iframe
                  title="LifeLink Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d24156.22276181398!2d-74.0059413!3d40.7127837!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzXCsDQyJzQ2LjAiTiA3NMKwMDAnMDcuMCJX!5e0!3m2!1sen!2sus!4v1700000000000"
                  className="absolute inset-0 h-full w-full border-0 grayscale hover:grayscale-0 transition-all duration-700"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="rounded-3xl bg-slate-900 p-8 text-white">
              <h3 className="text-xl font-bold">Emergency Hotline</h3>
              <p className="mt-2 text-slate-400">For immediate life-threatening situations, please call our 24/7 dispatcher.</p>
              <a href="tel:911" className="mt-6 inline-flex items-center gap-3 text-2xl font-black text-red-500 hover:text-red-400 transition">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                1-800-LIFELINK
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
