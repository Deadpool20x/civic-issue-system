'use client'
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from '@/lib/useStaticTranslation'
import toast from 'react-hot-toast'

export default function VoiceInput({ onTranscript, language = 'en-IN' }) {
    const { t } = useTranslation()
    const [isListening, setIsListening] = useState(false)
    const [isSupported, setIsSupported] = useState(false)
    const recognitionRef = useRef(null)

    useEffect(() => {
        if (typeof window !== 'undefined' &&
            ('webkitSpeechRecognition' in window ||
                'SpeechRecognition' in window)) {
            setIsSupported(true)
        }
    }, [])

    const startListening = () => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition

        const recognition = new SpeechRecognition()
        recognition.lang = language
        recognition.continuous = false
        recognition.interimResults = false

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript
            onTranscript(transcript)
            setIsListening(false)
            toast.success(t('report.voiceDescriptionHint', 'Voice transcribed successfully!'))
        }

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error)
            setIsListening(false)
            if (event.error === 'not-allowed') {
                toast.error('Microphone access denied')
            }
        }

        recognition.onend = () => setIsListening(false)

        recognitionRef.current = recognition
        recognition.start()
        setIsListening(true)
    }

    const stopListening = () => {
        recognitionRef.current?.stop()
        setIsListening(false)
    }

    if (!isSupported) return null

    return (
        <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className={`
                absolute right-4 bottom-4 w-10 h-10 rounded-full
                flex items-center justify-center transition-all z-10
                ${isListening
                    ? 'bg-red-500 animate-pulse text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                    : 'bg-[#333333] text-[#AAAAAA] hover:bg-gold hover:text-black shadow-lg'
                }
            `}
            title={isListening ? 'Stop recording' : t('report.voiceHint')}
        >
            <span className="text-xl">🎤</span>
        </button>
    )
}
