import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { observableResource, ObservableResource } from '@nbottarini/observable'
import { useObservableResource } from '../../../src/useObservableResource'

it('renders data after the fetch resolves', async () => {
    const resource = observableResource(async () => 'hello')

    render(<ResourceView resource={resource} />)

    await waitFor(() => {
        expect(document.getElementById('status')!.innerHTML).toEqual('ready')
    })
    expect(document.getElementById('data')!.innerHTML).toEqual('hello')
    expect(document.getElementById('isReady')!.innerHTML).toEqual('true')
})

it('shows isLoading while the first fetch is in flight', async () => {
    let resolve: (v: string) => void = () => {}
    const resource = observableResource(() => new Promise<string>(r => { resolve = r }))

    render(<ResourceView resource={resource} />)

    await waitFor(() => {
        expect(document.getElementById('isLoading')!.innerHTML).toEqual('true')
    })
    resolve('hello')
    await waitFor(() => {
        expect(document.getElementById('isLoading')!.innerHTML).toEqual('false')
    })
})

it('shows isError when the fetch fails', async () => {
    const resource = observableResource<string>(async () => { throw new Error('boom') })

    render(<ResourceView resource={resource} />)

    await waitFor(() => {
        expect(document.getElementById('isError')!.innerHTML).toEqual('true')
    })
    expect(document.getElementById('error')!.innerHTML).toEqual('boom')
})

it('refreshes when the refresh button is clicked', async () => {
    let calls = 0
    const resource = observableResource(async () => {
        calls++
        return `value-${calls}`
    })
    render(<ResourceView resource={resource} />)
    await waitFor(() => {
        expect(document.getElementById('data')!.innerHTML).toEqual('value-1')
    })

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
        expect(document.getElementById('data')!.innerHTML).toEqual('value-2')
    })
})

it('flips isRefreshing to true while a background refresh is running', async () => {
    let resolve: (v: string) => void = () => {}
    const resource = observableResource(() => new Promise<string>(r => { resolve = r }))
    render(<ResourceView resource={resource} />)
    resolve('first')
    await waitFor(() => {
        expect(document.getElementById('data')!.innerHTML).toEqual('first')
    })

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
        expect(document.getElementById('isRefreshing')!.innerHTML).toEqual('true')
    })
    expect(document.getElementById('status')!.innerHTML).toEqual('ready')
    resolve('second')
    await waitFor(() => {
        expect(document.getElementById('isRefreshing')!.innerHTML).toEqual('false')
    })
    expect(document.getElementById('data')!.innerHTML).toEqual('second')
})

it('keeps stale data visible while refreshing', async () => {
    let resolve: (v: string) => void = () => {}
    const resource = observableResource(() => new Promise<string>(r => { resolve = r }))
    render(<ResourceView resource={resource} />)
    resolve('first')
    await waitFor(() => {
        expect(document.getElementById('data')!.innerHTML).toEqual('first')
    })

    fireEvent.click(screen.getByRole('button'))

    expect(document.getElementById('data')!.innerHTML).toEqual('first')
})

it('returns an empty bundle when the resource is undefined', () => {
    render(<ResourceView resource={undefined} />)

    expect(document.getElementById('status')!.innerHTML).toEqual('uninitialized')
    expect(document.getElementById('data')!.innerHTML).toEqual('')
    expect(document.getElementById('isLoading')!.innerHTML).toEqual('false')
    expect(document.getElementById('isReady')!.innerHTML).toEqual('false')
    expect(document.getElementById('isError')!.innerHTML).toEqual('false')
})

const ResourceView: React.FC<{ resource?: ObservableResource<string> }> = ({ resource }) => {
    const result = useObservableResource(resource)
    return (
        <div>
            <span id="status">{result.status}</span>
            <span id="data">{result.data ?? ''}</span>
            <span id="error">{result.error?.message ?? ''}</span>
            <span id="isLoading">{String(result.isLoading)}</span>
            <span id="isReady">{String(result.isReady)}</span>
            <span id="isError">{String(result.isError)}</span>
            <span id="isRefreshing">{String(result.isRefreshing)}</span>
            <button onClick={() => result.refresh()}>refresh</button>
        </div>
    )
}
