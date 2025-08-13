import React, { useState } from 'react'

const Signup = ({onSignUp, errors = {}, isLoading = false}) => {
    const [signupUser, setSignupUser] = useState({name: '', email: '', password: ''})
    const [userPass, setUserPass] = useState(false)
    

    const handleReveal = () =>{
      setUserPass(!userPass)
    }

    const signInPost = (e) =>{
        e.preventDefault()
        onSignUp(signupUser)
        setSignupUser({
            name: '', 
            email: '', 
            password: ''
        })
    }
    const handleChange = (e) =>{
        const {name, value} = e.target;
        setSignupUser((prevSignUp) =>{
            return {
                ...prevSignUp,
                [name]: value
            }
        })
    }
  return (
    <div>
        <div className='flex items-center justify-center min-h-screen bg-gray-100 px-4'>
            <form onSubmit={signInPost} className='bg-white p-8 rounded-lg shadow-lg w-full max-w-md'>
                <h2 className='text-2xl font-bold text-center text-indigo-700 mb-6'>Sign Up</h2>
                {errors.general && <p className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{errors.general}</p>}
                <div className="mb-4">
                    <label htmlFor="name" className='block text-sm font-mediumtext-gray-700 mb-1'>Name</label>
                    <input type="text" name='name' id='fName'  onChange={handleChange} className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                errors.name ? 'border-red-500' : 'border-gray-300'
                            }`} required/>
                    {errors.name && <p className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{errors.name}</p>}
                </div>
                <div className="mb-4">
                    <label htmlFor="email" className='block text-sm font-mediumtext-gray-700 mb-1'>Email</label>
                    <input type="text" name='email'id='email' onChange={handleChange} className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                errors.email ? 'border-red-500' : 'border-gray-300'
                            }`} required/>
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                
                <div className="mb-6">
                    <label htmlFor="password" className='block text-sm font-mediumtext-gray-700 mb-1'>Password</label>
                    <div className={`flex justify-between items-center w-full px-4 py-2 border rounded-md focus-within:ring-2 focus-within:ring-indigo-500 ${
                            errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}>
                    <input type={userPass ? 'text' : 'password'} name='password' id='password' onChange={handleChange} className='w-full border-none outline-0' required/>
                    {userPass ? (
                        <img src="images/open-eye.png" alt="closed eye" className='w-4 cursor-pointer' onClick={handleReveal}/>
                    ) : (<img src="images/closed-eye.png" alt="closed eye" className='w-4 cursor-pointer' onClick={handleReveal}/>)}
                    
                    </div>
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>
                <button 
                    type='submit' 
                    disabled={isLoading}
                    className={`w-full font-semibold py-2 rounded-md transition duration-300 ${
                        isLoading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
                    } text-white`}
                >
                    {isLoading ? 'Signing Up...' : 'Sign Up'}
                </button>
            </form>
        </div>
    </div>
  )
}

export default Signup
