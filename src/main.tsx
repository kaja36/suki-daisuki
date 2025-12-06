import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// import ThrowDetector from './features/throw/ThrowDetector.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App /> 
    {/* --- 動作確認用 (ThrowDetector) --- */}
    {/* <ThrowDetector />  */}
  </StrictMode>,
)