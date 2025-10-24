"use client"

import { useState } from "react"
import {
  FaExclamationCircle as AlertCircle,
  FaThermometerHalf as Thermometer,
  FaBroom as BroomIcon,
  FaTachometerAlt as LayoutDashboard,
  FaExclamationTriangle as AlertTriangle,
  FaPlus as Plus,
  FaEdit as Edit,
  FaBox as Package,
  FaTruck as Truck,
  FaSpinner as Loader2,
} from "react-icons/fa"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

const API_HOST = "http://localhost:8120"
const TOKEN_KEY = "access_token"

const getHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY)
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export default function Haccp({ restaurantId }) {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Mock data for fallback
  const mockDashboard = {
    total_equipments: 5,
    equipments_requiring_action: 1,
    temperature_checks_today: 12,
    temperature_checks_pending: 2,
    temperature_non_compliant: 0,
    cleaning_tasks_today: 8,
    cleaning_tasks_completed: 6,
    cleaning_tasks_pending: 2,
    active_alerts: 3,
    alerts_by_level: { ok: 0, attention: 2, urgent: 1 },
    compliance_score: 96.5,
    last_audit_date: new Date().toISOString(),
  }

  const mockEquipments = [
    {
      id: "uuid1",
      name: "Frigo Principal",
      type: "Réfrigérateur",
      location: "Cuisine Principale",
      requires_temperature_check: true,
      temperature_min: 0,
      temperature_max: 4,
      is_active: true,
      status: "ok",
      last_check: "2 heures",
    },
    {
      id: "uuid2",
      name: "Congélateur A",
      type: "Congélateur",
      location: "Réserve",
      requires_temperature_check: true,
      temperature_min: -18,
      temperature_max: -15,
      is_active: true,
      status: "ok",
      last_check: "1 heure",
    },
    {
      id: "uuid3",
      name: "Chambre Froide",
      type: "Chambre Froide",
      location: "Sous-sol",
      requires_temperature_check: true,
      temperature_min: 2,
      temperature_max: 6,
      is_active: true,
      status: "attention",
      last_check: "5 heures",
    },
  ]

  const mockTemperatures = [
    {
      id: "uuid1",
      equipment_name: "Frigo Principal",
      temperature: 3.2,
      recorded_at: new Date().toISOString(),
      is_compliant: true,
      recorded_by: "Marie Dubois",
    },
    {
      id: "uuid2",
      equipment_name: "Congélateur A",
      temperature: -17.5,
      recorded_at: new Date(Date.now() - 3600000).toISOString(),
      is_compliant: true,
      recorded_by: "Jean Martin",
    },
    {
      id: "uuid3",
      equipment_name: "Chambre Froide",
      temperature: 4.8,
      recorded_at: new Date(Date.now() - 7200000).toISOString(),
      is_compliant: true,
      recorded_by: "Sophie Laurent",
    },
  ]

  const mockAlerts = [
    {
      id: "uuid1",
      message: "Contrôle température en retard - Chambre Froide",
      level: "urgent",
      type: "temperature",
      created_at: new Date(Date.now() - 18000000).toISOString(),
      is_active: true,
    },
    {
      id: "uuid2",
      message: "Nettoyage quotidien à effectuer - Zone Préparation",
      level: "attention",
      type: "cleaning",
      created_at: new Date(Date.now() - 3600000).toISOString(),
      is_active: true,
    },
    {
      id: "uuid3",
      message: "Maintenance préventive programmée - Frigo Principal",
      level: "attention",
      type: "maintenance",
      created_at: new Date(Date.now() - 86400000).toISOString(),
      is_active: true,
    },
  ]

  const mockReceptions = [
    {
      id: 1,
      supplier: "Transgourmet",
      status: "En cours",
      deliveryTime: "Aujourd'hui 14:30",
      articles: 12,
      controlled: 8,
      progress: 67,
    },
    {
      id: 2,
      supplier: "Metro",
      status: "En attente",
      deliveryTime: "Demain 09:00",
      articles: 18,
      dlcCritiques: 3,
      progress: 0,
    },
    {
      id: 3,
      supplier: "Promocash",
      status: "Terminée",
      deliveryTime: "Hier 16:45",
      articles: 24,
      integrated: 24,
      progress: 100,
    },
  ]

  // State for data
  const [dashboard, setDashboard] = useState(mockDashboard)
  const [equipments, setEquipments] = useState(mockEquipments)
  const [temperatures, setTemperatures] = useState(mockTemperatures)
  const [alerts, setAlerts] = useState(mockAlerts)
  const [receptions, setReceptions] = useState(mockReceptions)
  const [currentReception, setCurrentReception] = useState(null)

  const tabs = [
    { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { id: "equipments", label: "Équipements", icon: Package },
    { id: "temperatures", label: "Températures", icon: Thermometer },
    { id: "alerts", label: "Alertes", icon: AlertTriangle },
    { id: "reception", label: "Réceptions", icon: Truck },
  ]

  const handleCreate = async (endpoint, data) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_HOST}/api/v1/haccp/${restaurantId}/${endpoint}`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      })
      if (response.ok) {
        toast.success("Création réussie")
        return await response.json()
      } else {
        throw new Error("Échec de la création")
      }
    } catch (err) {
      toast.error(err.message || "Une erreur est survenue")
      throw err
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <AlertCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Module HACCP</h1>
              <p className="text-sm text-muted-foreground">Conformité et Traçabilité Alimentaire</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 inline-flex h-12 w-full justify-start gap-2 rounded-xl bg-card p-1">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex dark:text-white items-center gap-2 rounded-lg px-4 data-[state=active]:bg-sky-500 data-[state=active]:text-primary-foreground"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline " >{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Équipements"
                value={dashboard.total_equipments}
                subtitle={`${dashboard.equipments_requiring_action} nécessite une action`}
                icon={Package}
                trend="+2%"
              />
              <StatCard
                title="Contrôles Temp."
                value={dashboard.temperature_checks_today}
                subtitle={`${dashboard.temperature_checks_pending} en attente`}
                icon={Thermometer}
                trend="+12%"
              />
              <StatCard
                title="Tâches Nettoyage"
                value={`${dashboard.cleaning_tasks_completed}/${dashboard.cleaning_tasks_today}`}
                subtitle="Complétées aujourd'hui"
                icon={BroomIcon}
                trend="75%"
              />
              <StatCard
                title="Alertes Actives"
                value={dashboard.active_alerts}
                subtitle={`${dashboard.alerts_by_level?.urgent || 0} urgentes`}
                icon={AlertTriangle}
                trend="critical"
                variant="danger"
              />
            </div>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Score de Conformité</CardTitle>
                <CardDescription>Performance globale HACCP</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="flex h-32 w-32 items-center justify-center rounded-full bg-primary/10">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary">{dashboard.compliance_score}%</div>
                      <div className="text-xs text-muted-foreground">Conforme</div>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Températures</span>
                      <span className="font-medium text-foreground">98%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full w-[98%] bg-green-500" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Nettoyage</span>
                      <span className="font-medium text-foreground">95%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full w-[95%] bg-blue-500" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Alertes Récentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.slice(0, 3).map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start gap-3 rounded-lg border border-border bg-background p-4"
                    >
                      <div
                        className={`mt-0.5 h-2 w-2 rounded-full ${
                          alert.level === "urgent" ? "bg-red-500" : "bg-yellow-500"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(alert.created_at).toLocaleString("fr-FR")}
                        </p>
                      </div>
                      <Badge variant={alert.level === "urgent" ? "destructive" : "secondary"}>{alert.level}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equipments" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Équipements</h2>
                <p className="text-sm text-muted-foreground">Gestion des équipements de cuisine</p>
              </div>
              <Button className="gap-2 text-white">
                <Plus className="h-4 w-4" />
                Ajouter
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {equipments.map((equipment) => (
                <Card key={equipment.id} className="border-border bg-card">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg text-foreground">{equipment.name}</CardTitle>
                        <CardDescription>{equipment.location}</CardDescription>
                      </div>
                      <Badge variant={equipment.status === "ok" ? "secondary" : "destructive"} className="capitalize">
                        {equipment.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-medium text-foreground">{equipment.type}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Température</span>
                      <span className="font-medium text-foreground">
                        {equipment.temperature_min}°C à {equipment.temperature_max}°C
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Dernier contrôle</span>
                      <span className="font-medium text-foreground">{equipment.last_check}</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Edit className="mr-2 h-3 w-3" />
                        Modifier
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Thermometer className="mr-2 h-3 w-3" />
                        Contrôler
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="temperatures" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Relevés de Température</h2>
                <p className="text-sm text-muted-foreground">Historique des contrôles</p>
              </div>
              <Button className="gap-2 dark:text-white">
                <Plus className="h-4 w-4" />
                Nouveau relevé
              </Button>
            </div>

            <div className="space-y-3">
              {temperatures.map((temp) => (
                <Card key={temp.id} className="border-border bg-card">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
                      <Thermometer className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{temp.equipment_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Par {temp.recorded_by} • {new Date(temp.recorded_at).toLocaleString("fr-FR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${temp.is_compliant ? "text-green-500" : "text-red-500"}`}>
                        {temp.temperature}°C
                      </div>
                      <Badge variant={temp.is_compliant ? "secondary" : "destructive"}>
                        {temp.is_compliant ? "Conforme" : "Non conforme"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Alertes HACCP</h2>
                <p className="text-sm text-muted-foreground">{alerts.length} alertes actives</p>
              </div>
            </div>

            <div className="space-y-3">
              {alerts.map((alert) => (
                <Card
                  key={alert.id}
                  className={`border-l-4 ${
                    alert.level === "urgent" ? "border-l-red-500" : "border-l-yellow-500"
                  } border-border bg-card`}
                >
                  <CardContent className="flex items-start gap-4 p-6">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        alert.level === "urgent" ? "bg-red-500/10" : "bg-yellow-500/10"
                      }`}
                    >
                      <AlertTriangle
                        className={`h-5 w-5 ${alert.level === "urgent" ? "text-red-500" : "text-yellow-500"}`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">{alert.message}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(alert.created_at).toLocaleString("fr-FR")}
                          </p>
                        </div>
                        <Badge variant={alert.level === "urgent" ? "destructive" : "secondary"}>{alert.level}</Badge>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button size="sm" variant="outline">
                          Traiter
                        </Button>
                        <Button size="sm" variant="ghost">
                          Ignorer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reception" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Réceptions Marchandises</h2>
                <p className="text-sm text-muted-foreground">Gestion des livraisons</p>
              </div>
              <Button className="gap-2 dark:text-white">
                <Plus className="h-4 w-4" />
                Nouvelle réception
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {receptions.map((rec) => (
                <Card key={rec.id} className="border-border bg-card">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg text-foreground">{rec.supplier}</CardTitle>
                        <CardDescription>{rec.deliveryTime}</CardDescription>
                      </div>
                      <Badge
                        variant={
                          rec.status === "Terminée" ? "secondary" : rec.status === "En cours" ? "default" : "outline"
                        }
                      >
                        {rec.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Articles</span>
                      <span className="font-medium text-foreground">{rec.articles}</span>
                    </div>
                    {rec.status === "En cours" && (
                      <>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progression</span>
                            <span className="font-medium text-foreground">{rec.progress}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-secondary">
                            <div className="h-full bg-primary transition-all" style={{ width: `${rec.progress}%` }} />
                          </div>
                        </div>
                        <Button className="w-full" onClick={() => setCurrentReception(rec)}>
                          Continuer le contrôle
                        </Button>
                      </>
                    )}
                    {rec.status === "Terminée" && (
                      <Button variant="outline" className="w-full bg-transparent">
                        Voir le rapport
                      </Button>
                    )}
                    {rec.status === "En attente" && (
                      <Button variant="outline" className="w-full bg-transparent">
                        Démarrer le contrôle
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function StatCard({ title, value, subtitle, icon: Icon, trend, variant = "default" }) {
  const variantStyles = {
    default: "bg-card border-border",
    danger: "bg-red-500/5 border-red-500/20",
  }

  return (
    <Card className={`${variantStyles[variant]} border`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="mt-2 text-3xl font-bold text-foreground">{value}</h3>
            {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center gap-1 text-xs">
            {trend === "critical" ? (
              <span className="font-medium text-red-500">Action requise</span>
            ) : (
              <>
                <span className="font-medium text-green-500">{trend}</span>
                <span className="text-muted-foreground">vs. hier</span>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
