import { useEffect, useRef, useState } from 'react'
import { useDataVersion } from '../state/dataVersion'

export interface PromiseDataState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

export type UsePromiseDataOptions = {
  /** Mặc định false: mỗi lần đổi phiên bản dữ liệu (top bar) sẽ gọi lại factory */
  skipVersion?: boolean
}

export function usePromiseData<T>(
  factory: () => Promise<T>,
  deps: readonly unknown[],
  options?: UsePromiseDataOptions,
): PromiseDataState<T> {
  const { value: dataVersion } = useDataVersion()
  const effectDeps = options?.skipVersion ? deps : [...deps, dataVersion]

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
  }, effectDeps)

  return state
}
