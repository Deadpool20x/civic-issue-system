"use client";

import React from "react";

const Card = ({
    className = "",
    children,
    ...rest
}) => (
    <div
        className={`bg-card rounded-card border border-border shadow-sm p-6 ${className}`}
        {...rest}
    >
        {children}
    </div>
);

export default Card;
