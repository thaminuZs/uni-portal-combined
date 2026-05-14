"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Lock, UserCircle, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "student">("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(result.message || "Registration failed. Please try again.");
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <div className="glass-card p-10 shadow-2xl border-white/40">
          <div className="text-center mb-10">
            <Link href="/" className="inline-flex items-center space-x-2 mb-6 group">
              <div className="w-10 h-10 bg-teal rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <div className="w-5 h-5 bg-cream rounded-full" />
              </div>
              <span className="text-2xl font-bold text-slate">UniPortal</span>
            </Link>
            <h1 className="text-3xl font-extrabold text-slate tracking-tight">Join UniPortal</h1>
            <p className="text-slate-light mt-2">Create your account to get started</p>
          </div>

          {success ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-sage/10 border border-sage/20 p-8 rounded-3xl text-center"
            >
              <div className="w-16 h-16 bg-sage/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="text-sage w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold text-slate mb-2">Registration Successful!</h2>
              <p className="text-slate-light">Redirecting you to the login page...</p>
            </motion.div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate ml-1" htmlFor="name">Full Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-light group-focus-within:text-teal transition-colors">
                      <User size={18} />
                    </div>
                    <input
                      id="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Thami"
                      className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate/10 rounded-2xl focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none transition-all text-slate"
                    />
                  </div>
                </div>

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
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate ml-1" htmlFor="password">Password</label>
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

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate ml-1">Account Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole("student")}
                    className={`flex items-center justify-center space-x-2 py-3 rounded-2xl border transition-all duration-300 ${
                      role === "student" 
                        ? "bg-teal text-cream border-teal shadow-lg shadow-teal/20" 
                        : "bg-white/50 border-slate/10 text-slate-light hover:bg-white"
                    }`}
                  >
                    <UserCircle size={18} />
                    <span className="font-bold">Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`flex items-center justify-center space-x-2 py-3 rounded-2xl border transition-all duration-300 ${
                      role === "admin" 
                        ? "bg-slate text-cream border-slate shadow-lg shadow-slate/20" 
                        : "bg-white/50 border-slate/10 text-slate-light hover:bg-white"
                    }`}
                  >
                    <Lock size={18} />
                    <span className="font-bold">Admin</span>
                  </button>
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
                className="w-full bg-slate text-cream py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-slate-light hover:shadow-xl hover:shadow-slate/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group mt-4"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          <p className="text-center mt-10 text-slate-light text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-teal font-bold hover:underline underline-offset-4">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
