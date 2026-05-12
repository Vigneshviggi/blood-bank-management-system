import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Loader2, RefreshCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(30);
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  const email = sessionStorage.getItem('resetEmail');

  useEffect(() => {
    if (!email) {
      toast.error('Session expired');
      navigate('/forgot-password');
    }

    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [email, navigate]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setResending(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, { email });
      toast.success('New OTP sent to your email');
      setTimer(30);
    } catch (error) {
      toast.error('Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 6) return toast.error('Please enter complete OTP');

    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/verify-otp`, {
        email,
        otp: otpString
      });
      toast.success('OTP verified successfully');
      sessionStorage.setItem('verifiedOTP', otpString);
      navigate('/reset-password');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-gray-700 dark:bg-gray-800"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Verify Account</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
            We've sent a 6-digit code to <span className="font-bold text-slate-900 dark:text-white">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="h-12 w-12 rounded-xl border-2 border-slate-100 bg-slate-50 text-center text-lg font-bold outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-700 disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify OTP'}
            {!loading && <ArrowRight className="h-5 w-5" />}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Didn't receive the code?{' '}
            <button
              onClick={handleResend}
              disabled={timer > 0 || resending}
              className="font-bold text-red-600 hover:text-red-700 disabled:text-slate-400 flex items-center gap-1 mx-auto mt-2"
            >
              {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
              {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOTP;
