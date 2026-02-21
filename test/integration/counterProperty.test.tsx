import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { MutableProperty, property } from '@nbottarini/observable'
import { useObservableProperty } from '../../src/useObservableProperty'

it('counter starts at 0', () => {
    render(<CounterView counter={property(0)} />)

    expect(document.getElementById('counter').innerHTML).toEqual('Counter: 0')
    expect(document.getElementById('observed-value').innerHTML).toEqual('Observed value: 0')
})

it('clicking button increments counter to 1', () => {
    render(<CounterView counter={property(0)} />)

    fireEvent.click(screen.getByRole('button'))

    expect(document.getElementById('counter').innerHTML).toEqual('Counter: 1')
    expect(document.getElementById('observed-value').innerHTML).toEqual('Observed value: 1')
})

it('successive clicks to button increments counter by 1', () => {
    render(<CounterView counter={property(0)} />)
    let button = screen.getByRole('button')
    fireEvent.click(button)
    fireEvent.click(button)

    fireEvent.click(button)

    expect(document.getElementById('counter').innerHTML).toEqual('Counter: 3')
    expect(document.getElementById('observed-value').innerHTML).toEqual('Observed value: 3')
})

const CounterView: React.FC<{counter: MutableProperty<number>}> = ({ counter }) => {
    const observedValue = useObservableProperty(counter)
    return (
        <div>
            <span id="counter">Counter: {counter.value}</span>
            <span id="observed-value">Observed value: {observedValue}</span>
            <button onClick={() => counter.value++}>Increment</button>
        </div>
    )
}
