'use client'

import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FONT_SANS } from '@/src/styles/fontStacks'

/** Pill + leading dot (shared by top Navbar and sidebar AppShell). */
export const NavLinkPill = styled(motion.div)`
  a {
    font-family: ${FONT_SANS};
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.95rem;
    border-radius: 10px;
    font-size: 1.05rem;
    font-weight: ${({ $active }) => ($active ? 600 : 400)};
    letter-spacing: 0.01em;
    color: ${({ $active }) => ($active ? 'var(--primary)' : 'var(--text-secondary)')};
    background: ${({ $active }) => ($active ? 'rgba(54, 166, 186, 0.14)' : 'transparent')};
    border: 1px solid
      ${({ $active }) => ($active ? 'rgba(54, 166, 186, 0.22)' : 'transparent')};
    text-decoration: none;
    transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease,
      box-shadow 0.2s ease;

    ${({ $active }) =>
      $active &&
      `
      box-shadow:
        0 0 0 1px rgba(54, 166, 186, 0.06) inset,
        0 0 22px rgba(54, 166, 186, 0.14);
    `}

    &::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 50%;
      flex-shrink: 0;
      background: ${({ $active }) =>
        $active ? 'var(--primary)' : 'rgba(160, 178, 198, 0.42)'};
      box-shadow: ${({ $active }) =>
        $active ? '0 0 10px rgba(54, 166, 186, 0.55)' : 'none'};
    }

    &:hover {
      color: var(--primary);
      background: ${({ $active }) =>
        $active ? 'rgba(54, 166, 186, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
      border-color: ${({ $active }) =>
        $active ? 'rgba(54, 166, 186, 0.32)' : 'rgba(54, 166, 186, 0.12)'};
    }
  }
`

/** Full-width rail variant for vertical sidebar. */
export const NavLinkPillRail = styled(NavLinkPill)`
  width: 100%;
  a {
    width: 100%;
    box-sizing: border-box;
  }
`
