import init, { get_best_move } from './pkg/analysis_engine.js'

await init()

self.onmessage = async (event) => {
    const { fen, depth, isWhite } = event.data

    const result = await get_best_move(
        fen,
        depth,
        isWhite
    )

    self.postMessage(result)
}