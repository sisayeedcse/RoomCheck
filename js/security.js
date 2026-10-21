/**
 * RoomCheck — Secure Client-Side JavaScript
 * Handles: input sanitization, XSS prevention, CSRF token management,
 * form validation, secure event binding.
 */

(function() {
  'use strict';

  /* ============================================================
     SANITIZATION
     ============================================================ */
  function sanitizeString(str, maxLength = 200) {
    if (typeof str !== 'string') return '';
    // Strip HTML tags
    let clean = str.replace(/<[^>]*>/g, '');
    // Trim and limit length
    clean = clean.trim().substring(0, maxLength);
    return clean;
  }

  function sanitizeEmail(email) {
    if (typeof email !== 'string') return '';
    const trimmed = email.trim();
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regex.test(trimmed)) return '';
    return trimmed.toLowerCase();
  }

  function sanitizeDate(dateStr) {
    if (typeof dateStr !== 'string') return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  /* ============================================================
     FORM VALIDATION
     ============================================================ */
  function validateForm(form) {
    const errors = [];
    const inputs = form.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
      if (input.type === 'email') {
        const val = input.value.trim();
        if (val && !sanitizeEmail(val)) {
          errors.push(`Invalid email format: ${val}`);
          input.setCustomValidity('Please enter a valid email address.');
        } else {
          input.setCustomValidity('');
        }
      }
      if (input.type === 'date') {
        const val = input.value.trim();
        if (val && !sanitizeDate(val)) {
          input.setCustomValidity('Invalid date format.');
        } else {
          input.setCustomValidity('');
        }
      }
      if (input.type === 'time') {
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (input.value && !timeRegex.test(input.value)) {
          input.setCustomValidity('Invalid time format. Use HH:MM.');
        } else {
          input.setCustomValidity('');
        }
      }
    });

    if (errors.length > 0) {
      console.warn('RoomCheck Form Validation Errors:', errors);
    }
    return errors.length === 0;
  }

  /* ============================================================
     CSRF TOKEN (for future backend integration)
     ============================================================ */
  function getCsrfToken() {
    let token = document.cookie.replace(/(?:(?:^|.*;\s*)csrf_token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    if (!token) {
      token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    return token;
  }

  /* ============================================================
     SECURE EVENT LISTENERS (no inline handlers)
     ============================================================ */
  document.addEventListener('DOMContentLoaded', () => {
    // Secure all form submissions
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', (e) => {
        if (!validateForm(form)) {
          e.preventDefault();
          // Show validation errors visually (optional enhancement)
          const firstInvalid = form.querySelector(':invalid');
          if (firstInvalid) firstInvalid.focus();
        } else {
          // Prevent XSS via URL manipulation on GET forms
          const action = form.getAttribute('action');
          if (action && action.startsWith('http')) {
            e.preventDefault();
            console.error('Blocked navigation to external URL:', action);
          }
        }
      });
    });

    // Secure input event for text fields
    document.querySelectorAll('input[type="text"], input[type="email"], textarea').forEach(el => {
      el.addEventListener('input', () => {
        // Prevent excessively long input
        if (el.value.length > 500) {
          el.value = el.value.substring(0, 500);
        }
      });
    });
  });

  /* ============================================================
     PUBLIC API
     ============================================================ */
  window.RoomCheckSecure = {
    sanitizeString,
    sanitizeEmail,
    sanitizeDate,
    validateForm,
    getCsrfToken
  };
})();
