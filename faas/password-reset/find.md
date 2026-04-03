# Password Reset — Find

## Feature intent

Add a signed-out password reset flow to KeptNow's existing Better Auth email/password authentication system.

The feature starts from the login page, sends a reset email through a new Resend integration, allows the user to open a reset link, and lets them choose a new password. The flow must not leak whether an email address exists in the system.

## User goal

When a user forgets their password, they can recover access to their account without being signed in.

## Existing entry points

### L5 UI / route entry points

- `src/routes/login/+page.svelte`
- `src/routes/login/+page.server.ts`
- `src/routes/(app)/settings/+page.svelte`
- `src/routes/(app)/settings/+page.server.ts`

### L4 application / framework entry points

- `src/lib/server/auth.ts`
- `src/hooks.server.ts`

## Existing behavior

- Signed-out users can sign in with email/password from `/login`.
- Signed-out users can sign up with email/password from `/login`.
- Signed-in users can change their password from `/settings` by providing the current password.
- Better Auth is configured with `emailAndPassword: { enabled: true }`.
- There is no existing forgot-password UI, reset-password page, reset-email sender, or reset-password server action.
- There is no existing outbound email provider integration in the repository.

## Inputs, flows, and data

### Inputs

- Email address for requesting a reset
- Reset token or reset link parameters from email
- New password
- Confirm new password

### User-visible flows

1. User opens `/login`
2. User chooses the forgot-password path
3. User submits their email address
4. System responds with a generic success message regardless of account existence
5. User receives a reset email
6. User opens the reset link
7. User sets and confirms a new password
8. System validates the token and password rules
9. User is redirected to sign in with the new password

### Data and integration needs

- Better Auth password reset APIs and reset token handling
- Resend email delivery integration
- New environment variables for Resend credentials and sender identity
- Reset email content and callback URL generation

## Scenarios with acceptance criteria

### Scenario 1: Request password reset from login

Given a signed-out user is on `/login`
When they choose the forgot-password path and submit their email
Then the system accepts the request and shows a generic success state
And the response does not reveal whether the email belongs to an account

### Scenario 2: Known and unknown email behave the same externally

Given a signed-out user submits either a known or unknown email
When the request completes
Then the visible response is materially the same in both cases
And no account existence information is leaked through page messaging

### Scenario 3: Reset password with a valid link

Given a user has a valid password reset link
When they open the reset page and submit a valid new password and confirmation
Then the password is updated successfully
And the user is directed to sign in

### Scenario 4: Validation error on reset form

Given a user is on the reset page
When they submit mismatched passwords or a password shorter than the minimum requirement
Then the reset does not complete
And the page shows a clear validation error

### Scenario 5: Invalid or expired reset link

Given a user opens the reset page with an invalid or expired token
When the page loads or they submit the form
Then the reset does not complete
And the page shows a failure state with a path to request a new reset email

### Scenario 6: New password replaces old password

Given a user has successfully reset their password
When they attempt to sign in
Then the new password works
And the old password no longer works

## Constraints and decisions

- Use the existing Better Auth email/password stack already present in the app
- Add a new Resend integration for outbound reset emails
- Reuse existing route and form patterns already used in `login` and `settings`
- Preserve the current minimum password requirement of 8 characters unless architecture review finds a stronger existing Better Auth constraint

## Out of scope

- Auth provider expansion beyond email/password
- Signed-in password change improvements beyond compatibility with the reset feature
- Full account verification or broader transactional email system design beyond what password reset requires

## Done looks like

- A user can initiate password reset from the login experience
- The app sends a reset email through Resend
- The user can open a reset link and set a new password
- The flow handles invalid and expired links
- The UI does not leak whether an account exists
- The user can sign in with the new password after reset
