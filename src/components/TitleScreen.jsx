import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import './TitleScreen.css'

function TitleScreen({ setRoomID }) {
    const navigate = useNavigate()

    useEffect(() => {
        console.log("ROUTE CHANGE: HOME")
    }, [])

    return (
        <div className="title-screen">
            <h1>Chess</h1>

            <button onClick={() => {
                const newRoomID = 'test-room'
                setRoomID(newRoomID)
                navigate('/game')
            }}>
                Start Game
            </button>
            <h3>Version 1.1.4</h3>
        </div>
    )
}

export default TitleScreen