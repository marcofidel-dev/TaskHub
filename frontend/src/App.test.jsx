import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom'

// ── Isolated ProtectedRoute component (same logic as in App.jsx) ──────────────
function ProtectedRoute({ children, isAuthenticated, loading }) {
  if (loading) {
    return <div data-testid="loading-spinner" />
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// ── Minimal page stubs ────────────────────────────────────────────────────────
const Dashboard = () => <div data-testid="dashboard">Dashboard</div>
const LoginPage = () => <div data-testid="login-page">Login</div>

// ── Helpers ───────────────────────────────────────────────────────────────────
function renderProtectedApp({ isAuthenticated, loading = false, initialPath = '/dashboard' }) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  )
}

// ── ProtectedRoute: authentication guard ─────────────────────────────────────
describe('ProtectedRoute', () => {
  it('renders children when authenticated', () => {
    renderProtectedApp({ isAuthenticated: true })
    expect(screen.getByTestId('dashboard')).toBeInTheDocument()
  })

  it('redirects to /login when not authenticated', () => {
    renderProtectedApp({ isAuthenticated: false })
    expect(screen.getByTestId('login-page')).toBeInTheDocument()
    expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument()
  })

  it('shows loading spinner while auth state is resolving', () => {
    renderProtectedApp({ isAuthenticated: false, loading: true })
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument()
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument()
  })

  it('renders dashboard once loading completes and user is authenticated', () => {
    renderProtectedApp({ isAuthenticated: true, loading: false })
    expect(screen.getByTestId('dashboard')).toBeInTheDocument()
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
  })
})

// ── Navigation after auth ────────────────────────────────────────────────────
describe('navigation after auth', () => {
  it('unauthenticated user at /dashboard ends up on /login', () => {
    renderProtectedApp({ isAuthenticated: false, initialPath: '/dashboard' })
    expect(screen.getByTestId('login-page')).toBeInTheDocument()
  })

  it('authenticated user at /dashboard sees Dashboard', () => {
    renderProtectedApp({ isAuthenticated: true, initialPath: '/dashboard' })
    expect(screen.getByTestId('dashboard')).toBeInTheDocument()
  })
})
