"use client";

import React from "react";

const StarBorderButton = ({
    as: Component = "button",
    className = "",
    color = "#3B82F6", // Default to civic accent blue
    speed = "6s",
    thickness = 1,
    children,
    ...rest
}) => (
    <Component
        className={`relative inline-block overflow-hidden rounded-[20px] ${className}`}
        {...rest}
        style={{
            padding: `${thickness}px 0`,
            ...(rest.style || {})
        }}
    >
        <div
            className="absolute bottom-[-11px] right-[-250%] z-0 h-[50%] w-[300%] opacity-70 rounded-full animate-star-movement-bottom"
            style={{
                background: `radial-gradient(circle, ${color}, transparent 10%)`,
                animationDuration: speed
            }}
        />
        <div
            className="absolute top-[-10px] left-[-250%] z-0 h-[50%] w-[300%] opacity-70 rounded-full animate-star-movement-top"
            style={{
                background: `radial-gradient(circle, ${color}, transparent 10%)`,
                animationDuration: speed
            }}
        />
        <div className="relative z-10 rounded-[20px] border border-civic-border bg-civic-card px-[26px] py-[16px] text-center text-[16px] text-civic-text-primary">
            {children}
        </div>
    </Component>
);

export default StarBorderButton;
