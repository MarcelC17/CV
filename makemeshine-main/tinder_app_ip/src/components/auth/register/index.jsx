import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/authContext'; // presupunând că acest fișier este utilizat pentru a gestiona autentificarea
import { doCreateUserWithEmailAndPassword } from '../../../auth';
import './register.css';

const Register = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const { userLoggedIn } = useAuth(); // Presupunând că aceasta este funcția care furnizează starea de autentificare

    const onSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match");
            return;
        }
        if (!isRegistering) {
            setIsRegistering(true);
            setErrorMessage('Please verify your email');
            try {
                await doCreateUserWithEmailAndPassword(email, password);
                navigate('/login'); // Navigați direct la pagina de login după înregistrare
            } catch (error) {
                setErrorMessage(error.message);
            } finally {
                setIsRegistering(false);
            }
        }
    };

    return (
        <main className="register-main">
            <div className="register-card">
                <h3 className="register-title">Create a New Account</h3>
                <form onSubmit={onSubmit}>
                    <div className="input-group">
                        <label>Email</label>
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <div className="input-group">
                        <label>Confirm Password</label>
                        <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </div>
                    {errorMessage && <div className="error">{errorMessage}</div>}
                    <button type="submit" disabled={isRegistering} className="register-btn">
                        {isRegistering ? 'Signing Up...' : 'Sign Up'}
                    </button>
                    <div className="register-link">Already have an account? <Link to="/login">Log in</Link></div>
                </form>
            </div>
        </main>
    );
};

export default Register;
