import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type TimeFilter = "All" | "7 Days" | "Month" | "Year";
export type RoleFilter = "All" | "Teacher" | "Student";

interface FilterBarProps {
  search: string;
  setSearch: (val: string) => void;
  timeFilter: TimeFilter;
  setTimeFilter: (val: TimeFilter) => void;
  roleFilter: RoleFilter;
  setRoleFilter: (val: RoleFilter) => void;
}

export function FilterBar({ 
  search, 
  setSearch, 
  timeFilter, 
  setTimeFilter,
  roleFilter,
  setRoleFilter
}: FilterBarProps) {
  const filters: TimeFilter[] = ["All", "7 Days", "Month", "Year"];

  const getFilterLabel = (filter: TimeFilter) => {
    switch (filter) {
      case "All": return "Gesamtzeit";
      case "7 Days": return "Letzte 7 Tage";
      case "Month": return "Letzter Monat";
      case "Year": return "Letztes Jahr";
      default: return filter;
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/40 p-4 rounded-xl border border-border/50 backdrop-blur-sm">
      <div className="relative w-full md:w-1/3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Namen oder Zitate suchen..." 
          className="pl-9 pr-9 bg-background/50 border-primary/10 focus-visible:ring-primary/20"
        />
        {search && (
          <button 
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex gap-4 w-full md:w-auto items-center overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
         <Select value={roleFilter} onValueChange={(val) => setRoleFilter(val as RoleFilter)}>
          <SelectTrigger className="w-[160px] bg-background/50 border-primary/10">
            <SelectValue placeholder="Nach Rolle filtern" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">Alle Rollen</SelectItem>
            <SelectItem value="Teacher">Nur Lehrer</SelectItem>
            <SelectItem value="Student">Nur Schüler</SelectItem>
          </SelectContent>
        </Select>

        <div className="h-6 w-px bg-border hidden md:block" />

        <div className="flex gap-2">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={timeFilter === filter ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeFilter(filter)}
              className={`whitespace-nowrap transition-all ${
                timeFilter === filter 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "bg-transparent hover:bg-primary/5 border-primary/10 text-muted-foreground"
              }`}
            >
              {getFilterLabel(filter)}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
