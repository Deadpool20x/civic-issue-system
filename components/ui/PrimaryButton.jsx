"use client";

import React from "react";

const PrimaryButton = ({
    as: Component = "button",
    className = "",
    children,
    ...rest
}) => (
    <Component
        className={`inline-flex items-center justify-center rounded-xl bg-brand-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-primary hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...rest}
    >
        {children}
    </Component>
);

export default PrimaryButton;
