# RoomCheck — Industry-Grade Security Architecture

## Threat Model
- XSS (stored/reflected) via user input (names, emails, room titles)
- CSRF against booking/auth endpoints
- SQL Injection via unsanitized query parameters
- Brute force / credential stuffing on login
- Session hijacking (no secure cookies, missing HttpOnly/SameSite)
- Insecure direct object reference (IDOR) on room/admin endpoints
- Information disclosure via verbose errors
- Clickjacking (no X-Frame-Options)
- Supply-chain attacks via unverified CDN links

## Security Controls Implemented

### 1. Content Security Policy (CSP)
All pages must include:
```html
<meta http-equiv="Content-Security-Policy"
  content="default-src 'self';
  script-src 'self' https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js;
  style-src 'self' https://fonts.googleapis.com https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/;
  connect-src 'self';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';">
```

### 2. HTTP Security Headers (Nginx / Server)
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`

### 3. Input Sanitization & Validation (Frontend + Backend)
- All form inputs validated with regex patterns.
- Email: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
- Room names / titles: alphanumeric + spaces, max 100 chars.
- Dates: `YYYY-MM-DD` format only.
- Times: `HH:MM` 24-hour format only.
- Capacity: integer between 10 and 200.
- User IDs: UUID v4 format only.
- Server-side parameterized queries (prepared statements) for all DB access.

### 4. Authentication & Session Management
- Passwords hashed with `bcrypt` (salt rounds: 12).
- JWT access tokens (15 min expiry) + refresh tokens (7 days, HttpOnly, Secure, SameSite=Strict).
- Session fixation protection: regenerate session ID on login/logout.
- Rate limiting: 5 login attempts per IP per 15 minutes (express-rate-limit + custom middleware).
- Lockout after 10 failed attempts (temporary 30-minute block).

### 5. CSRF Protection
- Double-submit cookie pattern.
- All state-changing endpoints (`POST`, `PUT`, `DELETE`) require `X-CSRF-Token` header.
- Token rotated every request or every 15 minutes.

### 6. XSS Prevention
- All user-generated content escaped before DOM insertion (`textContent`, never `innerHTML` for untrusted data).
- Sanitization library (`DOMPurify`) applied to any rich-text fields.
- No inline event handlers (`onclick`) — all event listeners attached via secure JS.

### 7. SQL Injection Prevention
- Zero string concatenation in SQL.
- ORM (Prisma / Sequelize) with strict typing.
- Read-only DB user for search endpoints; write access restricted to booking/auth endpoints.

### 8. Rate Limiting
- Global: 100 requests/minute per IP.
- Auth endpoints: 10/minute per IP.
- Search endpoints: 30/minute per IP.
- Admin endpoints: 20/minute per IP.

### 9. Secure Deployment (Docker + Nginx)
- Non-root container user (`UID: 1000`).
- Minimal base image (`node:20-alpine`).
- Secret management: `.env` excluded from image; injected at runtime.
- Read-only filesystem (`readOnlyRootFilesystem: true`) except `/tmp`.
- No privileged mode.
- Health checks (`/health`) exposed but unauthenticated; admin data behind auth.

### 10. Audit & Logging
- Structured JSON logging to stdout.
- No PII in logs (mask emails: `user@example***`).
- Failed login attempts, CSRF violations, rate limit hits logged with IP and timestamp.
- Logs rotated and shipped to centralized monitoring.

### 11. Dependency Security
- `npm audit --audit-level=high` run in CI.
- `snyk test` or `dependabot` for automated updates.
- Lockfiles (`package-lock.json`) pinned with exact versions.
- CDN resources loaded with Subresource Integrity (SRI) hashes.

### 12. Accessibility & Professional Design (UI Grade)
- WCAG 2.1 AA compliance: color contrast ratio ≥ 4.5:1, focus indicators, keyboard navigation.
- ARIA labels on interactive elements.
- Semantic HTML5 (`<main>`, `<nav>`, `<article>`, `<section>`).
- Responsive breakpoints: 320px, 768px, 1024px, 1440px.
- Dark mode support via `prefers-color-scheme`.
- Professional typography with `font-family` fallback chain.
