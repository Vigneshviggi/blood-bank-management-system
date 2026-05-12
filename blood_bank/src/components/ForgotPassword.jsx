import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email address');

    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, { email });
      toast.success(response.data.message);
      sessionStorage.setItem('resetEmail', email);
      navigate('/verify-otp');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-gray-700 dark:bg-gray-800"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
            <Mail className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Forgot Password?</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
            Enter your registered email address below and we'll send you a 6-digit OTP to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300">Email Address</label>
            <div className="relative mt-2">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-700 disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send OTP'}
            {!loading && <ArrowRight className="h-5 w-5" />}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/login" className="text-sm font-semibold text-red-600 hover:text-red-700">
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
