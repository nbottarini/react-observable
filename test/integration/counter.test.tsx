import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { useObservable } from '../../src'
import { Observable } from '@nbottarini/observable'

it('counter starts at 0', () => {
    render(<CounterView counter={new Counter()} />)

    expect(document.getElementById('counter').innerHTML).toEqual('Counter: 0')
    expect(document.getElementById('observed-value').innerHTML).toEqual('Observed value: 0')
})

it('clicking button increments counter to 1', () => {
    render(<CounterView counter={new Counter()} />)

    fireEvent.click(screen.getByRole('button'))

    expect(document.getElementById('counter').innerHTML).toEqual('Counter: 1')
    expect(document.getElementById('observed-value').innerHTML).toEqual('Observed value: 1')
})

it('successive clicks to button increments counter by 1', () => {
    render(<CounterView counter={new Counter()} />)
    let button = screen.getByRole('button')
    fireEvent.click(button)
    fireEvent.click(button)

    fireEvent.click(button)

    expect(document.getElementById('counter').innerHTML).toEqual('Counter: 3')
    expect(document.getElementById('observed-value').innerHTML).toEqual('Observed value: 3')
})

const CounterView: React.FC<{counter: Counter}> = ({ counter }) => {
    const observedValue = useObservable(counter.changed, counter.value)
    return (
        <div>
            <span id="counter">Counter: {counter.value}</span>
            <span id="observed-value">Observed value: {observedValue}</span>
            <button onClick={() => counter.increment()}>Increment</button>
        </div>
    )
}

class Counter {
    public readonly changed = new Observable<number>()
    private _value = 0

    increment() {
        this._value++
        this.changed.notify(this._value)
    }

    get value() {
        return this._value
    }
}
