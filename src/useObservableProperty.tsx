import { useObserve } from './useObserve'
import { ObservableProperty } from '@nbottarini/observable'

export function useObservableProperty<T>(property: ObservableProperty<T>): T {
    useObserve(property.changed)
    return property.value
}
