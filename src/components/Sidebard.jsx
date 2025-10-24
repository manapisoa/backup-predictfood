import { 
  MdOutlineDashboard, 
  MdOutlineSmartToy, 
  MdOutlineInventory, 
  MdOutlineLocalShipping, 
  MdOutlineWarehouse, 
  MdOutlinePrecisionManufacturing, 
  MdOutlinePointOfSale, 
  MdOutlineSettings, 
  MdLogout,
  MdRestaurant 
} from "react-icons/md";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from "@/components/ui/theme-context";
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  


  const menuItems = [
    { name: 'Dashboard', icon: MdOutlineDashboard, path: '/dashboard' },
    { name: 'IA & Prédictions', icon: MdOutlineSmartToy, path: '/ai-predictions' },
    { name: 'Approvisionnement', icon: MdOutlineInventory, path: '/approvisionnement' },
    { name: 'Réceptions', icon: MdOutlineLocalShipping, path: '/receptions' },
    { name: 'Gestion Stock', icon: MdOutlineWarehouse, path: '/stock' },
    { name: 'Production', icon: MdOutlinePrecisionManufacturing, path: '/production' },
    { name: 'Ventes', icon: MdOutlinePointOfSale, path: '/ventes' },
    { name: 'Administration', icon: MdOutlineSettings, path: '/admin' },
  ];

  return (
    <div className={cn(
      'fixed left-0 top-0 h-full w-64 flex flex-col',
      'bg-background border-r',
      isDark ? 'border-slate-800' : 'border-slate-200',
      'transition-colors duration-200'
    )}>
      {/* Header */}
      <div className={cn(
        'p-4 border-b',
        isDark ? 'border-slate-800' : 'border-slate-200'
      )}>
        <div className='flex items-center gap-3'>
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground'
          )}>
            <MdRestaurant className='text-xl' />
          </div>
          <div>
            <h1 className='text-lg font-bold tracking-tight'>PredictFood</h1>
            <p className='text-sm text-muted-foreground'>Restaurant Management</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <ScrollArea className='flex-1'>
        <div className='p-4'>
          <nav className='space-y-1'>
            <TooltipProvider>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.path}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium',
                          'transition-colors hover:bg-accent hover:text-accent-foreground',
                          isActive 
                            ? 'bg-accent text-accent-foreground' 
                            : 'text-muted-foreground'
                        )}
                      >
                        <Icon className={cn(
                          'h-5 w-5 transition-transform',
                          isActive && 'scale-110'
                        )} />
                        <span >{item.name}</span>
                        {isActive && (
                          <div className='ml-auto w-1.5 h-1.5 bg-primary rounded-full animate-pulse' />
                        )}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={10}>
                      {item.name}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </TooltipProvider>
          </nav>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className={cn(
        'p-4 border-t',
        isDark ? 'border-slate-800' : 'border-slate-200'
      )}>
        <Button 
          variant="ghost" 
          className={cn(
            'w-full justify-start gap-3 text-muted-foreground',
            'hover:bg-destructive/10 hover:text-destructive transition-colors'
          )}
          asChild
        >
          <Link to="/logout">
            <MdLogout className='h-5 w-5' />
            <span>Se déconnecter</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;