import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, LogOut, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminLoginProps {
  isAdmin: boolean;
  onLogin: (status: boolean) => void;
}

export function AdminLogin({ isAdmin, onLogin }: AdminLoginProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock password check
    if (password === "admin") {
      onLogin(true);
      setIsOpen(false);
      setPassword("");
      toast({
        title: "Admin Access Granted",
        description: "You can now add and manage quotes.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Incorrect password. Try 'admin'.",
      });
    }
  };

  const handleLogout = () => {
    onLogin(false);
    toast({
      title: "Logged Out",
      description: "Admin access has been revoked.",
    });
  };

  if (isAdmin) {
    return (
      <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
          <Lock className="w-4 h-4 mr-2" />
          Admin Login
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Admin Access
          </DialogTitle>
          <DialogDescription>
            Enter the admin password to add new quotes. <br/>
            <span className="text-xs text-muted-foreground">(Hint: use "admin")</span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleLogin} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
            />
          </div>
          <DialogFooter>
            <Button type="submit">Login</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
