import { useEffect, useState } from 'react'
import { Observable } from '@nbottarini/observable'

export function useObservable<T>(
    observable: Observable<T>,
    initialValue: T,
): T {
    const [value, setValue] = useState(initialValue)
    useEffect(() => {
        const observer = {
            handler: (newValue: T) => {
                setValue(newValue)
            }
        }
        observable.subscribe(observer, observer.handler)
        return () => {
            observable.unsubscribe(observer)
        }
    }, [observable])
    return value
}
