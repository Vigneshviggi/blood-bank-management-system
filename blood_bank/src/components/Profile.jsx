import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import axios from 'axios'
import Card from './Card.jsx'
import LoadingButton from './ui/LoadingButton.jsx'
import toast from 'react-hot-toast'
import BackButton from './BackButton.jsx'
import { getCurrentCoordinates, reverseGeocode } from '../services/locationService'
import { io } from 'socket.io-client'

export default function Profile() {
  const navigate = useNavigate()
  const { user, updateProfile: updateContextProfile } = useAuth()

  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bloodGroup: user?.bloodGroup || 'O+',
    location: user?.location || '',
    bio: user?.bio || 'Dedicated LifeLink member.',
    imageUrl: user?.imageUrl || '',
    latitude: user?.latitude || '',
    longitude: user?.longitude || ''
  })

  // Sync state if context updates
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bloodGroup: user.bloodGroup || 'O+',
        location: user.location || '',
        bio: user.bio || 'Dedicated LifeLink member.',
        imageUrl: user.imageUrl || '',
        latitude: user.latitude || user.coordinates?.coordinates?.[1] || '',
        longitude: user.longitude || user.coordinates?.coordinates?.[0] || ''
      })
    }
  }, [user])

  // Socket.IO listener for real-time donor progress updates
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');

    const handleProgressUpdate = (data) => {
      const currentId = user?._id || user?.id;
      if (data && data.userId && currentId && data.userId === currentId) {
        axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`)
          .then((res) => {
            if (res.data?.success && res.data.user) {
              updateContextProfile(res.data.user);
            }
          })
          .catch(() => {});
      }
    };

    socket.on('donor_progress_updated', handleProgressUpdate);
    return () => {
      socket.off('donor_progress_updated', handleProgressUpdate);
      socket.disconnect();
    };
  }, [user, updateContextProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleGetLocation = async () => {
    setGpsLoading(true)
    try {
      const coords = await getCurrentCoordinates()
      let readableLocation = `GPS (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`
      try {
        const address = await reverseGeocode(coords.latitude, coords.longitude)
        if (address) readableLocation = address
      } catch (_e) {}

      setFormData(prev => ({
        ...prev,
        latitude: coords.latitude,
        longitude: coords.longitude,
        location: readableLocation
      }))
      toast.success(`Location acquired: ${readableLocation}`)
    } catch (err) {
      toast.error(err.message || 'Unable to fetch current GPS location')
    } finally {
      setGpsLoading(false)
    }
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
      const payload = { ...formData };
      if (
        formData.latitude !== '' &&
        formData.longitude !== '' &&
        formData.latitude !== undefined &&
        formData.longitude !== undefined &&
        !isNaN(Number(formData.latitude)) &&
        !isNaN(Number(formData.longitude))
      ) {
        const lat = Number(formData.latitude);
        const lng = Number(formData.longitude);
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && !(lat === 0 && lng === 0)) {
          payload.latitude = lat;
          payload.longitude = lng;
          payload.coordinates = {
            type: 'Point',
            coordinates: [lng, lat]
          };
        }
      }
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/users/${user._id}`, payload);
      updateContextProfile(response.data);
      setIsEditing(false);
      toast.success('Profile and location updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  }

  // Database-driven progression metrics
  const donationsCount = user?.donationsCount ?? 0;
  const points = user?.points ?? 0;
  const donorLevel = user?.donorLevel || (points >= 2000 ? 6 : points >= 1000 ? 5 : points >= 500 ? 4 : points >= 250 ? 3 : points >= 100 ? 2 : 1);
  const donorRank = user?.donorRank || (donorLevel >= 6 ? 'LifeLink Champion' : donorLevel >= 5 ? 'Life Saver' : donorLevel >= 4 ? 'Dedicated Donor' : donorLevel >= 3 ? 'Regular Donor' : donorLevel >= 2 ? 'Active Donor' : 'New Donor');
  const nextLevelXp = user?.nextLevelXp || (donorLevel === 1 ? 100 : donorLevel === 2 ? 250 : donorLevel === 3 ? 500 : donorLevel === 4 ? 1000 : donorLevel === 5 ? 2000 : null);
  const currentLevelMin = user?.currentLevelMin || (donorLevel === 1 ? 0 : donorLevel === 2 ? 100 : donorLevel === 3 ? 250 : donorLevel === 4 ? 500 : donorLevel === 5 ? 1000 : 2000);
  const pointsNeeded = nextLevelXp ? Math.max(0, nextLevelXp - points) : 0;
  const progressPercent = nextLevelXp ? Math.min(100, Math.max(0, Math.round(((points - currentLevelMin) / (nextLevelXp - currentLevelMin)) * 100))) : 100;
  const achievements = user?.achievements || [];

  const donationStats = [
    { label: 'Completed Donations', value: donationsCount, icon: '🩸', color: 'text-red-600' },
    { label: 'Total Impact XP', value: `${points} XP`, icon: '⚡', color: 'text-rose-600' },
    { label: 'Donor Rank', value: donorRank, icon: '⭐', color: 'text-amber-500' },
  ]

  return (
    <div className="px-4 pb-12 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="mx-auto max-w-5xl">
        {/* Header with Back Button */}
        <div className="mb-8 flex items-center gap-6">
          <BackButton />
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
                  <span className="text-lg font-bold text-amber-400">Level {donorLevel}</span>
                  <span className="text-xs font-bold text-white/40 uppercase">{donorRank}</span>
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-2 backdrop-blur-sm">
                  <span className="text-lg font-bold text-emerald-500">{points} XP</span>
                  <span className="text-xs font-bold text-white/40 uppercase">Score</span>
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
          {/* Left Column: Stats & Progression */}
          <div className="lg:col-span-1 space-y-6">
            {/* Real Progression Card */}
            <Card title={`Donor Level ${donorLevel}`} subtitle={donorRank}>
              <div className="space-y-4 pt-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600 dark:text-gray-300">{points} XP Earned</span>
                  <span className="text-slate-400">{nextLevelXp ? `${points} / ${nextLevelXp} XP` : 'Max Level'}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/50 dark:border-gray-700">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-rose-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-[11px] font-semibold text-slate-400 text-right">
                  {nextLevelXp ? `${pointsNeeded} XP to Level ${donorLevel + 1}` : '🏆 Maximum Rank Achieved'}
                </p>
              </div>
            </Card>

            <Card title="Impact & Stats" subtitle="Your verified LifeLink history.">
              <div className="space-y-4 pt-2">
                {donationStats.map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between border-b border-slate-100 dark:border-gray-800 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{stat.icon}</span>
                      <p className="text-xs font-bold text-slate-500 dark:text-gray-400">{stat.label}</p>
                    </div>
                    <span className={`text-sm font-black ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Quick Info">
               <div className="space-y-3 pt-2">
                 <div className="flex flex-col">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</span>
                   <span className="text-xs font-bold text-slate-900 dark:text-white">{formData.location || 'Not set'}</span>
                 </div>
                 <div className="flex flex-col">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</span>
                   <span className="text-xs font-bold text-slate-900 dark:text-white">{formData.phone || 'Not provided'}</span>
                 </div>
                 <div className="flex flex-col">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Member Since</span>
                   <span className="text-xs font-bold text-slate-900 dark:text-white">{user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear()}</span>
                 </div>
                 <div className="flex flex-col pt-2 border-t border-slate-100 dark:border-gray-800">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Next Eligible</span>
                   <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{user?.nextDonationDate ? new Date(user.nextDonationDate).toLocaleDateString() : 'Eligible now'}</span>
                 </div>
               </div>
            </Card>
          </div>

          {/* Right Column: Main Area */}
          <div className="lg:col-span-2 space-y-8">
            {isEditing ? (
              <Card title="Edit Information" subtitle="Update your personal details and location.">
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
                    <label className="text-xs font-bold text-slate-400 uppercase">Mobile Phone</label>
                    <input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone number" className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-red-500 dark:border-gray-800 dark:bg-gray-800/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Blood Group</label>
                    <select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-red-500 dark:border-gray-800 dark:bg-gray-800/50">
                      {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="col-span-full space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Location & GPS</label>
                    <div className="flex gap-2">
                      <input
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="City, District or Address"
                        className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-red-500 dark:border-gray-800 dark:bg-gray-800/50"
                      />
                      <button
                        type="button"
                        onClick={handleGetLocation}
                        disabled={gpsLoading}
                        className="px-4 py-3 rounded-2xl bg-slate-900 dark:bg-gray-700 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0"
                        title="Detect current GPS location"
                      >
                        {gpsLoading ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span>📍</span>
                        )}
                        <span className="hidden sm:inline">Get GPS</span>
                      </button>
                    </div>
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
                {/* Digital Donor Card */}
                <Card title="Digital Donor Card" subtitle="Your official LifeLink network identity.">
                  <div className="mt-4 overflow-hidden rounded-[2rem] bg-gradient-to-br from-red-600 via-red-700 to-rose-950 p-8 text-white shadow-xl shadow-red-900/20 relative">
                    <div className="absolute -right-10 -top-10 opacity-10">
                      <svg className="h-48 w-48" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    </div>
                    
                    <div className="relative z-10 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-red-200" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                          <span className="text-xs font-black uppercase tracking-widest text-red-100">DONOR CARD</span>
                        </div>
                        <h2 className="text-3xl font-black tracking-tight">{user?.name}</h2>
                        <div className="mt-2 flex items-center gap-2 w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-md">
                          <svg className="w-3 h-3 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                          Verified {user?.role === 'donor' ? 'Blood Donor' : user?.role}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-5xl font-black text-white/95">{user?.bloodGroup}</span>
                      </div>
                    </div>
                    
                    <div className="relative z-10 mt-10 grid grid-cols-3 gap-4 border-t border-white/20 pt-6">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-red-200">Member Since</p>
                        <p className="mt-1 text-lg font-black">{user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-red-200">Donations</p>
                        <p className="mt-1 text-lg font-black">{donationsCount}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-red-200">Next Donation</p>
                        <p className="mt-1 text-lg font-black truncate">{user?.nextDonationDate ? new Date(user.nextDonationDate).toLocaleDateString() : 'Eligible'}</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Achievements List */}
                <Card title="Achievements" subtitle="Milestones unlocked through verified donations and community activity.">
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {achievements.length > 0 ? (
                      achievements.map((ach) => (
                        <div 
                          key={ach.key} 
                          className={`p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                            ach.unlocked 
                              ? 'bg-amber-500/10 border-amber-500/30 text-slate-900 dark:text-white' 
                              : 'bg-slate-50 dark:bg-gray-800/40 border-slate-200 dark:border-gray-800 opacity-60'
                          }`}
                        >
                          <span className="text-2xl shrink-0">{ach.icon || '🏅'}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-black tracking-wide">{ach.title}</h4>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                ach.unlocked ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-gray-700 text-slate-600 dark:text-gray-300'
                              }`}>
                                {ach.unlocked ? '✓ Unlocked' : '🔒 Locked'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1 leading-snug">{ach.description}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-6 text-slate-400 text-sm font-medium">
                        No achievements unlocked yet. Complete donations to unlock badges!
                      </div>
                    )}
                  </div>
                </Card>

                {/* Personal Story */}
                <Card title="Personal Story" subtitle="A brief about your journey with LifeLink.">
                   <p className="mt-2 text-slate-600 dark:text-gray-400 leading-relaxed italic">
                     "{formData.bio}"
                   </p>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

