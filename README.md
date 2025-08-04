# Axelarscan UI

## URLs
- mainnet: [https://axelarscan.io](https://axelarscan.io)
- testnet: [https://testnet.axelarscan.io](https://testnet.axelarscan.io)

### Prerequisites
node >= 20.0.0

## Run on [localhost:3000](http://localhost:3000)
```bash
npm i
npm run dev
```

## Deployment and Release Process

### Overview

Axelarscan UI uses a straightforward deployment process with Vercel. The project uses a single `main` branch with feature branches for development.

### Environment Setup

The project supports multiple environments, each with its own Vercel project:
- axelarscan-mainnet
- axelarscan-testnet
- axelarscan-staging
- axelarscan-stagenet
- axelarscan-devnet-amplifier

Each environment uses environment-specific variables loaded from corresponding `.env.*` files during build.

### Release Process

1. **Development**:
   - Create feature branches from `main` using the naming convention `feat/*` or `chore/*`
   - Example: `feat/add-new-chart` or `chore/update-dependencies`

2. **Preview Deployments**:
   - Vercel automatically creates preview deployments for branches with the `feat/*` or `chore/*` prefix
   - Preview URLs are available directly in the GitHub UI for each commit
   - Branches with other naming patterns (e.g., `bugfix/*`, `hotfix/*`) will not trigger preview builds

3. **Testing**:
   - Test your changes on the Vercel preview URL
   - Make any necessary adjustments in your feature branch

4. **Release**:
   - Once testing is complete, create a Pull Request to merge your feature branch into `main`
   - After approval and merge to `main`, Vercel automatically deploys to all environment projects
   - Each environment project runs its specific build script:
     - `npm run build-mainnet`
     - `npm run build-testnet`
     - `npm run build-staging`
     - `npm run build-stagenet`
     - `npm run build-devnet-amplifier`

### Build Control

The repository includes a `vercel.deployment.sh` script that controls which branches get deployed:

- **Builds proceed when**:
  - Branch is `main`, `feat/*`, or `chore/*`
  - AND the Vercel URL doesn't contain "v1" or "v0"

- **Builds are skipped when**:
  - Any other branch naming pattern
  - OR any deployment URL containing "v1" or "v0" (legacy deployments)

### Notes

- There is no need for environment-specific branches or manual promotion between environments
- All environments are updated simultaneously when changes are merged to `main`