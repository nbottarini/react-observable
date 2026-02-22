import { useObserve } from './useObserve'
import { ObservableValue } from '@nbottarini/observable'

export function useObservableValue<T>(observableValue: ObservableValue<T>): T {
    useObserve(observableValue.changed)
    return observableValue.value
}
