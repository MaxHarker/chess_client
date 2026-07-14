import init, { get_best_move } from './pkg/analysis_engine.js'

let initialized = false

self.onmessage = async (event) => {

    if (!initialized) {
        await init()
        initialized = true
    }

    const { fen, depth, isWhite } = event.data

    const move = get_best_move(
        fen,
        depth,
        isWhite
    )

    self.postMessage(move)
}