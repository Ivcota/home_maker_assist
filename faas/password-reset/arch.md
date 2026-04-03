# ARCH: Password Reset

## Responsibilities

### Doings
- Request reset — accept email, call Better Auth `requestPasswordReset` API → LoginPageServer (Interfacer, L5)
- Send reset email — deliver reset link via Resend → `sendResetPassword` callback (Interfacer, L4)
- Validate callback token — Better Auth handles via `/reset-password/:token` redirect → built-in (L3)
- Validate new password input — check length ≥ 8, confirm match → ResetPasswordPageServer (Interfacer, L5)
- Reset password — call Better Auth `resetPassword` API with token + new password → ResetPasswordPageServer (Interfacer, L5)

### Knowings
- Resend API key + sender address — env config (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`)
- Reset token expiry — Better Auth default (1 hour), configured in auth options
- Minimum password length — 8 characters (matches settings page)

## Layer Map

| Layer | Component |
|-------|-----------|
| **L5** | SvelteKit pages + form actions (login, reset-password) |
| **L3** | Better Auth internals (`requestPasswordReset`, `resetPassword`) |
| **L4** | `sendResetPassword` callback (Resend email delivery) |
| **L4** | Better Auth's DB adapter (token storage, password update) |

No custom L3 — Better Auth provides the use case coordination. Same pattern as existing login, signup, and change-password features.

## CRC Cards

### SendResetPasswordFn (auth.ts config)
**Front:** Resend email delivery callback | Interfacer | L4
**Knows:** Resend API key, sender address
**Does:** Receives `{user, url, token}` from Better Auth, sends email via Resend
**Collaborators:** Better Auth internals, Resend SDK

### LoginPageServer (existing, modified)
**Front:** Login form actions | Interfacer | L5
**Knows:** Form data (email)
**Does:** Adds `forgotPassword` action that calls `auth.api.requestPasswordReset`
**Collaborators:** Better Auth API

### LoginPage (existing, modified)
**Front:** Login UI with forgot-password link | Interfacer | L5
**Knows:** Current mode, form state
**Does:** Adds forgot-password mode with email-only form and success state
**Collaborators:** LoginPageServer

### ResetPasswordPageServer (new)
**Front:** Reset password form action | Interfacer | L5
**Knows:** Token from URL, form data (newPassword, confirmPassword)
**Does:** Validates password match/length, calls `auth.api.resetPassword`
**Collaborators:** Better Auth API

### ResetPasswordPage (new)
**Front:** Reset password UI | Interfacer | L5
**Knows:** Token, form state, error/success states
**Does:** Renders new password form, shows validation errors, redirects on success
**Collaborators:** ResetPasswordPageServer

## File Change List

| Action | File | Purpose |
|--------|------|---------|
| MODIFY | `src/lib/server/auth.ts` | Add `sendResetPassword` callback using Resend, configure reset options |
| MODIFY | `src/routes/login/+page.server.ts` | Add `forgotPassword` form action |
| MODIFY | `src/routes/login/+page.svelte` | Add forgot-password mode (email form + success state) |
| CREATE | `src/routes/reset-password/+page.server.ts` | Load token from URL, `resetPassword` form action |
| CREATE | `src/routes/reset-password/+page.svelte` | New password + confirm form, error/success states |
| MODIFY | `.env.example` | Add `RESEND_API_KEY`, `RESEND_FROM_EMAIL` |

## Pattern Decisions

- **Email delivery:** `sendResetPassword` callback in Better Auth config — no custom L3 needed. Better Auth generates the token, builds the URL, and calls back with `{user, url, token}`. We send via Resend inside that callback.
- **Token validation:** Handled by Better Auth's `requestPasswordResetCallback` endpoint (`/api/auth/reset-password/:token`). The email link hits that endpoint, which validates the token and redirects to our `callbackURL` (`/reset-password`) with the token as a query param.
- **Form pattern:** SvelteKit form actions + `use:enhance`, matching existing login and settings patterns.
- **Password validation:** Client-side and server-side, same rules as settings page (≥ 8 chars, passwords match).

## Out of Scope

- Rate limiting on reset requests
- Custom email templates beyond plain functional content
- Email verification flow
- Password strength meter

## Implementation Steps (ordered)

1. `npm install resend`
2. Update `.env.example` with `RESEND_API_KEY` and `RESEND_FROM_EMAIL`
3. Modify `src/lib/server/auth.ts` — add `sendResetPassword` callback with Resend integration
4. Modify `src/routes/login/+page.server.ts` — add `forgotPassword` action
5. Modify `src/routes/login/+page.svelte` — add forgot-password mode UI
6. Create `src/routes/reset-password/+page.server.ts` — token loading + `resetPassword` action
7. Create `src/routes/reset-password/+page.svelte` — new password form UI
