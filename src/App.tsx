/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Armchair, 
  CreditCard, 
  FileText, 
  Settings, 
  LogOut, 
  Search, 
  Plus, 
  QrCode,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  ShieldCheck,
  Menu,
  X,
  Camera,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { Staff, Student, Seat, Zone, SubscriptionStats, OccupancyStats } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: ShieldCheck, label: 'Staff Management', path: '/staff' },
    { icon: Users, label: 'Student Management', path: '/students' },
    { icon: Armchair, label: 'Seating Plan', path: '/seating' },
    { icon: QrCode, label: 'Attendance Kiosk', path: '/kiosk' },
    { icon: CreditCard, label: 'Subscriptions', path: '/subscriptions' },
    { icon: FileText, label: 'Reports', path: '/reports' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className={cn(
      "bg-zinc-950 border-r border-white/10 transition-all duration-300 flex flex-col h-screen sticky top-0",
      isOpen ? "w-64" : "w-20"
    )}>
      <div className="p-6 flex items-center justify-between">
        <div className={cn("flex items-center gap-3", !isOpen && "hidden")}>
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Armchair className="text-white w-5 h-5" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">LibreSeat</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="text-zinc-400 hover:text-white">
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-xl transition-all group",
              location.pathname === item.path 
                ? "bg-emerald-500/10 text-emerald-400" 
                : "text-zinc-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon size={20} className={cn(
              "transition-colors",
              location.pathname === item.path ? "text-emerald-400" : "group-hover:text-white"
            )} />
            {isOpen && <span className="font-medium">{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button className={cn(
          "flex items-center gap-3 px-3 py-3 w-full rounded-xl text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-all",
          !isOpen && "justify-center"
        )}>
          <LogOut size={20} />
          {isOpen && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
  <div className="bg-zinc-900 border border-white/5 p-6 rounded-2xl shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-3 rounded-xl", color)}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
    <h3 className="text-zinc-400 text-sm font-medium mb-1">{title}</h3>
    <div className="text-3xl font-bold text-white mb-1">{value}</div>
    {subtext && <p className="text-xs text-zinc-500">{subtext}</p>}
  </div>
);

// --- Pages ---

const Dashboard = () => {
  const [occupancy, setOccupancy] = useState<OccupancyStats>({ total: 0, occupied: 0 });
  const [subs, setSubs] = useState<SubscriptionStats>({ total: 0, active: 0, expired: 0 });

  useEffect(() => {
    fetch('/api/reports/occupancy').then(res => res.json()).then(setOccupancy);
    fetch('/api/reports/subscriptions').then(res => res.json()).then(setSubs);
  }, []);

  const pieData = [
    { name: 'Occupied', value: occupancy.occupied },
    { name: 'Available', value: occupancy.total - occupancy.occupied },
  ];

  const COLORS = ['#10b981', '#27272a'];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight">Library Overview</h1>
        <p className="text-zinc-400 mt-1">Real-time occupancy and subscription metrics.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/kiosk" className="lg:col-span-1 group">
          <div className="bg-emerald-500 border border-emerald-400 p-6 rounded-2xl shadow-lg shadow-emerald-500/20 h-full flex flex-col justify-between hover:scale-[1.02] transition-all">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-white/20 rounded-xl">
                <QrCode size={24} className="text-white" />
              </div>
              <div className="text-white/60 group-hover:text-white transition-colors">
                <Plus size={20} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-white font-bold text-lg">Launch Kiosk</h3>
              <p className="text-emerald-100 text-xs mt-1">Open QR attendance system</p>
            </div>
          </div>
        </Link>
        <StatCard 
          title="Total Occupancy" 
          value={`${occupancy.occupied}/${occupancy.total}`} 
          icon={Armchair} 
          color="bg-emerald-500"
          subtext={`${((occupancy.occupied / occupancy.total) * 100 || 0).toFixed(1)}% full`}
        />
        <StatCard 
          title="Active Subscriptions" 
          value={subs.active} 
          icon={CheckCircle2} 
          color="bg-blue-500"
          subtext="Valid for 1 month"
        />
        <StatCard 
          title="Expired Subscriptions" 
          value={subs.expired} 
          icon={XCircle} 
          color="bg-red-500"
          subtext="Requires renewal"
        />
        <StatCard 
          title="New Registrations" 
          value="12" 
          icon={UserPlus} 
          color="bg-purple-500"
          subtext="In the last 7 days"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-white/5 p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-white mb-6">Occupancy Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-8 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-sm text-zinc-400">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-zinc-800" />
              <span className="text-sm text-zinc-400">Available</span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-white/5 p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-white mb-6">Weekly Attendance Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { day: 'Mon', count: 45 },
                { day: 'Tue', count: 52 },
                { day: 'Wed', count: 48 },
                { day: 'Thu', count: 61 },
                { day: 'Fri', count: 55 },
                { day: 'Sat', count: 32 },
                { day: 'Sun', count: 28 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="day" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StaffManagement = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: '', name: '', father_name: '', address: '', state: '', 
    email: '', contact: '', password: '', blood_group: '', emergency_contact: ''
  });

  const fetchStaff = () => fetch('/api/staff').then(res => res.json()).then(setStaff);

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      setIsModalOpen(false);
      fetchStaff();
      setFormData({
        id: '', name: '', father_name: '', address: '', state: '', 
        email: '', contact: '', password: '', blood_group: '', emergency_contact: ''
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Staff Management</h1>
          <p className="text-zinc-400 mt-1">Manage library staff and librarians.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
        >
          <Plus size={20} /> Add Staff
        </button>
      </div>

      <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-zinc-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">ID</th>
              <th className="px-6 py-4 font-medium">Contact</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Blood Group</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {staff.map((s) => (
              <tr key={s.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-white font-medium">{s.name}</td>
                <td className="px-6 py-4 text-zinc-400 font-mono">{s.id}</td>
                <td className="px-6 py-4 text-zinc-400">{s.contact}</td>
                <td className="px-6 py-4">
                  <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md text-xs font-medium">
                    {s.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-zinc-400">{s.blood_group}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Add New Staff Member</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Full Name</label>
                  <input 
                    required
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Staff ID</label>
                  <input 
                    required
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    value={formData.id}
                    onChange={e => setFormData({...formData, id: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Father's Name</label>
                  <input 
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    value={formData.father_name}
                    onChange={e => setFormData({...formData, father_name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Email Address</label>
                  <input 
                    required
                    type="email"
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Contact Number</label>
                  <input 
                    required
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    value={formData.contact}
                    onChange={e => setFormData({...formData, contact: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Password</label>
                  <input 
                    required
                    type="password"
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Address</label>
                  <textarea 
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">State</label>
                  <input 
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    value={formData.state}
                    onChange={e => setFormData({...formData, state: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Blood Group</label>
                  <input 
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    value={formData.blood_group}
                    onChange={e => setFormData({...formData, blood_group: e.target.value})}
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Emergency Contact</label>
                  <input 
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    value={formData.emergency_contact}
                    onChange={e => setFormData({...formData, emergency_contact: e.target.value})}
                  />
                </div>
                <div className="col-span-2 pt-4">
                  <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all">
                    Register Staff Member
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StudentManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: '', name: '', father_name: '', address: '', state: '', 
    email: '', contact: '', blood_group: '', emergency_contact: ''
  });

  const fetchStudents = () => fetch('/api/students').then(res => res.json()).then(setStudents);

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      setIsModalOpen(false);
      fetchStudents();
      setFormData({
        id: '', name: '', father_name: '', address: '', state: '', 
        email: '', contact: '', blood_group: '', emergency_contact: ''
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Student Management</h1>
          <p className="text-zinc-400 mt-1">Manage library members and subscriptions.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
        >
          <Plus size={20} /> Add Student
        </button>
      </div>

      <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-zinc-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium">Student</th>
              <th className="px-6 py-4 font-medium">ID</th>
              <th className="px-6 py-4 font-medium">Subscription</th>
              <th className="px-6 py-4 font-medium">Current Seat</th>
              <th className="px-6 py-4 font-medium">Actions</th>
              <th className="px-6 py-4 font-medium">QR Code</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {students.map((s) => (
              <tr key={s.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-white font-medium">{s.name}</span>
                    <span className="text-zinc-500 text-xs">{s.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-zinc-400 font-mono">{s.id}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2 py-1 rounded-md text-xs font-medium",
                    s.sub_status === 'active' ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                  )}>
                    {s.sub_status || 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {s.current_seat ? (
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Armchair size={14} />
                      <span className="font-mono">{s.current_seat}</span>
                    </div>
                  ) : (
                    <span className="text-zinc-600">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {s.current_seat ? (
                    <button 
                      onClick={async () => {
                        await fetch('/api/attendance/check-out', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ student_id: s.id })
                        });
                        fetchStudents();
                      }}
                      className="text-red-400 hover:text-red-300 font-medium flex items-center gap-1"
                    >
                      <LogOut size={14} /> Check Out
                    </button>
                  ) : (
                    <button 
                      disabled={s.sub_status !== 'active'}
                      onClick={async () => {
                        const res = await fetch('/api/attendance/check-in', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ student_id: s.id })
                        });
                        if (!res.ok) {
                          const data = await res.json();
                          alert(data.error);
                        }
                        fetchStudents();
                      }}
                      className={cn(
                        "font-medium flex items-center gap-1",
                        s.sub_status === 'active' ? "text-emerald-400 hover:text-emerald-300" : "text-zinc-600 cursor-not-allowed"
                      )}
                    >
                      <CheckCircle2 size={14} /> Auto Assign
                    </button>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="bg-white p-1 rounded-md w-fit">
                    <QRCodeSVG value={s.id} size={32} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Register New Student</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Full Name</label>
                  <input 
                    required
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Student ID</label>
                  <input 
                    required
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    value={formData.id}
                    onChange={e => setFormData({...formData, id: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Father's Name</label>
                  <input 
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    value={formData.father_name}
                    onChange={e => setFormData({...formData, father_name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Email Address</label>
                  <input 
                    required
                    type="email"
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Contact Number</label>
                  <input 
                    required
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    value={formData.contact}
                    onChange={e => setFormData({...formData, contact: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Blood Group</label>
                  <input 
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    value={formData.blood_group}
                    onChange={e => setFormData({...formData, blood_group: e.target.value})}
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Address</label>
                  <textarea 
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">State</label>
                  <input 
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    value={formData.state}
                    onChange={e => setFormData({...formData, state: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Emergency Contact</label>
                  <input 
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    value={formData.emergency_contact}
                    onChange={e => setFormData({...formData, emergency_contact: e.target.value})}
                  />
                </div>
                <div className="col-span-2 pt-4">
                  <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all">
                    Register Student
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SeatingPlan = () => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newSeatConfig, setNewSeatConfig] = useState({ zone_id: '', section: 'A', count: 10 });

  const fetchData = async () => {
    const [sRes, zRes] = await Promise.all([
      fetch('/api/seats'),
      fetch('/api/zones')
    ]);
    const [sData, zData] = await Promise.all([
      sRes.json(),
      zRes.json()
    ]);
    setSeats(sData);
    setZones(zData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddZone = async () => {
    await fetch('/api/zones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newZoneName })
    });
    setNewZoneName('');
    fetchData();
  };

  const handleAddSeats = async () => {
    await fetch('/api/seats/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSeatConfig)
    });
    fetchData();
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Seating Plan</h1>
          <p className="text-zinc-400 mt-1">Real-time seat mapping and allocation.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
          >
            <Plus size={20} /> Configure Seats
          </button>
        </div>
      </div>

      <div className="space-y-12">
        {zones.map(zone => (
          <div key={zone.id} className="space-y-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-white">{zone.name}</h2>
              <div className="h-[1px] flex-1 bg-white/10" />
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-4">
              {seats.filter(s => s.zone_id === zone.id).map(seat => (
                <div 
                  key={seat.id}
                  className={cn(
                    "aspect-square rounded-xl border flex flex-col items-center justify-center p-2 transition-all relative group cursor-help",
                    seat.status === 'available' 
                      ? "bg-zinc-900 border-white/10 hover:border-emerald-500/50" 
                      : "bg-emerald-500/20 border-emerald-500/50"
                  )}
                >
                  <Armchair size={20} className={cn(
                    seat.status === 'available' ? "text-zinc-600" : "text-emerald-400"
                  )} />
                  <span className="text-[10px] font-mono mt-1 text-zinc-500">{seat.section}{seat.seat_number}</span>
                  
                  {seat.status === 'occupied' && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-zinc-900" />
                  )}

                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-zinc-950 border border-white/10 p-2 rounded-lg text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                    <p className="text-white font-bold">Seat {seat.section}{seat.seat_number}</p>
                    <p className="text-zinc-400">Status: {seat.status}</p>
                    {seat.current_student_id && <p className="text-emerald-400">ID: {seat.current_student_id}</p>}
                  </div>
                </div>
              ))}
              {seats.filter(s => s.zone_id === zone.id).length === 0 && (
                <div className="col-span-full py-8 border border-dashed border-white/5 rounded-xl text-center text-zinc-600 text-sm">
                  No seats in this zone. Use "Configure Seats" to add some.
                </div>
              )}
            </div>
          </div>
        ))}

        {zones.length === 0 && (
          <div className="bg-zinc-900/50 border border-dashed border-white/10 rounded-3xl p-12 text-center">
            <Armchair className="mx-auto text-zinc-700 mb-4" size={48} />
            <h3 className="text-white font-bold text-lg">No seats configured</h3>
            <p className="text-zinc-500 max-w-xs mx-auto mt-2">Start by adding zones and sections to your library layout.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Configure Seating</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 space-y-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Add New Zone</h3>
                  <div className="flex gap-2">
                    <input 
                      placeholder="e.g. Quiet Zone"
                      className="flex-1 bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      value={newZoneName}
                      onChange={e => setNewZoneName(e.target.value)}
                    />
                    <button 
                      onClick={handleAddZone}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl transition-all"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Bulk Add Seats</h3>
                  <div className="space-y-3">
                    <select 
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      value={newSeatConfig.zone_id}
                      onChange={e => setNewSeatConfig({...newSeatConfig, zone_id: e.target.value})}
                    >
                      <option value="">Select Zone</option>
                      {zones.map(z => (
                        <option key={z.id} value={z.id}>{z.name}</option>
                      ))}
                    </select>
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        placeholder="Section (e.g. A)"
                        className="bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                        value={newSeatConfig.section}
                        onChange={e => setNewSeatConfig({...newSeatConfig, section: e.target.value})}
                      />
                      <input 
                        type="number"
                        placeholder="Count"
                        className="bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                        value={newSeatConfig.count}
                        onChange={e => setNewSeatConfig({...newSeatConfig, count: parseInt(e.target.value)})}
                      />
                    </div>
                    <button 
                      onClick={handleAddSeats}
                      className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl transition-all"
                    >
                      Generate Seats
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AttendanceSystem = () => {
  const [studentId, setStudentId] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState<'check-in' | 'check-out' | null>(null);

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;

    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode("reader");
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };
        
        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            setStudentId(decodedText);
            setIsScanning(false);
            if (scanMode) {
              handleAction(scanMode, decodedText);
            }
            stopScanner();
          },
          () => {} // Silent scan errors
        );
      } catch (err) {
        console.error("Camera start error:", err);
        setStatus({ type: 'error', message: 'Could not access camera. Please check permissions.' });
        setIsScanning(false);
      }
    };

    const stopScanner = async () => {
      if (html5QrCode && html5QrCode.isScanning) {
        try {
          await html5QrCode.stop();
          await html5QrCode.clear();
        } catch (err) {
          console.error("Camera stop error:", err);
        }
      }
    };

    if (isScanning) {
      // Small delay to ensure the "reader" div is mounted
      const timer = setTimeout(startScanner, 100);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    }
  }, [isScanning, scanMode]);

  const handleAction = async (type: 'check-in' | 'check-out', idOverride?: string) => {
    const id = idOverride || studentId;
    if (!id) {
      setStatus({ type: 'error', message: 'Please enter or scan a Student ID' });
      return;
    }

    const res = await fetch(`/api/attendance/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: id })
    });
    const data = await res.json();
    if (res.ok) {
      setStatus({ 
        type: 'success', 
        message: `${type === 'check-in' ? 'Checked in! Seat: ' + data.seat_id : 'Checked out successfully'}` 
      });
      setStudentId('');
      setScanMode(null);
    } else {
      setStatus({ type: 'error', message: data.error });
    }
    setTimeout(() => setStatus(null), 5000);
  };

  return (
    <div className="max-w-md mx-auto space-y-8 py-12 px-4">
      <div className="text-center space-y-2">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <QrCode className="text-emerald-500" size={40} />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Attendance Kiosk</h1>
        <p className="text-zinc-400">Scan your QR code for automatic seat allocation.</p>
      </div>

      <div className="bg-zinc-900 border border-white/5 p-8 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/20" />
        
        {isScanning ? (
          <div className="space-y-4">
            <div id="reader" className="overflow-hidden rounded-2xl border border-white/10 bg-black min-h-[300px]" />
            <button 
              onClick={() => {
                setIsScanning(false);
                setScanMode(null);
              }}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <X size={20} /> Cancel Scan
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Student ID</label>
              <div className="relative">
                <input 
                  placeholder="Enter ID..."
                  className="w-full bg-zinc-950 border border-white/10 rounded-2xl px-6 py-4 text-xl text-white font-mono focus:outline-none focus:border-emerald-500 transition-all text-center"
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                />
                {studentId && (
                  <button 
                    onClick={() => setStudentId('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    <RotateCcw size={18} />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => {
                    setScanMode('check-in');
                    setIsScanning(true);
                  }}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl transition-all flex flex-col items-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <Camera size={24} />
                  Scan to In
                </button>
                <button 
                  onClick={() => {
                    setScanMode('check-out');
                    setIsScanning(true);
                  }}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-2xl transition-all flex flex-col items-center gap-2"
                >
                  <Camera size={24} />
                  Scan to Out
                </button>
              </div>
              
              <div className="h-[1px] bg-white/5 my-2 flex items-center justify-center">
                <span className="bg-zinc-900 px-3 text-[10px] text-zinc-600 uppercase tracking-widest">Or use manual buttons</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleAction('check-in')}
                  className="border border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400 font-bold py-3 rounded-2xl transition-all text-sm"
                >
                  Manual In
                </button>
                <button 
                  onClick={() => handleAction('check-out')}
                  className="border border-white/10 hover:bg-white/5 text-zinc-400 font-bold py-3 rounded-2xl transition-all text-sm"
                >
                  Manual Out
                </button>
              </div>
            </div>
          </>
        )}

        <AnimatePresence>
          {status && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={cn(
                "p-4 rounded-2xl border text-center font-medium",
                status.type === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"
              )}
            >
              {status.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="text-center space-y-4">
        <p className="text-zinc-500 text-sm">Automatic seat allocation is enabled based on availability.</p>
        <Link to="/" className="text-emerald-500 hover:underline text-sm font-medium">Back to Dashboard</Link>
      </div>
    </div>
  );
};

const SubscriptionManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [amount, setAmount] = useState('500');
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const fetchData = async () => {
    const [sRes, lRes] = await Promise.all([
      fetch('/api/students'),
      fetch('/api/subscriptions/ledger')
    ]);
    setStudents(await sRes.json());
    setLedger(await lRes.json());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: selectedStudent, amount: parseFloat(amount) })
    });
    if (res.ok) {
      setStatus({ type: 'success', message: 'Subscription activated successfully!' });
      fetchData();
    } else {
      setStatus({ type: 'error', message: 'Failed to activate subscription.' });
    }
    setTimeout(() => setStatus(null), 5000);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight">Subscriptions & Payments</h1>
        <p className="text-zinc-400 mt-1">Manage member plans and track payment history.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-zinc-900 border border-white/5 p-6 rounded-2xl space-y-6">
            <h3 className="text-lg font-semibold text-white">New Subscription</h3>
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Select Student</label>
                <select 
                  required
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  value={selectedStudent}
                  onChange={e => setSelectedStudent(e.target.value)}
                >
                  <option value="">Choose a student...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Amount (₹)</label>
                <input 
                  type="number"
                  required
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Validity</label>
                <div className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-zinc-500">
                  1 Month (Standard)
                </div>
              </div>
              <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all mt-4">
                Activate Plan
              </button>
            </form>

            <AnimatePresence>
              {status && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={cn(
                    "p-4 rounded-xl border text-center text-sm font-medium",
                    status.type === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                  )}
                >
                  {status.message}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <h3 className="text-lg font-semibold text-white">Payment Ledger</h3>
            </div>
            <table className="w-full text-left">
              <thead className="bg-white/5 text-zinc-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Student</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Expiry</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {ledger.map((entry) => (
                  <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-white font-medium">{entry.student_name}</span>
                        <span className="text-zinc-500 text-xs">{entry.student_id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white font-mono">₹{entry.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-zinc-400">
                      {format(new Date(entry.start_date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {format(new Date(entry.end_date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-md text-xs font-medium",
                        entry.status === 'active' ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                      )}>
                        {entry.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const Reports = () => {
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports/attendance')
      .then(res => res.json())
      .then(data => {
        setAttendanceLogs(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight">Reports & Analytics</h1>
        <p className="text-zinc-400 mt-1">Detailed insights into library operations.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-white/5 p-6 rounded-2xl hover:border-emerald-500/30 transition-all group">
          <FileText className="text-emerald-500 mb-4 group-hover:scale-110 transition-transform" size={32} />
          <h3 className="text-white font-bold mb-1">Attendance Report</h3>
          <p className="text-zinc-500 text-sm">Daily, weekly, and monthly member attendance logs.</p>
        </div>
        <Link to="/subscriptions" className="bg-zinc-900 border border-white/5 p-6 rounded-2xl hover:border-blue-500/30 transition-all group">
          <CreditCard className="text-blue-500 mb-4 group-hover:scale-110 transition-transform" size={32} />
          <h3 className="text-white font-bold mb-1">Payment Ledger</h3>
          <p className="text-zinc-500 text-sm">Comprehensive record of all subscription payments.</p>
        </Link>
        <div className="bg-zinc-900 border border-white/5 p-6 rounded-2xl hover:border-purple-500/30 transition-all group">
          <Armchair className="text-purple-500 mb-4 group-hover:scale-110 transition-transform" size={32} />
          <h3 className="text-white font-bold mb-1">Occupancy Trends</h3>
          <p className="text-zinc-500 text-sm">Peak hours and seat utilization analysis.</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">Attendance Logs</h3>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-zinc-800 text-zinc-400 text-xs rounded-md hover:text-white transition-colors">Export CSV</button>
            <button className="px-3 py-1 bg-zinc-800 text-zinc-400 text-xs rounded-md hover:text-white transition-colors">Print</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-zinc-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Student</th>
                <th className="px-6 py-4 font-medium">Seat</th>
                <th className="px-6 py-4 font-medium">Check In</th>
                <th className="px-6 py-4 font-medium">Check Out</th>
                <th className="px-6 py-4 font-medium">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">Loading logs...</td>
                </tr>
              ) : attendanceLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">No attendance records found.</td>
                </tr>
              ) : (
                attendanceLogs.map((log) => {
                  const checkIn = new Date(log.check_in);
                  const checkOut = log.check_out ? new Date(log.check_out) : null;
                  let duration = '-';
                  
                  if (checkOut) {
                    const diff = Math.floor((checkOut.getTime() - checkIn.getTime()) / 60000);
                    const hours = Math.floor(diff / 60);
                    const mins = diff % 60;
                    duration = `${hours}h ${mins}m`;
                  }

                  return (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-white font-medium">{log.student_name}</span>
                          <span className="text-zinc-500 text-[10px]">{log.student_id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-white">{log.zone_name}</span>
                          <span className="text-zinc-500 text-[10px]">{log.section}{log.seat_number}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-400">
                        {format(checkIn, 'MMM dd, HH:mm')}
                      </td>
                      <td className="px-6 py-4 text-zinc-400">
                        {checkOut ? format(checkOut, 'MMM dd, HH:mm') : (
                          <span className="text-emerald-500 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-zinc-400 font-mono">
                        {duration}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SettingsPage = () => {
  return (
    <div className="space-y-8 max-w-4xl">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight">System Settings</h1>
        <p className="text-zinc-400 mt-1">Configure library capacity and system preferences.</p>
      </header>

      <div className="space-y-6">
        <div className="bg-zinc-900 border border-white/5 p-6 rounded-2xl space-y-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Armchair size={20} className="text-emerald-500" />
            Library Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Total Capacity</label>
              <input 
                type="number"
                defaultValue="50"
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <p className="text-[10px] text-zinc-600">Maximum number of students allowed at once.</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Auto-Allocation</label>
              <div className="flex items-center gap-3 bg-zinc-950 border border-white/10 rounded-xl px-4 py-2">
                <div className="w-10 h-5 bg-emerald-500 rounded-full relative">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                </div>
                <span className="text-sm text-white">Enabled</span>
              </div>
              <p className="text-[10px] text-zinc-600">Automatically assign the next available seat.</p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-white/5 p-6 rounded-2xl space-y-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <ShieldCheck size={20} className="text-blue-500" />
            Security & Access
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div>
                <p className="text-white font-medium">QR Code Authentication</p>
                <p className="text-xs text-zinc-500">Require QR scan for entry and exit.</p>
              </div>
              <div className="w-10 h-5 bg-emerald-500 rounded-full relative">
                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div>
                <p className="text-white font-medium">Subscription Enforcement</p>
                <p className="text-xs text-zinc-500">Block entry for expired subscriptions.</p>
              </div>
              <div className="w-10 h-5 bg-emerald-500 rounded-full relative">
                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button className="px-6 py-2 rounded-xl text-zinc-400 hover:text-white transition-colors">Cancel</button>
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-2 rounded-xl transition-all">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const MainLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex bg-black min-h-screen font-sans selection:bg-emerald-500 selection:text-white">
    <Sidebar />
    <main className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </main>
  </div>
);

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/kiosk" element={<AttendanceSystem />} />
        <Route path="/*" element={
          <MainLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/staff" element={<StaffManagement />} />
              <Route path="/students" element={<StudentManagement />} />
              <Route path="/seating" element={<SeatingPlan />} />
              <Route path="/subscriptions" element={<SubscriptionManagement />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </MainLayout>
        } />
      </Routes>
    </Router>
  );
}
