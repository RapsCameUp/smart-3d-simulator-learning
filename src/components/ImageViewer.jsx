/**
 * ImageViewer — left panel of HeartModule.
 * Displays heart textbook images with prev/next navigation.
 * Emits onPageChange(newIndex) so chat stays in sync.
 */
import React, { useState } from 'react'
import './ImageViewer.css'

const TOTAL = 5
// Tries JPG first; if not found the onerror handler reveals the SVG fallback.
// Replace with real .jpg textbook scans when available.
const IMAGES = Array.from({ length: TOTAL }, (_, i) => ({
  src: `/images/heartpage${i + 1}.png`,
  fallbackSrc: `/images/heartpage${i + 1}.svg`,
  alt: `Heart anatomy — page ${i + 1}`,
  caption: [
    'Overview: The Human Heart — Anatomy & Structure',
    'Heart Valves — Mitral, Tricuspid, Aortic & Pulmonary',
    'Coronary Circulation — Arteries & Blood Supply',
    'Electrical Conduction System — SA Node to Purkinje Fibres',
    'Cardiac Pathology — Disease & Clinical Relevance',
  ][i],
}))

export default function ImageViewer({ onPageChange }) {
  const [current, setCurrent] = useState(0)
  const [fade, setFade] = useState(true)

  function goTo(idx) {
    if (idx === current) return
    setFade(false)
    setTimeout(() => {
      setCurrent(idx)
      onPageChange(idx + 1) // 1-based page number
      setFade(true)
    }, 180)
  }

  const prev = () => goTo(current > 0 ? current - 1 : TOTAL - 1)
  const next = () => goTo(current < TOTAL - 1 ? current + 1 : 0)

  return (
    <div className="image-viewer">
      {/* Top bar */}
      <div className="image-viewer__topbar">
        <span className="image-viewer__subject">Life Sciences · The Human Heart</span>
        <span className="image-viewer__pager">Page {current + 1} of {TOTAL}</span>
      </div>

      {/* Image area */}
      <div className="image-viewer__stage">
        <img
          key={current}
          src={IMAGES[current].src}
          alt={IMAGES[current].alt}
          className={`image-viewer__img ${fade ? 'image-viewer__img--visible' : ''}`}
          onError={e => {
            // Try SVG fallback first; if that also fails show placeholder div
            if (!e.target.src.endsWith('.svg')) {
              e.target.src = IMAGES[current].fallbackSrc
            } else {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }
          }}
        />
        {/* Placeholder shown when image file is missing */}
        <div className="image-viewer__placeholder" style={{ display: 'none' }}>
          <div className="image-viewer__placeholder-inner">
            <span className="image-viewer__placeholder-icon">🫀</span>
            <p className="image-viewer__placeholder-title">{IMAGES[current].caption}</p>
            <p className="image-viewer__placeholder-hint">
              Add <code>heartpage{current + 1}.png</code> to <code>/public/images/</code>
            </p>
          </div>
        </div>
      </div>

      {/* Caption */}
      <div className="image-viewer__caption">
        {IMAGES[current].caption}
      </div>

      {/* Navigation */}
      <div className="image-viewer__nav">
        <button className="iv-btn" onClick={prev} aria-label="Previous page">
          ← Prev
        </button>

        {/* Dot indicators */}
        <div className="image-viewer__dots">
          {IMAGES.map((_, i) => (
            <button
              key={i}
              className={`iv-dot ${i === current ? 'iv-dot--active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>

        <button className="iv-btn" onClick={next} aria-label="Next page">
          Next →
        </button>
      </div>
    </div>
  )
}
