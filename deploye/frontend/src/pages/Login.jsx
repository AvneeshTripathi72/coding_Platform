import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { checkAuth, loginUser } from "../authslice.js";
import { getBackendURL } from "../utils/config.js";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    try {
      await dispatch(loginUser(data));
      navigate("/");
    } catch (_) {
      navigate("/");
    }
  };

  // Handle OAuth callback & fallback
  useEffect(() => {
    const token = searchParams.get("token");
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    const provider = searchParams.get("provider");

    if (error || (token && success === "true")) {
      const demoEmail = provider === 'google' 
        ? 'google.guest@codeverse.dev' 
        : provider === 'github' 
        ? 'github.guest@codeverse.dev' 
        : 'guest.coder@codeverse.dev';

      dispatch(loginUser({
        emailId: demoEmail,
        password: 'password123',
      })).then(() => {
        navigate("/", { replace: true });
      });
    }
  }, [searchParams, dispatch, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin"></div>
          <div className="text-white/60 text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  const handleSocialOrGuestLogin = (provider) => {
    const demoEmail = provider === 'Google' 
      ? 'google.guest@codeverse.dev' 
      : provider === 'GitHub' 
      ? 'github.guest@codeverse.dev' 
      : 'guest.coder@codeverse.dev';

    dispatch(loginUser({
      emailId: demoEmail,
      password: 'password123',
    })).then(() => {
      navigate('/');
    });
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-black">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-black border border-gray-700 p-8 w-[380px] rounded-2xl shadow-lg text-white"
      >
        <h2 className="text-center text-3xl font-bold mb-6">Welcome Back</h2>

        <label className="text-sm">Email</label>
        <input
          {...register("emailId", { required: true })}
          placeholder="john@example.com"
          className="w-full bg-black border border-gray-600 rounded-md p-2 mt-1 outline-none"
        />

        <label className="text-sm mt-4 block">Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            {...register("password", { required: true })}
            placeholder="••••••••"
            className="w-full bg-black border border-gray-600 rounded-md p-2 mt-1 pr-10 outline-none"
          />
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black font-semibold hover:opacity-80 transition py-2 mt-6 rounded-md"
        >
          {loading ? "Checking..." : "Login"}
        </button>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="px-3 text-gray-400 text-sm">OR</span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>

        <button
          type="button"
          onClick={() => handleSocialOrGuestLogin('Google')}
          className="group relative w-full border border-gray-600 flex items-center justify-center gap-3 py-3 rounded-md hover:border-gray-500 transition-all duration-300 overflow-hidden bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 hover:from-gray-800 hover:via-gray-700 hover:to-gray-800"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-yellow-600/0 to-green-600/0 group-hover:from-red-600/20 group-hover:via-yellow-600/20 group-hover:to-green-600/20 transition-all duration-500"></div>
          <div className="relative z-10 flex items-center justify-center">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" alt="Google" />
          </div>
          <span className="relative z-10 font-medium text-white group-hover:text-gray-100 transition-colors duration-300">
            Continue with Google
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleSocialOrGuestLogin('GitHub')}
          className="group relative w-full border border-gray-600 flex items-center justify-center gap-3 py-3 mt-3 rounded-md hover:border-gray-500 transition-all duration-300 overflow-hidden bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 hover:from-gray-800 hover:via-gray-700 hover:to-gray-800"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-blue-600/0 to-purple-600/0 group-hover:from-purple-600/20 group-hover:via-blue-600/20 group-hover:to-purple-600/20 transition-all duration-500"></div>
          <div className="relative z-10 flex items-center justify-center">
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </div>
          <span className="relative z-10 font-medium text-white group-hover:text-gray-100 transition-colors duration-300">
            Continue with GitHub
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleSocialOrGuestLogin('Guest')}
          className="w-full mt-3 py-2.5 px-4 rounded-md border border-emerald-500/40 hover:border-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 hover:text-emerald-200 text-sm font-medium transition flex items-center justify-center gap-2"
        >
          <span>⚡</span>
          <span>Explore as Instant Guest</span>
        </button>

        <p className="text-center text-sm mt-4 text-gray-300">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-indigo-400 hover:underline">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
