"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Eye,
  X,
  Camera,
  CheckCircle,
  AlertCircle,
  Package,
  TrendingUp,
  Clock,
  CheckCircle2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const BASE = "http://localhost:8120/api/v1/receptions"


const getToken = () => localStorage.getItem("access_token")

const apiFetch = async (path, options = {}, isFormData = false) => {
  const token = getToken()
  if (!token) throw new Error("No access token found")

  const headers = {
    Authorization: `Bearer ${token}`,
    ...(!isFormData && { "Content-Type": "application/json" }),
    ...options.headers,
  }

  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`${response.statusText}: ${errorText}`)
  }

  return response.status === 204 ? null : response.json()
}

export default function ReceptionsPage() {
  const [receptions, setReceptions] = useState([])
  const [stats, setStats] = useState(null)
  const [page, setPage] = useState(1)
  const [size] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState({ type: null, message: null })
  const [selectedReception, setSelectedReception] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createFormData, setCreateFormData] = useState({
    purchase_id: "",
    delivery_number: "",
    carrier_name: "",
    notes: "",
  })
  const [validateFormData, setValidateFormData] = useState({
    quantity_received: "",
    batch_number: "",
    dlc_date: "",
    dlu_date: "",
    temperature: "",
    quality_check_passed: true,
    rejection_reason: "",
    manual_entry: true,
    item_id: null,
  })
  const [photoFormData, setPhotoFormData] = useState({
    photo_type: "label",
    item_id: "",
    file: null,
  })
  const [batchCheck, setBatchCheck] = useState(null)
  const [filterValidatedOnly, setFilterValidatedOnly] = useState(false)
  const [photoUploading, setPhotoUploading] = useState(false)

  useEffect(() => {
    loadReceptions(page)
    loadStats()
  }, [page])

  const loadReceptions = async (p = 1) => {
    setLoading(true)
    try {
      const data = await apiFetch(`?page=${p}&size=${size}`)
      setReceptions(data.items || [])
      setTotalPages(data.pages || 1)
      setPage(data.page || p)
    } catch (e) {
      setError(`Erreur lors du chargement des réceptions: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await apiFetch("/stats/summary")
      setStats(data || {})
    } catch (e) {
      setError(`Erreur lors du chargement des stats: ${e.message}`)
    }
  }

  const loadReceptionDetails = async (reception) => {
    try {
      const data = await apiFetch(`/${reception.id}`)
      const items = data.items || []
      setSelectedReception({ ...data, items })
      setDetailOpen(true)
    } catch (e) {
      setError(`Erreur lors du chargement des détails: ${e.message}`)
    }
  }

  const checkBatchConsistency = async (receptionId, product_sku) => {
    try {
      const data = await apiFetch(`/${receptionId}/batch-check/${product_sku}`)
      setBatchCheck(data)
    } catch (e) {
      setError(`Erreur lors de la vérification des lots: ${e.message}`)
    }
  }

  const handleCreateReception = async (e) => {
    e.preventDefault()
    try {
      await apiFetch("/create", {
        method: "POST",
        body: JSON.stringify(createFormData),
      })
      setShowCreateForm(false)
      setCreateFormData({
        purchase_id: "",
        delivery_number: "",
        carrier_name: "",
        notes: "",
      })
      loadReceptions(page)
      setError(null)
    } catch (e) {
      setError(`Erreur lors de la création: ${e.message}`)
    }
  }

  const handleValidateItem = async () => {
    try {
      // Vérification des données requises
      if (!selectedReception) {
        throw new Error('Aucune réception sélectionnée');
      }
      
      if (!validateFormData.item_id) {
        throw new Error('Aucun item sélectionné pour la validation');
      }
      
      // Validation des champs obligatoires
      if (!validateFormData.quantity_received) {
        throw new Error('La quantité reçue est obligatoire');
      }
      
      if (isNaN(Number(validateFormData.quantity_received)) || Number(validateFormData.quantity_received) <= 0) {
        throw new Error('La quantité doit être un nombre positif');
      }

      // Préparation des données pour l'API
      const payload = {
        quantity_received: Number(validateFormData.quantity_received),
        batch_number: validateFormData.batch_number || null,
        dlc_date: validateFormData.dlc_date || null,
        dlu_date: validateFormData.dlu_date || null,
        temperature: validateFormData.temperature ? Number(validateFormData.temperature) : null,
        quality_check_passed: Boolean(validateFormData.quality_check_passed),
        rejection_reason: validateFormData.quality_check_passed ? null : (validateFormData.rejection_reason || 'Non spécifié'),
        manual_entry: true,
      };
      
      // Envoi de la requête
      await apiFetch(`/${selectedReception.id}/items/${validateFormData.item_id}/validate`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      
      // Mise à jour de l'interface
      await loadReceptionDetails(selectedReception);
      
      // Réinitialisation du formulaire
      setValidateFormData({
        quantity_received: '',
        batch_number: '',
        dlc_date: '',
        dlu_date: '',
        temperature: '',
        quality_check_passed: true,
        rejection_reason: '',
        manual_entry: true,
        item_id: null,
      });
      
      // Message de succès et rechargement des données
      setError({ type: 'success', message: 'Item validé avec succès' });
      
      // Réinitialisation du formulaire
      setValidateFormData({
        quantity_received: '',
        batch_number: '',
        dlc_date: '',
        dlu_date: '',
        temperature: '',
        quality_check_passed: true,
        rejection_reason: '',
        manual_entry: true,
        item_id: null,
      });
      
      // Rechargement des détails de la réception
      if (selectedReception) {
        await loadReceptionDetails(selectedReception);
      }
    } catch (e) {
      setError(`Erreur lors de la validation: ${e.message}`)
    }
  }

  const handleCompleteReception = async ({ notes = "", force = false } = {}) => {
    if (!selectedReception) {
      setError("Aucune réception sélectionnée")
      return
    }

    try {
      await apiFetch(`/${selectedReception.id}/complete`, {
        method: "POST",
        body: JSON.stringify({
          notes,
          force_validation: force,
          create_purchase_return: false,
        }),
      })
      setDetailOpen(false)
      setSelectedReception(null)
      loadReceptions(page)
      loadStats()
      setError(null)
    } catch (e) {
      setError(`Erreur lors de la complétion: ${e.message}`)
    }
  }

  const handleUploadPhoto = async () => {
    if (!photoFormData.file) {
      setError("Veuillez sélectionner une photo.")
      return
    }
    setPhotoUploading(true)
    try {
      const formData = new FormData()
      formData.append("photo_type", photoFormData.photo_type)
      if (photoFormData.item_id) formData.append("item_id", photoFormData.item_id)
      formData.append("file", photoFormData.file)

      await apiFetch(
        `/${selectedReception.id}/photo`,
        {
          method: "POST",
          body: formData,
        },
        true,
      )
      setPhotoFormData({ photo_type: "label", item_id: "", file: null })
      loadReceptionDetails(selectedReception)
      setError(null)
    } catch (e) {
      setError(`Erreur lors de l'upload de la photo: ${e.message}`)
    } finally {
      setPhotoUploading(false)
    }
  }

  const handleInputChange = (e, setForm) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { variant: "default", className: "bg-green-400 text-white" },
      pending: { variant: "secondary", className: "bg-warning text-warning-foreground" },
      in_progress: { variant: "outline", className: "bg-orange-200 text-orange-50" },
    }
    return statusConfig[status] || { variant: "outline" }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Gestion des Réceptions</h1>
            <p className="text-muted-foreground">Suivi et validation des livraisons entrantes</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => {
                loadReceptions(page)
                loadStats()
              }}
              variant="outline"
              size="default"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
            <Button onClick={() => setShowCreateForm(true)} className="bg-primary">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Réception
            </Button>
          </div>
        </header>

        {/* Error Alert */}
        {error?.message && (
          <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
            error.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-destructive/10 border border-destructive/20'
          }`}>
            {error.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                error.type === 'success' ? 'text-green-800' : 'text-destructive'
              }`}>
                {error.message}
              </p>
            </div>
            <button onClick={() => setError({ type: null, message: null })}>
              <X className={`w-4 h-4 ${error.type === 'success' ? 'text-green-600' : 'text-destructive'}`} />
            </button>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Réceptions</p>
                    <p className="text-3xl font-bold text-foreground">{stats.total_receptions || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-success">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Complétées</p>
                    <p className="text-3xl font-bold text-foreground">{stats.completed || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-accent">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Taux de Qualité</p>
                    <p className="text-3xl font-bold text-foreground">{(stats.quality_pass_rate || 0).toFixed(1)}%</p>
                  </div>
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-warning">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Livraisons à Temps</p>
                    <p className="text-3xl font-bold text-foreground">
                      {(stats.on_time_delivery_rate || 0).toFixed(1)}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-warning" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Pagination */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filterValidatedOnly}
              onChange={(e) => setFilterValidatedOnly(e.target.checked)}
              className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
            />
            <span className="text-sm text-foreground">Afficher uniquement les items validés</span>
          </label>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-foreground px-3">
              Page {page} / {totalPages}
            </span>
            <Button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              variant="outline"
              size="sm"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Receptions Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {receptions.map((reception) => (
              <Card key={reception.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-semibold">
                      {reception.delivery_number || `N° ${reception.id.slice(0, 8)}`}
                    </CardTitle>
                    <Badge {...getStatusBadge(reception.status)}>{reception.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transporteur:</span>
                      <span className="font-medium text-foreground">{reception.carrier_name || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium text-foreground">
                        {new Date(reception.delivery_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Items attendus:</span>
                      <span className="font-medium text-foreground">{reception.total_items_expected || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Items reçus:</span>
                      <span className="font-medium text-foreground">{reception.total_items_received || 0}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => loadReceptionDetails(reception)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Détails
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedReception(reception)
                        handleCompleteReception({ notes: "", force: false })
                      }}
                      variant="default"
                      size="sm"
                      className="flex-1 bg-sky-500"
                      disabled={reception.status === "completed"}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Compléter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-xl font-bold">Nouvelle Réception</CardTitle>
                <Button onClick={() => setShowCreateForm(false)} variant="ghost" size="sm">
                  <X className="w-5 h-5" />
                </Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateReception} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">ID de la commande *</label>
                    <Input
                      name="purchase_id"
                      value={createFormData.purchase_id}
                      onChange={(e) => handleInputChange(e, setCreateFormData)}
                      placeholder="Entrez l'ID de la commande"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Numéro de livraison *</label>
                    <Input
                      name="delivery_number"
                      value={createFormData.delivery_number}
                      onChange={(e) => handleInputChange(e, setCreateFormData)}
                      placeholder="Entrez le numéro de livraison"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Nom du transporteur</label>
                    <Input
                      name="carrier_name"
                      value={createFormData.carrier_name}
                      onChange={(e) => handleInputChange(e, setCreateFormData)}
                      placeholder="Entrez le nom du transporteur"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Notes</label>
                    <Textarea
                      name="notes"
                      value={createFormData.notes}
                      onChange={(e) => handleInputChange(e, setCreateFormData)}
                      placeholder="Ajoutez des notes (optionnel)"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" onClick={() => setShowCreateForm(false)} variant="outline">
                      Annuler
                    </Button>
                    <Button type="submit" className="bg-primary">
                      Créer la Réception
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Detail Modal */}
        {detailOpen && selectedReception && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <Card className="w-full max-w-6xl my-8">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
                <div>
                  <CardTitle className="text-2xl font-bold">
                    Réception: {selectedReception.delivery_number || selectedReception.id}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Détails et validation des items</p>
                </div>
                <Button
                  onClick={() => {
                    setDetailOpen(false)
                    setSelectedReception(null)
                    setBatchCheck(null)
                  }}
                  variant="ghost"
                  size="sm"
                >
                  <X className="w-5 h-5" />
                </Button>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Reception Info */}
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Informations Générales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">ID:</span>
                        <p className="font-medium text-foreground mt-1">{selectedReception.id}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Commande:</span>
                        <p className="font-medium text-foreground mt-1">{selectedReception.purchase_id}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Date:</span>
                        <p className="font-medium text-foreground mt-1">
                          {new Date(selectedReception.delivery_date).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Transporteur:</span>
                        <p className="font-medium text-foreground mt-1">{selectedReception.carrier_name || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Statut:</span>
                        <div className="mt-1">
                          <Badge {...getStatusBadge(selectedReception.status)}>{selectedReception.status}</Badge>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Contrôlé par:</span>
                        <p className="font-medium text-foreground mt-1">{selectedReception.controlled_by || "N/A"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Items Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Items de la Réception</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedReception.items && selectedReception.items.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                                Produit
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                                Qté Attendue
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                                Qté Reçue
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                                Lot
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                                DLC
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                                Temp.
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                                Statut
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {selectedReception.items
                              .filter((item) => !filterValidatedOnly || item.is_validated)
                              .map((item) => (
                                <tr key={item.id} className="hover:bg-muted/50">
                                  <td className="px-4 py-3 text-sm">
                                    <div>
                                      <p className="font-medium text-foreground">{item.product_name || "N/A"}</p>
                                      <p className="text-xs text-muted-foreground">{item.product_sku || "N/A"}</p>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-foreground">{item.quantity_expected || "0"}</td>
                                  <td className="px-4 py-3 text-sm text-foreground">
                                    {item.quantity_received || "N/A"}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-foreground">{item.batch_number || "N/A"}</td>
                                  <td className="px-4 py-3 text-sm text-foreground">{item.dlc_date || "N/A"}</td>
                                  <td className="px-4 py-3 text-sm text-foreground">
                                    {item.temperature ? `${item.temperature}°C` : "N/A"}
                                  </td>
                                  <td className="px-4 py-3">
                                    {item.is_validated ? (
                                      <CheckCircle className="w-5 h-5 text-success" />
                                    ) : (
                                      <AlertCircle className="w-5 h-5 text-warning" />
                                    )}
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={() => {
                                          setValidateFormData({
                                            quantity_received: item.quantity_received || "",
                                            batch_number: item.batch_number || "",
                                            dlc_date: item.dlc_date || "",
                                            dlu_date: item.dlu_date || "",
                                            temperature: item.temperature || "",
                                            quality_check_passed: item.quality_check_passed ?? true,
                                            rejection_reason: item.rejection_reason || "",
                                            manual_entry: true,
                                            item_id: item.id,
                                          })
                                          setPhotoFormData({
                                            ...photoFormData,
                                            item_id: item.id,
                                          })
                                        }}
                                        variant="outline"
                                        size="sm"
                                        disabled={item.is_validated}
                                      >
                                        Valider
                                      </Button>
                                      <Button
                                        onClick={() => checkBatchConsistency(selectedReception.id, item.product_sku)}
                                        variant="outline"
                                        size="sm"
                                      >
                                        Vérifier
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">Aucun item trouvé.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Batch Check Results */}
                {batchCheck && (
                  <Card className="bg-accent/5 border-accent">
                    <CardHeader>
                      <CardTitle className="text-lg">Vérification des Lots ({batchCheck.product_sku})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-muted-foreground">Total items:</span>
                          <p className="font-medium text-foreground mt-1">{batchCheck.total_items}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Items validés:</span>
                          <p className="font-medium text-foreground mt-1">{batchCheck.validated_items}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Lots uniques:</span>
                          <p className="font-medium text-foreground mt-1">{batchCheck.unique_batches}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">DLC uniques:</span>
                          <p className="font-medium text-foreground mt-1">{batchCheck.unique_dlc}</p>
                        </div>
                      </div>
                      {batchCheck.validation_errors.length > 0 && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                          <p className="font-medium text-destructive mb-2">Erreurs de validation:</p>
                          <ul className="list-disc pl-5 space-y-1">
                            {batchCheck.validation_errors.map((err, index) => (
                              <li key={index} className="text-sm text-destructive">
                                {err}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Validation Form */}
                <Card className="bg-primary/5 border-primary">
                  <CardHeader>
                    <CardTitle className="text-lg">Validation Manuelle</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Quantité reçue *</label>
                        <Input
                          name="quantity_received"
                          type="number"
                          step="0.01"
                          value={validateFormData.quantity_received}
                          onChange={(e) => handleInputChange(e, setValidateFormData)}
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Numéro de lot</label>
                        <Input
                          name="batch_number"
                          value={validateFormData.batch_number}
                          onChange={(e) => handleInputChange(e, setValidateFormData)}
                          placeholder="LOT-XXX"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Date DLC</label>
                        <Input
                          name="dlc_date"
                          type="date"
                          value={validateFormData.dlc_date}
                          onChange={(e) => handleInputChange(e, setValidateFormData)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Date DLU</label>
                        <Input
                          name="dlu_date"
                          type="date"
                          value={validateFormData.dlu_date}
                          onChange={(e) => handleInputChange(e, setValidateFormData)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Température (°C)</label>
                        <Input
                          name="temperature"
                          type="number"
                          step="0.1"
                          value={validateFormData.temperature}
                          onChange={(e) => handleInputChange(e, setValidateFormData)}
                          placeholder="0.0"
                        />
                      </div>
                      <div className="flex items-center pt-6">
                        <input
                          type="checkbox"
                          name="quality_check_passed"
                          checked={validateFormData.quality_check_passed}
                          onChange={(e) => handleInputChange(e, setValidateFormData)}
                          className="w-4 h-4 rounded border-input text-primary focus:ring-primary mr-2"
                        />
                        <label className="text-sm font-medium text-foreground">Contrôle qualité réussi</label>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Raison du rejet</label>
                        <Textarea
                          name="rejection_reason"
                          value={validateFormData.rejection_reason}
                          onChange={(e) => handleInputChange(e, setValidateFormData)}
                          placeholder="Indiquez la raison si le contrôle a échoué"
                          disabled={validateFormData.quality_check_passed}
                          rows={2}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Button
                          onClick={(e) => {
                            console.log('Valider button clicked', { 
                              item_id: validateFormData.item_id,
                              formData: validateFormData 
                            });
                            handleValidateItem();
                          }}
                          disabled={!validateFormData.item_id}
                          title={!validateFormData.item_id ? "Sélectionnez d'abord un item à valider" : ""}
                          className="w-full bg-success hover:bg-success/90"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Valider l'Item
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Photo Upload */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Upload Photo HACCP</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Type de photo</label>
                        <Select
                          value={photoFormData.photo_type}
                          onValueChange={(value) => setPhotoFormData({ ...photoFormData, photo_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Type de photo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="label">Étiquette</SelectItem>
                            <SelectItem value="product">Produit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Fichier</label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setPhotoFormData({
                              ...photoFormData,
                              file: e.target.files[0],
                            })
                          }
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          onClick={handleUploadPhoto}
                          disabled={photoUploading || !photoFormData.file}
                          className="w-full bg-accent hover:bg-accent/90"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          {photoUploading ? "Upload..." : "Uploader"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    onClick={() => handleCompleteReception({ notes: "Validation forcée", force: true })}
                    disabled={selectedReception.status === "completed"}
                    variant="outline"
                  >
                    Forcer + Compléter
                  </Button>
                  <Button
                    onClick={() => handleCompleteReception({ notes: "", force: false })}
                    disabled={selectedReception.status === "completed"}
                    className="bg-success hover:bg-success/90"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Compléter la Réception
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
