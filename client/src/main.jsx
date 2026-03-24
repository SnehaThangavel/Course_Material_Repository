import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import axios from 'axios'

// In production, the API and Frontend are hosted on the same server/domain, so we use relative paths.
// In development, the Vite server uses the proxy to localhost:5000, but setting this to localhost:5000 directly also works.
axios.defaults.baseURL = import.meta.env.MODE === 'production' ? '' : 'http://localhost:5000'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
