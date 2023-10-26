import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { useObservable } from '../../src'
import { Observable } from '@nbottarini/observable'

it('value starts empty', () => {
    render(<SessionView session={new Session()} />)

    expect(document.getElementById('original-session-value').innerHTML).toEqual('Original Session Value: ')
    expect(document.getElementById('returned-session-value').innerHTML).toEqual('Returned Session Value: ')
})

it('clicking button sets value', () => {
    render(<SessionView session={new Session()} />)

    fireEvent.click(screen.getByRole('button'))

    expect(document.getElementById('original-session-value').innerHTML).toEqual('Original Session Value: other')
    expect(document.getElementById('returned-session-value').innerHTML).toEqual('Returned Session Value: other')
})

const SessionView: React.FC<{session: Session}> = ({ session }) => {
    const returnedSession = useObservable(session.changed, session)
    return (
        <div>
            <span id="original-session-value">Original Session Value: {session.get('value')}</span>
            <span id="returned-session-value">Returned Session Value: {returnedSession.get('value')}</span>
            <button onClick={() => session.set('value', 'other')}>Set Value</button>
        </div>
    )
}

class Session {
    readonly changed = new Observable<Session>()
    private sessionData: Record<string, any> = {}

    get(key: string): string {
        return this.sessionData[key]
    }

    set(key: string, value: string) {
        this.sessionData[key] = value
        this.changed.notify(this)
    }
}
