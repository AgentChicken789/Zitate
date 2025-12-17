import { useState } from "react";
import type { Quote } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Quote as QuoteIcon, GraduationCap, School, Trash2, Pencil, User, Calendar as CalendarIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface QuoteCardProps {
  quote: Quote;
  index: number;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (id: string, data: { name?: string; text?: string; type?: string; timestamp?: number }) => void;
}

export function QuoteCard({ quote, index, isAdmin, onDelete, onEdit }: QuoteCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState(quote.name);
  const [editText, setEditText] = useState(quote.text);
  const [editType, setEditType] = useState(quote.type);
  const [editDate, setEditDate] = useState<Date>(new Date(quote.timestamp));

  const isTeacher = quote.type === "Teacher";
  const isStudent = quote.type === "Student";
  const isNone = quote.type === "None";

  const handleSave = () => {
    if (onEdit) {
      onEdit(quote.id, {
        name: editName,
        text: editText,
        type: editType,
        timestamp: editDate.getTime(),
      });
    }
    setIsEditOpen(false);
  };

  const handleOpenEdit = () => {
    setEditName(quote.name);
    setEditText(quote.text);
    setEditType(quote.type);
    setEditDate(new Date(quote.timestamp));
    setIsEditOpen(true);
  };

  const getTypeLabel = () => {
    if (isTeacher) return "Lehrer";
    if (isStudent) return "Schüler";
    return "Keine Rolle";
  };

  const getTypeIcon = () => {
    if (isTeacher) return <School className="w-3 h-3 mr-1" />;
    if (isStudent) return <GraduationCap className="w-3 h-3 mr-1" />;
    return <User className="w-3 h-3 mr-1" />;
  };

  const getBorderClass = () => {
    if (isTeacher) return "border-l-primary bg-teacher/30";
    if (isStudent) return "border-l-student-foreground bg-student/30";
    return "border-l-muted-foreground bg-muted/20";
  };

  const getBadgeClass = () => {
    if (isTeacher) return "text-primary border-primary/20 bg-primary/5";
    if (isStudent) return "text-student-foreground border-student-foreground/20 bg-student-foreground/5";
    return "text-muted-foreground border-muted-foreground/20 bg-muted-foreground/5";
  };
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Card className={`h-full border-l-4 transition-all hover:shadow-md relative group ${getBorderClass()}`}>
          <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2 space-y-0">
            <Badge 
              variant="outline" 
              className={getBadgeClass()}
            >
              {getTypeIcon()}
              {getTypeLabel()}
            </Badge>
            
            <div className="flex gap-2">
              {isAdmin && onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                  onClick={handleOpenEdit}
                  data-testid={`button-edit-quote-${quote.id}`}
                >
                  <Pencil className="w-4 h-4" />
                  <span className="sr-only">Bearbeiten</span>
                </Button>
              )}
              {isAdmin && onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                  onClick={() => onDelete(quote.id)}
                  data-testid={`button-delete-quote-${quote.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="sr-only">Löschen</span>
                </Button>
              )}
              <QuoteIcon className="w-8 h-8 text-muted-foreground/20" />
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <blockquote className="font-quote text-lg leading-relaxed text-foreground italic" data-testid={`text-quote-${quote.id}`}>
              "{quote.text}"
            </blockquote>
          </CardContent>
          <CardFooter className="pt-0 flex flex-wrap justify-between items-center gap-2 text-sm text-muted-foreground">
            <span className="font-semibold font-sans text-foreground/80" data-testid={`text-author-${quote.id}`}>— {quote.name}</span>
            <time dateTime={new Date(quote.timestamp).toISOString()} data-testid={`text-date-${quote.id}`}>
              {format(new Date(quote.timestamp), "d. MMM yyyy", { locale: de })}
            </time>
          </CardFooter>
        </Card>
      </motion.div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Zitat bearbeiten</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  data-testid="input-edit-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Rolle</Label>
                <Select value={editType} onValueChange={setEditType}>
                  <SelectTrigger data-testid="select-edit-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">Keine</SelectItem>
                    <SelectItem value="Student">Schüler</SelectItem>
                    <SelectItem value="Teacher">Lehrer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Datum</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !editDate && "text-muted-foreground"
                    )}
                    data-testid="button-edit-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editDate ? format(editDate, "d. MMM yyyy", { locale: de }) : "Datum wählen"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={editDate}
                    onSelect={(date) => date && setEditDate(date)}
                    disabled={(date) => date > new Date()}
                    locale={de}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-text">Zitat</Label>
              <Textarea
                id="edit-text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="min-h-[100px] resize-none"
                data-testid="textarea-edit-text"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} data-testid="button-cancel-edit">
              Abbrechen
            </Button>
            <Button onClick={handleSave} data-testid="button-save-edit">
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
