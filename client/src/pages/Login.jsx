import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { FaArrowRightLong } from "react-icons/fa6";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, setIsAuthenticated } = useAuth();

  //redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      
      await login(username, password);
      setIsAuthenticated(true);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
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

      {/* Right Side - Login Form */}
      <div className="w-full md:w-1/2 flex-1 flex items-center justify-center p-4 sm:p-6 md:p-12">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 sm:p-8 md:p-10 lg:p-12 transition-all duration-300 hover:shadow-xl mx-auto">
          <div className="mb-6 md:mb-8 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-900 mb-2">
              Login
            </h2>
            <p className="text-sm md:text-base text-emerald-800">Please enter your credentials</p>
          </div>

          <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
            {/* Username Field */}
            <div className="relative group">
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 md:py-3 rounded-lg border border-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all peer bg-transparent text-emerald-950 placeholder-transparent text-sm md:text-base"
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
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 md:py-3 rounded-lg border border-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all peer bg-transparent text-emerald-950 placeholder-transparent text-sm md:text-base"
              />
              <label 
                htmlFor="password"
                className="absolute left-4 -top-2.5 px-1 bg-white text-xs md:text-sm text-teal-600 peer-placeholder-shown:text-sm peer-placeholder-shown:md:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:md:text-sm peer-focus:text-teal-600 transition-all"
              >
                Password
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
              disabled={isLoading}
              className={`w-full p-3 md:p-4 ${
                isLoading ? "bg-teal-400 cursor-not-allowed" : "bg-teal-500 hover:bg-teal-600"
              } text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 md:gap-3 shadow-lg hover:shadow-teal-200/50 text-sm md:text-base`}
            >
              <span>{isLoading ? "Processing..." : "Login"}</span>
              {!isLoading && (
                <FaArrowRightLong className="mt-0.5 transition-transform group-hover:translate-x-1" />
              )}
            </button>
          </form>

          {/* Register Link */}
          <p className="mt-6 md:mt-8 text-center text-gray-600 text-sm md:text-base">
            Don't have an account?{" "}
            <a 
              href="/register" 
              className="font-semibold text-emerald-600 hover:text-emerald-700 underline underline-offset-4 transition-colors"
            >
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;