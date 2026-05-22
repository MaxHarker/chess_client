import './Matchmaking.css'
import {useState, useEffect} from 'react'

function Matchmaking({ state, countdown, queueNum, onCancel }) {
    const [dots, setDots] = useState('')

    useEffect(() => {
        if (state !== 'searching') return

        const interval = setInterval(() => {
            setDots(prev => (prev % 3) + 1)
        }, 500)

        return () => clearInterval(interval)
    }, [state])

    return (
        <div className="matchmaking-overlay">
            <div className="matchmaking-modal">
                {state === 'searching' && <div>
                    <h1>Waiting for opponent<span className='dots'>{'.'.repeat(dots)}</span></h1>
                    <h3>Current players in queue: {queueNum}</h3>
                </div>
                }

                {state === 'starting' && (
                    <h1>Starting game in {countdown}...</h1>
                )}
                <button onClick={onCancel}>Cancel</button>
            </div>
        </div>
    )
}

export default Matchmaking