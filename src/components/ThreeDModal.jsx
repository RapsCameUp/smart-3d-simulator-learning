/**
 * ThreeDModal — loads heart.glb from /public/models/heart.glb
 * Auto-centers and scales the model to fill the viewport.
 * OrbitControls: drag to rotate, scroll to zoom.
 */
import React, { useState, useRef, useEffect, Suspense, Component } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { GoogleGenerativeAI } from '@google/generative-ai'
import './ThreeDModal.css'

function HeartModel({ onPartClick, modelType }) {
  const path = modelType === 'inside'
    ? '/models/heart_inside.glb'
    : '/models/heart.glb'

  const gltf = useGLTF(path)
  const groupRef = useRef(null)
  const { camera, scene } = useThree()

const handlePointerDown = (e) => {
  e.stopPropagation()

  const point = e.point.toArray()

  const detectedPart = detectHeartPart(point)

  console.log('Detected part:', detectedPart)

  if (onPartClick) {
    onPartClick({
      part: detectedPart,
      position: point
    })
  }
}

  useEffect(() => {
    if (!groupRef.current) return

    try {
      if (gltf.scene) {
        const clonedScene = gltf.scene.clone(true)

        const box = new THREE.Box3().setFromObject(clonedScene)
        const center = new THREE.Vector3()
        const size = new THREE.Vector3()
        box.getCenter(center)
        box.getSize(size)

        console.log('Model bounds:', { size: size.toArray(), center: center.toArray() })

        clonedScene.position.set(0, 0, 0)
        clonedScene.scale.set(1, 1, 1)

        clonedScene.position.sub(center)

        const maxDim = Math.max(size.x, size.y, size.z)
        const targetSize = 2.4
        if (maxDim > 0) {
          clonedScene.scale.setScalar(targetSize / maxDim)
        }

        // 🔥 IMPORTANT: attach click handler to ALL meshes
        clonedScene.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true

            // Add pointer event
            child.userData.clickable = true
          }
        })

        groupRef.current.clear()
        groupRef.current.add(clonedScene)

        console.log('Heart model added to scene')

      } else {
        console.log('GLTF scene not available, fallback cube')
      }

      camera.position.set(0, 0, 4.5)
      camera.lookAt(0, 0, 0)
      camera.updateProjectionMatrix()

    } catch (error) {
      console.error('Error setting up heart model:', error)
    }
  }, [gltf.scene, camera])

  return (
    <group
      ref={groupRef}
      onPointerDown={handlePointerDown} // 👈 KEY LINE
    />
  )
}

// ─── Loading spinner shown while the GLB fetches ─────────────────────────────
function Loader() {
  return (
    <div className="threed-loading">
      <div className="threed-loading__spinner" />
      <p className="threed-loading__text">Loading 3D model…</p>
    </div>
  )
}

// ─── React error boundary — catches GLB parse / network errors ────────────────
class GLBErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(err) { return { error: err } }
  componentDidCatch(error, errorInfo) {
    console.error('GLB Error Boundary caught an error:', error, errorInfo)
  }
  render() {
    if (this.state.error) {
      return (
        <div className="threed-error">
          <p className="threed-error__icon">⚠️</p>
          <p className="threed-error__title">Could not load model</p>
          <p className="threed-error__detail">
            Make sure <code>heart.glb</code> is in <code>/public/models/</code>
          </p>
          <p className="threed-error__msg">{String(this.state.error.message)}</p>
          <button
            onClick={() => this.setState({ error: null })}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              background: 'rgba(96,192,255,.2)',
              color: '#60c0ff',
              border: '1px solid rgba(96,192,255,.3)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '.85rem'
            }}
          >
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// ─── Exported modal ───────────────────────────────────────────────────────────
export default function ThreeDModal({ onClose, onPartClick }) {
  const [modelKey, setModelKey] = useState(0)

  const [selectedPart, setSelectedPart] = useState(null)

  const [language, setLanguage] = useState('en') // 'en' | 'zu' | 'af'

  const [aiResponse, setAiResponse] = useState('')
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [userQuestion, setUserQuestion] = useState('')

  const info = selectedPart && HEART_INFO[selectedPart.part]
  ? HEART_INFO[selectedPart.part][language]
  : null

  const [modelType, setModelType] = useState('outside') 
// 'outside' | 'inside'

  const handleRetry = () => {
    setModelKey(prev => prev + 1)
  }

  // Gemini AI function
  const askGemini = async (question, partInfo) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY
    if (!apiKey) {
      console.error('Gemini API key not found in environment variables')
      return 'API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.'
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

      const context = `You are a medical expert explaining heart anatomy. The user is asking about the ${partInfo.title}: ${partInfo.text} Function: ${partInfo.function} Importance: ${partInfo.importance}. Keep your response concise (2-3 sentences max) and focused on the question.`

      const result = await model.generateContent(`${context}\n\nQuestion: ${question}`)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Gemini API error:', error)
      return 'Sorry, I encountered an error while processing your question. Please try again.'
    }
  }

  const handleAskQuestion = async () => {
    if (!userQuestion.trim() || !info) return

    setIsAiLoading(true)
    setAiResponse('')

    try {
      const response = await askGemini(userQuestion, info)
      setAiResponse(response)
    } catch (error) {
      setAiResponse('Failed to get response. Please try again.')
    } finally {
      setIsAiLoading(false)
    }
  }

  return (
   <div 
  className="threed-overlay"
  onClick={(e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }}
>
      <div className="threed-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="threed-modal__header">
          <div className="threed-modal__title-group">
            <span className="threed-modal__badge">3D Lab</span>
            <h2 className="threed-modal__title">Human Heart — 3D Model</h2>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleRetry}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '9px',
                border: '1px solid rgba(255,255,255,.12)',
                background: 'rgba(255,255,255,.06)',
                color: 'rgba(255,255,255,.65)',
                cursor: 'pointer',
                fontSize: '.9rem',
                display: 'grid',
                placeItems: 'center'
              }}
              title="Retry loading model"
            >
              ↻
            </button>

            <button
              className="heart-toggle-btn"
              onClick={() => {
                setModelType(prev => prev === 'outside' ? 'inside' : 'outside')
                setSelectedPart(null) // reset popover
                setAiResponse('') // clear AI response
                setUserQuestion('') // clear question
              }}
            >
              {modelType === 'outside' ? 'View Inside The Heart' : 'View Outside The Heart'}
            </button>

            <button className="threed-modal__close" onClick={onClose} aria-label="Close">✕</button>
          </div>
        </div>

        {/* Hint bar */}
        <div className="threed-modal__hint">
          🖱️ <strong>Drag</strong> to rotate &nbsp;·&nbsp; <strong>Scroll</strong> to zoom &nbsp;·&nbsp; <strong>Right-drag</strong> to pan
        </div>

        {/* Canvas */}
        <div className="threed-modal__canvas-wrap">
          <GLBErrorBoundary>
            <Canvas
              key={modelKey}
              gl={{ antialias: true, alpha: false }}
              style={{ width: '100%', height: '100%', display: 'block' }}
              dpr={[1, 2]}
            >
              <color attach="background" args={['#07111f']} />

              {/* Lighting */}
              <ambientLight intensity={0.7} />
              <directionalLight position={[5, 8, 5]}   intensity={1.6} color="#ffe8d8" />
              <directionalLight position={[-4, -3, -4]} intensity={0.5} color="#4466cc" />
              <pointLight       position={[0, 4, 4]}    intensity={1.2} color="#ff7755" distance={15} />
              <pointLight       position={[3, -2, 3]}   intensity={0.5} color="#ffffff" distance={10} />

              {/* The actual GLB model */}
              <HeartModel 
                modelType={modelType}
                onPartClick={(data) => {
                  setSelectedPart(data)
                  setAiResponse('') // Clear previous AI response
                  setUserQuestion('') // Clear previous question

                  if (onPartClick) {
                    onPartClick(data.part)
                  }
                }} 
              />

              <OrbitControls
                enableDamping
                dampingFactor={0.06}
                rotateSpeed={0.7}
                zoomSpeed={0.9}
                minDistance={1}
                maxDistance={20}
              />
            </Canvas>
          </GLBErrorBoundary>
        </div>

      </div>

{selectedPart && selectedPart.part !== 'unknown' && (
  <div 
  className="heart-popover"
  onClick={(e) => e.stopPropagation()}
>

    {/* Header */}
    <div className="heart-popover__header">
      <div className="heart-popover__title">
        {info?.title}
      </div>

<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
<select
  className="heart-popover__select"
  value={language}
  onChange={(e) => setLanguage(e.target.value)}
  onClick={(e) => e.stopPropagation()} // ✅ ADD THIS
>
    <option value="en">English</option>
    <option value="zu">isiZulu</option>
    <option value="af">Afrikaans</option>
  </select>

<button 
  className="heart-popover__close"
  onClick={(e) => {
    e.stopPropagation()
    setSelectedPart(null)
  }}
>
  ✕
</button>
</div>
    </div>

    {/* Description */}
    <div className="heart-popover__section">
      <p className="heart-popover__text">
        {info?.text}
      </p>
    </div>

    {/* Extra details */}
    <div className="heart-popover__section">
      <div className="heart-popover__label">Function</div>
      <p className="heart-popover__subtext">
        {info?.function}
      </p>
    </div>

    <div className="heart-popover__section">
      <div className="heart-popover__label">Why it matters</div>
      <p className="heart-popover__subtext">
        {info?.importance}
      </p>
    </div>

    {/* Input */}
    <div className="heart-popover__input-wrap">
      <input
        className="heart-popover__input"
        placeholder={`Ask about ${info?.title}...`}
        value={userQuestion}
        onChange={(e) => setUserQuestion(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
      />
      <button
        className="heart-popover__send"
        onClick={handleAskQuestion}
        disabled={isAiLoading || !userQuestion.trim()}
      >
        {isAiLoading ? '...' : 'Ask'}
      </button>
    </div>

    {/* AI Response */}
    {aiResponse && (
      <div className="heart-popover__section">
        <div className="heart-popover__label">AI Response</div>
        <p className="heart-popover__ai-response">
          {aiResponse}
        </p>
      </div>
    )}

  </div>
)}
    </div>
  )
}

const HEART_INFO = {
  aorta: {
    en: {
      title: 'Aorta',
      text: 'The aorta is the largest artery in the body, carrying oxygen-rich blood from the heart.',
      function: 'Distributes oxygenated blood to the entire body.',
      importance: 'Critical for supplying oxygen to all organs.'
    },
    zu: {
      title: 'I-Aorta',
      text: 'I-aorta iyimithambo emikhulu ethwala igazi elinomoya-mpilo lisuka enhliziyweni.',
      function: 'Ihambisa igazi elinomoya-mpilo emzimbeni wonke.',
      importance: 'Ibalulekile ekuletheni umoya-mpilo kuwo wonke amalungu omzimba.'
    },
    af: {
      title: 'Aorta',
      text: 'Die aorta is die grootste slagaar wat suurstofryke bloed van die hart vervoer.',
      function: 'Versprei suurstofryke bloed deur die hele liggaam.',
      importance: 'Baie belangrik vir suurstoftoevoer na organe.'
    }
  },

  pulmonary_artery: {
    en: {
      title: 'Pulmonary Artery',
      text: 'Carries oxygen-poor blood from the heart to the lungs.',
      function: 'Sends blood to lungs for oxygenation.',
      importance: 'Essential for breathing and oxygen exchange.'
    },
    zu: {
      title: 'Umthambo Wephaphu',
      text: 'Uthwala igazi elingenawo umoya-mpilo lisuka enhliziyweni liya emaphashini.',
      function: 'Uhambisa igazi ukuze lithole umoya-mpilo emaphashini.',
      importance: 'Ubhekelela ukuphefumula nokushintshana komoya-mpilo.'
    },
    af: {
      title: 'Pulmonêre Slagaar',
      text: 'Vervoer suurstofarme bloed van die hart na die longe.',
      function: 'Stuur bloed na die longe vir suurstof.',
      importance: 'Noodsaaklik vir asemhaling.'
    }
  },

  superior_vena_cava: {
    en: {
      title: 'Superior Vena Cava',
      text: 'Returns blood from the upper body to the heart.',
      function: 'Collects deoxygenated blood from head and arms.',
      importance: 'Keeps blood circulation continuous.'
    },
    zu: {
      title: 'I-Superior Vena Cava',
      text: 'Ibuyisa igazi lisuka ezingxenyeni ezingenhla zomzimba liya enhliziyweni.',
      function: 'Iqoqo igazi elingekho umoya-mpilo ekhanda nasezingalweni.',
      importance: 'Iqinisekisa ukujikeleza kwegazi okuqhubekayo.'
    },
    af: {
      title: 'Superior Vena Cava',
      text: 'Bring bloed van die boonste liggaam terug na die hart.',
      function: 'Versamel suurstofarme bloed van kop en arms.',
      importance: 'Hou bloedsirkulasie aan die gang.'
    }
  }
}

const detectHeartPart = (pos) => {
  const [x, y, z] = pos

  // AORTA (top center)
  if (y > 0.85 && Math.abs(x) < 0.3) {
    return 'aorta'
  }

  // SUPERIOR VENA CAVA (top left)
  if (y > 0.85 && x < -0.2) {
    return 'superior_vena_cava'
  }

  // PULMONARY ARTERY (front/right mid)
  if (y > 0.5 && y < 0.8 && x > 0.3) {
    return 'pulmonary_artery'
  }

  return 'unknown'
}
