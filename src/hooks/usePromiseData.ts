import { useEffect, useRef, useState } from 'react'

export interface PromiseDataState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

export function usePromiseData<T>(
  factory: () => Promise<T>,
  deps: readonly unknown[],
): PromiseDataState<T> {
  const [state, setState] = useState<PromiseDataState<T>>({
    data: null,
    loading: true,
    error: null,
  })

  const factoryRef = useRef(factory)
  factoryRef.current = factory

  useEffect(() => {
    let cancelled = false
    setState((s) => ({ ...s, loading: true, error: null }))

    factoryRef
      .current()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setState({
            data: null,
            loading: false,
            error: err instanceof Error ? err : new Error(String(err)),
          })
      })

    return () => {
      cancelled = true
    }
  }, deps)

  return state
}
