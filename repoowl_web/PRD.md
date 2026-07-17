Product Requirements Document (PRD)

Project: RepoOwl Official Landing Page
Platform: Flutter Web
Design Language: "CodeRabbit Clone" (Developer-focused, Dark Mode, High Contrast)
Timeline: 48-Hour Sprint

1. Objective

To build a highly polished, responsive, single-page marketing website for RepoOwl using Flutter Web. The site must serve as the primary download portal for the Chrome Extension (.zip) while mimicking the premium, dark-mode, IDE-like aesthetic of advanced developer tools (e.g., CodeRabbit.ai, Linear, Vercel).

2. Design System & Theming

2.1 Color Palette

Background: True Dark #000000 or Deep GitHub Dark #0D1117.

Surface/Cards: Elevated dark #161B22 with subtle borders #30363D.

Accent/Primary: A vibrant, high-contrast CodeRabbit Orange (#FF5722) or Electric Blue (#2F81F7).

Text:

Primary: #F0F6FC (Off-white)

Secondary: #8B949E (Muted gray)

2.2 Typography

Headings & Body: Inter or Geist (Clean sans-serif).

Code/Terminal UI: JetBrains Mono or Fira Code (Strict monospace).

2.3 Layout Paradigm

Max-width container (e.g., 1200px) centered on large screens to prevent stretching.

Heavy use of LayoutBuilder and ResponsiveBuilder paradigms to gracefully stack the multi-column IDE mockups into single columns on mobile devices.

3. Page Structure & Components

The landing page will be a single scrollable view composed of the following vertical sections:

Section 1: Global Navigation Bar

Sticky/Fixed: AppBar stays at the top with a glassmorphism effect (semi-transparent with BackdropFilter).

Left: RepoOwl Logo, which was used earlier

Right: "Download .zip" button (ElevatedButton with Accent color).

Section 2: The Hero & IDE Mockup (The Showstopper)

This is the most critical section to nail the CodeRabbit vibe.

Copy:

H1: "Cut GitHub issue triage time in half, Instantly."

Subtitle: "AI-powered, client-side duplicate detection directly in your browser. Zero server costs. Absolute data privacy."

CTAs: Primary "Download Extension", Secondary "View Source on GitHub" (Outlined button).

The IDE Mockup Widget:

A massive Container below the text, styled to look like VS Code or the CodeRabbit UI.

Outer Shell: Dark gray background, rounded corners (Radius.circular(12)), subtle outer glow/box-shadow using the accent color.

Top Bar: Fake macOS window controls (Red, Yellow, Green dots) and a fake file path (repoowl/triage.ts).

Main Stage (Split Pane):

Left Pane (The Issue): A mock user typing a new GitHub issue (e.g., "App crashes on login...").

Right Pane (The Owl's Insight): A glowing terminal-style window popping up saying: ⚠️ Duplicate Detected: Matches Issue #42 "Login fatal error".

Implementation detail: Use nested Row and Column widgets wrapped in Expanded to ensure proportional sizing.

Section 3: Social Proof / Metric Banner

A simple, dark horizontal strip directly below the hero.

Metrics: "100% Client-Side", "0 Server Costs", "Supports LLaMA 3.3".

Design: Large numbers/headers, muted sub-labels, separated by subtle vertical dividers.

Section 4: Bento Box Feature Grid ("Faster triage + better code")

A modern "Bento Box" grid layout. Instead of bullet points, features are presented in styled cards of varying sizes.

Grid Structure (Desktop): Use a GridView.count or nested Row/Column setup to create a 3x2 or 2x2 asymmetric grid (like the CodeRabbit screenshots).

Card Design: #161B22 background, 1px #30363D border, subtle gradient overlay, 16px border radius.

Cards:

BYOK Architecture (Wide Card): Graphic showing keys staying in the browser. Text: "Bring Your Own Key. Your data never leaves your machine."

Dual-Layer Sync (Square): Graphic showing a Hub -> Sandbox flow.

Supabase Native (Square): Supabase logo and text about serverless RLS.

Omni-Prompt Engine (Wide): A mock code snippet showing the JSON prompt schema.

Section 5: The "Bottom Line" CTA & Footer

CTA: Large, centered text: "Get started in 2 clicks."

Button: A massive, pulsing "Download RepoOwl.zip" button.

Footer: Minimalist. Copyright, Link to GitHub Repo, Link to Apache 2.0 License. Massive faint "REPOOWL" text watermarked at the very bottom (using massive font size, 0.05 opacity).

4. Technical Implementation Details (For Cursor/Claude)

4.1 File Download Logic (The Core Requirement)

Use the url_launcher package.

Host the RepoOwl_v1.zip file on your GitHub repository's Releases page.

The Download buttons will execute launchUrl(Uri.parse('https://github.com/yourname/repo/releases/download/.../RepoOwl.zip')).

4.2 Responsiveness Rules

Define a ResponsiveLayout helper widget.

Mobile (< 600px):

IDE Mockup hides the left sidebar, stacks the split panes vertically.

Bento Box grid becomes a single-column ListView or Column.

Tablet (600px - 900px): Bento box becomes a 2-column grid.

Desktop (> 900px): Full layout as designed.

4.3 Animations (The Polish)

Hero Load: Use AnimatedOpacity and AnimatedSlide to fade the Hero text up, followed by the IDE mockup sliding up 200ms later.

Glowing Borders: Use an AnimationController to slowly pulse the BoxShadow blur radius on the IDE mockup to give it a "living AI" feel.

5. Deployment

Command: flutter build web --web-renderer html --release (Use HTML renderer for crisper text rendering and smaller bundle size for landing pages).

Hosting: Vercel, Firebase Hosting, or GitHub Pages.