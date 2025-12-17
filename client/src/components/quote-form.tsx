import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Quote } from "@/types/quote";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Send, PenLine } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein."),
  text: z.string().min(5, "Zitat muss mindestens 5 Zeichen lang sein."),
  type: z.enum(["Teacher", "Student"]),
});

interface QuoteFormProps {
  onSubmit: (data: Omit<Quote, "id" | "timestamp">) => void;
}

export function QuoteForm({ onSubmit }: QuoteFormProps) {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      text: "",
      type: "Student",
    },
  });

  function handleSubmit(values: z.infer<typeof formSchema>) {
    onSubmit(values);
    form.reset();
    toast({
      title: "Zitat hinzugefügt",
      description: "Dein Zitat wurde erfolgreich gespeichert.",
    });
  }

  // Auto-save draft functionality
  const values = form.watch();
  useEffect(() => {
    localStorage.setItem("quote-form-draft", JSON.stringify(values));
  }, [values]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem("quote-form-draft");
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
      } catch (e) {}
    }
  }, []);


  return (
    <Card className="border-t-4 border-t-primary shadow-lg bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <PenLine className="w-6 h-6 text-primary" />
          Zitat einreichen
        </CardTitle>
        <CardDescription>
          Halte einen unvergesslichen Moment aus dem Unterricht fest.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Wer hat es gesagt?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rolle</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Rolle auswählen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Student">Schüler</SelectItem>
                        <SelectItem value="Teacher">Lehrer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zitat</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Was wurde gesagt?" 
                      className="min-h-[100px] resize-none text-lg font-quote" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full md:w-auto font-semibold">
              <Send className="w-4 h-4 mr-2" />
              Zitat hinzufügen
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
