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
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden text-gray-200 font-mono">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      <div className="w-full max-w-md bg-gray-900/90 backdrop-blur-xl shadow-2xl rounded-3xl p-8 relative z-10 border border-gray-700">
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
              className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-black text-gray-200 focus:ring-2 focus:ring-gray-500 focus:outline-none placeholder-gray-500"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-black text-gray-200 focus:ring-2 focus:ring-gray-500 focus:outline-none placeholder-gray-500"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-black text-gray-200 focus:ring-2 focus:ring-gray-500 focus:outline-none placeholder-gray-500"
              placeholder="Create a password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 rounded-lg transition-all border border-gray-600 shadow-md hover:shadow-gray-600/20 uppercase tracking-wide"
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
        <button className="w-full flex items-center justify-center gap-2 border border-gray-700 py-2 rounded-lg hover:bg-gray-800 transition text-gray-300 tracking-wide">
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />
          <span>Sign up with Google</span>
        </button>

        <p className="text-center text-gray-500 mt-6 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-gray-300 hover:text-white underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;