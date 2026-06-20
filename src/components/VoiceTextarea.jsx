import { useEffect, useRef, useState } from 'react'

export default function VoiceTextarea({ value, onChange, placeholder, rows = 4 }) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSupported(false)
      return
    }
    setSupported(true)
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.continuous = true

    recognition.onresult = (event) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      onChange((prev) => (prev ? prev.trim() + ' ' + transcript : transcript))
    }
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)

    recognitionRef.current = recognition
    return () => recognition.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toggleListening() {
    if (!recognitionRef.current) return
    if (listening) {
      recognitionRef.current.stop()
      setListening(false)
    } else {
      recognitionRef.current.start()
      setListening(true)
    }
  }

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-2xl border border-navy-200 bg-white px-4 py-3 pr-14 text-navy-800 placeholder-navy-300 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-200 resize-none"
      />
      {supported && (
        <button
          type="button"
          onClick={toggleListening}
          title={listening ? 'Stop recording' : 'Tell it with your voice'}
          className={`absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full transition ${
            listening
              ? 'bg-gold-500 text-white animate-pulse'
              : 'bg-gold-50 text-gold-600 hover:bg-gold-100'
          }`}
        >
          🎤
        </button>
      )}
      {supported && (
        <p className="mt-1 text-left text-xs text-navy-300">
          {listening ? 'Listening… take your time.' : 'Prefer to tell it out loud? Tap the mic.'}
        </p>
      )}
    </div>
  )
}
