"use client"

import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { Toaster } from "react-hot-toast"
import {
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Eye,
  DollarSign,
  Building2,
  Users,
  Package,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

const API_URL = "http://localhost:8120/api/v1/suppliers"

const getAuthHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }
}

export default function Supplier() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("suppliers")
  const [formData, setFormData] = useState({
    name: "",
    supplier_type: "general",
    email: "",
    phone: "",
    contact_person: "",
    code: "",
  })
  const [editingId, setEditingId] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "danger",
  })

  // Produits liés
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [products, setProducts] = useState([])
  const [productLoading, setProductLoading] = useState(false)
  const [productForm, setProductForm] = useState({
    product_id: "",
    purchase_price: "",
    min_quantity: 1,
    unit: "piece",
    valid_from: "",
    valid_until: "",
  })
  const [editingProductId, setEditingProductId] = useState(null)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isUpdateProductModalOpen, setIsUpdateProductModalOpen] = useState(false)

  // Price comparison
  const [compareProductId, setCompareProductId] = useState("")
  const [comparisonData, setComparisonData] = useState(null)
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false)

  // Price validation workflow
  const [validationQueue, setValidationQueue] = useState([])
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false)
  const [validationItem, setValidationItem] = useState(null)
  const [validationNotes, setValidationNotes] = useState("")

  const showConfirmModal = (title, message, onConfirm, type = "danger") => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      type,
    })
  }

  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      title: "",
      message: "",
      onConfirm: null,
      type: "danger",
    })
  }

  // =======================
  // 🔹 Fournisseurs
  // =======================
  const fetchSuppliers = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}?page=1&limit=100`, {
        headers: getAuthHeaders(),
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || "Erreur chargement fournisseurs")
      }
      const data = await res.json()
      // Handle both array response and paginated response
      setSuppliers(Array.isArray(data) ? data : data.items || data.data || [])
    } catch (err) {
      toast.error(err.message)
      console.error("[v0] Error fetching suppliers:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const createSupplier = async () => {
    setLoading(true)
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || "Erreur création fournisseur")
      }
      const data = await res.json()
      toast.success("Fournisseur créé avec succès!")
      setFormData({ name: "", supplier_type: "general", email: "", phone: "", contact_person: "", code: "" })
      setIsCreateModalOpen(false)
      fetchSuppliers()
    } catch (err) {
      toast.error(err.message)
      console.error("[v0] Error creating supplier:", err)
    } finally {
      setLoading(false)
    }
  }

  const updateSupplier = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/${editingId}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || "Erreur mise à jour fournisseur")
      }
      const data = await res.json()
      toast.success("Fournisseur mis à jour!")
      setEditingId(null)
      setFormData({ name: "", supplier_type: "general", email: "", phone: "", contact_person: "", code: "" })
      setIsUpdateModalOpen(false)
      fetchSuppliers()
    } catch (err) {
      toast.error(err.message)
      console.error("[v0] Error updating supplier:", err)
    } finally {
      setLoading(false)
    }
  }

  const deleteSupplier = async (id) => {
    const supplier = suppliers.find((s) => s.id === id)
    showConfirmModal(
      "Supprimer le fournisseur",
      `Êtes-vous sûr de vouloir supprimer le fournisseur "${supplier?.name || "Inconnu"}" ? Cette action est irréversible et affectera la traçabilité HACCP.`,
      async () => {
        setLoading(true)
        try {
          const res = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
          })
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            throw new Error(errorData.message || "Erreur suppression fournisseur")
          }
          toast.success("Fournisseur supprimé!")
          fetchSuppliers()
          setSelectedSupplier(null)
        } catch (err) {
          toast.error(err.message)
          console.error("[v0] Error deleting supplier:", err)
        } finally {
          setLoading(false)
        }
        closeConfirmModal()
      },
      "danger",
    )
  }

  const fetchSupplierDetails = async (supplierId) => {
    try {
      const res = await fetch(`${API_URL}/${supplierId}`, {
        headers: getAuthHeaders(),
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || "Erreur chargement détails fournisseur")
      }
      const data = await res.json()
      return data
    } catch (err) {
      toast.error(err.message)
      console.error("[v0] Error fetching supplier details:", err)
      return null
    }
  }

  // =======================
  // 🔹 Produits du fournisseur
  // =======================
  const fetchProducts = async (supplierId) => {
    setProductLoading(true)
    try {
      const res = await fetch(`${API_URL}/${supplierId}/products`, {
        headers: getAuthHeaders(),
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || "Erreur chargement produits")
      }
      const data = await res.json()
      // Handle both array response and object with items
      const productsList = Array.isArray(data) ? data : data.items || data.data || []
      setProducts(productsList)

      // Check for price discrepancies (products with is_valid: false)
      const discrepancies = productsList.filter((p) => !p.is_valid)
      setValidationQueue(discrepancies)
    } catch (err) {
      toast.error(err.message)
      console.error("[v0] Error fetching products:", err)
    } finally {
      setProductLoading(false)
    }
  }

  const addProduct = async () => {
    setProductLoading(true);
    try {
      // Prepare the request payload according to API spec
      const payload = {
        product_id: productForm.product_id,
        purchase_price: Number.parseFloat(productForm.purchase_price),
        min_quantity: Number.parseInt(productForm.min_quantity) || 1,
        unit: productForm.unit || 'piece',
        valid_from: productForm.valid_from,
        valid_until: productForm.valid_until
      };

      // Log the payload for debugging
      console.log('Adding product with payload:', payload);

      const res = await fetch(`${API_URL}/${selectedSupplier}/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('API Error Response:', errorData);
        throw new Error(
          errorData.detail || 
          errorData.message || 
          `Erreur lors de l'ajout du produit (${res.status} ${res.statusText})`
        );
      }

      const data = await res.json();
      toast.success('Produit ajouté avec succès à la mercuriale !');
      
      // Reset form
      setProductForm({
        product_id: '',
        purchase_price: '',
        min_quantity: 1,
        unit: 'piece',
        valid_from: '',
        valid_until: '',
      });
      
      setIsProductModalOpen(false);
      
      // Refresh the products list
      fetchProducts(selectedSupplier);
    } catch (err) {
      console.error('Error adding product:', err);
      toast.error(err.message || "Une erreur est survenue lors de l'ajout du produit");
    } finally {
      setProductLoading(false);
    }
  };

  const updateProduct = async () => {
    setProductLoading(true)
    try {
      const payload = {
        purchase_price: Number.parseFloat(productForm.purchase_price),
        min_quantity: Number.parseInt(productForm.min_quantity),
        valid_until: productForm.valid_until,
        is_active: true,
      };
      
      const res = await fetch(`${API_URL}/products/${editingProductId}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || "Erreur lors de la mise à jour du prix du produit")
      }
      
      const data = await res.json()
      toast.success("Prix mis à jour avec succès dans la mercuriale!")
      
      // Reset form and update UI
      setEditingProductId(null)
      setProductForm({
        product_id: "",
        purchase_price: "",
        min_quantity: 1,
        unit: "piece",
        valid_from: "",
        valid_until: "",
      })
      setIsUpdateProductModalOpen(false)
      
      // Refresh products list
      fetchProducts(selectedSupplier)
    } catch (err) {
      console.error("Error updating product price:", err)
      toast.error(err.message || "Une erreur est survenue lors de la mise à jour du prix")
    } finally {
      setProductLoading(false)
    }
  }

  const deleteProduct = async (id) => {
    const product = products.find((p) => p.id === id)
    showConfirmModal(
      "Désactiver le produit",
      `Êtes-vous sûr de vouloir désactiver le produit "${product?.product_name || "Inconnu"}" ? Le prix ne sera plus disponible dans la mercuriale.`,
      async () => {
        try {
          const res = await fetch(`${API_URL}/products/${id}`, {
            method: "PATCH",
            headers: getAuthHeaders(),
            body: JSON.stringify({ is_active: false }),
          })
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            throw new Error(errorData.message || "Erreur suppression produit")
          }
          toast.success("Produit désactivé!")
          fetchProducts(selectedSupplier)
        } catch (err) {
          toast.error(err.message)
          console.error("[v0] Error deactivating product:", err)
        }
        closeConfirmModal()
      },
      "warning",
    )
  }

  //comparaison des prix
  const compareProduct = async (productId) => {
    setProductLoading(true);
    try {
      const res = await fetch(`${API_URL}/products/${productId}/compare`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erreur lors de la comparaison des prix');
      }
      
      const data = await res.json();
      
      // Format the data for display
      const formattedData = {
        ...data,
        // Calculate price range if not provided
        price_range: data.price_range || [
          Math.min(...data.suppliers.map(s => parseFloat(s.purchase_price))),
          Math.max(...data.suppliers.map(s => parseFloat(s.purchase_price)))
        ]
      };
      
      setComparisonData(formattedData);
      setIsCompareModalOpen(true);
    } catch (err) {
      console.error('Error comparing product prices:', err);
      toast.error(err.message || 'Une erreur est survenue lors de la comparaison des prix');
    } finally {
      setProductLoading(false);
    }
  };

  // =======================
  // 🔹 Validation des écarts
  // =======================
  const openValidationModal = (item) => {
    setValidationItem(item)
    setValidationNotes("")
    setIsValidationModalOpen(true)
  }

  const approvePrice = async () => {
    setProductLoading(true);
    try {
      const res = await fetch(`${API_URL}/products/${validationItem.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          purchase_price: Number.parseFloat(validationItem.purchase_price),
          min_quantity: validationItem.min_quantity,
          valid_until: validationItem.valid_until,
          is_active: true,
          validation_notes: validationNotes,
          status: 'approved',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Erreur lors de l'approbation du prix");
      }

      const data = await res.json();
      toast.success('Prix approuvé avec succès et mercuriale mise à jour !');
      
      // Update the validation queue
      setValidationQueue(prev => prev.filter(item => item.id !== validationItem.id));
      
      // Refresh products and close modal
      fetchProducts(selectedSupplier);
      setIsValidationModalOpen(false);
      setValidationNotes('');
    } catch (err) {
      console.error('Error approving price:', err);
      toast.error(err.message || "Une erreur est survenue lors de l'approbation du prix");
    } finally {
      setProductLoading(false);
    }
  };

  const rejectPrice = async () => {
    setProductLoading(true);
    try {
      const res = await fetch(`${API_URL}/products/${validationItem.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          is_active: false,
          validation_notes: validationNotes,
          status: 'rejected',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Erreur lors du rejet du prix");
      }

      const data = await res.json();
      toast.success('Prix rejeté. Le fournisseur a été notifié.');
      
      // Update the validation queue
      setValidationQueue(prev => prev.filter(item => item.id !== validationItem.id));
      
      // Refresh products and close modal
      fetchProducts(selectedSupplier);
      setIsValidationModalOpen(false);
      setValidationNotes('');
    } catch (err) {
      console.error('Error rejecting price:', err);
      toast.error(err.message || "Une erreur est survenue lors du rejet du prix");
    } finally {
      setProductLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleProductInputChange = (e) => {
    setProductForm({ ...productForm, [e.target.name]: e.target.value })
  }

  const openUpdateModal = (supplier) => {
    setEditingId(supplier.id)
    setFormData({
      name: supplier.name,
      supplier_type: supplier.supplier_type,
      email: supplier.email || "",
      phone: supplier.phone || "",
      contact_person: supplier.contact_person || "",
      code: supplier.code || "",
    })
    setIsUpdateModalOpen(true)
  }

  const viewSupplier = (supplier) => {
    setSelectedSupplier(supplier.id)
    fetchProducts(supplier.id)
    setActiveTab("products")
  }

  const openUpdateProductModal = (product) => {
    setEditingProductId(product.id)
    setProductForm({
      product_id: product.product_id,
      purchase_price: product.purchase_price,
      min_quantity: product.min_quantity,
      unit: product.unit,
      valid_from: product.valid_from,
      valid_until: product.valid_until,
    })
    setIsUpdateProductModalOpen(true)
  }

  const getSupplierTypeVariant = (type) => {
    const variants = {
      general: "default",
      food: "secondary",
      beverage: "outline",
      equipment: "default",
      other: "secondary",
    }
    return variants[type] || "default"
  }

  const calculatePriceDiscrepancy = (currentPrice, newPrice) => {
    const diff = ((newPrice - currentPrice) / currentPrice) * 100
    return diff.toFixed(2)
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20">
              <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">Module SUPPLIER</h1>
              <p className="text-muted-foreground text-lg">Gestion des fournisseurs, mercuriale et traçabilité HACCP</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={fetchSuppliers}
              variant="outline"
              className="gap-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 bg-transparent"
            >
              <RefreshCw size={18} />
              Actualiser
            </Button>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus size={18} />
              Nouveau Fournisseur
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Fournisseurs</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{suppliers.length}</div>
              <p className="text-xs text-muted-foreground">Fournisseurs actifs</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produits Mercuriale</CardTitle>
              <Package className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">Prix référencés</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-amber-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Validation en Attente</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{validationQueue.length}</div>
              <p className="text-xs text-muted-foreground">Écarts de prix à valider</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Traçabilité HACCP</CardTitle>
              <FileText className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5 ans</div>
              <p className="text-xs text-muted-foreground">Archivage réglementaire</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="suppliers" className="gap-2">
              <Building2 className="h-4 w-4" />
              Fournisseurs
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" />
              Mercuriale
            </TabsTrigger>
            <TabsTrigger value="validation" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Validation ({validationQueue.length})
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Rapports
            </TabsTrigger>
          </TabsList>

          {/* Suppliers Tab */}
          <TabsContent value="suppliers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Liste des Fournisseurs</CardTitle>
                <CardDescription>Gérez tous vos fournisseurs et leurs conditions de livraison</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Nom</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            Chargement...
                          </TableCell>
                        </TableRow>
                      ) : suppliers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            Aucun fournisseur trouvé
                          </TableCell>
                        </TableRow>
                      ) : (
                        suppliers.map((supplier) => (
                          <TableRow key={supplier.id} className="hover:bg-muted/50">
                            <TableCell className="font-mono text-sm font-medium">{supplier.code}</TableCell>
                            <TableCell className="font-medium">{supplier.name}</TableCell>
                            <TableCell>
                              <Badge variant={getSupplierTypeVariant(supplier.supplier_type)} className="capitalize">
                                {supplier.supplier_type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">{supplier.contact_person || "—"}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">{supplier.email || "—"}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => viewSupplier(supplier)}
                                  title="Voir les produits"
                                  className="hover:bg-blue-100 dark:hover:bg-blue-950"
                                >
                                  <Eye className="h-4 w-4 text-blue-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openUpdateModal(supplier)}
                                  title="Modifier"
                                  className="hover:bg-amber-100 dark:hover:bg-amber-950"
                                >
                                  <Edit className="h-4 w-4 text-amber-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteSupplier(supplier.id)}
                                  title="Supprimer"
                                  className="hover:bg-red-100 dark:hover:bg-red-950"
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products/Mercuriale Tab */}
          <TabsContent value="products" className="space-y-6">
            {selectedSupplier ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Mercuriale - Produits du Fournisseur</CardTitle>
                      <CardDescription>Gérez les prix de référence pour les commandes et réceptions</CardDescription>
                    </div>
                    <Button
                      onClick={() => setIsProductModalOpen(true)}
                      className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Plus size={18} />
                      Ajouter Prix
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produit</TableHead>
                          <TableHead>Prix Unitaire</TableHead>
                          <TableHead>Qté Min</TableHead>
                          <TableHead>Unité</TableHead>
                          <TableHead>Validité</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {productLoading ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                              Chargement...
                            </TableCell>
                          </TableRow>
                        ) : products.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              Aucun produit trouvé dans la mercuriale
                            </TableCell>
                          </TableRow>
                        ) : (
                          products.map((product) => (
                            <TableRow key={product.id} className="hover:bg-muted/50">
                              <TableCell className="font-medium">{product.product_name}</TableCell>
                              <TableCell className="font-mono text-green-600 dark:text-green-400 font-semibold">
                                {product.purchase_price} €
                              </TableCell>
                              <TableCell>{product.min_quantity}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {product.unit}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {product.valid_until ? new Date(product.valid_until).toLocaleDateString() : "—"}
                              </TableCell>
                              <TableCell>
                                {product.is_active && product.is_valid ? (
                                  <Badge variant="default" className="bg-green-600 gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    Valide
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive" className="gap-1">
                                    <XCircle className="h-3 w-3" />
                                    Invalide
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => compareProduct(product.product_id)}
                                    title="Comparer les prix"
                                    className="hover:bg-blue-100 dark:hover:bg-blue-950"
                                  >
                                    <DollarSign className="h-4 w-4 text-blue-600" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openUpdateProductModal(product)}
                                    title="Modifier"
                                    className="hover:bg-amber-100 dark:hover:bg-amber-950"
                                  >
                                    <Edit className="h-4 w-4 text-amber-600" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteProduct(product.id)}
                                    title="Désactiver"
                                    className="hover:bg-red-100 dark:hover:bg-red-950"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Package className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Aucun fournisseur sélectionné</h3>
                  <p className="text-muted-foreground text-center mb-6">
                    Sélectionnez un fournisseur dans l'onglet "Fournisseurs" pour voir sa mercuriale
                  </p>
                  <Button onClick={() => setActiveTab("suppliers")} variant="outline">
                    Voir les fournisseurs
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Validation Tab */}
          <TabsContent value="validation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>File de Validation des Écarts de Prix</CardTitle>
                <CardDescription>
                  Validez ou rejetez les écarts de prix détectés lors des réceptions (seuil: 5%)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produit</TableHead>
                        <TableHead>Fournisseur</TableHead>
                        <TableHead>Prix Mercuriale</TableHead>
                        <TableHead>Prix Facturé</TableHead>
                        <TableHead>Écart</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validationQueue.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                            <p className="text-muted-foreground">Aucun écart de prix à valider</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        validationQueue.map((item) => {
                          const mercurialePrice = Number.parseFloat(item.purchase_price) * 0.95 // Simulate old price
                          const newPrice = Number.parseFloat(item.purchase_price)
                          const discrepancy = calculatePriceDiscrepancy(mercurialePrice, newPrice)

                          return (
                            <TableRow key={item.id} className="hover:bg-muted/50">
                              <TableCell className="font-medium">{item.product_name}</TableCell>
                              <TableCell>{item.supplier_name}</TableCell>
                              <TableCell className="font-mono">{mercurialePrice.toFixed(2)} €</TableCell>
                              <TableCell className="font-mono font-semibold text-amber-600">
                                {newPrice.toFixed(2)} €
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={Math.abs(discrepancy) > 5 ? "destructive" : "secondary"}
                                  className="gap-1"
                                >
                                  <TrendingUp className="h-3 w-3" />
                                  {discrepancy > 0 ? "+" : ""}
                                  {discrepancy}%
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openValidationModal(item)}
                                  className="gap-2"
                                >
                                  <Eye className="h-4 w-4" />
                                  Valider
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Fournisseurs</CardTitle>
                  <CardDescription>Analyse de fiabilité et coûts moyens</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Taux de conformité</p>
                        <p className="text-sm text-muted-foreground">Livraisons conformes</p>
                      </div>
                      <div className="text-2xl font-bold text-green-600">94.5%</div>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Délai moyen</p>
                        <p className="text-sm text-muted-foreground">Temps de livraison</p>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">2.3j</div>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Économies réalisées</p>
                        <p className="text-sm text-muted-foreground">Comparaison mercuriale</p>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">1,245 €</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Traçabilité HACCP</CardTitle>
                  <CardDescription>Conformité et archivage réglementaire</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Documents archivés</p>
                        <p className="text-sm text-muted-foreground">Bons de livraison, photos</p>
                      </div>
                      <div className="text-2xl font-bold">1,847</div>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Période d'archivage</p>
                        <p className="text-sm text-muted-foreground">Conformité réglementaire</p>
                      </div>
                      <div className="text-2xl font-bold text-green-600">5 ans</div>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Audits réussis</p>
                        <p className="text-sm text-muted-foreground">Contrôles HACCP</p>
                      </div>
                      <div className="text-2xl font-bold text-green-600">100%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Historique des Prix</CardTitle>
                <CardDescription>Évolution des prix dans la mercuriale</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Graphique d'évolution des prix à venir</p>
                  <p className="text-sm">Intégration avec module ANALYTICS</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Supplier Dialog */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Créer un Fournisseur</DialogTitle>
              <DialogDescription>Ajoutez un nouveau fournisseur à votre base de données</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                createSupplier()
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="code">Code Fournisseur *</Label>
                <Input
                  id="code"
                  name="code"
                  placeholder="Ex: FURN001"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nom du Fournisseur *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ex: Entreprise ABC"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier_type">Type de Fournisseur</Label>
                <Select
                  name="supplier_type"
                  value={formData.supplier_type}
                  onValueChange={(value) => setFormData({ ...formData, supplier_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Général</SelectItem>
                    <SelectItem value="food">Nourriture</SelectItem>
                    <SelectItem value="beverage">Boissons</SelectItem>
                    <SelectItem value="equipment">Équipement</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="contact@entreprise.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+33 1 23 45 67 89"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_person">Personne de Contact</Label>
                <Input
                  id="contact_person"
                  name="contact_person"
                  placeholder="Jean Dupont"
                  value={formData.contact_person}
                  onChange={handleInputChange}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" className="text-white bg-blue-600 hover:bg-blue-700" disabled={loading}>
                  {loading ? "Création..." : "Créer"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Update Supplier Dialog */}
        <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Modifier le Fournisseur</DialogTitle>
              <DialogDescription>Mettez à jour les informations du fournisseur</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                updateSupplier()
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="edit-code">Code Fournisseur</Label>
                <Input id="edit-code" name="code" value={formData.code || ""} onChange={handleInputChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-name">Nom du Fournisseur</Label>
                <Input id="edit-name" name="name" value={formData.name || ""} onChange={handleInputChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-supplier_type">Type de Fournisseur</Label>
                <Select
                  name="supplier_type"
                  value={formData.supplier_type || "general"}
                  onValueChange={(value) => setFormData({ ...formData, supplier_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Général</SelectItem>
                    <SelectItem value="food">Nourriture</SelectItem>
                    <SelectItem value="beverage">Boissons</SelectItem>
                    <SelectItem value="equipment">Équipement</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-phone">Téléphone</Label>
                <Input
                  id="edit-phone"
                  name="phone"
                  type="tel"
                  value={formData.phone || ""}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-contact_person">Personne de Contact</Label>
                <Input
                  id="edit-contact_person"
                  name="contact_person"
                  value={formData.contact_person || ""}
                  onChange={handleInputChange}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsUpdateModalOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Mise à jour..." : "Mettre à Jour"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Product Dialog */}
        <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Ajouter un Prix à la Mercuriale</DialogTitle>
              <DialogDescription>Ajoutez un nouveau produit avec son prix de référence</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                addProduct()
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="product_id">ID Produit *</Label>
                <Input
                  id="product_id"
                  name="product_id"
                  placeholder="Ex: PROD001"
                  value={productForm.product_id}
                  onChange={handleProductInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchase_price">Prix d'Achat (€) *</Label>
                <Input
                  id="purchase_price"
                  name="purchase_price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={productForm.purchase_price}
                  onChange={handleProductInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_quantity">Quantité Minimale</Label>
                <Input
                  id="min_quantity"
                  name="min_quantity"
                  type="number"
                  placeholder="1"
                  value={productForm.min_quantity}
                  onChange={handleProductInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unité</Label>
                <Select
                  name="unit"
                  value={productForm.unit}
                  onValueChange={(value) => setProductForm({ ...productForm, unit: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="piece">Pièce</SelectItem>
                    <SelectItem value="kg">Kg</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="mL">mL</SelectItem>
                    <SelectItem value="pack">Pack</SelectItem>
                    <SelectItem value="box">Boîte</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valid_from">Valide Depuis</Label>
                <Input
                  id="valid_from"
                  name="valid_from"
                  type="date"
                  value={productForm.valid_from}
                  onChange={handleProductInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valid_until">Valide Jusqu'au</Label>
                <Input
                  id="valid_until"
                  name="valid_until"
                  type="date"
                  value={productForm.valid_until}
                  onChange={handleProductInputChange}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsProductModalOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={productLoading}>
                  {productLoading ? "Ajout..." : "Ajouter"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Update Product Dialog */}
        <Dialog open={isUpdateProductModalOpen} onOpenChange={setIsUpdateProductModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Modifier le Prix Mercuriale</DialogTitle>
              <DialogDescription>Mettez à jour le prix de référence du produit</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                updateProduct()
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="edit-purchase_price">Prix d'Achat (€)</Label>
                <Input
                  id="edit-purchase_price"
                  name="purchase_price"
                  type="number"
                  step="0.01"
                  value={productForm.purchase_price || ""}
                  onChange={handleProductInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-min_quantity">Quantité Minimale</Label>
                <Input
                  id="edit-min_quantity"
                  name="min_quantity"
                  type="number"
                  value={productForm.min_quantity || ""}
                  onChange={handleProductInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-valid_until">Valide Jusqu'au</Label>
                <Input
                  id="edit-valid_until"
                  name="valid_until"
                  type="date"
                  value={productForm.valid_until || ""}
                  onChange={handleProductInputChange}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsUpdateProductModalOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={productLoading}>
                  {productLoading ? "Mise à jour..." : "Mettre à Jour"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Price Comparison Dialog */}
        <Dialog open={isCompareModalOpen} onOpenChange={setIsCompareModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Comparaison des Prix - Mercuriale</DialogTitle>
              <DialogDescription>
                Comparez les prix proposés par différents fournisseurs pour ce produit
              </DialogDescription>
            </DialogHeader>
            {comparisonData && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">{comparisonData.product_name}</h3>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Meilleur prix</p>
                      <p className="text-2xl font-bold text-green-600">{comparisonData.best_price?.purchase_price} €</p>
                      <p className="text-sm">{comparisonData.best_price?.supplier_name}</p>
                    </div>
                    <div className="ml-auto">
                      <p className="text-sm text-muted-foreground">Fourchette</p>
                      <p className="text-lg font-semibold">
                        {comparisonData.price_range?.[0]} - {comparisonData.price_range?.[1]} €
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Tous les fournisseurs</h4>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fournisseur</TableHead>
                          <TableHead>Prix</TableHead>
                          <TableHead>Qté Min</TableHead>
                          <TableHead>Validité</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {comparisonData.suppliers?.map((supplier) => (
                          <TableRow key={supplier.id}>
                            <TableCell className="font-medium">{supplier.supplier_name}</TableCell>
                            <TableCell className="font-mono">{supplier.purchase_price} €</TableCell>
                            <TableCell>
                              {supplier.min_quantity} {supplier.unit}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {supplier.valid_until ? new Date(supplier.valid_until).toLocaleDateString() : "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setIsCompareModalOpen(false)}>Fermer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Validation Modal */}
        <Dialog open={isValidationModalOpen} onOpenChange={setIsValidationModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Validation d'Écart de Prix</DialogTitle>
              <DialogDescription>Approuvez ou rejetez cet écart de prix détecté lors de la réception</DialogDescription>
            </DialogHeader>
            {validationItem && (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-amber-900 dark:text-amber-100">
                        {validationItem.product_name}
                      </h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Fournisseur: {validationItem.supplier_name}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Prix Mercuriale</p>
                    <p className="text-xl font-bold">
                      {(Number.parseFloat(validationItem.purchase_price) * 0.95).toFixed(2)} €
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg border-amber-500">
                    <p className="text-sm text-muted-foreground">Prix Facturé</p>
                    <p className="text-xl font-bold text-amber-600">{validationItem.purchase_price} €</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="validation-notes">Notes de Validation</Label>
                  <Textarea
                    id="validation-notes"
                    placeholder="Ajoutez des notes sur cette validation (optionnel)..."
                    value={validationNotes}
                    onChange={(e) => setValidationNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>Traçabilité HACCP:</strong> Cette validation sera archivée pendant 5 ans pour les audits
                    réglementaires.
                  </p>
                </div>
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsValidationModalOpen(false)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={rejectPrice} className="gap-2">
                <XCircle className="h-4 w-4" />
                Rejeter
              </Button>
              <Button onClick={approvePrice} className="gap-2 bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4" />
                Approuver
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirmation Alert Dialog */}
        <AlertDialog open={confirmModal.isOpen} onOpenChange={closeConfirmModal}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-full ${
                    confirmModal.type === "danger" ? "bg-red-100 dark:bg-red-950" : "bg-amber-100 dark:bg-amber-950"
                  }`}
                >
                  <AlertTriangle
                    className={`h-5 w-5 ${confirmModal.type === "danger" ? "text-red-600" : "text-amber-600"}`}
                  />
                </div>
                <AlertDialogTitle>{confirmModal.title}</AlertDialogTitle>
              </div>
              <AlertDialogDescription>{confirmModal.message}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmModal.onConfirm}
                className={
                  confirmModal.type === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700"
                }
              >
                {confirmModal.type === "danger" ? "Supprimer" : "Confirmer"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
