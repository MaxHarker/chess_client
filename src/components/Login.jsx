import { useState, useRef } from 'react'
import './Login.css'

function Login({ handleLogin, navigateTitle }) {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const usernameRef = useRef(null)
    const passwordRef = useRef(null)

    async function onSubmit(e) {
        e.preventDefault()
        console.log('Submitting login form with username:', username)

        if (!username) {
            usernameRef.current.setCustomValidity('Please enter your username')
            usernameRef.current.reportValidity()
            return
        }
        if (!password) {
            passwordRef.current.setCustomValidity('Please enter your password')
            passwordRef.current.reportValidity()
            return
        }

        const error = await handleLogin(username, password)

        if (error) {
            if (error.includes('User')) {
                usernameRef.current.setCustomValidity(error)
                usernameRef.current.reportValidity()
            }
            if (error.includes('password')) {
                passwordRef.current.setCustomValidity(error)
                passwordRef.current.reportValidity()
            }
        }
    }

    return (
        <div className="login-page">
            <h1>Login</h1>

            <form onSubmit={onSubmit} className="login-form">
                <input
                    ref={usernameRef}
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => {
                        usernameRef.current.setCustomValidity('')
                        setUsername(e.target.value)
                    }}
                />

                <input
                    ref={passwordRef}
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => {
                        passwordRef.current.setCustomValidity('')
                        setPassword(e.target.value)
                    }}
                />

                <button type="submit">
                    Sign In
                </button>
            </form>
            <button className="back-button" onClick={navigateTitle}>
                Back
            </button>
        </div>
    )
}

export default Login