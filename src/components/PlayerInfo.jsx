import './PlayerInfo.css'

function PlayerInfo({ player, active }) {

    if (!player) return null

    return (
        <div className={`player-info ${active ? "active" : ""}`}>
            <div className="player-details">
                <div className="player-name">
                    {player?.username}
                </div>

                <div className="player-rating">
                    {player?.rating} Elo
                </div>
            </div>
        </div>
    )
}

export default PlayerInfo