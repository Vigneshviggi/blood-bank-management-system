import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLoading } from '../context/LoadingContext'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { fetchCampById, fetchCampAttendees, updateRegistrationStatus } from '../api/campsApi'

export default function CampManagement() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showLoading, hideLoading } = useLoading()
  const [camp, setCamp] = useState(null)
  const [attendees, setAttendees] = useState([])
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    const fetchManagementData = async () => {
      showLoading('Loading camp data...')
      try {
        const [campData, attendeesData] = await Promise.all([
          fetchCampById(id),
          fetchCampAttendees(id)
        ])
        setCamp(campData)
        setAttendees(attendeesData)
      } catch (error) {
        toast.error('Failed to load management data')
        navigate('/camps')
      } finally {
        hideLoading()
      }
    }
    fetchManagementData()
  }, [id])

  const handleStatusUpdate = async (registrationId, newStatus) => {
    try {
      await updateRegistrationStatus(registrationId, newStatus)
      toast.success(`Marked as ${newStatus}`)
      // Update local state
      setAttendees(prev => prev.map(a => a._id === registrationId ? { ...a, status: newStatus } : a))
    } catch (error) {
      toast.error('Update failed')
    }
  }

  const filteredAttendees = attendees.filter(a => filter === 'All' || a.status === filter)

  

  if (!camp) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mx-auto text-red-600">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Camp Not Found</h2>
        <p className="text-slate-500 font-medium max-w-xs mx-auto">This camp may have been deleted or the link is invalid.</p>
        <button onClick={() => navigate('/camps')} className="px-8 py-3 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-500/20 hover:scale-105 transition">Go Back</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate(-1)}
              className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-slate-100 bg-white text-slate-600 shadow-xl shadow-slate-200/50 transition-all hover:-translate-x-1 hover:bg-slate-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:shadow-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Camp Management</h1>
              <p className="mt-1 text-slate-500 font-medium">Managing: <span className="text-red-600">{camp.title}</span></p>
            </div>
          </div>

          <div className="flex bg-slate-100 dark:bg-gray-800 p-1.5 rounded-[2rem]">
            {['All', 'Registered', 'Attended', 'Cancelled'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-3 rounded-[1.75rem] text-xs font-black transition-all ${filter === f ? 'bg-white dark:bg-gray-700 text-red-600 shadow-lg' : 'text-slate-500'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Summary Stats */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-gray-700 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Live Statistics</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-bold">Total Registrations</span>
                    <span className="text-sm font-black text-red-600">{attendees.length}</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-red-600" style={{ width: `${(attendees.length / camp.capacity) * 100}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                    <p className="text-[10px] font-black text-emerald-600 uppercase">Attended</p>
                    <p className="text-2xl font-black text-emerald-700">{attendees.filter(a => a.status === 'Attended').length}</p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                    <p className="text-[10px] font-black text-blue-600 uppercase">Pending</p>
                    <p className="text-2xl font-black text-blue-700">{attendees.filter(a => a.status === 'Registered').length}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 dark:bg-red-950 p-8 rounded-[2.5rem] text-white">
              <h3 className="text-sm font-black opacity-50 uppercase tracking-widest mb-4">Organizer Note</h3>
              <p className="text-sm font-medium leading-relaxed opacity-80">
                Ensure you verify donor IDs before marking them as "Attended". Points will be automatically credited to their profiles upon attendance confirmation.
              </p>
            </div>
          </div>

          {/* Attendees List */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-slate-100 dark:border-gray-700 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-gray-900/50">
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Donor</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Blood Group</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                    {filteredAttendees.length > 0 ? filteredAttendees.map((attendee) => (
                      <tr key={attendee._id} className="hover:bg-slate-50 dark:hover:bg-gray-800/50 transition">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-gray-700 flex items-center justify-center font-black text-red-600">
                              {attendee.userId?.name?.charAt(0) || 'D'}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900 dark:text-white">{attendee.userId?.name}</p>
                              <p className="text-[10px] font-bold text-slate-400">{attendee.contactInfo}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 font-black text-xs border border-red-100 dark:border-red-900/30">
                            {attendee.bloodGroup}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            attendee.status === 'Attended' ? 'bg-emerald-100 text-emerald-700' : 
                            attendee.status === 'Registered' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {attendee.status}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          {attendee.status === 'Registered' && (
                            <button 
                              onClick={() => handleStatusUpdate(attendee._id, 'Attended')}
                              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20 hover:scale-105 transition active:scale-95"
                            >
                              Check In
                            </button>
                          )}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" className="px-8 py-20 text-center text-slate-400 font-bold italic">No donors found for this filter.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
