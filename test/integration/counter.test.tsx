import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { useObserve } from '../../src'
import { observable } from '@nbottarini/observable'

it('counter starts at 0', () => {
    render(<CounterView counter={new Counter()} />)

    expect(document.getElementById('counter').innerHTML).toEqual('Counter: 0')
    expect(document.getElementById('last-value').innerHTML).toEqual('Last value: ')
})

it('clicking button increments counter to 1', () => {
    render(<CounterView counter={new Counter()} />)

    fireEvent.click(screen.getByRole('button'))

    expect(document.getElementById('counter').innerHTML).toEqual('Counter: 1')
    expect(document.getElementById('last-value').innerHTML).toEqual('Last value: 1')
})

it('successive clicks to button increments counter by 1', () => {
    render(<CounterView counter={new Counter()} />)
    let button = screen.getByRole('button')
    fireEvent.click(button)
    fireEvent.click(button)

    fireEvent.click(button)

    expect(document.getElementById('counter').innerHTML).toEqual('Counter: 3')
    expect(document.getElementById('last-value').innerHTML).toEqual('Last value: 3')
})

const CounterView: React.FC<{counter: Counter}> = ({ counter }) => {
    const lastValue = useObserve(counter.changed)
    return (
        <div>
            <span id="counter">Counter: {counter.value}</span>
            <span id="last-value">Last value: {lastValue}</span>
            <button onClick={() => counter.increment()}>Increment</button>
        </div>
    )
}

class Counter {
    public readonly changed = observable<number>()
    private _value = 0

    increment() {
        this._value++
        this.changed.notify(this._value)
    }

    get value() {
        return this._value
    }
}
