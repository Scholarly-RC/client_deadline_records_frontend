# Project Overview

This is a client-side rendered Nuxt.js application for tracking client deadlines. It provides a dashboard interface for managing clients, deadlines, and users. The application uses token-based authentication (JWT) with refresh tokens, Pinia for state management, and `@nuxt/ui` for UI components. It is also configured as a Progressive Web App (PWA).

## Key Technologies

*   **Framework:** Nuxt.js (Vue.js) v3.17.1
*   **State Management:** Pinia
*   **UI:** @nuxt/ui (based on Headless UI and Tailwind CSS) v3.3.2
*   **Forms:** VeeValidate with Zod for validation
*   **PWA:** @vite-pwa/nuxt
*   **Authentication:** JWT (Access and Refresh Tokens)

## Project Structure

*   `assets`: Contains global CSS files.
*   `components`: Contains reusable Vue components, organized by feature.
*   `composables`: Contains reusable Vue composables.
*   `constants`: Contains application-wide constants.
*   `layouts`: Contains layout components for different page structures.
*   `middleware`: Contains Nuxt route middleware for authentication.
*   `pages`: Contains the application's pages and routes.
*   `plugins`: Contains Nuxt plugins.
*   `public`: Contains static assets that are publicly accessible.
*   `schema`: Contains Zod schemas for form validation.
*   `server`: Contains server-side code (though this project is client-side rendered).
*   `stores`: Contains Pinia store modules for state management.
*   `utils`: Contains utility functions.

# Building and Running

## Prerequisites

*   Node.js
*   npm or yarn

## Installation

1.  Install dependencies:
    ```bash
    npm install
    ```

## Development

To run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Production

To build the application for production:

```bash
npm run build
```

To start the production server:

```bash
npm run start
```

# Development Conventions

*   **State Management:** State is managed using Pinia. Each feature has its own store module in the `stores` directory.
*   **Styling:** Styling is done using Tailwind CSS and `@nuxt/ui` components. Global styles are in `assets/css/main.css`.
*   **Routing:** Routing is file-based, using the `pages` directory.
*   **Authentication:** Authentication is handled by the `auth` store and the `auth` middleware. The access token is stored in memory, and the refresh token is stored in a cookie.
*   **API Communication:** API requests are made using `$fetch`, with the base URL configured in `nuxt.config.ts`.
