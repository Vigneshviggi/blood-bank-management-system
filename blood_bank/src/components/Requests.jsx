import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createRequest } from '../api/requestsApi'
import { useAuth } from '../context/AuthContext'
import LoadingButton from './ui/LoadingButton.jsx'
import { toast } from 'react-hot-toast'
import axios from 'axios'

const bloodGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
const emergencyLevels = ['Normal', 'High', 'Critical']

export default function Requests() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('create')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hospitals, setHospitals] = useState([])
  const [scenario, setScenario] = useState('')

  const [formData, setFormData] = useState({
    requesterType: user?.role === 'hospital' ? 'hospital' : 'donor',
    requesterId: user?._id,
    requesterTypeModel: 'User', // Both donors and hospitals are Users in this system
    targetType: 'person',
    bloodGroup: 'O+',
    unitsNeeded: 1,
    emergencyLevel: 'Normal',
    patientCondition: '',
    hospitalId: '',
    location: user?.location || '',
    contactInfo: user?.phone || '',
    reason: '',
  })

  useEffect(() => {
    if (user?.role === 'hospital') {
      setScenario('hospital_to_person')
      setFormData(prev => ({ ...prev, requesterType: 'hospital', requesterTypeModel: 'Hospital', targetType: 'person' }))
    } else {
      setScenario('person_to_hospital')
      setFormData(prev => ({ ...prev, requesterType: 'donor', requesterTypeModel: 'User', targetType: 'hospital' }))
    }

    const fetchHospitals = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/hospitals`)
        setHospitals(res.data)
      } catch (err) {
        console.error("Failed to fetch hospitals")
      }
    }
    fetchHospitals()
  }, [user])

  const handleScenarioChange = (newScenario) => {
    setScenario(newScenario)
    if (newScenario === 'hospital_to_person') {
      setFormData(prev => ({ ...prev, targetType: 'person', hospitalId: user?.hospitalId || '' }))
    } else if (newScenario === 'hospital_to_hospital') {
      setFormData(prev => ({ ...prev, targetType: 'hospital' }))
    } else if (newScenario === 'person_to_hospital') {
      setFormData(prev => ({ ...prev, targetType: 'hospital', requesterType: 'donor' }))
    } else if (newScenario === 'person_to_person') {
      setFormData(prev => ({ ...prev, targetType: 'person', requesterType: 'donor' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createRequest(formData)
      toast.success('Request created successfully!')
      navigate('/')
    } catch (error) {
      console.error('Failed to submit request:', error)
      toast.error('Failed to submit request.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-slate-100 dark:border-gray-700 p-8 sm:p-10 space-y-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Blood Group */}
        <div className="space-y-4">
          <label className="block text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Blood Group Needed</label>
          <div className="grid grid-cols-4 gap-2">
            {bloodGroups.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({ ...formData, bloodGroup: type })}
                className={`py-3 rounded-2xl font-bold text-sm transition-all border-2 ${
                  formData.bloodGroup === type
                    ? 'border-red-600 bg-red-50 dark:bg-red-900/30 text-red-600'
                    : 'border-slate-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-500'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Units Needed */}
        <div className="space-y-4">
          <label className="block text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Units Required</label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, unitsNeeded: Math.max(1, formData.unitsNeeded - 1) })}
              className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-gray-700 rounded-2xl text-xl font-bold"
            >
              −
            </button>
            <span className="text-2xl font-black w-12 text-center">{formData.unitsNeeded}</span>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, unitsNeeded: formData.unitsNeeded + 1 })}
              className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-gray-700 rounded-2xl text-xl font-bold"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Emergency Level */}
        <div className="space-y-4">
          <label className="block text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Priority Level</label>
          <div className="flex gap-2">
            {emergencyLevels.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setFormData({ ...formData, emergencyLevel: level })}
                className={`flex-1 py-3 rounded-2xl font-bold text-xs uppercase tracking-tighter transition-all border-2 ${
                  formData.emergencyLevel === level
                    ? 'border-red-600 bg-red-600 text-white'
                    : 'border-slate-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-500'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Conditional Selection based on scenario */}
        {scenario.includes('to_hospital') && (
          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Select Target Hospital</label>
            <select
              value={formData.hospitalId}
              onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value })}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-700 rounded-2xl font-medium focus:ring-2 focus:ring-red-500 outline-none"
            >
              <option value="">Any Available Hospital</option>
              {hospitals.map(h => (
                <option key={h._id} value={h._id}>{h.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="block text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Patient Condition</label>
          <input
            type="text"
            value={formData.patientCondition}
            onChange={(e) => setFormData({ ...formData, patientCondition: e.target.value })}
            placeholder="e.g. Critical Surgery, Accident"
            className="w-full px-5 py-4 bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-700 rounded-2xl font-medium focus:ring-2 focus:ring-red-500 outline-none"
          />
        </div>
        <div className="space-y-4">
          <label className="block text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Location / Contact</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Hospital location or pickup address"
            className="w-full px-5 py-4 bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-700 rounded-2xl font-medium focus:ring-2 focus:ring-red-500 outline-none"
          />
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Additional Details</label>
        <textarea
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          rows={4}
          placeholder="Describe the urgency or specific requirements..."
          className="w-full px-5 py-4 bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-700 rounded-2xl font-medium focus:ring-2 focus:ring-red-500 outline-none"
        />
      </div>

      <LoadingButton
        type="submit"
        loading={isSubmitting}
        loadingText="Broadcasting Request..."
        className="w-full py-5 rounded-[2rem] bg-red-600 text-lg font-black text-white shadow-xl shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
      >
        Submit {scenario.replace(/_/g, ' ').toUpperCase()}
      </LoadingButton>
    </form>
  )

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Blood Requests</h1>
            <p className="mt-3 text-slate-500 dark:text-gray-400 font-medium">Create and manage urgent blood requirements across the network.</p>
          </div>
          
          <div className="flex bg-slate-100 dark:bg-gray-800 p-1.5 rounded-[2rem]">
            <button 
              onClick={() => setActiveTab('create')}
              className={`px-8 py-3 rounded-[1.75rem] text-sm font-bold transition-all ${activeTab === 'create' ? 'bg-white dark:bg-gray-700 text-red-600 shadow-lg' : 'text-slate-500'}`}
            >
              New Request
            </button>
            <button 
              onClick={() => navigate('/')} // Redirect to dashboard to see active requests
              className={`px-8 py-3 rounded-[1.75rem] text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white dark:bg-gray-700 text-red-600 shadow-lg' : 'text-slate-500'}`}
            >
              My Requests
            </button>
          </div>
        </div>

        {activeTab === 'create' && (
          <div className="space-y-10">
            {/* Scenario Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {user?.role === 'hospital' ? (
                <>
                  <ScenarioCard 
                    title="Hospital → Person" 
                    desc="Emergency donor request" 
                    active={scenario === 'hospital_to_person'} 
                    onClick={() => handleScenarioChange('hospital_to_person')}
                  />
                  <ScenarioCard 
                    title="Hospital → Hospital" 
                    desc="Unit transfer request" 
                    active={scenario === 'hospital_to_hospital'} 
                    onClick={() => handleScenarioChange('hospital_to_hospital')}
                  />
                </>
              ) : (
                <>
                  <ScenarioCard 
                    title="Person → Hospital" 
                    desc="Search unit availability" 
                    active={scenario === 'person_to_hospital'} 
                    onClick={() => handleScenarioChange('person_to_hospital')}
                  />
                  <ScenarioCard 
                    title="Person → Person" 
                    desc="Direct donor request" 
                    active={scenario === 'person_to_person'} 
                    onClick={() => handleScenarioChange('person_to_person')}
                  />
                </>
              )}
            </div>

            {renderForm()}
          </div>
        )}
      </div>
    </div>
  )
}

function ScenarioCard({ title, desc, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`p-6 rounded-[2.5rem] border-2 text-left transition-all hover:scale-[1.03] ${
        active 
          ? 'border-red-600 bg-red-50 dark:bg-red-900/10' 
          : 'border-slate-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-slate-200'
      }`}
    >
      <div className={`w-12 h-12 rounded-2xl mb-4 flex items-center justify-center ${active ? 'bg-red-600 text-white' : 'bg-slate-100 dark:bg-gray-800 text-slate-500'}`}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
      </div>
      <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{title}</p>
      <p className="mt-1 text-xs font-bold text-slate-400 uppercase tracking-tighter">{desc}</p>
    </button>
  )
}

