import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/authContext';
import { doSignInWithEmailAndPassword } from '../../../auth';
import './login.css'; // Make sure to import the correct CSS

const Login = () => {
    const { userLoggedIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    
    const onSubmit = async (e) => {
        e.preventDefault();
        if (!isSigningIn) {
            
            setIsSigningIn(true);
            try {
                await doSignInWithEmailAndPassword(email, password);
                // Optional: Redirect on success
            } catch (error) {
                setErrorMessage(error.message);
                setIsSigningIn(false);
            }
        }
    };

    return (
        <>
            {userLoggedIn && <Navigate to="/" replace />}
            <main className="login-main">
                <div className="login-card">
                    <img src="/logo.jpeg.jpg" alt="Logo" className="login-logo" />
                    <h3>Welcome Back</h3>
                    <form onSubmit={onSubmit} className="login-form">
                        <input 
                            type="email" 
                            placeholder="Email" 
                            required 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                        />
                        <input 
                            type="password" 
                            placeholder="Password" 
                            required 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                        />
                        {errorMessage && <div className="error">{errorMessage}</div>}
                        <button type="submit" disabled={isSigningIn} className="login-btn">
                            {isSigningIn ? 'Signing In...' : 'Sign In'}
                        </button>
                        <p className="sign-up-text">Don't have an account? <Link to="/register">Sign up</Link></p>
                    </form>
                </div>
            </main>
        </>
    );
};

export default Login;