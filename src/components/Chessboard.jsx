import './Chessboard.css'
import Square from './Square'
import { useState } from 'react'

import {
    legalMoves,
    isKingInCheck,
    findKing
} from '../logic/chessLogic'

function Chessboard({
    gameState,
    setGameState,
    socket,
    roomId,
    playerColor
}) {
    const highlights = gameState.selected ? gameState.selected.moves : []

    const inCheck = isKingInCheck(gameState.turn, gameState)

    const kingPos = inCheck
        ? findKing(gameState.turn, gameState.board)
        : null

    const handleSquareClick = (row, col) => {
        if (gameState.status !== 'playing') return
        if (gameState.turn !== playerColor) return
        if (gameState.pendingPromotion) return

        const piece = gameState.board[row][col]

        // deselect
        if (
            gameState.selected &&
            gameState.selected.row === row &&
            gameState.selected.col === col
        ) {
            setGameState({ ...gameState, selected: null })
            return
        }

        // select piece
        if (piece) {
            const [color, type] = piece.split('_')

            if (color === playerColor) {
                const moves = legalMoves(type, color, row, col, gameState)

                setGameState({
                    ...gameState,
                    selected: { row, col, moves }
                })
                return
            }
        }

        // attempt move → 🔥 SERVER
        if (gameState.selected) {
            const from = [
                gameState.selected.row,
                gameState.selected.col
            ]
            const to = [row, col]

            socket.emit('makeMove', {
                roomId,
                from,
                to
            })

            setGameState({ ...gameState, selected: null })
            return
        }
    }

    const handleDragStart = (e, row, col) => {
        if (gameState.status !== 'playing') return
        if (gameState.turn !== playerColor) return
        if (gameState.pendingPromotion) return

        const piece = gameState.board[row][col]
        if (!piece) return

        const [color, type] = piece.split('_')
        if (color !== playerColor) {
            e.preventDefault()
            return
        }

        const moves = legalMoves(type, color, row, col, gameState)

        setGameState({
            ...gameState,
            selected: { row, col, moves }
        })

        e.dataTransfer.setData(
            'text/plain',
            JSON.stringify({ row, col })
        )
    }

    const handleDrop = (e, toRow, toCol) => {
        e.preventDefault()

        if (gameState.status !== 'playing') return
        if (gameState.turn !== playerColor) return
        if (gameState.pendingPromotion) return

        const data = JSON.parse(e.dataTransfer.getData('text/plain'))

        socket.emit('makeMove', {
            roomId,
            from: [data.row, data.col],
            to: [toRow, toCol]
        })

        setGameState({ ...gameState, selected: null })
    }

    return (
        <div className="chessboard">
            {gameState.board.map((row, rowIndex) =>
                row.map((piece, colIndex) => {
                    const isLight = (rowIndex + colIndex) % 2 === 0

                    const isHighlighted = highlights.some(
                        ([r, c]) => r === rowIndex && c === colIndex
                    )

                    const isCapture =
                        piece && !piece.startsWith(gameState.turn)

                    const isCheckSquare =
                        inCheck &&
                        kingPos &&
                        kingPos[0] === rowIndex &&
                        kingPos[1] === colIndex

                    return (
                        <Square
                            key={`${rowIndex}-${colIndex}`}
                            row={rowIndex}
                            col={colIndex}
                            piece={piece}
                            isLight={isLight}
                            isHighlighted={isHighlighted}
                            isCapture={isCapture}
                            isCheck={isCheckSquare}
                            onClick={handleSquareClick}
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            onDragStart={handleDragStart}
                        />
                    )
                })
            )}
        </div>
    )
}

export default Chessboard