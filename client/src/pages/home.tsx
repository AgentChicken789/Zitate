import { useState, useEffect, useMemo } from "react";
import { Quote } from "@/types/quote";
import { QuoteCard } from "@/components/quote-card";
import { QuoteForm } from "@/components/quote-form";
import { FilterBar, TimeFilter, RoleFilter } from "@/components/filter-bar";
import { AdminLogin } from "@/components/admin-login";
import { ThemeToggle } from "@/components/theme-toggle";
import { nanoid } from "nanoid";
import { subDays, subMonths, subYears, isAfter } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap } from "lucide-react";

import { useToast } from "@/hooks/use-toast";

// Mock data for initial load if empty
const INITIAL_QUOTES: Quote[] = [
  {
    id: "1",
    name: "Herr Müller",
    text: "Geschichte besteht nicht nur aus Daten und Namen, sie ist der Klatsch der Vergangenheit.",
    type: "Teacher",
    timestamp: Date.now() - 100000000,
  },
  {
    id: "2",
    name: "Sarah Jenkins",
    text: "Können wir heute bitte draußen Unterricht machen? Die Sonne ruft förmlich meinen Namen.",
    type: "Student",
    timestamp: Date.now() - 50000000,
  }
];

export default function Home() {
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuotes = async () => {
      try {
        // 1. Fetch from file
        const response = await fetch("/quotes.json");
        const fileQuotes: Quote[] = await response.json();

        // 2. Get local overrides/additions
        const localData = localStorage.getItem("class-quotes");
        let localQuotes: Quote[] = localData ? JSON.parse(localData) : [];

        // 3. Combine file quotes with local quotes
        // We prioritize local storage if it has data, but if it's empty (first visit),
        // we start with the file.
        // If the user has added quotes locally, they will be in localQuotes.
        // We want to make sure we don't lose the file quotes if they aren't in local storage yet.
        
        if (localQuotes.length === 0) {
           setQuotes(fileQuotes);
        } else {
           // Basic merge strategy: Use local storage as the source of truth for now
           // since it contains user changes. 
           // Ideally we would merge unique IDs but for a simple prototype, 
           // respecting local persistence is key.
           setQuotes(localQuotes);
        }
      } catch (error) {
        console.error("Failed to load quotes", error);
        // Fallback to local storage only if file fetch fails
        const localData = localStorage.getItem("class-quotes");
        if (localData) {
          setQuotes(JSON.parse(localData));
        }
      } finally {
        setLoading(false);
      }
    };
    loadQuotes();
  }, []);

  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("All");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("All");

  useEffect(() => {
    localStorage.setItem("class-quotes", JSON.stringify(quotes));
  }, [quotes]);

  const handleAddQuote = (data: Omit<Quote, "id" | "timestamp">) => {
    const newQuote: Quote = {
      ...data,
      id: nanoid(),
      timestamp: Date.now(),
    };
    setQuotes((prev) => [newQuote, ...prev]);
  };

  const handleDeleteQuote = (id: string) => {
    setQuotes((prev) => prev.filter((q) => q.id !== id));
    toast({
      title: "Zitat gelöscht",
      description: "Das Zitat wurde erfolgreich entfernt.",
    });
  };

  const filteredQuotes = useMemo(() => {
    return quotes.filter((quote) => {
      // Role Filter
      if (roleFilter !== "All" && quote.type !== roleFilter) {
        return false;
      }

      // Search Filter
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        quote.name.toLowerCase().includes(searchLower) || 
        quote.text.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // Time Filter
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
    }).sort((a, b) => b.timestamp - a.timestamp); // Sort Newest First
  }, [quotes, search, timeFilter, roleFilter]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      {/* Header */}
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
        {/* Submission Section - Only visible to Admins */}
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

        {/* Filters */}
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

        {/* Quotes Grid */}
        <section>
          {filteredQuotes.length > 0 ? (
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
