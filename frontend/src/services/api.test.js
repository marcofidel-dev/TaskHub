import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import api from './api'

// Fake transport for the `api` instance: first call with the stale token → 401,
// any call with the fresh token → 200.
function installAdapter(calls) {
  api.defaults.adapter = async (config) => {
    calls.push({ url: config.url, auth: config.headers.Authorization })
    if (config.headers.Authorization === 'Bearer new.access') {
      return { data: { ok: true }, status: 200, statusText: 'OK', headers: {}, config }
    }
    const err = new Error('401')
    err.config = config
    err.response = { status: 401, data: {}, config }
    throw err
  }
}

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem('accessToken', 'old.access')
  localStorage.setItem('refreshToken', 'old.refresh')
  localStorage.setItem('user', '{"id":1}')
})
afterEach(() => vi.restoreAllMocks())

describe('401 handling', () => {
  it('refreshes once, stores BOTH rotated tokens and retries the request', async () => {
    const calls = []
    installAdapter(calls)
    const post = vi.spyOn(axios, 'post').mockResolvedValue({
      data: { accessToken: 'new.access', refreshToken: 'new.refresh' },
    })

    const res = await api.get('/v1/tasks')

    expect(res.data).toEqual({ ok: true })
    expect(post).toHaveBeenCalledTimes(1)
    expect(post.mock.calls[0][1]).toEqual({ refreshToken: 'old.refresh' })
    expect(localStorage.getItem('accessToken')).toBe('new.access')
    expect(localStorage.getItem('refreshToken')).toBe('new.refresh')
    expect(calls.map((c) => c.auth)).toEqual(['Bearer old.access', 'Bearer new.access'])
  })

  it('concurrent 401s share a single refresh call', async () => {
    installAdapter([])
    const post = vi.spyOn(axios, 'post').mockResolvedValue({
      data: { accessToken: 'new.access', refreshToken: 'new.refresh' },
    })

    await Promise.all([api.get('/v1/tasks'), api.get('/v1/categories'), api.get('/v1/tags')])

    expect(post).toHaveBeenCalledTimes(1)
  })

  it('clears the session when the refresh fails', async () => {
    installAdapter([])
    vi.spyOn(axios, 'post').mockRejectedValue(new Error('refresh rejected'))

    await expect(api.get('/v1/tasks')).rejects.toBeDefined()

    expect(localStorage.getItem('accessToken')).toBeNull()
    expect(localStorage.getItem('refreshToken')).toBeNull()
  })

  it('does not try to refresh on a failed login (wrong password)', async () => {
    installAdapter([])
    const post = vi.spyOn(axios, 'post')

    await expect(api.post('/v1/auth/login', {})).rejects.toBeDefined()

    expect(post).not.toHaveBeenCalled()
    expect(localStorage.getItem('accessToken')).toBe('old.access')
  })
})
