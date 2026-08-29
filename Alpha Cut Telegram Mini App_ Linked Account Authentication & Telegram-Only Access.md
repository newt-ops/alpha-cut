# Alpha Cut Telegram Mini App: Linked Account Authentication & Telegram-Only Access

We are implementing the Telegram Mini App for the existing Alpha Cut platform.

## Goal

Set up the Mini App so that:

1. The Mini App can only be used inside Telegram.
2. Opening `https://app.alpha-cut.com/` directly in a normal browser shows a Telegram-only screen instead of the actual application.
3. When a user opens the Mini App from our Telegram bot, Telegram provides the user's WebApp identity.
4. The backend verifies Telegram's `initData` securely.
5. The verified Telegram account is matched to the user's existing Alpha Cut web account.
6. If the Telegram account is linked, the Mini App opens using that existing Alpha Cut account.
7. The user must NOT log in with email/password inside the Mini App.
8. If the Telegram account is not linked, show a clear account-linking screen and do not expose the user's Alpha Cut data.
9. The Mini App should use the same Alpha Cut backend/database as the main web application.
10. Do not create a separate Mini App user/account system.

---

# 1. First inspect the existing project

Before changing anything:

- Inspect the existing frontend architecture.
- Inspect the backend/API architecture.
- Inspect the existing authentication system.
- Inspect the User model/schema.
- Inspect how users currently log in to the main web application.
- Inspect whether Telegram account linking already exists.
- Inspect the existing Telegram bot implementation.
- Inspect existing environment variables and deployment configuration.
- Inspect existing API authentication middleware.

Do NOT replace existing authentication or architecture unnecessarily.

Reuse the current system wherever possible.

---

# 2. Telegram account relationship

The Alpha Cut user account is the source of truth.

The relationship should conceptually be:

User
├── normal Alpha Cut account
├── email/password or existing auth
└── telegram
    ├── linked
    ├── telegramUserId
    └── linkedAt

Use Telegram's numeric `user.id` as the permanent identifier.

Do NOT use:

- Telegram username
- Telegram display name
- First/last name

as the account identifier.

If a Telegram account is linked to an Alpha Cut account, the Mini App should resolve:

Telegram User ID
→ linked Alpha Cut User
→ authenticated Mini App session

---

# 3. Telegram WebApp initialization

Use Telegram's official WebApp JavaScript API.

The Mini App should initialize Telegram WebApp functionality as early as possible.

The frontend should:

- detect whether Telegram WebApp is available
- call `Telegram.WebApp.ready()`
- support Telegram's viewport behavior
- support Telegram theme variables
- support Telegram theme changes
- use Telegram's safe-area/viewport information where appropriate
- avoid assuming a fixed mobile screen size

Do not fake Telegram authentication using frontend values.

---

# 4. Telegram-only browser protection

The Mini App URL is:

https://app.alpha-cut.com/

If the page is opened normally in Chrome, Firefox, Edge, etc., outside Telegram:

DO NOT load the authenticated Mini App.

Instead show a dedicated screen:

"Alpha Cut Mini App"

"This app runs inside Telegram. Open it from the Alpha Cut bot to continue."

Include an:

"Open in Telegram"

button.

The button should use the correct Alpha Cut Telegram bot/Mini App launch URL from the existing bot configuration.

Do not invent a bot username or URL if one already exists in the project. Inspect the existing configuration and reuse it.

The browser-only screen should be branded using the Mini App's Telegram-native visual system.

---

# 5. Authentication flow

When the Mini App is opened inside Telegram:

Frontend:

Telegram WebApp
→ obtain `initData`
→ send `initData` to Alpha Cut backend over HTTPS

Example endpoint concept:

POST /api/auth/telegram-mini-app

Request:

{
  "initData": "..."
}

The backend must verify the Telegram WebApp `initData` according to Telegram's official verification mechanism.

Do NOT trust:

- `telegramUserId` sent separately by the frontend
- username sent by the frontend
- first_name sent by the frontend
- any manually supplied user identifier

The backend should extract the verified Telegram user ID from the validated Telegram data.

---

# 6. Resolve the linked Alpha Cut account

After successful Telegram verification:

Backend:

verified Telegram user ID
→ search User.telegram.telegramUserId
→ find Alpha Cut account

If found:

Create/return an authenticated Mini App session using the existing Alpha Cut authentication/session architecture where appropriate.

The Mini App should receive only what it needs to operate as that authenticated user.

Do not expose:

- passwords
- password hashes
- private authentication secrets
- Telegram bot token
- sensitive internal fields

---

# 7. Unlinked Telegram account

If Telegram authentication succeeds but no Alpha Cut account is linked:

Do NOT automatically create a new Alpha Cut account.

Instead show:

"Telegram isn't linked"

"Connect your Telegram account to your Alpha Cut account to use the Mini App."

Provide an appropriate action such as:

"Link Account"

Use the existing Alpha Cut Telegram linking workflow if it already exists.

If a linking workflow does not exist, implement only the backend/frontend pieces necessary for secure linking. Do not build a completely separate account system.

---

# 8. Already-linked account

If:

Telegram User ID
→ Alpha Cut User A

then the Mini App should immediately operate as User A.

Example:

Telegram Account
    ↓
Verified Telegram User ID
    ↓
Alpha Cut User
    ↓
Mini App Session
    ↓
User's proposals/projects/profile

The user should never have to enter:

Email
Password
Username

inside the Mini App.

---

# 9. Prevent account spoofing

This is critical.

Never allow the frontend to say:

"Authenticate me as userId=123"

The backend must determine the Alpha Cut account from the cryptographically verified Telegram identity.

For example:

BAD:

POST /api/mini-app/proposal/123/accept

with:

{
  "userId": "some-user-id"
}

GOOD:

Authenticated Mini App session
→ backend knows current Alpha Cut user
→ verify that user owns/is authorized for proposal 123
→ perform action

Every protected Mini App API endpoint must authorize against the authenticated server-side user.

---

# 10. Proposal actions

The Mini App will eventually support quick actions such as:

- Review proposal
- Accept proposal
- Reject proposal
- View profile
- View project status
- View notifications

For state-changing operations such as accepting/rejecting proposals:

1. Authenticate the Telegram user.
2. Resolve their Alpha Cut account.
3. Verify they are authorized to modify that proposal.
4. Perform the action.
5. Return the updated state.
6. Optionally use Telegram haptic feedback on the frontend.

Do not trust proposal ownership information supplied by the client.

---

# 11. Mini App should NOT duplicate the main web application

Keep the Mini App intentionally minimal.

The Mini App is a quick-action companion to the main Alpha Cut website.

Initial functionality should be focused on:

- Home / pending actions
- Proposal review
- Accept proposal
- Reject proposal
- Project/status overview
- Profile view
- Notifications
- Link back to the full Alpha Cut web application

Do NOT migrate the entire main website into the Mini App.

The main web app remains the full workspace.

---

# 12. Shared backend

Architecture should remain:

Telegram
    ↓
Telegram Bot
    ↓
Telegram Mini App
    ↓
Alpha Cut API
    ↓
Existing database

The Mini App must use the same Alpha Cut API and database as the main web application.

Do not create:

- separate Mini App database
- duplicate user collection
- duplicate proposal collection
- duplicate project collection

---

# 13. Telegram-native UI foundation

Set up the Mini App UI around Telegram's theme variables.

Use Telegram-provided variables such as:

--tg-theme-bg-color
--tg-theme-secondary-bg-color
--tg-theme-text-color
--tg-theme-hint-color
--tg-theme-link-color
--tg-theme-button-color
--tg-theme-button-text-color

Use sensible fallbacks for development outside Telegram.

The visual language should be:

- Telegram-native
- clean
- mobile-first
- subtle borders/dividers
- restrained rounded corners
- Telegram-style typography
- strong touch targets
- minimal visual noise

Do not simply reuse the full Alpha Cut website styling.

Alpha Cut branding should be subtle while Telegram's native theme remains dominant.

---

# 14. Telegram UI integration

Prepare the architecture for:

- `Telegram.WebApp.ready()`
- `Telegram.WebApp.expand()`
- theme changes
- viewport changes
- safe areas
- Telegram Main Button where appropriate
- Telegram Back Button where appropriate
- haptic feedback for important interactions

Do not overuse these features.

The goal is a native Telegram experience, not a flashy web dashboard.

---

# 15. Environment variables

Inspect the existing environment configuration.

Telegram bot credentials must remain SERVER-SIDE ONLY.

Never expose the Telegram bot token through:

- VITE environment variables
- frontend JavaScript
- API responses
- source code shipped to the browser

If the frontend needs a public Telegram configuration value, only expose values that are genuinely safe to expose.

---

# 16. Error states

Implement clear states for:

### Browser

"Open this app inside Telegram."

### Telegram user not linked

"Your Telegram account isn't linked to Alpha Cut."

### Authentication failed

"Unable to verify your Telegram session. Please reopen the Mini App from the Alpha Cut bot."

### Linked account unavailable

"Your Alpha Cut account could not be found."

### Session expired

"Your session has expired. Please reopen the Mini App from Telegram."

### Network/API failure

Show a clean retry state.

Do not expose raw backend errors or stack traces to users.

---

# 17. Security requirements

Treat Telegram `initData` as authentication input that must be verified server-side.

Do not trust frontend identity fields.

Use HTTPS in production.

Keep bot credentials server-side.

Validate authorization for every protected API operation.

Prevent one linked Telegram account from accessing another Alpha Cut user's data.

Do not log sensitive authentication data such as:

- bot token
- raw initData
- session secrets
- passwords

Use safe structured logging where needed.

---

# 18. Development mode

Make local development practical.

If Telegram WebApp context is unavailable during development, provide a development-only mechanism if necessary, but:

- it must be clearly development-only
- it must never be enabled in production
- it must not bypass production authentication
- do not introduce a permanent fake Telegram identity mechanism

Production behavior must always require valid Telegram WebApp authentication.

---

# 19. Acceptance tests

Before considering this implementation complete, verify:

### Test 1
Open:

https://app.alpha-cut.com/

in Chrome.

Expected:

Telegram-only screen.

### Test 2
Open Mini App from Alpha Cut Telegram bot using a linked Telegram account.

Expected:

Mini App opens directly into the corresponding Alpha Cut account.

### Test 3
Open Mini App from a Telegram account that is not linked.

Expected:

No Alpha Cut account data is shown.

User sees linking instructions.

### Test 4
Try sending a fake Telegram user ID from the frontend.

Expected:

Backend ignores/rejects it.

### Test 5
Try accessing another user's proposal through the Mini App API.

Expected:

Authorization failure.

### Test 6
Change Telegram between light/dark theme.

Expected:

Mini App adapts to Telegram theme.

### Test 7
Accept a proposal.

Expected:

Backend verifies authenticated Alpha Cut user and proposal authorization before changing state.

### Test 8
Close/reopen the Mini App.

Expected:

User can authenticate again cleanly without being asked for email/password.

---

# 20. Important implementation rule

Do not rewrite unrelated Alpha Cut functionality.

First inspect the existing architecture and integrate this cleanly into it.

Before coding, provide a short implementation plan identifying:

1. Existing authentication flow
2. Existing Telegram linking flow
3. User schema changes required
4. Backend endpoints required
5. Frontend changes required
6. Bot changes required
7. Environment variables required
8. Security considerations
9. Files that will be modified

Then implement the changes.

After implementation, report:

- files changed
- endpoints added/modified
- database changes
- Telegram bot changes
- authentication flow
- security measures
- tests performed
- anything that still requires configuration/deployment

Do not claim Telegram authentication works in production until the actual bot, Mini App URL, HTTPS deployment, and Telegram configuration have been verified.