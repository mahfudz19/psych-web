# TanStack Query & API Integration Standards

This document outlines the standard pattern for creating API integrations and TanStack Query hooks in this project.

## 1. File Structure

For every new feature or domain, create three files inside an `-api` folder:

- `[domain].type.ts`: Contains all TypeScript interfaces and types.
- `[domain].api.ts`: Contains Axios/fetch wrapper functions.
- `[domain].query.ts`: Contains TanStack Query hooks and query keys.

## 2. Type Definitions (`[domain].type.ts`)

- Export all types and interfaces.
- Separate response models from request payloads.
- Use union types for enums/status fields.

## 3. API Functions (`[domain].api.ts`)

- Import `api` from `utils/api`.
- Define a `BASE` constant for the endpoint prefix.
- Use `BaseListParams` for pagination/filtering parameters.
- Return the raw promise; do not catch errors here.

## 4. Query Hooks (`[domain].query.ts`)

### Query Keys Factory

Always use a query key factory object to ensure consistent cache invalidation.

- `all`: Base key for the domain.
- `lists`: Base key for all list queries.
- `list`: Specific list query with params.
- `details`: Base key for all detail queries.
- `detail`: Specific detail query by ID.

### useQuery (GET)

- Use the query key factory.
- Catch errors locally to show toast notifications, then re-throw if necessary.

### useMutation (POST/PATCH/DELETE)

- Invalidate the relevant query keys on success.
- Show success and error toasts using the API response message.
