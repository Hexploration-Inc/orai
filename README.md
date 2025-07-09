# Orai - The Open-Source, Privacy-First Email Client

<p align="center">
  <strong>The email client that respects your privacy, enhances your productivity, and is free forever.</strong>
</p>

<p align="center">
  <a href="#">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome">
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/status-beta-yellow.svg" alt="Status: Beta">
  </a>
</p>

---

## Our Mission

In a world where your data is the product, Orai is a statement. We are building a beautiful, performant, and intelligent email client that puts you first. **No ads, no tracking, no compromise.** Our mission is to provide a secure and powerful email experience that is open, transparent, and driven by the community.

## Core Principles

- **Open Source:** Our entire codebase is open for the world to see, audit, and contribute to.
- **Privacy-First:** We will never track you or sell your data. Your emails are your own.
- **Performant:** Built with a modern tech stack, Orai is designed to be fast, lightweight, and a joy to use.
- **AI-Enabled:** We leverage the power of AI to help you manage your inbox, not to mine your data.
- **Minimalistic:** A clean, intuitive interface that focuses on what matters most: your communication.

## Tech Stack

- **Web App:** [Next.js](https://nextjs.org/) & [React](https://reactjs.org/)
- **Backend API:** [Fastify](https://www.fastify.io/)
- **Database:** [PostgreSQL](https://www.postgresql.org/) with [Prisma](https://www.prisma.io/)
- **UI:** [shadcn/ui](https://ui.shadcn.com/) & [Tailwind CSS](https://tailwindcss.com/)
- **Rich Text Editor:** [TipTap](https://tiptap.dev/)
- **State Management:** React Hooks & Context
- **Authentication:** OAuth 2.0 with Google
- **Storage:** Cloudflare R2 for attachments
- **Mobile App:** Coming soon, built with [React Native](https://reactnative.dev/).

## Current Features

### ✅ **Secure Gmail Integration**

- **OAuth 2.0 Authentication:** Secure login without storing passwords
- **Token Management:** Automatic token refresh and secure storage
- **Scope-Limited Access:** Only request necessary Gmail permissions

### ✅ **Modern Email Interface**

- **Responsive 3-Panel Layout:** Resizable sidebar, email list, and reading pane
- **Dark/Light Theme Support:** Elegant matte dark theme and clean light theme
- **Mobile-First Design:** Optimized touch interfaces with responsive breakpoints
- **Accessibility:** Full keyboard navigation and screen reader support

### ✅ **Core Email Functionality**

- **Email Reading:**
  - Clean, distraction-free reading experience
  - Automatic mark-as-read functionality
  - Rich HTML email rendering
  - Responsive image handling
- **Email Composition:**
  - Rich text editor with formatting tools (Bold, Italic, Links)
  - Attachment support with drag-and-drop
  - Auto-save drafts (coming soon)
  - Keyboard shortcuts (Ctrl+Enter to send)
  - Panel-based compose on desktop, overlay on mobile

- **Email Management:**
  - Archive, delete, and mark as spam
  - Visual unread indicators
  - Bulk email operations (coming soon)
  - Email threading (coming soon)

### ✅ **Advanced UI/UX Features**

- **Loading States:**
  - Skeleton loaders for smooth perceived performance
  - Progressive loading of email content
  - Optimistic UI updates
- **Empty States:**
  - Helpful empty inbox illustrations
  - Guided onboarding for new users
  - Contextual help messages

- **Visual Enhancements:**
  - Color-coded icons for different actions
  - Smooth hover animations
  - Consistent spacing and typography
  - Toast notifications for user feedback

### ✅ **Developer Experience**

- **Monorepo Architecture:** Clean separation of concerns with Turborepo
- **Type Safety:** Full TypeScript implementation
- **Component Library:** Shared UI components across apps
- **Hot Reloading:** Instant development feedback
- **Code Quality:** ESLint, Prettier, and strict TypeScript configs

## Feature Roadmap

We have a bold vision for Orai. Here's a detailed look at what's coming next.

### Phase 3: Search & Discovery

- [ ] **Advanced Search Engine**
  - Full-text search across all emails
  - Search by sender, subject, date ranges
  - Smart search suggestions and autocomplete
  - Search within attachments (PDF, DOC content)
  - Saved search queries and filters

- [ ] **Smart Filtering & Organization**
  - Quick filter buttons (Unread, Today, This Week, Important)
  - Custom label creation and management
  - Smart categorization (Primary, Social, Promotions)
  - Advanced search operators (from:, has:attachment, etc.)

### Phase 4: Enhanced Productivity

- [ ] **Keyboard Shortcuts Suite**
  - Gmail-style navigation (`j`/`k` for up/down)
  - Quick actions (`r` reply, `a` archive, `d` delete)
  - Compose shortcuts (`c` for new email)
  - Search activation (`/` key)
  - Help modal (`?` key) with shortcut reference

- [ ] **Draft Management**
  - Auto-save drafts every 30 seconds
  - Draft recovery on browser crash
  - Multiple draft support
  - Draft templates and snippets
  - Version history for drafts

- [ ] **Email Templates & Signatures**
  - Custom email signatures with HTML support
  - Quick reply templates
  - Dynamic template variables
  - Team signature management
  - Template sharing and collaboration

### Phase 5: Advanced Email Features

- [ ] **Thread Management**
  - Conversation view with collapsible emails
  - Smart thread splitting for topic changes
  - Thread-level actions (archive all, mark all read)
  - Quote trimming and smart reply context

- [ ] **Attachment Enhancements**
  - Drag-and-drop attachment uploads
  - Inline image embedding
  - Cloud storage integration (Google Drive, Dropbox)
  - Attachment preview without download
  - Bulk attachment download

- [ ] **Email Scheduling & Snoozing**
  - Schedule emails to send later
  - Snooze emails to reappear at specific times
  - Smart snooze suggestions (tomorrow morning, next week)
  - Follow-up reminders for sent emails

### Phase 6: AI & Intelligence

- [ ] **AI-Powered Email Summarization**
  - One-click email summaries for long messages
  - Thread summaries for email conversations
  - Key action items extraction
  - Meeting details and calendar event suggestions

- [ ] **Smart Reply & Compose**
  - AI-generated reply suggestions matching your tone
  - Smart compose with context awareness
  - Email tone analysis and suggestions
  - Grammar and spelling enhancement

- [ ] **Priority Inbox & Smart Categorization**
  - ML-based importance scoring
  - VIP sender identification
  - Automatic email categorization
  - Smart notification filtering

- [ ] **Natural Language Search**
  - Search in plain English ("emails from Sarah last week about the project")
  - Intent recognition and query expansion
  - Semantic search beyond keyword matching
  - Voice search integration (future)

### Phase 7: Multi-Account & Integration

- [ ] **Multi-Account Support**
  - Seamless switching between Gmail accounts
  - Unified inbox view across accounts
  - Account-specific signatures and settings
  - Cross-account email forwarding

- [ ] **Calendar Integration**
  - Built-in Google Calendar sync
  - Meeting scheduling from emails
  - Calendar event creation from email content
  - Availability sharing and meeting coordination

- [ ] **Contact Management**
  - Integrated address book with Google Contacts
  - Contact enrichment with social profiles
  - Recent contact suggestions
  - Contact grouping and tagging

### Phase 8: Security & Privacy

- [ ] **End-to-End Encryption**
  - PGP key management interface
  - Automatic encryption for known recipients
  - Secure key exchange workflows
  - Encrypted attachment support

- [ ] **Advanced Privacy Controls**
  - Email tracking pixel blocking
  - Link protection and safe browsing
  - Privacy-focused analytics (no user tracking)
  - Local data encryption

- [ ] **Security Features**
  - Two-factor authentication
  - Session management and remote logout
  - Suspicious activity monitoring
  - Secure backup and export

### Phase 9: Mobile & Cross-Platform

- [ ] **Native Mobile Apps**
  - React Native iOS and Android apps
  - Push notifications for new emails
  - Offline reading and draft composition
  - Biometric authentication

- [ ] **Cross-Platform Sync**
  - Real-time sync across all devices
  - Unified read/unread status
  - Cross-device draft synchronization
  - Consistent user experience

### Phase 10: Enterprise & Collaboration

- [ ] **Team Features**
  - Shared mailboxes and team inboxes
  - Email delegation and shared access
  - Team templates and signatures
  - Collaborative email management

- [ ] **Provider Expansion**
  - Microsoft Outlook/Office 365 support
  - iCloud Mail integration
  - Generic IMAP/SMTP support
  - Custom domain email hosting

## Performance Metrics

- **Load Time:** < 2 seconds for initial app load
- **Email List:** Renders 1000+ emails smoothly
- **Search:** Results in < 500ms for local search
- **Memory Usage:** < 100MB for typical usage
- **Bundle Size:** < 500KB initial JS bundle

## Accessibility Features

- **Keyboard Navigation:** Full app navigation without mouse
- **Screen Reader Support:** ARIA labels and semantic HTML
- **High Contrast Mode:** Support for OS-level accessibility settings
- **Font Scaling:** Respects user font size preferences
- **Color Blind Friendly:** Accessible color palette and contrast ratios

## Getting Started

To get started with developing Orai locally, follow these steps:

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/orai.git
    cd orai
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**

    ```bash
    # Copy example environment files
    cp apps/api/.env.example apps/api/.env
    cp apps/web/.env.example apps/web/.env

    # Add your Google OAuth credentials and database URL
    ```

4.  **Set up the database:**

    ```bash
    # Run database migrations
    pnpm db:migrate --filter api

    # Seed with sample data (optional)
    pnpm db:seed --filter api
    ```

5.  **Run the development servers:**

    ```bash
    # Run all services
    pnpm dev

    # Or run individually
    pnpm dev --filter web    # Web app at http://localhost:3000
    pnpm dev --filter api    # API server at http://localhost:3001
    ```

## Project Structure
