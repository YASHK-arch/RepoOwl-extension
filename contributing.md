# Contributing to RepoOwl

First off, thank you for considering contributing to RepoOwl! It's people like you that make RepoOwl such a great tool.

## How to Fork

1. Click the **Fork** button at the top right of the repository page.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/RepoOwl-extension.git
   ```
3. Navigate to the project directory:
   ```bash
   cd RepoOwl-extension
   ```
4. Add the original repository as an upstream remote:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/RepoOwl-extension.git
   ```

## Branch Naming

Please follow these conventions when creating a new branch:
- `feature/` for new features (e.g., `feature/navbar`)
- `bug/` for bug fixes (e.g., `bug/login-page`)
- `docs/` for documentation updates (e.g., `docs/readme`)
- `refactor/` for code refactoring
- `test/` for adding or updating tests

## Commit Format

We follow the Conventional Commits specification. Please structure your commit messages as follows:
- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation only changes
- `refactor:` A code change that neither fixes a bug nor adds a feature
- `style:` Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- `test:` Adding missing tests or correcting existing tests

## PR Guidelines

1. Make sure your code is up-to-date with the `main` branch:
   ```bash
   git pull upstream main
   ```
2. Ensure all tests and linting checks pass.
3. Push your branch to your forked repository:
   ```bash
   git push origin your-branch-name
   ```
4. Open a Pull Request from your fork to the original repository.
5. Provide a clear and descriptive title for your PR.
6. Fill out the Pull Request template completely, including any relevant issue numbers.

## Code Style

- Maintain a consistent coding style throughout the project.
- Write clean, readable code and include comments where necessary.

## Local Setup

1. Ensure you have the necessary dependencies installed (e.g., Node.js, npm).
2. Install project dependencies:
   ```bash
   npm install
   ```
3. Start the development environment:
   ```bash
   npm run dev
   ```
