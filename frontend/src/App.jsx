import { useState } from 'react'
import { Analytics } from "@vercel/analytics/react"
import './App.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppRoutes from './routes/routes';

function App() {
 

  return (
    <>
    <Analytics/>
     <ToastContainer />
      <AppRoutes />
    </>
  )
}

export default App
