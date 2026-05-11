import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from './AuthLayout.jsx'
import LoadingButton from './ui/LoadingButton.jsx'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
  const [form, setForm] = useState({
    role: 'donor',
    name: '',
    email: '',
    password: '',
    location: '',
    bloodGroup: 'A+'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [errorMsg, setErrorMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Full name or organization name is required'
    if (!form.email.trim()) next.email = 'Email address is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) next.email = 'Please enter a valid email'
    if (!form.password) next.password = 'Password is required'
    else if (form.password.length < 6) next.password = 'Password must be at least 6 characters'
    if (!form.location.trim()) next.location = 'Location details are required'
    if (form.role === 'donor' && !form.bloodGroup) next.bloodGroup = 'Blood group is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    
    setIsSubmitting(true)
    setErrorMsg('')
    
    try {
      const result = await register(form)
      if (result.success) {
        toast.success(`Registration successful! Welcome to the LifeLink Network.`)
        navigate('/login')
      } else {
        toast.error(result.error || 'Registration failed. Please try again.')
        setErrorMsg(result.error || 'Registration failed. Please try again.')
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout 
      title="Join the Network" 
      subtitle="Create your professional profile to start coordinating life-saving blood donations and requests."
    >
      {errorMsg && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p>{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2 ml-1">Account Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full rounded-2xl bg-slate-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-red-500 focus:bg-white dark:focus:bg-gray-800 px-4 py-3.5 text-sm text-slate-900 dark:text-white outline-none transition-all"
          >
            <option value="donor">Individual Donor</option>
            <option value="hospital">Hospital / Medical Center</option>
            <option value="admin">System Administrator</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2 ml-1">
              {form.role === 'donor' ? 'Full Name' : 'Organization Name'}
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={`w-full rounded-2xl bg-slate-50 dark:bg-gray-800/50 border-2 px-4 py-3.5 text-sm outline-none transition-all ${
                errors.name ? 'border-red-500 bg-red-50/30' : 'border-transparent focus:border-red-500 focus:bg-white dark:focus:bg-gray-800'
              } dark:text-white`}
              placeholder={form.role === 'donor' ? 'John Doe' : 'City General Hospital'}
            />
            {errors.name && <p className="mt-2 text-xs font-medium text-red-600 ml-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2 ml-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={`w-full rounded-2xl bg-slate-50 dark:bg-gray-800/50 border-2 px-4 py-3.5 text-sm outline-none transition-all ${
                errors.email ? 'border-red-500 bg-red-50/30' : 'border-transparent focus:border-red-500 focus:bg-white dark:focus:bg-gray-800'
              } dark:text-white`}
              placeholder="name@example.com"
            />
            {errors.email && <p className="mt-2 text-xs font-medium text-red-600 ml-1">{errors.email}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2 ml-1">Secure Password</label>
          <div className="relative group">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              className={`w-full rounded-2xl bg-slate-50 dark:bg-gray-800/50 border-2 px-4 py-3.5 text-sm outline-none transition-all ${
                errors.password ? 'border-red-500 bg-red-50/30' : 'border-transparent focus:border-red-500 focus:bg-white dark:focus:bg-gray-800'
              } dark:text-white`}
              placeholder="Minimum 6 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-gray-200"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
            </button>
          </div>
          {errors.password && <p className="mt-2 text-xs font-medium text-red-600 ml-1">{errors.password}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2 ml-1">Office/Home Location</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              className={`w-full rounded-2xl bg-slate-50 dark:bg-gray-800/50 border-2 px-4 py-3.5 text-sm outline-none transition-all ${
                errors.location ? 'border-red-500 bg-red-50/30' : 'border-transparent focus:border-red-500 focus:bg-white dark:focus:bg-gray-800'
              } dark:text-white`}
              placeholder="City, Region"
            />
            {errors.location && <p className="mt-2 text-xs font-medium text-red-600 ml-1">{errors.location}</p>}
          </div>

          {form.role === 'donor' && (
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2 ml-1">Blood Group</label>
              <select
                name="bloodGroup"
                value={form.bloodGroup}
                onChange={handleChange}
                className="w-full rounded-2xl bg-slate-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-red-500 focus:bg-white dark:focus:bg-gray-800 px-4 py-3.5 text-sm text-slate-900 dark:text-white outline-none transition-all"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <LoadingButton
          type="submit"
          loading={isSubmitting}
          loadingText="Creating Account..."
          className="w-full mt-4"
        >
          Register Account
        </LoadingButton>

        <p className="text-center text-sm text-slate-600 dark:text-gray-400">
          Already a member?{' '}
          <Link to="/login" className="font-bold text-red-600 hover:text-red-700 transition-colors">
            Login to Workspace
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
