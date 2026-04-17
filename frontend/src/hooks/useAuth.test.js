import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAuth } from './useAuth'

// ── Mock the API module ───────────────────────────────────────────────────────
vi.mock('../services/api', () => ({
  auth: {
    register: vi.fn(),
    login:    vi.fn(),
    refresh:  vi.fn(),
  },
}))

import { auth } from '../services/api'

// ── localStorage helpers ──────────────────────────────────────────────────────
const mockUser = { id: 1, email: 'user@example.com', username: 'testuser' }
const TOKENS   = { accessToken: 'acc.tok', refreshToken: 'ref.tok', user: mockUser }

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

afterEach(() => {
  localStorage.clear()
})

// ── Register flow ─────────────────────────────────────────────────────────────
describe('register', () => {
  it('returns true and stores tokens on success', async () => {
    auth.register.mockResolvedValue({ data: TOKENS })

    const { result } = renderHook(() => useAuth())

    let ok
    await act(async () => {
      ok = await result.current.register('user@example.com', 'testuser', 'Pass1234@')
    })

    expect(ok).toBe(true)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual(mockUser)
  })

  it('stores accessToken and refreshToken in localStorage', async () => {
    auth.register.mockResolvedValue({ data: TOKENS })

    const { result } = renderHook(() => useAuth())
    await act(async () => {
      await result.current.register('user@example.com', 'testuser', 'Pass1234@')
    })

    expect(localStorage.getItem('accessToken')).toBe('acc.tok')
    expect(localStorage.getItem('refreshToken')).toBe('ref.tok')
    expect(JSON.parse(localStorage.getItem('user'))).toEqual(mockUser)
  })

  it('returns false and sets error on API failure', async () => {
    auth.register.mockRejectedValue({
      response: { data: { message: 'Email already in use' } },
    })

    const { result } = renderHook(() => useAuth())
    let ok
    await act(async () => {
      ok = await result.current.register('taken@example.com', 'testuser', 'Pass1234@')
    })

    expect(ok).toBe(false)
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.error).toBe('Email already in use')
  })
})

// ── Login flow ────────────────────────────────────────────────────────────────
describe('login', () => {
  it('returns true and authenticates user on success', async () => {
    auth.login.mockResolvedValue({ data: TOKENS })

    const { result } = renderHook(() => useAuth())
    let ok
    await act(async () => {
      ok = await result.current.login('user@example.com', 'Pass1234@')
    })

    expect(ok).toBe(true)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user?.email).toBe('user@example.com')
  })

  it('returns false with error message on invalid credentials', async () => {
    auth.login.mockRejectedValue({
      response: { data: { message: 'Invalid credentials' } },
    })

    const { result } = renderHook(() => useAuth())
    let ok
    await act(async () => {
      ok = await result.current.login('user@example.com', 'WrongPass1@')
    })

    expect(ok).toBe(false)
    expect(result.current.error).toBe('Invalid credentials')
  })
})

// ── Token storage: hydration from localStorage ────────────────────────────────
describe('token storage', () => {
  it('restores session from localStorage on mount', async () => {
    localStorage.setItem('accessToken', 'stored.acc')
    localStorage.setItem('refreshToken', 'stored.ref')
    localStorage.setItem('user', JSON.stringify(mockUser))

    const { result } = renderHook(() => useAuth())

    // Wait for useEffect to run
    await act(async () => {})

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual(mockUser)
    expect(result.current.accessToken).toBe('stored.acc')
  })

  it('does not restore session when localStorage is empty', async () => {
    const { result } = renderHook(() => useAuth())
    await act(async () => {})

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })
})

// ── Logout ────────────────────────────────────────────────────────────────────
describe('logout', () => {
  it('clears state and localStorage', async () => {
    auth.login.mockResolvedValue({ data: TOKENS })

    const { result } = renderHook(() => useAuth())
    await act(async () => {
      await result.current.login('user@example.com', 'Pass1234@')
    })

    act(() => {
      result.current.logout()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(result.current.accessToken).toBeNull()
    expect(localStorage.getItem('accessToken')).toBeNull()
    expect(localStorage.getItem('refreshToken')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })
})
