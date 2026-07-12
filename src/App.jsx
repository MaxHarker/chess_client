import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { initialGameState } from './logic/initialGameState.js'
import { gameStateToFen } from './logic/fen.js'
import { hasLegalMoves, isKingInCheck, tryMove } from './logic/chessLogic.js'

import { io } from 'socket.io-client'
const socketLink = "https://chess-server-imx5.onrender.com"
//const socketLink = "http://localhost:3001"

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

import init, { get_best_move } from './analysis/pkg/analysis_engine.js'

function App() {
    const navigate = useNavigate()

    const [gameState, setGameState] = useState(initialGameState)
    const [roomId, setRoomID] = useState(null)
    const [playerColor, setPlayerColor] = useState(null)
    const [matchmaking, setMatchmaking] = useState(null)
    const [countdown, setCountdown] = useState(null)
    const [queueNum, setQueueNum] = useState(0)
    const [mode, setMode] = useState("online")
    const [depth, setDepth] = useState(4)

    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user")
            return savedUser
                ? JSON.parse(savedUser)
                : null
        })

    const [socket, setSocket] = useState(null)

    useEffect(() => {

        const savedUser = localStorage.getItem("user")

        const newSocket = io(socketLink, {
            auth: {
                userId: savedUser
                    ? JSON.parse(savedUser).id
                    : null
            }
        })

        setSocket(newSocket)

        return () => {
            newSocket.disconnect()
        }

    }, [])

    useEffect(() => {
        init()
    }, [])

    console.log(user)

    useEffect(() => {

        if (!socket) return
        
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
            console.log("Received reconnect game state:", state)
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
    }, [socket])

    const location = useLocation();

    useEffect(() => {
        // Allow scroll on Home only
        if (location.pathname == "/home") {
            document.body.style.overflow = "auto";
        } else {
            document.body.style.overflow = "hidden";
        }
    }, [location.pathname]);

    function handleMove(from, to) {

        const newBoard = tryMove(
            from[0],
            from[1],
            to[0],
            to[1],
            gameState
        );

        if (!newBoard) return;

        evaluateGameOver(newBoard);

        // bot mode
        if (mode === "bot") {

            if (newBoard.status !== "playing") {
                console.log("Game over!");
                return;
            }

            if (newBoard.pendingPromotion) {
                console.log("Pending promotion...");
                return;
            }

            setTimeout(() => runBotMove(newBoard), 50);
        }

        // online mode
        if (mode === "online") {
            socket.emit("makeMove", { roomId, from, to });
        }
    }

    async function runBotMove(board) {
        const fen = gameStateToFen(board);

        console.log('Engine thinking...')
        const result = await get_best_move(fen, depth, board.turn === 'white' ? true : false);

        const [move, score, nodes] = result.split(' ');

        const [from, to] = move.split('-').map(Number);

        console.log(`Bot move from ${from} to ${to}, score: ${score}, nodes: ${nodes}`);
        const botBoard = tryMove(
            Math.floor(from / 8),
            from % 8,
            Math.floor(to / 8),
            to % 8,
            board
        );

        if (botBoard.pendingPromotion) {
            
            botBoard.board[botBoard.pendingPromotion.row][botBoard.pendingPromotion.col] = `${botBoard.pendingPromotion.color}_queen`;

            botBoard.pendingPromotion = null;

            botBoard.turn =
                botBoard.turn === 'white'
                    ? 'black'
                    : 'white';
        }

        if (botBoard) {
            evaluateGameOver(botBoard);
        }
    }

    function evaluateGameOver(newBoard) {
        const turn = newBoard.turn;
        const hasMoves = hasLegalMoves(turn, newBoard);
        const inCheck = isKingInCheck(turn, newBoard);

        let status = "playing";
        let winner = null;

        if (!hasMoves && inCheck) {
            status = "checkmate";
            winner = turn === "white" ? "black" : "white";
        } else if (!hasMoves) {
            status = "stalemate";
        }

        newBoard.status = status;
        newBoard.winner = winner;

        setGameState({ ...newBoard });
    }

    function handlePromotion(piece) {
        console.log(`Promoting to ${piece}`);
        if (mode === "online") {
            socket.emit('promotePawn', {
                roomId,
                piece
            });
            return;
        }

        if (mode === "bot") {
            const newState = structuredClone(gameState);

            const {
                row: prom_row,
                col: prom_col,
                color: prom_color
            } = newState.pendingPromotion;

            newState.board[prom_row][prom_col] = `${prom_color}_${piece}`

            newState.pendingPromotion = null;

            newState.turn = newState.turn === 'white' ? 'black' : 'white'

            setGameState(newState);

            setTimeout(() => {
                runBotMove(newState);
            }, 50);
        }
    }

    function handleRestart() {
        setGameState(initialGameState)
        setRoomID(null)
        setPlayerColor(null)
        setMatchmaking(null)

        if (mode === "online") {
            socket.emit('leaveGame', { roomId })
        }

        navigateHome()
    }


    function handleGameStart() {

        if (!user) {
            navigate('/login')
            return
        }

        setMode("online")
        socket.emit('findMatch')
        setMatchmaking('searching')
        navigate('/game')
    }

    function handleBotStart(){
        setMode("bot")
        setGameState({...initialGameState, status: "playing"})
        setPlayerColor("white")
        navigate('/game')
    }

    function navigateLogin() {
        navigate('/login')
    }

    function navigateSignUp() {
        navigate('/signup')
    }

    function signOut() {
        setUser(null)
        localStorage.removeItem('user')
        navigateTitle()
    }

    function navigateTitle() {
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
                    setUser(response.user)

                    localStorage.setItem('user', JSON.stringify(response.user))
                    socket.auth = { userId: response.user.id }

                    socket.disconnect()
                    socket.connect()

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
                element={<Login handleLogin={handleLogin} navigateTitle={navigateTitle}/>}
            />
            <Route
                path="/signup"
                element={<SignUp handleSignUp={handleSignUp} navigateTitle={navigateTitle}/>}
            />
            <Route
                path="/home"
                element={<Home navigateRated={handleGameStart} navigateBot={handleBotStart} navigatePuzzles={handleGameStart} signOut={signOut}/>}
            />
            <Route
                path="/game"
                element={
                    <div className="game-container">
                        <Chessboard
                            gameState={gameState}
                            setGameState={setGameState}
                            handleMove={handleMove}
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