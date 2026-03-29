'use client'
import { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/useStaticTranslation'

const DISCLAIMER_KEY = 'civicpulse_disclaimer_accepted'

export default function DisclaimerModal({ onAccept }) {
    const { t } = useTranslation()
    const [visible, setVisible] = useState(false)
    const [checked, setChecked] = useState(false)

    useEffect(() => {
        const accepted = sessionStorage.getItem(DISCLAIMER_KEY)
        if (!accepted) {
            setVisible(true)
        } else {
            onAccept?.()
        }
    }, [onAccept])

    function handleAccept() {
        sessionStorage.setItem(DISCLAIMER_KEY, 'true')
        setVisible(false)
        onAccept?.()
    }

    function handleCancel() {
        window.history.back()
    }

    if (!visible) return null

    // Get excluded topics from translation or fallback
    const excludedTopics = t('disclaimer.excludedTopics', { returnObjects: true }) || []

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm
                    flex items-center justify-center z-50 p-4">
            <div className="bg-[#1A1A1A] border border-[#333333]
                      rounded-[20px] p-6 w-full max-w-lg
                      max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-amber-500/20 border border-amber-500/40
                          rounded-full flex items-center justify-center text-xl
                          flex-shrink-0">
                        ⚠️
                    </div>
                    <div>
                        <h2 className="text-white font-bold text-lg">{t('disclaimer.title')}</h2>
                        <p className="text-[#AAAAAA] text-sm">{t('disclaimer.subtitle')}</p>
                    </div>
                </div>

                {/* Excluded topics */}
                <div className="bg-[#222222] border border-[#333333]
                        rounded-[16px] p-4 mb-4">
                    <p className="text-white font-medium mb-3 text-sm">
                        {t('disclaimer.excludedTitle')}
                    </p>
                    <ul className="space-y-2">
                        {Array.isArray(excludedTopics) && excludedTopics.map((topic, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <span className="text-red-400 mt-0.5 flex-shrink-0 text-sm">
                                    ✗
                                </span>
                                <span className="text-[#AAAAAA] text-sm">{topic}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* What CAN be reported */}
                <div className="bg-green-500/10 border border-green-500/20
                        rounded-[16px] p-4 mb-5">
                    <p className="text-green-400 font-medium mb-1 text-sm">
                        {t('disclaimer.allowedTitle')}
                    </p>
                    <p className="text-[#AAAAAA] text-sm leading-relaxed">
                        {t('disclaimer.allowedDesc')}
                    </p>
                </div>

                {/* Checkbox */}
                <label className="flex items-start gap-3 cursor-pointer mb-6">
                    <div
                        onClick={() => setChecked(!checked)}
                        className={`w-5 h-5 rounded flex-shrink-0 mt-0.5
                        border-2 flex items-center justify-center
                        transition cursor-pointer
                        ${checked
                                ? 'bg-gold border-gold'
                                : 'border-[#555555] bg-transparent'
                            }`}
                    >
                        {checked && (
                            <span className="text-black text-xs font-bold">✓</span>
                        )}
                    </div>
                    <span className="text-[#AAAAAA] text-sm leading-relaxed">
                        {t('disclaimer.confirmation')}
                    </span>
                </label>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={handleAccept}
                        disabled={!checked}
                        className="flex-1 bg-gold text-black font-bold
                       rounded-full py-3 transition
                       disabled:opacity-40 disabled:cursor-not-allowed
                       hover:bg-gold-dark"
                    >
                        {t('disclaimer.proceed')}
                    </button>
                    <button
                        onClick={handleCancel}
                        className="flex-1 border border-[#333333] text-[#AAAAAA]
                       rounded-full py-3 hover:border-[#555555] transition"
                    >
                        {t('disclaimer.cancel')}
                    </button>
                </div>
            </div>
        </div>
    )
}
