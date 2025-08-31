# Agent Guidelines for Client Deadline Records Frontend

## AI Restrictions
- The AI is not allowed to run `npm run build`, `npm run dev`, or `npm run preview`. Only `npm run type-check` is permitted.

## Build/Lint/Test Commands

### Build Commands
- `npm run build` - Build for production
- `npm run dev` - Start development server
- `npm run preview` - Preview production build locally

### Type Checking
- `npm run type-check` - Run TypeScript type checking (strict mode enabled)

### Testing
- No test framework configured - add Vitest if needed: `npm install --save-dev vitest @vue/test-utils`

### Linting/Formatting
- No linter configured - consider adding ESLint: `npm install --save-dev eslint @nuxt/eslint-config`

## Code Style Guidelines

### Vue Components
- Use Vue 3 Composition API with `<script setup lang="ts">`
- Define props with `interface Props` and `defineProps<Props>()`
- Define emits with `interface Emits` and `defineEmits<Emits>()`
- Use PascalCase for component names
- Use kebab-case for component file names

### TypeScript
- Strict mode enabled with `noImplicitAny`, `strictNullChecks`, etc.
- Use explicit types for all function parameters and return values
- Prefer `interface` over `type` for object definitions
- Use union types for status/priority enums
- Avoid `any` type - use proper type definitions

### Imports
- Use Nuxt path aliases: `~/` for root, `~/types`, `~/composables`, etc.
- Group imports: external libraries first, then internal modules
- Use named imports over default imports when possible
- Import types with `import type` syntax

### Naming Conventions
- **Variables/Functions**: camelCase (`getTaskData`, `isLoading`)
- **Components**: PascalCase (`TaskCard`, `UserTable`)
- **Files**: kebab-case (`task-card.vue`, `user-service.ts`)
- **Constants**: UPPER_SNAKE_CASE (`TASK_CATEGORIES`)
- **Types/Interfaces**: PascalCase (`TaskList`, `UserProfile`)

### Error Handling
- Use try/catch blocks for async operations
- Log errors with `console.error()` for debugging
- Show user-friendly error messages via toast notifications
- Handle loading states with reactive refs

### State Management
- Use Pinia stores for global state
- Use composables for reusable logic
- Prefer reactive refs over computed when reactivity isn't needed
- Use `watch` for side effects on reactive data

### Async Operations
- Use async/await syntax over Promise chains
- Return proper Promise types from async functions
- Handle API errors gracefully with fallback UI states

### UI Components
- Use Nuxt UI components (`UCard`, `UButton`, `UModal`, etc.)
- Follow consistent spacing with Tailwind classes
- Use semantic color variants (`primary`, `success`, `error`)
- Implement dark mode support with `dark:` prefixes

### File Structure
- Keep components small and focused on single responsibility
- Use composables for shared logic
- Group related components in subdirectories
- Follow Nuxt conventions for pages, layouts, and middleware