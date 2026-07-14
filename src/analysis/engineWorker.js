import init, { get_best_move } from './pkg/analysis_engine.js'

let initialized = false

self.onmessage = async (event) => {

    if (!initialized) {
        await init()
        initialized = true
    }

    const move = get_best_move(event.data)

    self.postMessage(move)
}