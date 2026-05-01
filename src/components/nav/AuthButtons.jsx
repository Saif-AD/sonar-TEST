'use client'

import NextLink from 'next/link'
import styled from 'styled-components'
import { FONT_SANS } from '@/src/styles/fontStacks'

export const LogoutButton = styled.button`
  background: none;
  border: 1px solid var(--primary);
  color: var(--primary);
  padding: 0.5rem 0.95rem;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.25s ease;
  font-weight: 600;
  letter-spacing: 0.2px;
  font-family: ${FONT_SANS};
  font-size: 0.9rem;
  white-space: nowrap;
  &:hover {
    background: var(--primary);
    color: #0a1621;
    box-shadow: 0 6px 14px rgba(54, 166, 186, 0.18);
    transform: translateY(-1px);
  }
`

export const ProfileButton = styled(NextLink)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid var(--secondary);
  color: var(--text-primary);
  text-decoration: none;
  transition: background 0.2s ease, border-color 0.2s ease;
  flex-shrink: 0;
  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: var(--primary);
  }
`

export function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" />
    </svg>
  )
}
