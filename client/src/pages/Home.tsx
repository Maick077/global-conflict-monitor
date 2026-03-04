import { useEffect, useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Event, EventStats as EventStatsType } from "@shared/types";
import InteractiveMap from "@/components/InteractiveMap";
import EventStatsComponent from "@/components/EventStats";
import EventFilters from "@/components/EventFilters";
import EventDetailCard from "@/components/EventDetailCard";
import { Loader2, AlertTriangle } from "lucide-react";

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<EventStatsType>({
    total: 0,
    confirmed: 0,
    byType: {},
    byCountry: {},
    last24h: 0,
  });
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // tRPC queries
  const listEventsQuery = trpc.events.list.useQuery({ limit: 500 });
  const statsQuery = trpc.events.stats.useQuery();
  const byTypeQuery = trpc.events.byType.useQuery(
    { type: selectedType as any, limit: 500 },
    { enabled: !!selectedType }
  );
  const byCountryQuery = trpc.events.byCountry.useQuery(
    { country: selectedCountry as any, limit: 500 },
    { enabled: !!selectedCountry }
  );

  // Fetch events based on filters
  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let result: Event[] = [];

      if (selectedType && selectedCountry) {
        // Both filters active - need to filter manually
        const allEvents = await listEventsQuery.refetch();
        result = allEvents.data?.filter(
          (e) => e.type === selectedType && e.country === selectedCountry
        ) || [];
      } else if (selectedType) {
        const typeEvents = await byTypeQuery.refetch();
        result = typeEvents.data || [];
      } else if (selectedCountry) {
        const countryEvents = await byCountryQuery.refetch();
        result = countryEvents.data || [];
      } else {
        const allEvents = await listEventsQuery.refetch();
        result = allEvents.data || [];
      }

      setEvents(result);
      setLastUpdate(new Date());
    } catch (err) {
      setError("Erro ao carregar eventos");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedType, selectedCountry, listEventsQuery, byTypeQuery, byCountryQuery]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await statsQuery.refetch();
      if (statsData.data) {
        setStats(statsData.data);
      }
    } catch (err) {
      console.error("Erro ao carregar estatísticas:", err);
    }
  }, [statsQuery]);

  // Initial load
  useEffect(() => {
    fetchEvents();
    fetchStats();
  }, []);

  // Polling every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchEvents();
      fetchStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchEvents, fetchStats]);

  // Handle filter changes
  const handleTypeChange = (type: string | null) => {
    setSelectedType(type);
    setSelectedEvent(null);
  };

  const handleCountryChange = (country: string | null) => {
    setSelectedCountry(country);
    setSelectedEvent(null);
  };

  const handleClearFilters = () => {
    setSelectedType(null);
    setSelectedCountry(null);
    setSelectedEvent(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-40">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-accent">Global Conflict Monitor</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Monitoramento em tempo real de eventos geopolíticos
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-400">{stats.confirmed}</div>
              <p className="text-xs text-muted-foreground">Eventos Confirmados</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Stats and Filters */}
          <aside className="lg:col-span-1 space-y-4">
            {/* Stats */}
            <EventStatsComponent stats={stats} lastUpdate={lastUpdate} />

            {/* Filters */}
            <EventFilters
              selectedType={selectedType}
              selectedCountry={selectedCountry}
              onTypeChange={handleTypeChange}
              onCountryChange={handleCountryChange}
              onDateRangeChange={() => {}} // TODO: Implement date range
              onClearFilters={handleClearFilters}
            />

            {/* Info Box */}
            <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4 text-sm text-blue-300">
              <p className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  Os dados exibidos são baseados em informações públicas confirmadas por fontes
                  externas.
                </span>
              </p>
            </div>
          </aside>

          {/* Main Map Area */}
          <div className="lg:col-span-3">
            {error && (
              <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 text-red-400 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </div>
            )}

            {isLoading && events.length === 0 ? (
              <div className="flex items-center justify-center h-96 bg-card/30 rounded-lg border border-border/50">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-2" />
                  <p className="text-muted-foreground">Carregando eventos...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Map */}
                <div className="bg-card/30 rounded-lg border border-border/50 overflow-hidden">
                  <InteractiveMap
                    events={events}
                    selectedEvent={selectedEvent}
                    onEventClick={setSelectedEvent}
                  />
                </div>

                {/* Events Count */}
                <div className="mt-4 text-sm text-muted-foreground">
                  {events.length === 0 ? (
                    <p>Nenhum evento encontrado com os filtros selecionados.</p>
                  ) : (
                    <p>
                      Exibindo <span className="font-bold text-accent">{events.length}</span>{" "}
                      evento{events.length !== 1 ? "s" : ""} confirmado{events.length !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Event Detail Card */}
      {selectedEvent && (
        <EventDetailCard
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          isAdmin={false}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 mt-12 py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            Global Conflict Monitor © 2026 | Dados baseados em fontes públicas confiáveis
          </p>
        </div>
      </footer>
    </div>
  );
}
