// src/App.tsx
import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { Toaster } from './components/ui/sonner'

// Pages
const Chatbot = lazy(() => import('./pages/Chatbot'))
const Landing = lazy(() => import('./pages/Landing'))
const Login = lazy(() => import('./pages/Login'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Wallets = lazy(() => import('./pages/Wallets'))
const Transactions = lazy(() => import('./pages/Transactions'))
const Subscriptions = lazy(() => import('./pages/Subscriptions'))
const Investments = lazy(() => import('./pages/Investments'))
const Goals = lazy(() => import('./pages/Goals'))
const Profile = lazy(() => import('./pages/Profile'))
const Pricing = lazy(() => import('./pages/Pricing'))
const Testimonials = lazy(() => import('./pages/Testimonials'))
const Demo = lazy(() => import('./pages/Demo'))
const CommunityChat = lazy(() => import('./pages/CommunityChat'))
const ContributeGoal = lazy(() => import('./pages/ContributeGoal'))
const Analytics = lazy(() => import('./pages/Analytics'))

// Layouts
import DashboardLayout from './components/layout/DashboardLayout'

// Import useAuth
import { useAuth } from './contexts/AuthContext'

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return <div>Loading...</div>
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <DashboardLayout>{children}</DashboardLayout>
}

function App() {
  return (
    <ThemeProvider>
      <Router 
        future={{
          v7_relativeSplatPath: true,
          v7_startTransition: true,
        }}
      >
        <AuthProvider>
          <Toaster richColors position="top-center" />
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/register" element={<Register />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/testimonials" element={<Testimonials />} />
              <Route path="/demo" element={<Demo />} />

              <Route path="/contribute-goal/:token" element={<ContributeGoal />} />

              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/wallets" element={
                <ProtectedRoute>
                  <Wallets />
                </ProtectedRoute>
              } />
              <Route path="/transactions" element={
                <ProtectedRoute>
                  <Transactions />
                </ProtectedRoute>
              } />
              <Route path="/subscriptions" element={
                <ProtectedRoute>
                  <Subscriptions />
                </ProtectedRoute>
              } />
              <Route path="/investments" element={
                <ProtectedRoute>
                  <Investments />
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              } />
              <Route path="/goals" element={
                <ProtectedRoute>
                  <Goals />
                </ProtectedRoute>
              } />
              <Route path="/chatbot" element={
                <ProtectedRoute>
                  <Chatbot />
                </ProtectedRoute>
              } />
              <Route path="/community-chat" element={
                <ProtectedRoute>
                  <CommunityChat />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  )
}

export default App
