import { fireEvent, render, screen } from '@testing-library/react'
import React, { useMemo } from 'react'
import { computed, property } from '@nbottarini/observable'
import { useObservableProperty } from '../../src/useObservableProperty'

it('all values starts at 0', () => {
    render(<CounterView />)

    expect(document.getElementById('counter1').innerHTML).toEqual('Counter1: 0')
    expect(document.getElementById('counter2').innerHTML).toEqual('Counter2: 0')
    expect(document.getElementById('computed-sum').innerHTML).toEqual('Sum: 0')
    expect(document.getElementById('observed-value').innerHTML).toEqual('Observed value: 0')
})

it('clicking button1 increments counter1 to 1 and also computed sum', () => {
    render(<CounterView />)

    fireEvent.click(screen.getByText('button1'))

    expect(document.getElementById('counter1').innerHTML).toEqual('Counter1: 1')
    expect(document.getElementById('counter2').innerHTML).toEqual('Counter2: 0')
    expect(document.getElementById('computed-sum').innerHTML).toEqual('Sum: 1')
    expect(document.getElementById('observed-value').innerHTML).toEqual('Observed value: 1')
})

it('successive clicks to buttons increments counters and calculates sum', () => {
    render(<CounterView />)
    const button1 = screen.getByText('button1')
    const button2 = screen.getByText('button2')
    fireEvent.click(button1)
    fireEvent.click(button1)
    fireEvent.click(button2)

    fireEvent.click(button1)

    expect(document.getElementById('counter1').innerHTML).toEqual('Counter1: 3')
    expect(document.getElementById('counter2').innerHTML).toEqual('Counter2: 1')
    expect(document.getElementById('computed-sum').innerHTML).toEqual('Sum: 4')
    expect(document.getElementById('observed-value').innerHTML).toEqual('Observed value: 4')
})

const CounterView: React.FC = () => {
    const counter1$ = useMemo(() => property(0), [])
    const counter2$ = useMemo(() => property(0), [])
    const computedSum$ = useMemo(() => computed((c1, c2) => c1 + c2, counter1$, counter2$), [])

    const observedValue = useObservableProperty(computedSum$)
    return (
        <div>
            <span id="counter1">Counter1: {counter1$.value}</span>
            <span id="counter2">Counter2: {counter2$.value}</span>
            <span id="computed-sum">Sum: {computedSum$.value}</span>
            <span id="observed-value">Observed value: {observedValue}</span>
            <button onClick={() => counter1$.value++}>button1</button>
            <button onClick={() => counter2$.value++}>button2</button>
        </div>
    )
}
