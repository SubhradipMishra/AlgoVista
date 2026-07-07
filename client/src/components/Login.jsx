import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { useContext } from "react";
import Context from "../util/context";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { session, setSession } = useContext(Context);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      console.log("LOGIN RESPONSE:", data);

      const sessionData = await axios.get(
        `${import.meta.env.VITE_API_URL}/auth/session`,
        { withCredentials: true }
      );

      console.log("SESSION RESPONSE:", sessionData.data);

      setSession(sessionData.data);

      navigate("/");
    } catch (err) {
      console.log("FULL ERROR:", err);
      console.log("STATUS:", err.response?.status);
      console.log("DATA:", err.response?.data);

      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center grid-bg relative overflow-hidden text-[var(--text-main)] font-mono">
      <div className="w-full max-w-md glass-card p-8 relative z-10">

        {/* Website Name */}
        <h1 className="text-4xl font-extrabold text-center mb-4 tracking-widest text-gray-100">
          AlgoVista
        </h1>

        {/* Header */}
        <h2 className="text-2xl font-bold text-center text-gray-300 mb-2 uppercase tracking-wider">
          Welcome Back
        </h2>
        <p className="text-center text-gray-500 mb-6">Login to continue your journey</p>

        {/* Error */}
        {error && (
          <div className="bg-red-800/30 text-red-400 px-4 py-2 mb-4 rounded-lg border border-red-500">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-[var(--glass-border)] rounded-lg bg-[rgba(0,0,0,0.6)] text-[var(--primary-yellow)] focus:ring-2 focus:ring-[var(--primary-yellow)] focus:outline-none placeholder-gray-500"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-[var(--glass-border)] rounded-lg bg-[rgba(0,0,0,0.6)] text-[var(--primary-yellow)] focus:ring-2 focus:ring-[var(--primary-yellow)] focus:outline-none placeholder-gray-500"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full btn-yellow"
          >
            Log In
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center justify-center my-4 text-gray-500 text-sm">
          <span className="h-px w-16 bg-gray-700"></span>
          <span className="mx-2">OR</span>
          <span className="h-px w-16 bg-gray-700"></span>
        </div>

        {/* Google Login */}
        <button className="w-full flex items-center justify-center gap-2 btn-outline hover-tech-yellow">
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google Login"
            className="w-5 h-5"
          />
          <span>Login with Google</span>
        </button>

        <p className="text-center text-gray-500 mt-6 text-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="text-[var(--primary-yellow)] hover-tech-yellow underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
