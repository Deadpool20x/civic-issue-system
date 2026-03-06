'use client'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

export default function VoiceInput({ onTranscript, locale }) {
    const [isListening, setIsListening] = useState(false)
    const { t } = useTranslation()

    const startListening = async (e) => {
        if (e) e.preventDefault();

        if (!('webkitSpeechRecognition' in window) && !('speechRecognition' in window)) {
            toast.error('Voice input is not supported in this browser.')
            return
        }

        try {
            // First, explicitly request microphone permissions to "wake up" the hardware.
            // This prevents many ambiguous 'audio-capture' errors across different OSs/browsers.
            if (navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    // Immediately stop this specific probe stream, since SpeechRecognition handles its own
                    stream.getTracks().forEach(track => track.stop());
                } catch (micErr) {
                    console.error('Microphone access error:', micErr);
                    toast.error('Microphone missing or access denied. Please check your system settings.', { duration: 5000 });
                    return;
                }
            }

            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
            const recognition = new SpeechRecognition()

            recognition.lang = locale === 'hi' ? 'hi-IN' : locale === 'gu' ? 'gu-IN' : 'en-US'
            recognition.continuous = false
            recognition.interimResults = false

            recognition.onstart = () => {
                console.log('Voice recognition started');
                setIsListening(true)
            }

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript
                console.log('Voice result:', transcript);
                onTranscript(transcript)
                setIsListening(false)
            }

            recognition.onerror = (error) => {
                console.error('Voice recognition error:', error);
                setIsListening(false)
                if (error.error === 'not-allowed') {
                    toast.error('Microphone access denied. Please allow microphone permissions.');
                } else if (error.error === 'audio-capture') {
                    toast.error('Audio capture failed. Please check if your microphone is connected and working.', { duration: 5000 });
                } else if (error.error === 'no-speech') {
                    toast.error('No speech detected. Please speak closer to the microphone and try again.', { duration: 4000 });
                } else {
                    toast.error(`Voice input failed (${error.error}). Please try again.`);
                }
            }

            recognition.onend = () => {
                console.log('Voice recognition ended');
                setIsListening(false)
            }

            recognition.start()
        } catch (err) {
            console.error('Failed to start recognition', err);
            toast.error('Cannot start voice recognition.');
        }
    }

    return (
        <button
            type="button"
            onClick={startListening}
            className={`
        p-2 rounded-full transition-all duration-300
        ${isListening
                    ? 'bg-red-500 text-white animate-pulse scale-110 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                    : 'bg-gold/10 text-gold hover:bg-gold/20'
                }
      `}
            title={t('report.voiceHint')}
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isListening ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                )}
            </svg>
        </button>
    )
}
