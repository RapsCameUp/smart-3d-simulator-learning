/**
 * HeartModule — split-screen learning page.
 * Left: ImageViewer (textbook pages)
 * Right: ChatPanel (AI tutor)
 * Floating button opens ThreeDModal.
 */
import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ImageViewer from '../components/ImageViewer'
import ChatPanel from '../components/ChatPanel'
import ThreeDModal from '../components/ThreeDModal'
import { useChat } from '../hooks/useChat'
import './HeartModule.css'

export default function HeartModule() {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [language, setLanguage] = useState('en')
  const [showModal, setShowModal] = useState(false)

  // useChat wires together page context + language for mock AI
  const { messages, isTyping, sendMessage, sendPartClick } = useChat(currentPage, language)

  // Called when 3D model part is clicked — sends query to chat
const handlePartClick = useCallback((partName) => {
  setShowModal(false)
  sendPartClick(partName)
}, [sendPartClick])

  return (
    <div className="heart-module">
      {/* ── Top Navigation Bar ─────────────────────────────────────────── */}
      <header className="hm-navbar">
        <button className="hm-navbar__back">
          ←
        </button>

        <div className="hm-navbar__breadcrumb">
          <span>Life Sciences</span>
          <span className="hm-navbar__sep">›</span>
          <span className="hm-navbar__current">The Human Heart</span>
        </div>

        <button
          className="hm-navbar__3d-btn"
          onClick={() => setShowModal(true)}
        >
          <span className="hm-navbar__3d-icon">⬡</span>
          Open 3D Simulation
        </button>
      </header>

      {/* ── Split Screen ───────────────────────────────────────────────── */}
      <main className="hm-split">
        {/* Left — Image Viewer */}
        <section className="hm-split__left">
          <ImageViewer onPageChange={setCurrentPage} />
        </section>


        {/* Right — AI Chat */}

      </main>

      {/* ── 3D Modal ───────────────────────────────────────────────────── */}
      {showModal && (
        <ThreeDModal
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
