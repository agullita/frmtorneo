import { Calendar, CheckCircle, Users, Bell, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavigationProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

const MobileNavigation = ({ currentSection, onSectionChange }: MobileNavigationProps) => {
  const navItems = [
    { id: "partidos", label: "Partidos", icon: Calendar },
    { id: "confirmacion", label: "Confirmar", icon: CheckCircle },
    { id: "ayudantes", label: "Ayudantes", icon: Users },
    { id: "notificaciones", label: "Avisos", icon: Bell },
    { id: "admin", label: "Admin", icon: Shield },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 mb-1",
                isActive && "text-primary"
              )} />
              <span className={cn(
                "text-[10px] font-medium",
                isActive && "text-primary"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavigation;
