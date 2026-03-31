/**
 * LandingPage — full-screen entry point.
 * Three subject cards lead to their respective modules.
 * Only "Life Sciences" is wired up; others show a coming-soon alert.
 */
import React from 'react'
import { useNavigate } from 'react-router-dom'
import './LandingPage.css'

const SUBJECTS = [
  {
    id: 'life',
    label: 'Life Sciences',
    icon: '🫀',
    description: 'Explore the human body — heart, cells, and beyond.',
    color: '#0a6ebd',
    gradient: 'linear-gradient(135deg,#0a6ebd 0%,#0d9488 100%)',
    available: true,
  },
  {
    id: 'physical',
    label: 'Physical Sciences',
    icon: '⚗️',
    description: 'Uncover chemistry, physics, and the laws of the universe.',
    color: '#7c3aed',
    gradient: 'linear-gradient(135deg,#7c3aed 0%,#ec4899 100%)',
    available: false,
  },
  {
    id: 'math',
    label: 'Mathematics',
    icon: '∑',
    description: 'Master calculus, algebra, geometry and more.',
    color: '#d97706',
    gradient: 'linear-gradient(135deg,#d97706 0%,#ef4444 100%)',
    available: false,
  },
]

export default function LandingPage() {
  const navigate = useNavigate()

  function handleSubject(subject) {
    if (subject.id === 'life') navigate('/life-sciences/heart')
    else alert(`${subject.label} modules are coming soon!`)
  }

  return (
    <div className="landing">
      {/* Background mesh */}
      <div className="landing__bg" aria-hidden="true">
        <div className="blob blob--1" />
        <div className="blob blob--2" />
        <div className="blob blob--3" />
      </div>

      <header className="landing__header">
        <div className="landing__logo">ILS</div>
        <span className="landing__tagline">Smart LMS</span>
      </header>

      <main className="landing__main">
        <div className="landing__hero">
          <h1 className="landing__title">
            Learn Smarter.<br />
            <em>Explore Deeper.</em>
          </h1>
          <p className="landing__sub">
            AI-powered lessons · Interactive 3D models · Multilingual support
          </p>
        </div>

        <div className="landing__cards">
          {SUBJECTS.map(s => (
            <button
              key={s.id}
              className={`subject-card ${!s.available ? 'subject-card--soon' : ''}`}
              onClick={() => handleSubject(s)}
              style={{ '--card-gradient': s.gradient, '--card-color': s.color }}
            >
              <div className="subject-card__glow" aria-hidden="true" />
              <span className="subject-card__icon">{s.icon}</span>
              <span className="subject-card__label">{s.label}</span>
              <p className="subject-card__desc">{s.description}</p>
              {!s.available && <span className="subject-card__badge">Coming Soon</span>}
              <div className="subject-card__arrow">→</div>
            </button>
          ))}
        </div>
      </main>

      <footer className="landing__footer">
        <p>© 2026 Smart LMS · Built for South African learners</p>
      </footer>
    </div>
  )
}
