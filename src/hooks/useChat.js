/**
 * useChat — manages chat messages and mock AI responses.
 * Keeps track of the current slide index so AI replies can
 * reference "what page we're on".
 */
import { useState, useCallback } from 'react'

// ─── Mock AI responses keyed by language ─────────────────────────────────────
const MOCK_RESPONSES = {
  en: (page, userMsg) => {
    const pageContexts = {
      1: 'the overall anatomy of the heart — its four chambers and major vessels.',
      2: 'the atrioventricular valves: the mitral valve on the left and tricuspid on the right.',
      3: 'the coronary arteries, which supply oxygenated blood to the heart muscle itself.',
      4: 'the electrical conduction system — the SA node, AV node, and Bundle of His.',
      5: 'common cardiac pathologies including atherosclerosis and myocardial infarction.',
    }
    const ctx = pageContexts[page] || 'this section of the heart.'
    return `On **page ${page}**, the diagram is showing ${ctx}\n\nRegarding your question — "${userMsg}" — the heart is a four-chambered muscular organ that pumps roughly 5 litres of blood per minute. This part is particularly important for understanding how oxygenated and deoxygenated blood are kept separate in the systemic and pulmonary circuits. Would you like me to go deeper on any aspect?`
  },

  zu: (page, userMsg) => {
    return `Kukhasi ${page}, isithombe sibonisa indlela inhliziyo isebenza ngayo.\n\nMayelana nombuzo wakho — "${userMsg}" — inhliziyo iyisithako esibalulekile somzimba womuntu. Igazi eligcwele okusisoya likhishwa enhliziyweni libheke emzimbeni wonke. Ingabe ufuna ukwazi kabanzi?`
  },

  af: (page, userMsg) => {
    return `Op **bladsy ${page}** wys die diagram die anatomie van die hart.\n\nMet betrekking tot jou vraag — "${userMsg}" — die hart is 'n spierrige orgaan met vier kamers. Dit pomp ongeveer 5 liter bloed per minuut deur die liggaam. Die linker ventrikel is die kragtigste kamer en stoot bloed in die aorta. Wil jy meer weet?`
  },
}

// ─── Part-click canned explanations ──────────────────────────────────────────
const PART_EXPLANATIONS = {
  en: (partName) =>
    `**${partName}** — Great question! This structure plays a vital role in cardiac function. `
    + `It works in coordination with surrounding tissues to maintain efficient blood flow. `
    + `In the context of this 3D model, you can see how it connects to adjacent chambers and vessels. `
    + `Any abnormality here can significantly affect cardiac output.`,

  zu: (partName) =>
    `**${partName}** — Leli lungelo libalulekile enhliziyweni. Lisebenza kanye nezinye izingxenye ukuqinisekisa ukuhamba kwegazi kahle. Ingabe ufuna ukwazi kabanzi ngaleli lungelo?`,

  af: (partName) =>
    `**${partName}** — Hierdie struktuur is uiters belangrik vir die hartfunksie. Dit werk saam met omliggende weefsel om effektiewe bloedvloei te handhaaf. Wil jy meer inligting hê?`,
}

export function useChat(currentPage, language) {
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)

  // Simulate AI thinking delay then push response
  const addAIMessage = useCallback((text) => {
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      setMessages(prev => [...prev, { role: 'ai', text, id: Date.now() }])
    }, 900 + Math.random() * 600)
  }, [])

  const sendMessage = useCallback((userText) => {
    const userMsg = { role: 'user', text: userText, id: Date.now() }
    setMessages(prev => [...prev, userMsg])

    const respFn = MOCK_RESPONSES[language] || MOCK_RESPONSES.en
    addAIMessage(respFn(currentPage, userText))
  }, [currentPage, language, addAIMessage])

  // Called when user clicks a part in the 3D model
  const sendPartClick = useCallback((partName) => {
    const question = `Explain the ${partName}`
    const userMsg = { role: 'user', text: question, id: Date.now(), fromModel: true }
    setMessages(prev => [...prev, userMsg])

    const respFn = PART_EXPLANATIONS[language] || PART_EXPLANATIONS.en
    addAIMessage(respFn(partName))
  }, [language, addAIMessage])

  return { messages, isTyping, sendMessage, sendPartClick }
}
