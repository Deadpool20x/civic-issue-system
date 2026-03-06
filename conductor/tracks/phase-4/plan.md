# Implementation Plan: Phase 4

## Phase 1: Foundation & Internationalization
- [ ] Task 1.1: Install i18next packages
- [ ] Task 1.2: Set up `lib/i18n.js` and locale JSON files
- [ ] Task 1.3: Wrap `app/layout.js` with i18n support
- [ ] Task 1.4: Implement `LanguageSelector.jsx` component
- [ ] Task 1.5: Apply translations to Landing Page and Auth pages
- [ ] Task 1.6: Apply translations to Citizen Dashboard and Report Form

## Phase 2: Citizen Feedback Loop
- [ ] Task 2.1: Update `Issue` model with verification fields
- [ ] Task 2.2: Implement `POST /api/issues/[id]/confirm` endpoint
- [ ] Task 2.3: Add confirm/reopen buttons to Citizen Dashboard
- [ ] Task 2.4: Implement Reopen Reason modal

## Phase 3: Voice & Accessibility
- [ ] Task 3.1: Implement `VoiceInput.jsx` using Web Speech API
- [ ] Task 3.2: Integrate Voice Input into Report Form description

## Phase 4: Advanced Media (Video)
- [x] Task 4.1: Update `Issue` model for video support
- [x] Task 4.2: Enhance `ImageUploader.jsx` with Video toggle and logic
- [x] Task 4.3: Implement video playback in Issue Detail page
- [x] Task 4.4: Update AI detection to use video thumbnails

## Phase 5: Location Awareness
- [ ] Task 5.1: Create/Update public issues API with geospatial support
- [ ] Task 5.2: Implement `NearbyIssuesMap.jsx` component
- [ ] Task 5.3: Integrate Mini-map into Citizen Dashboard

## Phase 6: Final Verification
- [ ] Task 6.1: Run regression tests for Phases 1-3
- [ ] Task 6.2: Final visual and accessibility audit
