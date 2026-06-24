import "./Home.css"

function Home({ navigateRated, navigateBot, navigatePuzzles, navigateBack }) {
    return (
        <div className="home-screen">
            <h1>Welcome {sessionStorage.getItem('username')}</h1>

            <div className="home-buttons">
                <button onClick={navigateRated}>
                    Play Rated
                </button>

                <button onClick={navigateBot}>
                    Play Bot
                </button>

                <button onClick={navigatePuzzles}>
                    Puzzles
                </button>

                <button onClick={navigateBack}>
                    Log Out
                </button>
            </div>
        </div>
    )
}

export default Home