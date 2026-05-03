[![npm](https://img.shields.io/npm/v/@nbottarini/react-observable.svg)](https://www.npmjs.com/package/@nbottarini/react-observable)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI Status](https://github.com/nbottarini/react-observable/actions/workflows/main.yml/badge.svg?branch=main)](https://github.com/nbottarini/react-observable/actions)

# React observable

React hooks for consuming primitives from [`@nbottarini/observable`](https://www.npmjs.com/package/@nbottarini/observable). Three hooks aligned with the library's three primitives:

- **`useObserve`** — subscribe to an `Observable<T>` (event source).
- **`useObservableValue`** — subscribe to an `ObservableValue<T>` (reactive value).
- **`useObservableResource`** — subscribe to an `ObservableResource<T>` (async value with status).

All three are built on React 18's `useSyncExternalStore`, so they work correctly under concurrent rendering.

## Installation

Npm:
```
$ npm install --save @nbottarini/react-observable
```

Yarn:
```
$ yarn add @nbottarini/react-observable
```

Peer dependency: `react >= 18`.

## `useObserve`

Subscribes to an `Observable<T>` and returns the value of the most recent event. Re-renders the component every time the observable fires.

```tsx
import { useObserve } from '@nbottarini/react-observable'

function CounterView({ counter }: { counter: Counter }) {
    const lastValue = useObserve(counter.changed)
    return (
        <div>
            <span>Counter: {counter.value}</span>
            <span>Last fired value: {lastValue ?? '—'}</span>
            <button onClick={() => counter.increment()}>+1</button>
        </div>
    )
}
```

Optionally takes a filter; events that do not pass it are ignored:

```tsx
useObserve(session.keyChanged, (key) => key === 'userName')
```

Passing `undefined` as the observable yields `undefined` and subscribes to nothing — useful when the observable depends on data that may not be available yet.

## `useObservableValue`

Subscribes to an `ObservableValue<T>` and returns its current value. Re-renders whenever the value changes.

```tsx
import { useObservableValue } from '@nbottarini/react-observable'

function CounterView({ counter$ }: { counter$: MutableObservableValue<number> }) {
    const value = useObservableValue(counter$)
    return (
        <div>
            <span>Counter: {value}</span>
            <button onClick={() => counter$.value++}>+1</button>
        </div>
    )
}
```

Works with computed values too:

```tsx
const sum$ = observableComputed((a, b) => a + b, a$, b$)
const sum = useObservableValue(sum$)
```

Passing `undefined` yields `undefined` and subscribes to nothing.

## `useObservableResource`

Subscribes to an `ObservableResource<T>` and returns its current state. On mount (and whenever the resource changes) calls `whenReady()` to trigger the underlying fetch.

```tsx
import { useObservableResource } from '@nbottarini/react-observable'

function ProfileView({ profile }: { profile: ObservableResource<Profile> }) {
    const { data, isLoading, isError, error, isRefreshing, refresh } = useObservableResource(profile)

    if (isLoading) return <Spinner />
    if (isError) return <div>Error: {error?.message}</div>

    return (
        <div>
            <h1>{data?.name}</h1>
            {isRefreshing && <SmallSpinner />}
            <button onClick={refresh}>Refresh</button>
        </div>
    )
}
```

The hook returns:

| Field | Type | Description |
|---|---|---|
| `data` | `T \| undefined` | Current value, `undefined` until the first fetch resolves |
| `status` | `'uninitialized' \| 'loading' \| 'ready' \| 'error'` | Lifecycle state |
| `error` | `Error \| null` | Last fetch error |
| `isRefreshing` | `boolean` | `true` while a background fetch is running (data already exists) |
| `isLoading` | `boolean` | Convenience for `status === 'loading'` |
| `isReady` | `boolean` | Convenience for `status === 'ready'` |
| `isError` | `boolean` | Convenience for `status === 'error'` |
| `refresh` | `() => Promise<void>` | Stable reference to `resource.refresh()` |

### Stale-while-revalidate

Once data is loaded, refreshes follow the stale-while-revalidate pattern: `data` keeps the previous value, `status` stays `ready`, and `isRefreshing` flips to `true`. Use the two flags to render a small refresh indicator without flickering the main content.

```tsx
{isRefreshing && <SmallSpinner />}
<DataTable rows={data ?? []} />
```

### Conditional resources

Pass `undefined` to skip subscribing — useful when the resource depends on data that is not available yet:

```tsx
const profile = userId ? profileStore.byId(userId) : undefined
const { data } = useObservableResource(profile)
```
