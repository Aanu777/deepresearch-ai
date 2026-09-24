# DeepResearch AI V2

## 0. V2 Vision

Transform DeepResearch AI from a feature-heavy prototype into a polished, simple, professional AI product while preserving the existing backend research engine.

### Core principles
- Do not rewrite or destabilize existing backend research logic.
- Prefer additive changes over destructive changes.
- Simplify before adding complexity.
- Professional UI over excessive animation.
- Mobile-friendly from the beginning.
- Conversation mode becomes the primary everyday experience.
- DeepResearch mode remains powerful but becomes much easier to understand.

---

# Phase 1 — Product & UX Audit

## 1.1 Freeze the current backend
- Identify existing research services, graph nodes, API contracts, authentication, and data models.
- Mark backend logic as protected.
- Document which frontend components depend on each API.

## 1.2 Audit the current frontend
Review:
- Conversation
- DeepResearch
- Sidebar
- Composer
- Research progress
- Reports
- Templates
- Navigation
- Loading/error states
- Mobile layouts

## 1.3 Remove unnecessary complexity
Target:
- oversized AI Core visuals
- excessive animations
- decorative elements that do not communicate state
- confusing DeepResearch controls
- redundant UI
- prototype-looking cards/components

### Deliverable
A V2 UX specification and list of components to keep, simplify, replace, or remove.

---

# Phase 2 — DeepResearch V2 UI Redesign

## 2.1 Research workspace
Replace the heavy AI Core presentation with a clean research workspace.

Show:
- research question
- current stage
- progress
- concise activity timeline
- sources
- final report

## 2.2 Research stages
Present the existing pipeline clearly:

Planner
→ Searcher
→ Extractor
→ Reflection
→ Verifier
→ Synthesizer
→ Writer

Do not change the backend pipeline.

## 2.3 Research controls
Simplify:
- start research
- cancel
- view progress
- view report
- source inspection

## 2.4 Research results
Improve:
- report readability
- source presentation
- citations
- section hierarchy
- mobile readability

---

# Phase 3 — Professional Design System

Create one consistent visual language for the entire product.

## 3.1 Design research
Use the Brad Traversy design-resources-for-developers repository as a resource directory.

Repository:
https://github.com/bradtraversy/design-resources-for-developers

Review relevant categories:
- Design Inspiration
- UI Components & Kits
- React UI Libraries
- Design Systems & Style Guides
- Fonts
- Icons
- Colors
- CSS Animation resources

Do not blindly import everything.

## 3.2 Define the DeepResearch design system
Establish:
- typography
- font hierarchy
- spacing scale
- border radius
- borders
- shadows
- background surfaces
- cyan/accent usage
- buttons
- inputs
- cards
- dialogs
- dropdowns
- icons
- loading states
- animations

## 3.3 Animation rules
Animations should:
- communicate state
- provide feedback
- improve navigation

Avoid:
- giant animated AI cores
- constant background motion
- excessive particle effects
- animation for decoration alone

---

# Phase 4 — Conversation V2

Conversation becomes the central user experience.

## 4.1 Composer redesign
Build a professional ChatGPT-style composer with:
- text input
- microphone button
- image generation control
- attachment control
- send button
- responsive mobile layout

## 4.2 Message experience
Add:
- clean message layout
- copy
- regenerate/retry where supported
- assistant actions
- image messages
- voice playback

## 4.3 Conversation states
Handle:
- sending
- generating
- recording
- transcribing
- generating image
- playback
- errors
- retrying

---

# Phase 5 — Speech-to-Text (STT)

## Goal
Add accurate voice input without modifying the existing research engine.

## 5.1 Architecture
Frontend:
Microphone
→ recording state
→ audio upload/stream
→ STT service
→ transcript
→ existing conversation input

## 5.2 UX
- microphone permission handling
- recording indicator
- stop/cancel
- transcript preview
- edit transcript
- send

## 5.3 Quality
- accurate transcription
- sensible handling of pauses
- clear errors
- mobile microphone support

## 5.4 Backend strategy
Prefer an additive speech endpoint/service.

Do not rewrite existing conversation/research logic.

---

# Phase 6 — Text-to-Speech (TTS)

## Goal
Allow users to listen to assistant responses.

## 6.1 UX
Each assistant response can expose:
- play
- pause
- stop
- replay

## 6.2 Audio behavior
- only one response should play at a time
- loading state while audio is generated
- graceful failure handling
- mobile support

## 6.3 Backend strategy
Add a dedicated TTS service/endpoint.

Keep existing LLM response generation untouched.

---

# Phase 7 — Image Generation

## Goal
Add high-quality image generation directly into Conversation mode.

## 7.1 User flow
User:
1. opens image generation
2. enters prompt
3. generates image
4. sees image inside conversation
5. can regenerate

## 7.2 Image UX
Support:
- generation progress
- generated image cards
- regenerate
- prompt visibility
- error/retry state
- responsive image viewing
- history within conversation

## 7.3 Advanced generation
Plan for:
- prompt enhancement
- aspect-ratio selection
- quality controls
- multiple generation options
- image editing later if supported

## 7.4 Backend strategy
Use a separate image-generation service.

Do not replace existing text/research generation.

---

# Phase 8 — Mobile-First Experience

Audit every major screen at mobile widths.

## 8.1 Conversation
- responsive composer
- touch-friendly controls
- responsive messages
- voice controls
- image generation

## 8.2 DeepResearch
- compact research navigation
- readable progress
- mobile report layout
- collapsible sources

## 8.3 Navigation
- mobile sidebar/drawer
- account controls
- accessible touch targets

## 8.4 Testing
Test:
- small phones
- large phones
- tablets
- desktop

---

# Phase 9 — Backend-Safe Integration

Before every backend change:

1. Identify the existing API contract.
2. Add the new capability separately.
3. Avoid changing existing research endpoints unless required.
4. Preserve authentication.
5. Preserve user isolation.
6. Test existing research after every integration.

### Protected systems
- research graph
- planner/search/extraction/reflection/verifier/synthesis/writer flow
- existing authentication
- existing research APIs
- existing conversation behavior

### Additive systems
- STT
- TTS
- image generation
- new frontend states
- new UI components
- new service endpoints

---

# Phase 10 — Quality & Security

## 10.1 Functional testing
Test:
- normal conversation
- research creation
- research cancellation
- reports
- authentication
- voice input
- voice playback
- image generation
- mobile UI

## 10.2 Multi-user security
Verify:
- users cannot see other users' conversations
- users cannot access other users' research jobs
- generated content is properly scoped
- authentication tokens are validated

## 10.3 Error handling
Every new feature needs:
- loading state
- empty state
- error state
- retry behavior
- cancellation where appropriate

## 10.4 Performance
Check:
- animation cost
- bundle size
- image loading
- audio loading
- mobile performance
- unnecessary API calls

---

# Phase 11 — Final Product Polish

Final pass across:
- typography
- spacing
- icons
- buttons
- forms
- animations
- responsiveness
- accessibility
- empty states
- loading states
- error states
- research reports
- conversation experience

Remove anything that feels:
- AI-generated
- excessive
- redundant
- confusing
- visually inconsistent

---

# V2 Build Order

1. UX audit
2. DeepResearch simplification
3. Design system
4. Conversation redesign
5. STT
6. TTS
7. Image generation
8. Mobile optimization
9. Security/testing
10. Final polish

---

# Definition of Done

DeepResearch AI V2 is complete when:

- DeepResearch feels simple instead of over-animated.
- Conversation feels like a professional modern AI assistant.
- STT works reliably.
- TTS works reliably.
- Image generation works inside conversations.
- Mobile users can use the core product comfortably.
- The UI follows one consistent design system.
- Existing research functionality still works.
- Existing backend research logic has not been unnecessarily rewritten.
- Authentication and user isolation remain intact.
- The product feels intentionally designed rather than assembled from AI-generated components.

# Implementation Rule

Work phase-by-phase.

Do not jump ahead.

For each phase:
1. inspect the current implementation
2. make the smallest safe change
3. test it
4. verify existing functionality
5. move to the next phase

Never rewrite working backend logic merely to make implementation easier.
