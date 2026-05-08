import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (!name || !email || !password) {
        setError("Please fill in all fields.");
        return;
      }

      const user = { fullname: name, email, password };
      const { data } = await axios.post("http://localhost:4000/auth/signup", user);

      console.log(data);
      navigate("/login");
    } catch (err) {
      setError("Signup failed. Try again.");
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
          Create Account
        </h2>
        <p className="text-center text-gray-500 mb-6">Join AlgoVista and start your journey</p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-800/30 text-red-400 px-4 py-2 mb-4 rounded-lg border border-red-500">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-[var(--glass-border)] rounded-lg bg-[rgba(0,0,0,0.6)] text-[var(--primary-yellow)] focus:ring-2 focus:ring-[var(--primary-yellow)] focus:outline-none placeholder-gray-500"
              placeholder="Enter your name"
            />
          </div>

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
              placeholder="Create a password"
            />
          </div>

          <button
            type="submit"
            className="w-full btn-yellow"
          >
            Sign Up
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center justify-center my-4 text-gray-500 text-sm">
          <span className="h-px w-16 bg-gray-700"></span>
          <span className="mx-2">OR</span>
          <span className="h-px w-16 bg-gray-700"></span>
        </div>

        {/* Google Signup Button */}
        <button className="w-full flex items-center justify-center gap-2 btn-outline hover-tech-yellow">
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />
          <span>Sign up with Google</span>
        </button>

        <p className="text-center text-gray-500 mt-6 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-[var(--primary-yellow)] hover-tech-yellow underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;