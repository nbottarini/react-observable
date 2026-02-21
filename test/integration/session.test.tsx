import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { useObserve } from '../../src'
import { observable } from '@nbottarini/observable'

it('both keys starts empty', () => {
    render(<SessionView session={new Session()} />)

    expect(document.getElementById('key1-value').innerHTML).toEqual('key1: ')
    expect(document.getElementById('key2-value').innerHTML).toEqual('key2: ')
})

it('clicking button1 sets key1', () => {
    render(<SessionView session={new Session()} />)

    fireEvent.click(screen.getByText('button1'))

    expect(document.getElementById('key1-value').innerHTML).toEqual('key1: value1')
    expect(document.getElementById('key2-value').innerHTML).toEqual('key2: ')
})

it('clicking button2 sets key2 but change is filtered and render doesnt occur', () => {
    render(<SessionView session={new Session()} />)
    fireEvent.click(screen.getByText('button1'))

    fireEvent.click(screen.getByText('button2'))

    expect(document.getElementById('key1-value').innerHTML).toEqual('key1: value1')
    expect(document.getElementById('key2-value').innerHTML).toEqual('key2: ')
})

const SessionView: React.FC<{session: Session}> = ({ session }) => {
    useObserve(session.keyChanged, (key) => key === 'key1')
    return (
        <div>
            <span id="key1-value">key1: {session.get('key1')}</span>
            <span id="key2-value">key2: {session.get('key2')}</span>
            <button onClick={() => session.set('key1', 'value1')}>button1</button>
            <button onClick={() => session.set('key2', 'value2')}>button2</button>
        </div>
    )
}

class Session {
    readonly keyChanged = observable<string>()
    private sessionData: Record<string, any> = {}

    get(key: string): string {
        return this.sessionData[key]
    }

    set(key: string, value: string) {
        this.sessionData[key] = value
        this.keyChanged.notify(key)
    }
}
