import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { DarkModeProvider } from './context/DarkModeContext.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import Navbar from './components/Navbar.jsx'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './components/Dashboard.jsx'
import Requests from './components/Requests.jsx'
import Profile from './components/Profile.jsx'
import Donors from './components/Donors.jsx'
import Inventory from './components/Inventory.jsx'
import Hospitals from './components/Hospitals.jsx'
import Camps from './components/Camps.jsx'
import CreateCamp from './components/CreateCamp.jsx'
import CampDetails from './components/CampDetails.jsx'
import MyCamps from './components/MyCamps.jsx'
import AdminPanel from './components/AdminPanel.jsx'
import Contact from './components/Contact.jsx'
import ContactSupport from './components/ContactSupport.jsx'
import RespondPage from './components/RespondPage.jsx'
import Footer from './components/Footer.jsx'
import AuthLayout from './components/AuthLayout.jsx'
import Login from './components/Login.jsx'
import Register from './components/Register.jsx'
import RegisterUser from './components/RegisterUser.jsx';
import UserList from './components/UserList.jsx';
import Settings from './components/Settings.jsx'
import ProfileView from './components/ProfileView.jsx'
import Notifications from './components/Notifications.jsx'
import ForgotPassword from './components/ForgotPassword.jsx'
import VerifyOTP from './components/VerifyOTP.jsx'
import ResetPassword from './components/ResetPassword.jsx'



import { LoadingProvider, useLoading } from './context/LoadingContext.jsx'
import FullScreenLoader from './components/FullScreenLoader.jsx'
import { Toaster } from 'react-hot-toast'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader isLoading={true} message="Authenticating..." />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isLoading, message } = useLoading()

  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: 'dark:bg-gray-800 dark:text-white rounded-2xl shadow-xl border border-slate-100 dark:border-gray-700 font-medium text-sm',
        }}
      />
      <FullScreenLoader isLoading={isLoading} message={message} />
      
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-gray-900 dark:text-white transition-colors duration-300">
        <Navbar onMenuToggle={() => setSidebarOpen((open) => !open)} />
        <div className="flex min-h-[calc(100vh-4rem)] pt-16 lg:pt-20">
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)}
          />
          <main className="w-full flex-1 overflow-auto">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <div className="px-3 pb-8 sm:px-4 md:px-6 lg:px-8">
                    <div className="mx-auto w-full max-w-7xl">
                      <div className="mb-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 px-4 py-6 text-white shadow-xl shadow-red-500/20 sm:mb-6 sm:rounded-3xl sm:px-6 sm:py-8">
                        <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex-1">
                            <p className="text-xs uppercase tracking-[0.28em] text-rose-100">Welcome back</p>
                            <h1 className="mt-2 text-2xl font-semibold sm:mt-3 sm:text-3xl lg:text-4xl">LifeLink Dashboard</h1>
                          </div>
                          <p className="max-w-md text-xs leading-5 text-rose-100/90 sm:text-sm sm:leading-6">
                            Track urgent requests, manage donors and hospital inventory, and keep the community connected in real time.
                          </p>
                        </div>
                      </div>
                      <Dashboard />
                    </div>
                  </div>
                </ProtectedRoute>
              } />
              
              <Route path="/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/donors" element={<ProtectedRoute><Donors /></ProtectedRoute>} />
              <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
              <Route path="/hospitals" element={<ProtectedRoute><Hospitals /></ProtectedRoute>} />
              <Route path="/camps" element={<ProtectedRoute><Camps /></ProtectedRoute>} />
              <Route path="/create-camp" element={<ProtectedRoute><CreateCamp /></ProtectedRoute>} />
              <Route path="/camp/:id" element={<ProtectedRoute><CampDetails /></ProtectedRoute>} />
              <Route path="/my-camps" element={<ProtectedRoute><MyCamps /></ProtectedRoute>} />
              <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
              <Route path="/contact-support" element={<ProtectedRoute><ContactSupport /></ProtectedRoute>} />
              <Route path="/respond/:id" element={<ProtectedRoute><RespondPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

              <Route path="/admin-panel" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
              <Route path="/register-user" element={<ProtectedRoute><RegisterUser /></ProtectedRoute>} />
              <Route path="/user-list" element={<ProtectedRoute><UserList /></ProtectedRoute>} />
              <Route path="/profile-view/:id" element={<ProtectedRoute><ProfileView /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
        <Footer />
      </div>
    </Router>
  )
}

function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <LoadingProvider>
          <AppContent />
        </LoadingProvider>
      </AuthProvider>
    </DarkModeProvider>
  )
}

export default App
