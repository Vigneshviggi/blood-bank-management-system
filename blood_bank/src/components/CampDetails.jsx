import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCamps } from '../api/campsApi';

export default function CampDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [camp, setCamp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  useEffect(() => {
    const loadCamp = async () => {
      setLoading(true);
      try {
        const camps = await fetchCamps();
        const found = camps.find(c => String(c._id || c.id) === id);
        setCamp(found);
      } catch (e) {
        setCamp(null);
      } finally {
        setLoading(false);
      }
    };
    loadCamp();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="text-lg text-slate-600">Loading camp details...</span>
      </div>
    );
  }

  if (!camp) {
    return (
      <div className="px-3 pb-8 sm:px-4 md:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-4xl">
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <h3 className="text-lg font-semibold text-slate-900">Camp not found</h3>
            <p className="mt-1 text-slate-600">The camp you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/camps')}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Back to Camps
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleJoinCamp = () => {
    setJoined(true);
    alert('Successfully joined the camp!');
  };

  const handleCancelRegistration = () => {
    if (window.confirm('Are you sure you want to cancel your registration?')) {
      setJoined(false);
      alert('Your registration has been cancelled.');
    }
  };

  return (
    <div className="px-3 pb-8 sm:px-4 md:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        {/* Back Button */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate('/camps')}
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-100 transition shadow-sm"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-slate-900">Camp Details</h1>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Camp Details */}
          <div className="lg:col-span-2">
            {/* Camp Header Image */}
            <div className={`h-64 rounded-2xl ${camp.image} mb-6 sm:h-80`} />

            {/* Camp Info Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{camp.name}</h1>
                    <span className="mt-2 inline-block rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                      {camp.type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="mb-6 grid gap-4 border-b border-slate-200 pb-6 sm:grid-cols-2">
                <div className="flex gap-3">
                  <svg className="h-5 w-5 shrink-0 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <div>
                    <p className="text-xs font-semibold text-slate-600">Location</p>
                    <p className="text-sm text-slate-900">{camp.location}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <svg className="h-5 w-5 shrink-0 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                  <div>
                    <p className="text-xs font-semibold text-slate-600">Date & Time</p>
                    <p className="text-sm text-slate-900">{camp.date} at {camp.time}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <svg className="h-5 w-5 shrink-0 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <div>
                    <p className="text-xs font-semibold text-slate-600">Organizer</p>
                    <p className="text-sm text-slate-900">{camp.organizer}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <svg className="h-5 w-5 shrink-0 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" />
                  </svg>
                  <div>
                    <p className="text-xs font-semibold text-slate-600">Contact</p>
                    <p className="text-sm text-slate-900">{camp.contact}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-sm font-semibold text-slate-900 sm:text-base">About this Camp</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{camp.description}</p>
              </div>

              {/* Participation Info */}
              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900">Participation</span>
                  <span className="text-sm font-semibold text-slate-600">
                    {camp.participants}/{camp.maxParticipants}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-300">
                  <div
                    className="h-2 rounded-full bg-red-600"
                    style={{ width: `${(camp.participants / camp.maxParticipants) * 100}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-600">
                  {camp.maxParticipants - camp.participants} spots available
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Actions */}
          <div className="lg:col-span-1">
            {/* Join/Cancel Button */}
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              {joined ? (
                <>
                  <div className="mb-4 rounded-lg bg-green-50 p-3 text-center">
                    <p className="text-sm font-semibold text-green-700">✓ You have joined this camp</p>
                  </div>
                  <button
                    onClick={handleCancelRegistration}
                    className="w-full rounded-lg border border-red-300 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    Cancel Registration
                  </button>
                </>
              ) : (
                <button
                  onClick={handleJoinCamp}
                  disabled={camp.participants >= camp.maxParticipants}
                  className={`w-full rounded-lg px-4 py-3 text-sm font-semibold text-white transition ${
                    camp.participants >= camp.maxParticipants
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {camp.participants >= camp.maxParticipants ? 'Camp Full' : 'Join Camp'}
                </button>
              )}
            </div>

            {/* Participants List */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <button
                onClick={() => setShowParticipants(!showParticipants)}
                className="mb-4 flex w-full items-center justify-between text-sm font-semibold text-slate-900"
              >
                <span>Participants {(camp.participantsList?.length || 0)}</span>
                <svg
                  className={`h-5 w-5 transition ${showParticipants ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {showParticipants && (
                <div className="space-y-3 border-t border-slate-200 pt-4">
                  {(camp.participantsList || []).map(participant => (
                    <div key={participant.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{participant.name}</p>
                        <p className="text-xs text-slate-600">{participant.status}</p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        participant.status === 'Confirmed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {participant.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
