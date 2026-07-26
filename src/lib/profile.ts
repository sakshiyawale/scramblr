export interface Profile {
  id: string
  name: string
  /** 4-digit PIN stored locally as a lightweight gate for a shared device -- not real auth/security. */
  pin: string
}

const STORAGE_KEY = 'scramblr:profiles'

export function getProfiles(): Profile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveProfiles(profiles: Profile[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
}

export function createProfile(name: string, pin: string): Profile {
  const profile: Profile = { id: crypto.randomUUID(), name: name.trim(), pin }
  saveProfiles([...getProfiles(), profile])
  return profile
}

export function deleteProfile(id: string): void {
  saveProfiles(getProfiles().filter((p) => p.id !== id))
}

export function verifyPin(profile: Profile, pin: string): boolean {
  return profile.pin === pin
}

export function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  return parts
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('')
}
