import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import './Signup.css';

const Signup = () => {
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Use FormData logic to get values directly from the input fields
        const formData = new FormData(e.target);
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');

        try {
            // 1. Register the user
            await api.post('/auth/signup', { name, email, password });

            // 2. Automatically login the user
            const loginRes = await api.post('/auth/login', { email, password });

            // 3. Store token
            localStorage.setItem('token', loginRes.data.token);

            alert('Signup successful! Redirecting to dashboard...');
            navigate('/');
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Signup failed. Please try again.';
            setError(msg);
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-bg-glow"></div>

            <div className="signup-card">
                <div className="signup-header">
                    <h2 className="signup-title">Create Account</h2>
                    <p className="signup-subtitle">Join us to start your journey</p>
                </div>

                <form className="signup-form" onSubmit={handleSubmit}>
                    {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}

                    <div className="form-group">
                        <label htmlFor="name" className="form-label">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            className="form-input"
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="form-input"
                            placeholder="name@example.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="form-input"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="signup-btn">
                            Create Account
                        </button>
                    </div>
                </form>

                <div className="signup-footer">
                    Already have an account?
                    <Link to="/login" className="signup-link">Log in</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
