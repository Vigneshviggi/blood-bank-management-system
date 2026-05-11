import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Card from './Card.jsx'

const dummyMyCamps = [
  {
    id: 1,
    name: 'Red Cross Blood Drive 2026',
    type: 'Blood Donation',
    location: 'Downtown Community Center',
    date: '2026-05-15',
    time: '09:00',
    status: 'Confirmed',
    joinedDate: '2026-04-20',
    image: 'https://images.unsplash.com/photo-1615461066159-fea0960485d5?auto=format&fit=crop&q=80'
  },
  {
    id: 3,
    name: 'Summer Blood Donation',
    type: 'Blood Donation',
    location: 'Park Avenue Mall',
    date: '2026-05-20',
    time: '11:00',
    status: 'Confirmed',
    joinedDate: '2026-04-25',
    image: 'https://images.unsplash.com/photo-1536856789559-1bc4987de3c1?auto=format&fit=crop&q=80'
  },
  {
    id: 2,
    name: 'Health Checkup Camp',
    type: 'Health Checkup',
    location: 'City Hospital',
    date: '2026-05-18',
    time: '10:00',
    status: 'Pending',
    joinedDate: '2026-05-01',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80'
  }
]

export default function MyCamps() {
  const navigate = useNavigate()
  const [myCamps, setMyCamps] = useState(dummyMyCamps)
  const [filter, setFilter] = useState('all')

  const filteredCamps = filter === 'all' 
    ? myCamps 
    : myCamps.filter(camp => camp.status.toLowerCase() === filter.toLowerCase())

  const handleCancelRegistration = (campId, campName) => {
    if (confirm(`Are you sure you want to cancel your registration for ${campName}?`)) {
      setMyCamps(myCamps.filter(camp => camp.id !== campId))
      alert('Registration cancelled successfully!')
    }
  }

  return (
    <div className="px-4 pb-12 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate(-1)}
              className="group flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-slate-100 bg-white text-slate-600 shadow-xl shadow-slate-200/50 transition-all hover:-translate-x-1 hover:bg-slate-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:shadow-none"
            >
              <svg className="w-6 h-6 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white sm:text-4xl">My Registrations</h1>
              <p className="mt-1 text-slate-500 dark:text-gray-400 font-medium">Tracking your impact across the network.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {['All', 'Confirmed', 'Pending'].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s.toLowerCase())}
                className={`rounded-2xl px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
                  filter === s.toLowerCase()
                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/20'
                    : 'bg-white border border-slate-100 text-slate-500 hover:bg-slate-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Camps Grid */}
        {filteredCamps.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCamps.map(camp => (
              <div
                key={camp.id}
                className="group relative overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:border-gray-800 dark:bg-gray-900 dark:shadow-none"
              >
                {/* Image Section */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={camp.image}
                    alt={camp.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <span className={`inline-block rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md ${
                      camp.status === 'Confirmed' ? 'bg-emerald-500/80' : 'bg-amber-500/80'
                    }`}>
                      {camp.status}
                    </span>
                    <h3 className="mt-3 text-xl font-bold text-white line-clamp-1">{camp.name}</h3>
                  </div>
                </div>

                {/* Info Section */}
                <div className="p-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-slate-500 dark:text-gray-400">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 dark:bg-gray-800">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </div>
                      <span className="text-sm font-bold">{camp.location}</span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-500 dark:text-gray-400">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 dark:bg-gray-800">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                      <span className="text-sm font-bold">{camp.date} at {camp.time}</span>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-3 pt-6 border-t border-slate-50 dark:border-gray-800">
                    <Link
                      to={`/camp/${camp.id}`}
                      className="flex-1 rounded-2xl bg-slate-900 py-4 text-center text-xs font-black uppercase tracking-widest text-white transition hover:bg-black dark:bg-white dark:text-slate-900"
                    >
                      Details
                    </Link>
                    <button
                      onClick={() => handleCancelRegistration(camp.id, camp.name)}
                      className="flex-1 rounded-2xl border border-red-100 bg-red-50 py-4 text-xs font-black uppercase tracking-widest text-red-600 transition hover:bg-red-100 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-24 w-24 rounded-full bg-slate-50 p-6 dark:bg-gray-800">
              <svg className="h-full w-full text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">No registrations found</h3>
            <p className="mt-2 text-slate-500 dark:text-gray-400">Join a life-saving mission today.</p>
            <Link
              to="/camps"
              className="mt-8 rounded-2xl bg-red-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-700"
            >
              Browse Camps
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
