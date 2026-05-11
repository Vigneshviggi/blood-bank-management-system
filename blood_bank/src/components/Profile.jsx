import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import axios from 'axios'
import Card from './Card.jsx'
import LoadingButton from './ui/LoadingButton.jsx'


export default function Profile() {
  const navigate = useNavigate()
  const { user, updateProfile: updateContextProfile } = useAuth()

  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '+1 (555) 000-0000',
    bloodGroup: user?.bloodGroup || 'O+',
    location: user?.location || '',
    bio: user?.bio || 'Dedicated LifeLink member.',
    imageUrl: user?.imageUrl || '',
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '+1 (555) 000-0000',
        bloodGroup: user.bloodGroup || 'O+',
        location: user.location || '',
        bio: user.bio || 'Dedicated LifeLink member.',
        imageUrl: user.imageUrl || '',
      })
    }
  }, [user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  }

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await axios.put(`http://localhost:5000/api/users/${user._id}`, formData);
      updateContextProfile(response.data);
      setIsEditing(false)
      alert('Profile updated successfully!')
    } catch (error) {
      alert('Failed to update profile: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  }

  const donationStats = [
    { label: 'Total Donations', value: '12', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>, color: 'text-red-600' },
    { label: 'Lives Impacted', value: '36', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>, color: 'text-rose-600' },
    { label: 'Reliability', value: '4.9', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>, color: 'text-amber-500' },
  ]

  const recentActivity = [
    { type: 'Donation', date: '2026-04-15', location: 'City Hospital', units: '1 Unit' },
    { type: 'Donation', date: '2026-02-20', location: 'Red Cross Center', units: '1 Unit' },
    { type: 'Account', date: '2026-01-10', location: 'Profile Created', units: '-' },
  ]

  return (
    <div className="px-4 pb-12 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="mx-auto max-w-5xl">
        {/* Header with Back Button */}
        <div className="mb-8 flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Profile Settings</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manage your network identity</p>
          </div>
        </div>

        {/* Profile Hero */}
        <div className="relative mb-8 overflow-hidden rounded-[2.5rem] bg-slate-900 px-6 py-12 text-white shadow-2xl dark:bg-black/40 sm:px-12 sm:py-20">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-600/20 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-rose-600/10 blur-3xl" />
          
          <div className="relative flex flex-col items-center gap-8 sm:flex-row sm:text-left">
            <div className="group relative">
              <input 
                type="file" 
                id="profile-upload" 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
              />
              <div 
                onClick={() => document.getElementById('profile-upload').click()}
                className="h-32 w-32 overflow-hidden rounded-[2rem] border-4 border-white/10 bg-gradient-to-br from-red-500 to-rose-600 shadow-2xl transition-transform duration-500 group-hover:scale-105 sm:h-40 sm:w-40 cursor-pointer relative"
              >
                {formData.imageUrl ? (
                  <img src={formData.imageUrl} alt={formData.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-5xl font-bold">
                    {formData.name[0]?.toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Change Photo</span>
                </div>
              </div>
              <button 
                onClick={() => document.getElementById('profile-upload').click()}
                className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-900 shadow-lg transition-transform hover:scale-110"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-4xl font-bold sm:text-5xl">{formData.name}</h1>
                <p className="mt-2 text-rose-100/60 font-medium tracking-widest uppercase text-xs">{user?.role || 'Member'}</p>
              </div>
              <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-2 backdrop-blur-sm">
                  <span className="text-lg font-bold text-red-500">{formData.bloodGroup}</span>
                  <span className="text-xs font-bold text-white/40 uppercase">Group</span>
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-2 backdrop-blur-sm">
                  <span className="text-lg font-bold text-emerald-500">Active</span>
                  <span className="text-xs font-bold text-white/40 uppercase">Status</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`rounded-2xl px-8 py-4 text-sm font-bold transition-all active:scale-95 ${
                isEditing ? 'bg-white text-slate-900' : 'bg-red-600 text-white shadow-lg shadow-red-500/40 hover:bg-red-700'
              }`}
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Stats Bar */}
          <div className="lg:col-span-1 space-y-6">
            <Card title="Impact" subtitle="Your contribution to the network.">
              <div className="space-y-6 pt-4">
                {donationStats.map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{stat.icon}</span>
                      <p className="text-sm font-bold text-slate-500 dark:text-gray-400">{stat.label}</p>
                    </div>
                    <span className={`text-xl font-bold ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Quick Info">
               <div className="space-y-4 pt-2">
                 <div className="flex flex-col">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</span>
                   <span className="text-sm font-bold text-slate-900 dark:text-white">{formData.location || 'Not set'}</span>
                 </div>
                 <div className="flex flex-col">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</span>
                   <span className="text-sm font-bold text-slate-900 dark:text-white">{formData.phone}</span>
                 </div>
                 <div className="flex flex-col">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Join Date</span>
                   <span className="text-sm font-bold text-slate-900 dark:text-white">January 2026</span>
                 </div>
               </div>
            </Card>
          </div>

          {/* Main Area */}
          <div className="lg:col-span-2 space-y-8">
            {isEditing ? (
              <Card title="Edit Information" subtitle="Update your personal details.">
                <div className="grid gap-6 py-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Full Name</label>
                    <input name="name" value={formData.name} onChange={handleInputChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-red-500 dark:border-gray-800 dark:bg-gray-800/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Email</label>
                    <input name="email" value={formData.email} readOnly className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-500 outline-none cursor-not-allowed dark:border-gray-800 dark:bg-gray-800" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Blood Group</label>
                    <select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-red-500 dark:border-gray-800 dark:bg-gray-800/50">
                      {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Location</label>
                    <input name="location" value={formData.location} onChange={handleInputChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-red-500 dark:border-gray-800 dark:bg-gray-800/50" />
                  </div>
                  <div className="col-span-full space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Bio / Description</label>
                    <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows={3} className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-red-500 dark:border-gray-800 dark:bg-gray-800/50" />
                  </div>
                  <LoadingButton 
                    onClick={handleSave} 
                    loading={loading} 
                    loadingText="Updating Profile..."
                    className="col-span-full shadow-xl shadow-red-500/20"
                  >
                    Update Profile Details
                  </LoadingButton>

                </div>
              </Card>
            ) : (
              <div className="space-y-8">
                <Card title="Personal Story" subtitle="A brief about your journey with LifeLink.">
                   <p className="mt-4 text-slate-600 dark:text-gray-400 leading-relaxed italic">
                     "{formData.bio}"
                   </p>
                </Card>

                <Card title="Recent Activity" subtitle="Your latest interactions with the network.">
                  <div className="mt-6 space-y-4">
                    {recentActivity.map((activity, i) => (
                      <div key={i} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/30">
                        <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold ${
                            activity.type === 'Donation' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {activity.type === 'Donation' ? 'D' : 'A'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{activity.location}</p>
                            <p className="text-xs text-slate-500">{new Date(activity.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{activity.units}</span>
                      </div>
                    ))}
                  </div>
                  <button className="mt-6 w-full text-center text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-red-600 transition">View Full History</button>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
