import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Event } from "@shared/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Check, Loader2 } from "lucide-react";

export default function Admin() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    type: "aéreo" as "aéreo" | "terrestre" | "marítimo",
    country: "iran" as "iran" | "israel",
    description: "",
    sourceName: "",
    sourceUrl: "",
    latitude: "",
    longitude: "",
    locationName: "",
    eventDate: new Date().toISOString().slice(0, 16),
  });

  // tRPC mutations
  const createMutation = trpc.events.create.useMutation();
  const updateMutation = trpc.events.update.useMutation();
  const deleteMutation = trpc.events.delete.useMutation();
  const confirmMutation = trpc.events.confirm.useMutation();
  const listQuery = trpc.events.list.useQuery({ limit: 500 });

  // Check admin access
  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  // Load events
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true);
        const result = await listQuery.refetch();
        setEvents(result.data || []);
      } catch (err) {
        toast.error("Erro ao carregar eventos");
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, []);

  const handleSubmit = async () => {
    try {
      if (!formData.description || !formData.sourceName || !formData.sourceUrl || !formData.locationName) {
        toast.error("Preencha todos os campos obrigatórios");
        return;
      }

      const eventData = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        eventDate: new Date(formData.eventDate),
      };

      if (editingEvent) {
        await updateMutation.mutateAsync({
          id: editingEvent.id,
          ...eventData,
        });
        toast.success("Evento atualizado com sucesso");
      } else {
        await createMutation.mutateAsync(eventData);
        toast.success("Evento criado com sucesso");
      }

      setIsDialogOpen(false);
      setEditingEvent(null);
      resetForm();

      // Reload events
      const result = await listQuery.refetch();
      setEvents(result.data || []);
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar evento");
    }
  };

  const handleDelete = async (eventId: number) => {
    if (!confirm("Tem certeza que deseja deletar este evento?")) return;

    try {
      await deleteMutation.mutateAsync({ id: eventId });
      toast.success("Evento deletado com sucesso");

      // Reload events
      const result = await listQuery.refetch();
      setEvents(result.data || []);
    } catch (err: any) {
      toast.error(err.message || "Erro ao deletar evento");
    }
  };

  const handleConfirm = async (eventId: number) => {
    try {
      await confirmMutation.mutateAsync({ id: eventId });
      toast.success("Evento confirmado com sucesso");

      // Reload events
      const result = await listQuery.refetch();
      setEvents(result.data || []);
    } catch (err: any) {
      toast.error(err.message || "Erro ao confirmar evento");
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      type: event.type,
      country: event.country,
      description: event.description,
      sourceName: event.sourceName,
      sourceUrl: event.sourceUrl,
      latitude: event.latitude,
      longitude: event.longitude,
      locationName: event.locationName,
      eventDate: new Date(event.eventDate).toISOString().slice(0, 16),
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      type: "aéreo",
      country: "iran",
      description: "",
      sourceName: "",
      sourceUrl: "",
      latitude: "",
      longitude: "",
      locationName: "",
      eventDate: new Date().toISOString().slice(0, 16),
    });
    setEditingEvent(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-40">
        <div className="container py-4">
          <h1 className="text-3xl font-bold text-accent">Painel Administrativo</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerenciar eventos de conflito</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        {/* Create Event Button */}
        <div className="mb-6">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(true);
                }}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Evento
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border/50 max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingEvent ? "Editar Evento" : "Criar Novo Evento"}</DialogTitle>
                <DialogDescription>
                  Preencha os detalhes do evento de conflito
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Type and Country */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Tipo</label>
                    <Select value={formData.type} onValueChange={(v: any) => setFormData({ ...formData, type: v })}>
                      <SelectTrigger className="bg-card/50 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border/50">
                        <SelectItem value="aéreo">Aéreo</SelectItem>
                        <SelectItem value="terrestre">Terrestre</SelectItem>
                        <SelectItem value="marítimo">Marítimo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">País</label>
                    <Select value={formData.country} onValueChange={(v: any) => setFormData({ ...formData, country: v })}>
                      <SelectTrigger className="bg-card/50 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border/50">
                        <SelectItem value="iran">Iran</SelectItem>
                        <SelectItem value="israel">Israel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="text-sm font-medium text-foreground">Localização</label>
                  <Input
                    value={formData.locationName}
                    onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                    placeholder="Ex: Beirute, Líbano"
                    className="bg-card/50 border-border/50"
                  />
                </div>

                {/* Coordinates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Latitude</label>
                    <Input
                      type="number"
                      step="0.0001"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      placeholder="Ex: 33.3128"
                      className="bg-card/50 border-border/50"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Longitude</label>
                    <Input
                      type="number"
                      step="0.0001"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      placeholder="Ex: 35.3395"
                      className="bg-card/50 border-border/50"
                    />
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="text-sm font-medium text-foreground">Data e Hora</label>
                  <Input
                    type="datetime-local"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="bg-card/50 border-border/50"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-medium text-foreground">Descrição</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva o evento em detalhes..."
                    className="bg-card/50 border-border/50 min-h-24"
                  />
                </div>

                {/* Source */}
                <div>
                  <label className="text-sm font-medium text-foreground">Nome da Fonte</label>
                  <Input
                    value={formData.sourceName}
                    onChange={(e) => setFormData({ ...formData, sourceName: e.target.value })}
                    placeholder="Ex: Reuters, BBC, etc."
                    className="bg-card/50 border-border/50"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">URL da Fonte</label>
                  <Input
                    type="url"
                    value={formData.sourceUrl}
                    onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                    placeholder="https://..."
                    className="bg-card/50 border-border/50"
                  />
                </div>

                {/* Submit */}
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Events Table */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle>Eventos ({events.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : events.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhum evento criado ainda</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Localização
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Tipo
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        País
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Data
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event.id} className="border-b border-border/50 hover:bg-card/50">
                        <td className="py-3 px-4 font-medium">{event.locationName}</td>
                        <td className="py-3 px-4 capitalize">{event.type}</td>
                        <td className="py-3 px-4 capitalize">{event.country}</td>
                        <td className="py-3 px-4 text-sm">
                          {new Date(event.eventDate).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="py-3 px-4">
                          {event.confirmed ? (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-900/20 text-green-400 border border-green-700/50">
                              ✓ Confirmado
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-900/20 text-yellow-400 border border-yellow-700/50">
                              Pendente
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            {!event.confirmed && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleConfirm(event.id)}
                                className="text-green-400 hover:bg-green-900/20"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(event)}
                              className="text-blue-400 hover:bg-blue-900/20"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(event.id)}
                              className="text-red-400 hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
