import React, { useState } from 'react';
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { 
  Brain, ChartLine, Recycle, ShoppingBasket, Wand2, PieChart, Calendar as CalendarIcon, 
  ShoppingCart, Plus as PlusIcon, Building, List, BarChart2, Truck, Camera, ClipboardCheck, 
  Thermometer, Barcode, Calendar, Shield, FileText, AlertTriangle, Box, Package, 
  Utensils, Coffee, Salad, IceCream, Pizza, Beef, Fish, Carrot, Apple, GlassWater,
  ChevronDown, ChevronRight, CheckCircle, XCircle, Clock, AlertCircle, Menu, X
} from 'lucide-react';
import { useTheme } from "@/components/ui/theme-context";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Sidebar = ({ 
  isOpen = true, 
  onToggle = () => {}, 
  activeModule = '', 
  onModuleChange = () => {},
  restaurantName = "Brasserie Claouey",
  aiStatus = "Connectée",
  alerts = {}
}) => {
  const [expandedMenus, setExpandedMenus] = React.useState({});
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const toggleSubmenu = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const getIcon = (iconName) => {
    const iconMap = {
      'brain': Brain,
      'chart-line': ChartLine,
      'recycle': Recycle,
      'shopping-list': ShoppingBasket,
      'magic': Wand2,
      'chart-pie': PieChart,
      'calendar-day': CalendarIcon,
      'calendar-week': Calendar,
      'calendar-alt': Calendar,
      'shopping-cart': ShoppingCart,
      'plus': PlusIcon,
      'building': Building,
      'list': List,
      'chart-bar': BarChart2,
      'truck': Truck,
      'camera': Camera,
      'clipboard-check': ClipboardCheck,
      'thermometer-half': Thermometer,
      'thermometer': Thermometer,
      'barcode': Barcode,
      'calendar': Calendar,
      'shield-alt': Shield,
      'file-alt': FileText,
      'exclamation-triangle': AlertTriangle,
      'box': Box,
      'package': Package,
      'utensils': Utensils,
      'coffee': Coffee,
      'salad': Salad,
      'ice-cream': IceCream,
      'pizza': Pizza,
      'beef': Beef,
      'fish': Fish,
      'carrot': Carrot,
      'apple': Apple,
      'glass-water': GlassWater
    };
    return iconMap[iconName] || Box;
  };

  const menuSections = [
    {
      title: "IA & Prédictions",
      items: [
        {
          id: 'predictions',
          icon: 'brain',
          label: 'Analyse Cuisine',
          badge: { type: 'success', value: '87%' },
          submenu: [
            { id: 'kitchen-analysis', icon: 'chart-line', label: 'Situation Actuelle' },
            { id: 'anti-waste', icon: 'recycle', label: 'Anti-Gaspillage' },
            { id: 'shopping-ai', icon: 'shopping-list', label: 'Liste Courses IA' },
            { id: 'menu-optimization', icon: 'magic', label: 'Menu Optimal' }
          ]
        },
        {
          id: 'sales-predictions',
          icon: 'chart-pie',
          label: 'Prédictions Ventes',
          submenu: [
            { id: 'prediction-today', icon: 'calendar-day', label: 'Aujourd\'hui' },
            { id: 'prediction-week', icon: 'calendar-week', label: 'Cette Semaine' },
            { id: 'prediction-month', icon: 'calendar-alt', label: 'Ce Mois' }
          ]
        }
      ]
    },
    {
      title: "Approvisionnement",
      items: [
        {
          id: 'purchases',
          icon: 'shopping-cart',
          label: 'Commandes',
          badge: { type: 'warning', value: alerts.purchases || 3 },
          submenu: [
            { id: 'new-purchase', icon: 'plus', label: 'Nouvelle Commande' },
           
          ]
        },
        {
          id: 'suppliers',
          icon: 'building',
          label: 'Fournisseurs',
          submenu: [
            { id: 'all-suppliers', icon: 'list', label: 'Tous Fournisseurs' },
            { id: 'new-supplier', icon: 'plus', label: 'Nouveau Fournisseur' },
            { id: 'supplier-performance', icon: 'chart-bar', label: 'Performance' }
          ]
        }
      ]
    },
    {
      title: "Réceptions",
      items: [
        {
          id: 'reception',
          icon: 'truck',
          label: 'Liste Réceptions',
          badge: { type: 'info', value: alerts.receptions || 4 },
          submenu: [
            { id: 'ocr-scanner', icon: 'camera', label: 'Scanner OCR' },
            { id: 'quality-control', icon: 'clipboard-check', label: 'Contrôle Qualité' },
            { id: 'temperature-control', icon: 'thermometer-half', label: 'Température' },
            { id: 'batch-management', icon: 'barcode', label: 'Gestion Lots' },
            { id: 'delivery-planning', icon: 'calendar', label: 'Planning' }
          ]
        },
        {
          id: 'haccp',
          icon: 'shield-alt',
          label: 'HACCP',
          submenu: [
            { id: 'control-forms', icon: 'file-alt', label: 'Fiches Contrôle' },
            { id: 'temperature-logs', icon: 'thermometer', label: 'Relevés T°' },
            { id: 'non-compliance', icon: 'exclamation-triangle', label: 'Non-Conformités' }
          ]
        }
      ]
    },
    {
      title: "Gestion Stock",
      items: [
        {
          id: 'inventory',
          icon: 'warehouse',
          label: 'Inventaire',
          badge: { type: 'warning', value: alerts.inventory || 247 },
          submenu: [
            { id: 'all-items', icon: 'list', label: 'Tous les Articles' },
            { id: 'add-item', icon: 'plus', label: 'Ajouter Article' },
            { id: 'adjustments', icon: 'adjust', label: 'Ajustements' },
            { id: 'movements', icon: 'chart-line', label: 'Mouvements' },
            { id: 'valuation', icon: 'calculator', label: 'Valorisation' }
          ]
        },
        {
          id: 'dlc-alerts',
          icon: 'clock',
          label: 'Alertes DLC',
          badge: { type: 'danger', value: alerts.dlc || 8 },
          submenu: [
            { id: 'critical-dlc', icon: 'exclamation-triangle', label: 'Critiques (24h)' },
            { id: 'urgent-dlc', icon: 'exclamation', label: 'Urgentes (3j)' },
            { id: 'preventive-dlc', icon: 'info', label: 'Préventives (7j)' }
          ]
        }
      ]
    },
    {
      title: "Production",
      items: [
        {
          id: 'recipes',
          icon: 'utensils',
          label: 'Recettes',
          submenu: [
            { id: 'all-recipes', icon: 'list', label: 'Toutes Recettes' },
            { id: 'new-recipe', icon: 'plus', label: 'Nouvelle Recette' },
            { id: 'ai-generator', icon: 'robot', label: 'Générer IA' },
            { id: 'cost-calculation', icon: 'calculator', label: 'Calcul Coûts' },
            { id: 'technical-sheets', icon: 'file-pdf', label: 'Fiches Techniques' }
          ]
        },
        {
          id: 'products',
          icon: 'tags',
          label: 'Produits',
          submenu: [
            { id: 'product-catalog', icon: 'list', label: 'Catalogue' },
            { id: 'price-management', icon: 'percent', label: 'Gestion Prix' },
            { id: 'availability', icon: 'eye', label: 'Disponibilité' }
          ]
        },
        {
          id: 'menus',
          icon: 'book',
          label: 'Menus',
          submenu: [
            { id: 'create-menu', icon: 'edit', label: 'Créer Menu' },
            { id: 'optimize-menu', icon: 'magic', label: 'Optimiser IA' },
            { id: 'print-menu', icon: 'print', label: 'Imprimer' }
          ]
        }
      ]
    },
    {
      title: "Ventes",
      items: [
        {
          id: 'sales',
          icon: 'chart-line',
          label: 'Suivi Ventes',
          submenu: [
            { id: 'new-sale', icon: 'plus', label: 'Nouvelle Vente' },
            { id: 'sales-history', icon: 'list', label: 'Historique' },
            { id: 'sales-analytics', icon: 'chart-bar', label: 'Statistiques' },
            { id: 'hiboutik-sync', icon: 'sync', label: 'Sync Hiboutik' }
          ]
        },
        {
          id: 'analytics',
          icon: 'analytics',
          label: 'Analytics',
          submenu: [
            { id: 'dashboard', icon: 'tachometer-alt', label: 'Dashboard' },
            { id: 'trends', icon: 'trending-up', label: 'Tendances' },
            { id: 'customers', icon: 'users', label: 'Clients' }
          ]
        }
      ]
    },
    {
      title: "Administration",
      items: [
        {
          id: 'reports',
          icon: 'file-alt',
          label: 'Rapports'
        },
        {
          id: 'settings',
          icon: 'cog',
          label: 'Paramètres'
        },
        {
          id: 'users',
          icon: 'users',
          label: 'Utilisateurs'
        }
      ]
    }
  ];

  return (
    <div className={cn(
      'h-full flex flex-col overflow-hidden transition-all duration-300 ease-in-out',
      'border-r',
      isDark ? 'bg-background border-slate-800' : 'bg-white border-slate-200',
      isOpen ? 'w-72' : 'w-20'
    )}>
      <div className={cn(
        'p-4 border-b flex items-center justify-between',
        isDark ? 'border-slate-800' : 'border-slate-200'
      )}>
        {isOpen ? (
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">{restaurantName}</h2>
            <div className="flex items-center gap-1.5">
              <div className={cn(
                'h-2 w-2 rounded-full',
                aiStatus === 'Connectée' ? 'bg-green-500' : 'bg-red-500'
              )} />
              <span className="text-xs text-muted-foreground">
                {aiStatus === 'Connectée' ? 'IA Connectée' : 'IA Déconnectée'}
              </span>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            <span className="text-sm font-medium">{restaurantName.charAt(0)}</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onToggle}
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          <span className="sr-only">{isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}</span>
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {menuSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              {isOpen && (
                <h3 className={cn(
                  'px-2 mb-2 text-xs font-semibold tracking-wider uppercase',
                  'text-muted-foreground'
                )}>
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = activeModule === item.id;
                  const isExpanded = expandedMenus[item.id];
                  const Icon = getIcon(item.icon);
                  
                  if (!item.submenu) {
                    return (
                      <Tooltip key={item.id} disableHoverableContent={isOpen}>
                        <TooltipTrigger asChild>
                          <Button
                            variant={isActive ? 'secondary' : 'ghost'}
                            className={cn(
                              'w-full justify-start gap-3 relative',
                              isActive ? 'bg-accent' : 'hover:bg-accent/50',
                              !isOpen && 'justify-center px-0'
                            )}
                            onClick={() => onModuleChange(item.id)}
                          >
                            <Icon className="h-4 w-4" />
                            {isOpen && (
                              <>
                                <span className="flex-1 text-left">{item.label}</span>
                                {item.badge && (
                                  <Badge 
                                    variant={item.badge.type === 'success' ? 'default' : item.badge.type}
                                    className="ml-auto"
                                  >
                                    {item.badge.value}
                                  </Badge>
                                )}
                              </>
                            )}
                            {isActive && (
                              <div className={cn(
                                'absolute right-2 top-1/2 -translate-y-1/2 w-1 h-6 rounded-l',
                                'bg-primary'
                              )} />
                            )}
                          </Button>
                        </TooltipTrigger>
                        {!isOpen && (
                          <TooltipContent side="right" sideOffset={10}>
                            <div className="flex items-center gap-2">
                              <span>{item.label}</span>
                              {item.badge && (
                                <Badge 
                                  variant={item.badge.type === 'success' ? 'default' : item.badge.type}
                                  className="ml-1"
                                >
                                  {item.badge.value}
                                </Badge>
                              )}
                            </div>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    );
                  }

                  return (
                    <Collapsible
                      key={item.id}
                      open={isExpanded}
                      onOpenChange={() => toggleSubmenu(item.id)}
                      className="space-y-1"
                    >
                      <Tooltip disableHoverableContent={isOpen}>
                        <TooltipTrigger asChild>
                          <Button
                            variant={isActive ? 'secondary' : 'ghost'}
                            className={cn(
                              'w-full justify-start gap-3 group',
                              isActive ? 'bg-accent' : 'hover:bg-accent/50',
                              !isOpen && 'justify-center px-0'
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            {isOpen && (
                              <>
                                <span className="flex-1 text-left">{item.label}</span>
                                {item.badge && (
                                  <Badge 
                                    variant={item.badge.type === 'success' ? 'default' : item.badge.type}
                                    className="ml-auto"
                                  >
                                    {item.badge.value}
                                  </Badge>
                                )}
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                                )}
                              </>
                            )}
                          </Button>
                        </TooltipTrigger>
                        {!isOpen && (
                          <TooltipContent side="right" sideOffset={10}>
                            <div className="flex items-center gap-2">
                              <span>{item.label}</span>
                              {item.badge && (
                                <Badge 
                                  variant={item.badge.type === 'success' ? 'default' : item.badge.type}
                                  className="ml-1"
                                >
                                  {item.badge.value}
                                </Badge>
                              )}
                            </div>
                          </TooltipContent>
                        )}
                      </Tooltip>
                      
                      <CollapsibleContent className="pl-2 mt-1 space-y-1">
                        {item.submenu.map((subItem) => {
                          const SubIcon = getIcon(subItem.icon);
                          const isSubActive = activeModule === subItem.id;
                          
                          return (
                            <Tooltip key={subItem.id} disableHoverableContent={isOpen}>
                              <TooltipTrigger asChild>
                                <Button
                                  variant={isSubActive ? 'secondary' : 'ghost'}
                                  size="sm"
                                  className={cn(
                                    'w-full justify-start gap-3 h-8 pl-8',
                                    isSubActive ? 'bg-accent' : 'hover:bg-accent/50',
                                    !isOpen && 'justify-center px-0'
                                  )}
                                  onClick={() => onModuleChange(subItem.id)}
                                >
                                  {isOpen ? (
                                    <>
                                      <SubIcon className="h-3.5 w-3.5" />
                                      <span className="text-sm">{subItem.label}</span>
                                    </>
                                  ) : (
                                    <SubIcon className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              {!isOpen && (
                                <TooltipContent side="right" sideOffset={10}>
                                  {subItem.label}
                                </TooltipContent>
                              )}
                            </Tooltip>
                          );
                        })}
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
              {sectionIndex < menuSections.length - 1 && (
                <Separator className="my-4" />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-gray-100 rounded-t-2xl">
        <div className="text-center">
          <div className="font-bold text-gray-800">{restaurantName}</div>
          <small className="text-gray-600">
            IA: <span className="text-green-500">● {aiStatus}</span>
          </small>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;