import { useState, useEffect, useMemo } from "react";
import { Quote } from "@/types/quote";
import { QuoteCard } from "@/components/quote-card";
import { QuoteForm } from "@/components/quote-form";
import { FilterBar, TimeFilter, RoleFilter } from "@/components/filter-bar";
import { nanoid } from "nanoid";
import { subDays, subMonths, subYears, isAfter } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap } from "lucide-react";

// Mock data for initial load if empty
const INITIAL_QUOTES: Quote[] = [
  {
    id: "1",
    name: "Mr. Anderson",
    text: "History is not just dates and names, it is the gossip of the past.",
    type: "Teacher",
    timestamp: Date.now() - 100000000,
  },
  {
    id: "2",
    name: "Sarah Jenkins",
    text: "Can we please have class outside today? The sun is literally calling my name.",
    type: "Student",
    timestamp: Date.now() - 50000000,
  }
];

export default function Home() {
  const [quotes, setQuotes] = useState<Quote[]>(() => {
    const saved = localStorage.getItem("class-quotes");
    return saved ? JSON.parse(saved) : INITIAL_QUOTES;
  });

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
              ClassQuotes
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
        {/* Submission Section */}
        <section className="w-full max-w-2xl mx-auto">
          <QuoteForm onSubmit={handleAddQuote} />
        </section>

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
                  <QuoteCard key={quote.id} quote={quote} index={index} />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="text-center py-20 text-muted-foreground bg-card/30 rounded-xl border border-dashed border-border">
              <p className="text-lg">No quotes found matching your criteria.</p>
              <p className="text-sm mt-2">Try adjusting your filters or add a new quote.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
