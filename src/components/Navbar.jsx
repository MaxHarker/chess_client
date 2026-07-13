import "./Navbar.css";

function Navbar({ username, signOut }) {
    return (
        <nav className="navbar">
            <div className="navbar-right">
                {username && (
                    <>
                        <span className="username">
                            {username}
                        </span>

                        <button
                            className="logout-button"
                            onClick={signOut}
                        >
                            Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;