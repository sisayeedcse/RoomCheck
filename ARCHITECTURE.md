# RoomCheck — System Architecture

## Stack (Industry-Grade Deployment)
| Layer | Technology | Justification |
|---|---|---|
| Frontend | HTML5 + Vanilla JS + Modern CSS3 (CSS variables, grid/flexbox, container queries) | Zero build step, fast load, full control |
| CSS Framework | Bootstrap 5 (grid only) + Custom design tokens | Consistent spacing/alignment |
| Backend | Node.js 20 LTS + Express 4.19 | Mature, high performance, massive ecosystem |
| Database | PostgreSQL 16 (via Prisma ORM) | ACID compliance, relational integrity, mature backups |
| Auth | JWT (access/refresh) + bcrypt hashing | Industry standard, stateless auth, secure storage |
| Cache | Redis 7 (optional) | Rate-limit tracking, session store, search query cache |
| Reverse Proxy | Nginx 1.25 | SSL termination, static file serving, security headers |
| Container | Docker Compose + Alpine base | Reproducible builds, minimal attack surface |
| Monitoring | Prometheus + Grafana (optional) | Metrics, uptime, security event monitoring |

## Database Schema (PostgreSQL)

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('student', 'faculty', 'admin');
CREATE TYPE room_type AS ENUM ('classroom', 'laboratory');
CREATE TYPE room_status AS ENUM ('available', 'occupied');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  student_faculty_id VARCHAR(50) UNIQUE,
  role user_role NOT NULL DEFAULT 'student',
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_number VARCHAR(20) NOT NULL UNIQUE,
  room_type room_type NOT NULL,
  floor INTEGER NOT NULL CHECK (floor >= 1 AND floor <= 15),
  capacity INTEGER NOT NULL CHECK (capacity >= 10 AND capacity <= 500),
  building VARCHAR(100) DEFAULT 'Academic Building',
  image_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rooms_floor ON rooms(floor);
CREATE INDEX idx_rooms_type ON rooms(room_type);

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status booking_status DEFAULT 'pending',
  purpose VARCHAR(500) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_room_date ON bookings(room_id, booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);

CREATE TABLE room_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  course_code VARCHAR(20) NOT NULL,
  course_title VARCHAR(200),
  instructor_name VARCHAR(200) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_schedules_room_day ON room_schedules(room_id, day_of_week);
```

## API Specification (REST + JSON)

### Authentication
| Endpoint | Method | Auth | Rate Limit | Description |
|---|---|---|---|---|
| `/api/auth/register` | POST | None | 5/min | Create account |
| `/api/auth/login` | POST | None | 10/min | Issue JWT pair |
| `/api/auth/refresh` | POST | Refresh cookie | 20/min | Rotate access token |
| `/api/auth/logout` | POST | Access token | 20/min | Revoke session |

### Rooms & Search
| Endpoint | Method | Auth | Rate Limit | Description |
|---|---|---|---|---|
| `/api/rooms/search` | GET | Optional | 30/min | Filter by date/time/floor/type/capacity |
| `/api/rooms/:id` | GET | Optional | 30/min | Room details + schedule |

### Bookings
| Endpoint | Method | Auth | Rate Limit | Description |
|---|---|---|---|---|
| `/api/bookings` | POST | Access token | 10/min | Create booking (requires confirmation) |
| `/api/bookings` | GET | Access token | 30/min | User's bookings |
| `/api/bookings/:id` | PUT | Access token | 10/min | Update/cancel booking |
| `/api/bookings/:id` | DELETE | Access token | 10/min | Cancel booking |

### Admin
| Endpoint | Method | Auth | Rate Limit | Description |
|---|---|---|---|---|
| `/api/admin/rooms` | GET | Admin token | 20/min | All rooms |
| `/api/admin/bookings` | GET | Admin token | 20/min | All bookings |

### Health
| Endpoint | Method | Auth | Rate Limit | Description |
|---|---|---|---|---|
| `/health` | GET | None | None | Liveness + readiness probe |

## Request/Response Security
- All POST/PUT/DELETE endpoints return `403` without `X-CSRF-Token` header.
- All responses include `Content-Type: application/json; charset=utf-8`.
- Error responses never expose stack traces (`NODE_ENV=production`).
- Rate limit exceeded: `429 Too Many Requests` with `Retry-After` header.
- Input validation errors: `400 Bad Request` with structured JSON error array.
