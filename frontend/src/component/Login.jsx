import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'

const Login = ({onLogin}) => {
    const location = useLocation()
    const [userLogin, setUserLogin] = useState({email: location.state?.message || '', password: ''})
    const [userPass, setUserPass] = useState(false)
    const [message, setMessage] = useState()

    useEffect(() => {
        // Set message from navigation state
        if (location.state?.message) {
            setMessage(location.state.message);
            
            // Optional: Clear message after 5 seconds
            const timer = setTimeout(() => {
                setMessage('');
            }, 5000);
            
            return () => clearTimeout(timer);
        }
    }, [location.state]);

    const clearMessage = () => {
        setMessage('');
    };

    const handleReveal = () =>{
      setUserPass(!userPass)
    }

    const handleChange = (e) =>{
        const {name, value} = e.target;
        setUserLogin((prevLogin) => {
            return {
                ...prevLogin,
                [name]: value
            }
        })
    }
    const handleLogin = (e) =>{
        e.preventDefault();
        onLogin(userLogin)
        setUserLogin({
            email: '',
            password: ''
        })

    }
  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100 px-4'>
      <form onSubmit={handleLogin} className='bg-white p-8 rounded-lg shadow-lg w-full max-w-md'>
        <h2 className='text-2xl font-bold text-center text-indigo-700 mb-6'>Login</h2>
        {message && (
                    <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded relative">
                        {message}
                        <button 
                            type="button"
                            onClick={clearMessage}
                            className="absolute top-1 right-2 text-blue-700 hover:text-blue-900"
                        >
                            ×
                        </button>
                    </div>
                )}
        <div className="mb-4">
            <label htmlFor="email" className='block text-sm font-mediumtext-gray-700 mb-1'>Email</label>
            <input type="text" name='email'id='email' onChange={handleChange} className='w-full px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' required/>
        </div>
        <div className="mb-6">
            <label htmlFor="password" className='block text-sm font-mediumtext-gray-700 mb-1'>Password</label>
            <div className='flex justify-between items-center w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'>
              <input type={userPass ? 'text' : 'password'} name='password' id='password' onChange={handleChange} className='w-full border-none outline-0' required/>
              {userPass ? (
                <img src="images/open-eye.png" alt="closed eye" className='w-4 cursor-pointer' onClick={handleReveal}/>
              ) : (<img src="images/closed-eye.png" alt="closed eye" className='w-4 cursor-pointer' onClick={handleReveal}/>)}
              
            </div>
        </div>
        <button type='submit' className='w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-md transition duration-300 cursor-pointer'>Login</button>
      </form>
    </div>
  )
}

export default Login
