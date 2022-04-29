// https://overreacted.io/making-setinterval-declarative-with-react-hooks/
/* 
    TODO - handle async actions better, so that if an async action takes longer than delay time to complete,
    TODO - another async action is not triggered. Perhaps change to setTimeout, and set another timeout on action completion.
*/

import { useEffect, useRef } from 'react'

export function useInterval(callback, delay) {
    const savedCallback = useRef()

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback
    }, [callback])

    // Set up the interval.
    useEffect(() => {
        function tick() {
            savedCallback.current()
        }
        if (delay !== null) {
            let id = setInterval(tick, delay)
            return () => clearInterval(id)
        }
    }, [delay])
}
