import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { KeyRound, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes
  const navigate = useNavigate();
  const email = sessionStorage.getItem('resetEmail');

  useEffect(() => {
    if (!email) {
      toast.error('Session expired, please try again');
      navigate('/forgot-password');
      return;
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

    // Auto focus next
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length < 6) return toast.error('Please enter complete 6-digit OTP');

    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/verify-otp`, { email, otp: otpValue });
      sessionStorage.setItem('verifiedOTP', otpValue);
      toast.success('OTP Verified Successfully');
      navigate('/reset-password');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, { email });
      setTimer(300);
      toast.success('New OTP sent to your email');
    } catch (error) {
      toast.error('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
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
            <KeyRound className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Verify OTP</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
            Enter the 6-digit code sent to <span className="font-semibold text-slate-900 dark:text-white">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 text-center text-lg font-bold outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            ))}
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-500">
              Code expires in: <span className={`font-bold ${timer < 60 ? 'text-red-500' : 'text-slate-700 dark:text-white'}`}>{formatTime(timer)}</span>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || timer === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-700 disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify & Proceed'}
            {!loading && <ArrowRight className="h-5 w-5" />}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={resendOTP}
            disabled={loading || timer > 240}
            className="flex items-center justify-center gap-2 mx-auto text-sm font-semibold text-red-600 hover:text-red-700 disabled:text-slate-400"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Resend Code {timer > 240 && `(${timer - 240}s)`}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOTP;
