"use client";

import React from "react";

const Card = ({
    className = "",
    children,
    ...rest
}) => (
    <div
        className={`bg-neutral-surface rounded-2xl border border-neutral-border shadow-sm p-6 ${className}`}
        {...rest}
    >
        {children}
    </div>
);

export default Card;
