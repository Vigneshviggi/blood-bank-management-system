import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchHospitals } from '../api/hospitalsApi'
import { fetchRequests } from '../api/requestsApi'

export default function Hospitals() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('network')
  const [selectedHospital, setSelectedHospital] = useState(null)
  const [transferRequest, setTransferRequest] = useState({ blood: 'O+', units: 0, toHospital: '' })
  const [hospitalsData, setHospitalsData] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  const bloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']

  useEffect(() => {
    const loadData = async () => {
      try {
        const [hospitals, allRequests] = await Promise.all([
          fetchHospitals(),
          fetchRequests()
        ])
        setHospitalsData(hospitals)
        setRequests(allRequests)
      } catch (error) {
        console.error("Failed to fetch hospital data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleTransferRequest = () => {
    if (transferRequest.units > 0 && transferRequest.toHospital) {
      alert(`Transfer request sent: ${transferRequest.units} units of ${transferRequest.blood} to ${transferRequest.toHospital}`)
      setTransferRequest({ blood: 'O+', units: 0, toHospital: '' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hospital Network</h1>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {['network', 'requests', 'transfer'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 font-semibold text-sm border-b-2 transition capitalize ${
                  activeTab === tab
                    ? 'border-red-600 text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Network Tab */}
      {activeTab === 'network' && (
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {loading ? (
            <div className="text-center py-12 text-gray-600 dark:text-gray-400">Loading hospitals...</div>
          ) : (
            <div className="space-y-4">
              {hospitalsData.map((hospital) => (
                <div key={hospital._id || hospital.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition">
                <div className="flex flex-col sm:flex-row gap-6 sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{hospital.name}</h3>
                      {hospital.verified && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-semibold rounded-full">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{hospital.address}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">📞 {hospital.phone}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      <strong>Beds:</strong> {hospital.beds} | <strong>Operating:</strong> {hospital.operatingHours}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{hospital.distance}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Distance</p>
                  </div>
                </div>

                {/* Blood Stock */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Current Blood Stock:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Object.entries(hospital.stock).map(([blood, units]) => (
                      <div key={blood} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 text-center">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{blood}</p>
                        <p className="text-lg font-bold text-red-600 dark:text-red-400">{units}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => navigate(`/profile-view/${hospital._id || hospital.id}`)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    View Profile
                  </button>
                  <button 
                    onClick={() => navigate('/contact')}
                    className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
                  >
                    Contact
                  </button>
                </div>
              </div>
            ))}
            {hospitalsData.length === 0 && (
              <div className="text-center py-12 text-gray-600 dark:text-gray-400">No hospitals available in the network.</div>
            )}
          </div>
          )}
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Blood</th>
                      <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Units</th>
                      <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Hospital</th>
                      <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Date</th>
                      <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Status</th>
                      <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-900 dark:text-gray-300">
                    {requests.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No requests found.</td>
                      </tr>
                    ) : (
                      requests.map((req) => (
                        <tr key={req._id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 font-semibold text-red-600 dark:text-red-400">{req.bloodType}</td>
                          <td className="px-6 py-4">{req.quantity}</td>
                          <td className="px-6 py-4">{req.hospitalName || 'Blekinge Hospital'}</td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{new Date(req.dateRequired || req.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              req.status === 'Approved'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button 
                              onClick={() => navigate(`/respond/${req._id}`)}
                              className="text-red-600 dark:text-red-400 font-semibold hover:text-red-700 dark:hover:text-red-300"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Tab */}
      {activeTab === 'transfer' && (
        <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-2xl">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Request Blood Transfer</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Blood Type</label>
                <select
                  value={transferRequest.blood}
                  onChange={(e) => setTransferRequest({ ...transferRequest, blood: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {bloodTypes.map((blood) => (
                    <option key={blood} value={blood}>
                      {blood}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Units Required</label>
                <input
                  type="number"
                  min="0"
                  value={transferRequest.units}
                  onChange={(e) => setTransferRequest({ ...transferRequest, units: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter number of units"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Transfer To</label>
                <select
                  value={transferRequest.toHospital}
                  onChange={(e) => setTransferRequest({ ...transferRequest, toHospital: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select a hospital</option>
                  {hospitalsData.map((hosp) => (
                    <option key={hosp.id} value={hosp.name}>
                      {hosp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Urgency</label>
                <div className="space-y-2">
                  {['Normal', 'High', 'Critical'].map((urgency) => (
                    <label key={urgency} className="flex items-center">
                      <input type="radio" name="urgency" className="w-4 h-4" defaultChecked={urgency === 'Normal'} />
                      <span className="ml-2 text-sm text-gray-900 dark:text-white">{urgency}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleTransferRequest}
                className="w-full px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
              >
                Send Transfer Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
