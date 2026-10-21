# 🎓 RoomCheck — Industry-Grade Deployable System

**Status:** Professional UI + Secure Full-Stack Architecture (Option C Implemented)

## 🏗️ System Overview

RoomCheck has been upgraded from a static frontend prototype to a fully specified, industry-grade deployable system with:

- **Professional modern UI:** Glassmorphism, dark mode support, WCAG 2.1 AA accessibility, responsive design, CSS variable design tokens
- **Security architecture:** CSP meta tags, XSS prevention, input sanitization, CSRF protection spec, rate limiting, secure cookie design
- **Backend specification:** Express 20 + PostgreSQL 16 + Prisma ORM + JWT authentication + rate limiting
- **Deployment config:** Docker Compose (non-root containers, read-only FS), Nginx reverse proxy with TLS 1.3 and security headers, `.env` template

## 📁 Project Structure

```
RoomCheck/
├── index.html                 # Secure landing page with CSP
├── search.html / results.html  # Search engine with validated inputs
├── login.html / register.html  # Auth pages (ready for JWT backend integration)
├── dashboard.html / bookings.html / admin.html / routine.html / room-details.html
├── css/
│   ├── style.css              # Professional design system (variables, dark mode)
│   └── responsive.css         # Mobile-first responsive rules
├── js/
│   └── security.js            # Client-side sanitization, validation, CSRF
├── images/                    # Room photography assets
├── SECURITY.md                # Threat model + security controls
├── ARCHITECTURE.md            # Database schema, API spec, stack justification
├── docker-compose.yml         # Multi-service deploy (app, db, nginx)
├── nginx.conf                 # TLS 1.3, security headers, rate limits
├── .env.template              # Secret management template
├── backend/
│   ├── server.js              # Express server spec (helmet, rate limit, CSP)
│   ├── Dockerfile             # Alpine, non-root, health checks
│   └── package.json           # Dependencies (express, helmet, prisma, bcrypt)
└── README.md                  # This file
```

## 🔒 Security Features Implemented

1. **CSP Meta Tags** on all 10 HTML pages
2. **HTTP Security Headers** documented (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
3. **Input Sanitization** library (`js/security.js`) — strips HTML, validates emails/dates/times, limits length
4. **Form Validation** — prevents invalid submissions
5. **CSRF Token System** — ready for backend integration (`X-CSRF-Token` header spec)
6. **Rate Limiting Spec** — 100 requests/min per IP, 10/min for auth endpoints
7. **Password Security Spec** — bcrypt (12 rounds)
8. **JWT Auth Design** — 15-min access tokens, 7-day refresh tokens (`HttpOnly`, `Secure`, `SameSite=Strict`)
9. **XSS Prevention** — no `innerHTML` for untrusted data, event listeners only
10. **SQL Injection Prevention** — parameterized queries via Prisma ORM
11. **Secure Deployment** — non-root Docker user, read-only filesystem, minimal Alpine base, secrets via `.env`

## 🎨 UI Improvements

- Modern glassmorphism navigation with backdrop blur
- Professional color system (deep navy brand, amber accent)
- Responsive breakpoints: 320px, 768px, 1024px, 1440px
- Dark mode via `prefers-color-scheme`
- WCAG AA color contrast ratios
- Semantic HTML5 and ARIA labels
- Animated hover states, focus rings for keyboard navigation

## 🚀 How to Deploy (Industry Standard)

### 1. Configure Environment
```bash
cp .env.template .env
# Edit DB_PASSWORD, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
```

### 2. Build & Launch
```bash
docker-compose up -d --build
```

### 3. Initialize Database
```bash
docker exec roomcheck_db psql -U roomcheck_user -d roomcheck -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
# Run Prisma migrations from backend container
```

### 4. Access System
```
https://localhost (after configuring SSL certificates in nginx.conf)
```

## ✅ Verification Checklist

- [x] All 10 pages upgraded with CSP + security meta
- [x] CSS design system with dark mode + accessibility
- [x] Client-side input sanitization (`security.js`)
- [x] Security architecture document (`SECURITY.md`)
- [x] System architecture spec (`ARCHITECTURE.md`)
- [x] Docker deployment config (`docker-compose.yml`)
- [x] Nginx reverse proxy with TLS + security headers (`nginx.conf`)
- [x] Backend API specification (`backend/server.js`, `Dockerfile`, `package.json`)
- [x] Environment secret template (`.env.template`)
- [x] Professional responsive design (`css/style.css`, `css/responsive.css`)

---
© 2026 ROOMCHECK — Industry-Grade Classroom & Lab Availability System
