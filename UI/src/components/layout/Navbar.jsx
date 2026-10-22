import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  ShieldCheck, 
  Sparkles, 
  UserCheck, 
  LogOut, 
  ChevronDown, 
  Building2, 
  Layers, 
  AlertTriangle,
  RotateCcw,
  Menu,
  X,
  LayoutDashboard,
  MapPin,
  PlusCircle,
  Headphones
} from 'lucide-react';
import { api } from '@/api/client';

export function Navbar({ activeView, setActiveView }) {
  const { user, loginAsDemo, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const demoAccounts = [
    {
      id: 'USR-001',
      email: 'officer@grievance.gov',
      name: 'Dr. Ramesh Verma',
      title: 'Chief Grievance Officer',
      role: 'officer',
      department_id: null,
      department_name: 'Central Grievance Cell',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'USR-002',
      email: 'supervisor@grievance.gov',
      name: 'A. K. Sharma',
      title: 'Zonal Supervisor - Water',
      role: 'supervisor',
      department_id: 'DEP-WATER-HYD',
      department_name: 'Hyderabad Water Supply Department',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'USR-003',
      email: 'sanitation@grievance.gov',
      name: 'Meera Nambiar',
      title: 'Supervisor - Sanitation',
      role: 'supervisor',
      department_id: 'DEP-SAN-HYD',
      department_name: 'GHMC Sanitation Department',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'USR-004',
      email: 'roads@grievance.gov',
      name: 'Venkatesh Rao',
      title: 'Supervising Engineer - Roads',
      role: 'supervisor',
      department_id: 'DEP-ROADS-HYD',
      department_name: 'GHMC Roads Department',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    }
  ];

  const navItems = [
    { id: 'officer', label: 'Officer Queue', icon: LayoutDashboard },
    { id: 'supervisor', label: 'Supervisor View', icon: Building2 },
    { id: 'clusters', label: 'Incident Clusters', icon: Layers },
    { id: 'heatmap', label: 'GIS Outage Map', icon: MapPin },
    { id: 'submit', label: 'Submit Grievance', icon: PlusCircle },
    { id: 'voice', label: 'AI Voice Agent', icon: Headphones }
    // { id: 'evals', label: 'Guardrails & Evals', icon: ShieldCheck }
  ];

  const handleSwitchAccount = (acc) => {
    loginAsDemo(acc);
    setDropdownOpen(false);
    if (acc.role === 'supervisor') {
      setActiveView('supervisor');
    } else {
      setActiveView('officer');
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset dataset to initial 120 CSV records?')) return;
    setIsResetting(true);
    try {
      await api.resetDataset();
      window.location.reload();
    } catch (e) {
      alert('Reset failed: ' + e.message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#dddddd] bg-white">
      <div className="flex h-14 items-center justify-between px-3 sm:px-6 max-w-7xl mx-auto w-full">
        
        {/* Left: Hamburger & Brand */}
        <div className="flex items-center gap-2.5">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-[6px] text-[#181d26] hover:bg-[#f8fafc] border border-[#dddddd]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          <div className="flex h-7.5 w-7.5 items-center justify-center rounded-[7px] bg-[#181d26] text-white shadow-xs">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm sm:text-base tracking-tight text-[#181d26]">
                CivicAI
              </span>
              <Badge variant="default" className="text-[9px] sm:text-[10px] px-1.5 py-0 font-medium bg-[#f8fafc] text-[#181d26] border-[#dddddd] hidden xs:inline-flex">
                <Sparkles className="h-2 w-2 mr-1 text-[#181d26]" /> LLM Active
              </Badge>
            </div>
            <p className="text-[10px] text-[#555b66] hidden sm:block font-normal leading-none mt-0.5">
              Grievance Intelligence &amp; Resolution System
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Reset button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReset} 
            disabled={isResetting}
            className="text-[11px] text-[#555b66] hover:text-[#181d26] hidden lg:flex items-center gap-1 h-8 px-2.5"
            title="Reset dataset to original 120 CSV records"
          >
            <RotateCcw className={`h-3 w-3 ${isResetting ? 'animate-spin' : ''}`} />
            Reset Data
          </Button>

          {/* Quick Persona Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-[8px] border border-[#dddddd] bg-white px-2.5 py-1 text-left hover:bg-[#f8fafc] transition-all cursor-pointer focus:outline-none"
            >
              <Avatar className="h-6 w-6 border border-[#dddddd]">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{user?.name?.substring(0, 2) || 'OF'}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <div className="text-[11px] font-medium text-[#181d26] leading-tight truncate max-w-[120px]">
                  {user?.name}
                </div>
                <div className="text-[9px] text-[#555b66] leading-tight truncate max-w-[120px]">
                  {user?.title || user?.role}
                </div>
              </div>
              <ChevronDown className="h-3 w-3 text-[#555b66]" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-64 rounded-[10px] border border-[#dddddd] bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 z-50">
                <div className="px-2.5 py-1.5 border-b border-[#dddddd] mb-1">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-[#555b66]">
                    Switch Demo Persona
                  </p>
                </div>
                
                <div className="space-y-0.5">
                  {demoAccounts.map(acc => {
                    const isCurrent = user?.email === acc.email;
                    return (
                      <button
                        key={acc.id}
                        onClick={() => handleSwitchAccount(acc)}
                        className={`flex w-full items-center gap-2 rounded-[6px] px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                          isCurrent 
                            ? 'bg-[#f8fafc] text-[#181d26] font-semibold border border-[#dddddd]' 
                            : 'hover:bg-[#f8fafc] text-[#333840]'
                        }`}
                      >
                        <Avatar className="h-5 w-5 border border-[#dddddd]">
                          <AvatarImage src={acc.avatar} />
                          <AvatarFallback>{acc.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                          <div className="truncate text-xs font-medium">{acc.name}</div>
                          <div className="truncate text-[9px] text-[#555b66]">{acc.title}</div>
                        </div>
                        {isCurrent && <Badge variant="dark" className="text-[8px] px-1 py-0">Active</Badge>}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-1.5 pt-1.5 border-t border-[#dddddd]">
                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-1.5 rounded-[6px] px-2.5 py-1.5 text-xs font-medium text-[#aa2d00] hover:bg-[#fef2f2] transition-colors cursor-pointer"
                  >
                    <LogOut className="h-3 w-3" /> Log Out
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#dddddd] bg-[#f8fafc] px-3 py-2 space-y-1 animate-in slide-in-from-top-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 px-3 py-2 rounded-[6px] text-xs font-medium transition-colors ${
                  isActive 
                    ? 'bg-[#181d26] text-white' 
                    : 'text-[#333840] hover:bg-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}


