import { useEffect, useReducer, useState } from 'react'
import { Observable } from '@nbottarini/observable'

export function useObservable<T>(
    observable: Observable<T>,
    initialValue: T,
): T {
    const [value, setValue] = useState(initialValue)
    const forceUpdate = useReducer(() => ({}), {})[1] as () => void

    useEffect(() => {
        const observer = {
            handler: (newValue: T) => {
                setValue(newValue)
                if (value === newValue) {
                    forceUpdate()
                }
            }
        }
        observable.subscribe(observer, observer.handler)
        return () => {
            observable.unsubscribe(observer)
        }
    }, [observable])
    return value
}
