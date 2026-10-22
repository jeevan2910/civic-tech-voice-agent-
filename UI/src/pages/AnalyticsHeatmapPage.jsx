import React, { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { PriorityExplainerSheet } from '@/components/common/PriorityExplainerSheet';
import { 
  MapContainer, 
  TileLayer, 
  CircleMarker, 
  Popup, 
  Tooltip as LeafletTooltip,
  useMap 
} from 'react-leaflet';
import { 
  MapPin, 
  Layers, 
  AlertTriangle, 
  Sparkles, 
  Activity, 
  RefreshCw, 
  Navigation, 
  Building2, 
  Users,
  Compass,
  Crosshair
} from 'lucide-react';

// Sub-component to handle smooth pan/zoom when a ward is clicked
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || 13, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

export function AnalyticsHeatmapPage() {
  const [heatmap, setHeatmap] = useState([]);
  const [grievances, setGrievances] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMapCenter, setSelectedMapCenter] = useState([17.435, 78.435]);
  const [selectedZoom, setSelectedZoom] = useState(12);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedGrievanceId, setSelectedGrievanceId] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedWardDetail, setSelectedWardDetail] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [heatRes, grvRes, sumRes] = await Promise.all([
        api.getHeatmapData(),
        api.getGrievances(),
        api.getOfficerSummary()
      ]);
      setHeatmap(heatRes || []);
      setGrievances(grvRes.grievances || []);
      setSummary(sumRes);
      if (heatRes && heatRes.length > 0) {
        setSelectedWardDetail(heatRes[0]);
      }
    } catch (err) {
      console.error('Failed to load map data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleWardClick = (loc) => {
    setSelectedWardDetail(loc);
    setSelectedMapCenter([loc.latitude, loc.longitude]);
    setSelectedZoom(14);
  };

  const filteredLocalities = heatmap.filter(loc => {
    if (activeFilter === 'critical') return loc.critical > 0;
    if (activeFilter === 'high') return loc.critical > 0 || loc.high > 0;
    return true;
  });

  return (
    <div className="space-y-5 pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#dddddd] pb-3.5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-medium text-[#181d26] tracking-tight">
              Interactive Civic Outage Map &amp; Geo-Density
            </h1>
            <Badge variant="default" className="text-[10px] font-medium">
              Live GIS Grid
            </Badge>
          </div>
          <p className="text-xs text-[#555b66] font-normal mt-0.5 leading-relaxed">
            Geospatial mapping of grievances, water outages, road potholes, and sewage leaks across Hyderabad wards.
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Button 
            size="sm" 
            variant={activeFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('all')}
            className="text-[11px] sm:text-xs h-8 px-2.5"
          >
            All Wards ({heatmap.length})
          </Button>
          <Button 
            size="sm" 
            variant={activeFilter === 'critical' ? 'danger' : 'outline'}
            onClick={() => setActiveFilter('critical')}
            className="text-[11px] sm:text-xs font-medium h-8 px-2.5"
          >
            Critical Outages
          </Button>
          <Button variant="outline" size="sm" onClick={loadData} className="bg-white h-8 px-2.5">
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* QUICK STAT METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3.5 sm:p-4 bg-white border-[#dddddd] shadow-2xs rounded-[10px]">
          <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-[#555b66]">
            Total Wards
          </span>
          <div className="text-2xl sm:text-3xl font-normal text-[#181d26] mt-1.5 leading-none">
            {heatmap.length} Localities
          </div>
          <p className="text-[10px] text-[#555b66] font-normal mt-1">
            Central &amp; Zonal Hyderabad
          </p>
        </Card>

        <Card className="p-3.5 sm:p-4 bg-[#fef2f2] border-[#fecaca] shadow-2xs rounded-[10px]">
          <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-[#aa2d00]">
            Critical Hotspots
          </span>
          <div className="text-2xl sm:text-3xl font-normal text-[#aa2d00] mt-1.5 leading-none">
            {heatmap.filter(h => h.critical > 0).length} Wards
          </div>
          <p className="text-[10px] text-[#aa2d00]/90 font-medium mt-1">
            Emergency units assigned
          </p>
        </Card>

        <Card className="p-3.5 sm:p-4 bg-white border-[#dddddd] shadow-2xs rounded-[10px]">
          <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-[#555b66]">
            Top Density Locality
          </span>
          <div className="text-xl sm:text-2xl font-normal text-[#181d26] mt-1.5 leading-none truncate">
            {heatmap[0]?.locality || 'KPHB Colony'}
          </div>
          <p className="text-[10px] text-[#181d26] font-medium mt-1">
            {heatmap[0]?.total || 0} Total Grievances
          </p>
        </Card>

        <Card className="p-3.5 sm:p-4 bg-[#f0fdf4] border-[#bbf7d0] shadow-2xs rounded-[10px]">
          <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-[#006400]">
            GIS Accuracy
          </span>
          <div className="text-2xl sm:text-3xl font-normal text-[#006400] mt-1.5 leading-none">
            100% Verified
          </div>
          <p className="text-[10px] text-[#006400]/90 font-medium mt-1">
            GPS Lat/Lng Tagged
          </p>
        </Card>
      </div>

      {/* LEAFLET MAP & INTERACTIVE SIDEBAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        
        {/* LEFT: LEAFLET MAP CONTAINER (8 cols) */}
        <div className="lg:col-span-8 space-y-2.5">
          <Card className="border-[#dddddd] bg-white shadow-2xs overflow-hidden rounded-[10px]">
            <div className="p-3 sm:p-3.5 border-b border-[#dddddd] bg-[#f8fafc] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5 text-[#181d26]" />
                <span className="font-medium text-xs sm:text-sm text-[#181d26]">
                  Hyderabad Municipal GIS Map
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-xs">
                <span className="flex items-center gap-1 text-[11px] font-medium text-[#aa2d00]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#aa2d00]" /> Critical
                </span>
                <span className="flex items-center gap-1 text-[11px] font-medium text-[#ea580c]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ea580c]" /> High
                </span>
                <span className="flex items-center gap-1 text-[11px] font-medium text-[#006400]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#006400]" /> Low
                </span>
              </div>
            </div>

            {/* Map Canvas */}
            <div className="h-[360px] sm:h-[420px] md:h-[460px] w-full relative z-0">
              <MapContainer
                center={selectedMapCenter}
                zoom={selectedZoom}
                scrollWheelZoom={true}
                className="h-full w-full"
                style={{ background: '#ffffff' }}
              >
                <MapController center={selectedMapCenter} zoom={selectedZoom} />

                {/* Clean Carto Voyager Tiles */}
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                {filteredLocalities.map((loc, idx) => {
                  const isCrit = loc.critical > 0;
                  const isHigh = loc.high > 0;
                  const radius = Math.min(22, Math.max(9, (loc.total || 1) * 2));
                  const markerColor = isCrit ? '#aa2d00' : isHigh ? '#ea580c' : '#006400';

                  return (
                    <CircleMarker
                      key={idx}
                      center={[loc.latitude, loc.longitude]}
                      radius={radius}
                      pathOptions={{
                        color: markerColor,
                        fillColor: markerColor,
                        fillOpacity: isCrit ? 0.8 : 0.5,
                        weight: isCrit ? 2.5 : 1.5,
                      }}
                      eventHandlers={{
                        click: () => handleWardClick(loc),
                      }}
                    >
                      <LeafletTooltip direction="top" offset={[0, -10]} opacity={1}>
                        <div className="text-xs font-medium">
                          {loc.locality} (Ward {loc.ward}): {loc.total} Tickets
                          {isCrit && <span className="text-[#aa2d00] block font-semibold">({loc.critical} Critical)</span>}
                        </div>
                      </LeafletTooltip>

                      <Popup className="custom-leaflet-popup">
                        <div className="p-1 space-y-2 text-xs font-sans min-w-[200px]">
                          <div className="border-b border-[#dddddd] pb-1">
                            <h4 className="font-semibold text-xs text-[#181d26]">
                              {loc.locality}
                            </h4>
                            <span className="text-[9px] text-[#555b66]">
                              Ward {loc.ward} • {loc.zone} Zone
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-1 text-[11px]">
                            <div className="bg-[#f8fafc] p-1 rounded border border-[#dddddd]">
                              <span className="text-[#555b66] font-medium block text-[8px]">TOTAL</span>
                              <span className="font-semibold text-xs text-[#181d26]">{loc.total}</span>
                            </div>
                            <div className={`p-1 rounded border ${isCrit ? 'bg-[#fef2f2] border-[#fecaca]' : 'bg-[#f0fdf4] border-[#bbf7d0]'}`}>
                              <span className="text-[#555b66] font-medium block text-[8px]">CRITICAL</span>
                              <span className={`font-semibold text-xs ${isCrit ? 'text-[#aa2d00]' : 'text-[#006400]'}`}>
                                {loc.critical}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleWardClick(loc)}
                            className="w-full text-center bg-[#181d26] text-white py-1 rounded-[5px] text-[10px] font-medium hover:bg-[#0d1218] transition-colors cursor-pointer"
                          >
                            Inspect Ward Feed
                          </button>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
            </div>
          </Card>
        </div>

        {/* RIGHT: SELECTED WARD INSPECTOR & COMPLAINT LIST (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          
          {selectedWardDetail ? (
            <Card className="border-[#dddddd] bg-white shadow-2xs p-3.5 sm:p-4 space-y-3 rounded-[10px]">
              <div className="border-b border-[#dddddd] pb-2.5 space-y-0.5">
                <div className="flex items-center justify-between">
                  <Badge variant={selectedWardDetail.critical > 0 ? 'critical' : 'default'} className="text-[9px]">
                    {selectedWardDetail.critical > 0 ? 'Critical Alert' : 'Active Ward'}
                  </Badge>
                  <span className="font-mono text-[9px] text-[#555b66]">
                    Ward #{selectedWardDetail.ward}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-medium text-[#181d26]">
                  {selectedWardDetail.locality}
                </h3>
                <p className="text-[11px] text-[#555b66]">
                  {selectedWardDetail.zone} Zone, Hyderabad
                </p>
              </div>

              {/* Ward Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-[8px] bg-[#f8fafc] border border-[#dddddd]">
                  <span className="text-[9px] font-medium text-[#555b66] uppercase block">Total Tickets</span>
                  <span className="text-lg font-medium text-[#181d26]">{selectedWardDetail.total}</span>
                </div>
                <div className="p-2.5 rounded-[8px] bg-[#fef2f2] border border-[#fecaca]">
                  <span className="text-[9px] font-medium text-[#aa2d00] uppercase block">Critical</span>
                  <span className="text-lg font-medium text-[#aa2d00]">{selectedWardDetail.critical}</span>
                </div>
              </div>

              {/* List of Grievances in this Ward */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-medium uppercase tracking-wider text-[#555b66] block">
                  Tickets in {selectedWardDetail.locality}:
                </span>

                <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                  {grievances
                    .filter(g => g.locality === selectedWardDetail.locality)
                    .map(g => (
                      <div
                        key={g.id}
                        onClick={() => {
                          setSelectedGrievanceId(g.id);
                          setSheetOpen(true);
                        }}
                        className="p-2 rounded-[6px] border border-[#dddddd] bg-[#f8fafc] hover:bg-white hover:border-[#181d26] transition-all cursor-pointer text-xs space-y-0.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[9px] font-medium text-[#181d26]">{g.id}</span>
                          <Badge variant={g.ai_priority_score >= 80 ? 'critical' : 'default'} className="text-[8px] py-0">
                            {g.ai_priority_score} pts
                          </Badge>
                        </div>
                        <div className="font-medium text-xs text-[#181d26] line-clamp-1">{g.title}</div>
                        <div className="text-[9px] text-[#555b66]">{g.department_name?.split(' ')[0]} • {g.status}</div>
                      </div>
                    ))}
                </div>
              </div>

            </Card>
          ) : (
            <Card className="border-[#dddddd] bg-white p-5 text-center text-xs text-[#555b66] rounded-[10px]">
              Click on any circle marker or ward badge to inspect local tickets.
            </Card>
          )}

          {/* Quick Ward Picker Chips */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-medium uppercase tracking-wider text-[#555b66] block">
              Quick Focus on Localities:
            </span>
            <div className="flex flex-wrap gap-1">
              {heatmap.map((loc, i) => (
                <button
                  key={i}
                  onClick={() => handleWardClick(loc)}
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-[5px] border transition-colors cursor-pointer ${
                    selectedWardDetail?.locality === loc.locality
                      ? 'bg-[#181d26] text-white border-[#181d26] shadow-2xs'
                      : 'bg-white text-[#333840] border-[#dddddd] hover:bg-[#f8fafc]'
                  }`}
                >
                  {loc.locality} {loc.critical > 0 ? `(${loc.critical} crit)` : ''}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Priority Explainer Sheet */}
      <PriorityExplainerSheet
        grievanceId={selectedGrievanceId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onGrievanceUpdated={loadData}
      />

    </div>
  );
}


