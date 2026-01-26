import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-container">
            {/* Background Ambience */}
            <div className="landing-bg-glow"></div>
            <div className="landing-grid"></div>
            <div className="floating-shape shape-1"></div>
            <div className="floating-shape shape-2"></div>

            {/* Navigation */}
            <nav className="landing-nav">
                <div className="nav-logo">DevFlow</div>
                <div className="nav-links">
                    <button className="nav-btn" onClick={() => navigate('/login')}>Login</button>
                    <button className="nav-btn primary" onClick={() => navigate('/signup')}>Sign Up</button>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="landing-hero">
                <h1 className="hero-title">
                    Master Your Code <br />
                    <span className="text-gradient">Unlock Your Potential</span>
                </h1>
                <p className="hero-subtitle">
                    The ultimate platform for developers to track progress, visualize algorithms,
                    and prepare for technical interviews with confidence.
                </p>
                <div className="hero-actions">
                    <button className="btn-large btn-primary" onClick={() => navigate('/signup')}>
                        Get Started Free
                    </button>
                </div>
            </header>
        </div>
    );
};

export default Landing;
