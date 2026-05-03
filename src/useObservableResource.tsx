import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react'
import { ObservableResource, ResourceStatus } from '@nbottarini/observable'

/**
 * Bundle returned by {@link useObservableResource}. Includes the source-of-
 * truth fields (`data`, `status`, `error`, `isRefreshing`) and convenience
 * derived flags for use in JSX (`isLoading`, `isReady`, `isError`).
 *
 * `refresh` is a stable reference to the underlying resource's refresh.
 */
export interface UseObservableResourceResult<T> {
    data: T | undefined
    status: ResourceStatus
    error: Error | null
    isRefreshing: boolean
    isLoading: boolean
    isReady: boolean
    isError: boolean
    refresh: () => Promise<void>
}

const EMPTY_REFRESH = () => Promise.resolve()

/**
 * Subscribes to an {@link ObservableResource} and returns its current state,
 * re-rendering whenever any of `data`, `status`, `error` or `isRefreshing`
 * changes.
 *
 * On mount (and whenever the resource changes) calls `whenReady()` on the
 * resource to trigger the underlying fetch if it has not been triggered yet.
 * Errors thrown by `whenReady` are not propagated — they are exposed via
 * `error` and `status` instead.
 *
 * Passing `undefined` yields an empty bundle (`status === 'uninitialized'`,
 * everything else falsy/null/undefined) and subscribes to nothing.
 */
export function useObservableResource<T>(
    resource?: ObservableResource<T>,
): UseObservableResourceResult<T> {
    const refresh = useMemo(() => {
        if (!resource) return EMPTY_REFRESH
        return () => resource.refresh()
    }, [resource])

    useEffect(() => {
        if (!resource) return
        // Trigger the fetch lazily; errors land on resource.error
        resource.whenReady().catch(() => {})
    }, [resource])

    const snapshotRef = useRef<UseObservableResourceResult<T>>()

    const subscribe = useCallback((notify: () => void) => {
        if (!resource) return () => {}
        const owner = {}
        resource.data.subscribe(owner, notify)
        resource.status.subscribe(owner, notify)
        resource.error.subscribe(owner, notify)
        resource.isRefreshing.subscribe(owner, notify)
        return () => {
            resource.data.unsubscribe(owner)
            resource.status.unsubscribe(owner)
            resource.error.unsubscribe(owner)
            resource.isRefreshing.unsubscribe(owner)
        }
    }, [resource])

    const getSnapshot = (): UseObservableResourceResult<T> => {
        const data = resource?.data.value
        const status: ResourceStatus = resource?.status.value ?? 'uninitialized'
        const error = resource?.error.value ?? null
        const isRefreshing = resource?.isRefreshing.value ?? false

        const prev = snapshotRef.current
        if (
            prev !== undefined &&
            prev.data === data &&
            prev.status === status &&
            prev.error === error &&
            prev.isRefreshing === isRefreshing &&
            prev.refresh === refresh
        ) {
            return prev
        }

        const next: UseObservableResourceResult<T> = {
            data,
            status,
            error,
            isRefreshing,
            isLoading: status === 'loading',
            isReady: status === 'ready',
            isError: status === 'error',
            refresh,
        }
        snapshotRef.current = next
        return next
    }

    return useSyncExternalStore(subscribe, getSnapshot)
}
