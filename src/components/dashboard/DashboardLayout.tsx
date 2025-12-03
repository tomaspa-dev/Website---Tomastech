import React, { useState } from 'react';
import { LayoutDashboard, Receipt, MessageSquare, BarChart3, LogOut, Bell, Settings, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Data for DemoUser
const DEMO_DATA = {
  user: {
    name: "Demo User",
    email: "demo@tomastech.dev",
    // Real person image (Unsplash)
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  projects: [
    { id: 1, name: "E-Commerce Platform Redesign", status: "In Progress", progress: 65, startDate: "Oct 15, 2025", type: "Premium Web App" },
    { id: 2, name: "Corporate Landing Page", status: "Pending", progress: 0, startDate: "Dec 01, 2025", type: "Standard Website" }
  ],
  invoices: [
    { id: "INV-2025-001", date: "Oct 15, 2025", amount: "$2,500.00", status: "Paid", item: "Initial Deposit - E-Commerce" },
    { id: "INV-2025-002", date: "Nov 01, 2025", amount: "$1,200.00", status: "Paid", item: "Hosting & Domain Setup" }
  ]
};

export default function DashboardLayout() {
  const [activeTab, setActiveTab] = useState<'overview' | 'billing' | 'chat'>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const [hasNotification, setHasNotification] = useState(true);

  const handleTabChange = (tab: 'overview' | 'billing' | 'chat') => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false); // Close mobile menu on navigate
    
    if (tab === 'chat') {
      setUnreadCount(0);
      setHasNotification(false);
    }
  };

  const handleLogout = () => {
    // Simulate logout
    window.location.href = '/client-access';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'billing', label: 'Billing', icon: Receipt },
    { id: 'chat', label: 'Messages', icon: MessageSquare },
  ];

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans">
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-black/90 md:bg-black/50 backdrop-blur-xl border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-lg">
              T
            </div>
            <span className="font-bold text-xl tracking-tight">Tomastech<span className="text-primary">.dev</span></span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="md:hidden absolute top-4 right-4 text-gray-400 hover:text-white transition-all duration-300 ease-in-out hover:scale-110"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'bg-primary/10 text-primary border border-primary/20' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <tab.icon size={20} />
              <span className="font-medium">{tab.label}</span>
              {tab.id === 'chat' && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
            <img src={DEMO_DATA.user.avatar} alt="User" className="w-10 h-10 rounded-full bg-white/10 object-cover" />
            <div className="flex-1 overflow-hidden">
              <h4 className="font-bold text-sm truncate">{DEMO_DATA.user.name}</h4>
              <p className="text-xs text-gray-400 truncate">{DEMO_DATA.user.email}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-400 transition-colors p-1"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative w-full">
        {/* Header */}
        <header className="h-20 border-b border-white/10 flex items-center justify-between px-4 md:px-8 bg-black/20 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-gray-400 hover:text-white"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl md:text-2xl font-bold capitalize">{activeTab}</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors relative">
              <Bell size={20} />
              {hasNotification && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>
            <button className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          {/* Background Ambient Light */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
             <div className="absolute top-[-20%] right-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
             <div className="absolute bottom-[-20%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto pb-20 md:pb-0">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div 
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-400">Active Projects</span>
                        <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400"><LayoutDashboard size={20} /></div>
                      </div>
                      <h3 className="text-4xl font-bold">2</h3>
                      <p className="text-sm text-green-400 mt-2 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span> All systems operational
                      </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-400">Total Spent</span>
                        <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400"><Receipt size={20} /></div>
                      </div>
                      <h3 className="text-4xl font-bold">$3,700</h3>
                      <p className="text-sm text-gray-400 mt-2">Lifetime value</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-400">Unread Messages</span>
                        <div className="p-2 rounded-lg bg-green-500/20 text-green-400"><MessageSquare size={20} /></div>
                      </div>
                      <h3 className="text-4xl font-bold">{unreadCount}</h3>
                      <p className="text-sm text-gray-400 mt-2">Last active: 2 hours ago</p>
                    </div>
                  </div>

                  {/* Active Projects List */}
                  <div>
                    <h3 className="text-xl font-bold mb-4">Active Projects</h3>
                    <div className="grid gap-4">
                      {DEMO_DATA.projects.map((project) => (
                        <div key={project.id} className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all duration-300">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <h4 className="text-lg font-bold">{project.name}</h4>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                  project.status === 'In Progress' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                  'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                                }`}>
                                  {project.status}
                                </span>
                              </div>
                              <p className="text-gray-400 text-sm">{project.type} • Started {project.startDate}</p>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="flex-1 w-full md:w-48">
                                <div className="flex justify-between text-xs mb-2">
                                  <span>Progress</span>
                                  <span>{project.progress}%</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000" 
                                    style={{ width: `${project.progress}%` }}
                                  />
                                </div>
                              </div>
                              <button className="px-4 py-2 rounded-lg bg-white text-black font-bold text-sm hover:scale-105 transition-transform whitespace-nowrap">
                                Details
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'billing' && (
                <motion.div 
                  key="billing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <h3 className="text-xl font-bold mb-6">Billing History</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                          <tr className="text-gray-400 border-b border-white/10">
                            <th className="py-4 px-4 font-medium">Invoice ID</th>
                            <th className="py-4 px-4 font-medium">Date</th>
                            <th className="py-4 px-4 font-medium">Description</th>
                            <th className="py-4 px-4 font-medium">Amount</th>
                            <th className="py-4 px-4 font-medium">Status</th>
                            <th className="py-4 px-4 font-medium text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {DEMO_DATA.invoices.map((inv) => (
                            <tr key={inv.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="py-4 px-4 font-mono text-sm">{inv.id}</td>
                              <td className="py-4 px-4 text-gray-400">{inv.date}</td>
                              <td className="py-4 px-4">{inv.item}</td>
                              <td className="py-4 px-4 font-bold">{inv.amount}</td>
                              <td className="py-4 px-4">
                                <span className="px-2 py-1 rounded text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                                  {inv.status}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <button className="text-primary hover:text-white transition-colors text-sm font-medium">
                                  Download PDF
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'chat' && (
                <motion.div 
                  key="chat"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col md:flex-row rounded-2xl border border-white/10 bg-white/5 overflow-hidden h-[70vh] md:h-[600px]"
                >
                  {/* Chat Sidebar */}
                  <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/10 bg-black/20 p-4 shrink-0">
                    <h3 className="font-bold mb-4">Conversations</h3>
                    <div className="space-y-2 flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-2 md:gap-0 pb-2 md:pb-0">
                      <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 cursor-pointer min-w-[200px] md:min-w-0">
                        <div className="flex justify-between mb-1">
                          <span className="font-bold text-sm">Tomastech Support</span>
                          <span className="text-xs text-gray-400">10:42 AM</span>
                        </div>
                        <p className="text-xs text-gray-300 truncate">Hey! Just checking in on the design review.</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chat Area */}
                  <div className="flex-1 flex flex-col bg-black/40 min-h-0">
                    <div className="flex-1 p-4 md:p-6 space-y-4 overflow-y-auto overscroll-contain">
                      <div className="flex justify-end">
                        <div className="max-w-[85%] md:max-w-[70%] p-4 rounded-2xl rounded-tr-none bg-primary text-white">
                          <p className="text-sm">Hi! I've reviewed the latest mockups. They look great!</p>
                          <span className="text-[10px] opacity-70 mt-1 block text-right">10:30 AM</span>
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="max-w-[85%] md:max-w-[70%] p-4 rounded-2xl rounded-tl-none bg-white/10 border border-white/5">
                          <p className="text-sm">Awesome! Glad you like them. We'll proceed with the implementation phase next week.</p>
                          <span className="text-[10px] text-gray-400 mt-1 block">10:32 AM</span>
                        </div>
                      </div>
                      <div className="flex justify-start">
                         <div className="max-w-[85%] md:max-w-[70%] p-4 rounded-2xl rounded-tl-none bg-white/10 border border-white/5">
                          <p className="text-sm">Do you have any specific requirements for the payment gateway integration?</p>
                          <span className="text-[10px] text-gray-400 mt-1 block">10:42 AM</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border-t border-white/10 bg-black/20 shrink-0">
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Type a message..." 
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                        />
                        <button className="p-3 rounded-xl bg-primary text-white hover:bg-primary/80 transition-colors">
                          <MessageSquare size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
