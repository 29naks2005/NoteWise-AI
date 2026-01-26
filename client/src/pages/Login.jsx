import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import './Login.css';

const Login = () => {
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Use FormData logic to get values directly from the input fields
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');

        try {
            const response = await api.post('/auth/login', { email, password });

            // Store token in localStorage
            localStorage.setItem('token', response.data.token);

            alert('Login successful!');
            navigate('/'); // Redirect to home/dashboard
        } catch (err) {
            console.error(err);
            // Handle error response safely
            const msg = err.response?.data?.message || 'Login failed. Please try again.';
            setError(msg);
        }
    };

    return (
        <div className="login-container">
            {/* Background Effects */}
            <div className="login-bg-glow"></div>

            <div className="login-card">
                <div className="login-header">
                    <h2 className="login-title">Welcome Back</h2>
                    <p className="login-subtitle">Enter your credentials to access your account</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}

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
                        <button type="submit" className="login-btn">
                            Sign In
                        </button>
                    </div>
                </form>

                <div className="login-footer">
                    Don't have an account?
                    <Link to="/signup" className="login-link">Sign up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
