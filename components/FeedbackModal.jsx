'use client'
import { useState } from 'react'

export default function FeedbackModal({ isOpen, onClose, onSubmit, title, placeholder }) {
    const [text, setText] = useState('')

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-card w-full max-w-md border border-border rounded-3xl p-8 shadow-2xl animate-scale-up">
                <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{title}</h3>
                <textarea
                    autoFocus
                    className="w-full bg-input border border-border rounded-xl p-4 text-white min-h-[120px] focus:border-gold outline-none transition-colors mb-6"
                    placeholder={placeholder}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-6 rounded-pill border border-border text-white font-bold hover:bg-white/5 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSubmit(text)}
                        className="flex-1 py-3 px-6 rounded-pill bg-gold text-page-bg font-bold hover:scale-105 transition-all shadow-lg shadow-gold/20"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    )
}
