import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Quote } from "@shared/schema";
import { QuoteCard } from "@/components/quote-card";
import { QuoteForm } from "@/components/quote-form";
import { FilterBar, TimeFilter, RoleFilter } from "@/components/filter-bar";
import { AdminLogin } from "@/components/admin-login";
import { ThemeToggle } from "@/components/theme-toggle";
import { subDays, subMonths, subYears, isAfter } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("All");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("All");

  const { data: quotes = [], isLoading } = useQuery<Quote[]>({
    queryKey: ["/api/quotes"],
  });

  const createQuoteMutation = useMutation({
    mutationFn: async (data: Omit<Quote, "id">) => {
      return await apiRequest("POST", "/api/quotes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      toast({
        title: "Zitat hinzugefügt",
        description: "Dein Zitat wurde erfolgreich gespeichert.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Das Zitat konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    },
  });

  const deleteQuoteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/quotes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      toast({
        title: "Zitat gelöscht",
        description: "Das Zitat wurde erfolgreich entfernt.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Das Zitat konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    },
  });

  const handleAddQuote = (data: Omit<Quote, "id" | "timestamp">) => {
    createQuoteMutation.mutate({
      ...data,
      timestamp: Date.now(),
    });
  };

  const handleDeleteQuote = (id: string) => {
    deleteQuoteMutation.mutate(id);
  };

  const filteredQuotes = useMemo(() => {
    return quotes.filter((quote) => {
      if (roleFilter !== "All" && quote.type !== roleFilter) {
        return false;
      }

      const searchLower = search.toLowerCase();
      const matchesSearch = 
        quote.name.toLowerCase().includes(searchLower) || 
        quote.text.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      const date = new Date(quote.timestamp);
      const now = new Date();
      
      switch (timeFilter) {
        case "7 Days":
          return isAfter(date, subDays(now, 7));
        case "Month":
          return isAfter(date, subMonths(now, 1));
        case "Year":
          return isAfter(date, subYears(now, 1));
        default:
          return true;
      }
    }).sort((a, b) => b.timestamp - a.timestamp);
  }, [quotes, search, timeFilter, roleFilter]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-serif font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Klassenzitate
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AdminLogin isAdmin={isAdmin} onLogin={setIsAdmin} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
        <AnimatePresence>
          {isAdmin && (
            <motion.section 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full max-w-2xl mx-auto overflow-hidden"
            >
              <QuoteForm onSubmit={handleAddQuote} />
            </motion.section>
          )}
        </AnimatePresence>

        <section>
          <FilterBar 
            search={search} 
            setSearch={setSearch} 
            timeFilter={timeFilter} 
            setTimeFilter={setTimeFilter}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
          />
        </section>

        <section>
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Spinner className="w-8 h-8" />
            </div>
          ) : filteredQuotes.length > 0 ? (
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {filteredQuotes.map((quote, index) => (
                  <QuoteCard 
                    key={quote.id} 
                    quote={quote} 
                    index={index}
                    isAdmin={isAdmin}
                    onDelete={handleDeleteQuote}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="text-center py-20 text-muted-foreground bg-card/30 rounded-xl border border-dashed border-border">
              <p className="text-lg">Keine Zitate gefunden, die deinen Kriterien entsprechen.</p>
              <p className="text-sm mt-2">Versuche, deine Filter anzupassen.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
