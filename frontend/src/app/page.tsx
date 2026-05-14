"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Utensils, Library, LogIn, RefreshCcw, LogOut, AlertCircle } from "lucide-react";
import Link from "next/link";
import AdminDashboard from "@/components/AdminDashboard";
import StudentDashboard from "@/components/StudentDashboard";

interface Canteen {
  id: string;
  name: string;
  currentQueue: "low" | "mid" | "high";
  menu: string[];
}

interface Library {
  id: string;
  name: string;
  capacity: number;
  currentOccupancy: number;
  status: "empty" | "moderate" | "full";
}

interface DashboardData {
  lecturersPresent: number;
  crowdedCanteens: number;
  crowdedLibraries: number;
  canteens: Canteen[];
  libraries: Library[];
}

interface ApiResponse {
  success: boolean;
  data: DashboardData;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/dashboard");
      const result: ApiResponse = await response.json();
      if (result.success) {
        setData(result.data);
        setError(null);
      } else {
        setError("Failed to fetch dashboard data");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the server");
      setData({
        lecturersPresent: 3,
        crowdedCanteens: 1,
        crowdedLibraries: 1,
        canteens: [],
        libraries: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem("jwt");
    const storedRole = sessionStorage.getItem("role");

    if (token) {
      setIsAuthenticated(true);
      setRole(storedRole);
    }
    setSessionLoading(false);
    fetchData();
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    setIsAuthenticated(false);
    setRole(null);
    window.location.href = "/";
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-teal/20 border-t-teal rounded-full"
        />
      </div>
    );
  }

  // Admin View
  const isAdmin = isAuthenticated && role?.toLowerCase() === "admin";

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-cream p-6">
        <div className="max-w-7xl mx-auto flex flex-col h-[calc(100vh-3rem)]">
          <header className="flex justify-between items-center mb-8 glass-card px-8 py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-teal rounded-xl flex items-center justify-center shadow-lg shadow-teal/10">
                <div className="w-5 h-5 bg-cream rounded-full" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate leading-tight">Admin Console</h1>
                <p className="text-[10px] uppercase tracking-widest font-bold text-teal">University Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden md:block text-right">
                <p className="text-xs font-bold text-slate-light uppercase">System Status</p>
                <p className="text-sm font-black text-sage flex items-center justify-end space-x-1">
                  <span className="w-2 h-2 bg-sage rounded-full animate-pulse" />
                  <span>Online</span>
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-slate-light hover:text-red-500 transition-all font-bold group"
              >
                <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                <span>Logout</span>
              </button>
            </div>
          </header>
          <div className="flex-1 min-h-0">
            <AdminDashboard />
          </div>
        </div>
      </div>
    );
  }

  // Student View
  const isStudent = isAuthenticated && role?.toLowerCase() === "student";

  if (isStudent) {
    return (
      <div className="min-h-screen bg-cream p-6">
        <div className="max-w-7xl mx-auto flex flex-col h-[calc(100vh-3rem)]">
          <header className="flex justify-between items-center mb-8 glass-card px-8 py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-teal rounded-xl flex items-center justify-center shadow-lg shadow-teal/10">
                <div className="w-5 h-5 bg-cream rounded-full" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate leading-tight">Student Hub</h1>
                <p className="text-[10px] uppercase tracking-widest font-bold text-teal">Campus Life Updates</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden md:block text-right">
                <p className="text-xs font-bold text-slate-light uppercase">Welcome back</p>
                <p className="text-sm font-black text-sage flex items-center justify-end space-x-1">
                  <span>Student</span>
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-slate-light hover:text-red-500 transition-all font-bold group"
              >
                <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                <span>Logout</span>
              </button>
            </div>
          </header>
          <div className="flex-1 min-h-0">
            <StudentDashboard />
          </div>
        </div>
      </div>
    );
  }

  // Standard/Guest View
  return (
    <div className="min-h-screen bg-cream selection:bg-teal/30">
      <nav className="fixed top-0 w-full z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center glass-card px-6 py-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-teal rounded-lg flex items-center justify-center shadow-md">
              <div className="w-4 h-4 bg-cream rounded-full" />
            </div>
            <span className="text-xl font-bold text-slate tracking-tight">UniPortal</span>
          </div>

          {isAuthenticated ? (
            <div className="flex items-center space-x-6">
              <span className="text-sm font-bold text-slate-light hidden sm:inline">
                Welcome back, <span className="text-teal capitalize">{role}</span>
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-slate/5 text-slate px-5 py-2.5 rounded-full font-bold hover:bg-red-50 hover:text-red-500 transition-all active:scale-95"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center space-x-2 bg-slate text-cream px-5 py-2.5 rounded-full font-bold hover:bg-slate-light transition-all duration-300 shadow-lg hover:shadow-slate/20 active:scale-95"
            >
              <LogIn size={18} />
              <span>Login</span>
            </Link>
          )}
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <header className="mb-16 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 bg-teal/10 rounded-full text-teal text-xs font-black uppercase tracking-widest mb-6"
          >
            Live Campus Updates
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-5xl lg:text-7xl font-extrabold text-slate mb-6 leading-tight"
          >
            Stay <span className="text-teal italic">Informed.</span><br />
            Stay <span className="text-sage italic">Connected.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-light max-w-2xl leading-relaxed"
          >
            UniPortal provides real-time visibility into campus life. Check lecturer availability, canteen capacity, and library occupancy in one place.
          </motion.p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-12 h-12 border-4 border-teal/20 border-t-teal rounded-full"
            />
            <p className="text-slate-light font-bold tracking-wide">Syncing data...</p>
          </div>
        ) : error && !data ? (
          <div className="p-10 glass-card border-red-100 bg-red-50/30 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
              <AlertCircle size={32} />
            </div>
            <p className="text-red-600 font-bold mb-6">{error}</p>
            <button
              onClick={fetchData}
              className="bg-teal text-white px-8 py-3 rounded-2xl font-bold hover:bg-teal-dark transition-all shadow-lg shadow-teal/20 active:scale-95"
            >
              Reconnect to Server
            </button>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.2 } }
            }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="glass-card p-10 group hover:scale-[1.02] transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sage/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
              <div className="w-16 h-16 bg-sage/20 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-sage group-hover:text-white transition-all duration-500 text-sage">
                <Users size={32} />
              </div>
              <h3 className="text-slate-light font-bold uppercase tracking-widest text-xs mb-3">Lecturers Today</h3>
              <div className="flex items-baseline space-x-3 mb-8">
                <span className="text-7xl font-black text-sage">{data?.lecturersPresent}</span>
                <span className="text-slate-light font-bold">Present</span>
              </div>
              <div className="w-full bg-slate/5 h-3 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "65%" }}
                  transition={{ delay: 0.5, duration: 1.5, ease: "circOut" }}
                  className="bg-sage h-full"
                />
              </div>
            </motion.div>

            <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="glass-card p-10 group hover:scale-[1.02] transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
              <div className="w-16 h-16 bg-teal/20 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-teal group-hover:text-white transition-all duration-500 text-teal">
                <Utensils size={32} />
              </div>
              <h3 className="text-slate-light font-bold uppercase tracking-widest text-xs mb-3">Crowded Canteens</h3>
              <div className="flex items-baseline space-x-3 mb-8">
                <span className="text-7xl font-black text-teal">{data?.crowdedCanteens}</span>
                <span className="text-slate-light font-bold">Active</span>
              </div>
              <div className="w-full bg-slate/5 h-3 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "35%" }}
                  transition={{ delay: 0.7, duration: 1.5, ease: "circOut" }}
                  className="bg-teal h-full"
                />
              </div>
            </motion.div>

            <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="glass-card p-10 group hover:scale-[1.02] transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
              <div className="w-16 h-16 bg-slate/20 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-slate group-hover:text-white transition-all duration-500 text-slate">
                <Library size={32} />
              </div>
              <h3 className="text-slate-light font-bold uppercase tracking-widest text-xs mb-3">Crowded Libraries</h3>
              <div className="flex items-baseline space-x-3 mb-8">
                <span className="text-7xl font-black text-slate">{data?.crowdedLibraries}</span>
                <span className="text-slate-light font-bold">Full</span>
              </div>
              <div className="w-full bg-slate/5 h-3 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "45%" }}
                  transition={{ delay: 0.9, duration: 1.5, ease: "circOut" }}
                  className="bg-slate h-full"
                />
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Canteen Menus Section */}
        {!loading && data?.canteens && data.canteens.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-24"
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-teal/10 rounded-2xl flex items-center justify-center text-teal">
                  <Utensils size={24} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate">Live Canteen Menus</h2>
                  <p className="text-slate-light font-bold text-sm uppercase tracking-widest">Available Foods & Traffic</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.canteens.map((canteen, idx) => (
                <motion.div
                  key={canteen.id || idx}
                  whileHover={{ y: -5 }}
                  className="glass-card p-6 border-slate/5 hover:border-teal/20 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-bold text-slate">{canteen.name}</h3>
                    <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      canteen.currentQueue === "high" ? "bg-red-100 text-red-500" : 
                      canteen.currentQueue === "mid" ? "bg-orange-100 text-orange-500" : "bg-sage/20 text-sage"
                    }`}>
                      {canteen.currentQueue === "mid" ? "Moderate" : canteen.currentQueue} Traffic
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <p className="text-[10px] font-black text-slate-light uppercase tracking-[0.2em] mb-3">Today's Menu</p>
                    <div className="grid grid-cols-2 gap-2">
                      {canteen.menu && canteen.menu.length > 0 ? (
                        canteen.menu.map((food, i) => (
                          <div key={i} className="flex items-center space-x-2 bg-slate/5 px-3 py-2 rounded-xl">
                            <div className="w-1.5 h-1.5 bg-teal rounded-full" />
                            <span className="text-xs font-bold text-slate truncate">{food}</span>
                          </div>
                        ))
                      ) : (
                        <p className="col-span-2 text-xs text-slate-light/60 font-medium italic py-2">No items listed for today</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate/5 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-slate-light">
                      <RefreshCcw size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Live Status</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Library Occupancy Section */}
        {!loading && data?.libraries && data.libraries.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-24"
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-slate/10 rounded-2xl flex items-center justify-center text-slate">
                  <Library size={24} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate">Library Occupancy</h2>
                  <p className="text-slate-light font-bold text-sm uppercase tracking-widest">Real-time Seat Availability</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.libraries.map((library, idx) => (
                <motion.div
                  key={library.id || idx}
                  whileHover={{ y: -5 }}
                  className="glass-card p-6 border-slate/5 hover:border-slate/20 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-bold text-slate">{library.name}</h3>
                    <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      library.status === "full" ? "bg-red-100 text-red-500" : 
                      library.status === "moderate" ? "bg-orange-100 text-orange-500" : "bg-sage/20 text-sage"
                    }`}>
                      {library.status}
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-end">
                      <p className="text-[10px] font-black text-slate-light uppercase tracking-[0.2em]">Live Occupancy</p>
                      <p className="text-sm font-black text-slate">{library.currentOccupancy} / {library.capacity}</p>
                    </div>
                    <div className="w-full bg-slate/5 h-2 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(library.currentOccupancy / library.capacity) * 100}%` }}
                        className={`h-full ${
                          library.status === "full" ? "bg-red-500" : 
                          library.status === "moderate" ? "bg-orange-400" : "bg-sage"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate/5 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-light uppercase tracking-wider">
                      {library.capacity - library.currentOccupancy} Seats Available
                    </span>
                    <div className="flex items-center space-x-1.5 text-slate-light">
                      <RefreshCcw size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Live</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </main>

      <footer className="py-12 text-center text-slate-light/40 font-bold text-xs uppercase tracking-[0.2em]">
        © 2026 UniPortal Management Systems
      </footer>

      <div className="fixed bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-sage/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
      <div className="fixed top-0 right-0 -z-10 w-[600px] h-[600px] bg-teal/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
    </div>
  );
}
