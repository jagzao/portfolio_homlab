import { createContext, useContext, useState, type ReactNode } from 'react'

interface ArchitectureTableContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const ArchitectureTableContext = createContext<ArchitectureTableContextValue | null>(null)

/**
 * Single source of truth for whether the Architecture Table is open.
 * SoftwareLabSection mounts twice (semantic shell + 3D overlay near the
 * Software Lab landmark) — without a shared state, each could open its own
 * panel, producing two simultaneous role="dialog" elements with identical
 * accessible names.
 */
export function ArchitectureTableProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return <ArchitectureTableContext.Provider value={{ open, setOpen }}>{children}</ArchitectureTableContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- context + its hook belong together; not worth a second file for this
export function useArchitectureTable(): ArchitectureTableContextValue {
  const value = useContext(ArchitectureTableContext)
  if (!value) throw new Error('useArchitectureTable must be used within ArchitectureTableProvider')
  return value
}
