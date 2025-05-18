import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import { NavLink, useNavigate } from 'react-router-dom';
import { ShipWheelIcon } from 'lucide-react';

const LoginPage = () => {
  const { saveAuth } = useAuth(); // ✅ استخدمي saveAuth بدل saveToken
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const login = async (loginData) => {
    try {
      const res = await axios.post("https://stream-chat-backend-production.up.railway.app/signin", loginData);
      const data = res.data;

      if (res.status === 201 && data?.token && data?.user) {
        saveAuth(data.token, data.user); // ✅ خزني التوكن واليوزر مع بعض
        toast.success("Logged in successfully!");
        console.log(data);
        navigate('/');
      }
    } catch (error) {
      console.error("Login Error:", error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || "Login failed!");
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    login(loginData);
  };

  return (
    <div className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8" data-theme="forest">
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">

        {/* LOGIN FORM SECTION */}
        <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
          {/* LOGO */}
          <div className="mb-4 flex items-center justify-start gap-2">
            <ShipWheelIcon className="size-9 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              Streamify
            </span>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Welcome Back</h2>
              <p className="text-sm opacity-70">Sign in to continue your journey</p>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="hello@example.com"
                className="input input-bordered w-full"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="input input-bordered w-full"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-full">
              Sign In
            </button>

            <div className="text-center mt-4">
              <p className="text-sm">
                Don't have an account?{" "}
                <NavLink to="/signup" className="text-primary hover:underline">
                  Create one
                </NavLink>
              </p>
            </div>
          </form>
        </div>

        {/* IMAGE SECTION */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
          <div className="max-w-md p-8">
            <div className="relative aspect-square max-w-sm mx-auto">
              <img src="/i.png" alt="Language connection illustration" className="w-full h-full" />
            </div>
            <div className="text-center space-y-3 mt-6">
              <h2 className="text-xl font-semibold">Connect with language partners worldwide</h2>
              <p className="opacity-70">
                Practice conversations, make friends, and improve your language skills together
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
