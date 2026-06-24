import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { initialGameState } from './logic/initialGameState.js'
import { hasLegalMoves, isKingInCheck } from './logic/chessLogic.js'

import { io } from 'socket.io-client'
const socket = io('https://chess-server-imx5.onrender.com')
//const socket = io('http://localhost:3001')

import Chessboard from './components/Chessboard'
import GameOver from './components/GameOver'
import TitleScreen from './components/TitleScreen'
import Login from './components/Login'
import SignUp from './components/SignUp'
import PromotionModal from './components/PromotionModal'
import Matchmaking from './components/Matchmaking'
import Home from './components/Home'

import move from './assets/move.mp3'
import capture from './assets/capture2.mp3'

function App() {
    const navigate = useNavigate()

    const [gameState, setGameState] = useState(initialGameState)
    const [roomId, setRoomID] = useState(null)
    const [playerColor, setPlayerColor] = useState(null)
    const [matchmaking, setMatchmaking] = useState(null)
    const [countdown, setCountdown] = useState(null)
    const [queueNum, setQueueNum] = useState(0)

    useEffect(() => {
        socket.on('matchFound', ({ roomId, color }) => {
            setRoomID(roomId)
            setPlayerColor(color)
            console.log(`Match found! Room ID: ${roomId}, You are playing as ${color}`)
        })

        socket.on('queueUpdate', ({ queueNum }) => {
            setQueueNum(queueNum)
        })

        socket.on('gameState', (state) => {
            setGameState(state)
        })

        socket.on('gameStart', ({ gameState, startTime }) => {
            console.log("Game starting!")
            setGameState(gameState)
            setMatchmaking('starting')

            const interval = setInterval(() => {
                const secondsLeft = Math.ceil((startTime - Date.now()) / 1000)

                if (secondsLeft <= 0) {
                    clearInterval(interval)
                    setCountdown(0)
                    setMatchmaking(null)
                } else {
                    setCountdown(secondsLeft)
                }
            }, 100)
        })

        socket.on('moveMade', ({ type }) => {
            const audio = new Audio(type === 'capture' ? capture : move)
            audio.play()
        })

        return () => {
            socket.off('matchFound')
            socket.off('queueUpdate')
            socket.off('gameState')
            socket.off('gameStart')
            socket.off('moveMade')
        }
    }, [])

    const location = useLocation();

    useEffect(() => {
        // Lock scroll on TitleScreen only
        if (location.pathname === "/") {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }, [location.pathname]);

    function handlePromotion(piece) {
        socket.emit('promotePawn', {
            roomId,
            piece
        })
    }

    function handleRestart() {
        socket.disconnect()
        socket.connect()

        setGameState(initialGameState)
        setRoomID(null)
        setPlayerColor(null)

        navigate('/')
    }

    function handleGameStart() {
        socket.emit('findMatch')
        setMatchmaking('searching')
        navigate('/game')
    }

    function navigateLogin() {
        navigate('/login')
    }

    function navigateSignUp() {
        navigate('/signup')
    }

    function navigateBack() {
        navigate('/')
    }

    function navigateHome() {
        navigate('/home')
    }

    function handleSignUp(username, password, email) {
        return new Promise((resolve) => {
            socket.emit('signUp', { username, password, email }, (response) => {
                if (response.success) {
                    console.log('Sign up successful!')
                    navigateHome()
                    resolve(null)
                } else {
                    console.log('Sign up failed:', response.message)
                    resolve(response.message)
                }
            })
        })
    }

    function handleLogin(username, password) {
        return new Promise((resolve) => {
            socket.emit('login', { username, password }, (response) => {
                if (response.success) {
                    console.log('Login successful!')
                    navigateHome()
                    resolve(null)
                } else {
                    console.log('Login failed:', response.message)
                    resolve(response.message)
                }
            })
        })
    }
    
    return (
        <Routes>
            <Route
                path="/"
                element={<TitleScreen navigateLogin={navigateLogin} navigateSignUp={navigateSignUp} navigateGuest={navigateHome} />}
            />
            <Route
                path="/login"
                element={<Login handleLogin={handleLogin} navigateBack={navigateBack}/>}
            />
            <Route
                path="/signup"
                element={<SignUp handleSignUp={handleSignUp} navigateBack={navigateBack}/>}
            />
            <Route
                path="/home"
                element={<Home navigateRated={handleGameStart} navigateBot={handleGameStart} navigatePuzzles={handleGameStart} navigateBack={navigateBack}/>}
            />
            <Route
                path="/game"
                element={
                    <div className="game-container">
                        <Chessboard
                            gameState={gameState}
                            setGameState={setGameState}
                            socket={socket}
                            roomId={roomId}
                            playerColor={playerColor}
                        />

                        {matchmaking && <Matchmaking state={matchmaking} countdown={countdown} queueNum={queueNum} onCancel={handleRestart} />}

                        {(gameState.status === 'checkmate' || gameState.status === 'stalemate') && (
                            <GameOver 
                                status={gameState.status} 
                                winner={gameState.winner == playerColor ? 'win' : 'loss'}
                                onRestart={handleRestart}
                            />
                        )}

                        {gameState.pendingPromotion &&
                            gameState.pendingPromotion.color === playerColor && (
                                <PromotionModal
                                    color={gameState.pendingPromotion.color}
                                    onSelect={handlePromotion}
                                />
                            )}
                    </div>
                }
            />
        </Routes>
    )
}

export default App