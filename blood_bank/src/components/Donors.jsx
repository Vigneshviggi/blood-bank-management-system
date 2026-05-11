import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchDonors } from '../api/donorsApi'
import { TableSkeleton } from './ui/Skeleton.jsx'
import { useLoading } from '../context/LoadingContext.jsx'


export default function Donors() {
  const navigate = useNavigate()
  const [donorsData, setDonorsData] = useState([])
  const [filterBlood, setFilterBlood] = useState('All')
  const [filterAvailability, setFilterAvailability] = useState('All')
  const [sortBy, setSortBy] = useState('distance')
  const [loading, setLoading] = useState(true)
  const { showLoading, hideLoading } = useLoading()


  const bloodTypes = ['All', 'O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']

  useEffect(() => {
    const loadDonors = async () => {
      showLoading('Searching for Donors...')
      try {
        const data = await fetchDonors()
        setDonorsData(data)
      } catch (error) {
        console.error("Failed to fetch donors:", error)
      } finally {
        setLoading(false)
        hideLoading()
      }
    }
    loadDonors()
  }, [showLoading, hideLoading])


  const filteredDonors = donorsData
    .filter((donor) => filterBlood === 'All' || donor.bloodGroup === filterBlood)
    .filter((donor) => filterAvailability === 'All' || (filterAvailability === 'Available' ? donor.availability : !donor.availability))
    .sort((a, b) => {
      if (sortBy === 'distance') return parseFloat(a.distance) - parseFloat(b.distance)
      if (sortBy === 'rating') return b.reliabilityScore - a.reliabilityScore
      if (sortBy === 'donations') return b.donations - a.donations
      return 0
    })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-slate-100 bg-white text-slate-600 shadow-xl shadow-slate-200/50 transition-all hover:-translate-x-1 hover:bg-slate-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:shadow-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Available Donors</h1>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Blood Type Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Blood Type</label>
              <select
                value={filterBlood}
                onChange={(e) => setFilterBlood(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {bloodTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Availability</label>
              <select
                value={filterAvailability}
                onChange={(e) => setFilterAvailability(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="All">All</option>
                <option value="Available">Available</option>
                <option value="Not Available">Not Available</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="distance">Distance</option>
                <option value="rating">Rating</option>
                <option value="donations">Total Donations</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Donors List */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-200 dark:border-gray-700 p-8">
            <TableSkeleton rows={6} />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDonors.length > 0 ? (
              filteredDonors.map((donor) => (
                <div key={donor._id || donor.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-lg transition">
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {donor.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{donor.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{donor.location} • {donor.distance}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:flex gap-3 sm:gap-4">
                    <div className="text-center sm:text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Blood Group</p>
                      <p className="text-lg font-bold text-red-600 dark:text-red-400">{donor.bloodGroup}</p>
                    </div>
                    <div className="text-center sm:text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Donations</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{donor.donations}</p>
                    </div>
                    <div className="text-center sm:text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">⭐ {donor.reliabilityScore}</p>
                    </div>
                    <div className="text-center sm:text-right">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${
                          donor.availability
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${donor.availability ? 'bg-emerald-600' : 'bg-gray-400'}`}></span>
                        {donor.availability ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-3 sm:justify-end">
                  <button 
                    onClick={() => navigate(`/profile-view/${donor._id || donor.id}`)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    View Profile
                  </button>
                  <button 
                    disabled={!donor.availability} 
                    onClick={() => navigate('/contact')}
                    className={`px-4 py-2 font-semibold rounded-lg transition ${
                      donor.availability
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Contact
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No donors found matching your criteria.</p>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  )
}
