import React, { useState } from 'react';
import { registerUser } from '../api/userApi';
import { useNavigate } from 'react-router-dom';
import Card from './Card.jsx';

const initialState = {
  name: '',
  email: '',
  phone: '',
  password: '',
  role: 'donor',
  bloodGroup: '',
  location: ''
};

const RegisterUser = () => {
  const [form, setForm] = useState(initialState);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      const res = await registerUser(form);
      setMessage(res.message || 'New user registered successfully!');
      setTimeout(() => navigate('/user-list'), 1500);
    } catch (err) {
      setError(err.error || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 pb-12 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Add New Member</h1>
            <p className="mt-2 text-slate-600 dark:text-gray-400">Expand the LifeLink community network</p>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-600 dark:bg-emerald-900/20 flex items-center gap-3">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
             {message}
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-600 dark:bg-red-900/20 flex items-center gap-3">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             {error}
          </div>
        )}

        <Card className="shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-gray-300">Full Name</label>
                <input 
                  name="name" 
                  value={form.name} 
                  onChange={handleChange} 
                  placeholder="John Doe" 
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/5 dark:border-gray-800 dark:bg-gray-800/50" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-gray-300">Email Address</label>
                <input 
                  name="email" 
                  value={form.email} 
                  onChange={handleChange} 
                  placeholder="john@lifelink.org" 
                  type="email" 
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/5 dark:border-gray-800 dark:bg-gray-800/50" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-gray-300">Phone Number</label>
                <input 
                  name="phone" 
                  value={form.phone} 
                  onChange={handleChange} 
                  placeholder="10-digit number" 
                  type="tel" 
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/5 dark:border-gray-800 dark:bg-gray-800/50" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-gray-300">Initial Password</label>
              <input 
                name="password" 
                value={form.password} 
                onChange={handleChange} 
                placeholder="••••••••" 
                type="password" 
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/5 dark:border-gray-800 dark:bg-gray-800/50" 
                required 
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-gray-300">Assign Role</label>
                <select 
                  name="role" 
                  value={form.role} 
                  onChange={handleChange} 
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/5 dark:border-gray-800 dark:bg-gray-800/50"
                >
                  <option value="donor">Volunteer Donor</option>
                  <option value="hospital">Hospital Staff</option>
                  <option value="admin">System Admin</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-gray-300">Blood Group</label>
                <select 
                  name="bloodGroup" 
                  value={form.bloodGroup} 
                  onChange={handleChange} 
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/5 dark:border-gray-800 dark:bg-gray-800/50"
                  required
                >
                  <option value="">Select Group</option>
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-gray-300">Service Location</label>
              <input 
                name="location" 
                value={form.location} 
                onChange={handleChange} 
                placeholder="City, Region" 
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/5 dark:border-gray-800 dark:bg-gray-800/50" 
                required 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full rounded-2xl bg-slate-900 py-4 text-sm font-bold text-white shadow-xl transition-all hover:bg-black active:scale-[0.98] disabled:opacity-50 dark:bg-red-600 dark:hover:bg-red-700"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Processing...
                </div>
              ) : 'Register New Member'}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default RegisterUser;
