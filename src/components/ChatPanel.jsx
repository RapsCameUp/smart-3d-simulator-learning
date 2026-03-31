/**
 * ChatPanel — AI Tutor UI on the right side.
 * Shows intro message until first message is sent.
 * Supports markdown-style bold (**text**) in AI messages.
 */
import React, { useState, useEffect, useRef } from 'react'
import LanguageSelector from './LanguageSelector'
import './ChatPanel.css'

// Very light markdown renderer: **bold** → <strong>
function renderMarkdown(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    // Handle newlines
    return part.split('\n').map((line, j, arr) => (
      <React.Fragment key={`${i}-${j}`}>
        {line}
        {j < arr.length - 1 && <br />}
      </React.Fragment>
    ))
  })
}

export default function ChatPanel({ messages, isTyping, onSend, language, onLanguageChange, currentPage }) {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const hasMessages = messages.length > 0

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  function handleSend() {
    const text = input.trim()
    if (!text) return
    onSend(text)
    setInput('')
    inputRef.current?.focus()
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chat-panel">
      {/* Header */}
      <div className="chat-panel__header">
        <div className="chat-panel__header-left">
          <div className="chat-panel__avatar">AI</div>
          <div>
            <div className="chat-panel__title">AI Tutor</div>
            <div className="chat-panel__status">
              <span className="chat-panel__dot" />
              Active · Page {currentPage}
            </div>
          </div>
        </div>
        <LanguageSelector value={language} onChange={onLanguageChange} />
      </div>

      {/* Messages area */}
      <div className="chat-panel__messages">
        {!hasMessages && (
          <div className="chat-panel__intro">
            <div className="chat-panel__intro-icon">💬</div>
            <p className="chat-panel__intro-text">
              AI Tutor — Ask me anything about the current slide of the chapter
            </p>
          </div>
        )}

        {messages.map(msg => (
          <div
            key={msg.id}
            className={`chat-msg chat-msg--${msg.role} ${msg.fromModel ? 'chat-msg--from-model' : ''}`}
          >
            {msg.role === 'ai' && (
              <div className="chat-msg__avatar">AI</div>
            )}
            <div className="chat-msg__bubble">
              {msg.role === 'ai' ? renderMarkdown(msg.text) : msg.text}
              {msg.fromModel && (
                <span className="chat-msg__tag">from 3D model</span>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="chat-msg chat-msg--ai">
            <div className="chat-msg__avatar">AI</div>
            <div className="chat-msg__bubble chat-msg__bubble--typing">
              <span /><span /><span />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="chat-panel__input-area">
        <textarea
          ref={inputRef}
          className="chat-panel__textarea"
          placeholder="Ask about this page…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={2}
        />
        <button
          className={`chat-panel__send ${input.trim() ? 'chat-panel__send--active' : ''}`}
          onClick={handleSend}
          disabled={!input.trim()}
          aria-label="Send message"
        >
          ↑
        </button>
      </div>
    </div>
  )
}
