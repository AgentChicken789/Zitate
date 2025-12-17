import { Quote } from "@/types/quote";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Quote as QuoteIcon, GraduationCap, School } from "lucide-react";
import { motion } from "framer-motion";

interface QuoteCardProps {
  quote: Quote;
  index: number;
}

export function QuoteCard({ quote, index }: QuoteCardProps) {
  const isTeacher = quote.type === "Teacher";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className={`h-full border-l-4 transition-all hover:shadow-md ${
        isTeacher 
          ? "border-l-primary bg-teacher/30" 
          : "border-l-student-foreground bg-student/30"
      }`}>
        <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
          <Badge 
            variant="outline" 
            className={`${
              isTeacher 
                ? "text-primary border-primary/20 bg-primary/5" 
                : "text-student-foreground border-student-foreground/20 bg-student-foreground/5"
            }`}
          >
            {isTeacher ? <School className="w-3 h-3 mr-1" /> : <GraduationCap className="w-3 h-3 mr-1" />}
            {quote.type}
          </Badge>
          <QuoteIcon className="w-8 h-8 text-muted-foreground/20" />
        </CardHeader>
        <CardContent className="pb-4">
          <blockquote className="font-quote text-lg leading-relaxed text-foreground italic">
            "{quote.text}"
          </blockquote>
        </CardContent>
        <CardFooter className="pt-0 flex justify-between items-center text-sm text-muted-foreground">
          <span className="font-semibold font-sans text-foreground/80">— {quote.name}</span>
          <time dateTime={new Date(quote.timestamp).toISOString()}>
            {format(new Date(quote.timestamp), "MMM d, yyyy")}
          </time>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
