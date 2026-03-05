import { EventStats } from "@shared/types";
import { AlertCircle, Zap, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EventStatsProps {
  stats: EventStats;
  lastUpdate: Date;
}

export default function EventStatsComponent({ stats, lastUpdate }: EventStatsProps) {
  const getSecondsSinceUpdate = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
    return diff;
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case "aéreo":
        return "bg-red-900/20 text-red-400 border-red-700/50";
      case "terrestre":
        return "bg-orange-900/20 text-orange-400 border-orange-700/50";
      case "marítimo":
        return "bg-blue-900/20 text-blue-400 border-blue-700/50";
      default:
        return "bg-gray-900/20 text-gray-400 border-gray-700/50";
    }
  };

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

  return (
    <div className="space-y-4">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              Total de Eventos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-400">{stats.confirmed}</div>
            <p className="text-xs text-muted-foreground mt-1">Confirmados</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-400" />
              Últimas 24h
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-400">{stats.last24h}</div>
            <p className="text-xs text-muted-foreground mt-1">Eventos recentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Events by Type */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Eventos por Tipo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(stats.byType).map(([type, count]) => (
              <div
                key={type}
                className={`p-3 rounded-lg border ${getTypeColor(type)} text-center`}
              >
                <div className="text-2xl mb-1">{getTypeIcon(type)}</div>
                <div className="text-lg font-bold">{count}</div>
                <div className="text-xs">{getTypeLabel(type)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Events by Country */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Eventos por País
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(stats.byCountry).map(([country, count]) => (
              <div
                key={country}
                className="p-3 rounded-lg bg-card border border-border/50 text-center"
              >
                <div className="text-sm font-medium text-foreground capitalize">{country}</div>
                <div className="text-2xl font-bold text-accent mt-1">{count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Last Update */}
      <div className="text-center text-xs text-muted-foreground">
        Atualizado há {getSecondsSinceUpdate()}s
      </div>
    </div>
  );
}
