"use client";

import React from "react";

const Card = ({
    className = "",
    children,
    ...rest
}) => (
    <div
        className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 ${className}`}
        {...rest}
    >
        {children}
    </div>
);

export default Card;
