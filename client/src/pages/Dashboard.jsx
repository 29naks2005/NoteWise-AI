import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { BookOpen, Save, LogOut, User } from 'lucide-react';
import api from '../api';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [blogUrl, setBlogUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState('summary');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [userName, setUserName] = useState('');

    const menuRef = useRef(null);
    const token = localStorage.getItem('token');
    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        // Get user info from localStorage or token
        const storedName = localStorage.getItem('userName');
        if (storedName) {
            setUserName(storedName);
        } else if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUserName(payload.name || payload.email || 'User');
            } catch {
                setUserName('User');
            }
        }
    }, [token]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleGetSummary = async () => {
        if (!blogUrl) {
            setError('Please enter a blog URL');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');
        setResult(null);
        setSaved(false);

        try {
            const { data } = await api.post('/blog/summary', { url: blogUrl }, authHeaders);
            setResult({ title: data.title, url: data.url, summary: data.summary });
            setActiveTab('summary');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to get summary');
        } finally {
            setLoading(false);
        }
    };

    const handleGetNotes = async () => {
        if (!blogUrl) {
            setError('Please enter a blog URL');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');
        setResult(null);
        setSaved(false);

        try {
            const { data } = await api.post('/blog/notes', { url: blogUrl }, authHeaders);
            setResult({ title: data.title, url: data.url, notes: data.notes });
            setActiveTab('notes');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to get notes');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!result) return;

        const content = activeTab === 'summary' ? result.summary : result.notes;
        if (!content) {
            setError('No content to save');
            return;
        }

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            await api.post('/blog/save', {
                articleUrl: result.url || blogUrl,
                articleTitle: result.title,
                content: content,
                type: activeTab
            }, authHeaders);

            setSaved(true);
            setSuccess('Saved successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        if (!window.confirm('Are you sure you want to logout?')) return;
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        navigate('/login');
    };

    const getUserInitial = () => {
        return userName ? userName.charAt(0).toUpperCase() : 'U';
    };

    return (
        <div className="dashboard">
            <nav className="dashboard-nav">
                <h1 className="nav-title">NoteWise AI</h1>
                <div className="nav-actions">
                    <button onClick={() => navigate('/saved')} className="saved-btn">
                        <BookOpen size={18} /> My Saved Notes
                    </button>

                    <div className="user-menu-container" ref={menuRef}>
                        <button
                            className="user-avatar"
                            onClick={() => setShowUserMenu(!showUserMenu)}
                        >
                            {getUserInitial()}
                        </button>

                        {showUserMenu && (
                            <div className="user-dropdown">
                                <div className="user-info">
                                    <div className="user-avatar-large">
                                        {getUserInitial()}
                                    </div>
                                    <span className="user-name">{userName}</span>
                                </div>
                                <div className="dropdown-divider"></div>
                                <button className="dropdown-item" onClick={handleLogout}>
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <main className="dashboard-main">
                <div className="input-section">
                    <h2>Generate Notes from Blog</h2>
                    <p className="input-desc">Enter a blog/article URL to generate summary and study notes</p>

                    <div className="input-group">
                        <label>Blog / Article URL</label>
                        <input
                            type="text"
                            value={blogUrl}
                            onChange={(e) => setBlogUrl(e.target.value)}
                            placeholder="Enter a blog/article URL"
                            className="url-input"
                        />
                    </div>

                    {error && <div className="error-msg">{error}</div>}
                    {success && <div className="success-msg">{success}</div>}

                    <div className="btn-group">
                        <button onClick={handleGetSummary} disabled={loading} className="action-btn summary-btn">
                            {loading ? 'Loading...' : 'Get Summary'}
                        </button>
                        <button onClick={handleGetNotes} disabled={loading} className="action-btn notes-btn">
                            {loading ? 'Loading...' : 'Get Notes'}
                        </button>
                    </div>
                </div>

                {loading && (
                    <div className="loading-section">
                        <div className="spinner"></div>
                        <p>Processing blog... This may take a moment.</p>
                    </div>
                )}

                {result && (
                    <div className="result-section">
                        <div className="result-header">
                            <h3>{result.title}</h3>
                            <button
                                onClick={handleSave}
                                disabled={saving || saved}
                                className={`save-btn ${saved ? 'saved' : ''}`}
                            >
                                <Save size={16} /> {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
                            </button>
                        </div>

                        {(result.summary && result.notes) && (
                            <div className="tabs">
                                <button
                                    className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('summary')}
                                >
                                    Summary
                                </button>
                                <button
                                    className={`tab ${activeTab === 'notes' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('notes')}
                                >
                                    Notes
                                </button>
                            </div>
                        )}

                        <div className="content-box markdown-content">
                            {activeTab === 'summary' && result.summary && (
                                <ReactMarkdown>{result.summary}</ReactMarkdown>
                            )}
                            {activeTab === 'notes' && result.notes && (
                                <ReactMarkdown>{result.notes}</ReactMarkdown>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
