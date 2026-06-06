import './TitleScreen.css'

function TitleScreen({ navigateLogin, navigateSignUp, navigateGuest }) {
    return (
        <div className="title-screen">
            <div className = "title-content">
                <h1>Chess</h1>
                <div className="title-screen-buttons">
                    <button onClick={navigateLogin}>
                        Log In
                    </button>

                    <button onClick={navigateSignUp}>
                        Sign Up
                    </button>

                    <button 
                        className="guest-button"
                        onClick={navigateGuest}
                    >
                        Continue as Guest
                    </button>
                </div>
            </div>
            <h3>Version 1.2.3</h3>
        </div>
    )
}

export default TitleScreen