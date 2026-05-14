"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Utensils,
  Library,
  Plus,
  Search,
  Edit,
  Trash2,
  BarChart3,
  UserPlus,
  Calendar,
  X,
  CheckCircle2,
  AlertCircle,
  Mail,
  Coffee
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
  menu: string[];
}

interface CanteenLog {
  time?: string;
  timeStamp?: string;
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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"lecturers" | "canteens" | "libraries">("lecturers");
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLecturer, setSelectedLecturer] = useState<Lecturer | null>(null);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newLecturer, setNewLecturer] = useState({ name: "", department: "", email: "", lastSeen: "" });
  const [editingLecturer, setEditingLecturer] = useState<Lecturer | null>(null);

  // Canteen States
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [selectedCanteen, setSelectedCanteen] = useState<Canteen | null>(null);
  const [canteenLogs, setCanteenLogs] = useState<CanteenLog[]>([]);
  const [showAddCanteenModal, setShowAddCanteenModal] = useState(false);
  const [newCanteen, setNewCanteen] = useState({ name: "", currentQueue: "low" as "low" | "mid" | "high", menu: "" });
  const [menuInput, setMenuInput] = useState<string[]>(["", "", "", "", "", ""]);

  // Library States
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [selectedLibrary, setSelectedLibrary] = useState<Library | null>(null);
  const [libraryLogs, setLibraryLogs] = useState<LibraryLog[]>([]);
  const [showAddLibraryModal, setShowAddLibraryModal] = useState(false);
  const [newLibrary, setNewLibrary] = useState({ name: "", capacity: 0, currentOccupancy: 0 });

  const occupancyFlushRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingOccupancyRef = useRef<{ id: string; count: number } | null>(null);

  useEffect(() => {
    return () => {
      if (occupancyFlushRef.current) clearTimeout(occupancyFlushRef.current);
    };
  }, []);

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
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("API did not return JSON");
      }

      const result = await response.json();
      const rawData = Array.isArray(result) ? result : (result.data || []);
      // Normalize data to ensure 'id' is always present
      const normalizedData = rawData.map((item: any) => ({
        ...item,
        id: item.id || item._id
      }));
      setLecturers(normalizedData);
    } catch (err) {
      console.error("Failed to fetch lecturers", err);
      // Fallback for demo
      setLecturers([
        { id: "1", name: "Dr. Kayanan", department: "Physical Science", email: "kayanan@vau.edu", lastSeen: "2026-05-10" },
        { id: "2", name: "Prof. Smith", department: "Computing", email: "smith@vau.edu", lastSeen: "2026-05-12" }
      ]);
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
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("API did not return JSON");
      }
      const result = await response.json();
      const attendanceData = Array.isArray(result) ? result : (result.data || []);
      setAttendanceLogs(attendanceData);
    } catch (err) {
      console.error("Failed to fetch attendance", err);
      // Fallback data for chart
      setAttendanceLogs([
        { date: "May 01", status: "present" },
        { date: "May 02", status: "absent" },
        { date: "May 03", status: "present" },
        { date: "May 04", status: "present" },
        { date: "May 05", status: "present" },
        { date: "May 06", status: "absent" },
        { date: "May 07", status: "present" },
      ]);
    }
  };

  const handleAddLecturer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem("jwt");
      const response = await fetch("http://localhost:8080/api/lecturers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newLecturer)
      });
      if (response.ok) {
        setShowAddModal(false);
        fetchLecturers();
      }
    } catch (err) {
      console.error("Failed to add lecturer", err);
    }
  };

  const handleUpdateLecturer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLecturer) return;
    try {
      const token = sessionStorage.getItem("jwt");
      const response = await fetch(`http://localhost:8080/api/lecturers/${editingLecturer.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editingLecturer.name,
          department: editingLecturer.department,
          email: editingLecturer.email,
          lastSeen: editingLecturer.lastSeen
        })
      });
      if (response.ok) {
        setShowEditModal(false);
        fetchLecturers();
        // Update selected lecturer if it's the one being edited
        if (selectedLecturer?.id === editingLecturer.id) {
          setSelectedLecturer(editingLecturer);
        }
      }
    } catch (err) {
      console.error("Failed to update lecturer", err);
    }
  };

  const handlePostAttendance = async (id: string) => {
    try {
      const token = sessionStorage.getItem("jwt");
      await fetch(`http://localhost:8080/api/lecturers/${id}/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: "present" })
      });
      fetchAttendance(id);
    } catch (err) {
      console.error("Failed to post attendance", err);
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleDeleteLecturer = async (id: string) => {
    if (!id) return;
    setShowDeleteConfirm(null);

    // Optimistic Update: Remove from local state immediately
    const previousLecturers = [...lecturers];
    setLecturers(lecturers.filter(l => l.id !== id));
    setSelectedLecturer(null);

    try {
      const token = sessionStorage.getItem("jwt");
      const response = await fetch(`http://localhost:8080/api/lecturers/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error("Failed to delete from server");
      }

      await fetchLecturers();
    } catch (err) {
      console.error("Delete failed, rolling back:", err);
      setLecturers(previousLecturers);
      alert("Failed to delete lecturer. Please check your connection.");
    }
  };

  const fetchCanteens = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("jwt");
      const response = await fetch("http://localhost:8080/api/canteens", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("API did not return JSON");
      }
      const result = await response.json();
      const data = Array.isArray(result) ? result : (result.data || []);
      const normalized = data.map((c: any) => ({ ...c, id: c.id || c._id }));
      setCanteens(normalized);
    } catch (err) {
      console.error("Failed to fetch canteens", err);
      setCanteens([
        { id: "1", name: "Main Canteen", currentQueue: "mid", menu: ["Rice & Curry", "Noodles"] },
        { id: "2", name: "Staff Canteen", currentQueue: "low", menu: ["Pasta", "Salad"] }
      ]);
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
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("API did not return JSON");
      }
      const result = await response.json();
      const data = Array.isArray(result) ? result : (result.data || []);
      setCanteenLogs(data);
    } catch (err) {
      console.error("Failed to fetch canteen logs", err);
      setCanteenLogs([
        { time: "08:00", level: "low" },
        { time: "10:00", level: "mid" },
        { time: "12:00", level: "high" },
        { time: "14:00", level: "mid" },
        { time: "16:00", level: "low" }
      ]);
    }
  };

  const handleAddCanteen = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem("jwt");
      const response = await fetch("http://localhost:8080/api/canteens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newCanteen.name,
          currentQueue: newCanteen.currentQueue,
          menu: newCanteen.menu ? newCanteen.menu.split(",").map(m => m.trim()) : [],
          updatedAt: new Date().toISOString()
        })
      });
      if (response.ok) {
        setShowAddCanteenModal(false);
        fetchCanteens();
      }
    } catch (err) {
      console.error("Failed to add canteen", err);
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
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const updated = await response.json();
            const resultData = updated.data || updated;
            setSelectedCanteen({ ...selectedCanteen, menu: resultData.menu || [] });
          }
        }
      }
    } catch (err) {
      console.error("Failed to update menu", err);
    }
  };

  const handleUpdateQueue = async (id: string, level: "low" | "mid" | "high") => {
    if (!selectedCanteen) return;
    
    // Optimistic Update
    const previousLevel = selectedCanteen.currentQueue;
    setSelectedCanteen({ ...selectedCanteen, currentQueue: level });

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

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Server error (${response.status}):`, errorText);
        throw new Error(`Failed to update queue: ${response.status}`);
      }

      fetchCanteens();
      fetchCanteenLogs(id);
    } catch (err) {
      console.error("Queue update failed:", err);
      // Rollback on error
      if (selectedCanteen?.id === id) {
        setSelectedCanteen({ ...selectedCanteen, currentQueue: previousLevel });
      }
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
      const normalized = data.map((l: Record<string, unknown> & { id?: string; _id?: string }) => ({
        ...l,
        id: l.id || l._id
      })) as Library[];
      setLibraries(normalized);
    } catch (err) {
      console.error("Failed to fetch libraries", err);
      setLibraries([
        { id: "1", name: "Main Library", capacity: 500, currentOccupancy: 120, status: "moderate", updatedAt: new Date().toISOString() },
        { id: "2", name: "Science Library", capacity: 200, currentOccupancy: 180, status: "full", updatedAt: new Date().toISOString() }
      ]);
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
      const logs = result.data || [];
      const sorted = Array.isArray(logs) ? [...logs].sort((a, b) => new Date(a.timeStamp).getTime() - new Date(b.timeStamp).getTime()) : [];
      setLibraryLogs(sorted);
    } catch (err) {
      console.error("Failed to fetch library logs", err);
    }
  };

  const handleAddLibrary = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem("jwt");
      const response = await fetch("http://localhost:8080/api/libraries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newLibrary,
          status: newLibrary.currentOccupancy === 0 ? "empty" : (newLibrary.currentOccupancy / newLibrary.capacity > 0.85 ? "full" : "moderate"),
          updatedAt: new Date().toISOString()
        })
      });
      if (response.ok) {
        setShowAddLibraryModal(false);
        fetchLibraries();
      }
    } catch (err) {
      console.error("Failed to add library", err);
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
      console.error("Failed to update occupancy", err);
    }
  };

  const scheduleLibraryOccupancyUpdate = (id: string, count: number, capacity: number) => {
    const maxSeats = Math.max(capacity, 0);
    const clamped = Math.max(0, Math.min(Number.isFinite(count) ? count : 0, maxSeats));
    pendingOccupancyRef.current = { id, count: clamped };

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
      const pending = pendingOccupancyRef.current;
      if (pending) void postLibraryOccupancy(pending.id, pending.count);
    }, 450);
  };

  useEffect(() => {
    if (activeTab === "lecturers") fetchLecturers();
    if (activeTab === "canteens") fetchCanteens();
    if (activeTab === "libraries") fetchLibraries();
  }, [activeTab]);

  // Utility to format date
  const formatCanteenLogTime = (log: CanteenLog) => {
    if (log.time) return log.time;
    if (log.timeStamp) {
      const d = new Date(log.timeStamp);
      return Number.isNaN(d.getTime()) ? "—" : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return "—";
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  // Prepare chart data
  const chartData = attendanceLogs.map(log => ({
    name: formatDate(log.date),
    status: log.status
  }));

  return (
    <div className="flex flex-col h-full">
      {/* Admin Navbar */}
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

      {/* View Content */}
      <div className="flex-1 min-h-0">
        {activeTab === "lecturers" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
            {/* Lecturers List */}
            <div className={`lg:col-span-4 flex flex-col space-y-4 ${selectedLecturer ? 'hidden lg:flex' : 'flex'}`}>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold text-slate">Lecturers</h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-teal text-cream p-2 rounded-xl hover:bg-teal-dark transition-all active:scale-95"
                >
                  <Plus size={20} />
                </button>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-light" size={18} />
                <input
                  type="text"
                  placeholder="Search lecturers..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate/10 rounded-xl focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none transition-all"
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
                        ? "bg-teal/5 border-teal/30 shadow-md shadow-teal/5"
                        : "bg-white border-slate/5 hover:border-slate/20"
                      }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate">{lecturer.name}</h4>
                        <p className="text-xs text-slate-light font-medium uppercase tracking-wider">{lecturer.department}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${lecturer.lastSeen === new Date().toISOString().split('T')[0]
                          ? "bg-sage/20 text-sage"
                          : "bg-slate/10 text-slate-light"
                        }`}>
                        {lecturer.lastSeen === new Date().toISOString().split('T')[0] ? "Active Today" : "Away"}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Details View */}
            <div className={`lg:col-span-8 ${selectedLecturer ? 'flex' : 'hidden lg:flex'} flex-col`}>
              {selectedLecturer ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-8 h-full flex flex-col"
                >
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-sage/20 rounded-2xl flex items-center justify-center text-sage text-2xl font-bold">
                        {selectedLecturer.name.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-slate">{selectedLecturer.name}</h2>
                        <p className="text-slate-light flex items-center space-x-2">
                          <Mail size={14} />
                          <span>{selectedLecturer.email}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingLecturer(selectedLecturer);
                          setShowEditModal(true);
                        }}
                        className="bg-teal/10 text-teal p-2 rounded-xl hover:bg-teal/20 transition-all"
                        title="Edit Lecturer"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handlePostAttendance(selectedLecturer.id)}
                        className="bg-sage text-cream px-4 py-2 rounded-xl font-bold hover:bg-sage-dark transition-all flex items-center space-x-2"
                      >
                        <CheckCircle2 size={18} />
                        <span>Mark Present</span>
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(selectedLecturer.id)}
                        className="bg-red-50 text-red-500 px-4 py-2 rounded-xl font-bold hover:bg-red-100 transition-all flex items-center space-x-2 border border-red-100"
                      >
                        <Trash2 size={18} />
                        <span>Delete</span>
                      </button>
                      <button
                        onClick={() => setSelectedLecturer(null)}
                        className="lg:hidden p-2 text-slate-light"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white/50 p-6 rounded-2xl border border-slate/5">
                      <div className="flex items-center space-x-2 text-slate-light mb-2">
                        <Calendar size={16} />
                        <span className="text-sm font-semibold uppercase tracking-wider">Last Seen</span>
                      </div>
                      <p className="text-2xl font-bold text-slate">{selectedLecturer.lastSeen}</p>
                    </div>
                    <div className="bg-white/50 p-6 rounded-2xl border border-slate/5">
                      <div className="flex items-center space-x-2 text-slate-light mb-2">
                        <Users size={16} />
                        <span className="text-sm font-semibold uppercase tracking-wider">Department</span>
                      </div>
                      <p className="text-2xl font-bold text-slate">{selectedLecturer.department}</p>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col min-h-[300px]">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-slate flex items-center space-x-2">
                        <BarChart3 size={20} className="text-teal" />
                        <span>Attendance History</span>
                      </h3>
                      <div className="flex items-center space-x-4 text-sm font-medium">
                        <div className="flex items-center space-x-1.5">
                          <div className="w-3 h-3 bg-teal rounded-full" />
                          <span>Present</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <div className="w-3 h-3 bg-slate/20 rounded-full" />
                          <span>Absent</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 bg-white/30 rounded-3xl p-8 border border-slate/5">
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 lg:grid-cols-10 gap-4">
                        {chartData.map((day, i) => (
                          <div key={i} className="flex flex-col items-center space-y-2 group">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: i * 0.05 }}
                              className={`w-full aspect-square rounded-xl shadow-sm transition-all duration-300 ${day.status === "present"
                                  ? "bg-sage shadow-sage/20 scale-100"
                                  : "bg-slate/10 scale-95 opacity-50"
                                }`}
                            />
                            <span className="text-[10px] font-bold text-slate-light/60 uppercase tracking-tighter group-hover:text-slate transition-colors">
                              {day.name}
                            </span>
                          </div>
                        ))}
                        {chartData.length === 0 && (
                          <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-light opacity-50">
                            <Calendar size={48} className="mb-4" />
                            <p className="font-bold">No logs for this period</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex-1 glass-card flex flex-col items-center justify-center text-center p-12 border-dashed border-2">
                  <div className="w-20 h-20 bg-slate/5 rounded-3xl flex items-center justify-center mb-6 text-slate-light">
                    <Users size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate mb-2">No Lecturer Selected</h3>
                  <p className="text-slate-light max-w-xs">Choose a lecturer from the list to view their details and attendance history.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "canteens" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
            {/* Canteens List */}
            <div className={`lg:col-span-4 flex flex-col space-y-4 ${selectedCanteen ? 'hidden lg:flex' : 'flex'}`}>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold text-slate">Canteens</h2>
                <button
                  onClick={() => setShowAddCanteenModal(true)}
                  className="bg-teal text-cream p-2 rounded-xl hover:bg-teal-dark transition-all active:scale-95"
                >
                  <Plus size={20} />
                </button>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-light" size={18} />
                <input
                  type="text"
                  placeholder="Search canteens..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate/10 rounded-xl focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none transition-all"
                />
              </div>

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
                        ? "bg-teal/5 border-teal/30 shadow-md shadow-teal/5"
                        : "bg-white border-slate/5 hover:border-slate/20"
                      }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate">{canteen.name}</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {canteen.menu && canteen.menu.slice(0, 3).map((item, i) => (
                            <span key={i} className="text-[9px] text-slate-light bg-slate/5 px-1.5 py-0.5 rounded-md truncate max-w-[60px]">
                              {item}
                            </span>
                          ))}
                          {canteen.menu && canteen.menu.length > 3 && (
                            <span className="text-[9px] text-slate-light/60 font-bold px-1">+ {canteen.menu.length - 3}</span>
                          )}
                        </div>
                      </div>
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

            {/* Canteen Details View */}
            <div className={`lg:col-span-8 ${selectedCanteen ? 'flex' : 'hidden lg:flex'} flex-col`}>
              {selectedCanteen ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-8 h-full flex flex-col overflow-y-auto"
                >
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-teal/10 rounded-2xl flex items-center justify-center text-teal text-2xl font-bold">
                        <Coffee size={32} />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-slate">{selectedCanteen.name}</h2>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedCanteen(null)}
                      className="lg:hidden p-2 text-slate-light"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Queue Level Update */}
                    <div className="bg-white/50 p-6 rounded-3xl border border-slate/5">
                      <h3 className="text-sm font-black text-slate-light uppercase tracking-widest mb-6">Queue Status</h3>
                      <div className="flex flex-col space-y-6">
                        <div className="flex items-center space-x-3">
                          <span className={`text-4xl font-black leading-none capitalize ${
                            selectedCanteen.currentQueue === "high" ? "text-red-500" : 
                            selectedCanteen.currentQueue === "mid" ? "text-orange-500" : "text-sage"
                          }`}>
                            {selectedCanteen.currentQueue === "mid" ? "moderate" : selectedCanteen.currentQueue}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-light uppercase tracking-[0.2em]">Current Traffic</span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <p className="text-[10px] font-bold text-slate-light/60 uppercase tracking-widest">Update Traffic Level</p>
                          <div className="flex w-full space-x-3">
                            {(["low", "mid", "high"] as const).map(lvl => (
                              <button
                                key={lvl}
                                onClick={() => handleUpdateQueue(selectedCanteen.id, lvl)}
                                className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg ${
                                  selectedCanteen.currentQueue === lvl
                                    ? lvl === "high" ? "bg-red-500 text-white shadow-red-200" : lvl === "mid" ? "bg-orange-400 text-white shadow-orange-200" : "bg-sage text-white shadow-sage-200"
                                    : "bg-white text-slate-light border border-slate/5 hover:border-slate/20"
                                }`}
                              >
                                {lvl === "mid" ? "Moderate" : lvl}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Management */}
                    <div className="bg-white/50 p-6 rounded-3xl border border-slate/5">
                      <h3 className="text-sm font-black text-slate-light uppercase tracking-widest mb-4">Daily Menu</h3>
                      
                      {/* Current Menu Display */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {selectedCanteen.menu && selectedCanteen.menu.length > 0 ? (
                          selectedCanteen.menu.map((item, i) => (
                            <span key={i} className="px-3 py-1 bg-teal/10 text-teal text-[10px] font-bold rounded-full uppercase tracking-wider">
                              {item}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-light italic">No items listed</span>
                        )}
                      </div>

                      <p className="text-xs font-bold text-slate uppercase tracking-widest mb-3">Edit menu items</p>
                      <div className="grid grid-cols-2 gap-3 mb-4">
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
                            className="bg-white border border-slate/15 rounded-xl px-3 py-2.5 text-sm text-slate placeholder:text-slate-light/80 outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all"
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUpdateMenu(selectedCanteen.id, menuInput)}
                        className="w-full bg-teal text-cream py-3 rounded-xl font-bold hover:bg-teal-dark transition-all active:scale-95 text-sm shadow-md shadow-teal/25"
                      >
                        Update daily menu
                      </button>
                    </div>
                  </div>

                  {/* Traffic Logs */}
                  <div className="flex-1 flex flex-col min-h-[300px]">
                    <h3 className="text-xl font-bold text-slate mb-6 flex items-center space-x-2">
                      <BarChart3 size={20} className="text-teal" />
                      <span>Traffic Logs</span>
                    </h3>
                    <div className="flex-1 bg-white/30 rounded-3xl p-8 border border-slate/5">
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                        {canteenLogs.map((log, i) => (
                          <div key={i} className="flex flex-col items-center space-y-2">
                            <div className="w-full bg-slate/5 rounded-2xl p-4 text-center">
                              <span className={`text-sm font-black capitalize ${
                                log.level === "high" ? "text-red-500" : 
                                log.level === "mid" ? "text-orange-500" : "text-sage"
                              }`}>{log.level === "mid" ? "moderate" : log.level}</span>
                              <p className="text-[10px] font-bold text-slate-light uppercase">
                                {formatCanteenLogTime(log)}
                              </p>
                            </div>
                            <div className="w-full h-1 bg-slate/5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${log.level === "high" ? "bg-red-400" : log.level === "mid" ? "bg-orange-300" : "bg-sage"}`}
                                style={{ width: log.level === "high" ? "100%" : log.level === "mid" ? "60%" : "30%" }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex-1 glass-card flex flex-col items-center justify-center text-center p-12 border-dashed border-2">
                  <div className="w-20 h-20 bg-slate/5 rounded-3xl flex items-center justify-center mb-6 text-slate-light">
                    <Coffee size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate mb-2">Select a Canteen</h3>
                  <p className="text-slate-light max-w-xs">Monitor real-time traffic and update menus for university dining facilities.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "libraries" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
            {/* Libraries List */}
            <div className={`lg:col-span-4 flex flex-col space-y-4 ${selectedLibrary ? 'hidden lg:flex' : 'flex'}`}>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold text-slate">Libraries</h2>
                <button
                  onClick={() => setShowAddLibraryModal(true)}
                  className="bg-teal text-cream p-2 rounded-xl hover:bg-teal-dark transition-all active:scale-95"
                >
                  <Plus size={20} />
                </button>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-light" size={18} />
                <input
                  type="text"
                  placeholder="Search libraries..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate/10 rounded-xl focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none transition-all"
                />
              </div>

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
                        ? "bg-teal/5 border-teal/30 shadow-md shadow-teal/5"
                        : "bg-white border-slate/5 hover:border-slate/20"
                      }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate">{library.name}</h4>
                        <p className="text-[10px] text-slate-light font-bold uppercase mt-1">
                          {library.currentOccupancy} / {library.capacity} Seats
                        </p>
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

            {/* Library Details View */}
            <div className={`lg:col-span-8 ${selectedLibrary ? 'flex' : 'hidden lg:flex'} flex-col`}>
              {selectedLibrary ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-8 h-full flex flex-col overflow-y-auto overscroll-y-contain bg-cream/40"
                >
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-teal/10 rounded-2xl flex items-center justify-center text-teal text-2xl font-bold">
                        <Library size={32} />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-slate">{selectedLibrary.name}</h2>
                        <p className="text-slate-light text-sm font-bold uppercase tracking-widest">Campus Study Center</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedLibrary(null)}
                      className="lg:hidden p-2 text-slate-light"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Occupancy Status */}
                    <div className="bg-white/50 p-6 rounded-3xl border border-slate/5">
                      <h3 className="text-sm font-black text-slate-light uppercase tracking-widest mb-6">Current Occupancy</h3>
                      <div className="flex items-end justify-between mb-4">
                        <div className="flex flex-col">
                          <span className={`text-5xl font-black leading-none ${
                            selectedLibrary.status === "full" ? "text-red-500" : 
                            selectedLibrary.status === "moderate" ? "text-orange-500" : "text-sage"
                          }`}>
                            {Math.round((selectedLibrary.currentOccupancy / Math.max(selectedLibrary.capacity, 1)) * 100)}%
                          </span>
                          <span className="text-[10px] font-bold text-slate-light uppercase tracking-widest mt-2">Utilization</span>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-slate">{selectedLibrary.currentOccupancy}</p>
                          <p className="text-[10px] font-bold text-slate-light uppercase">Occupied Seats</p>
                        </div>
                      </div>
                      
                      <div className="w-full bg-teal/10 h-4 rounded-full overflow-hidden mb-8 ring-1 ring-teal/15">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (selectedLibrary.currentOccupancy / Math.max(selectedLibrary.capacity, 1)) * 100)}%` }}
                          className={`h-full ${
                            selectedLibrary.status === "full" ? "bg-red-500" : 
                            selectedLibrary.status === "moderate" ? "bg-orange-400" : "bg-sage"
                          }`}
                        />
                      </div>

                      <div className="space-y-4">
                        <p className="text-[10px] font-bold text-slate-light/60 uppercase tracking-widest">Update Occupancy Count</p>
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
                          <input
                            type="number"
                            min={0}
                            max={Math.max(selectedLibrary.capacity, 0)}
                            value={selectedLibrary.currentOccupancy}
                            onChange={(e) =>
                              scheduleLibraryOccupancyUpdate(
                                selectedLibrary.id,
                                parseInt(e.target.value, 10) || 0,
                                selectedLibrary.capacity
                              )
                            }
                            className="w-20 bg-white border border-slate/10 rounded-xl px-3 py-2 text-sm font-bold text-slate text-center outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/50 p-6 rounded-3xl border border-slate/5">
                      <h3 className="text-sm font-black text-slate-light uppercase tracking-widest mb-6">Library Details</h3>
                      <div className="space-y-6">
                        <div>
                          <p className="text-[10px] font-bold text-slate-light uppercase tracking-widest mb-1">Total Capacity</p>
                          <p className="text-xl font-black text-slate">{selectedLibrary.capacity} Students</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-light uppercase tracking-widest mb-1">Status</p>
                          <div className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                            selectedLibrary.status === "full" ? "bg-red-500 text-white" : 
                            selectedLibrary.status === "moderate" ? "bg-orange-400 text-white" : "bg-sage text-white"
                          }`}>
                            {selectedLibrary.status}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-light uppercase tracking-widest mb-1">Last Updated</p>
                          <p className="text-sm font-bold text-slate">{new Date(selectedLibrary.updatedAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Occupancy Logs */}
                  <div className="flex-1 flex flex-col min-h-[300px]">
                    <h3 className="text-xl font-bold text-slate mb-6 flex items-center space-x-2">
                      <BarChart3 size={20} className="text-teal" />
                      <span>Occupancy History</span>
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
                                <span className="mt-auto pb-1 text-[9px] font-black text-slate drop-shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
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
                            <BarChart3 size={48} className="mb-4 opacity-30 text-teal" />
                            <p className="text-xs font-bold uppercase tracking-widest">No occupancy logs available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex-1 glass-card flex flex-col items-center justify-center text-center p-12 border-dashed border-2">
                  <div className="w-20 h-20 bg-slate/5 rounded-3xl flex items-center justify-center mb-6 text-slate-light">
                    <Library size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate mb-2">Select a Library</h3>
                  <p className="text-slate-light max-w-xs">Monitor seat occupancy and manage library resources in real-time.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card p-10 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                <AlertCircle size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate mb-2">Are you sure?</h2>
              <p className="text-slate-light mb-8 text-sm">This action cannot be undone. All data for this lecturer will be permanently removed.</p>

              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => handleDeleteLecturer(showDeleteConfirm)}
                  className="w-full bg-red-500 text-white py-3 rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-200"
                >
                  Yes, Delete Lecturer
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="w-full bg-slate/5 text-slate-light py-3 rounded-2xl font-bold hover:bg-slate/10 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Library Modal */}
      <AnimatePresence>
        {showAddLibraryModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card p-10 max-w-lg w-full shadow-2xl relative"
            >
              <button
                onClick={() => setShowAddLibraryModal(false)}
                className="absolute top-6 right-6 text-slate-light hover:text-slate transition-colors"
              >
                <X size={24} />
              </button>

              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-teal/20 rounded-2xl flex items-center justify-center text-teal">
                  <Library size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate">New Library</h2>
                  <p className="text-sm text-slate-light">Register a new study facility</p>
                </div>
              </div>

              <form onSubmit={handleAddLibrary} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate ml-1">Library Name</label>
                  <input
                    required
                    value={newLibrary.name}
                    onChange={(e) => setNewLibrary({ ...newLibrary, name: e.target.value })}
                    placeholder="Main Library"
                    className="w-full px-4 py-3 bg-white border border-slate/10 rounded-2xl focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate ml-1">Total Capacity</label>
                    <input
                      required
                      type="number"
                      value={newLibrary.capacity}
                      onChange={(e) => setNewLibrary({ ...newLibrary, capacity: parseInt(e.target.value) || 0 })}
                      placeholder="300"
                      className="w-full px-4 py-3 bg-white border border-slate/10 rounded-2xl focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate ml-1">Initial Occupancy</label>
                    <input
                      type="number"
                      value={newLibrary.currentOccupancy}
                      onChange={(e) => setNewLibrary({ ...newLibrary, currentOccupancy: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      className="w-full px-4 py-3 bg-white border border-slate/10 rounded-2xl focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-teal text-cream py-4 rounded-2xl font-bold hover:bg-teal-dark shadow-lg shadow-teal/20 transition-all active:scale-[0.98] mt-6"
                >
                  Register Library
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Canteen Modal */}
      <AnimatePresence>
        {showAddCanteenModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card p-10 max-w-lg w-full shadow-2xl relative"
            >
              <button
                onClick={() => setShowAddCanteenModal(false)}
                className="absolute top-6 right-6 text-slate-light hover:text-slate transition-colors"
              >
                <X size={24} />
              </button>

              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-teal/20 rounded-2xl flex items-center justify-center text-teal">
                  <Coffee size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate">New Canteen</h2>
                  <p className="text-sm text-slate-light">Register a new dining facility</p>
                </div>
              </div>

              <form onSubmit={handleAddCanteen} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate ml-1">Canteen Name</label>
                  <input
                    required
                    value={newCanteen.name}
                    onChange={(e) => setNewCanteen({ ...newCanteen, name: e.target.value })}
                    placeholder="Ammachchi"
                    className="w-full px-4 py-3 bg-white border border-slate/10 rounded-2xl focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate ml-1">Initial Menu (Optional)</label>
                  <input
                    value={newCanteen.menu}
                    onChange={(e) => setNewCanteen({ ...newCanteen, menu: e.target.value })}
                    placeholder="Puri, Vade, Tea"
                    className="w-full px-4 py-3 bg-white border border-slate/10 rounded-2xl focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none transition-all"
                  />
                  <p className="text-[10px] text-slate-light ml-1 uppercase font-bold">Separate items with commas</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate ml-1">Initial Queue Status</label>
                  <div className="flex space-x-2">
                    {(["low", "mid", "high"] as const).map(lvl => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setNewCanteen({ ...newCanteen, currentQueue: lvl })}
                        className={`flex-1 py-3 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all ${
                          newCanteen.currentQueue === lvl
                            ? lvl === "high" ? "bg-red-500 text-white shadow-lg shadow-red-100" : lvl === "mid" ? "bg-orange-400 text-white shadow-lg shadow-orange-100" : "bg-sage text-white shadow-lg shadow-sage-100"
                            : "bg-slate/5 text-slate-light hover:bg-slate/10"
                        }`}
                      >
                        {lvl === "mid" ? "Moderate" : lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-teal text-cream py-4 rounded-2xl font-bold hover:bg-teal-dark shadow-lg shadow-teal/20 transition-all active:scale-[0.98] mt-6"
                >
                  Register Canteen
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && editingLecturer && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card p-10 max-w-lg w-full shadow-2xl relative"
            >
              <button
                onClick={() => setShowEditModal(false)}
                className="absolute top-6 right-6 text-slate-light hover:text-slate transition-colors"
              >
                <X size={24} />
              </button>

              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-teal/20 rounded-2xl flex items-center justify-center text-teal">
                  <Edit size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate">Edit Lecturer</h2>
                  <p className="text-sm text-slate-light">Update information for {editingLecturer.name}</p>
                </div>
              </div>

              <form onSubmit={handleUpdateLecturer} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate ml-1">Name</label>
                  <input
                    required
                    value={editingLecturer.name}
                    onChange={(e) => setEditingLecturer({ ...editingLecturer, name: e.target.value })}
                    placeholder="Dr. Kayanan"
                    className="w-full px-4 py-3 bg-white border border-slate/10 rounded-2xl focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate ml-1">Department</label>
                    <input
                      required
                      value={editingLecturer.department}
                      onChange={(e) => setEditingLecturer({ ...editingLecturer, department: e.target.value })}
                      placeholder="Physical Science"
                      className="w-full px-4 py-3 bg-white border border-slate/10 rounded-2xl focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate ml-1">Email</label>
                    <input
                      required
                      type="email"
                      value={editingLecturer.email}
                      onChange={(e) => setEditingLecturer({ ...editingLecturer, email: e.target.value })}
                      placeholder="kayanan@vau.edu"
                      className="w-full px-4 py-3 bg-white border border-slate/10 rounded-2xl focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate ml-1">Last Seen</label>
                  <input
                    type="date"
                    value={editingLecturer.lastSeen}
                    onChange={(e) => setEditingLecturer({ ...editingLecturer, lastSeen: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate/10 rounded-2xl focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-teal text-cream py-4 rounded-2xl font-bold hover:bg-teal-dark shadow-lg shadow-teal/20 transition-all active:scale-[0.98] mt-6"
                >
                  Save Changes
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card p-10 max-w-lg w-full shadow-2xl relative"
            >
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-6 right-6 text-slate-light hover:text-slate transition-colors"
              >
                <X size={24} />
              </button>

              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-teal/20 rounded-2xl flex items-center justify-center text-teal">
                  <UserPlus size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate">New Lecturer</h2>
                  <p className="text-sm text-slate-light">Register a new faculty member</p>
                </div>
              </div>

              <form onSubmit={handleAddLecturer} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate ml-1">Name</label>
                  <input
                    required
                    value={newLecturer.name}
                    onChange={(e) => setNewLecturer({ ...newLecturer, name: e.target.value })}
                    placeholder="Dr. Kayanan"
                    className="w-full px-4 py-3 bg-white border border-slate/10 rounded-2xl focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate ml-1">Department</label>
                    <input
                      required
                      value={newLecturer.department}
                      onChange={(e) => setNewLecturer({ ...newLecturer, department: e.target.value })}
                      placeholder="Physical Science"
                      className="w-full px-4 py-3 bg-white border border-slate/10 rounded-2xl focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate ml-1">Email</label>
                    <input
                      required
                      type="email"
                      value={newLecturer.email}
                      onChange={(e) => setNewLecturer({ ...newLecturer, email: e.target.value })}
                      placeholder="kayanan@vau.edu"
                      className="w-full px-4 py-3 bg-white border border-slate/10 rounded-2xl focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate ml-1">Last Seen (Initial)</label>
                  <input
                    type="date"
                    value={newLecturer.lastSeen}
                    onChange={(e) => setNewLecturer({ ...newLecturer, lastSeen: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate/10 rounded-2xl focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-teal text-cream py-4 rounded-2xl font-bold hover:bg-teal-dark shadow-lg shadow-teal/20 transition-all active:scale-[0.98] mt-6"
                >
                  Register Lecturer
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
