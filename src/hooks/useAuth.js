import { useContext } from 'react'
import { AuthContext } from 'src/context/AuthContext.jsx'

export const useAuth = () => useContext(AuthContext)
