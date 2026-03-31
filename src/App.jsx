import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HeartModule from './pages/HeartModule'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HeartModule />} />
        <Route path="/life-sciences/heart" element={<HeartModule />} />
      </Routes>
    </BrowserRouter>
  )
}
