import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, LogOut, ShieldCheck, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createPortal } from "react-dom";

interface AdminLoginProps {
  isAdmin: boolean;
  onLogin: (status: boolean) => void;
}

export function AdminLogin({ isAdmin, onLogin }: AdminLoginProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
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
        description: "Incorrect password.",
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
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setIsOpen(true)}
        className="text-muted-foreground hover:text-primary"
      >
        <Lock className="w-4 h-4 mr-2" />
        Admin Login
      </Button>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-background w-full max-w-[425px] rounded-xl shadow-lg border border-border p-6 relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
            
            <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
              <h2 className="text-lg font-semibold leading-none tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Admin Access
              </h2>
              <p className="text-sm text-muted-foreground">
                Enter the admin password to add new quotes.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  autoFocus
                />
              </div>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-2">
                <Button type="submit">Login</Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
