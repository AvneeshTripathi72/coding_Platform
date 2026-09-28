
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { checkAuth, registerUser } from '../authslice.js';
import { getBackendURL } from '../utils/config.js';

const signupSchema = z.object({
  firstName: z.string().min(3, "Name should contain at least 3 characters"),
  emailId: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must contain at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm Password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

function Signup() {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data) => {
    const { confirmPassword, ...registrationData } = data;
    try {
      await dispatch(registerUser(registrationData));
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
        className="bg-black border border-gray-700 p-6 w-[460px] rounded-2xl shadow-lg text-white"
      >
        <h2 className="text-center text-3xl font-bold mb-5">CodeVerse</h2>

        <label className="text-sm">First Name</label>
        <input
          {...register("firstName")}
          placeholder="John"
          className="w-full bg-black border border-gray-600 rounded-md p-2 mt-1 outline-none"
        />
        {errors.firstName && <p className="text-red-400 text-sm">{errors.firstName.message}</p>}

        <label className="text-sm block mt-3">Email</label>
        <input
          {...register("emailId")}
          placeholder="john@example.com"
          className="w-full bg-black border border-gray-600 rounded-md p-2 mt-1 outline-none"
        />
        {errors.emailId && <p className="text-red-400 text-sm">{errors.emailId.message}</p>}

        <label className="text-sm block mt-3">Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            {...register("password")}
            placeholder="••••••••"
            className="w-full bg-black border border-gray-600 rounded-md p-2 mt-1 pr-10 outline-none"
          />
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </span>
        </div>
        {errors.password && <p className="text-red-400 text-sm">{errors.password.message}</p>}

        <label className="text-sm block mt-3">Confirm Password</label>
        <div className="relative">
          <input
            type={showConfirmPass ? "text" : "password"}
            {...register("confirmPassword")}
            placeholder="••••••••"
            className="w-full bg-black border border-gray-600 rounded-md p-2 mt-1 pr-10 outline-none"
          />
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
            onClick={() => setShowConfirmPass(!showConfirmPass)}
          >
            {showConfirmPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </span>
        </div>
        {errors.confirmPassword && (
          <p className="text-red-400 text-sm">{errors.confirmPassword.message}</p>
        )}

        {error && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black font-semibold hover:opacity-80 transition py-2 mt-5 rounded-md"
        >
          {loading ? "Processing..." : "Sign Up"}
        </button>

        <div className="flex items-center my-3">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="px-2 text-gray-400 text-xs">OR</span>
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

        <p className="text-center text-sm mt-3 text-gray-300">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-400 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;
