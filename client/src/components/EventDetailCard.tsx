import { Event } from "@shared/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ExternalLink, Calendar, MapPin, FileText, Link as LinkIcon } from "lucide-react";

interface EventDetailCardProps {
  event: Event;
  onClose: () => void;
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: number) => void;
  isAdmin?: boolean;
}

export default function EventDetailCard({
  event,
  onClose,
  onEdit,
  onDelete,
  isAdmin,
}: EventDetailCardProps) {
  const getTypeLabel = (type: string): string => {
    switch (type) {
      case "aéreo":
        return "Aéreo";
      case "terrestre":
        return "Terrestre";
      case "marítimo":
        return "Marítimo";
      default:
        return type;
    }
  };

  const getCountryLabel = (country: string): string => {
    switch (country) {
      case "iran":
        return "Irã";
      case "israel":
        return "Israel";
      default:
        return country;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "aéreo":
        return "✈️";
      case "terrestre":
        return "🚁";
      case "marítimo":
        return "⚓";
      default:
        return "📍";
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case "aéreo":
        return "text-red-400";
      case "terrestre":
        return "text-orange-400";
      case "marítimo":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };

  const getCountryEmoji = (country: string) => {
    return country === "iran" ? "🇮🇷" : "🇮🇱";
  };

  return (
    <Card className="bg-card border-border/50 fixed bottom-4 right-4 w-96 max-w-[calc(100vw-2rem)] shadow-2xl z-50 max-h-[calc(100vh-2rem)] overflow-y-auto">
      <CardHeader className="pb-3 border-b border-border/50 flex flex-row items-start justify-between">
        <div className="flex-1">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-2xl">{getTypeIcon(event.type)}</span>
            <span className="text-base">{event.locationName}</span>
          </CardTitle>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(event.type)} bg-opacity-20`}>
            {getTypeLabel(event.type)}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium text-foreground bg-card border border-border/50">
            {getCountryEmoji(event.country)} {getCountryLabel(event.country)}
          </span>
          {event.confirmed && (
            <span className="px-3 py-1 rounded-full text-xs font-medium text-green-400 bg-green-900/20 border border-green-700/50">
              ✓ Confirmado
            </span>
          )}
        </div>

        {/* Date and Location */}
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-muted-foreground text-xs">Data e Hora</p>
              <p className="text-foreground">{new Date(event.eventDate).toLocaleString("pt-BR")}</p>
            </div>
          </div>

          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-muted-foreground text-xs">Coordenadas</p>
              <p className="text-foreground font-mono text-xs">
                {event.latitude}, {event.longitude}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1 flex items-center gap-1">
            <FileText className="w-3 h-3" />
            Descrição
          </label>
          <p className="text-sm text-foreground bg-card/50 p-3 rounded-lg border border-border/50">
            {event.description}
          </p>
        </div>

        {/* Source */}
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1 flex items-center gap-1">
            <LinkIcon className="w-3 h-3" />
            Fonte
          </label>
          <div className="flex items-center justify-between gap-2 bg-card/50 p-3 rounded-lg border border-border/50">
            <div>
              <p className="text-sm font-medium text-foreground">{event.sourceName}</p>
              <p className="text-xs text-muted-foreground truncate">{event.sourceUrl}</p>
            </div>
            <a
              href={event.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 flex-shrink-0"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Metadata */}
        <div className="text-xs text-muted-foreground space-y-1 border-t border-border/50 pt-3">
          <p>Criado: {new Date(event.createdAt).toLocaleString("pt-BR")}</p>
          <p>Atualizado: {new Date(event.updatedAt).toLocaleString("pt-BR")}</p>
        </div>

        {/* Admin Actions */}
        {isAdmin && (
          <div className="flex gap-2 border-t border-border/50 pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(event)}
              className="flex-1 bg-blue-900/20 text-blue-400 border-blue-700/50 hover:bg-blue-900/40"
            >
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete?.(event.id)}
              className="flex-1 bg-red-900/20 text-red-400 border-red-700/50 hover:bg-red-900/40"
            >
              Deletar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
