import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import FaceDemo from './pages/FaceDemo.tsx'
// import ThrowDetector from './features/throw/ThrowDetector.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)