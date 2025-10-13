<div align="center">

# 🔍 Axelarscan UI

_The official UI for Axelarscan - Cross-chain explorer for the Axelar Network_

</div>

## 🌐 Live Environments

| Environment    | URL                                                            |
| -------------- | -------------------------------------------------------------- |
| 🚀 **Mainnet** | [https://axelarscan.io](https://axelarscan.io)                 |
| 🧪 **Testnet** | [https://testnet.axelarscan.io](https://testnet.axelarscan.io) |

## 🛠️ Development Setup

### Prerequisites

- Node.js 20.19.4 (specified in `.nvmrc`) - Install via [nvm](https://github.com/nvm-sh/nvm)

### Local Development

Run the application locally on [localhost:3000](http://localhost:3000):

```bash
# Switch to the correct Node.js version
nvm use

# Install dependencies
npm ci

# Start development server
npm run dev
```

### Code Quality

```bash
# Format code with Prettier
npm run format

# Check code formatting
npm run format:check

# Run ESLint and fix issues
npm run lint

# Check for linting issues
npm run lint:check
```

### TypeScript Support

This project supports both JavaScript and TypeScript files. You can gradually migrate existing JavaScript files to TypeScript or create new TypeScript files.

#### TypeScript Commands

```bash
# Run TypeScript type checking (no emit)
npm run tsc

# Build project with TypeScript checking
npm run build
```

### Testing

Run the test suite to verify functionality:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## 🚀 Deployment and Release Process

### 📋 Overview

Axelarscan UI uses a straightforward deployment process with Vercel. The project uses a single `main` branch with feature branches for development.

### 🌍 Environment Setup

<table>
  <tr>
    <th>Environment</th>
    <th>Vercel Project</th>
    <th>Build Command</th>
  </tr>
  <tr>
    <td>Mainnet</td>
    <td>axelarscan-mainnet</td>
    <td><code>npm run build-mainnet</code></td>
  </tr>
  <tr>
    <td>Testnet</td>
    <td>axelarscan-testnet</td>
    <td><code>npm run build-testnet</code></td>
  </tr>
  <tr>
    <td>Staging</td>
    <td>axelarscan-staging</td>
    <td><code>npm run build-staging</code></td>
  </tr>
  <tr>
    <td>Stagenet</td>
    <td>axelarscan-stagenet</td>
    <td><code>npm run build-stagenet</code></td>
  </tr>
  <tr>
    <td>Devnet Amplifier</td>
    <td>axelarscan-devnet-amplifier</td>
    <td><code>npm run build-devnet-amplifier</code></td>
  </tr>
</table>

Each environment uses environment-specific variables loaded from corresponding `.env.*` files during build.

### 🔄 Release Process

1. **👨‍💻 Development**:

   - Create feature branches from `main` using the naming convention `feat/*` or `chore/*`
   - Example: `feat/add-new-chart` or `chore/update-dependencies`

2. **🔍 Preview Deployments**:

   - Vercel automatically creates preview deployments for branches with the `feat/*` or `chore/*` prefix
   - Preview URLs are available directly in the GitHub UI for each commit
   - Branches with other naming patterns (e.g., `bugfix/*`, `hotfix/*`) will not trigger preview builds

3. **🧪 Testing**:

   - Test your changes on the Vercel preview URL
   - Make any necessary adjustments in your feature branch

4. **📦 Release**:
   - Once testing is complete, create a Pull Request to merge your feature branch into `main`
   - After approval and merge to `main`, Vercel automatically deploys to all environment projects

### 🛠️ Build Control

The repository includes a `vercel.deployment.sh` script that controls which branches get deployed:

| Status                         | Condition                                                                                                 |
| ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| ✅ **Builds proceed when**     | • Branch is `main`, `feat/*`, or `chore/*`<br>• AND the Vercel URL doesn't contain "v1" or "v0"           |
| 🛑 **Builds are skipped when** | • Any other branch naming pattern<br>• OR any deployment URL containing "v1" or "v0" (legacy deployments) |

### 📝 Notes

- There is no need for environment-specific branches or manual promotion between environments
- All environments are updated simultaneously when changes are merged to `main`
