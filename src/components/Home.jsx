import "./Home.css"

function Home({ navigateRated, navigateBot, navigatePuzzles, signOut }) {
    return (
        <div className="home-screen">
            <h1>Welcome</h1>

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

                <button onClick={signOut}>
                    Log Out
                </button>
            </div>
        </div>
    )
}

export default Home