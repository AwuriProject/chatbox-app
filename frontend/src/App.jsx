import React, { useState, useEffect } from 'react';
import { Link, Routes, Route, useNavigate } from 'react-router-dom'
import PostApp from './component/PostApp';
import Article from './component/Article';
import Signup from './component/Signup';
import Login from './component/Login';

function App() {
    const [isAuth, setIsAuth] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const navigate = useNavigate();
    
    // Check if user is already logged in when app loads
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuth(true);
        }
    }, []);

    const signUp = async (userData) => {
        // console.log('API URL:', process.env.VITE_API_URL)
        console.log(`https://my-chat-box.up.railway.app`)
        try {
            const res = await fetch(`https://my-chat-box.up.railway.app/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: userData.email,
                    password: userData.password,
                    name: userData.name
                })
            })
            if(!res.ok){
                throw new Error(`Signup Failed with status ${res.status}`)
            }
            const data = await res.json()
            navigate('/login')
        } catch (error) {
            console.log('Signup error:', error)
        }
    }

    const login = async (userLoginData) => {
        // http://localhost:8000/auth/login
    try {
        const res = await fetch(`${process.env.VITE_API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: userLoginData.email,
                password: userLoginData.password
            })
        })
        
        if(!res.ok){
            throw new Error(`Wrong details status ${res.status}`)
        }           
        
        const data = await res.json()
        
        // Validate that we received a token
        if (!data.token) {
            throw new Error('No token received from server');
        }
        
        localStorage.setItem('token', data.token);
        setIsAuth(true)
        navigate('/feed')
        
    } catch (err) {
        console.error('Login error:', err);
        
        // Handle different types of errors appropriately
        if (err.message.includes('Wrong details status')) {
            // Re-throw the original fetch error
            throw err;
        } else if (err.message === 'No token received from server') {
            throw err;
        } else {
            // For other errors (network issues, etc.)
            const error = new Error('Login failed. Please try again.');
            error.statusCode = 500;
            throw error;
        }
    }
}

    const logout = () => {
        setIsAuth(false)
        localStorage.removeItem('token')
        navigate('/')
    }

    const addPost = async (newPost) => {
        const token = localStorage.getItem('token')
        if(!token){
            const error = new Error('No user with that Token!')
            error.statusCode = 401
            throw error
        }
        try {
            const formData = new FormData()
            formData.append('title', newPost.title)
            formData.append('content', newPost.content)
            formData.append('image', newPost.image)
            
            // http://localhost:8000/feed/post

            const url = `${process.env.VITE_API_URL}feed/post`;
            const res = await fetch(url, {
                method: 'POST',
                body: formData,
                headers: {
                    Authorization: `Bearer ${token}` 
                }
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            setRefreshTrigger(prev => prev + 1);

        } catch (error) {
            console.error('Error adding post:', error);
        }
    };

    return (
        <div>
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Social Feed</h1>
                <div className='flex gap-2 items-center'>
                    {!isAuth ? (
                        <>
                            <Link to='/login'>Login</Link>
                            <Link to="/signup">Sign Up</Link>
                        </>
                    ) : (
                        <>
                            <button onClick={logout} className="text-blue-600 hover:text-blue-800">
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </div>
            </header>
            
            <main className='max-w-2xl mx-auto px-4 py-8'>
                <Routes>
                    <Route path='/login' element={<Login onLogin={login}/>}/>
                    <Route path='/signup' element={<Signup onSignUp={signUp}/>}/>
                    <Route
                        path='/feed'
                        element ={
                        isAuth ? (
                        <>
                            <PostApp onAdd={addPost} />
                            <Article refreshTrigger={refreshTrigger} />
                        </>) 
                        :
                        <p>Please log in to view the feed</p>
                        }
                    />
                    <Route path='/' element={<p>Welcome! Please sign up or log in.</p>}/>
                </Routes>
            </main> 
        </div>
    );
}

export default App;