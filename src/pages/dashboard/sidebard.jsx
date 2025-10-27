"use client";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Utensils,
  ShoppingCart,
  ShoppingBasket,
  CookingPot,
  Hammer as Hamburger,
  Wallet,
  AArrowDown as BanknoteArrowDown,
  Truck,
  ShieldHalf,
  DoorOpen,
  Moon,
  Sun,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useTheme } from "@/components/ui/theme-context";

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { theme, toggleTheme } = useTheme();


  const [isCtrlQPressed, setIsCtrlQPressed] = useState(false);


  useEffect(() => {
    const handleKeyDown = (event) => {
      // Vérifie si Ctrl + Q est pressé
      if (event.altKey && (event.key === 'b' || event.key === 'B')) {
        // setIsCtrlQPressed(true);
        console.log('Ctrl + Q pressé : true');
        // setIsCollapsed(!isCollapsed);
        setIsCollapsed((prev) => !prev);
      }
    };

    // const handleKeyUp = (event) => {
    //   // Réinitialise à false quand une touche est relâchée
    //   if (event.key === 'b' || event.key === 'B' ) {
    //     setIsCtrlQPressed(false);
    //     console.log('Touche relâchée : false');
    //     setIsCollapsed(!isCollapsed);

    //   }
    // };

    // Ajoute les écouteurs pour keydown et keyup
    window.addEventListener('keydown', handleKeyDown);
    // window.addEventListener('keyup', handleKeyUp);

    // Nettoyage des écouteurs pour éviter les fuites de mémoire
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isCollapsed]);





  // Points de rupture personnalisés
  const breakpoints = {
    sm: 640,    // Mobile
    md: 768,    // Tablettes
    lg: 1024,   // Petits écrans
    xl: 1280,   // Écrans moyens
    '2xl': 1536 // Grands écrans
  };

  // Gestion du redimensionnement de la fenêtre
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width < breakpoints.md; // < 768px
      
      // Affiche la largeur actuelle de l'écran dans la console
      console.log(`Taille de l'écran: ${width}px (${mobile ? 'Mobile' : 'Desktop'})`);      // Mise à jour de l'état mobile
      setIsMobile(mobile);
      
      // Gestion automatique de la barre latérale
      if (width < breakpoints.lg) { // < 1024px
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
      
      // Fermer le menu mobile si on passe en mode desktop
      if (!mobile) {
        setShowMobileMenu(false);
      }
      else
      {
        setIsCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Appel initial
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
  };

  const menuItems = [
    { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { to: "/purchase", label: "Purchase", icon: Wallet },
    { to: "/supplier", label: "Supplier", icon: Truck },
    { to: "/receptions", label: "Receptions", icon: ShoppingBasket },
    { to: "/inventory", label: "Inventory", icon: ShoppingCart },
    { to: "/product", label: "Products", icon: Hamburger },
    { to: "/recipes", label: "Recipes", icon: CookingPot },
    { to: "/restaurant", label: "Restaurants", icon: Utensils },
    { to: "/sales", label: "Sales", icon: BanknoteArrowDown },
    { to: "/haccp", label: "Haccp", icon: ShieldHalf },
  ];

  return (
    <>
      {/* Bouton du menu mobile */}
      {isMobile && (
        <button 
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="fixed top-4 left-4 z-50 p-2 rounded-md bg-sidebar text-sidebar-foreground md:hidden"
          aria-label="Menu"
          type="button"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      )}
      
      {/* Overlay pour mobile */}
      {isMobile && showMobileMenu && (  
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setShowMobileMenu(false)}
        />
      )}
      
      {/* Conteneur principal de la sidebar */}
      <div 
        className={`fixed md:relative  top-4 rounded-r-lg inset-y-0 left-0 transform ${
          isMobile 
            ? `${showMobileMenu ? 'translate-x-0' : '-translate-x-full'}`
            : 'translate-x-0'
        } ${
          isCollapsed ? 'w-16 md:w-24' : 'w-64'
        } h-screen bg-sidebar border-r border-sidebar-border shadow-md flex flex-col transition-all duration-300 ease-in-out z-50`}
      >
        {/* Bouton de réduction (version desktop) */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`absolute ${
            isCollapsed ? 'left-20' : 'left-60'
          } top-5 transition-all duration-300 bg-background border rounded-full p-1.5 hover:bg-accent hidden lg:flex items-center justify-center`}
          aria-label={isCollapsed ? "Déplier la barre latérale" : "Replier la barre latérale"}
          type="button"
        >
          {isCollapsed ? (
            
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="transition-all duration-300 ease-in-out"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          ) : (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="transition-all duration-300 ease-in-out"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          )}
        </button>
        
        {/* Logo */}
        <div className="px-6 py-4 text-2xl font-bold text-sidebar-primary flex items-center justify-between">
          {!isCollapsed ? (
            <div>Predict Food</div>
          ) : (
            <div className="w-full text-center text-sky-500">
              P<span className="text-foreground">f</span>
            </div>
          )}
        </div>
        
        <Separator />

        {/* Menu */}
        <ScrollArea className="flex-1 px-4 py-6">
          <nav className="flex flex-col gap-2">
            <TooltipProvider>
              {menuItems.map((item, index) => (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.to}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        location.pathname === item.to
                          ? 'bg-sky-500  text-accent-foreground hover:bg-sky-500 font-medium'
                          : 'text-sidebar-foreground/80 hover:bg-sidebar-foreground/10'
                      }`}
                      onClick={() => isMobile && setShowMobileMenu(false)}
                    >
                      <item.icon className={`w-5 h-5 ${isCollapsed ? 'ml-2' : ''}`} />
                      <span className={`${isCollapsed ? 'hidden' : 'block'} ml-3 text-sm font-medium whitespace-nowrap`}>
                        {item.label}
                      </span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent variant="outline" side="right" className="text-white">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </nav>
        </ScrollArea>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`absolute ${
            isCollapsed ? 'left-20' : 'left-60'
          } bottom-16 mb-6 transition-all duration-300 bg-background border rounded-full p-1.5 hover:bg-accent hidden lg:flex items-center justify-center`}
          aria-label={isCollapsed ? "Déplier la barre latérale" : "Replier la barre latérale"}
          type="button"
        >
          {isCollapsed ? (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          ) : (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          )}
        </button>

        <Separator />

        {/* Bouton de réduction (version mobile/tablette) */}
        <div className="p-4 lg:hidden">
          <button 
            onClick={() => {
              setIsCollapsed(!isCollapsed);
              if (isMobile) setShowMobileMenu(false);
            }}
            className="w-full flex items-center justify-center p-2 rounded-md bg-sidebar-accent hover:bg-sidebar-accent/80 transition-colors"
            type="button"
          >
            {isCollapsed ? (
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </span>
            ) : (
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </span>
            )}
          </button>
        </div>

        <div className="p-4">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-3 px-3 py-2 rounded-lg bg-sidebar-accent`}>
            <div className="flex items-center gap-2">
              {theme === "dark" ? (
                <Moon className="w-4 h-4 text-sidebar-accent-foreground" />
              ) : (
                <Sun className="w-4 h-4 text-sidebar-accent-foreground" />
              )}
              {!isCollapsed && (
                <Label htmlFor="theme-toggle" className="text-sm font-medium text-sidebar-accent-foreground cursor-pointer transition-all duration-500 ease-in-out">
                  {theme === "dark" ? "Mode sombre" : "Mode clair"}
                </Label>
              )}
            </div>
            {!isCollapsed && <Switch id="theme-toggle" checked={theme === "dark"} onCheckedChange={toggleTheme} />}
          </div>
        </div>

        <Separator />

        {/* Logout */}
        <div className="p-4">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full flex items-center justify-center border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 bg-transparent"
          >
            <DoorOpen className="w-5 h-5" />
            {!isCollapsed && <span className="ml-2">Se déconnecter</span>}
          </Button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
