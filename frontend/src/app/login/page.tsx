"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const token = result.data?.token || result.token;
        const userRole = result.data?.role || result.role || result.data?.user?.role;
        
        if (token) {
          sessionStorage.setItem("jwt", token);
          if (userRole) sessionStorage.setItem("role", userRole);
          window.location.href = "/";
        } else {
          setError("Login successful, but no token received.");
        }
      } else {
        setError(result.message || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to the authentication server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      {/* Decorative background blobs */}
      <div className="fixed top-0 left-0 -z-10 w-96 h-96 bg-sage/10 blur-3xl rounded-full -translate-y-1/2 -translate-x-1/2" />
      <div className="fixed bottom-0 right-0 -z-10 w-96 h-96 bg-teal/10 blur-3xl rounded-full translate-y-1/2 translate-x-1/2" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-10 shadow-2xl border-white/40">
          <div className="text-center mb-10">
            <Link href="/" className="inline-flex items-center space-x-2 mb-6 group">
              <div className="w-10 h-10 bg-teal rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <div className="w-5 h-5 bg-cream rounded-full" />
              </div>
              <span className="text-2xl font-bold text-slate">UniPortal</span>
            </Link>
            <h1 className="text-3xl font-extrabold text-slate tracking-tight">Welcome Back</h1>
            <p className="text-slate-light mt-2">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate ml-1" htmlFor="email">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-light group-focus-within:text-teal transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="thaminu@mail.com"
                  className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate/10 rounded-2xl focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none transition-all text-slate"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-semibold text-slate" htmlFor="password">Password</label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-light group-focus-within:text-teal transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate/10 rounded-2xl focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none transition-all text-slate"
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-2 text-red-500 bg-red-50 p-3 rounded-xl text-sm border border-red-100"
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate text-cream py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-slate-light hover:shadow-xl hover:shadow-slate/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>



          <p className="text-center mt-10 text-slate-light text-sm">
            Don't have an account?{" "}
            <Link href="/register" className="text-teal font-bold hover:underline underline-offset-4">
              Register now
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
