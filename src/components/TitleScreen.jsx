import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import './TitleScreen.css'

function TitleScreen({ handleConnect }) {
    const navigate = useNavigate()

    useEffect(() => {
        console.log("ROUTE CHANGE: HOME")
    }, [])

    return (
        <div className="title-screen">
            <h1>Chess</h1>

            <button onClick={handleConnect}>
                Start Game
            </button>
            <h3>Version 1.1.7</h3>
        </div>
    )
}

export default TitleScreen