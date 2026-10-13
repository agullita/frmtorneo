import { Trophy } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-gradient-royal text-white shadow-royal sticky top-0 z-40">
      <div className="container mx-auto px-3 py-3">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="bg-white p-1.5 rounded-full">
              <Trophy className="h-5 w-5 text-royal-blue" />
            </div>
            <div className="text-center">
              <h1 className="text-base font-bold leading-tight">Fundación Real Madrid</h1>
              <p className="text-madrid-gold text-[10px]">Torneo de Fútbol</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;