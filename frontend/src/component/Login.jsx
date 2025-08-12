import React, { useState } from 'react'

const Login = (props) => {
    const [userLogin, setUserLogin] = useState({email: '', password: ''})
    const [userPass, setUserPass] = useState(false)

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
        props.onLogin(userLogin)
        setUserLogin({
            email: '',
            password: ''
        })

    }
  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100 px-4'>
      <form onSubmit={handleLogin} className='bg-white p-8 rounded-lg shadow-lg w-full max-w-md'>
        <h2 className='text-2xl font-bold text-center text-indigo-700 mb-6'>Login</h2>
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
