import { useCallback, useRef, useSyncExternalStore } from 'react'
import { Observable } from '@nbottarini/observable'

/**
 * Subscribes to an {@link Observable} and re-renders whenever it fires. Returns
 * the value of the most recent event, or `undefined` if it has not fired yet.
 *
 * If a `filter` is provided, events that do not pass it are ignored (no
 * re-render). The filter is read on every event, so passing an inline
 * function is safe — it does not cause re-subscriptions.
 *
 * Passing `undefined` as the observable yields `undefined` and subscribes to
 * nothing. This is convenient when the observable depends on data that may
 * not be available yet.
 */
export function useObserve<T>(
    observable?: Observable<T>,
    filter?: (value: T) => boolean,
): T | undefined {
    const lastValueRef = useRef<T | undefined>(undefined)
    const filterRef = useRef(filter)
    filterRef.current = filter

    const subscribe = useCallback((notify: () => void) => {
        if (!observable) return () => {}
        const owner = {}
        observable.subscribe(owner, (value: T) => {
            if (filterRef.current && !filterRef.current(value)) return
            lastValueRef.current = value
            notify()
        })
        return () => observable.unsubscribe(owner)
    }, [observable])

    return useSyncExternalStore(subscribe, () => lastValueRef.current)
}
