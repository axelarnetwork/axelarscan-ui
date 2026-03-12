# Component Rules

## File Structure

Every component lives in a directory:

```
ComponentName/
  ComponentName.component.tsx   # Main component only — no other components here
  SubName.component.tsx         # Each sub-component gets its own file
  ComponentName.styles.ts       # Tailwind class constants
  ComponentName.types.ts        # All interfaces and types
  ComponentName.hooks.ts        # Custom hooks
  ComponentName.utils.ts        # Pure utility functions
  index.ts                      # Barrel export
```

## Hard Rules

1. **One component per file.** Never define a component inside another component's file. Every component — no matter how small — gets its own `.component.tsx` file.

2. **All types in `.types.ts`.** Never use inline types for component props. Always define a named interface in the `.types.ts` file and import it.

   Bad:

   ```tsx
   function Foo({ name, count }: { name: string; count: number }) {
   ```

   Good:

   ```tsx
   // in Component.types.ts
   export interface FooProps { name: string; count: number; }

   // in Foo.component.tsx
   import type { FooProps } from './Component.types';
   function Foo({ name, count }: FooProps) {
   ```

3. **Sub-component naming:** `SubName.component.tsx` — NOT prefixed with the parent name.

4. **Imports:** Cross-directory imports use barrel `index.ts`. Intra-directory imports use direct file paths.

5. **Styles:** Use `import * as styles from './X.styles'` namespace pattern. Never inline Tailwind strings longer than a few classes.

6. **No functions in JSX return body.** Extract `.map()` callbacks, render helpers, and conditional blocks into named sub-components.

## Build & Tooling

- Package manager: **npm**
- Build: `npm run build` (runs `tsc && next build`)
- Node 20 via nvm
