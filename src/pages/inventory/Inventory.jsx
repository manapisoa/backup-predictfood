import { useState, useEffect } from "react"
import {
  Plus,
  Search,
  AlertTriangle,
  Package,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  TrendingDown,
  Calendar,
  Eye,
  Activity,
  Upload,
  X,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "react-toastify"

// Hook personnalisé pour le debouncing
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  return debouncedValue
}

const API_HOST = "http://localhost:8120/api/v1"
const TOKEN_KEY = "access_token"

export default function Inventory() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    total_items: 0,
    total_value: 0,
    low_stock_items: 0,
    high_stock_items: 0,
    expired_items: 0,
    active_items: 0,
    health: {
      status: 'good',
      alerts: 0
    }
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [activeTab, setActiveTab] = useState("inventory")
  // État pour le rapport de valorisation
  const [valueReport, setValueReport] = useState(null)
  const [loadingValueReport, setLoadingValueReport] = useState(false)

  // Modals
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false)
  const [isUpdateProductModalOpen, setIsUpdateProductModalOpen] = useState(false)
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false)
  const [isAdjustStockModalOpen, setIsAdjustStockModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isBatchDLCModalOpen, setIsBatchDLCModalOpen] = useState(false)
  const [isFifoDeductModalOpen, setIsFifoDeductModalOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedItemDetails, setSelectedItemDetails] = useState(null)

  const [productToDelete, setProductToDelete] = useState(null)
  const [posting, setPosting] = useState(false)

  // Alerts & Expiring Items
  const [alerts, setAlerts] = useState([])
  const [expiringItems, setExpiringItems] = useState([])
  const [loadingAlerts, setLoadingAlerts] = useState(false)
  const [loadingExpiring, setLoadingExpiring] = useState(false)

  // New Product Form
  const [newProduct, setNewProduct] = useState({
    name: "",
    unit: "",
    location: "",
    sku: "",
    quantity: 0,
    min_stock: 0,
    unit_cost: 0,
    batch_number: "",
    reception_date: "",
    reception_temperature: 0,
    supplier_code: "",
    image_file: null,
  })

  // Update Product Form
  const [selectedProduct, setSelectedProduct] = useState({
    id: "",
    image_file: null,
    quantity: 0,
    unit_cost: 0,
    expiry_date: "",
    location: "",
    min_stock: 0,
    is_active: true,
    batch_number: "",
    reception_date: "",
    reception_temperature: 0,
    supplier_code: "",
  })

  // Stock Adjustment Form
  const [adjustmentForm, setAdjustmentForm] = useState({
    item_id: "",
    new_quantity: 0,
    reason: "",
  })

  // Batch DLC Update Form
  const [batchDLCForm, setBatchDLCForm] = useState([{ sku: "", expiry_date: "" }])

  // FIFO Deduction Form
  const [fifoDeductForm, setFifoDeductForm] = useState({
    sku: "",
    quantity: 1,
  })

  const itemsPerPage = 10
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const getHeaders = () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      window.location.href = '/login';
      return {};
    }
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  // Fetch Items
  const fetchItems = async () => {
    setLoading(true);
    try {
      const headers = getHeaders();
      if (Object.keys(headers).length === 0) return;

      const params = new URLSearchParams({
        skip: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
        ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
      });

      const response = await fetch(`${API_HOST}/inventory/items?${params}`, {
        headers,
      });

      if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erreur lors de la récupération des produits");
      }

      const data = await response.json();
      setItems(Array.isArray(data.items) ? data.items : []);
      setTotalItems(Number(data.total) || 0);
    } catch (err) {
      console.error('Erreur fetchItems:', err);
      toast.error(err.message || 'Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Stats
  const fetchStats = async () => {
    try {
      const headers = getHeaders();
      if (Object.keys(headers).length === 0) return;
      
      const response = await fetch(`${API_HOST}/inventory/stats`, { headers });
      
      if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        window.location.href = '/login';
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erreur lors de la récupération des statistiques");
      }
      
      const data = await response.json();
      setStats({
        total_items: data.total_items || 0,
        total_value: Number(data.total_value || 0),
        low_stock_items: data.low_stock_items || 0,
        high_stock_items: data.high_stock_items || 0,
        expired_items: data.expired_items || 0,
        active_items: data.active_items || 0,
        health: {
          status: data.health?.status || 'good',
          alerts: data.health?.alerts || 0
        }
      });
    } catch (err) {
      console.error('Erreur fetchStats:', err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Alerts
  const fetchAlerts = async () => {
    setLoadingAlerts(true);
    try {
      const headers = getHeaders();
      if (Object.keys(headers).length === 0) return;

      const response = await fetch(`${API_HOST}/inventory/alerts`, { headers });

      if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erreur lors de la récupération des alertes");
      }

      const data = await response.json();
      setAlerts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erreur fetchAlerts:', err);
      toast.error(err.message || 'Erreur lors du chargement des alertes');
    } finally {
      setLoadingAlerts(false);
    }
  };

  // Fetch Expiring Items
  const fetchExpiringItems = async () => {
    setLoadingExpiring(true);
    try {
      const headers = getHeaders();
      if (Object.keys(headers).length === 0) return;

      const response = await fetch(`${API_HOST}/inventory/expiring`, { headers });

      if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erreur lors de la récupération des produits expirants");
      }

      const data = await response.json();
      setExpiringItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erreur fetchExpiringItems:', err);
      toast.error(err.message || 'Erreur lors du chargement des produits expirants');
    } finally {
      setLoadingExpiring(false);
    }
  };

  // Fetch Value Report
  const fetchValueReport = async () => {
    setLoadingValueReport(true);
    try {
      const headers = getHeaders();
      if (Object.keys(headers).length === 0) return;

      const response = await fetch(`${API_HOST}/inventory/value-report`, { headers });

      if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erreur lors de la récupération du rapport de valorisation");
      }

      const data = await response.json();
      setValueReport(data);
    } catch (err) {
      console.error('Erreur fetchValueReport:', err);
      toast.error(err.message || 'Erreur lors du chargement du rapport de valorisation');
    } finally {
      setLoadingValueReport(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchQuery])

  useEffect(() => {
    fetchItems()
    fetchStats()
  }, [currentPage, debouncedSearchQuery])

  useEffect(() => {
    if (activeTab === "alerts") {
      fetchAlerts()
    } else if (activeTab === "expiring") {
      fetchExpiringItems()
    } else if (activeTab === "value-report") {
      fetchValueReport()
    }
  }, [activeTab])

  // Create Product
  const handleCreateProduct = async () => {
    if (!newProduct.name || !newProduct.unit || !newProduct.sku || !newProduct.supplier_code) {
      toast.error("Veuillez remplir tous les champs obligatoires (nom, unité, SKU, code fournisseur)")
      return
    }
    if (newProduct.quantity < 0 || newProduct.min_stock < 0 || newProduct.unit_cost < 0) {
      toast.error("Les quantités et coûts doivent être positifs")
      return
    }
    try {
      setPosting(true)
      
      // Création d'un FormData pour gérer les fichiers
      const formData = new FormData()
      
      // Ajout des champs au FormData
      formData.append('name', newProduct.name)
      formData.append('unit', newProduct.unit)
      formData.append('location', newProduct.location)
      formData.append('sku', newProduct.sku)
      formData.append('quantity', Number(newProduct.quantity))
      formData.append('min_stock', Number(newProduct.min_stock))
      formData.append('unit_cost', Number(newProduct.unit_cost))
      formData.append('expiry_date', newProduct.expiry_date || '')
      formData.append('batch_number', newProduct.batch_number || '')
      formData.append('reception_date', newProduct.reception_date
        ? new Date(newProduct.reception_date).toISOString()
        : new Date().toISOString())
      formData.append('reception_temperature', Number(newProduct.reception_temperature))
      formData.append('supplier_code', newProduct.supplier_code)
      
      // Ajout de l'image si elle existe
      if (newProduct.image_file) {
        formData.append('image', newProduct.image_file)
      }
      
      const headers = getHeaders()
      // Suppression du Content-Type pour laisser le navigateur le définir avec le bon boundary
      delete headers['Content-Type']
      
      // Afficher les données du formulaire pour le débogage
      console.log('Envoi des données du formulaire:')
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value)
      }
      
      console.log('En-têtes de la requête:', headers)
      
      const response = await fetch(`${API_HOST}/inventory/items`, {
        method: "POST",
        headers: headers,
        body: formData,
      })
      
      console.log('Réponse du serveur:', response)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erreur lors de la création du produit")
      }
      const createdProduct = await response.json()
      toast.success("Produit ajouté avec succès ✅")
      setItems((prev) => [...prev, createdProduct])
      setIsNewProductModalOpen(false)
      setNewProduct({
        name: "",
        unit: "",
        location: "",
        sku: "",
        quantity: 0,
        min_stock: 0,
        unit_cost: 0,
        expiry_date: "",
        batch_number: "",
        reception_date: "",
        reception_temperature: 0,
        supplier_code: "",
        image_file: null,
      })
      fetchStats()
    } catch (err) {
      toast.error(`Échec de l'ajout du produit: ${err.message} ❌`)
      console.error(err)
    } finally {
      setPosting(false)
    }
  }

  // Update Product
  const openUpdateModal = (item) => {
    setSelectedProduct({
      id: item.id,
      quantity: item.quantity || 0,
      unit_cost: item.unit_cost || 0,
      expiry_date: item.expiry_date ? new Date(item.expiry_date).toISOString().split("T")[0] : "",
      location: item.location || "",
      min_stock: item.min_stock || 0,
      is_active: item.is_active !== undefined ? item.is_active : true,
      batch_number: item.batch_number || "",
      reception_date: item.reception_date ? new Date(item.reception_date).toISOString().slice(0, 16) : "",
      reception_temperature: item.reception_temperature || 0,
      supplier_code: item.supplier_code || "",
    })
    setIsUpdateProductModalOpen(true)
  }

  const handleUpdateProduct = async () => {
    if (selectedProduct.quantity < 0 || selectedProduct.min_stock < 0 || selectedProduct.unit_cost < 0) {
      toast.error("Les quantités et coûts doivent être positifs")
      return
    }
    try {
      setPosting(true)
      const payload = {
        quantity: Number(selectedProduct.quantity),
        unit_cost: Number(selectedProduct.unit_cost),
        expiry_date: selectedProduct.expiry_date || null,
        location: selectedProduct.location || null,
        min_stock: Number(selectedProduct.min_stock),
        is_active: selectedProduct.is_active,
        batch_number: selectedProduct.batch_number || null,
        reception_date: selectedProduct.reception_date ? new Date(selectedProduct.reception_date).toISOString() : null,
        reception_temperature: Number(selectedProduct.reception_temperature),
        supplier_code: selectedProduct.supplier_code || null,
      }
      const response = await fetch(`${API_HOST}/inventory/items/${selectedProduct.id}`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erreur lors de la mise à jour du produit")
      }
      const updatedProduct = await response.json()
      toast.success("Produit mis à jour avec succès ✅")
      setItems((prev) => prev.map((item) => (item.id === updatedProduct.id ? updatedProduct : item)))
      setIsUpdateProductModalOpen(false)
      setSelectedProduct({
        id: "",
        quantity: 0,
        unit_cost: 0,
        expiry_date: "",
        location: "",
        min_stock: 0,
        is_active: true,
        batch_number: "",
        reception_date: "",
        reception_temperature: 0,
        supplier_code: "",
      })
      fetchStats()
    } catch (err) {
      toast.error(`Échec de la mise à jour: ${err.message} ❌`)
      console.error(err)
    } finally {
      setPosting(false)
    }
  }

  // Delete Product
  const openDeleteConfirmModal = (item) => {
    setProductToDelete(item)
    setIsDeleteConfirmModalOpen(true)
  }

  const handleDeleteProduct = async () => {
    if (!productToDelete) return
    try {
      setPosting(true)
      const response = await fetch(`${API_HOST}/inventory/items/${productToDelete.id}`, {
        method: "DELETE",
        headers: getHeaders(),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erreur lors de la suppression du produit")
      }
      toast.success("Produit supprimé avec succès ✅")
      setItems((prev) => prev.filter((item) => item.id !== productToDelete.id))
      setTotalItems((prev) => prev - 1)
      setIsDeleteConfirmModalOpen(false)
      setProductToDelete(null)
      fetchStats()
    } catch (err) {
      toast.error(`Échec de la suppression: ${err.message} ❌`)
      console.error(err)
    } finally {
      setPosting(false)
    }
  }

  // Adjust Stock
  const openAdjustStockModal = (item) => {
    setAdjustmentForm({
      item_id: item.id,
      new_quantity: item.quantity || 0,
      reason: "",
    })
    setIsAdjustStockModalOpen(true)
  }

  const handleAdjustStock = async () => {
    if (!adjustmentForm.reason.trim()) {
      toast.error("Veuillez fournir une raison pour l'ajustement")
      return
    }
    if (adjustmentForm.new_quantity < 0) {
      toast.error("La nouvelle quantité doit être positive")
      return
    }
    try {
      setPosting(true)
      const response = await fetch(`${API_HOST}/inventory/adjust`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(adjustmentForm),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erreur lors de l'ajustement du stock")
      }
      toast.success("Stock ajusté avec succès ✅")
      setIsAdjustStockModalOpen(false)
      setAdjustmentForm({ item_id: "", new_quantity: 0, reason: "" })
      fetchItems()
      fetchStats()
    } catch (err) {
      toast.error(`Échec de l'ajustement: ${err.message} ❌`)
      console.error(err)
    } finally {
      setPosting(false)
    }
  }

  // Batch Update DLC
  const handleBatchDLCUpdate = async () => {
    const validEntries = batchDLCForm.filter((entry) => entry.sku && entry.expiry_date)
    if (validEntries.length === 0) {
      toast.error("Veuillez remplir au moins une entrée valide (SKU + DLC)")
      return
    }
    try {
      setPosting(true)
      const response = await fetch(`${API_HOST}/inventory/batch-update-dlc`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(validEntries),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erreur lors de la mise à jour des DLC")
      }
      toast.success(`${validEntries.length} DLC mises à jour avec succès ✅`)
      setIsBatchDLCModalOpen(false)
      setBatchDLCForm([{ sku: "", expiry_date: "" }])
      fetchItems()
      fetchExpiringItems()
    } catch (err) {
      toast.error(`Échec de la mise à jour: ${err.message} ❌`)
      console.error(err)
    } finally {
      setPosting(false)
    }
  }

  // FIFO Deduction
  const handleFifoDeduct = async () => {
    if (!fifoDeductForm.sku || fifoDeductForm.quantity <= 0) {
      toast.error("Veuillez fournir un SKU valide et une quantité positive")
      return
    }
    try {
      setPosting(true)
      const response = await fetch(`${API_HOST}/inventory/deduct-fifo`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(fifoDeductForm),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erreur lors de la décrémentation FIFO")
      }
      const result = await response.json()
      toast.success(
        `Décrémentation FIFO réussie: ${result.deducted_quantity || fifoDeductForm.quantity} ${result.unit || "unités"} ✅`,
      )
      setIsFifoDeductModalOpen(false)
      setFifoDeductForm({ sku: "", quantity: 1 })
      fetchItems()
      fetchStats()
    } catch (err) {
      toast.error(`Échec de la décrémentation: ${err.message} ❌`)
      console.error(err)
    } finally {
      setPosting(false)
    }
  }

  const addBatchDLCEntry = () => {
    setBatchDLCForm([...batchDLCForm, { sku: "", expiry_date: "" }])
  }

  const removeBatchDLCEntry = (index) => {
    setBatchDLCForm(batchDLCForm.filter((_, i) => i !== index))
  }

  const updateBatchDLCEntry = (index, field, value) => {
    const updated = [...batchDLCForm]
    updated[index][field] = value
    setBatchDLCForm(updated)
  }

  // Open Item Details Dialog
  const openItemDetails = (item) => {
    setSelectedItemDetails(item)
    setIsDetailsDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-center animate-in slide-in-from-top duration-500">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">INVENTAIRE</h1>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsBatchDLCModalOpen(true)}
            variant="outline"
            className="shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Calendar className="h-5 w-5 mr-2" /> Batch DLC
          </Button>
          <Button
            onClick={() => setIsFifoDeductModalOpen(true)}
            variant="outline"
            className="shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <TrendingDown className="h-5 w-5 mr-2" /> FIFO Deduct
          </Button>
          <Button
            onClick={() => setIsNewProductModalOpen(true)}
            className="bg-sky-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Plus className="h-5 w-5 mr-2" /> Nouveau lot
          </Button>
        </div>
      </header>

      {/* Statistics Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-blue-100 dark:bg-blue-700 rounded-xl">
                <Package className="h-6 w-6 text-primary dark:text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">
                {stats.total_items}
              </CardTitle>
            </div>
            <CardDescription className="text-base font-medium">
              Lots en stock
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-green-100 dark:bg-green-600 rounded-xl">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-100" />
              </div>
              <CardTitle className="text-xl font-bold">
                {stats.total_value.toFixed(2)}€
              </CardTitle>
            </div>
            <CardDescription className="text-base font-medium">
              Valeur totale (PMP)
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-amber-100 dark:bg-amber-600 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-100" />
              </div>
              <CardTitle className="text-3xl font-bold">
                {stats.low_stock_items}
              </CardTitle>
            </div>
            <CardDescription className="text-base font-medium">
              Alertes stock bas
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-purple-100 dark:bg-purple-600 rounded-xl">
                <Package className="h-6 w-6 text-purple-600 dark:text-purple-100" />
              </div>
              <CardTitle className="text-3xl font-bold">
                {stats.high_stock_items}
              </CardTitle>
            </div>
            <CardDescription className="text-base font-medium">
              Stock haut
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-red-100 dark:bg-red-600 rounded-xl">
                <Clock className="h-6 w-6 text-red-600 dark:text-red-100" />
              </div>
              <CardTitle className="text-3xl font-bold">
                {stats.expired_items}
              </CardTitle>
            </div>
            <CardDescription className="text-base font-medium">
              Produits expirés/proches DLC
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-600 rounded-xl">
                <Activity className="h-6 w-6 text-emerald-600 dark:text-emerald-100" />
              </div>
              <div className="text-right">
                <CardTitle className="text-3xl font-bold">
                  {stats.active_items}
                </CardTitle>
                <Badge
                  variant={
                    stats.health?.status === "good" ? "default" : "destructive"
                  }
                  className="text-xs mt-1 text-white"
                >
                  {stats.health?.status === "good" ? "Sain" : "Attention"}
                </Badge>
              </div>
            </div>
            <CardDescription className="text-base font-medium">
              Produits actifs
            </CardDescription>
          </CardHeader>
        </Card>
      </div> */}

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" /> Inventaire
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Alertes
          </TabsTrigger>
          <TabsTrigger value="expiring" className="flex items-center gap-2">
            <Clock className="h-4 w-4" /> DLC Proches
          </TabsTrigger>
          <TabsTrigger value="value-report" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" /> Rapport de Valorisation
          </TabsTrigger>
        </TabsList>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          <Card className="shadow-md transition-all duration-300">
            <CardHeader className="">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 shadow-sm focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  />
                </div>
                <div className="flex gap-2 space-x-2 text-sm">
                <p>Low <span className="text-red-500 font-bold text-xs">°</span></p>
                <p>Expired <span className="text-orange-500 font-bold text-xs">°</span></p>
                <p>High <span className="text-green-500 font-bold text-xs">°</span></p>
               
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground font-medium">
                      Chargement...
                    </p>
                  </div>
                </div>
              ) : items.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <p className="text-muted-foreground font-medium">
                    {debouncedSearchQuery
                      ? "Aucun produit trouvé pour cette recherche"
                      : "Aucun lot dans l'inventaire"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto p-2 grid lg:grid-cols-2 gap-4 ">
                  {items.map((item, index) => (
                    // btn pour voir le details
                    <Card
                      key={index}
                      onClick={() => openItemDetails(item)}
                      className="transition-all duration-200 hover:scale-102 dark:hover:bg-slate-700 hover:bg-slate-200 cursor-pointer"
                    >
                      <div className="flex items-center justify-between p-4">
                        {/* Left Section: Icon + Info */}
                        <img
                          src="/image/burgeur.png"
                          alt=""
                          className="h-10 w-10"
                        />
                        <div className="flex items-center gap-4 flex-1">
                          {/* Icon */}
                          <div className="text-5xl">{item.emoji}</div>

                          {/* Info */}
                          <div className="flex flex-col">
                            <div className="text-lg flex gap-2 font-semibold ">
                              <p> {item.name}</p>
                              {item.is_low ? (
                                <div className="text-red-500">°</div>
                              ) : item.is_expired ? (
                                <div className="text-orange-500">°</div>
                              ) : (
                                <div className="text-green-500">°</div>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-zinc-400">
                              <span>{item.quantity} Kg</span>
                              <span>Coût unitaire {item.unit_cost} $</span>
                            </div>
                          </div>
                        </div>

                        {/* Right Section: Buttons */}
                      
                        
                        {/* <div className="flex items-center gap-3">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => openAdjustStockModal(item)}
                            className="hover:text-blue-500 transition-all duration-200 hover:scale-110"
                            title="Ajuster le stock">
                          
                          <Eye className="h-4 w-4" />
                          
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => openAdjustStockModal(item)}
                            className="hover:text-blue-500 transition-all duration-200 hover:scale-110"
                            title="Ajuster le stock"
                          >
                            <Activity className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => openUpdateModal(item)}
                            className="hover:text-sky-500 transition-all duration-200 hover:scale-110"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => openDeleteConfirmModal(item)}
                            className="hover:bg-red-50 border-red-300 text-red-300 hover:border-red-500 hover:text-red-600 transition-all duration-200 hover:scale-110"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div> */}



                      </div>
                    </Card>
                  ))}

                  {/* <Table>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow
                          key={item.id}
                          className="hover:bg-blue-50/30 transition-colors duration-200 animate-in fade-in slide-in-from-bottom"
                          style={{
                            animationDelay: `${index * 50}ms`,
                            animationDuration: "300ms",
                          }}
                        >
                          <TableCell className="font-mono text-sm">
                            {item.sku}
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.name}
                          </TableCell>
                          <TableCell className="text-sm">
                            {item.batch_number || "-"}
                          </TableCell>
                          <TableCell>
                            {item.quantity} {item.unit}
                          </TableCell>
                          <TableCell className="text-sm">
                            {item.expiry_date
                              ? new Date(item.expiry_date).toLocaleDateString(
                                  "fr-FR"
                                )
                              : "-"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {Number(item.unit_cost || 0).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {item.supplier_code || "-"}
                          </TableCell>
                          <TableCell>
                            {item.is_low ? (
                              <Badge
                                variant="destructive"
                                className="shadow-sm"
                              >
                                Stock bas
                              </Badge>
                            ) : item.is_expired ? (
                              <Badge
                                variant="destructive"
                                className="shadow-sm"
                              >
                                Expiré
                              </Badge>
                            ) : (
                              <Badge className="bg-green-500 hover:bg-green-600 text-white shadow-sm">
                                En stock
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex gap-2 justify-center">
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => openAdjustStockModal(item)}
                                className="hover:text-blue-500 transition-all duration-200 hover:scale-110"
                                title="Ajuster le stock"
                              >
                                <Activity className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => openUpdateModal(item)}
                                className="hover:text-sky-500 transition-all duration-200 hover:scale-110"
                                title="Modifier"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => openDeleteConfirmModal(item)}
                                className="hover:bg-red-50 border-red-300 text-red-300 hover:border-red-500 hover:text-red-600 transition-all duration-200 hover:scale-110"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table> */}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="shadow-md hover:shadow-lg transition-all duration-300"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Précédent
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-medium">
                Page{" "}
                <span className="font-bold text-foreground">{currentPage}</span>{" "}
                sur{" "}
                <span className="font-bold text-foreground">
                  {Math.ceil(totalItems / itemsPerPage)}
                </span>
              </span>
            </div>
            <Button
              variant="outline"
              disabled={items.length < itemsPerPage}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="shadow-md hover:shadow-lg transition-all duration-300"
            >
              Suivant <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <Card className="shadow-md">
            <CardHeader className="border-b">
              <CardTitle className="text-2xl flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
                Alertes Stock Bas
              </CardTitle>
              <CardDescription>
                Produits ayant atteint ou dépassé le seuil minimum de stock
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loadingAlerts ? (
                <div className="flex items-center justify-center py-16">
                  <div className="h-12 w-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : alerts.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <p className="text-muted-foreground font-medium">
                    Aucune alerte de stock bas
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto p-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SKU</TableHead>
                        <TableHead>Produit</TableHead>
                        <TableHead>Lot</TableHead>
                        <TableHead>Quantité actuelle</TableHead>
                        <TableHead>Stock minimum</TableHead>
                        <TableHead>Emplacement</TableHead>
                        <TableHead>Fournisseur</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alerts.map((alert) => (
                        <TableRow
                          key={alert.item_id}
                          className="hover:bg-amber-50/30"
                        >
                          <TableCell className="font-mono text-sm">
                            {alert.sku}
                          </TableCell>
                          <TableCell className="font-medium">
                            {alert.name}
                          </TableCell>
                          <TableCell className="text-sm">
                            {alert.batch_number || "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive">
                              {alert.current_quantity} {alert.unit}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {alert.min_stock} {alert.unit}
                          </TableCell>
                          <TableCell className="text-sm">
                            {alert.location || "-"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {alert.supplier_code || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expiring Items Tab */}
        <TabsContent value="expiring" className="space-y-6">
          <Card className="shadow-md">
            <CardHeader className="border-b">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Clock className="h-6 w-6 text-red-600" />
                Produits Proches de la DLC
              </CardTitle>
              <CardDescription>
                Lots approchant de leur date limite de consommation (FEFO
                prioritaire)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loadingExpiring ? (
                <div className="flex items-center justify-center py-16">
                  <div className="h-12 w-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : expiringItems.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <p className="text-muted-foreground font-medium">
                    Aucun produit proche de la DLC
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto p-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SKU</TableHead>
                        <TableHead>Produit</TableHead>
                        <TableHead>Lot</TableHead>
                        <TableHead>DLC</TableHead>
                        <TableHead>Jours restants</TableHead>
                        <TableHead>Quantité</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Valeur perte</TableHead>
                        <TableHead>Fournisseur</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expiringItems.map((item) => (
                        <TableRow
                          key={item.id}
                          className={`hover:bg-red-50/30 ${
                            item.days_left <= 0 ? "bg-background" : ""
                          }`}
                        >
                          <TableCell className="font-mono text-sm">
                            {item.sku}
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.name}
                          </TableCell>
                          <TableCell className="text-sm">
                            {item.batch_number || "-"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {item.expiry_date
                              ? new Date(item.expiry_date).toLocaleDateString(
                                  "fr-FR"
                                )
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                item.days_left <= 0
                                  ? "destructive"
                                  : item.days_left <= 3
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {item.days_left} jours
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {item.quantity} {item.unit}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                item.status === "expired"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {item.status || "À surveiller"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm font-medium text-red-600">
                            {item.waste_value
                              ? `${Number.parseFloat(item.waste_value).toFixed(
                                  2
                                )}€`
                              : "-"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {item.supplier_code || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Value Report Tab */}
        <TabsContent value="value-report" className="space-y-6">
          <Card className="shadow-md">
            <CardHeader className="border-b">
              <CardTitle className="text-2xl flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-green-600" />
                Rapport de Valorisation
              </CardTitle>
              <CardDescription>
                Vue d'ensemble de la valeur du stock par catégorie
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loadingValueReport ? (
                <div className="flex items-center justify-center py-16">
                  <div className="h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : !valueReport ? (
                <div className="flex items-center justify-center py-16">
                  <p className="text-muted-foreground font-medium">
                    Aucun rapport disponible
                  </p>
                </div>
              ) : (
                <div className="space-y-6 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Résumé Général
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>
                          <strong>Total des lots :</strong>{" "}
                          {valueReport.total_items}
                        </p>
                        <p>
                          <strong>Valeur totale :</strong>{" "}
                          {valueReport.total_value.toFixed(2)}€
                        </p>
                        <p>
                          <strong>Alertes stock bas :</strong>{" "}
                          {valueReport.low_stock_items}
                        </p>
                        <p>
                          <strong>Généré le :</strong>{" "}
                          {new Date(
                            valueReport.generated_at
                          ).toLocaleDateString("fr-FR")}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Catégorie</TableHead>
                          <TableHead>Nombre de lots</TableHead>
                          <TableHead>Valeur (€)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(valueReport.categories).map(
                          ([category, data]) => (
                            <TableRow
                              key={category}
                              className="hover:bg-green-50/30"
                            >
                              <TableCell className="font-medium">
                                {category}
                              </TableCell>
                              <TableCell>{data.count}</TableCell>
                              <TableCell>{data.value.toFixed(2)}€</TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal: New Product */}
      <Dialog
        open={isNewProductModalOpen}
        onOpenChange={setIsNewProductModalOpen}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un Nouveau Lot</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Nom du produit *</Label>
              <Input
                placeholder="Ex: Tomates cerises"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Unité *</Label>
                <Input
                  placeholder="kg, pièce, L"
                  value={newProduct.unit}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, unit: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>SKU *</Label>
                <Input
                  placeholder="TOM001-20241125"
                  value={newProduct.sku}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, sku: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Quantité</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newProduct.quantity}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, quantity: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Coût unitaire (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newProduct.unit_cost}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, unit_cost: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>DLC</Label>
                <Input
                  type="date"
                  value={newProduct.expiry_date}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      expiry_date: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Numéro de lot</Label>
                <Input
                  placeholder="LOT-2024-001"
                  value={newProduct.batch_number}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      batch_number: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Stock minimum</Label>
                <Input
                  type="number"
                  min="0"
                  value={newProduct.min_stock}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, min_stock: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Emplacement</Label>
                <Input
                  placeholder="Entrepôt A"
                  value={newProduct.location}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, location: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Température (°C)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={newProduct.reception_temperature}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      reception_temperature: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Code fournisseur *</Label>
                <Input
                  placeholder="FOURNISSEUR-001"
                  value={newProduct.supplier_code}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      supplier_code: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            
            {/* Champ d'upload d'image */}
            <div className="space-y-2">
              <Label>Image du produit</Label>
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    {newProduct.image_file ? (
                      <>
                        <img 
                          src={URL.createObjectURL(newProduct.image_file)} 
                          alt="Aperçu" 
                          className="w-full h-full object-cover rounded-md"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-md transition-all duration-200 flex items-center justify-center">
                          <Upload className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center p-2">
                        <Upload className="w-6 h-6 text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500 text-center">Ajouter une image</span>
                      </div>
                    )}
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setNewProduct({
                            ...newProduct,
                            image_file: e.target.files[0]
                          })
                        }
                      }}
                    />
                  </label>
                  {newProduct.image_file && (
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        setNewProduct({
                          ...newProduct,
                          image_file: null
                        })
                        // Réinitialiser la valeur du champ de fichier
                        const fileInput = e.target.closest('label').querySelector('input[type="file"]')
                        if (fileInput) fileInput.value = ''
                      }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {newProduct.image_file ? (
                    <p>Image sélectionnée : <span className="font-medium">{newProduct.image_file.name}</span></p>
                  ) : (
                    <p>Format : JPG, PNG, WEBP<br />Max : 5MB</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setIsNewProductModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateProduct}
              className="bg-sky-500 text-white"
              disabled={posting}
            >
              {posting ? "Ajout..." : "Ajouter le produit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Update Product */}
      <Dialog
        open={isUpdateProductModalOpen}
        onOpenChange={setIsUpdateProductModalOpen}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Mettre à jour le Lot</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Quantité</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={selectedProduct.quantity}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      quantity: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Coût unitaire (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={selectedProduct.unit_cost}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      unit_cost: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>DLC</Label>
                <Input
                  type="date"
                  value={selectedProduct.expiry_date}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      expiry_date: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Numéro de lot</Label>
                <Input
                  value={selectedProduct.batch_number}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      batch_number: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Stock minimum</Label>
                <Input
                  type="number"
                  min="0"
                  value={selectedProduct.min_stock}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      min_stock: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Emplacement</Label>
                <Input
                  value={selectedProduct.location}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      location: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date de réception</Label>
                <Input
                  type="datetime-local"
                  value={selectedProduct.reception_date}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      reception_date: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Température (°C)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={selectedProduct.reception_temperature}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      reception_temperature: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div>
              <Label>Code fournisseur</Label>
              <Input
                value={selectedProduct.supplier_code}
                onChange={(e) =>
                  setSelectedProduct({
                    ...selectedProduct,
                    supplier_code: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={selectedProduct.is_active}
                onCheckedChange={(checked) =>
                  setSelectedProduct({ ...selectedProduct, is_active: checked })
                }
              />
              <label htmlFor="is_active" className="text-sm font-medium">
                Lot actif
              </label>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setIsUpdateProductModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleUpdateProduct}
              className="bg-sky-500 text-white"
              disabled={posting}
            >
              {posting ? "Mise à jour..." : "Mettre à jour"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Delete Confirmation */}
      <Dialog
        open={isDeleteConfirmModalOpen}
        onOpenChange={setIsDeleteConfirmModalOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-muted-foreground">
              Êtes-vous sûr de vouloir supprimer le lot{" "}
              <span className="font-semibold text-foreground">
                {productToDelete?.name} (SKU: {productToDelete?.sku})
              </span>
              ? Cette action est irréversible et affectera la traçabilité HACCP.
            </p>
          </div>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteConfirmModalOpen(false);
                setProductToDelete(null);
              }}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProduct}
              disabled={posting}
            >
              {posting ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
            

      {/* Détails de l'article */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Détails de l'article</DialogTitle>
          </DialogHeader>
          {selectedItemDetails && (
            <div className="grid gap-4 py-4">
              <div className="flex flex-col justify-center items-center gap-4">
               <img src="/image/burgeur.png" alt={selectedItemDetails.name} className="border-2 p-2 border-gray-200 h-32 w-32 bg-transparent rounded-full" />
                <div>
                  <h3 className="text-xl font-semibold">{selectedItemDetails.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedItemDetails.quantity} {selectedItemDetails.unit}
                    {selectedItemDetails.quantity > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Référence</h4>
                  <p>{selectedItemDetails.sku || 'Non spécifié'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Coût unitaire</h4>
                  <p>{selectedItemDetails.unit_cost ? `${selectedItemDetails.unit_cost} €` : 'Non spécifié'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">N° de lot</h4>
                  <p>{selectedItemDetails.batch_number || 'Non spécifié'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Date de péremption</h4>
                  <p>{selectedItemDetails.expiry_date ? new Date(selectedItemDetails.expiry_date).toLocaleDateString() : 'Non spécifiée'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Emplacement</h4>
                  <p>{selectedItemDetails.location || 'Non spécifié'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Stock minimum</h4>
                  <p>{selectedItemDetails.min_stock || '0'}</p>
                </div>
                {selectedItemDetails.reception_date && (
                  <div className="col-span-2">
                    <h4 className="font-medium text-sm text-muted-foreground">Date de réception</h4>
                    <p>{new Date(selectedItemDetails.reception_date).toLocaleString()}</p>
                  </div>
                )}
                {selectedItemDetails.supplier_code && (
                  <div className="col-span-2">
                    <h4 className="font-medium text-sm text-muted-foreground">Code fournisseur</h4>
                    <p>{selectedItemDetails.supplier_code}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>Fermer</Button>
            <Button 
              className="bg-sky-500 text-white"
              onClick={() => {
              setIsDetailsDialogOpen(false);
              openAdjustStockModal(selectedItemDetails);
            }}>
              Modifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>          

      {/* Modal: Adjust Stock */}
      <Dialog
        open={isAdjustStockModalOpen}
        onOpenChange={setIsAdjustStockModalOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajuster le Stock</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Nouvelle quantité</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={adjustmentForm.new_quantity}
                onChange={(e) =>
                  setAdjustmentForm({
                    ...adjustmentForm,
                    new_quantity: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>Raison de l'ajustement *</Label>
              <Textarea
                placeholder="Ex: Perte, casse, erreur de comptage, retour fournisseur..."
                value={adjustmentForm.reason}
                onChange={(e) =>
                  setAdjustmentForm({
                    ...adjustmentForm,
                    reason: e.target.value,
                  })
                }
                rows={3}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Cet ajustement sera enregistré dans l'historique de traçabilité
              HACCP.
            </p>
          </div>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setIsAdjustStockModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleAdjustStock}
              className="bg-blue-500 text-white"
              disabled={posting}
            >
              {posting ? "Ajustement..." : "Ajuster"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Batch DLC Update */}
      <Dialog open={isBatchDLCModalOpen} onOpenChange={setIsBatchDLCModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Mise à jour en lot des DLC</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {batchDLCForm.map((entry, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label>SKU</Label>
                  <Input
                    placeholder="TOM001"
                    value={entry.sku}
                    onChange={(e) =>
                      updateBatchDLCEntry(index, "sku", e.target.value)
                    }
                  />
                </div>
                <div className="flex-1">
                  <Label>Nouvelle DLC</Label>
                  <Input
                    type="date"
                    value={entry.expiry_date}
                    onChange={(e) =>
                      updateBatchDLCEntry(index, "expiry_date", e.target.value)
                    }
                  />
                </div>
                {batchDLCForm.length > 1 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeBatchDLCEntry(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="outline"
              onClick={addBatchDLCEntry}
              className="w-full bg-transparent"
            >
              <Plus className="h-4 w-4 mr-2" /> Ajouter une entrée
            </Button>
          </div>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setIsBatchDLCModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleBatchDLCUpdate}
              className="bg-sky-500 text-white"
              disabled={posting}
            >
              {posting ? "Mise à jour..." : "Mettre à jour les DLC"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: FIFO Deduction */}
      <Dialog
        open={isFifoDeductModalOpen}
        onOpenChange={setIsFifoDeductModalOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Décrémentation FIFO</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>SKU du produit</Label>
              <Input
                placeholder="TOM001"
                value={fifoDeductForm.sku}
                onChange={(e) =>
                  setFifoDeductForm({ ...fifoDeductForm, sku: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Quantité à déduire</Label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={fifoDeductForm.quantity}
                onChange={(e) =>
                  setFifoDeductForm({
                    ...fifoDeductForm,
                    quantity: e.target.value,
                  })
                }
              />
            </div>
            <p className="text-sm text-muted-foreground">
              La décrémentation utilisera automatiquement les lots les plus
              anciens (FIFO) ou les plus proches de la DLC (FEFO).
            </p>
          </div>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setIsFifoDeductModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleFifoDeduct}
              className="bg-green-600 text-white"
              disabled={posting}
            >
              {posting ? "Décrémentation..." : "Décrémenter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}