import React, { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ArrowLeft, Search, X, Locate, SlidersHorizontal, ChevronDown } from "lucide-react";

// ── PROJECT DATA ──
const projects = [
  { id: 1, name: "Marasem", dev: "Marasem", area: "New Cairo", lat: 30.030, lng: 31.470, score: 91, status: "On Track", delivery: "Q4 2025", reviews: 312, delay: 0, sentiment: ["Premium Quality", "Fast Delivery", "Clear Contract"] },
  { id: 2, name: "Villette", dev: "Sodic", area: "New Cairo", lat: 30.022, lng: 31.455, score: 87, status: "On Track", delivery: "Q2 2025", reviews: 198, delay: 0, sentiment: ["Trusted Brand", "Good Finishing", "Responsive Team"] },
  { id: 3, name: "Palm Hills NK", dev: "Palm Hills", area: "New Cairo", lat: 30.010, lng: 31.480, score: 82, status: "On Track", delivery: "Q3 2026", reviews: 245, delay: 0, sentiment: ["Solid Developer", "Great Location"] },
  { id: 4, name: "IL Monte", dev: "Emaar", area: "New Cairo", lat: 30.038, lng: 31.462, score: 88, status: "Delivered", delivery: "Delivered", reviews: 401, delay: 0, sentiment: ["Excellent Finishing", "On Time", "Premium"] },
  { id: 5, name: "Sarai", dev: "MNHD", area: "New Cairo", lat: 30.048, lng: 31.430, score: 71, status: "At Risk", delivery: "Q1 2026", reviews: 167, delay: 8, sentiment: ["Delayed", "Slow Updates", "Unresponsive"] },
  { id: 6, name: "Hyde Park NK", dev: "Hyde Park", area: "New Cairo", lat: 30.055, lng: 31.445, score: 79, status: "On Track", delivery: "Q2 2026", reviews: 289, delay: 2, sentiment: ["Good Progress", "Minor Delays", "Nice Design"] },
  { id: 7, name: "Mivida", dev: "Emaar", area: "New Cairo", lat: 30.018, lng: 31.490, score: 85, status: "On Track", delivery: "Q4 2025", reviews: 356, delay: 0, sentiment: ["Reliable", "Good Value", "Green Community"] },
  { id: 8, name: "Capital Gardens", dev: "Madinet Masr", area: "New Cairo", lat: 30.062, lng: 31.410, score: 68, status: "Delayed", delivery: "Q3 2026", reviews: 134, delay: 12, sentiment: ["Multiple Delays", "Price Hikes", "Poor Comms"] },
  { id: 9, name: "R7 District", dev: "NUCA", area: "New Capital", lat: 30.020, lng: 31.700, score: 65, status: "On Track", delivery: "Q2 2027", reviews: 89, delay: 0, sentiment: ["Slow Progress", "Uncertain Timeline", "Government Risk"] },
  { id: 10, name: "Midtown Solo", dev: "Better Home", area: "New Capital", lat: 30.010, lng: 31.720, score: 43, status: "Delayed", delivery: "Q4 2026", reviews: 56, delay: 18, sentiment: ["Serious Delays", "No Updates", "Uncontactable"] },
  { id: 11, name: "Entrada", dev: "City Edge", area: "New Capital", lat: 30.030, lng: 31.690, score: 72, status: "On Track", delivery: "Q1 2027", reviews: 142, delay: 3, sentiment: ["Average Progress", "Decent Quality"] },
  { id: 12, name: "The Loft", dev: "OUD", area: "New Capital", lat: 30.015, lng: 31.710, score: 34, status: "Delayed", delivery: "Unknown", reviews: 31, delay: 24, sentiment: ["Frozen", "No Construction", "Refund Issues", "RUN"] },
  { id: 13, name: "Westown", dev: "Sodic", area: "Sheikh Zayed", lat: 30.055, lng: 30.970, score: 86, status: "On Track", delivery: "Q3 2025", reviews: 267, delay: 0, sentiment: ["Trusted", "Good Finishing", "Responsive"] },
  { id: 14, name: "Zed West", dev: "Ora", area: "Sheikh Zayed", lat: 30.062, lng: 30.950, score: 80, status: "On Track", delivery: "Q4 2026", reviews: 198, delay: 1, sentiment: ["Premium", "Naguib Sawiris", "Quality"] },
  { id: 15, name: "Badya", dev: "Palm Hills", area: "6th October", lat: 30.005, lng: 30.940, score: 77, status: "On Track", delivery: "Q2 2026", reviews: 312, delay: 4, sentiment: ["Large Scale", "Slight Delays", "Good Vision"] },
  { id: 16, name: "Hacienda Bay SZ", dev: "Palm Hills", area: "Sheikh Zayed", lat: 30.070, lng: 30.960, score: 83, status: "On Track", delivery: "Q1 2026", reviews: 178, delay: 0, sentiment: ["Premium Quality", "Fast Delivery"] },
  { id: 17, name: "Swan Lake West", dev: "Hassan Allam", area: "6th October", lat: 29.998, lng: 30.950, score: 74, status: "At Risk", delivery: "Q3 2026", reviews: 145, delay: 6, sentiment: ["Slow Progress", "Good Location", "Some Delays"] },
  { id: 18, name: "Bloom Fields", dev: "Tatweer Misr", area: "6th October", lat: 29.990, lng: 30.935, score: 55, status: "Delayed", delivery: "Q4 2026", reviews: 88, delay: 14, sentiment: ["Significant Delays", "Price Issues"] },
  { id: 19, name: "Hacienda Bay", dev: "Palm Hills", area: "North Coast", lat: 31.050, lng: 29.820, score: 90, status: "Delivered", delivery: "Delivered", reviews: 520, delay: 0, sentiment: ["Best on NC", "Premium Finishing", "On Time"] },
  { id: 20, name: "Marassi", dev: "Emaar", area: "North Coast", lat: 31.020, lng: 29.750, score: 88, status: "Delivered", delivery: "Delivered", reviews: 445, delay: 0, sentiment: ["Masterplan", "Great Resort", "Reliable"] },
  { id: 21, name: "Fouka Bay", dev: "Tatweer Misr", area: "North Coast", lat: 31.080, lng: 29.860, score: 82, status: "On Track", delivery: "Q4 2025", reviews: 289, delay: 1, sentiment: ["Beautiful Design", "On Track", "Trusted Dev"] },
  { id: 22, name: "Caesar Bay", dev: "Amer Group", area: "North Coast", lat: 31.100, lng: 29.900, score: 47, status: "Delayed", delivery: "Q2 2026", reviews: 134, delay: 16, sentiment: ["Major Delays", "Investor Concerns", "Risky"] },
  { id: 23, name: "RAK", dev: "Unknown", area: "North Coast", lat: 31.060, lng: 29.780, score: 29, status: "Frozen", delivery: "Unknown", reviews: 45, delay: 36, sentiment: ["FROZEN", "Legal Issues", "Do Not Buy", "Lawsuit"] },
  { id: 24, name: "Amwaj", dev: "La Vista", area: "North Coast", lat: 31.040, lng: 29.800, score: 78, status: "On Track", delivery: "Q3 2025", reviews: 201, delay: 2, sentiment: ["Reliable", "Good Amenities", "Minor Delays"] },
];

const heatZones = [
  { lat: 30.030, lng: 31.460, r: 18000, color: "#2ECC71", opacity: 0.12 },
  { lat: 30.020, lng: 31.700, r: 14000, color: "#F1C40F", opacity: 0.12 },
  { lat: 30.060, lng: 30.960, r: 16000, color: "#2ECC71", opacity: 0.10 },
  { lat: 29.995, lng: 30.942, r: 14000, color: "#E67E22", opacity: 0.13 },
  { lat: 31.060, lng: 29.820, r: 22000, color: "#2ECC71", opacity: 0.10 },
];

type Project = typeof projects[number];

function scoreColor(s: number) {
  if (s >= 80) return "#2ECC71";
  if (s >= 60) return "#F1C40F";
  if (s >= 40) return "#E67E22";
  return "#E74C3C";
}

function scoreGrade(s: number) {
  if (s >= 80) return "TRUSTED";
  if (s >= 60) return "CAUTION";
  if (s >= 40) return "ELEVATED RISK";
  return "HIGH RISK";
}

function statusClass(st: string) {
  if (st === "On Track" || st === "Delivered") return "bg-[#2ECC71]/15 text-[#2ECC71]";
  if (st === "Delayed" || st === "Frozen") return "bg-[#E74C3C]/15 text-[#E74C3C]";
  return "bg-[#F1C40F]/15 text-[#F1C40F]";
}

function makeIcon(score: number) {
  const c = scoreColor(score);
  // 5-star rating from score (e.g. 91 -> 4.6)
  const rating = Math.max(1, Math.min(5, score / 20)).toFixed(1);
  // Google-Maps-style filled pill: solid color background, white star + number, tail pointer below.
  return L.divIcon({
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;pointer-events:auto;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35))">
        <div style="display:inline-flex;align-items:center;gap:4px;background:${c};color:#fff;font-family:'Inter','Arial',sans-serif;font-weight:800;font-size:14px;padding:5px 9px 5px 8px;border-radius:14px;border:2px solid #fff;white-space:nowrap">
          <span style="font-size:13px;line-height:1">★</span>
          <span style="line-height:1;letter-spacing:0.2px">${rating}</span>
        </div>
        <span style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:7px solid ${c};margin-top:-1px;filter:drop-shadow(0 1px 0 #fff)"></span>
      </div>`,
    className: "",
    iconSize: [70, 36],
    iconAnchor: [35, 36],
  });
}

function makeUserLocationIcon() {
  return L.divIcon({
    html: `
      <div style="position:relative;width:18px;height:18px">
        <div style="position:absolute;inset:0;border-radius:50%;background:#4285F4;border:3px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,0.15),0 2px 6px rgba(66,133,244,0.6)"></div>
        <div style="position:absolute;inset:-6px;border-radius:50%;background:#4285F4;opacity:0.18;animation:userPulse 2s ease-out infinite"></div>
      </div>
      <style>@keyframes userPulse{0%{transform:scale(0.6);opacity:0.5}100%{transform:scale(2.2);opacity:0}}</style>`,
    className: "",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

const AREAS = ["New Cairo", "New Capital", "Sheikh Zayed", "6th October", "North Coast"];
const ZONES = [
  { label: "Trusted", min: 80, max: 100, color: "#2ECC71" },
  { label: "Caution", min: 60, max: 79, color: "#F1C40F" },
  { label: "At Risk", min: 0, max: 59, color: "#E74C3C" },
];

const R8MapDemo = () => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Project | null>(null);
  const [activeZones, setActiveZones] = useState<string[]>([]);
  const [activeAreas, setActiveAreas] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null);

  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Record<number, L.Marker>>({});
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userAccuracyRef = useRef<L.Circle | null>(null);
  const [userLocated, setUserLocated] = useState(false);

  const filtered = useMemo(() => {
    let list = projects;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.dev.toLowerCase().includes(q) || p.area.toLowerCase().includes(q));
    }
    if (activeZones.length > 0) {
      list = list.filter(p => {
        const grade = scoreGrade(p.score);
        return activeZones.some(z => {
          if (z === "Trusted") return grade === "TRUSTED";
          if (z === "Caution") return grade === "CAUTION";
          return grade === "ELEVATED RISK" || grade === "HIGH RISK";
        });
      });
    }
    if (activeAreas.length > 0) {
      list = list.filter(p => activeAreas.includes(p.area));
    }
    return list;
  }, [search, activeZones, activeAreas]);

  const toggleZone = (z: string) => setActiveZones(prev => prev.includes(z) ? prev.filter(x => x !== z) : [...prev, z]);
  const toggleArea = (a: string) => setActiveAreas(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);

  const selectProject = (p: Project) => {
    setSelected(p);
    setSidebarOpen(false);
    if (mapRef.current) {
      mapRef.current.panTo([p.lat, p.lng], { animate: true, duration: 0.5 });
      // After pan settles, compute screen position for the floating info card.
      setTimeout(() => {
        if (!mapRef.current) return;
        const pt = mapRef.current.latLngToContainerPoint([p.lat, p.lng]);
        setPopupPos({ x: pt.x, y: pt.y });
      }, 520);
    }
  };

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, { zoomControl: false, attributionControl: false }).setView([30.06, 31.25], 9);
    // Google-Maps-style tiles (Google Roadmap via mt servers — same look users know)
    L.tileLayer("https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
      maxZoom: 20,
      subdomains: ["0", "1", "2", "3"],
      attribution: "© Google",
    }).addTo(map);
    L.control.zoom({ position: "bottomleft" }).addTo(map);

    // Heat zones
    heatZones.forEach(z => {
      L.circle([z.lat, z.lng], { radius: z.r, color: "transparent", fillColor: z.color, fillOpacity: z.opacity }).addTo(map);
    });

    mapRef.current = map;

    // Tap-on-map closes the floating card
    map.on("click", () => setSelected(null));
    // Keep info card glued to marker as user pans/zooms
    const sync = () => {
      setSelected((cur) => {
        if (!cur || !mapRef.current) return cur;
        const pt = mapRef.current.latLngToContainerPoint([cur.lat, cur.lng]);
        setPopupPos({ x: pt.x, y: pt.y });
        return cur;
      });
    };
    map.on("move", sync);
    map.on("zoom", sync);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ESC closes the floating card
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Locate the user (You are here)
  const locateUser = () => {
    const map = mapRef.current;
    if (!map || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        if (userMarkerRef.current) userMarkerRef.current.remove();
        if (userAccuracyRef.current) userAccuracyRef.current.remove();
        userAccuracyRef.current = L.circle([latitude, longitude], {
          radius: accuracy,
          color: "#4285F4",
          weight: 1,
          fillColor: "#4285F4",
          fillOpacity: 0.12,
        }).addTo(map);
        userMarkerRef.current = L.marker([latitude, longitude], {
          icon: makeUserLocationIcon(),
          zIndexOffset: 1000,
        })
          .addTo(map)
          .bindTooltip("You are here", { permanent: false, direction: "top", offset: [0, -8] });
        map.setView([latitude, longitude], 12, { animate: true });
        setUserLocated(true);
      },
      () => {
        // Silently fail (permission denied / unavailable)
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    );
  };

  // Auto-attempt location on mount
  useEffect(() => {
    const t = setTimeout(locateUser, 600);
    return () => clearTimeout(t);
  }, []);

  // Update markers when filtered changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old markers
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    // Add new markers
    filtered.forEach(p => {
      const marker = L.marker([p.lat, p.lng], { icon: makeIcon(p.score) }).addTo(map);
      marker.on("click", () => selectProject(p));
      markersRef.current[p.id] = marker;
    });
  }, [filtered]);

  const trusted = projects.filter(p => p.score >= 80).length;
  const caution = projects.filter(p => p.score >= 60 && p.score < 80).length;
  const atRisk = projects.filter(p => p.score < 60).length;

  return (
    <>
      <style>{`.leaflet-container{background:#e5e3df!important}.leaflet-control-attribution{display:none!important}.leaflet-control-zoom{border:1px solid rgba(0,0,0,0.12)!important;border-radius:8px!important;background:#fff!important;box-shadow:0 2px 8px rgba(10,61,98,0.18)!important;overflow:hidden}.leaflet-control-zoom a{background:#fff!important;color:#0a3d62!important;border-color:rgba(10,61,98,0.1)!important;font-weight:600}.leaflet-control-zoom a:hover{background:#fac417!important;color:#0a3d62!important}`}</style>
      <div className="h-screen flex flex-col bg-[#0a3d62] text-white overflow-hidden font-sans">
        {/* TOP BAR */}
        <div className="flex items-center justify-between px-4 md:px-5 h-[58px] shrink-0 bg-gradient-to-b from-[#0a3d62] to-[#0a3d62]/95 backdrop-blur-xl border-b border-[#fac417]/20 z-[1000] relative shadow-lg">
          <div className="flex items-center gap-3">
            <Link to="/products" className="text-white/60 hover:text-[#fac417] transition-colors me-1">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="font-bold text-[20px] tracking-tight text-white">R8<span className="text-[#fac417]">MAP</span></span>
            <span className="hidden sm:flex items-center gap-1.5 text-[10px] tracking-[2px] text-white/60 uppercase border-s border-white/15 ps-2.5 font-semibold">
              <span className="w-1 h-1 rounded-full bg-[#fac417] animate-pulse" />
              AI Trust Layer
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[10px] tracking-[2px] text-emerald-400 uppercase font-bold">
              <span className="w-[7px] h-[7px] rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              LIVE
            </div>
            <span className="hidden sm:block text-[10px] tracking-[1px] text-white/70 border border-white/15 bg-white/5 px-2.5 py-1 rounded-md font-semibold">
              {projects.length} PROJECTS
            </span>
            <button
              className="md:hidden min-h-[36px] text-[11px] tracking-[1px] font-bold text-[#0a3d62] bg-[#fac417] px-3 py-1.5 rounded-md shadow-md"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? "MAP" : "LIST"}
            </button>
          </div>
        </div>

        {/* MAIN */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* SIDEBAR — Projects-first layout */}
          <div className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 absolute md:relative z-[200] w-[340px] max-w-[88vw] shrink-0 bg-gradient-to-b from-[#0a3d62] via-[#0d4574] to-[#0a3d62] border-e border-[#fac417]/15 flex flex-col overflow-hidden transition-transform duration-300 h-full shadow-2xl`}>
            {/* Sticky top: search + trust pills + result count */}
            <div className="p-3 border-b border-white/10 bg-white/[0.03] backdrop-blur-sm">
              <div className="relative mb-2.5">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  className="w-full min-h-[42px] bg-white/[0.08] border border-white/15 rounded-lg py-2 ps-9 pe-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#fac417]/60 focus:bg-white/[0.12] transition-all"
                  placeholder="Search project, developer, area..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              {/* Trust zone pills — primary filter, always visible */}
              <div className="flex flex-wrap gap-1.5">
                {ZONES.map(z => {
                  const on = activeZones.includes(z.label);
                  return (
                    <button
                      key={z.label}
                      onClick={() => toggleZone(z.label)}
                      className="text-[11px] font-bold px-2.5 py-1 min-h-[30px] rounded-full border transition-all"
                      style={on
                        ? { borderColor: z.color, color: "#fff", background: z.color, boxShadow: `0 2px 10px ${z.color}66` }
                        : { borderColor: `${z.color}80`, color: z.color, background: `${z.color}1a` }}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: on ? "#fff" : z.color }} />
                        {z.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Result count + clear */}
              <div className="flex items-center justify-between mt-2.5 px-0.5">
                <span className="text-[11px] text-white/60 font-semibold">
                  <span className="text-[#fac417]">{filtered.length}</span> of {projects.length} projects
                </span>
                {(activeZones.length > 0 || activeAreas.length > 0 || search) && (
                  <button
                    onClick={() => { setActiveZones([]); setActiveAreas([]); setSearch(""); }}
                    className="text-[10px] text-white/55 hover:text-[#fac417] font-semibold tracking-wide uppercase"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Project list — gets the most space */}
            <div className="flex-1 overflow-y-auto">
              {filtered.map(p => (
                <div
                  key={p.id}
                  onClick={() => selectProject(p)}
                  className={`flex items-center gap-3 px-4 py-3 border-b border-white/8 cursor-pointer transition-all hover:bg-white/[0.06] ${
                    selected?.id === p.id ? "bg-[#fac417]/10 border-s-[3px] border-s-[#fac417]" : ""
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: scoreColor(p.score), boxShadow: `0 0 6px ${scoreColor(p.score)}` }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold text-white truncate">{p.name}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="flex items-center gap-[1px]">
                        {Array.from({ length: 5 }).map((_, i) => {
                          const filled = i < Math.max(1, Math.min(5, Math.round(p.score / 20)));
                          return (
                            <span key={i} style={{ color: filled ? "#fac417" : "rgba(255,255,255,0.25)", fontSize: "11px", lineHeight: 1 }}>★</span>
                          );
                        })}
                      </span>
                      <span className="text-[11px] text-white/55 font-medium">{p.reviews} reviews</span>
                    </div>
                    <div className="text-[11px] text-[#fac417]/85 font-semibold mt-0.5 truncate">📍 {p.area} · <span className="text-white/55 font-normal">{p.dev}</span></div>
                  </div>
                  <span className="font-bold text-[22px] leading-none shrink-0" style={{ color: scoreColor(p.score), textShadow: `0 0 8px ${scoreColor(p.score)}55` }}>{p.score}</span>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="p-6 text-center text-[12px] text-white/40">No projects match</div>
              )}
            </div>

            {/* Legend */}
            <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-sm">
              <div className="text-[10px] tracking-[2px] uppercase text-[#fac417] font-bold mb-2.5">Trust Score Legend</div>
              <div className="space-y-1.5">
                {[
                  { color: "#2ECC71", label: "80–100 Trusted" },
                  { color: "#F1C40F", label: "60–79 Caution" },
                  { color: "#E67E22", label: "40–59 Elevated Risk" },
                  { color: "#E74C3C", label: "0–39 High Risk" },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-2 text-[11px] text-white/70">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: l.color, boxShadow: `0 0 6px ${l.color}88` }} />
                    {l.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MAP */}
          <div className="flex-1 relative">
            <div ref={mapContainerRef} className="w-full h-full" style={{ background: "#e5e3df" }} />

            {/* Locate-me button (Google-Maps style) */}
            <button
              onClick={locateUser}
              title={userLocated ? "Recenter on your location" : "Show my location"}
              className="absolute bottom-[110px] right-4 z-[500] w-10 h-10 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.3)] border border-black/10 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <Locate className={`w-5 h-5 ${userLocated ? "text-[#4285F4]" : "text-[#5f6368]"}`} />
            </button>

            {/* HUD */}
            <div className="absolute bottom-4 right-4 z-[500] flex flex-col gap-2 items-end">
              <div className="bg-[#08090C]/92 border border-white/[0.07] rounded-sm p-3 backdrop-blur-xl min-w-[160px]">
                <div className="font-mono text-[9px] tracking-[2px] uppercase text-[#EDE9E1]/45 mb-1.5">Market Avg Trust</div>
                <div className="font-['Bebas_Neue'] text-[28px] tracking-[2px] leading-none text-[#C9A84C]">67<span className="text-[16px] text-[#EDE9E1]/40">/100</span></div>
              </div>
              <div className="bg-[#08090C]/92 border border-white/[0.07] rounded-sm p-3 backdrop-blur-xl">
                <div className="font-mono text-[9px] tracking-[2px] uppercase text-[#EDE9E1]/45 mb-2">Zone Breakdown</div>
                <div className="flex items-center gap-4">
                  {[
                    { n: trusted, label: "Trusted", color: "#2ECC71" },
                    { n: caution, label: "Caution", color: "#F1C40F" },
                    { n: atRisk, label: "At Risk", color: "#E74C3C" },
                  ].map(z => (
                    <div key={z.label} className="text-center">
                      <span className="font-['Bebas_Neue'] text-[20px] tracking-[1px] block" style={{ color: z.color }}>{z.n}</span>
                      <span className="font-mono text-[8px] tracking-[1px] text-[#EDE9E1]/40">{z.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* DETAIL PANEL */}
            <div className={`absolute top-4 right-4 z-[500] w-[280px] bg-[#08090C]/96 border border-white/[0.07] rounded backdrop-blur-xl overflow-hidden transition-transform duration-300 ${selected ? "translate-x-0" : "translate-x-[320px]"}`}>
              {selected && (
                <>
                  <div className="p-4 border-b border-white/[0.07] flex justify-between items-start">
                    <div>
                      <div className="font-['Bebas_Neue'] text-[24px] tracking-[2px] text-[#EDE9E1] leading-none mb-1">{selected.name}</div>
                      <div className="text-[11px] font-mono text-[#EDE9E1]/45">{selected.area} · {selected.dev}</div>
                    </div>
                    <button onClick={() => setSelected(null)} className="text-[#EDE9E1]/40 hover:text-[#C9A84C] transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4">
                    {/* Score circle */}
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-16 h-16 rounded-full border-2 flex items-center justify-center font-['Bebas_Neue'] text-[28px]"
                        style={{ borderColor: scoreColor(selected.score), color: scoreColor(selected.score), boxShadow: `0 0 16px ${scoreColor(selected.score)}44` }}
                      >
                        {selected.score}
                      </div>
                      <div>
                        <div className="font-mono text-[11px] tracking-[2px] uppercase" style={{ color: scoreColor(selected.score) }}>{scoreGrade(selected.score)}</div>
                        <div className="text-[10px] text-[#EDE9E1]/40 font-mono mt-0.5">Trust Score</div>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="space-y-2.5">
                      {[
                        { label: "DELIVERY STATUS", value: selected.status, isStatus: true },
                        { label: "EXPECTED DELIVERY", value: selected.delivery },
                        { label: "CURRENT DELAY", value: selected.delay > 0 ? `+${selected.delay} months` : "None", isDelay: true },
                        { label: "VERIFIED REVIEWS", value: selected.reviews.toLocaleString() },
                      ].map(m => (
                        <div key={m.label} className="flex items-center justify-between py-1.5 border-b border-white/[0.05]">
                          <span className="font-mono text-[9px] tracking-[1px] text-[#EDE9E1]/40">{m.label}</span>
                          {m.isStatus ? (
                            <span className={`font-mono text-[10px] tracking-[1px] px-2 py-0.5 rounded-sm ${statusClass(selected.status)}`}>
                              {m.value}
                            </span>
                          ) : (
                            <span className={`text-[12px] font-medium ${m.isDelay && selected.delay > 0 ? "text-[#E74C3C]" : m.isDelay ? "text-[#2ECC71]" : "text-[#EDE9E1]"}`}>
                              {m.value}
                            </span>
                          )}
                        </div>
                      ))}

                      {/* Trust bar */}
                      <div className="pt-1">
                        <div className="flex justify-between mb-1">
                          <span className="font-mono text-[9px] tracking-[1px] text-[#EDE9E1]/40">TRUST SCORE</span>
                          <span className="text-[12px] font-medium" style={{ color: scoreColor(selected.score) }}>{selected.score}/100</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${selected.score}%`, background: scoreColor(selected.score) }} />
                        </div>
                      </div>
                    </div>

                    {/* Sentiment */}
                    <div className="mt-4">
                      <div className="font-mono text-[9px] tracking-[2px] uppercase text-[#EDE9E1]/40 mb-2">Buyer Sentiment</div>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.sentiment.map((s, i) => {
                          const colors = [
                            { bg: "rgba(46,204,113,.15)", border: "#2ECC71" },
                            { bg: "rgba(241,196,15,.12)", border: "#F1C40F" },
                            { bg: "rgba(231,76,60,.12)", border: "#E74C3C" },
                            { bg: "rgba(201,168,76,.12)", border: "#C9A84C" },
                          ];
                          const c = colors[i % 4];
                          return (
                            <span key={s} className="font-mono text-[9px] tracking-[0.5px] px-2 py-1 rounded-sm border" style={{ background: c.bg, borderColor: c.border, color: c.border }}>
                              {s}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default R8MapDemo;
