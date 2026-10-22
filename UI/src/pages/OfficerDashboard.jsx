import React, { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { PriorityExplainerSheet } from '@/components/common/PriorityExplainerSheet';
import { 
  AlertOctagon, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Search, 
  Filter, 
  Sparkles, 
  Flame, 
  Clock, 
  MapPin, 
  Building, 
  ArrowUpDown, 
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  BarChart2,
  Layers,
  RefreshCw,
  Users
} from 'lucide-react';

export function OfficerDashboard() {
  const [summary, setSummary] = useState(null);
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrievanceId, setSelectedGrievanceId] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Filter States
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [localityFilter, setLocalityFilter] = useState('all');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [localities, setLocalities] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, grvRes, deptsRes, heatmapRes] = await Promise.all([
        api.getOfficerSummary(),
        api.getGrievances({
          priority: priorityFilter,
          department_id: departmentFilter,
          status: statusFilter,
          locality: localityFilter,
          is_overdue: overdueOnly ? 'true' : undefined,
          search: search
        }),
        api.getDepartments(),
        api.getHeatmapData()
      ]);

      setSummary(sumRes);
      setGrievances(grvRes.grievances || []);
      setDepartments(deptsRes || []);
      setLocalities(heatmapRes.map(h => h.locality) || []);
    } catch (err) {
      console.error('Failed to load officer dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [priorityFilter, departmentFilter, statusFilter, localityFilter, overdueOnly]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleRowClick = (id) => {
    setSelectedGrievanceId(id);
    setSheetOpen(true);
  };

  const pb = summary?.priority_breakdown || { critical: 48, high: 16, medium: 12, low: 44 };

  return (
    <div className="space-y-5 pb-10">
      
      {/* Top Greeting & Morning AI Brief */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#dddddd] pb-3.5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-medium text-[#181d26] tracking-tight">
              Officer Triage Command Center
            </h1>
            <Badge variant="default" className="text-[10px] font-medium">
              Morning Priority Queue
            </Badge>
          </div>
          <p className="text-xs text-[#555b66] font-normal mt-0.5 leading-relaxed">
            AI has triaged and scored <strong className="text-[#181d26] font-medium">{summary?.total_complaints || 120} grievances</strong> across Hyderabad. Showing immediate high-risk emergencies first.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={loadData} className="text-xs gap-1 bg-white h-8 px-2.5">
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            Refresh Triage
          </Button>
        </div>
      </div>

      {/* PRIORITY SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Critical */}
        <div 
          onClick={() => setPriorityFilter(priorityFilter === 'critical' ? 'all' : 'critical')}
          className={`rounded-[10px] border p-3.5 sm:p-4 transition-all duration-150 cursor-pointer shadow-2xs ${
            priorityFilter === 'critical' 
              ? 'bg-[#fef2f2] border-[#aa2d00] ring-1 ring-[#aa2d00]/30' 
              : 'bg-white border-[#dddddd] hover:bg-[#fef2f2]/40 hover:border-[#aa2d00]/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-[#aa2d00] flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#aa2d00] animate-pulse" />
              Critical
            </span>
            <AlertOctagon className="h-3.5 w-3.5 text-[#aa2d00]" />
          </div>
          <div className="text-2xl sm:text-3xl font-normal text-[#aa2d00] mt-2 leading-none">
            {pb.critical}
          </div>
          <p className="text-[10px] sm:text-[11px] text-[#aa2d00]/90 font-medium mt-1">
            Immediate 4–12 hr dispatch
          </p>
        </div>

        {/* High */}
        <div 
          onClick={() => setPriorityFilter(priorityFilter === 'high' ? 'all' : 'high')}
          className={`rounded-[10px] border p-3.5 sm:p-4 transition-all duration-150 cursor-pointer shadow-2xs ${
            priorityFilter === 'high' 
              ? 'bg-[#fff7ed] border-[#ea580c] ring-1 ring-[#ea580c]/30' 
              : 'bg-white border-[#dddddd] hover:bg-[#fff7ed]/40 hover:border-[#ea580c]/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-[#ea580c] flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ea580c]" />
              High
            </span>
            <AlertTriangle className="h-3.5 w-3.5 text-[#ea580c]" />
          </div>
          <div className="text-2xl sm:text-3xl font-normal text-[#ea580c] mt-2 leading-none">
            {pb.high}
          </div>
          <p className="text-[10px] sm:text-[11px] text-[#ea580c]/90 font-medium mt-1">
            Target SLA within 24 hours
          </p>
        </div>

        {/* Medium */}
        <div 
          onClick={() => setPriorityFilter(priorityFilter === 'medium' ? 'all' : 'medium')}
          className={`rounded-[10px] border p-3.5 sm:p-4 transition-all duration-150 cursor-pointer shadow-2xs ${
            priorityFilter === 'medium' 
              ? 'bg-[#fefce8] border-[#d9a441] ring-1 ring-[#d9a441]/30' 
              : 'bg-white border-[#dddddd] hover:bg-[#fefce8]/40 hover:border-[#d9a441]/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-[#d9a441] flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d9a441]" />
              Medium
            </span>
            <Info className="h-3.5 w-3.5 text-[#d9a441]" />
          </div>
          <div className="text-2xl sm:text-3xl font-normal text-[#d9a441] mt-2 leading-none">
            {pb.medium}
          </div>
          <p className="text-[10px] sm:text-[11px] text-[#555b66] font-normal mt-1">
            Standard 48 hr resolution queue
          </p>
        </div>

        {/* Low */}
        <div 
          onClick={() => setPriorityFilter(priorityFilter === 'low' ? 'all' : 'low')}
          className={`rounded-[10px] border p-3.5 sm:p-4 transition-all duration-150 cursor-pointer shadow-2xs ${
            priorityFilter === 'low' 
              ? 'bg-[#f0fdf4] border-[#006400] ring-1 ring-[#006400]/30' 
              : 'bg-white border-[#dddddd] hover:bg-[#f0fdf4]/40 hover:border-[#006400]/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-[#006400] flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#006400]" />
              Low / Resolved
            </span>
            <CheckCircle2 className="h-3.5 w-3.5 text-[#006400]" />
          </div>
          <div className="text-2xl sm:text-3xl font-normal text-[#006400] mt-2 leading-none">
            {pb.low}
          </div>
          <p className="text-[10px] sm:text-[11px] text-[#555b66] font-normal mt-1">
            Routine civic requests &amp; closed
          </p>
        </div>

      </div>



      {/* FILTER & SEARCH TOOLBAR */}
      <Card className="p-3 sm:p-3.5 bg-white border-[#dddddd] shadow-2xs rounded-[10px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 items-center">
          
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <form onSubmit={handleSearchSubmit}>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search complaint text, ward, locality..."
                className="pl-8 text-xs h-9"
              />
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-[#555b66]" />
            </form>
          </div>

          {/* Department Filter */}
          <div>
            <Select 
              value={departmentFilter} 
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="text-xs h-9"
            >
              <option value="all">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </Select>
          </div>

          {/* Locality Filter */}
          <div>
            <Select 
              value={localityFilter} 
              onChange={(e) => setLocalityFilter(e.target.value)}
              className="text-xs h-9"
            >
              <option value="all">All Localities</option>
              {localities.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </Select>
          </div>

          {/* Status Filter */}
          <div>
            <Select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs h-9"
            >
              <option value="all">All Statuses</option>
              <option value="In Progress">In Progress</option>
              <option value="Escalated">Escalated</option>
              <option value="Resolved">Resolved</option>
            </Select>
          </div>

          {/* Overdue Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={overdueOnly ? 'danger' : 'outline'}
              size="sm"
              onClick={() => setOverdueOnly(!overdueOnly)}
              className="w-full text-xs font-medium h-9"
            >
              <Clock className="h-3 w-3 mr-1" />
              {overdueOnly ? 'Overdue Active' : 'Filter Overdue'}
            </Button>
          </div>

        </div>

        {/* Active Filter Chips */}
        {(priorityFilter !== 'all' || departmentFilter !== 'all' || statusFilter !== 'all' || localityFilter !== 'all' || overdueOnly || search) && (
          <div className="flex items-center gap-1.5 flex-wrap mt-2.5 pt-2.5 border-t border-[#dddddd] text-xs">
            <span className="text-[#555b66] font-medium text-[10px] sm:text-[11px]">Active Filters:</span>
            {priorityFilter !== 'all' && <Badge variant="critical">Priority: {priorityFilter}</Badge>}
            {departmentFilter !== 'all' && <Badge variant="default">Dept Filtered</Badge>}
            {statusFilter !== 'all' && <Badge variant="blue">Status: {statusFilter}</Badge>}
            {localityFilter !== 'all' && <Badge variant="default">{localityFilter}</Badge>}
            {overdueOnly && <Badge variant="critical">SLA Overdue</Badge>}
            {search && <Badge variant="default">Query: "{search}"</Badge>}
            <button
              onClick={() => {
                setPriorityFilter('all');
                setDepartmentFilter('all');
                setStatusFilter('all');
                setLocalityFilter('all');
                setOverdueOnly(false);
                setSearch('');
              }}
              className="text-[10px] sm:text-[11px] text-[#1b61c9] font-medium underline hover:text-[#1a3866] ml-auto cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </Card>

      {/* COMPLAINTS DATA TABLE */}
      <Card className="border-[#dddddd] bg-white shadow-2xs overflow-hidden rounded-[10px]">
        <CardHeader className="p-3.5 sm:p-4 pb-2.5 flex flex-row items-center justify-between border-b border-[#dddddd]">
          <div>
            <CardTitle className="text-sm sm:text-base font-medium text-[#181d26] flex items-center gap-2">
              Prioritized Grievance Queue
              <Badge variant="default" className="text-[10px]">
                {grievances.length} Tickets
              </Badge>
            </CardTitle>
            <CardDescription className="text-[11px] text-[#555b66]">
              Click any grievance to view the <strong>AI Priority Explainer ("Why is this #1?")</strong>, linked similar complaints, and emergency actions.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[110px]">AI Score</TableHead>
                <TableHead className="w-[100px]">ID / Time</TableHead>
                <TableHead>Issue &amp; Citizen Description</TableHead>
                <TableHead>Location / Zone</TableHead>
                <TableHead>Department &amp; Officer</TableHead>
                <TableHead className="text-right">Status / SLA</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {grievances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-xs text-[#555b66]">
                    No grievances matching current filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                grievances.map((g) => {
                  const score = g.ai_priority_score;
                  let scoreVariant = 'low';
                  let barColor = 'low';
                  if (score >= 80) { scoreVariant = 'critical'; barColor = 'critical'; }
                  else if (score >= 60) { scoreVariant = 'high'; barColor = 'high'; }
                  else if (score >= 35) { scoreVariant = 'medium'; barColor = 'medium'; }

                  return (
                    <TableRow
                      key={g.id}
                      onClick={() => handleRowClick(g.id)}
                      className="cursor-pointer hover:bg-[#f8fafc] transition-colors group"
                    >
                      {/* Priority Score Column */}
                      <TableCell className="align-middle">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <Badge variant={scoreVariant} className="text-[10px] font-semibold px-1.5 py-0">
                              {score}/100
                            </Badge>
                            <span className="text-[9px] font-medium uppercase text-[#555b66]">
                              {g.ai_priority_level}
                            </span>
                          </div>
                          <Progress value={score} color={barColor} className="h-1.5 w-16" />
                        </div>
                      </TableCell>

                      {/* ID & Date */}
                      <TableCell className="align-middle">
                        <div className="font-mono text-[11px] font-medium text-[#181d26]">
                          {g.id}
                        </div>
                        <div className="text-[9px] text-[#555b66]">
                          {g.created_at?.substring(5, 16)}
                        </div>
                        <div className="text-[8px] text-[#555b66]/80">
                          via {g.channel}
                        </div>
                      </TableCell>

                      {/* Title & Description */}
                      <TableCell className="max-w-md">
                        <div className="font-medium text-xs text-[#181d26] group-hover:text-[#1b61c9] transition-colors flex items-center gap-1">
                          {g.title}
                          {g.health_risk && <AlertTriangle className="h-3 w-3 text-[#aa2d00] shrink-0" title="Health Risk" />}
                          {g.safety_risk && <ShieldAlert className="h-3 w-3 text-[#ea580c] shrink-0" title="Safety Risk" />}
                        </div>
                        <p className="text-[11px] text-[#555b66] line-clamp-1 mt-0.5">
                          {g.description}
                        </p>
                        {g.repeat_complaint_count > 1 && (
                          <span className="inline-flex items-center gap-1 text-[9px] text-[#181d26] font-medium bg-[#f8fafc] border border-[#dddddd] px-1 py-0.2 rounded mt-0.5">
                            <BarChart2 className="h-2.5 w-2.5 inline text-[#181d26]" />
                            <span>{g.repeat_complaint_count} correlated complaints in {g.locality}</span>
                          </span>
                        )}
                      </TableCell>

                      {/* Location */}
                      <TableCell className="whitespace-nowrap">
                        <div className="text-xs font-medium text-[#181d26] flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-[#181d26] shrink-0" />
                          {g.locality}
                        </div>
                        <div className="text-[10px] text-[#555b66]">
                          Ward {g.ward} • {g.zone}
                        </div>
                      </TableCell>

                      {/* Department */}
                      <TableCell>
                        <div className="text-xs font-medium text-[#181d26] line-clamp-1">
                          {g.department_name}
                        </div>
                        <div className="text-[10px] text-[#555b66]">
                          {g.assigned_officer_name?.split('(')[0]}
                        </div>
                      </TableCell>

                      {/* Status / SLA */}
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end gap-0.5">
                          <Badge 
                            variant={
                              g.status === 'Resolved' ? 'low' : 
                              g.status === 'Escalated' ? 'critical' : 
                              g.status === 'In Progress' ? 'blue' : 'default'
                            }
                            className="text-[9px] py-0"
                          >
                            {g.status}
                          </Badge>

                          {g.is_overdue ? (
                            <span className="text-[9px] font-medium text-[#aa2d00] flex items-center gap-0.5 mt-0.5">
                              <Clock className="h-2.5 w-2.5" /> SLA Breached
                            </span>
                          ) : (
                            <span className="text-[9px] text-[#555b66]">
                              {g.days_open}d active
                            </span>
                          )}
                        </div>
                      </TableCell>

                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Interactive AI Priority Explainer Sheet Modal */}
      <PriorityExplainerSheet
        grievanceId={selectedGrievanceId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onGrievanceUpdated={loadData}
      />

    </div>
  );
}


