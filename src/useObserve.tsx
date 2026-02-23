import { useEffect, useReducer, useRef } from 'react'
import { Observable } from '@nbottarini/observable'

export function useObserve<T>(
    observable?: Observable<T>,
    filter?: (value: T) => boolean,
): T {
    const forceUpdate = useReducer(() => ({}), {})[1] as () => void
    const lastValue = useRef<T>()

    useEffect(() => {
        const observer = {
            handler: (newValue: T) => {
                if (!filter || filter(newValue)) {
                    lastValue.current = newValue
                    forceUpdate()
                }
            }
        }
        observable?.subscribe(observer, observer.handler)
        return () => {
            observable?.unsubscribe(observer)
        }
    }, [observable])
    return lastValue.current
}
