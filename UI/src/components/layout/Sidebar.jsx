import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Building2, 
  Layers, 
  MapPin, 
  PlusCircle, 
  TrendingUp, 
  AlertCircle,
  ShieldAlert,
  Flame,
  Headphones,
  ShieldCheck
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function Sidebar({ activeView, setActiveView, criticalCount = 0 }) {
  const { user } = useAuth();

  const navItems = [
    {
      id: 'officer',
      label: 'Grievance Officer',
      sublabel: 'AI Morning Prioritization',
      icon: LayoutDashboard,
      badge: criticalCount > 0 ? `${criticalCount} Critical` : null,
      badgeVariant: 'critical'
    },
    {
      id: 'supervisor',
      label: 'Dept Supervisor',
      sublabel: user?.department_name ? user.department_name.split(' ')[0] : 'Water & Civic',
      icon: Building2,
      badge: null,
      badgeVariant: 'default'
    },
    {
      id: 'clusters',
      label: 'Systemic Clusters',
      sublabel: 'Correlated Issue Groups',
      icon: Layers,
      badge: '',
      badgeVariant: 'default'
    },
    {
      id: 'heatmap',
      label: 'Geo Map & Trends',
      sublabel: 'Ward Outage Density',
      icon: MapPin,
      badge: null
    },
    {
      id: 'submit',
      label: 'Citizen Submission',
      sublabel: 'Live AI Triage & Routing',
      icon: PlusCircle,
      badge: '',
      badgeVariant: 'blue'
    },
    {
      id: 'voice',
      label: 'AI Voice Agent',
      sublabel: '1800-425-GHMC & Verification',
      icon: Headphones,
      badge: '',
      badgeVariant: 'critical'
    }
    /*
    {
      id: 'evals',
      label: 'Guardrails & Evals',
      sublabel: 'Safety, PII & Benchmarks',
      icon: ShieldCheck,
      badge: '98.4%',
      badgeVariant: 'low'
    }
    */
  ];

  return (
    <aside className="hidden md:flex w-52 lg:w-56 shrink-0 border-r border-[#dddddd] bg-white p-3 flex-col justify-between">
      <div className="space-y-4 w-full">
        
        {/* Navigation Label */}
        <div className="px-2.5 pt-1">
          <p className="text-[9px] font-medium uppercase tracking-wider text-[#555b66]">
            Main Menu
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1 w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center justify-between gap-2 rounded-[8px] px-2.5 py-2 text-left transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#f8fafc] text-[#181d26] font-semibold border border-[#dddddd] shadow-2xs'
                    : 'text-[#333840] hover:bg-[#f8fafc] hover:text-[#181d26] font-normal'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-1 rounded-[5px] transition-colors ${
                    isActive ? 'bg-[#181d26] text-white' : 'bg-[#f8fafc] text-[#555b66] border border-[#dddddd]'
                  }`}>
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs leading-none">{item.label}</div>
                    <div className="text-[9px] text-[#555b66] font-normal leading-tight mt-0.5">
                      {item.sublabel}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <Badge variant={item.badgeVariant || 'default'} className="text-[9px] px-1 py-0 shrink-0 font-medium">
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>

      </div>

      {/* User Info footer */}
      <div className="pt-3 border-t border-[#dddddd]">
        <div className="flex items-center gap-2 px-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-[#006400] animate-pulse" />
          <span className="text-[10px] font-medium text-[#555b66]">
            System Online (120 Tickets)
          </span>
        </div>
      </div>
    </aside>
  );
}


