"use client"

import { useState, useEffect } from "react"
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BarChart2,
  CheckCircle,
  Database,
  DollarSign,
  FileText,
  Loader2,
  Package,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  Webhook,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"

const API_HOST = "http://localhost:8120/api/v1"
const TOKEN_KEY = "access_token"

const barChartData = [
  { day: "Lundi", revenue: 1200, predictions: 1150 },
  { day: "Mardi", revenue: 1500, predictions: 1450 },
  { day: "Mercredi", revenue: 800, predictions: 900 },
  { day: "Jeudi", revenue: 1000, predictions: 1050 },
  { day: "Vendredi", revenue: 1300, predictions: 1280 },
  { day: "Samedi", revenue: 2000, predictions: 1950 },
  { day: "Dimanche", revenue: 1800, predictions: 1820 },
]

const ingredientUsageData = [
  { ingredient: "Farine", used: 45, unit: "kg", dlc: "15/10/2025" },
  { ingredient: "Tomates", used: 30, unit: "kg", dlc: "12/10/2025" },
  { ingredient: "Mozzarella", used: 25, unit: "kg", dlc: "10/10/2025" },
  { ingredient: "Huile d'olive", used: 8, unit: "L", dlc: "20/11/2025" },
  { ingredient: "Basilic", used: 2, unit: "kg", dlc: "09/10/2025" },
]

const apiFetch = async (endpoint, options = {}) => {
  const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null
  if (!token) {
    throw new Error("No access token found")
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  }

  const config = {
    ...options,
    headers,
  }

  if (options.body) {
    config.body = JSON.stringify(options.body)
  }

  try {
    const response = await fetch(`${API_HOST}${endpoint}`, config)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const error = new Error(errorData.detail || errorData.message || `API error: ${response.statusText}`)
      error.status = response.status
      error.data = errorData
      throw error
    }

    if (response.status === 204) return {}

    return response.json()
  } catch (error) {
    console.error("API Error:", {
      endpoint,
      error: error.message,
      status: error.status,
      data: error.data,
    })
    throw error
  }
}

export default function Sales() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [sales, setSales] = useState([])
  const [loadingSales, setLoadingSales] = useState(false)
  const [errorSales, setErrorSales] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)

  const [dashboardStats, setDashboardStats] = useState({
    todayRevenue: 0,
    revenueChange: 0,
    webhooksReceived: 0,
    webhooksChange: 0,
    mappedRecipes: 0,
    mappingRate: 0,
    fifoUpdates: 0,
    fifoChange: 0,
  })

  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalSales: 0,
    averageBasket: 0,
    processedSales: 0,
    pendingSales: 0,
    errorSales: 0,
    by_provider: {},
    by_payment_method: {}
  })

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredSales, setFilteredSales] = useState([])

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null
    setIsAuthenticated(!!token)
    setAuthChecking(false)

    if (!token) {
      setErrorSales("Aucun token d'authentification trouvé. Veuillez vous connecter.")
    }
  }, [])

  const fetchData = async () => {
    setLoadingSales(true)
    try {
      // Récupération des données de vente
      const params = new URLSearchParams({
        page,
        limit: 50,
        ...(statusFilter !== "all" && { status: statusFilter }),
      })
      
      const [salesData, periodStats] = await Promise.all([
        apiFetch(`/sales/?${params}`),
        apiFetch("/sales/stats/period")
      ])
      
      const salesList = salesData.sales || []
      setSales(salesList)
      setFilteredSales(salesList)
      setTotalPages(Math.ceil((salesData.total || 0) / 50))

      // Mise à jour des statistiques globales
      if (periodStats) {
        setAnalytics({
          totalRevenue: periodStats.total_amount || 0,
          totalSales: periodStats.total_sales || 0,
          averageBasket: periodStats.average_amount || 0,
          processedSales: periodStats.processed_sales || 0,
          pendingSales: periodStats.pending_sales || 0,
          errorSales: periodStats.error_sales || 0,
          by_provider: periodStats.by_provider || {},
          by_payment_method: periodStats.by_payment_method || {}
        })
      }
    } catch (err) {
      setErrorSales("Erreur lors du chargement des données. Veuillez réessayer.")
      console.error("Erreur lors de la récupération des données:", err)
    } finally {
      setLoadingSales(false)
    }
  }

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredSales(sales)
    } else {
      const searchLower = searchTerm.toLowerCase()
      const filtered = sales.filter((sale) => {
        if (sale.order_number?.toLowerCase().includes(searchLower)) return true
        if (sale.customer_name?.toLowerCase().includes(searchLower)) return true
        if (
          sale.items?.some(
            (item) =>
              item.name?.toLowerCase().includes(searchLower) || item.reference?.toLowerCase().includes(searchLower),
          )
        )
          return true
        return false
      })
      setFilteredSales(filtered)
    }
  }, [searchTerm, sales])

  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
    }
  }, [page, statusFilter, isAuthenticated])

  if (authChecking) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-foreground">Vérification de l'authentification...</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Authentification Requise
            </CardTitle>
            <CardDescription>Vous devez être connecté pour accéder au module SALES.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Aucun token d'authentification trouvé dans le localStorage.</AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="token-input">Token d'accès API</Label>
              <Input
                id="token-input"
                type="password"
                placeholder="Entrez votre token d'accès"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const token = e.currentTarget.value
                    if (token) {
                      localStorage.setItem(TOKEN_KEY, token)
                      setIsAuthenticated(true)
                      setErrorSales(null)
                    }
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">Appuyez sur Entrée pour enregistrer le token</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">SALES via Square</h1>
                <p className="text-sm text-muted-foreground">
                  Analyse des données de vente
                </p>
              </div>
            </div>
            <Badge variant="outline" className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Webhook Actif
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {errorSales && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorSales}</AlertDescription>
          </Alert>
        )}

        {loadingSales && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="dashboard">
              <Activity className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="sales">
              <FileText className="w-4 h-4 mr-2" />
              Ventes
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart2 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="processing">
              <Package className="w-4 h-4 mr-2" />
              Traitement
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Chiffre d'affaires"
                value={`${analytics.totalRevenue.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€`}
                icon={DollarSign}
                color="text-green-600"
                bgColor="bg-green-500/10"
                description={`${analytics.totalSales} ventes`}
              />
              <StatCard
                title="Panier moyen"
                value={`${analytics.averageBasket.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€`}
                icon={ShoppingCart}
                color="text-blue-600"
                bgColor="bg-blue-500/10"
                description="Montant moyen"
              />
              <StatCard
                title="Ventes traitées"
                value={analytics.processedSales}
                change={`${analytics.errorSales} erreurs`}
                icon={CheckCircle}
                color="text-purple-600"
                bgColor="bg-purple-500/10"
                description={`${analytics.pendingSales} en attente`}
              />
              <StatCard
                title="Méthodes de paiement"
                value={Object.keys(analytics.by_payment_method).length}
                icon={DollarSign}
                color="text-yellow-600"
                bgColor="bg-yellow-500/10"
                description="Types différents"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Répartition par fournisseur</CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(analytics.by_provider).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(analytics.by_provider).map(([provider, amount]) => (
                        <div key={provider} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize">{provider}</span>
                            <span className="font-medium">{amount}€</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(amount / analytics.totalRevenue) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">Aucune donnée de fournisseur disponible</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Méthodes de paiement</CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(analytics.by_payment_method).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(analytics.by_payment_method).map(([method, count]) => (
                        <div key={method} className="flex items-center justify-between">
                          <span className="capitalize">{method}</span>
                          <span className="font-medium">{count} ventes</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">Aucune donnée de paiement disponible</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Pipeline de Traitement des Données</CardTitle>
                <CardDescription>
                  Transaction Square → Webhook → Mapping → Décrémentation → FIFO → MAJ Inventory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <PipelineStep
                    title="Webhook"
                    status="active"
                    count={dashboardStats.webhooksReceived}
                    icon={Webhook}
                  />
                  <PipelineStep
                    title="Mapping"
                    status="active"
                    count={dashboardStats.mappedRecipes}
                    icon={CheckCircle}
                  />
                  <PipelineStep
                    title="Décrémentation"
                    status="active"
                    count={analytics.ingredientsDecremented}
                    icon={TrendingUp}
                  />
                  <PipelineStep title="FIFO/DLC" status="active" count={dashboardStats.fifoUpdates} icon={Package} />
                  <PipelineStep title="Inventory" status="active" count={dashboardStats.fifoUpdates} icon={Database} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Évolution du CA - Données pour Prédictions</CardTitle>
                <CardDescription>Comparaison CA réel vs prédictions algorithmiques (7 derniers jours)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="day" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" tickFormatter={(value) => `${value}€`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1F2937", color: "#FFFFFF", borderRadius: "8px" }}
                        formatter={(value) => `${value}€`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#4F46E5"
                        strokeWidth={2}
                        name="CA Réel"
                        dot={{ fill: "#4F46E5", r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="predictions"
                        stroke="#10B981"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Prédictions"
                        dot={{ fill: "#10B981", r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Ventes Récentes (Données Collectées)</CardTitle>
                <Button variant="ghost" onClick={() => setActiveTab("sales")}>
                  Voir Tout
                </Button>
              </CardHeader>
              <CardContent>
                <SalesDataTable sales={sales.slice(0, 5)} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <CardTitle>Données de Ventes Collectées</CardTitle>
                      <CardDescription>Transactions Square récupérées via webhook</CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <Input
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-full"
                      />
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filtrer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous</SelectItem>
                          <SelectItem value="processed">Traitées</SelectItem>
                          <SelectItem value="pending">En attente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {searchTerm && (
                    <div className="text-sm text-muted-foreground">
                      {filteredSales.length} résultat{filteredSales.length > 1 ? "s" : ""} pour "{searchTerm}"
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <SalesDataTable sales={filteredSales} />
                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Précédent
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} sur {totalPages}
                  </span>
                  <Button variant="outline" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                    Suivant
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics pour Prédictions Algorithmiques</CardTitle>
                <CardDescription>Données structurées pour les modèles de prédiction</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="CA Total (7j)"
                    value={`${analytics.totalRevenue.toFixed(2)}€`}
                    icon={DollarSign}
                    color="text-green-600"
                    bgColor="bg-green-500/10"
                  />
                  <StatCard
                    title="Ventes Totales"
                    value={analytics.totalSales}
                    icon={ShoppingCart}
                    color="text-blue-600"
                    bgColor="bg-blue-500/10"
                  />
                  <StatCard
                    title="Panier Moyen"
                    value={`${analytics.averageBasket.toFixed(2)}€`}
                    icon={TrendingUp}
                    color="text-yellow-600"
                    bgColor="bg-yellow-500/10"
                  />
                  <StatCard
                    title="Précision Mapping"
                    value={`${analytics.mappingAccuracy}%`}
                    icon={CheckCircle}
                    color="text-purple-600"
                    bgColor="bg-purple-500/10"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chiffre d'Affaires par Jour</CardTitle>
                <CardDescription>Dataset pour algorithmes de prédiction de ventes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="day" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" tickFormatter={(value) => `${value}€`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1F2937", color: "#FFFFFF", borderRadius: "8px" }}
                        formatter={(value) => `${value}€`}
                      />
                      <Legend />
                      <Bar dataKey="revenue" fill="#4F46E5" name="Chiffre d'affaires (€)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Décrémentation Ingrédients (FIFO par DLC)</CardTitle>
                <CardDescription>Suivi de la consommation des ingrédients par lot et DLC</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ingrédient</TableHead>
                      <TableHead>Quantité Utilisée</TableHead>
                      <TableHead>Unité</TableHead>
                      <TableHead>DLC Lot Utilisé</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ingredientUsageData.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{item.ingredient}</TableCell>
                        <TableCell>{item.used}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell className="font-mono text-sm">{item.dlc}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-500/10 text-green-600">
                            FIFO Appliqué
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="processing" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Statut du Traitement des Données</CardTitle>
                    <CardDescription>Monitoring du pipeline de collecte et traitement</CardDescription>
                  </div>
                  <Button onClick={fetchData}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Actualiser
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Webhook className="w-4 h-4" />
                        Webhook Square
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold">
                            {analytics.webhookStatus === "active" ? "Actif" : "Inactif"}
                          </div>
                          <p className="text-xs text-muted-foreground">Réception temps réel</p>
                        </div>
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Mapping Recettes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.mappingAccuracy}%</div>
                      <p className="text-xs text-muted-foreground">Précision Square ID ↔ Recipe</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Rotation FIFO
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.fifoRotation}%</div>
                      <p className="text-xs text-muted-foreground">Optimisation par DLC</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-base">Flux de Traitement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <ProcessingStep
                        number="1"
                        title="Transaction Square → Webhook"
                        description="Réception instantanée des transactions via webhook Square"
                        status="active"
                      />
                      <ProcessingStep
                        number="2"
                        title="Items vendus → Mapping Square ID ↔ Recipe"
                        description="Association des items Square aux recettes internes"
                        status="active"
                      />
                      <ProcessingStep
                        number="3"
                        title="Décrémentation ingrédients"
                        description="Calcul et décompte des quantités d'ingrédients utilisées"
                        status="active"
                      />
                      <ProcessingStep
                        number="4"
                        title="FIFO par DLC → MAJ inventory"
                        description="Mise à jour de l'inventaire selon la méthode FIFO basée sur DLC"
                        status="active"
                      />
                      <ProcessingStep
                        number="5"
                        title="Export données pour prédictions"
                        description="Structuration des données pour les algorithmes de prédiction"
                        status="active"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Alert>
                  <Activity className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Mode Collecte Active:</strong> Les données de ventes sont collectées en temps réel via
                    Square et traitées automatiquement pour alimenter les algorithmes de prédiction (ventes, stocks,
                    prix).
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function StatCard({ title, value, change, icon: Icon, color, bgColor, description }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <p className={`text-sm ${change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>{change}</p>
            )}
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
          <div className={`p-3 rounded-lg ${bgColor}`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PipelineStep({ title, status, count, icon: Icon }) {
  const statusColors = {
    active: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
  }

  return (
    <Card className="relative">
      <CardContent className="p-4">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className={`p-3 rounded-full ${statusColors[status]}/10`}>
            <Icon
              className={`w-5 h-5 text-${status === "active" ? "green" : status === "warning" ? "yellow" : "red"}-600`}
            />
          </div>
          <div className="text-sm font-medium">{title}</div>
          <div className="text-2xl font-bold">{count}</div>
          <div className={`w-2 h-2 rounded-full ${statusColors[status]} animate-pulse`} />
        </div>
      </CardContent>
    </Card>
  )
}

function ProcessingStep({ number, title, description, status }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
          {number}
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold">{title}</h4>
          {status === "active" && <Badge className="bg-green-500">Actif</Badge>}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function SalesDataTable({ sales }) {
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (sale) => {
    if (sale.is_completed) {
      return <Badge className="bg-green-500">Traitée</Badge>
    }
    if (sale.has_errors) {
      return <Badge className="bg-red-500">Erreur</Badge>
    }
    return <Badge className="bg-yellow-500">En cours</Badge>
  }

  const getFirstItemName = (items) => {
    if (!items || !Array.isArray(items) || items.length === 0) return "Aucun"
    return items[0].name || "Sans nom"
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Square ID</TableHead>
          <TableHead>Date/Heure</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Mapping</TableHead>
          <TableHead>FIFO</TableHead>
          <TableHead>Statut</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sales.length > 0 ? (
          sales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell className="font-mono text-sm">{sale.provider_sale_id || sale.id}</TableCell>
              <TableCell className="text-sm">{formatDateTime(sale.sale_date)}</TableCell>
              <TableCell className="max-w-[200px] truncate" title={getFirstItemName(sale.items)}>
                {getFirstItemName(sale.items)}
                {sale.items && sale.items.length > 1 && ` +${sale.items.length - 1}`}
              </TableCell>
              <TableCell className="font-semibold">{Number.parseFloat(sale.total_amount || 0).toFixed(2)}€</TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-green-500/10 text-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  OK
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600">
                  <Package className="w-3 h-3 mr-1" />
                  Appliqué
                </Badge>
              </TableCell>
              <TableCell>{getStatusBadge(sale)}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-muted-foreground">
              Aucune donnée de vente disponible
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
