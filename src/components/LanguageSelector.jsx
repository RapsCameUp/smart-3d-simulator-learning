/**
 * LanguageSelector — dropdown for choosing the AI tutor language.
 */
import React from 'react'
import './LanguageSelector.css'

const LANGUAGES = [
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'zu', label: 'isiZulu',  flag: '🇿🇦' },
  { code: 'af', label: 'Afrikaans',flag: '🇿🇦' },
]

export default function LanguageSelector({ value, onChange }) {
  return (
    <div className="lang-selector">
      <label className="lang-selector__label" htmlFor="lang-select">
        🌍 Language
      </label>
      <select
        id="lang-select"
        className="lang-selector__select"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {LANGUAGES.map(l => (
          <option key={l.code} value={l.code}>
            {l.flag} {l.label}
          </option>
        ))}
      </select>
    </div>
  )
}
