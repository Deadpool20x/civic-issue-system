"use client";

import React, { useRef, useState } from "react";

const SpotlightCard = ({
    className = "",
    spotlightColor = "rgba(255, 255, 255, 0.25)",
    children
}) => {
    const cardRef = useRef(null);
    const [isFocused, setIsFocused] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (event) => {
        if (!cardRef.current || isFocused) return;
        const rect = cardRef.current.getBoundingClientRect();
        setPosition({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    };

    const handleFocus = () => {
        setIsFocused(true);
        setOpacity(0.6);
    };

    const handleBlur = () => {
        setIsFocused(false);
        setOpacity(0);
    };

    const handleMouseEnter = () => setOpacity(0.6);
    const handleMouseLeave = () => setOpacity(0);

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900 p-8 ${className}`}
        >
            <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out"
                style={{
                    opacity,
                    background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`
                }}
            />
            {children}
        </div>
    );
};

export default SpotlightCard;
