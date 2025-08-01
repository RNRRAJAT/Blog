import React, { useState } from 'react'
import auth from '../assets/auth.jpg'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, setUser } from '../redux/authSlice';

const Login = () => {
  const [showPassword,setShowPassword]=useState(false);
  const navigate=useNavigate();
  const dispatch=useDispatch();
  const {loading}=useSelector(store=>store.auth)
  const [input, setInput]= useState({
      email:"",
      password:""
    })
  const handleChange=(e)=>{
    const{name,value}=e.target
    setInput((prev)=>({
      ...prev,
      [name]:value
    }))
  }
  const handleSubmit=async(e)=>{
    e.preventDefault();
    // console.log(input);

    try {
      dispatch(setLoading(true))
        const res = await axios.post(`https://blog-lj36.onrender.com/api/v1/user/login`, input,{
          headers:{
            "Content-Type":"application/json"
          },
          withCredentials:true
        })
        if(res.data.success){
          dispatch(setUser(res.data.user))
          toast.success(res.data.message)
          navigate('/');
        }
    } catch (error) {
        console.log(error.response.data.message)
    } finally{
      dispatch(setLoading(false))
    }
  }
  return (
    <div className='flex h-screen md:pt-14 md:h-[760px]'>
      <div className='hidden md:block'>
        <img src={auth} alt="" className='h-[700px]' />
      </div>
      <div className='flex justify-center items-center flex-1 px-4 md:px-0'>
        <Card className='w-full max-w-md p-6 shadow-lg rounded-2xl dark:bg-gray-800 dark:border-gray-600 '>
          <CardHeader>
            <CardTitle>
              <h1 className='text-center text-xl font-semibold'>Login into your account</h1>
            </CardTitle>
            <p className='mt-2 text-sm font-serif text-center dark:text-gray-300 '>Enter your details  below to login your account</p>
          </CardHeader>
          <CardContent>
            <form className='space-y-4' onSubmit={handleSubmit}>
              
              <div className='flex flex-col gap-2'>
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="Email address"
                  name="email"
                  className="dark:border-gray-600 dark:bg-gray-900"
                  value={input.email}
                  onChange={handleChange}
                />
              </div>
              <div className='relative flex flex-col gap-2'>
                <Label>Password</Label>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  name="password"
                  className="dark:border-gray-600 dark:bg-gray-900"
                  value={input.password}
                  onChange={handleChange}
                />
                <button onClick={() => setShowPassword(!showPassword)} type='button' className='absolute right-3 top-8 text-gray-500'>
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}

                </button>
              </div>
              <Button type='submit' className='w-full'>
                {
                  loading ? (
                    <>
                    <Loader2 className='mr-2 w-4 h-4 animate-spin'/>
                    Please wait
                    </>
                  ):("Login")
                }
              </Button>
              <p className='text-center text-gray-600 dark:text-gray-300'>Don't have an account? <Link to={'/signup'}><span className='underline cursor-pointer hover:text-gray-800 dark:hover:text-gray-100'>Sign up</span></Link></p>
            </form>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}

export default Login
