"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Utensils,
  Library,
  Search,
  Calendar,
  X,
  Coffee,
  BarChart3,
  Zap
} from "lucide-react";

interface Lecturer {
  id: string;
  name: string;
  department: string;
  email: string;
  lastSeen: string;
}

interface AttendanceLog {
  date: string;
  status: string;
}

interface Canteen {
  id: string;
  name: string;
  currentQueue: "low" | "mid" | "high";
  menu?: string[];
}

interface CanteenLog {
  timeStamp: string;
  level: "low" | "mid" | "high";
}

interface Library {
  id: string;
  name: string;
  capacity: number;
  currentOccupancy: number;
  status: "empty" | "moderate" | "full";
  updatedAt: string;
}

interface LibraryLog {
  timeStamp: string;
  occupancy: number;
}

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState<"lecturers" | "canteens" | "libraries">("lecturers");
  const [loading, setLoading] = useState(true);

  // Lecturer States
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [selectedLecturer, setSelectedLecturer] = useState<Lecturer | null>(null);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);

  // Canteen States
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [selectedCanteen, setSelectedCanteen] = useState<Canteen | null>(null);
  const [canteenLogs, setCanteenLogs] = useState<CanteenLog[]>([]);
  const [menuInput, setMenuInput] = useState<string[]>(["", "", "", "", "", ""]);

  // Library States
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [selectedLibrary, setSelectedLibrary] = useState<Library | null>(null);
  const [libraryLogs, setLibraryLogs] = useState<LibraryLog[]>([]);

  const occupancyFlushRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (occupancyFlushRef.current) clearTimeout(occupancyFlushRef.current);
    };
  }, []);

  useEffect(() => {
    if (activeTab === "lecturers") fetchLecturers();
    if (activeTab === "canteens") fetchCanteens();
    if (activeTab === "libraries") fetchLibraries();
  }, [activeTab]);

  useEffect(() => {
    if (selectedCanteen) {
      const menu = [...(selectedCanteen.menu ?? [])];
      while (menu.length < 6) menu.push("");
      setMenuInput(menu.slice(0, 6));
    }
  }, [selectedCanteen]);

  const fetchLecturers = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("jwt");
      const response = await fetch("http://localhost:8080/api/lecturers", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await response.json();
      const data = result.data || result;
      const normalized = Array.isArray(data) ? data : [];
      setLecturers(normalized.map((l: any) => ({ ...l, id: l.id || l._id })));
    } catch (err) {
      console.error("Failed to fetch lecturers", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async (id: string) => {
    try {
      const token = sessionStorage.getItem("jwt");
      const response = await fetch(`http://localhost:8080/api/lecturers/${id}/attendance`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await response.json();
      setAttendanceLogs(result.data || result || []);
    } catch (err) {
      console.error("Failed to fetch attendance", err);
    }
  };

  const fetchCanteens = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("jwt");
      const response = await fetch("http://localhost:8080/api/canteens", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await response.json();
      const data = result.data || result || [];
      const normalized = Array.isArray(data) ? data : [];
      setCanteens(normalized.map((c: any) => ({ ...c, id: c.id || c._id })));
    } catch (err) {
      console.error("Failed to fetch canteens", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCanteenLogs = async (id: string) => {
    try {
      const token = sessionStorage.getItem("jwt");
      const response = await fetch(`http://localhost:8080/api/canteens/${id}/queue/logs`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await response.json();
      setCanteenLogs(result.data || result || []);
    } catch (err) {
      console.error("Failed to fetch canteen logs", err);
    }
  };

  const fetchLibraries = async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    try {
      const token = sessionStorage.getItem("jwt");
      const response = await fetch("http://localhost:8080/api/libraries", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("API did not return JSON");
      }
      const result = await response.json();
      const raw = result.data ?? result;
      const data = Array.isArray(raw) ? raw : [];
      setLibraries(
        data.map((l: Record<string, unknown> & { id?: string; _id?: string }) => ({
          ...l,
          id: l.id || l._id
        })) as Library[]
      );
    } catch (err) {
      console.error("Failed to fetch libraries", err);
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  };

  const fetchLibraryLogs = async (id: string) => {
    try {
      const token = sessionStorage.getItem("jwt");
      const response = await fetch(`http://localhost:8080/api/libraries/${id}/occupancy/logs`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await response.json();
      const logs = result.data || result || [];
      const sorted = Array.isArray(logs) ? [...logs].sort((a, b) => new Date(a.timeStamp).getTime() - new Date(b.timeStamp).getTime()) : [];
      setLibraryLogs(sorted);
    } catch (err) {
      console.error("Failed to fetch library logs", err);
    }
  };

  const handleUpdateQueue = async (id: string, level: "low" | "mid" | "high") => {
    try {
      const token = sessionStorage.getItem("jwt");
      const response = await fetch(`http://localhost:8080/api/canteens/${id}/queue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ level })
      });
      if (response.ok) {
        fetchCanteens();
        fetchCanteenLogs(id);
        if (selectedCanteen?.id === id) {
          setSelectedCanteen({ ...selectedCanteen, currentQueue: level });
        }
      }
    } catch (err) {
      console.error("Failed to report queue status", err);
    }
  };

  const handleUpdateMenu = async (id: string, menuArray: string[]) => {
    try {
      const token = sessionStorage.getItem("jwt");
      const response = await fetch(`http://localhost:8080/api/canteens/${id}/menu`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ menu: menuArray.filter(item => item.trim() !== "") })
      });
      if (response.ok) {
        fetchCanteens();
        if (selectedCanteen?.id === id) {
          const updated = await response.json();
          const menu = (updated.data || updated).menu;
          setSelectedCanteen({ ...selectedCanteen, menu: Array.isArray(menu) ? menu : [] });
        }
      }
    } catch (err) {
      console.error("Failed to update menu", err);
    }
  };

  const libraryStatusFromCount = (count: number, capacity: number): Library["status"] => {
    const cap = Math.max(capacity, 1);
    const pct = count / cap;
    if (pct === 0) return "empty";
    if (pct > 0.85) return "full";
    return "moderate";
  };

  const postLibraryOccupancy = async (id: string, count: number) => {
    try {
      const token = sessionStorage.getItem("jwt");
      const response = await fetch(`http://localhost:8080/api/libraries/${id}/occupancy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ count })
      });
      if (response.ok) {
        void fetchLibraries({ silent: true });
        void fetchLibraryLogs(id);
      }
    } catch (err) {
      console.error("Failed to report occupancy", err);
    }
  };

  const scheduleLibraryOccupancyUpdate = (id: string, count: number, capacity: number) => {
    const maxSeats = Math.max(capacity, 0);
    const clamped = Math.max(0, Math.min(Number.isFinite(count) ? count : 0, maxSeats));

    setLibraries((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, currentOccupancy: clamped, status: libraryStatusFromCount(clamped, capacity) } : l
      )
    );
    setSelectedLibrary((prev) =>
      prev && prev.id === id
        ? { ...prev, currentOccupancy: clamped, status: libraryStatusFromCount(clamped, capacity) }
        : prev
    );

    if (occupancyFlushRef.current) clearTimeout(occupancyFlushRef.current);
    occupancyFlushRef.current = setTimeout(() => {
      occupancyFlushRef.current = null;
      void postLibraryOccupancy(id, clamped);
    }, 450);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Student Navbar */}
      <nav className="mb-8">
        <div className="flex space-x-2 bg-teal/10 p-1.5 rounded-2xl w-fit ring-1 ring-teal/15">
          <button
            onClick={() => setActiveTab("lecturers")}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl transition-all duration-300 font-semibold ${activeTab === "lecturers"
                ? "bg-white text-teal shadow-sm"
                : "text-slate-light hover:text-slate hover:bg-white/50"
              }`}
          >
            <Users size={18} />
            <span>Lecturers</span>
          </button>
          <button
            onClick={() => setActiveTab("canteens")}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl transition-all duration-300 font-semibold ${activeTab === "canteens"
                ? "bg-white text-teal shadow-sm"
                : "text-slate-light hover:text-slate hover:bg-white/50"
              }`}
          >
            <Utensils size={18} />
            <span>Canteens</span>
          </button>
          <button
            onClick={() => setActiveTab("libraries")}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl transition-all duration-300 font-semibold ${activeTab === "libraries"
                ? "bg-white text-teal shadow-sm"
                : "text-slate-light hover:text-slate hover:bg-white/50"
              }`}
          >
            <Library size={18} />
            <span>Libraries</span>
          </button>
        </div>
      </nav>

      <div className="flex-1 min-h-0">
        {/* Lecturers Tab */}
        {activeTab === "lecturers" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
            <div className={`lg:col-span-4 flex flex-col space-y-4 ${selectedLecturer ? 'hidden lg:flex' : 'flex'}`}>
              <h2 className="text-2xl font-bold text-slate mb-2">Faculty</h2>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-light" size={18} />
                <input
                  type="text"
                  placeholder="Search faculty..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate/10 rounded-xl focus:ring-2 focus:ring-teal/20 outline-none transition-all"
                />
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {lecturers.map((lecturer) => (
                  <motion.div
                    key={lecturer.id}
                    whileHover={{ x: 4 }}
                    onClick={() => {
                      setSelectedLecturer(lecturer);
                      fetchAttendance(lecturer.id);
                    }}
                    className={`p-4 rounded-2xl cursor-pointer border transition-all duration-300 ${selectedLecturer?.id === lecturer.id
                        ? "bg-teal/5 border-teal/30 shadow-md"
                        : "bg-white border-slate/5 hover:border-slate/20"
                      }`}
                  >
                    <h4 className="font-bold text-slate">{lecturer.name}</h4>
                    <p className="text-xs text-slate-light font-medium uppercase tracking-wider">{lecturer.department}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className={`lg:col-span-8 ${selectedLecturer ? 'flex' : 'hidden lg:flex'} flex-col`}>
              {selectedLecturer ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 h-full flex flex-col overflow-y-auto">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-sage/20 rounded-2xl flex items-center justify-center text-sage text-2xl font-bold">
                        {selectedLecturer.name.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-slate">{selectedLecturer.name}</h2>
                        <p className="text-slate-light text-sm font-bold uppercase tracking-widest">{selectedLecturer.department}</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedLecturer(null)} className="lg:hidden p-2 text-slate-light"><X size={20} /></button>
                  </div>

                  <div className="bg-white/50 p-6 rounded-3xl border border-slate/5 mb-8">
                    <h3 className="text-sm font-black text-slate-light uppercase tracking-widest mb-4">Availability</h3>
                    <div className="flex items-center space-x-3">
                       <div className={`w-3 h-3 rounded-full animate-pulse ${selectedLecturer.lastSeen === new Date().toISOString().split('T')[0] ? "bg-sage" : "bg-slate/30"}`} />
                       <span className="font-bold text-slate">
                         {selectedLecturer.lastSeen === new Date().toISOString().split('T')[0] ? "Available Today" : `Last seen on ${selectedLecturer.lastSeen}`}
                       </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate mb-6 flex items-center space-x-2">
                    <Calendar size={20} className="text-teal" />
                    <span>Attendance History</span>
                  </h3>
                  <div className="grid grid-cols-7 gap-3">
                    {attendanceLogs.map((log, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div className={`w-full aspect-square rounded-lg mb-1 ${log.status === "present" ? "bg-sage" : "bg-slate/10"}`} title={log.date} />
                        <span className="text-[8px] font-bold text-slate-light uppercase">{formatDate(log.date)}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="flex-1 glass-card flex flex-col items-center justify-center text-center p-12 border-dashed border-2">
                  <Users size={48} className="text-slate-light/20 mb-4" />
                  <h3 className="text-xl font-bold text-slate">Select a Lecturer</h3>
                  <p className="text-slate-light text-sm">Choose a faculty member to view their schedule and availability.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Canteens Tab */}
        {activeTab === "canteens" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
            <div className={`lg:col-span-4 flex flex-col space-y-4 ${selectedCanteen ? 'hidden lg:flex' : 'flex'}`}>
              <h2 className="text-2xl font-bold text-slate">Canteens</h2>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {canteens.map((canteen) => (
                  <motion.div
                    key={canteen.id}
                    whileHover={{ x: 4 }}
                    onClick={() => {
                      setSelectedCanteen(canteen);
                      fetchCanteenLogs(canteen.id);
                    }}
                    className={`p-4 rounded-2xl cursor-pointer border transition-all duration-300 ${selectedCanteen?.id === canteen.id
                        ? "bg-teal/5 border-teal/30 shadow-md"
                        : "bg-white border-slate/5 hover:border-slate/20"
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-slate">{canteen.name}</h4>
                      <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                        canteen.currentQueue === "high" ? "bg-red-100 text-red-500" : 
                        canteen.currentQueue === "mid" ? "bg-orange-100 text-orange-500" : "bg-sage/20 text-sage"
                      }`}>
                        {canteen.currentQueue === "mid" ? "moderate" : canteen.currentQueue}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className={`lg:col-span-8 ${selectedCanteen ? 'flex' : 'hidden lg:flex'} flex-col`}>
              {selectedCanteen ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 h-full flex flex-col overflow-y-auto">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-teal/10 rounded-2xl flex items-center justify-center text-teal"><Coffee size={32} /></div>
                      <h2 className="text-3xl font-black text-slate">{selectedCanteen.name}</h2>
                    </div>
                    <button onClick={() => setSelectedCanteen(null)} className="lg:hidden p-2 text-slate-light"><X size={20} /></button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white/50 p-6 rounded-3xl border border-slate/5">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-black text-slate-light uppercase tracking-widest">Report Traffic</h3>
                        <Zap size={16} className="text-teal animate-pulse" />
                      </div>
                      <p className="text-xs text-slate-light mb-4 font-medium">Is the queue long? Help other students by reporting the current status!</p>
                      <div className="flex space-x-2">
                        {(["low", "mid", "high"] as const).map(lvl => (
                          <button
                            key={lvl}
                            onClick={() => handleUpdateQueue(selectedCanteen.id, lvl)}
                            className={`flex-1 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${
                              selectedCanteen.currentQueue === lvl
                                ? lvl === "high" ? "bg-red-500 text-white shadow-lg shadow-red-100" : lvl === "mid" ? "bg-orange-400 text-white shadow-lg shadow-orange-100" : "bg-sage text-white shadow-lg shadow-sage-100"
                                : "bg-white text-slate-light border border-slate/5 hover:bg-slate/5"
                            }`}
                          >
                            {lvl === "mid" ? "Moderate" : lvl}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white/50 p-6 rounded-3xl border border-slate/5">
                      <h3 className="text-sm font-black text-slate-light uppercase tracking-widest mb-4">Daily Menu</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(selectedCanteen.menu ?? []).map((food, i) => (
                          <span key={i} className="px-3 py-1 bg-teal/10 text-teal text-[10px] font-bold rounded-full uppercase">{food}</span>
                        ))}
                      </div>
                      <p className="text-xs font-bold text-slate uppercase tracking-widest mb-3">Update food items</p>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {menuInput.map((item, idx) => (
                          <input
                            key={idx}
                            value={item}
                            onChange={(e) => {
                              const newMenu = [...menuInput];
                              newMenu[idx] = e.target.value;
                              setMenuInput(newMenu);
                            }}
                            placeholder={`Item ${idx + 1}`}
                            className="bg-white border border-slate/15 rounded-lg px-2.5 py-2 text-sm text-slate placeholder:text-slate-light/80 outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUpdateMenu(selectedCanteen.id, menuInput)}
                        className="w-full bg-teal text-cream py-2.5 rounded-xl text-sm font-bold hover:bg-teal-dark transition-all shadow-md shadow-teal/25"
                      >
                        Update menu
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate mb-6 flex items-center space-x-2">
                    <BarChart3 size={20} className="text-teal" />
                    <span>Recent Traffic Logs</span>
                  </h3>
                  <div className="flex-1 bg-white/80 rounded-3xl p-6 border border-teal/15 shadow-inner shadow-teal/5">
                    <div className="flex space-x-4 overflow-x-auto pb-4 custom-scrollbar">
                      {canteenLogs.map((log, i) => (
                        <div key={i} className="shrink-0 w-24 bg-white/50 rounded-2xl p-4 text-center border border-slate/5">
                          <span className={`text-[10px] font-black uppercase ${log.level === "high" ? "text-red-500" : log.level === "mid" ? "text-orange-500" : "text-sage"}`}>
                            {log.level === "mid" ? "moderate" : log.level}
                          </span>
                          <p className="text-[8px] font-bold text-slate-light mt-1">
                            {(() => {
                              const d = new Date(log.timeStamp);
                              return Number.isNaN(d.getTime()) ? "—" : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                            })()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex-1 glass-card flex flex-col items-center justify-center text-center p-12 border-dashed border-2">
                  <Coffee size={48} className="text-slate-light/20 mb-4" />
                  <h3 className="text-xl font-bold text-slate">Select a Canteen</h3>
                  <p className="text-slate-light text-sm">Check what's cooking and avoid the rush by viewing real-time traffic levels.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Libraries Tab */}
        {activeTab === "libraries" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
            <div className={`lg:col-span-4 flex flex-col space-y-4 ${selectedLibrary ? 'hidden lg:flex' : 'flex'}`}>
              <h2 className="text-2xl font-bold text-slate">Study Spaces</h2>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {libraries.map((library) => (
                  <motion.div
                    key={library.id}
                    whileHover={{ x: 4 }}
                    onClick={() => {
                      setSelectedLibrary(library);
                      fetchLibraryLogs(library.id);
                    }}
                    className={`p-4 rounded-2xl cursor-pointer border transition-all duration-300 ${selectedLibrary?.id === library.id
                        ? "bg-teal/5 border-teal/30 shadow-md"
                        : "bg-white border-slate/5 hover:border-slate/20"
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-slate">{library.name}</h4>
                        <p className="text-[10px] text-slate-light font-bold uppercase mt-1">{library.currentOccupancy} / {library.capacity} Seats</p>
                      </div>
                      <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                        library.status === "full" ? "bg-red-100 text-red-500" : 
                        library.status === "moderate" ? "bg-orange-100 text-orange-500" : "bg-sage/20 text-sage"
                      }`}>
                        {library.status}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className={`lg:col-span-8 ${selectedLibrary ? 'flex' : 'hidden lg:flex'} flex-col`}>
              {selectedLibrary ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-8 h-full flex flex-col overflow-y-auto overscroll-y-contain bg-cream/40"
                >
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-teal/10 rounded-2xl flex items-center justify-center text-teal"><Library size={32} /></div>
                      <h2 className="text-3xl font-black text-slate">{selectedLibrary.name}</h2>
                    </div>
                    <button onClick={() => setSelectedLibrary(null)} className="lg:hidden p-2 text-slate-light"><X size={20} /></button>
                  </div>

                  <div className="bg-white/50 p-6 rounded-3xl border border-slate/5 mb-8">
                    <div className="flex justify-between items-end mb-4">
                       <h3 className="text-sm font-black text-slate-light uppercase tracking-widest">Live Occupancy</h3>
                       <span className={`text-3xl font-black ${selectedLibrary.status === "full" ? "text-red-500" : selectedLibrary.status === "moderate" ? "text-orange-500" : "text-sage"}`}>
                         {Math.round((selectedLibrary.currentOccupancy / Math.max(selectedLibrary.capacity, 1)) * 100)}%
                       </span>
                    </div>
                    <div className="w-full bg-teal/10 h-3 rounded-full overflow-hidden mb-6 ring-1 ring-teal/15">
                       <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (selectedLibrary.currentOccupancy / Math.max(selectedLibrary.capacity, 1)) * 100)}%` }} className={`h-full ${selectedLibrary.status === "full" ? "bg-red-500" : selectedLibrary.status === "moderate" ? "bg-orange-400" : "bg-sage"}`} />
                    </div>
                    <p className="text-[10px] font-bold text-slate-light uppercase tracking-widest mb-3">Report current occupancy</p>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="0"
                        max={Math.max(selectedLibrary.capacity, 0)}
                        value={selectedLibrary.currentOccupancy}
                        onChange={(e) =>
                          scheduleLibraryOccupancyUpdate(
                            selectedLibrary.id,
                            parseInt(e.target.value, 10),
                            selectedLibrary.capacity
                          )
                        }
                        className="flex-1 accent-teal h-2"
                      />
                      <span className="text-sm font-black text-slate w-12 text-center">{selectedLibrary.currentOccupancy}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate mb-6 flex items-center space-x-2">
                    <BarChart3 size={20} className="text-teal" />
                    <span>Occupancy Trends</span>
                  </h3>
                  <div className="rounded-3xl border border-teal/20 bg-white p-6 shadow-[inset_0_1px_0_rgba(42,157,154,0.08)] overflow-x-auto overscroll-x-contain min-h-64 flex flex-col">
                    <div className="flex flex-1 min-h-44 items-end gap-5 min-w-max rounded-2xl bg-linear-to-b from-teal/[0.07] to-cream px-5 pt-10 pb-3 border-b-2 border-teal/25 relative">
                      {/* Scale Lines */}
                      <div className="absolute inset-x-5 inset-y-3 flex flex-col justify-between pointer-events-none">
                        {[100, 75, 50, 25, 0].map((tick) => (
                          <div key={tick} className="w-full flex items-center space-x-2">
                            <span className="text-[7px] font-bold text-teal/50 w-4">{tick}%</span>
                            <div className="flex-1 border-t border-teal/10" />
                          </div>
                        ))}
                      </div>

                      {/* Bars */}
                      {libraryLogs.length > 0 ? libraryLogs.slice(-12).map((log, i) => {
                        const cap = Math.max(selectedLibrary.capacity, 1);
                        const occ = Number(log.occupancy);
                        const pct = Math.min(1, Math.max(0, (Number.isFinite(occ) ? occ : 0) / cap));
                        const trackPx = 168;
                        const barHeightPx = Math.max(6, Math.round(pct * trackPx));
                        const high = pct > 0.85;
                        const mid = pct > 0.5 && !high;
                        return (
                        <div key={i} className="flex flex-col items-center gap-1 shrink-0 group relative z-10">
                          <div
                            className="flex h-44 w-12 items-end justify-center rounded-b-sm border-b-2 border-teal/25 bg-teal/[0.06]"
                            title={`${occ} / ${cap}`}
                          >
                            <div
                              className={`w-full min-h-[6px] rounded-t-xl transition-all duration-500 relative flex items-start justify-center overflow-hidden shadow-sm ${
                                high ? "bg-linear-to-t from-red-500/35 to-red-400/90" :
                                mid ? "bg-linear-to-t from-orange-500/35 to-amber-400/90" : "bg-linear-to-t from-teal/40 to-teal"
                              }`}
                              style={{ height: barHeightPx }}
                            >
                              <div className={`w-full h-1.5 shrink-0 rounded-t-full ${
                                high ? "bg-red-600" : mid ? "bg-orange-500" : "bg-teal-dark"
                              }`} />
                              <span className="mt-auto pb-1 text-[9px] font-black text-slate opacity-0 group-hover:opacity-100 transition-opacity">
                                {occ}
                              </span>
                            </div>
                          </div>
                          <span className="text-[8px] font-bold text-teal/80 uppercase whitespace-nowrap">
                            {(() => {
                              const d = new Date(log.timeStamp);
                              return Number.isNaN(d.getTime()) ? "—" : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                            })()}
                          </span>
                        </div>
                        );
                      }) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-teal/40">
                          <p className="text-xs font-bold uppercase tracking-widest">Awaiting sensor data...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex-1 glass-card flex flex-col items-center justify-center text-center p-12 border-dashed border-2">
                  <Library size={48} className="text-slate-light/20 mb-4" />
                  <h3 className="text-xl font-bold text-slate">Select a Library</h3>
                  <p className="text-slate-light text-sm">Find the perfect study spot by checking real-time occupancy and history.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
