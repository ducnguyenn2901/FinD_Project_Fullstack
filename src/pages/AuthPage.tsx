import { useSearchParams, Navigate } from 'react-router-dom'
import Login from './Login'
import Register from './Register'

const AuthPage = () => {
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode') || 'login'

  if (mode === 'login') {
    return <Login />
  } else if (mode === 'signup') {
    return <Register />
  } else {
    return <Navigate to="/login" replace />
  }
}

export default AuthPage
