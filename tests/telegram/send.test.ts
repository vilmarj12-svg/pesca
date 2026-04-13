import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sendMessage } from '@/telegram/send'

describe('sendMessage', () => {
  beforeEach(() => {
    vi.stubEnv('TELEGRAM_BOT_TOKEN', 'test-token')
    vi.stubEnv('TELEGRAM_CHAT_ID', '12345')
  })

  it('returns false when TELEGRAM_BOT_TOKEN is not set', async () => {
    vi.stubEnv('TELEGRAM_BOT_TOKEN', '')
    const result = await sendMessage('hello')
    expect(result).toBe(false)
  })

  it('returns false when TELEGRAM_CHAT_ID is not set', async () => {
    vi.stubEnv('TELEGRAM_CHAT_ID', '')
    const result = await sendMessage('hello')
    expect(result).toBe(false)
  })

  it('calls Telegram API with correct params', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: () => ({ ok: true }) })
    vi.stubGlobal('fetch', mockFetch)

    await sendMessage('test message')

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.telegram.org/bottest-token/sendMessage',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: '12345',
          text: 'test message',
          parse_mode: 'HTML',
        }),
      })
    )

    vi.unstubAllGlobals()
  })

  it('returns true on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => ({ ok: true }) }))
    const result = await sendMessage('hello')
    expect(result).toBe(true)
    vi.unstubAllGlobals()
  })

  it('returns false on fetch error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')))
    const result = await sendMessage('hello')
    expect(result).toBe(false)
    vi.unstubAllGlobals()
  })
})
