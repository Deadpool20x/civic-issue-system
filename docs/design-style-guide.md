# Civic Issue System - Design Style Guide

## Overview
This guide captures the visual design language from the reference image to ensure consistent, modern, and accessible UI components across the Civic Issue System.

## Color Palette

### Primary Colors
- **Primary Blue**: `#2563EB` (Blue-600)
- **Primary Dark**: `#1E40AF` (Blue-800)
- **Primary Light**: `#3B82F6` (Blue-500)

### Secondary Colors
- **Accent Indigo**: `#6366F1` (Indigo-500)
- **Accent Purple**: `#8B5CF6` (Violet-500)

### Neutral Colors
- **Background Primary**: `#FFFFFF` (White)
- **Background Secondary**: `#F9FAFB` (Gray-50)
- **Background Tertiary**: `#F3F4F6` (Gray-100)
- **Border**: `#E5E7EB` (Gray-200)
- **Text Primary**: `#111827` (Gray-900)
- **Text Secondary**: `#6B7280` (Gray-500)
- **Text Tertiary**: `#9CA3AF` (Gray-400)

### Status Colors
- **Success**: `#10B981` (Emerald-500)
- **Warning**: `#F59E0B` (Amber-500)
- **Error**: `#EF4444` (Red-500)
- **Info**: `#3B82F6` (Blue-500)

## Typography

### Font Hierarchy
- **Primary Font**: Inter (or system-ui fallback)
- **Headings**: 
  - H1: 32px / 40px, FontWeight: 700
  - H2: 24px / 32px, FontWeight: 600
  - H3: 20px / 28px, FontWeight: 600
  - H4: 18px / 24px, FontWeight: 600
- **Body Text**: 16px / 24px, FontWeight: 400
- **Small Text**: 14px / 20px, FontWeight: 400
- **Caption**: 12px / 16px, FontWeight: 400

### Text Colors
- **Primary Text**: `#111827` (Gray-900)
- **Secondary Text**: `#6B7280` (Gray-500)
- **Muted Text**: `#9CA3AF` (Gray-400)
- **Link Text**: `#2563EB` (Blue-600)
- **Link Hover**: `#1E40AF` (Blue-800)

## Spacing System

### Scale
- **Base Unit**: 4px
- **Spacing Values**: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

### Common Usage
- **Component Padding**: 16px (1rem)
- **Section Spacing**: 48px (3rem)
- **Element Spacing**: 12px (0.75rem)
- **Tight Spacing**: 8px (0.5rem)

## Border Radius

### Scale
- **Small**: 4px (0.25rem)
- **Medium**: 8px (0.5rem)
- **Large**: 12px (0.75rem)
- **Extra Large**: 16px (1rem)
- **Full**: 9999px (for pills/avatars)

### Usage
- **Buttons**: 8px (medium)
- **Cards**: 12px (large)
- **Inputs**: 8px (medium)
- **Avatars**: 9999px (full)

## Shadows

### Shadow Scale
- **Small**: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`
- **Medium**: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
- **Large**: `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`
- **Extra Large**: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`

### Usage
- **Buttons**: Small shadow on hover
- **Cards**: Medium shadow
- **Modals**: Large shadow
- **Tooltips**: Small shadow

## Components

### Buttons

#### Primary Button
- **Background**: `#2563EB` (Blue-600)
- **Text**: White
- **Border Radius**: 8px
- **Padding**: 12px 24px
- **Font Weight**: 500
- **Hover**: `#1E40AF` (Blue-800)
- **Active**: `#1D4ED8` (Blue-700)

#### Secondary Button
- **Background**: Transparent
- **Border**: `#E5E7EB` (Gray-200)
- **Text**: `#374151` (Gray-700)
- **Hover**: `#F9FAFB` (Gray-50)
- **Active**: `#F3F4F6` (Gray-100)

#### Ghost Button
- **Background**: Transparent
- **Text**: `#2563EB` (Blue-600)
- **Hover**: `#EFF6FF` (Blue-50)
- **Active**: `#DBEAFE` (Blue-100)

### Cards

#### Base Card
- **Background**: `#FFFFFF` (White)
- **Border**: `#E5E7EB` (Gray-200)
- **Border Radius**: 12px
- **Padding**: 24px
- **Shadow**: Medium shadow
- **Hover**: Slightly larger shadow

#### Status Card
- **Background**: `#FFFFFF` (White)
- **Border Left**: 4px solid (color varies by status)
- **Padding**: 16px 20px
- **Border Radius**: 8px

### Form Elements

#### Input Fields
- **Background**: `#FFFFFF` (White)
- **Border**: `#E5E7EB` (Gray-200)
- **Border Radius**: 8px
- **Padding**: 12px 16px
- **Focus**: Border `#2563EB` (Blue-600), Ring `#2563EB` 2px
- **Error**: Border `#EF4444` (Red-500)

#### Labels
- **Font Weight**: 500
- **Color**: `#374151` (Gray-700)
- **Margin Bottom**: 4px

### Navigation

#### Header
- **Background**: `#FFFFFF` (White)
- **Border Bottom**: `#E5E7EB` (Gray-200)
- **Height**: 64px
- **Padding**: 0 24px

#### Sidebar
- **Background**: `#FFFFFF` (White)
- **Border Right**: `#E5E7EB` (Gray-200)
- **Width**: 256px
- **Padding**: 16px

#### Nav Items
- **Padding**: 12px 16px
- **Border Radius**: 8px
- **Hover**: `#F3F4F6` (Gray-100)
- **Active**: `#EFF6FF` (Blue-50) + Text `#2563EB` (Blue-600)

## Layout Patterns

### Container
- **Max Width**: 1200px
- **Padding**: 0 24px
- **Center**: Auto margins

### Grid System
- **Columns**: 12
- **Gap**: 24px
- **Responsive**: 
  - Mobile: 1 column
  - Tablet: 2 columns
  - Desktop: 3-4 columns

### Sections
- **Padding**: 64px 24px
- **Background**: Alternating between `#FFFFFF` and `#F9FAFB`

## Iconography

### Style
- **Type**: Linear icons
- **Size**: 16px, 20px, 24px
- **Color**: Inherit from text or `#6B7280` (Gray-500)
- **Stroke Width**: 2px

### Common Icons
- **Actions**: Chevron, Plus, Minus, X
- **Navigation**: Menu, Home, User, Settings
- **Status**: Check, Alert, Info, Alert Circle

## Animation & Transitions

### Duration
- **Fast**: 150ms
- **Normal**: 250ms
- **Slow**: 350ms

### Easing
- **Ease Out**: `cubic-bezier(0, 0, 0.2, 1)`
- **Ease In Out**: `cubic-bezier(0.4, 0, 0.2, 1)`

### Common Transitions
- **Hover**: Background color 150ms ease-out
- **Focus**: Ring 150ms ease-out
- **Modal**: Opacity 250ms ease-in-out
- **Dropdown**: Transform 200ms ease-out

## Accessibility Guidelines

### Contrast Ratios
- **Normal Text**: 4.5:1 minimum
- **Large Text**: 3:1 minimum
- **Interactive Elements**: 3:1 minimum

### Focus States
- **Outline**: 2px solid `#2563EB` (Blue-600)
- **Ring**: 2px solid `#2563EB` with 2px offset
- **Skip Links**: Visible on focus

### Screen Reader Support
- **Semantic HTML**: Use proper elements
- **ARIA Labels**: For interactive elements
- **Alt Text**: For meaningful images

## Responsive Design

### Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px - 1280px
- **Large Desktop**: 1280px+

### Mobile Considerations
- **Touch Targets**: Minimum 44px
- **Font Size**: Minimum 16px for inputs
- **Navigation**: Collapsible menu
- **Cards**: Single column

## Implementation Notes

### CSS Custom Properties
```css
:root {
  --color-primary: #2563EB;
  --color-primary-dark: #1E40AF;
  --color-secondary: #6B7280;
  --color-background: #FFFFFF;
  --color-border: #E5E7EB;
  --font-primary: 'Inter', system-ui, sans-serif;
  --spacing-unit: 4px;
  --border-radius-medium: 8px;
  --shadow-medium: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

### Tailwind CSS Classes
- **Primary Button**: `bg-blue-600 hover:bg-blue-800 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-150`
- **Card**: `bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-200`
- **Input**: `w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent`

This style guide should be used as a reference for all new components and features to maintain visual consistency across the Civic Issue System.
