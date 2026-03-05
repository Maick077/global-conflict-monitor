import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Filter, X } from "lucide-react";

interface EventFiltersProps {
  selectedType: string | null;
  selectedCountry: string | null;
  onTypeChange: (type: string | null) => void;
  onCountryChange: (country: string | null) => void;
  onDateRangeChange: (startDate: Date | null, endDate: Date | null) => void;
  onClearFilters: () => void;
}

export default function EventFilters({
  selectedType,
  selectedCountry,
  onTypeChange,
  onCountryChange,
  onDateRangeChange,
  onClearFilters,
}: EventFiltersProps) {
  const types = ["aéreo", "terrestre", "marítimo"];
  const countries = ["iran", "israel"];

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

  const hasActiveFilters = selectedType || selectedCountry;

  const getTypeColor = (type: string): string => {
    switch (type) {
      case "aéreo":
        return selectedType === type
          ? "bg-red-600 text-white border-red-500"
          : "bg-red-900/30 text-red-400 border-red-700/50 hover:bg-red-900/50";
      case "terrestre":
        return selectedType === type
          ? "bg-orange-600 text-white border-orange-500"
          : "bg-orange-900/30 text-orange-400 border-orange-700/50 hover:bg-orange-900/50";
      case "marítimo":
        return selectedType === type
          ? "bg-blue-600 text-white border-blue-500"
          : "bg-blue-900/30 text-blue-400 border-blue-700/50 hover:bg-blue-900/50";
      default:
        return "";
    }
  };

  const getCountryColor = (country: string): string => {
    return selectedCountry === country
      ? "bg-accent text-accent-foreground"
      : "bg-card border-border/50 text-foreground hover:bg-card/80";
  };

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtros
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-6 px-2 text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Type Filter */}
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-2">
            Tipo de Evento
          </label>
          <div className="flex flex-wrap gap-2">
            {types.map((type) => (
              <Button
                key={type}
                variant="outline"
                size="sm"
                onClick={() => onTypeChange(selectedType === type ? null : type)}
                className={`border ${getTypeColor(type)} transition-all`}
              >
                {type === "aéreo" && "✈️"}
                {type === "terrestre" && "🚁"}
                {type === "marítimo" && "⚓"}
                <span className="ml-1">{getTypeLabel(type)}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Country Filter */}
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-2">
            País
          </label>
          <div className="flex flex-wrap gap-2">
            {countries.map((country) => (
              <Button
                key={country}
                variant="outline"
                size="sm"
                onClick={() => onCountryChange(selectedCountry === country ? null : country)}
                className={`border ${getCountryColor(country)} transition-all capitalize`}
              >
                {country === "iran" && "🇮🇷"}
                {country === "israel" && "🇮🇱"}
                <span className="ml-1">{getCountryLabel(country)}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-2 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Últimas 24h
          </label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const now = new Date();
              const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
              onDateRangeChange(yesterday, now);
            }}
            className="w-full bg-card border-border/50 text-foreground hover:bg-card/80"
          >
            Filtrar últimas 24h
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
