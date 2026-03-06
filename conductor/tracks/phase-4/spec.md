# Specification: Phase 4 — Citizen Experience Upgrade

## Objectives
Enhance the citizen interaction layer with advanced media support, accessibility features, and better feedback mechanisms.

## Core Features
1. **4A: Video Support**: Allow mp4/mov uploads (max 50MB) as alternatives to images.
2. **4B: Voice Input**: Web Speech API integration in the report form description.
3. **4C: Multilingual**: Support for English, Hindi, and Gujarati using i18next.
4. **4D: Citizen Verification**: Buttons to confirm resolution or reopen issues with feedback.
5. **4E: Awareness Widget**: Nearby issues mini-map on the citizen dashboard.

## Acceptance Criteria
- Video uploads generate thumbnails and play back in issue details.
- Voice input correctly appends text in the target language.
- Switching languages updates all UI text and badges instantly.
- Reopening an issue notifies relevant officials and updates status to 'reopened'.
- Mini-map shows issues within 2km of the citizen's reported locations.
- Zero regressions in Phase 1-3 features.
