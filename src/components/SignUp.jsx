import { useState, useRef, useEffect } from 'react'
import './SignUp.css'

function SignUp({ handleSignUp, navigateTitle }) {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [email, setEmail] = useState('')

    const usernameRef = useRef(null)
    const emailRef = useRef(null)
    const formRef = useRef(null)

    async function onSubmit(e) {
        e.preventDefault()

        usernameRef.current.setCustomValidity('')
        emailRef.current.setCustomValidity('')

        const error = await handleSignUp(username, password, email)

        if (error) {
            if (error.includes('Username')) {
                usernameRef.current.setCustomValidity(error)
                usernameRef.current.reportValidity()
            }

            if (error.includes('Email')) {
                emailRef.current.setCustomValidity(error)
                emailRef.current.reportValidity()
            }
        }
    }

    return (
        <div className="signup-page">
            <h1>Sign Up</h1>

            <form onSubmit={onSubmit} className="signup-form" ref={formRef}>
                <input
                    ref={usernameRef}
                    type="text"
                    placeholder="Username"
                    value={username}
                    required
                    onChange={(e) => {
                        usernameRef.current.setCustomValidity('');
                        setUsername(e.target.value);
                    }}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    required
                    minLength={6}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <input
                    ref={emailRef}
                    type="email"
                    placeholder="Email"
                    value={email}
                    required
                    onChange={(e) => {
                        emailRef.current.setCustomValidity('');
                        setEmail(e.target.value);
                    }}
                />

                <button type="submit">
                    Sign Up
                </button>
            </form>
            <button className="back-button" onClick={navigateTitle}>
                Back
            </button>
        </div>
    )
}

export default SignUp