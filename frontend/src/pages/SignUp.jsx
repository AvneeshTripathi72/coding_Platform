// // import React from 'react';
// // import { useEffect,useState} from 'react';
// // import { useForm } from 'react-hook-form';
// // import { zodResolver } from '@hookform/resolvers/zod'
// // import { z } from 'zod'
// // import { use } from 'react';
// // import { _negative } from 'zod/v4/core';
// // import { useDispatch, useSelector } from 'react-redux';
// // import { useNavigate, Navigate } from 'react-router-dom';
// // import { registerUser } from '../authslice.js';

// // //{
// // //function Signup(){
// // //      const [name,setName] = useState("");
// // //     const [email,setEamil] = useState("");
// // //    const [password,setPassword] = useState("");

// // // const handleSubmit = (e)=> {
// // //         e.preventDefault();
// // //         console.log(name,email,password);
// // //         //validate
// // //         //form submit
// // //         //backend submit
// // //     }
// // // return(
// // //     <>
   
// // //     <form onSubmit={handleSubmit} className="flex flex-col justify-center items-center items-baseline-last border-2 h-100 p-20 m-5 gap-1.5">
// // //     <input type="text" vlaue={name} placeholder='Enter Your name' onChange={(e)=>setName(e.target.value)}/>
// // //      <input type="text" vlaue={email} placeholder='Enter Your email' onChange={(e)=>setEamil(e.target.value)}/>
// // //     <input type="text" vlaue={password} placeholder='Enter Your password' onChange={(e)=>setPassword(e.value)}/>
// // //     <button type="submit">Submit</button>

// // //    </form>
// // //     </>
// // // );
// // // }

// // // const {register,handSubmit,formState : {error},} = useForm();

// // // function signup(){

// // //   return(
// // // <>
// // //     <form onSubmit={handleSubmit((data) => console.log(data))}>
// // //       <input {...register('firstName')} />
// // //       <input {...register('lastName', { required: true })} />
// // //       {errors.lastName && <p>Last name is required.</p>}
// // //       <input {...register('age', { pattern: /\d+/ })} />
// // //       {errors.age && <p>Please enter number for age.</p>}
// // // </>
// // //   );
// // // }

// // //s


















// // //validate a shecma 

// // // const signupSchema  = z.object({
// // //     fisrtName:z.string().min(3,"Name should be contain min 3 char"),
// // //     emailId :z.string().email("Please Enteer the correct Email"),
// // //     password : z.string().min(8,"pass shouble be constains min 7 letter")

// // // })

// // // function Signup() {
// // //   const { register,handleSubmit,formState: { errors },} = useForm({resolver:zodResolver(signupSchema)});
// // // const submitData = (Data)=>{
// // //     console.log(Data);
// // // }
// // //   return (
// // //     <form onSubmit={handleSubmit(submitData)}>
// // //       <input {...register('firstName')} placeholder='Entetr your Name' />
// // //      <input {...register('password')} placeholder='Entetr your p' />
// // //       <input {...register('emailId')} placeholder='Entetr your e' />
// // //       {/* <input {...register('lastName', { required: true })}  placeholder='Entetr your Email' type='password'/>
// // //       {errors.lastName && <p>Last name is required.</p>} */}

// // //       {/* <input {...register('age', { pattern: /\d+/ })} placeholder='Entetr your Age' />
// // //       {errors.age && <p>Please enter number for age.</p>} */}
// // //       <input type="submit" />
// // //         <button
// // //         type="submit"
// // //         className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
// // //       >
// // //         Submit
// // //       </button>
// // //     </form>
// // //   );
// // // }


// // // import React from "react";
// // // import { useForm } from "react-hook-form";
// // // import { z } from "zod";
// // // import { zodResolver } from "@hookform/resolvers/zod";

// // //  const signupSchema = z.object({
// // //   firstName: z.string().min(3, "Name should contain at least 3 characters"),
// // //   emailId: z.string().email("Please enter a valid email address"),
// // //   password: z.string().min(8, "Password must contain at least 8 characters"),
// // // });

// // // function Signup() {
// // //   const { register, handleSubmit, formState: { errors }, } = useForm({ resolver: zodResolver(signupSchema), });
// // //   const submitData = (data) => {
// // //     console.log("✅ Form data:", data);
// // //   };

// // //   return (
// // //     <form
// // //       onSubmit={handleSubmit(submitData)}
// // //       className="flex flex-col gap-4 p-6 border-2 rounded-md max-w-md mx-auto mt-8"
// // //     >
// // //       {/* First Name */}
// // //       <input
// // //         {...register("firstName")}
// // //         placeholder="Enter your name"
// // //         className="border p-2 rounded"
// // //       />
// // //       {errors.firstName && (
// // //         <p className="text-red-500 text-sm">{errors.firstName.message}</p>
// // //       )}

// // //       {/* Email */}
// // //       <input
// // //         {...register("emailId")}
// // //         placeholder="Enter your email"
// // //         className="border p-2 rounded"
// // //       />
// // //       {errors.emailId && (
// // //         <p className="text-red-500 text-sm">{errors.emailId.message}</p>
// // //       )}

// // //       {/* Password */}
// // //       <input
// // //         type="password"
// // //         {...register("password")}
// // //         placeholder="Enter your password"
// // //         className="border p-2 rounded"
// // //       />
// // //       {errors.password && (
// // //         <p className="text-red-500 text-sm">{errors.password.message}</p>
// // //       )}

// // //       <button
// // //         type="submit"
// // //         className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
// // //       >
// // //         Submit
// // //       </button>
// // //     </form>
// // //   );
// // // }














// // const signupSchema  = z.object({
// //     fisrtName:z.string().min(3,"Name should be contain min 3 char"),
// //     emailId :z.string().email("Please Enteer the correct Email"),
// //     password : z.string().min(8,"pass shouble be constains min 7 letter")

// // })

// // function Signup() {

 
// // const dispatch = useDispatch();
// // const navigate = useNavigate();



// //   const { register, handleSubmit, formState: { errors }, } = useForm({ resolver: zodResolver(signupSchema), });
// //   const submitData = (data) => {
// //     console.log("✅ Form data:", data);
// //   };



// // useEffect(() => {
// //   // Any authentication logic can be added here
// //   if(isAuthenticated){
// //     navigate(<Redirect to="/" />);
// //     // Redirect to home or perform other actions
// //   }
// // }, [isAuthenticated, navigate]);

// // const onSubmit = (data) => {

// //   dispatch(registerUser(data));
// // };







// //   return (
// //     <form
// //       onSubmit={handleSubmit(submitData)}
// //       className="flex flex-col gap-4 p-6 border-2 rounded-md max-w-md mx-auto mt-8"
// //     >
// //       {/* First Name */}
// //       <input
// //         {...register("firstName")}
// //         placeholder="Enter your name"
// //         className="border p-2 rounded"
// //       />
// //       {errors.firstName && (
// //         <p className="text-red-500 text-sm">{errors.firstName.message}</p>
// //       )}

// //       {/* Email */}
// //       <input
// //         {...register("emailId")}
// //         placeholder="Enter your email"
// //         className="border p-2 rounded"
// //       />
// //       {errors.emailId && (
// //         <p className="text-red-500 text-sm">{errors.emailId.message}</p>
// //       )}

// //       {/* Password */}
// //       <input
// //         type="password"
// //         {...register("password")}
// //         placeholder="Enter your password"
// //         className="border p-2 rounded"
// //       />
// //       {errors.password && (
// //         <p className="text-red-500 text-sm">{errors.password.message}</p>
// //       )}

// //       <button
// //         type="submit"
// //         className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
// //       >
// //         Submit
// //       </button>
// //     </form>
// //   );
// // }

// // export default Signup;





// import React, { useEffect } from 'react';
// import { useForm } from 'react-hook-form';
// import { z } from 'zod';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { registerUser } from '../authslice.js';

// const signupSchema = z.object({
//   firstName: z.string().min(3, "Name should contain minimum 3 characters"),
//   emailId: z.string().email("Please enter a valid email"),
//   password: z.string().min(8, "Password must contain at least 8 characters"),
// });

// function Signup() {

//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const { isAuthenticated, loading } = useSelector((state) => state.auth);

//   const { register, handleSubmit, formState: { errors } } = useForm({
//     resolver: zodResolver(signupSchema),
//   });

//   const onSubmit = (data) => {
//     dispatch(registerUser(data));
//   };

//   useEffect(() => {
//     if (isAuthenticated) {
//       navigate("/");
//     }
//   }, [isAuthenticated, navigate]);

//   return (
//     <form
//       onSubmit={handleSubmit(onSubmit)}
//       className="flex flex-col gap-4 p-6 border-2 rounded-md max-w-md mx-auto mt-8"
//     >
//       {/* Name */}
//       <input
//         {...register("firstName")}
//         placeholder="Enter your name"
//         className="border p-2 rounded"
//       />
//       {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}

//       {/* Email */}
//       <input
//         {...register("emailId")}
//         placeholder="Enter your email"
//         className="border p-2 rounded"
//       />
//       {errors.emailId && <p className="text-red-500 text-sm">{errors.emailId.message}</p>}

//       {/* Password */}
//       <input
//         type="password"
//         {...register("password")}
//         placeholder="Enter your password"
//         className="border p-2 rounded"
//       />
//       {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

//       <button
//         type="submit"
//         disabled={loading}
//         className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//       >
//         {loading ? "Processing..." : "Submit"}
//       </button>
//     </form>
//   );
// }

// export default Signup;





// import React, { useEffect, useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { z } from 'zod';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate, Link } from 'react-router-dom';
// import { registerUser } from '../authslice.js';
// import { FiEye, FiEyeOff } from "react-icons/fi";

// const signupSchema = z.object({
//   firstName: z.string().min(3, "Name should contain at least 3 characters"),
//   emailId: z.string().email("Please enter a valid email"),
//   password: z.string().min(8, "Password must contain at least 8 characters"),
// });

// function Signup() {

//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { isAuthenticated, loading } = useSelector((state) => state.auth);

//   const [showPassword, setShowPassword] = useState(false);

//   const { register, handleSubmit, formState: { errors } } = useForm({
//     resolver: zodResolver(signupSchema),
//   });

//   const onSubmit = (data) => {
//     dispatch(registerUser(data));
//   };

//   useEffect(() => {
//     if (isAuthenticated) {
//       navigate("/");
//     }
//   }, [isAuthenticated, navigate]);

//   return (
//     <div className="min-h-screen flex justify-center items-center bg-[#1e1f29]">
//       <form
//         onSubmit={handleSubmit(onSubmit)}
//         className="bg-[#2a2d3e] p-8 w-[380px] rounded-2xl shadow-lg text-white"
//       >
//         <h2 className="text-center text-3xl font-bold mb-6">Code</h2>

//         {/* Name */}
//         <div>
//           <label className="text-sm">First Name</label>
//           <input
//             {...register("firstName")}
//             placeholder="John"
//             className="w-full bg-[#1e1f29] border border-gray-600 rounded-md p-2 mt-1 outline-none"
//           />
//           {errors.firstName && (
//             <p className="text-red-400 text-sm">{errors.firstName.message}</p>
//           )}
//         </div>

//         {/* Email */}
//         <div className="mt-4">
//           <label className="text-sm">Email</label>
//           <input
//             {...register("emailId")}
//             placeholder="john@example.com"
//             className="w-full bg-[#1e1f29] border border-gray-600 rounded-md p-2 mt-1 outline-none"
//           />
//           {errors.emailId && (
//             <p className="text-red-400 text-sm">{errors.emailId.message}</p>
//           )}
//         </div>

//         {/* Password */}
//         <div className="mt-4 relative">
//           <label className="text-sm">Password</label>
//           <input
//             type={showPassword ? "text" : "password"}
//             {...register("password")}
//             placeholder="••••••••"
//             className="w-full bg-[#1e1f29] border border-gray-600 rounded-md p-2 mt-1 outline-none pr-10"
//           />
//           <span
//             className="absolute right-3 top-[50%] translate-y-1 cursor-pointer"
//             onClick={() => setShowPassword(!showPassword)}
//           >
//             {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
//           </span>

//           {errors.password && (
//             <p className="text-red-400 text-sm">{errors.password.message}</p>
//           )}
//         </div>

//         {/* Submit Button */}
//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full bg-indigo-500 hover:bg-indigo-600 transition py-2 mt-6 rounded-md font-medium"
//         >
//           {loading ? "Processing..." : "Sign Up"}
//         </button>

//         <p className="text-center text-sm mt-4 text-gray-300">
//           Already have an account?{" "}
//           <Link to="/login" className="text-indigo-400 hover:underline">
//             Login
//           </Link>
//         </p>
//       </form>
//     </div>
//   );
// }

// export default Signup;





// import React, { useEffect, useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { z } from 'zod';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate, Link } from 'react-router-dom';
// import { registerUser } from '../authslice.js';
// import { FiEye, FiEyeOff } from "react-icons/fi";

// const signupSchema = z.object({
//   firstName: z.string().min(3, "Name should contain at least 3 characters"),
//   emailId: z.string().email("Please enter a valid email"),
//   password: z.string().min(8, "Password must contain at least 8 characters"),
//   confirmPassword: z.string().min(8, "Confirm Password is required"),
// }).refine((data) => data.password === data.confirmPassword, {
//   message: "Passwords do not match",
//   path: ["confirmPassword"],
// });

// function Signup() {

//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { isAuthenticated, loading } = useSelector((state) => state.auth);

//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPass, setShowConfirmPass] = useState(false);

//   const { register, handleSubmit, formState: { errors } } = useForm({
//     resolver: zodResolver(signupSchema),
//   });

//   const onSubmit = (data) => {
//     dispatch(registerUser(data));
//   };

//   useEffect(() => {
//     if (isAuthenticated) navigate("/");
//   }, [isAuthenticated, navigate]);

//   return (
//     <div className="min-h-screen flex justify-center items-center bg-black">
//       <form
//         onSubmit={handleSubmit(onSubmit)}
//         className="bg-black border border-gray-700 p-8 w-[380px] rounded-2xl shadow-lg text-white"
//       >
//         <h2 className="text-center text-3xl font-bold mb-6">Code</h2>

//         {/* Name */}
//         <label className="text-sm">First Name</label>
//         <input
//           {...register("firstName")}
//           placeholder="John"
//           className="w-full bg-black border border-gray-600 rounded-md p-2 mt-1 outline-none"
//         />
//         {errors.firstName && <p className="text-red-400 text-sm">{errors.firstName.message}</p>}

//         {/* Email */}
//         <label className="text-sm mt-4 block">Email</label>
//         <input
//           {...register("emailId")}
//           placeholder="john@example.com"
//           className="w-full bg-black border border-gray-600 rounded-md p-2 mt-1 outline-none"
//         />
//         {errors.emailId && <p className="text-red-400 text-sm">{errors.emailId.message}</p>}

//         {/* Password */}
//         <label className="text-sm mt-4 block">Password</label>
//         <div className="relative">
//           <input
//             type={showPassword ? "text" : "password"}
//             {...register("password")}
//             placeholder="••••••••"
//             className="w-full bg-black border border-gray-600 rounded-md p-2 mt-1 pr-10 outline-none"
//           />
//           <span
//          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
//             onClick={() => setShowPassword(!showPassword)}
//           >
//             {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
//           </span>
//         </div>
//         {errors.password && <p className="text-red-400 text-sm">{errors.password.message}</p>}

//         {/* Confirm Password */}
//         <label className="text-sm mt-4 block">Confirm Password</label>
//         <div className="relative">
//           <input
//             type={showConfirmPass ? "text" : "password"}
//             {...register("confirmPassword")}
//             placeholder="••••••••"
//             className="w-full bg-black border border-gray-600 rounded-md p-2 mt-1 pr-10 outline-none"
//           />
//           <span
//             className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
//             onClick={() => setShowConfirmPass(!showConfirmPass)}
//           >
//             {showConfirmPass ? <FiEyeOff size={20} /> : <FiEye size={20} />}
//           </span>
//         </div>
//         {errors.confirmPassword && (
//           <p className="text-red-400 text-sm">{errors.confirmPassword.message}</p>
//         )}

//         {/* Submit Button */}
//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full bg-white text-black font-semibold hover:opacity-80 transition py-2 mt-6 rounded-md"
//         >
//           {loading ? "Processing..." : "Sign Up"}
//         </button>
        
//         {/* Divider */}
//         <div className="flex items-center my-4">
//           <div className="flex-grow border-t border-gray-600"></div>
//           <span className="px-3 text-gray-400 text-sm">OR</span>
//           <div className="flex-grow border-t border-gray-600"></div>
//         </div>

//         {/* Google Login */}
//         <button
//           type="button"
//           onClick={() => window.location.href = "http://localhost:8080/auth/google"}
//           className="w-full border border-gray-600 flex items-center justify-center gap-2 py-2 rounded-md hover:bg-gray-800 transition"
//         >
//           <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" />
//           Continue with Google
//         </button>

//         {/* GitHub Login */}
//         <button
//           type="button"
//           onClick={() => window.location.href = "http://localhost:8080/auth/github"}
//           className="w-full border border-gray-600 flex items-center justify-center gap-2 py-2 mt-3 rounded-md hover:bg-gray-800 transition"
//         >
//           <img src="https://www.svgrepo.com/show/475654/github.svg" className="w-5 h-5 invert" />
//           Continue with GitHub
//         </button>

//         <p className="text-center text-sm mt-4 text-gray-300">
//           Already have an account?{" "}
//           <Link to="/login" className="text-indigo-400 hover:underline">
//             Login
//           </Link>
//         </p>
//       </form>
//     </div>
//   );
// }

// export default Signup;


import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../authslice.js';
import { FiEye, FiEyeOff } from "react-icons/fi";

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
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = (data) => {
    dispatch(registerUser(data));
  };

  useEffect(() => {
    if (!loading && isAuthenticated) navigate("/");
  }, [isAuthenticated, loading, navigate]);

  // Show loading while checking auth (only if not already authenticated)
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

        {/* Name */}
        <label className="text-sm">First Name</label>
        <input
          {...register("firstName")}
          placeholder="John"
          className="w-full bg-black border border-gray-600 rounded-md p-2 mt-1 outline-none"
        />
        {errors.firstName && <p className="text-red-400 text-sm">{errors.firstName.message}</p>}

        {/* Email */}
        <label className="text-sm block mt-3">Email</label>
        <input
          {...register("emailId")}
          placeholder="john@example.com"
          className="w-full bg-black border border-gray-600 rounded-md p-2 mt-1 outline-none"
        />
        {errors.emailId && <p className="text-red-400 text-sm">{errors.emailId.message}</p>}

        {/* Password */}
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

        {/* Confirm Password */}
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black font-semibold hover:opacity-80 transition py-2 mt-5 rounded-md"
        >
          {loading ? "Processing..." : "Sign Up"}
        </button>

        {/* Divider */}
        <div className="flex items-center my-3">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="px-2 text-gray-400 text-xs">OR</span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>

        {/* Google Login */}
        <button
          type="button"
          onClick={() => window.location.href = "http://localhost:8080/auth/google"}
          className="w-full border border-gray-600 flex items-center justify-center gap-2 py-2 rounded-md hover:bg-gray-800 transition"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" />
          Continue with Google
        </button>

        {/* GitHub Login */}
        <button
          type="button"
          onClick={() => window.location.href = "http://localhost:8080/auth/github"}
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
