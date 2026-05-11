import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createRequest } from '../api/requestsApi'
import { useAuth } from '../context/AuthContext'
import LoadingButton from './ui/LoadingButton.jsx'
import { toast } from 'react-hot-toast'

const bloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
const priorities = ['Low', 'Medium', 'High', 'Urgent']

export default function Requests() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('requests')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    bloodType: 'O+',
    priority: 'Medium',
    quantity: 0,
    dateRequired: new Date().toISOString().split('T')[0],
    reason: '',
  })

  const handleQuantityChange = (change) => {
    setFormData({
      ...formData,
      quantity: Math.max(0, formData.quantity + change),
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createRequest({
        ...formData,
        hospitalName: user?.name || 'Blekinge Hospital',
        location: user?.location || user?.address || 'Downtown'
      })
      toast.success('Blood request submitted successfully!')
      setFormData({
        bloodType: 'O+',
        priority: 'Medium',
        quantity: 0,
        dateRequired: new Date().toISOString().split('T')[0],
        reason: '',
      })
    } catch (error) {
      console.error('Failed to submit request:', error)
      toast.error('Failed to submit request. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low':
        return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'High':
        return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'Urgent':
        return 'bg-red-100 text-red-700 border-red-300'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-slate-100 bg-white text-slate-600 shadow-xl shadow-slate-200/50 transition-all hover:-translate-x-1 hover:bg-slate-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:shadow-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">BLEKINGE HOSPITAL</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8 flex gap-8">
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-4 px-2 font-semibold text-sm sm:text-base border-b-2 transition ${
                activeTab === 'requests'
                  ? 'border-red-600 text-gray-900 dark:text-white'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Requests
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`py-4 px-2 font-semibold text-sm sm:text-base border-b-2 transition ${
                activeTab === 'inventory'
                  ? 'border-red-600 text-gray-900 dark:text-white'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Inventory
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {activeTab === 'requests' && (
        <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-4xl">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Make Request
          </h2>

          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8 space-y-6">
            {/* Blood Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-4">Specify Blood Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {bloodTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, bloodType: type })}
                    className={`py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-semibold text-sm transition border-2 ${
                      formData.bloodType === type
                        ? 'border-red-600 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority and Quantity Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Priority */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-4">Priority</label>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {priorities.map((priority) => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority })}
                      className={`py-1.5 px-3 rounded-full text-sm font-medium transition border-2 ${
                        formData.priority === priority
                          ? `${getPriorityColor(priority)} border-current dark:bg-opacity-20`
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-4">Quantity - Units</label>
                <div className="flex items-center gap-4 w-full sm:w-32">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-12 h-8 text-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Date Required */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white">Select Date Required</label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, dateRequired: new Date().toISOString().split('T')[0] })}
                  className="text-xs text-red-600 font-medium cursor-pointer hover:text-red-700 transition-all duration-200 ease-in-out hover:scale-105"
                >
                  Set to Today
                </button>
              </div>
              <div className="w-full sm:w-72">
                <input
                  type="date"
                  value={formData.dateRequired}
                  onChange={(e) => setFormData({ ...formData, dateRequired: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Reason for the request</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Please give a reason for the request."
                rows={5}
                className="w-full px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* Submit Button */}
            <LoadingButton
              type="submit"
              loading={isSubmitting}
              loadingText="Submitting Request..."
              className="w-full sm:w-auto mt-4"
            >
              Make Request
            </LoadingButton>
          </form>
        </div>
      )}

      {/* Inventory Tab Content */}
      {activeTab === 'inventory' && (
        <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-4xl">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hospital Blood Inventory</h2>
            <p className="text-gray-600 dark:text-gray-400">Inventory management coming soon...</p>
          </div>
        </div>
      )}
    </div>
  )
}
