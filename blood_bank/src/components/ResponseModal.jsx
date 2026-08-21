import { useState, useEffect } from 'react'
import { respondToRequest } from '../api/requestsApi'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'
import LoadingButton from './ui/LoadingButton.jsx'

const ETA_OPTIONS = [
  { label: '15 mins', value: '15' },
  { label: '30 mins', value: '30' },
  { label: '45 mins', value: '45' },
  { label: '1 hour', value: '60' },
  { label: '2 hours', value: '120' },
  { label: 'Custom', value: 'custom' },
]

export default function ResponseModal({ request, isOpen, onClose, onSuccess }) {
  const { user } = useAuth()
  const [selectedEtaOption, setSelectedEtaOption] = useState('30')
  const [customEta, setCustomEta] = useState('')
  const [contactNumber, setContactNumber] = useState(user?.phone || '')
  const [note, setNote] = useState('')
  const [isAvailable, setIsAvailable] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user?.phone) {
      setContactNumber(user.phone)
    }
  }, [user])

  if (!isOpen || !request) return null

  const creatorId = (request.requesterId?._id || request.requesterId)?.toString()
  const currentUserId = (user?._id || user?.id)?.toString()
  const isOwnRequest = creatorId && currentUserId && creatorId === currentUserId

  const effectiveEta = selectedEtaOption === 'custom' ? customEta : selectedEtaOption

  const handleRespond = async (e) => {
    e.preventDefault()

    if (isOwnRequest) {
      toast.error('You cannot respond to your own blood request.')
      return
    }

    if (!effectiveEta || isNaN(Number(effectiveEta)) || Number(effectiveEta) <= 0) {
      toast.error('Please select or enter a valid ETA in minutes.')
      return
    }

    if (!contactNumber.trim()) {
      toast.error('Please provide an emergency contact phone number.')
      return
    }

    if (!isAvailable) {
      toast.error('Please confirm your readiness and health criteria.')
      return
    }

    setSubmitting(true)
    try {
      await respondToRequest(request._id, {
        responderId: user?._id || user?.id,
        responderName: user?.name || 'Verified Donor',
        status: 'Accepted',
        eta: Number(effectiveEta).toString(),
        note: note.trim(),
        contactNumber: contactNumber.trim(),
      })

      toast.success(`Response sent! +10 XP earned for emergency alert response. ❤️`)
      if (onSuccess) onSuccess(request._id)
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to submit response. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const isUrgent = ['Critical', 'Emergency', 'High'].includes(request.emergencyLevel || request.priority)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-gray-800 animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className={`p-6 sm:p-8 text-white ${
          isUrgent ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700' : 'bg-gradient-to-r from-slate-900 to-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider">
                {request.emergencyLevel || 'Urgent'} Priority
              </span>
              <span className="text-xs font-bold text-white/80">Respond to Blood Request</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
            >
              ✕
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black">{request.patientName || 'Emergency Patient'}</h3>
              <p className="text-xs text-white/80 mt-0.5">{request.reason || request.patientCondition || 'Urgent blood requirement'}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white text-red-600 flex flex-col items-center justify-center font-black shadow-lg">
              <span className="text-base leading-none">{request.bloodGroup}</span>
              <span className="text-[9px] uppercase tracking-tighter text-slate-500">{request.unitsNeeded || 1} Unit(s)</span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleRespond} className="p-6 sm:p-8 space-y-6">
          {isOwnRequest ? (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-center">
              <p className="text-sm font-bold text-amber-900 dark:text-amber-300">
                You created this blood request. You cannot respond as a donor to your own request.
              </p>
            </div>
          ) : (
            <>
              {/* ETA Selection */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-2">
                  Estimated Arrival Time (ETA)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ETA_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedEtaOption(opt.value)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition border ${
                        selectedEtaOption === opt.value
                          ? 'border-red-600 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 shadow-sm'
                          : 'border-slate-200 dark:border-gray-700 hover:border-slate-300 text-slate-600 dark:text-gray-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {selectedEtaOption === 'custom' && (
                  <div className="mt-3">
                    <input
                      type="number"
                      min="1"
                      max="480"
                      value={customEta}
                      onChange={(e) => setCustomEta(e.target.value)}
                      placeholder="Enter ETA in minutes (e.g. 25)"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-red-500"
                    />
                  </div>
                )}
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-2">
                  Your Contact Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-red-500"
                />
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-2">
                  Message / Note (Optional)
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="I have confirmed blood availability and on my way..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-red-500 resize-none"
                />
              </div>

              {/* Confirmation Checkbox */}
              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-gray-800/60 border border-slate-100 dark:border-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300"
                />
                <span className="text-xs font-medium text-slate-600 dark:text-gray-300 leading-snug">
                  I confirm that I am eligible and available to donate for this request.
                </span>
              </label>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="flex-1 py-3.5 rounded-2xl bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 font-bold text-sm hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <LoadingButton
                  type="submit"
                  loading={submitting}
                  loadingText="Sending..."
                  className="flex-1 py-3.5 rounded-2xl bg-red-600 text-white font-bold text-sm shadow-lg shadow-red-500/30 hover:bg-red-700 transition"
                >
                  Accept & Respond
                </LoadingButton>
              </div>
            </>
          )}
        </form>

      </div>
    </div>
  )
}
