import React, { useEffect } from 'react'
import {useState} from 'react'
import SoftBackdrop from './SoftBackdrop'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const [state, setState] = useState<"login" | "register" | "forgot" | "reset">("login")
  const {user, login, signUp} = useAuth()

  const navigate = useNavigate()

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        resetToken: '',
        newPassword: ''
    })

    const [passwordChecks, setPasswordChecks] = useState({
        length: false,
        lowercase: false,
        uppercase: false,
        symbol: false,
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (name === "password") {
            setPasswordChecks({
            length: value.length >= 8,
            lowercase: /[a-z]/.test(value),
            uppercase: /[A-Z]/.test(value),
            symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value),
        })
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert("Please enter a valid email address");
            return;
        }

        if (state === "login") {
            login(formData);
        } 
        else if (state === "register") {
            if (!isPasswordStrong) return;
            signUp(formData);
        } 
        else if (state === "forgot") {
            try {
            const res = await fetch(`${API_URL}/api/auth/forgot-password`, { // ← change port if needed
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email }),
                credentials: "include"
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message);
                return;
            }

            // Show token for demo purpose
            alert(`Your Reset Token is:\n\n${data.resetToken}\n\nCopy this token and paste it in the next step.`);
            
            setFormData(prev => ({ ...prev, resetToken: data.resetToken }));
            setState("reset");

            } catch (error) {
            console.log(error);
            alert("Something went wrong");
            }
        } 
        else if (state === "reset") {
            try {
            const res = await fetch(`${API_URL}/api/auth/reset-password`, { // ← change port if needed
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                email: formData.email,
                resetToken: formData.resetToken,
                newPassword: formData.newPassword
                }),
                credentials: "include"
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message);
                return;
            }

            alert("Password reset successfully! Please login with your new password.");
            setState("login");
            setFormData({
                name: '',
                email: '',
                password: '',
                resetToken: '',
                newPassword: ''
            });

            } catch (error: any) {
            console.log(error);
            alert(error?.response?.data?.message || error.message || "Something went wrong");
            }
        }
    };

    useEffect(()=>{
        if(user){
            navigate('/')
        }
    },[user])

    const isPasswordStrong = Object.values(passwordChecks).every(Boolean)
  return (
    <>
    <SoftBackdrop />
    <div className='min-h-screen flex items-center justify-center'>
      <form
        onSubmit={handleSubmit}
        className="w-full sm:w-87.5 text-center bg-white/6 border border-white/10 rounded-2xl px-8"
    >
        {/* Title */}
        <h1 className="text-white text-3xl mt-10 font-medium">
            {state === "login" && "Login"}
            {state === "register" && "Sign up"}
            {state === "forgot" && "Forgot Password"}
            {state === "reset" && "Reset Password"}
        </h1>

        <p className="text-gray-400 text-sm mt-2">
            {state === "login" && "Please sign in to continue"}
            {state === "register" && "Create a new account"}
            {state === "forgot" && "Enter your email to get reset token"}
            {state === "reset" && "Enter token and new password"}
        </p>

        {/* ==================== LOGIN & REGISTER FORM ==================== */}
        {(state === "login" || state === "register") && (
            <>
            {state === "register" && (
                <div className="flex items-center mt-6 w-full bg-white/5 ring-2 ring-white/10 focus-within:ring-pink-500/60 h-12 rounded-full overflow-hidden pl-6 gap-2 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-white/60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="5" />
                    <path d="M20 21a8 8 0 0 0-16 0" />
                </svg>
                <input type="text" name="name" placeholder="Name" className="w-full bg-transparent text-white placeholder-white/60 border-none outline-none" value={formData.name} onChange={handleChange} required />
                </div>
            )}

            <div className="flex items-center w-full mt-4 bg-white/5 ring-2 ring-white/10 focus-within:ring-pink-500/60 h-12 rounded-full overflow-hidden pl-6 gap-2 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-white/75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
                <rect x="2" y="4" width="20" height="16" rx="2" />
                </svg>
                <input type="email" name="email" placeholder="Email id" className="w-full bg-transparent text-white placeholder-white/60 border-none outline-none" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="flex items-center mt-4 w-full bg-white/5 ring-2 ring-white/10 focus-within:ring-pink-500/60 h-12 rounded-full overflow-hidden pl-6 gap-2 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-white/75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input type="password" name="password" placeholder="Password" className="w-full bg-transparent text-white placeholder-white/60 border-none outline-none" value={formData.password} onChange={handleChange} required />
            </div>

            {/* Password Strength Criteria */}
            {state === "register" && (
                <div className="mt-3 text-left text-xs space-y-1 px-2">
                <p className={passwordChecks.length ? "text-green-400" : "text-red-400"}>
                    {passwordChecks.length ? "✓" : "✗"} At least 8 characters
                </p>
                <p className={passwordChecks.lowercase ? "text-green-400" : "text-red-400"}>
                    {passwordChecks.lowercase ? "✓" : "✗"} One lowercase letter
                </p>
                <p className={passwordChecks.uppercase ? "text-green-400" : "text-red-400"}>
                    {passwordChecks.uppercase ? "✓" : "✗"} One uppercase letter
                </p>
                <p className={passwordChecks.symbol ? "text-green-400" : "text-red-400"}>
                    {passwordChecks.symbol ? "✓" : "✗"} One symbol (!@#$%^&* etc.)
                </p>
                </div>
            )}

            {state === "login" && (
                <div className="mt-4 text-left">
                <button type="button" onClick={() => setState("forgot")} className="text-sm text-pink-400 hover:underline">
                    Forgot password?
                </button>
                </div>
            )}

            <button
                type="submit"
                disabled={state === "register" && !isPasswordStrong}
                className={`mt-2 w-full h-11 rounded-full text-white transition ${
                state === "register" && !isPasswordStrong
                    ? "bg-pink-600/40 cursor-not-allowed"
                    : "bg-pink-600 hover:bg-pink-500"
                }`}
            >
                {state === "login" ? "Login" : "Sign up"}
            </button>

            <p
                onClick={() => setState(state === "login" ? "register" : "login")}
                className="text-gray-400 text-sm mt-3 mb-11 cursor-pointer"
            >
                {state === "login" ? "Don't have an account?" : "Already have an account?"}
                <span className="text-pink-400 hover:underline ml-1">click here</span>
            </p>
            </>
        )}

        {/* ==================== FORGOT PASSWORD FORM ==================== */}
        {state === "forgot" && (
            <>
            <div className="flex items-center w-full mt-6 bg-white/5 ring-2 ring-white/10 focus-within:ring-pink-500/60 h-12 rounded-full overflow-hidden pl-6 gap-2 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-white/75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
                <rect x="2" y="4" width="20" height="16" rx="2" />
                </svg>
                <input
                type="email"
                name="email"
                placeholder="Email id"
                className="w-full bg-transparent text-white placeholder-white/60 border-none outline-none"
                value={formData.email}
                onChange={handleChange}
                required
                />
            </div>

            <button type="submit" className="mt-6 w-full h-11 rounded-full text-white bg-pink-600 hover:bg-pink-500 transition">
                Get Reset Token
            </button>

            <p onClick={() => setState("login")} className="text-gray-400 text-sm mt-4 mb-11 cursor-pointer">
                Back to <span className="text-pink-400 hover:underline">Login</span>
            </p>
            </>
        )}

        {/* ==================== RESET PASSWORD FORM ==================== */}
        {state === "reset" && (
        <>
            <div className="flex items-center w-full mt-6 bg-white/5 ring-2 ring-white/10 focus-within:ring-pink-500/60 h-12 rounded-full overflow-hidden pl-6 gap-2 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-white/75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
                <rect x="2" y="4" width="20" height="16" rx="2" />
            </svg>
            <input type="email" name="email" placeholder="Email id" className="w-full bg-transparent text-white placeholder-white/60 border-none outline-none" value={formData.email} onChange={handleChange} required/>
            </div>

            <div className="flex items-center w-full mt-4 bg-white/5 ring-2 ring-white/10 focus-within:ring-pink-500/60 h-12 rounded-full overflow-hidden pl-6 gap-2 transition-all">
            <input type="text" name="resetToken" placeholder="Reset Token" className="w-full bg-transparent text-white placeholder-white/60 border-none outline-none pl-6" value={formData.resetToken} onChange={handleChange} required/>
            </div>

            <div className="flex items-center mt-4 w-full bg-white/5 ring-2 ring-white/10 focus-within:ring-pink-500/60 h-12 rounded-full overflow-hidden pl-6 gap-2 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-white/75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input type="password" name="newPassword" placeholder="New Password" className="w-full bg-transparent text-white placeholder-white/60 border-none outline-none" value={formData.newPassword} onChange={handleChange} required/>
            </div>

            <button type="submit" className="mt-6 w-full h-11 rounded-full text-white bg-pink-600 hover:bg-pink-500 transition">
            Reset Password
            </button>

            <p onClick={() => setState("login")} className="text-gray-400 text-sm mt-4 mb-11 cursor-pointer">
            Back to <span className="text-pink-400 hover:underline">Login</span>
            </p>
        </>
        )}
        </form>
    </div>
    </>
  )
}

export default Login