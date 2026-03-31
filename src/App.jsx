import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import HeartModule from './pages/HeartModule'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/life-sciences/heart" element={<HeartModule />} />
      </Routes>
    </BrowserRouter>
  )
}
