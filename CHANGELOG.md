# TaskHub Changelog

## [0.6.0] - 2026-04-16
### Added
- User registration with password complexity validation
- User login with JWT authentication
- AuthContext for global state management
- CORS configuration for production environment
- Auto-redirect to dashboard after registration
- Error state management and cleanup

### Fixed
- Register auth flow state synchronization
- Password validation on both frontend and backend
- CORS issues in production

### Infrastructure
- Deployed to Hostinger VPS
- CloudPanel with Nginx
- Spring Boot 3.2.4 backend
- React 18 frontend
- PostgreSQL database

### Next Sprint
- Sprint 7: Security & Testing
- JWT refresh token rotation
- Rate limiting
- Unit tests
