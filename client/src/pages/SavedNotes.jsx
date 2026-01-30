import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
    BookOpen,
    FileText,
    PenLine,
    Trash2,
    X,
    Link2,
    ArrowLeft,
    Plus,
    LogOut
} from 'lucide-react';
import api from '../api';
import './SavedNotes.css';

const SavedNotes = () => {
    const navigate = useNavigate();
    const [savedNotes, setSavedNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingNote, setViewingNote] = useState(null);
    const [error, setError] = useState('');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [userName, setUserName] = useState('');

    const menuRef = useRef(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchSavedNotes();
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
    }, []);

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

    const fetchSavedNotes = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/blog/saved', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSavedNotes(data.notes || []);
        } catch {
            setError('Failed to fetch saved notes');
        } finally {
            setLoading(false);
        }
    };

    const handleViewNote = async (id) => {
        try {
            const { data } = await api.get(`/blog/saved/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setViewingNote(data.note);
        } catch {
            setError('Failed to load note');
        }
    };

    const handleDeleteNote = async (id) => {
        if (!window.confirm('Are you sure you want to delete this note?')) return;

        try {
            await api.delete(`/blog/saved/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchSavedNotes();
            if (viewingNote?.id === id) setViewingNote(null);
        } catch {
            setError('Failed to delete note');
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

    const formatDate = (dateString) =>
        new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

    return (
        <div className="saved-page">
            <nav className="saved-nav">
                <h1 className="nav-title">NoteWise AI</h1>
                <div className="nav-actions">
                    <button onClick={() => navigate('/dashboard')} className="nav-btn">
                        <ArrowLeft size={18} /> Back to Dashboard
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

            <main className="saved-main">
                <div className="saved-header">
                    <h2>
                        <BookOpen size={24} /> My Saved Notes
                    </h2>
                    <p>All your saved summaries and study notes in one place</p>
                </div>

                {error && <div className="error-msg">{error}</div>}

                <div className="saved-content">
                    <div className="notes-list-container">
                        {loading ? (
                            <div className="loading-box">
                                <div className="spinner"></div>
                                <p>Loading notes...</p>
                            </div>
                        ) : savedNotes.length === 0 ? (
                            <div className="empty-state">
                                <span className="empty-icon">
                                    <PenLine size={28} />
                                </span>
                                <h3>No saved notes yet</h3>
                                <p>
                                    Generate summaries or notes from articles and save
                                    them to access later
                                </p>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="primary-btn"
                                >
                                    <Plus size={18} /> Generate Notes
                                </button>
                            </div>
                        ) : (
                            <div className="notes-list">
                                {savedNotes.map((note) => (
                                    <div
                                        key={note.id}
                                        className={`note-card ${viewingNote?.id === note.id ? 'active' : ''
                                            }`}
                                        onClick={() => handleViewNote(note.id)}
                                    >
                                        <div className="note-card-header">
                                            <span className="note-type-badge">
                                                {note.type === 'summary' ? (
                                                    <>
                                                        <FileText size={14} /> Summary
                                                    </>
                                                ) : (
                                                    <>
                                                        <PenLine size={14} /> Notes
                                                    </>
                                                )}
                                            </span>
                                            <button
                                                className="delete-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteNote(note.id);
                                                }}
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <h4 className="note-card-title">
                                            {note.articleTitle}
                                        </h4>
                                        <p className="note-card-url">
                                            {note.articleUrl}
                                        </p>
                                        <span className="note-card-date">
                                            {formatDate(note.createdAt)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {Boolean(viewingNote) ? (
                        <div className="note-viewer">
                            <div className="viewer-header">
                                <div>
                                    <h3>{viewingNote.articleTitle}</h3>
                                    <span className="viewer-type">
                                        {viewingNote.type === 'summary'
                                            ? 'Summary'
                                            : 'Notes'}
                                    </span>
                                </div>
                                <button
                                    className="close-viewer-btn"
                                    onClick={() => setViewingNote(null)}
                                >
                                    <X size={19} />
                                </button>
                            </div>

                            <a
                                href={viewingNote.articleUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="source-link"
                            >
                                <Link2 size={14} /> View Original Article
                            </a>

                            <div className="viewer-content markdown-content">
                                <ReactMarkdown>
                                    {viewingNote.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    ) : (
                        savedNotes.length > 0 && (
                            <div className="select-prompt">
                                <span className="prompt-icon">
                                    <ArrowLeft size={24} />
                                </span>
                                <p>Select a note from the list to view its content</p>
                            </div>
                        )
                    )}
                </div>
            </main>
        </div>
    );
};

export default SavedNotes;
