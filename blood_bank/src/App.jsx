import React, { useState, Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { DarkModeProvider } from './context/DarkModeContext.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import Navbar from './components/Navbar.jsx'
import Sidebar from './components/Sidebar.jsx'
import Footer from './components/Footer.jsx'
import AuthLayout from './components/AuthLayout.jsx'
import { LoadingProvider, useLoading } from './context/LoadingContext.jsx'
import FullScreenLoader from './components/FullScreenLoader.jsx'
import { Toaster } from 'react-hot-toast'

// Lazy loaded pages
const Dashboard = lazy(() => import('./components/Dashboard.jsx'));
const Requests = lazy(() => import('./components/Requests.jsx'));
const Profile = lazy(() => import('./components/Profile.jsx'));
const Donors = lazy(() => import('./components/Donors.jsx'));
const Inventory = lazy(() => import('./components/Inventory.jsx'));
const Hospitals = lazy(() => import('./components/Hospitals.jsx'));
const Camps = lazy(() => import('./components/Camps.jsx'));
const CreateCamp = lazy(() => import('./components/CreateCamp.jsx'));
const CampDetails = lazy(() => import('./components/CampDetails.jsx'));
const AdminPanel = lazy(() => import('./components/AdminPanel.jsx'));
const Contact = lazy(() => import('./components/Contact.jsx'));
const ContactSupport = lazy(() => import('./components/ContactSupport.jsx'));
const RespondPage = lazy(() => import('./components/RespondPage.jsx'));
const Login = lazy(() => import('./components/Login.jsx'));
const Register = lazy(() => import('./components/Register.jsx'));
const RegisterUser = lazy(() => import('./components/RegisterUser.jsx'));
const UserList = lazy(() => import('./components/UserList.jsx'));
const Settings = lazy(() => import('./components/Settings.jsx'));
const ProfileView = lazy(() => import('./components/ProfileView.jsx'));
const Notifications = lazy(() => import('./components/Notifications.jsx'));
const ForgotPassword = lazy(() => import('./components/ForgotPassword.jsx'));
const VerifyOTP = lazy(() => import('./components/VerifyOTP.jsx'));
const ResetPassword = lazy(() => import('./components/ResetPassword.jsx'));
const CampManagement = lazy(() => import('./components/CampManagement.jsx'));

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
            <Suspense fallback={<FullScreenLoader isLoading={true} message="Loading Page..." />}>
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
                <Route path="/camp-management/:id" element={<ProtectedRoute><CampManagement /></ProtectedRoute>} />
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
            </Suspense>
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
