
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { registerUser } from '../authslice.js';
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
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = (data) => {
    // Remove confirmPassword before sending to backend
    const { confirmPassword, ...registrationData } = data;
    dispatch(registerUser(registrationData));
  };

  useEffect(() => {
    if (!loading && isAuthenticated) navigate("/");
  }, [isAuthenticated, loading, navigate]);

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

  return (
    <div className="min-h-screen flex justify-center items-center bg-black">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-black border border-gray-700 p-6 w-[460px] rounded-2xl shadow-lg text-white"
      >
        <h2 className="text-center text-3xl font-bold mb-5">Code</h2>

        {}
        <label className="text-sm">First Name</label>
        <input
          {...register("firstName")}
          placeholder="John"
          className="w-full bg-black border border-gray-600 rounded-md p-2 mt-1 outline-none"
        />
        {errors.firstName && <p className="text-red-400 text-sm">{errors.firstName.message}</p>}

        {}
        <label className="text-sm block mt-3">Email</label>
        <input
          {...register("emailId")}
          placeholder="john@example.com"
          className="w-full bg-black border border-gray-600 rounded-md p-2 mt-1 outline-none"
        />
        {errors.emailId && <p className="text-red-400 text-sm">{errors.emailId.message}</p>}

        {}
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

        {}
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

        {/* Display registration error from backend */}
        {error && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black font-semibold hover:opacity-80 transition py-2 mt-5 rounded-md"
        >
          {loading ? "Processing..." : "Sign Up"}
        </button>

        {}
        <div className="flex items-center my-3">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="px-2 text-gray-400 text-xs">OR</span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>

        {}
        <button
          type="button"
          onClick={() => window.location.href = `${getBackendURL()}/auth/google`}
          className="w-full border border-gray-600 flex items-center justify-center gap-2 py-2 rounded-md hover:bg-gray-800 transition"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" />
          Continue with Google
        </button>

        {}
        <button
          type="button"
          onClick={() => window.location.href = `${getBackendURL()}/auth/github`}
          className="w-full border border-gray-600 flex items-center justify-center gap-2 py-2 mt-2 rounded-md hover:bg-gray-800 transition"
        >
          <img src="https://www.svgrepo.com/show/475654/github.svg" className="w-5 h-5 invert" />
          Continue with GitHub
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
