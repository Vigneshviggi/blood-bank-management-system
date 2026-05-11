import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from './AuthLayout.jsx'
import LoadingButton from './ui/LoadingButton.jsx'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [errorMsg, setErrorMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const next = {}
    if (!form.email.trim()) next.email = 'Email address is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) next.email = 'Please enter a valid email'
    if (!form.password) next.password = 'Password is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    
    setIsSubmitting(true)
    setErrorMsg('')
    
    try {
      const result = await login(form.email, form.password)
      if (result.success) {
        toast.success('Welcome back' + (result.user?.name ? `, ${result.user.name}` : '') + '!')
        navigate('/')
      } else {
        toast.error(result.error || 'Invalid credentials. Please try again.')
        setErrorMsg(result.error || 'Invalid credentials. Please try again.')
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout 
      title="Professional Login" 
      subtitle="Access the LifeLink management dashboard to coordinate critical blood supplies and donor relations."
    >
      {errorMsg && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 animate-shake">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p>{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2 ml-1">Email Address</label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
            </div>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={`w-full rounded-2xl bg-slate-50 dark:bg-gray-800/50 border-2 pl-12 pr-4 py-3.5 text-sm outline-none transition-all ${
                errors.email 
                ? 'border-red-500 bg-red-50/30' 
                : 'border-transparent focus:border-red-500 focus:bg-white dark:focus:bg-gray-800'
              } dark:text-white`}
              placeholder="name@organization.com"
            />
          </div>
          {errors.email && <p className="mt-2 text-xs font-medium text-red-600 ml-1">{errors.email}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2 ml-1">
            <label className="block text-sm font-bold text-slate-700 dark:text-gray-300">Password</label>
            <Link to="/forgot-password" size="sm" className="text-xs font-semibold text-red-600 hover:text-red-700">Forgot Password?</Link>
          </div>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              className={`w-full rounded-2xl bg-slate-50 dark:bg-gray-800/50 border-2 pl-12 pr-12 py-3.5 text-sm outline-none transition-all ${
                errors.password 
                ? 'border-red-500 bg-red-50/30' 
                : 'border-transparent focus:border-red-500 focus:bg-white dark:focus:bg-gray-800'
              } dark:text-white`}
              placeholder="••••••••"
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

        <LoadingButton
          type="submit"
          loading={isSubmitting}
          loadingText="Authenticating..."
          className="w-full"
        >
          Sign In to Dashboard
        </LoadingButton>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-gray-800"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-gray-900 px-2 text-slate-500 dark:text-gray-400">Or continue as guest</span></div>
        </div>

        <p className="text-center text-sm text-slate-600 dark:text-gray-400">
          New to the network?{' '}
          <Link to="/register" className="font-bold text-red-600 hover:text-red-700 transition-colors">
            Create Professional Account
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
