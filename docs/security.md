# Security

## Overview

Titan is a **frontend-only demo application** with no backend infrastructure or authentication. This document describes the security model and limitations.

## Scope

This application is designed for:

- Internal demos and proof-of-concepts
- Engineering onboarding and training
- Feature showcase in controlled environments

**Not suitable for**:

- Handling sensitive or production data
- Multi-user environments with access controls
- Real user authentication or authorization

## Security Model

### Data Storage

- **Client-side only**: All data lives in browser memory and localStorage
- **No encryption**: localStorage is not encrypted; any user with access to the device can read it
- **No authentication**: No user login or session management
- **No authorization**: No access controls or permission checking

### XSS Protection

- Input is sanitized via React's automatic escaping
- No `dangerouslySetInnerHTML` usage in core features
- Fixture data is static and controlled

### CSRF & CORS

- Not applicable; no backend server
- All network requests are fixture-based or frontend-only

### Data Clearance

Users can clear all application data by:

1. Opening browser DevTools
2. Clearing localStorage for this domain
3. Hard-refreshing the page

## Limitations

1. **No Data Privacy**: All state is visible in browser memory and localStorage (plaintext)
2. **No Audit Trail**: No record of who made changes or when (state mutations are silent)
3. **No Rate Limiting**: No throttling on state mutations (anyone with access can spam actions)
4. **No Backup**: Data is lost if browser cache is cleared or localStorage is disabled
5. **Single Browser, Single Tab**: State does not sync across tabs or devices; each tab is independent

## Recommendations for Production

If extending Titan for production use:

- Implement proper authentication (OAuth, SAML, etc.)
- Add authorization layer with role-based access control
- Use HTTPS for all communication
- Implement server-side encryption for sensitive data
- Add audit logging for compliance
- Implement CSRF and XSS protections
- Set security headers (CSP, X-Frame-Options, etc.)
- Use secure cookies for session management
- Implement rate limiting and DDoS protection
- Add input validation and sanitization on backend

## Current Deployment

This application can be safely deployed as a demo on internal networks or public URLs since:

- It contains no real data
- It has no sensitive operations
- User actions are isolated per session
- No cross-site state sharing

Do **not** store or use real user data, credentials, or sensitive information.
