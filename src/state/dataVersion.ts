import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'tft:dataVersion'

let currentVersion = ''
const listeners = new Set<() => void>()

if (typeof window !== 'undefined') {
  currentVersion = window.localStorage.getItem(STORAGE_KEY) || ''
}

function emit() {
  listeners.forEach((l) => l())
}

export function getDataVersion(): string {
  return currentVersion
}

export function setDataVersion(versionId: string) {
  const next = versionId.trim()
  if (next === currentVersion) return
  currentVersion = next
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, currentVersion)
  }
  emit()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useDataVersion() {
  const value = useSyncExternalStore(subscribe, getDataVersion, () => '')
  return { value, setValue: setDataVersion }
}
