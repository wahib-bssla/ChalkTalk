import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { FaArrowRightLong } from "react-icons/fa6";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  //redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const validateUsername = (username) => {
    const usernamePattern = /^[a-zA-Z]{3,20}$/; // Reegex for Username
    return usernamePattern.test(username);
  };

  const validatePassword = (password) => {
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/; // Regex for Password
    return passwordPattern.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateUsername(username)) {
      setError("Username must be 3-20 characters long and alphanumeric.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!validatePassword(password)) {
      setError("Password must be at least 8 characters long, with at least one uppercase letter, one lowercase letter, and one number.");
      return;
    }
    try {
      await register(username, password);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-teal-100">
      {/* Left Side - Image and Text (Hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 items-center justify-center p-4 lg:p-12">
        <div className="max-w-2xl text-center space-y-4 md:space-y-8">
          <img 
            src="vector.png"
            alt="AI Education"
            className="w-48 h-48 md:w-64 md:h-64 lg:w-96 lg:h-96 mb-4 md:mb-8 mx-auto object-contain transition-transform duration-500 hover:scale-105"
          />
          <div className="space-y-2 md:space-y-4">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-emerald-900 leading-tight">
              AI Powered Education Room Chats
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-emerald-800 leading-relaxed">
              Enhance your learning experience with intelligent chat rooms
              powered by cutting-edge AI technology.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full md:w-1/2 flex-1 flex items-center justify-center p-4 sm:p-6 md:p-12">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 sm:p-8 md:p-10 lg:p-12 transition-all duration-300 hover:shadow-xl mx-auto">
          <div className="mb-6 md:mb-8 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-900 mb-2">
              Create Account
            </h2>
            <p className="text-sm md:text-base text-emerald-800">Join our learning community</p>
          </div>

          <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
            {/* Username Field */}
            <div className="relative group">
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
                required
                className="w-full px-4 py-2 md:py-3 rounded-lg border border-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all peer bg-white text-emerald-950 placeholder-transparent text-sm md:text-base"
                placeholder=" "
              />
              <label 
                htmlFor="username"
                className="absolute left-4 -top-2.5 px-1 bg-white text-xs md:text-sm text-teal-600 peer-placeholder-shown:text-sm peer-placeholder-shown:md:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:md:text-sm peer-focus:text-teal-600 transition-all"
              >
                Username
              </label>
            </div>

            {/* Password Field */}
            <div className="relative group">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                required
                className="w-full px-4 py-2 md:py-3 rounded-lg border border-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all peer bg-white text-emerald-950 placeholder-transparent text-sm md:text-base"
                placeholder=" "
              />
              <label 
                htmlFor="password"
                className="absolute left-4 -top-2.5 px-1 bg-white text-xs md:text-sm text-teal-600 peer-placeholder-shown:text-sm peer-placeholder-shown:md:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:md:text-sm peer-focus:text-teal-600 transition-all"
              >
                Password
              </label>
            </div>

            {/* Confirm Password Field */}
            <div className="relative group">
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                required
                className="w-full px-4 py-2 md:py-3 rounded-lg border border-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all peer bg-white text-emerald-950 placeholder-transparent text-sm md:text-base"
                placeholder=" "
              />
              <label 
                htmlFor="confirmPassword"
                className="absolute left-4 -top-2.5 px-1 bg-white text-xs md:text-sm text-teal-600 peer-placeholder-shown:text-sm peer-placeholder-shown:md:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:md:text-sm peer-focus:text-teal-600 transition-all"
              >
                Confirm Password
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className={`p-2 md:p-3 text-red-600 text-sm md:text-base bg-red-100 rounded-lg border border-red-400 ${error ? 'tremble' : ''}`}>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full p-3 md:p-4 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 md:gap-3 shadow-lg hover:shadow-teal-200/50 text-sm md:text-base"
            >
              <span>Create Account</span>
              <FaArrowRightLong className="mt-0.5 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-6 md:mt-8 text-center text-gray-600 text-sm md:text-base">
            Already have an account?{" "}
            <a 
              href="/login" 
              className="font-semibold text-emerald-600 hover:text-emerald-700 underline underline-offset-4 transition-colors"
            >
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;