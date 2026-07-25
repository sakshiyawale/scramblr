export interface Profile {
  id: string
  name: string
}

const STORAGE_KEY = 'scramblr:profile'

export function getStoredProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed?.id === 'string' && typeof parsed?.name === 'string') return parsed
    return null
  } catch {
    return null
  }
}

export function createProfile(name: string): Profile {
  const profile: Profile = { id: crypto.randomUUID(), name: name.trim() }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  return profile
}

export function clearProfile(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  return parts
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('')
}
