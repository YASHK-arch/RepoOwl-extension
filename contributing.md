# Contributing to RepoOwl 🦉

First off, thank you for considering contributing to RepoOwl! It's people like you that make RepoOwl such a great tool. We welcome contributions of all kinds—from bug fixes and feature additions to documentation improvements.

---

## 🛠️ Local Development Setup

RepoOwl consists of a Chrome Extension, a shared utility package, and a React-based landing page. 

### 1. Prerequisites
- **Node.js** v18+
- **npm** v9+
- A Chromium-based browser (Chrome, Edge, Brave)

### 2. Clone & Install
Fork the repository, clone it to your local machine, and install the workspace dependencies:
```bash
git clone https://github.com/YOUR_USERNAME/RepoOwl-extension.git
cd RepoOwl-extension
npm install
```

### 3. Build the Extension
To work on the Chrome Extension:
```bash
cd extension
npm run build
```
Once built, open your browser and navigate to `chrome://extensions/`. Enable **Developer mode**, click **Load unpacked**, and select the `extension/dist/` folder. Remember to run `npm run build` and refresh the extension whenever you make code changes.

### 4. Running the Landing Page
If you are contributing to the marketing website:
```bash
cd repoowl-web-react
npm run dev
```
The local server will start at `http://localhost:5173`.

---

## 🧪 Linting and Testing

Before submitting a Pull Request, please ensure all tests and linting checks pass.

**For the Extension:**
```bash
cd extension
npm test
```

**For the Web App:**
```bash
cd repoowl-web-react
npm run lint         # Runs oxlint
npx playwright test  # Runs Playwright E2E tests
```

---

## 🌿 Branch Naming Conventions

Please follow these conventions when creating a new branch:
- `feature/<name>` — for new features (e.g., `feature/duplicate-detection`)
- `bug/<name>` — for bug fixes (e.g., `bug/oauth-crash`)
- `docs/<name>` — for documentation updates (e.g., `docs/readme-setup`)
- `refactor/<name>` — for code refactoring
- `test/<name>` — for adding or updating tests

---

## 📝 Commit Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. Please structure your commit messages as follows:
- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation only changes
- `refactor:` A code change that neither fixes a bug nor adds a feature
- `style:` Changes that do not affect the meaning of the code (white-space, formatting, etc.)
- `test:` Adding missing tests or correcting existing tests

*Example: `feat: add prompt injection guard`*

---

## 🚀 Pull Request Guidelines

1. Make sure your branch is up-to-date with the `main` branch:
   ```bash
   git pull upstream main
   ```
2. Ensure all tests and linting checks pass locally.
3. Push your branch to your forked repository.
4. Open a Pull Request from your fork to the original repository.
5. Provide a clear and descriptive title for your PR.
6. Fill out the Pull Request template completely, linking any relevant issue numbers (e.g., `Fixes #123`).

## 🎨 Code Style

- Maintain a consistent coding style throughout the project.
- Write clean, readable code and include JSDoc comments for complex logic.
- Avoid introducing unnecessary dependencies.

Thank you for contributing to the RepoOwl ecosystem! 🚀
