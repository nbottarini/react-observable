import { useCallback, useSyncExternalStore } from 'react'
import { ObservableValue } from '@nbottarini/observable'

/**
 * Subscribes to an {@link ObservableValue} and returns its current value,
 * re-rendering whenever the value changes.
 *
 * Passing `undefined` yields `undefined` and subscribes to nothing. This is
 * convenient when the value depends on data that may not be available yet
 * (e.g. an entity selected by an id that is initially `null`).
 */
export function useObservableValue<T>(value$?: ObservableValue<T>): T | undefined {
    const subscribe = useCallback((notify: () => void) => {
        if (!value$) return () => {}
        const owner = {}
        value$.subscribe(owner, notify)
        return () => value$.unsubscribe(owner)
    }, [value$])

    return useSyncExternalStore(subscribe, () => value$?.value)
}
