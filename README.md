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
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **UI:** [shadcn/ui](https://ui.shadcn.com/) & [Tailwind CSS](https://tailwindcss.com/)
- **Mobile App:** Coming soon, built with [React Native](https://reactnative.dev/).

## Feature Roadmap

We have a bold vision for Orai. Here's a look at the features we'll be implementing, one by one.

### Phase 1: The Foundation

- [x] **Secure Gmail Integration:** Connect your Gmail account securely using OAuth.
- [x] **Core Email Functionality:**
  - [x] View, send, and receive emails.
  - [x] Rich text editor for composing emails.
  - [x] Support for attachments.
  - [x] Archive, delete, and mark emails as spam.

### Phase 2: UI/UX Overhaul

- [ ] **Modern, Resizable Layout:** Implement a responsive, multi-column layout similar to modern email clients.
- [ ] **Component-Based UI:** Rebuild the interface using our `shadcn/ui` and `Tailwind CSS` stack for a polished and consistent look.
- [ ] **Theming:** Introduce support for both light and dark modes.
- [ ] **Refined User Experience:** Add professional loading states, empty states, and improved visual feedback.

### Phase 3: AI & Productivity

- [ ] **AI-Powered Email Summarization:** Get the gist of long emails and threads in seconds.
- [ ] **Smart Reply:** AI-generated reply suggestions that match your tone and context.
- [ ] **Priority Inbox:** An intelligent system that automatically categorizes and prioritizes your emails.
- [ ] **Natural Language Search:** Find any email by searching in plain English (e.g., "emails from last week about the project").
- [ ] **Snooze & Reminders:** Snooze emails to have them reappear in your inbox at a later time.

### Phase 4: Power-User Features

- [ ] **Multi-Account Support:** Seamlessly switch between multiple Gmail accounts.
- [ ] **Keyboard Shortcuts:** A comprehensive set of keyboard shortcuts for power users.

### Phase 5: The Ecosystem

- [ ] **Calendar Integration:** A built-in calendar that syncs with your Google Calendar.
- [ ] **Cross-Platform Mobile App:** A beautiful and performant mobile app for iOS and Android.
- [ ] **Support for More Providers:** Adding support for Outlook, iCloud, and any IMAP account.
- [ ] **End-to-End Encryption:** Optional PGP-based end-to-end encryption for maximum security.

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

3.  **Run the development servers:**

    ```bash
    # Run the web app
    pnpm dev --filter web

    # Run the API
    pnpm dev --filter api
    ```

The web app will be available at `http://localhost:3000` and the API at `http://localhost:3001`.

## Contributing

Orai is built by the community, for the community. We welcome all contributions, from bug fixes to new features. Please feel free to open an issue or submit a pull request.

---

<p align="center">
  <strong>Join us in building the future of email.</strong>
</p>
