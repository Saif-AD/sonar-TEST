'use client'

import { useState, useEffect, useRef } from 'react'
import styled, { keyframes } from 'styled-components'
import { supabaseBrowser } from '@/app/lib/supabaseBrowserClient'

/**
 * Trigger the feedback modal from anywhere in the app:
 *
 *   window.dispatchEvent(new CustomEvent('sonar:feedback:open'))
 *
 * The sidebar Feedback row uses this so the modal's state can stay
 * encapsulated inside FeedbackWidget while still being openable from
 * outside the tree.
 */
export const FEEDBACK_OPEN_EVENT = 'sonar:feedback:open'

/**
 * Sonar-specific surfaces the user can scope feedback to. Keep in sync with
 * the actual nav routes so we can route reports to the right owner later.
 */
const FEATURE_OPTIONS = [
  { value: 'general', label: 'General' },
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'wallet-tracker', label: 'Wallet Tracker' },
  { value: 'statistics', label: 'Statistics' },
  { value: 'trending', label: 'Trending' },
  { value: 'news', label: 'News' },
  { value: 'orca-ai', label: 'Orca AI 2.0' },
  { value: 'mobile-app', label: 'Mobile app' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'help-docs', label: 'Help / Docs' },
  { value: 'bug', label: 'Bug report' },
  { value: 'other', label: 'Other' },
]

const MAX_SCREENSHOT_BYTES = 2 * 1024 * 1024 // 2 MB cap before base64 encoding

const pulseRing = `
  @keyframes sonarFeedbackPulse {
    0% { box-shadow: 0 0 0 0 rgba(34, 211, 238, 0.45), 0 8px 24px rgba(0, 0, 0, 0.45); }
    70% { box-shadow: 0 0 0 14px rgba(34, 211, 238, 0), 0 8px 24px rgba(0, 0, 0, 0.45); }
    100% { box-shadow: 0 0 0 0 rgba(34, 211, 238, 0), 0 8px 24px rgba(0, 0, 0, 0.45); }
  }
`

const FloatingButton = styled.button`
  ${pulseRing}
  position: fixed;
  bottom: 1.25rem;
  right: 1rem;
  z-index: 9999;
  background: rgba(6, 14, 22, 0.92);
  color: var(--neon-bright);
  border: 1px solid rgba(34, 211, 238, 0.35);
  border-radius: 999px;
  padding: 0.6rem 1.05rem 0.6rem 0.85rem;
  font-weight: 600;
  font-size: 0.82rem;
  letter-spacing: 0.2px;
  font-family: var(--font-sans);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(34, 211, 238, 0.08);
  animation: sonarFeedbackPulse 2.6s ease-out infinite;
  transition: transform 160ms ease, border-color 160ms ease, color 160ms ease;

  .fb-ico {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    color: var(--neon-bright);
  }

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(122, 248, 255, 0.6);
    color: #fff;
  }
  &:hover .fb-ico { color: #fff; }

  &:focus-visible {
    outline: none;
    border-color: var(--neon-bright);
    box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.25), 0 8px 24px rgba(0, 0, 0, 0.45);
  }

  @media (max-width: 640px) {
    right: 0.75rem;
    bottom: 1rem;
    padding: 0.55rem 0.95rem 0.55rem 0.8rem;
    font-size: 0.78rem;
  }
`

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1.5rem;
`

const popIn = keyframes`
  from { opacity: 0; transform: translateY(6px) scale(0.985); }
  to   { opacity: 1; transform: translateY(0)    scale(1);     }
`

const Popup = styled.form`
  width: min(440px, 100%);
  background: rgba(6, 14, 22, 0.96);
  border: 1px solid rgba(34, 211, 238, 0.22);
  border-radius: 14px;
  padding: 1.25rem 1.25rem 1rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(34, 211, 238, 0.06);
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  backdrop-filter: blur(14px);
  animation: ${popIn} 180ms cubic-bezier(0.22, 1, 0.36, 1);
`

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  margin: -0.25rem -0.25rem 0.5rem 0;

  .title-block {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    padding-top: 0.1rem;
  }
  .title {
    font-size: 1rem;
    font-weight: 700;
    background: linear-gradient(135deg, #7af8ff 0%, #22d3ee 60%, #36a6ba 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.1;
  }
  .subtitle {
    font-size: 0.78rem;
    color: var(--text-secondary);
    line-height: 1.4;
  }

  button {
    border: none;
    background: transparent;
    color: var(--text-secondary);
    font-size: 1.1rem;
    line-height: 1;
    cursor: pointer;
    padding: 0.25rem 0.4rem;
    border-radius: 6px;
    transition: color 160ms ease, background 160ms ease;
    flex-shrink: 0;
  }
  button:hover { color: #fff; background: rgba(255, 255, 255, 0.05); }
`

const FieldLabel = styled.label`
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-primary);
  display: block;
  margin: 0 0 0.4rem 0.1rem;
`

const Select = styled.select`
  width: 100%;
  border-radius: 8px;
  border: 1px solid rgba(34, 211, 238, 0.25);
  background: rgba(6, 14, 22, 0.6);
  padding: 0.6rem 2rem 0.6rem 0.85rem;
  color: var(--text-primary);
  font-size: 0.9rem;
  font-family: var(--font-sans);
  appearance: none;
  cursor: pointer;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2322d3ee' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>");
  background-repeat: no-repeat;
  background-position: right 0.7rem center;
  background-size: 12px;
  transition: border-color 160ms ease, box-shadow 160ms ease;

  &:focus {
    outline: none;
    border-color: rgba(34, 211, 238, 0.5);
    box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.12);
  }

  option { background: #061018; color: var(--text-primary); }
`

const Textarea = styled.textarea`
  width: 100%;
  min-height: 110px;
  border-radius: 8px;
  border: 1px solid rgba(34, 211, 238, 0.18);
  background: rgba(6, 14, 22, 0.6);
  padding: 0.7rem 0.9rem;
  color: var(--text-primary);
  font-size: 0.9rem;
  font-family: var(--font-sans);
  resize: vertical;
  transition: border-color 160ms ease, box-shadow 160ms ease;

  &::placeholder { color: var(--text-secondary); }
  &:focus {
    outline: none;
    border-color: rgba(34, 211, 238, 0.5);
    box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.12);
  }
`

const HiddenEmail = styled.input`
  width: 100%;
  border-radius: 8px;
  border: 1px solid rgba(34, 211, 238, 0.18);
  background: rgba(6, 14, 22, 0.6);
  padding: 0.55rem 0.85rem;
  color: var(--text-primary);
  font-size: 0.85rem;
  font-family: var(--font-sans);

  &::placeholder { color: var(--text-secondary); }
  &:focus {
    outline: none;
    border-color: rgba(34, 211, 238, 0.5);
    box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.12);
  }
`

const FilePicker = styled.div`
  border: 1px dashed rgba(34, 211, 238, 0.25);
  background: rgba(6, 14, 22, 0.4);
  border-radius: 8px;
  padding: 0.6rem 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: border-color 160ms ease, background 160ms ease;
  color: var(--text-primary);
  font-size: 0.85rem;
  font-family: var(--font-sans);

  &:hover {
    border-color: rgba(122, 248, 255, 0.5);
    background: rgba(34, 211, 238, 0.04);
  }

  .file-icon {
    color: var(--neon-bright);
    display: inline-flex;
    align-items: center;
  }
  .file-name {
    color: var(--text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    text-align: left;
  }
  .clear {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0 0.25rem;
    font-size: 1rem;
    line-height: 1;
  }
  .clear:hover { color: #fff; }

  input[type="file"] { display: none; }
`

const ButtonRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
  margin-top: 0.25rem;
`

const SecondaryBtn = styled.button`
  border: 1px solid rgba(34, 211, 238, 0.18);
  border-radius: 8px;
  padding: 0.6rem 1rem;
  background: rgba(6, 14, 22, 0.6);
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.88rem;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: border-color 160ms ease, color 160ms ease;

  &:hover {
    color: var(--text-primary);
    border-color: rgba(34, 211, 238, 0.35);
  }
`

const SubmitBtn = styled.button`
  border: 1px solid rgba(34, 211, 238, 0.45);
  border-radius: 8px;
  padding: 0.6rem 1rem;
  background: linear-gradient(135deg, rgba(34, 211, 238, 0.22), rgba(34, 211, 238, 0.1));
  color: var(--neon-bright);
  font-weight: 700;
  font-size: 0.88rem;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: border-color 160ms ease, color 160ms ease, transform 160ms ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    border-color: rgba(122, 248, 255, 0.7);
    color: #fff;
  }
`

const StatusMessage = styled.p`
  margin: 0;
  font-size: 0.82rem;
  color: ${(props) => (props.$error ? '#e74c3c' : '#2ecc71')};
`

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
`

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error || new Error('File read failed'))
    reader.readAsDataURL(file)
  })
}

export default function FeedbackWidget({ hideTrigger = false } = {}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)
  const [error, setError] = useState(false)
  const [defaultEmail, setDefaultEmail] = useState('')
  const [feature, setFeature] = useState('general')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [screenshot, setScreenshot] = useState(null) // { name, dataUrl, size }
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    let cancelled = false

    /**
     * Pull the email from the Supabase session first (signed-in users never
     * have to see the email field). Fall back to localStorage for anonymous
     * sessions that have submitted feedback before.
     */
    const init = async () => {
      try {
        const sb = supabaseBrowser()
        const { data } = await sb.auth.getSession()
        const sessionEmail = data?.session?.user?.email || ''
        if (cancelled) return
        if (sessionEmail) {
          setDefaultEmail(sessionEmail)
          setEmail(sessionEmail)
          return
        }
      } catch {
        // ignore — fall through to localStorage
      }
      const stored = localStorage.getItem('sonar_feedback_email') || ''
      if (cancelled) return
      if (stored) {
        setDefaultEmail(stored)
        setEmail(stored)
      }
    }

    init()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handler = () => setOpen(true)
    window.addEventListener(FEEDBACK_OPEN_EVENT, handler)
    return () => window.removeEventListener(FEEDBACK_OPEN_EVENT, handler)
  }, [])

  const close = () => {
    setOpen(false)
    setStatus(null)
    setError(false)
    setFeature('general')
    setMessage('')
    setEmail(defaultEmail)
    setScreenshot(null)
  }

  const handleFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > MAX_SCREENSHOT_BYTES) {
      setStatus('Screenshot must be 2MB or smaller.')
      setError(true)
      event.target.value = ''
      return
    }
    try {
      const dataUrl = await readFileAsDataUrl(file)
      setScreenshot({ name: file.name, dataUrl, size: file.size })
      setStatus(null)
      setError(false)
    } catch {
      setStatus('Could not read screenshot. Try a different file.')
      setError(true)
    }
  }

  const clearFile = (e) => {
    e?.preventDefault?.()
    e?.stopPropagation?.()
    setScreenshot(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!message.trim()) {
      setStatus('Share your thoughts before submitting.')
      setError(true)
      return
    }
    if (!email.trim()) {
      setStatus('Add an email so we can follow up if needed.')
      setError(true)
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setStatus('Enter a valid email address.')
      setError(true)
      return
    }

    setLoading(true)
    setStatus(null)
    setError(false)

    const featureLabel =
      FEATURE_OPTIONS.find((opt) => opt.value === feature)?.label || feature
    const composed = `[${featureLabel}] ${message.trim()}`

    try {
      const payload = {
        // Backend currently expects name/email/message; piggyback feature
        // into the message so existing rows/email digests still work.
        name: defaultEmail || email.trim().split('@')[0] || 'Sonar user',
        email: email.trim(),
        message: composed,
        feature,
        screenshot: screenshot
          ? { name: screenshot.name, size: screenshot.size, data_url: screenshot.dataUrl }
          : null,
      }
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Failed to submit')

      if (typeof window !== 'undefined') {
        localStorage.setItem('sonar_feedback_email', email.trim())
      }
      setDefaultEmail(email.trim())
      setStatus('Thanks for the feedback! We read every response.')
      setError(false)
      setTimeout(close, 1600)
    } catch (err) {
      console.error('Feedback error:', err)
      setStatus('Could not send feedback. Please try again later.')
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {!hideTrigger ? (
        <FloatingButton
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Share feedback"
        >
          <span className="fb-ico" aria-hidden>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5V14a2.5 2.5 0 0 1-2.5 2.5H10l-4.2 3.4a.6.6 0 0 1-1-.46V16.5A2.5 2.5 0 0 1 4 14V6.5Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path
                d="M8.2 9.5h7.6M8.2 12h5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </span>
          Got feedback?
        </FloatingButton>
      ) : null}

      {open && (
        <Overlay onMouseDown={(e) => { if (e.target === e.currentTarget) close() }}>
          <Popup onSubmit={handleSubmit}>
            <TopRow>
              <div className="title-block">
                <span className="title">Got feedback?</span>
                <span className="subtitle">
                  Every response is read by the team — thank you for shaping Sonar.
                </span>
              </div>
              <button type="button" onClick={close} aria-label="Close feedback form">
                ×
              </button>
            </TopRow>

            <FieldGroup>
              <FieldLabel htmlFor="sonar-feedback-feature">
                Which feature is your feedback on?
              </FieldLabel>
              <Select
                id="sonar-feedback-feature"
                value={feature}
                onChange={(e) => setFeature(e.target.value)}
              >
                {FEATURE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </FieldGroup>

            <FieldGroup>
              <FieldLabel htmlFor="sonar-feedback-message">
                Share your thoughts!
              </FieldLabel>
              <Textarea
                id="sonar-feedback-message"
                placeholder="Let us know what you love or how we can do better."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </FieldGroup>

            <FieldGroup>
              <FieldLabel htmlFor="sonar-feedback-screenshot">
                Upload screenshot (Optional)
              </FieldLabel>
              <FilePicker
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    fileInputRef.current?.click()
                  }
                }}
              >
                <span className="file-icon" aria-hidden>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                    <path d="M14 3v6h6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="file-name">
                  {screenshot ? screenshot.name : 'Choose File'}
                </span>
                {screenshot ? (
                  <button
                    type="button"
                    className="clear"
                    onClick={clearFile}
                    aria-label="Remove screenshot"
                  >
                    ×
                  </button>
                ) : null}
                <input
                  ref={fileInputRef}
                  id="sonar-feedback-screenshot"
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                />
              </FilePicker>
            </FieldGroup>

            {!defaultEmail ? (
              <FieldGroup>
                <FieldLabel htmlFor="sonar-feedback-email">
                  Your email
                </FieldLabel>
                <HiddenEmail
                  id="sonar-feedback-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </FieldGroup>
            ) : null}

            {status && <StatusMessage $error={error}>{status}</StatusMessage>}

            <ButtonRow>
              <SecondaryBtn type="button" onClick={close}>
                Cancel
              </SecondaryBtn>
              <SubmitBtn type="submit" disabled={loading || !message.trim()}>
                {loading ? 'Sending…' : 'Submit'}
              </SubmitBtn>
            </ButtonRow>
          </Popup>
        </Overlay>
      )}
    </>
  )
}
