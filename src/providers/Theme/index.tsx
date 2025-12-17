'use client'

import React, { createContext, use, useCallback, useEffect, useState } from 'react'

import type { Theme, ThemeContextType } from './types'

import canUseDOM from '@/utilities/canUseDOM'
import { defaultTheme, getImplicitPreference, themeLocalStorageKey } from './shared'
import { themeIsValid } from './types'

const initialContext: ThemeContextType = {
  setTheme: () => null,
  theme: undefined,
}

const ThemeContext = createContext(initialContext)

const getInitialTheme = (): Theme => {
  if (!canUseDOM) {
    return defaultTheme
  }

  // Priority 1: localStorage value (if valid)
  const preference = window.localStorage.getItem(themeLocalStorageKey)
  if (themeIsValid(preference)) {
    return preference
  }

  // Priority 2: DOM attribute (if available)
  const domTheme = document.documentElement.getAttribute('data-theme') as Theme
  if (themeIsValid(domTheme)) {
    return domTheme
  }

  // Priority 3: Implicit preference (system preference)
  const implicitPreference = getImplicitPreference()
  if (implicitPreference) {
    return implicitPreference
  }

  // Priority 4: Default theme
  return defaultTheme
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme | undefined>(() => getInitialTheme())

  const setTheme = useCallback((themeToSet: Theme | null) => {
    if (themeToSet === null) {
      window.localStorage.removeItem(themeLocalStorageKey)
      const implicitPreference = getImplicitPreference()
      document.documentElement.setAttribute('data-theme', implicitPreference || '')
      if (implicitPreference) setThemeState(implicitPreference)
    } else {
      setThemeState(themeToSet)
      window.localStorage.setItem(themeLocalStorageKey, themeToSet)
      document.documentElement.setAttribute('data-theme', themeToSet)
    }
  }, [])

  useEffect(() => {
    // Synchronize DOM attribute with current theme state
    // State is already initialized correctly, so we only need to ensure DOM is in sync
    if (theme && canUseDOM) {
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [theme])

  return <ThemeContext value={{ setTheme, theme }}>{children}</ThemeContext>
}

export const useTheme = (): ThemeContextType => use(ThemeContext)
