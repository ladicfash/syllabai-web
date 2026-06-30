# SyllibAI — Project TODO

## Phase 1: Schema & Backend
- [x] Database schema: users, documents, flashcards, quiz_sessions, quiz_scores, notes, tasks, timer_sessions, spaced_repetition_cards, share_tokens
- [x] Server routers: documents, ai, quiz, notes, tasks, timer, spaced-repetition, share, voice
- [x] S3 file upload endpoint (multipart, multi-file)
- [x] LLM integration: flashcards, Cornell notes, mind map, timeline, flowchart, key points, study plan, deadlines, simulation
- [x] Voice transcription endpoint (Whisper)
- [x] File conversion utilities (PDF↔DOCX, image→PDF) via server-side npm packages

## Phase 2: Landing Page & Auth
- [x] Polished landing page with hero, features grid, quote footer
- [x] Login/signup flow via Manus OAuth
- [x] Dark/light mode toggle (persisted)
- [x] Sidebar dashboard layout with responsive mobile drawer

## Phase 3: File Library
- [x] Multi-file drag-and-drop upload UI
- [x] S3-backed document storage with metadata in DB
- [x] File preview: PDF viewer (iframe), image preview, text preview
- [x] Document library with selection, search, and delete
- [x] File conversion: DOCX→PDF, TXT→PDF, TXT→DOCX, image→PDF (JPEG/PNG), with convert modal UI

## Phase 4: AI Study Tools
- [x] Flashcard generator with flip-card UI
- [x] Cornell notes (study guide) rendered as formatted HTML
- [x] Mind map rendered visually with Mermaid.js
- [x] Timeline rendered visually with Mermaid.js
- [x] Flowchart rendered visually with Mermaid.js
- [x] Key points extractor
- [x] Read-aloud TTS using Web Speech API
- [x] Interactive quiz mode (via flashcard session with scoring)
- [x] Per-deck quiz history

## Phase 5: Timer & Planner
- [x] Pomodoro / study timer with customizable intervals
- [x] Timer session history
- [x] Sound alerts for timer
- [x] Assignment/exam planner with AI deadline detection from docs
- [x] Calendar view for tasks and deadlines
- [x] Manual task entry with priority and due date

## Phase 6: Advanced Features
- [x] Inline notes (mobile + desktop) with color coding and pinning
- [x] Share/send: select specific notes → generate share link → send to email/phone
- [x] Spaced repetition system (SM-2 algorithm)
- [x] Simulation environments: medical, finance, coding, history
- [x] Voice notes: record → Whisper transcription → flashcards/content

## Phase 7: Polish & QA
- [x] Advanced CSS animations and micro-interactions
- [x] Fully responsive design (mobile-first)
- [x] Dark/light mode for all components
- [x] Empty states and loading skeletons
- [x] Error handling and toast notifications
- [x] Vitest unit tests for server routes (8 tests passing)
- [x] Final checkpoint and delivery

## Phase 8: Fixes & New Features
- [x] Fix PDF text extraction (pdf-parse ESM/CJS import error)
- [x] Fix DOCX text extraction (mammoth)
- [x] Add syllabus upload with AI deadline extraction and auto-task creation in Planner
- [x] Draft Terms & Conditions content (privacy, usage, AI disclaimer)
- [x] Add acceptedTermsAt + termsVersion columns to users table
- [x] Build first-time T&C agreement modal (3 checkboxes required, stored in DB, blocks app until accepted)

## Phase 9: UI Revamp & Collaboration
- [x] Revamp sidebar navigation: cleaner grouping, better icons, section labels
- [x] Revamp dashboard home: stats widgets, daily goal ring, quick access grid, recent docs, upcoming deadlines
- [x] Revamp landing page: tighter SaaS feel, better hero copy, Collaborate section, feature highlights
- [x] Add public Explore/Discover page (no login required to browse)
- [x] Quizlet-style gating: public can see titles/previews, login required for full content
- [x] Add isPublic flag to notes, flashcard decks, and study sets in DB schema
- [x] Build Share popup: choose content type (notes/decks), select items, set visibility (public/link/collab)
- [x] Build Collab Space: community browse, My Shared Content tab, share guide dialog, stats bar
- [x] Add public profile page: user's shared decks and notes browsable by others
- [x] Access gate component: blur/lock overlay on content for logged-out users (AccessGate.tsx)

## Phase 10: T&C Fix & Settings Page
- [x] Fix T&C modal: scrollable legal text, working checkboxes, agree button always reachable
- [x] Add user_settings table to DB schema (notificationEmail, notificationPhone, notifyFrequency, shareDeadlinesEnabled, shareDeadlinesRecipients)
- [x] Build Settings page: Profile section, Notifications section, Deadline Sharing section, Account section
- [x] Notification frequency options: every hour, 24 hours before, as deadlines approach, every few days
- [x] "Send deadlines to a friend or classmate" with email/phone input and save
- [x] Deactivate account option with confirmation dialog
- [x] Add Settings link to sidebar navigation
- [x] Wire all settings to DB via tRPC (save + load)

## Phase 11: Dark Mode, Animation & Video Notes
- [x] Fix dark mode globally: all pages use semantic bg/text tokens, no hardcoded white/light colors
- [x] Extend logo intro animation by 2 seconds (hold phase 600ms → 2600ms, total ~4150ms)
- [x] Add save-only option to Voice Notes (save recording without transcribing)
- [x] Build Video Notes page: upload video (up to 500 MB), camera recording, save, transcribe
- [x] Add video_notes table to DB schema with 20-video cap per user
- [x] Wire video notes server routes (upload, list, delete, transcribe)
- [x] Add Video Notes to sidebar navigation

## Phase 12: Sign-in Fix, Notes Folders & AI Save
- [x] Fix OAuth sign-in URL redirect error (callback URL mismatch or redirect loop)
- [x] Fix Mermaid mind map parse error (sanitize special chars in node labels)
- [x] Add note_folders table to DB schema (id, userId, name, isPinned, createdAt)
- [x] Add folderId column to notes table
- [x] Wire folder server routes: createFolder, listFolders, updateFolder, deleteFolder, moveNoteToFolder
- [x] Build folder UI in Notes page: create/rename/delete folders, pin folders, expand/collapse folders
- [x] Add "Save to Notes" button in AI Study Tools for all output types (Cornell, mind map, timeline, flowchart, key points)
- [x] Allow saving voice note audio to both Voice Notes section and Notes folder (via Save to Notes button in VoiceNotes page)

## Phase 13: True Dark Mode (Gold Light / Blue Dark)
- [x] Update light mode: gold accent (#c9a961 / oklch(0.72 0.18 85)), white background
- [x] Update dark mode: very dark near-black background (oklch(0.06 0.01 255)), near-white text (oklch(0.96 0.005 240)), blue accent
- [x] Update all semantic color tokens for both modes
- [x] Update sidebar item styles for gold (light) and blue (dark)
- [x] Update gradient text for gold (light) and blue (dark)
- [x] Update landing page grid and glow for both modes
- [x] Update pill badges and feature cards for both modes

## Phase 14: Redo Dark Mode
- [x] Make light mode the default theme again
- [x] Replace remaining hardcoded accent and light-only colors with semantic theme tokens
- [x] Ensure dashboard, notes, explore, profile, collab, dialogs, and sidebar use full-page true dark backgrounds in dark mode
- [x] Tune note cards, modal surfaces, badges, and status chips for readable contrast in dark mode
- [x] Verify both light and dark modes visually across the main app pages

## Phase 15: Note Card UX, Accent Picker, Voice/Video Fixes, Notifications
- [x] Fix voice note transcription/flashcard generation errors (presigned S3 URL before Whisper)
- [x] Fix video note transcription/flashcard generation errors (presigned S3 URL before Whisper)
- [x] Add inline video playback for saved video notes
- [x] Build note card color wheel picker (ROYGBIV gradient, large palette + custom color input)
- [x] Auto-contrast text color on note cards based on background (WCAG luminance formula)
- [x] Improve note card UX/UI overall (hover actions, folder badge, pin indicator)
- [x] Add accent color picker in Settings (persisted to user profile via accentColor DB column)
- [x] Apply user accent color globally via CSS variable (--color-primary override in App.tsx)
- [x] Fix email notifications (Brevo SMTP via nodemailer, sendDeadlineReminder helper)
- [x] Fix phone number notifications (replaced with browser push notifications via Web Push API + VAPID; SMS marked coming soon)

## Phase 17: CourseGraph Onboarding Wizard
- [x] Build CourseGraphOnboarding 3-step wizard page (client/src/pages/CourseGraphOnboarding.tsx)
- [x] Add AI topic extraction endpoint (courseGraph.extractTopics) to server/routers/courseGraph.ts
- [x] Add /course-graph/new route to App.tsx
- [x] Wire "New Course" button on CourseGraph page to navigate to /course-graph/new
- [x] Write Vitest tests for onboarding flow

## Phase 18: Notes Redesign & Format Persistence
- [ ] Redesign Notes UI to Google Drive-style card layout with content previews
- [ ] Add format persistence: store note format (Markdown, HTML, JSON, PDF, PNG, JPEG) in DB
- [ ] Implement note download functionality for all format types
- [ ] Add mindmap/chart persistence and export (PNG, SVG, PDF)
- [ ] Wire CourseGraph to live data (replace mock topics with real tRPC queries)
- [ ] Add language selector to onboarding wizard step 1
- [ ] Apply useTranslation to remaining pages (Explore, Library, Planner, Timer)
