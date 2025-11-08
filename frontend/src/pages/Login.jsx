import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../authslice.js";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => {
    dispatch(loginUser(data));
  };

  useEffect(() => {
    if (!loading && isAuthenticated) navigate("/");
  }, [isAuthenticated, loading, navigate]);

  // Show loading while checking auth
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
          onClick={() => window.location.href = "http://localhost:8080/auth/google"}
          className="w-full border border-gray-600 flex items-center justify-center gap-2 py-2 rounded-md hover:bg-gray-800 transition"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" />
          Continue with Google
        </button>

        <button
          type="button"
          onClick={() => window.location.href = "http://localhost:8080/auth/github"}
          className="w-full border border-gray-600 flex items-center justify-center gap-2 py-2 mt-3 rounded-md hover:bg-gray-800 transition"
        >
          <img src="https://www.svgrepo.com/show/475654/github.svg" className="w-5 h-5 invert" />
          Continue with GitHub
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
