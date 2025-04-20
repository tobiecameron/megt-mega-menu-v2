'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'

type ThemeProviderProps = {
  children: ReactNode
  defaultTheme?: Theme
  attribute?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean // Either use this or remove it
}

const ThemeContext = createContext<{
  theme: Theme
  setTheme: (theme: Theme) => void
}>({
  theme: 'system',
  setTheme: () => null,
})

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  attribute = 'data-theme',
  enableSystem = true,
  disableTransitionOnChange = false, // Either use this or remove it
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)

  useEffect(() => {
    const root = window.document.documentElement
    
    root.classList.remove('light', 'dark')
    
    if (theme === 'system' && enableSystem) {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
      root.setAttribute(attribute, systemTheme)
    } else {
      root.classList.add(theme)
      root.setAttribute(attribute, theme)
    }

    // Use the disableTransitionOnChange variable
    if (!disableTransitionOnChange) {
      // Add a small transition for theme changes
      root.style.transition = 'background-color 0.3s ease'
    } else {
      root.style.transition = 'none'
    }
  }, [theme, attribute, enableSystem, disableTransitionOnChange])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}