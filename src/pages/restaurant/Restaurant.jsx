"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Settings,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  XCircle,
  BarChart,
  Search,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  CircleX,
} from "lucide-react"
import { toast } from "react-toastify"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

const API_HOST =  "http://localhost:8120/api/v1"
const TOKEN_KEY = "access_token"

const getAuthHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const Tooltip = ({ children, text }) => {
  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-200 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
        {text}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
      </div>
    </div>
  )
}

const Restaurant = () => {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState("create")
  const [formData, setFormData] = useState({})
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [size] = useState(20)

  useEffect(() => {
    setPage(1)
  }, [searchQuery, statusFilter])

  const fetchRestaurants = async (skip = 0, limit = size, status = null, search = null) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ skip, limit })
      if (status) params.append("status", status)
      if (search) params.append("search", search)
      const response = await fetch(`${API_HOST}/restaurants?${params.toString()}`, {
        headers: { ...getAuthHeaders() },
      })
      if (!response.ok) throw new Error("Failed to fetch restaurants")
      const data = await response.json()
      if (Array.isArray(data)) {
        setRestaurants(data)
        setTotal(data.length)
      } else if (data && Array.isArray(data.items)) {
        setRestaurants(data.items)
        setTotal(data.total || data.items.length)
      } else {
        throw new Error("Invalid response format from server")
      }
    } catch (err) {
      console.error("Error fetching restaurants:", err)
      setError(err.message)
      setRestaurants([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRestaurants((page - 1) * size, size, statusFilter, searchQuery)
  }, [page, statusFilter, searchQuery, size])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const createRestaurant = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.siret) {
      setError("Tous les champs marqués d'un astérisque sont obligatoires")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Veuillez entrer une adresse email valide")
      return
    }

    const phoneRegex = /^[0-9+\s-]{10,20}$/
    if (!phoneRegex.test(formData.phone)) {
      setError("Veuillez entrer un numéro de téléphone valide")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_HOST}/restaurants/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          ...formData,
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          siret: formData.siret.trim(),
          settings: formData.settings ? JSON.parse(formData.settings) : {},
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.detail || data.message || "Échec de la création du restaurant"
        throw new Error(errorMessage)
      }

      toast.success("Restaurant créé avec succès")
      await fetchRestaurants((page - 1) * size, size, statusFilter, searchQuery)
      setModalOpen(false)
      setFormData({})

      return data
    } catch (err) {
      console.error("Erreur lors de la création du restaurant:", err)
      setError(err.message)
      toast.error(`Erreur: ${err.message}`)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const registerWithOwner = async () => {
    setError("")
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.siret ||
      !formData.owner_name ||
      !formData.owner_email ||
      !formData.owner_password
    ) {
      setError("Tous les champs sont obligatoires")
      return
    }
    try {
      let settings = {}
      if (formData.settings) {
        try {
          settings = JSON.parse(formData.settings)
        } catch (parseErr) {
          setError("Invalid settings JSON format")
          return
        }
      }
      const response = await fetch(`${API_HOST}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          restaurant_data: {
            name: formData.name?.trim() || "",
            email: formData.email?.trim() || "",
            phone: formData.phone ? String(formData.phone).trim() : "",
            siret: formData.siret ? String(formData.siret).trim() : "",
            settings,
          },
          owner_email: formData.owner_email?.trim() || "",
          owner_name: formData.owner_name?.trim() || "",
          owner_password: formData.owner_password,
        }),
      })
      const result = await response.json()
      if (!response.ok) {
        const errorMessage = result.error?.message || result.message || "Une erreur est survenue lors de l'inscription"
        throw new Error(errorMessage)
      }
      fetchRestaurants((page - 1) * size, size, statusFilter, searchQuery)
      setModalOpen(false)
    } catch (err) {
      console.error("Erreur:", err)
      setError(err.message || "Une erreur est survenue lors de l'inscription")
    }
  }

  const getRestaurant = async (id) => {
    try {
      const response = await fetch(`${API_HOST}/restaurants/${id}`, {
        headers: { ...getAuthHeaders() },
      })
      if (!response.ok) throw new Error("Restaurant not found")
      const data = await response.json()
      setSelectedRestaurant(data)
      setFormData(data)
      await getStats(id)
      setModalType("view")
      setModalOpen(true)
    } catch (err) {
      setError(err.message)
    }
  }

  const updateRestaurant = async () => {
    if (!selectedRestaurant?.id) {
      setError("Aucun restaurant sélectionné")
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`${API_HOST}/restaurants/${selectedRestaurant.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || "Échec de la mise à jour du restaurant")
      }

      const updatedRestaurant = await response.json()
      toast.success("Restaurant mis à jour avec succès")

      await fetchRestaurants((page - 1) * size, size, statusFilter, searchQuery)
      setModalOpen(false)

      return updatedRestaurant
    } catch (err) {
      console.error("Erreur lors de la mise à jour du restaurant:", err)
      setError(err.message)
      toast.error(err.message || "Une erreur est survenue lors de la mise à jour")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (settingPath, settingValue) => {
    if (!selectedRestaurant?.id) {
      setError("Aucun restaurant sélectionné")
      return
    }

    if (!settingPath) {
      setError("Le chemin du paramètre est requis")
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`${API_HOST}/restaurants/${selectedRestaurant.id}/settings/${settingPath}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(settingValue !== undefined ? settingValue : formData.setting_value),
      })
      if (!response.ok) throw new Error("Failed to update setting")
      await getRestaurant(selectedRestaurant.id)
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const getSetting = async (path, defaultValue = null) => {
    try {
      const params = defaultValue !== null ? `?default=${defaultValue}` : ""
      const response = await fetch(`${API_HOST}/restaurants/${selectedRestaurant.id}/settings/${path}${params}`, {
        headers: { ...getAuthHeaders() },
      })
      if (!response.ok) throw new Error("Failed to get setting")
      const data = await response.json()
      return data.value
    } catch (err) {
      setError(err.message)
      return null
    }
  }

  const deleteRestaurant = async () => {
    try {
      const hard = formData.hard_delete === "true"
      const params = hard ? "?hard_delete=true" : ""
      const response = await fetch(`${API_HOST}/restaurants/${selectedRestaurant.id}${params}`, {
        method: "DELETE",
        headers: { ...getAuthHeaders() },
      })
      if (!response.ok) throw new Error("Failed to delete")
      fetchRestaurants((page - 1) * size, size, statusFilter, searchQuery)
      setModalOpen(false)
    } catch (err) {
      setError(err.message)
    }
  }

  const activate = async (id) => {
    try {
      const response = await fetch(`${API_HOST}/restaurants/${id}/activate`, {
        method: "POST",
        headers: { ...getAuthHeaders() },
      })
      if (!response.ok) throw new Error("Failed to activate")
      fetchRestaurants((page - 1) * size, size, statusFilter, searchQuery)
    } catch (err) {
      setError(err.message)
    }
  }

  const suspend = async () => {
    try {
      const reason = formData.reason || ""
      const params = reason ? `?reason=${encodeURIComponent(reason)}` : ""
      const response = await fetch(`${API_HOST}/restaurants/${selectedRestaurant.id}/suspend${params}`, {
        method: "POST",
        headers: { ...getAuthHeaders() },
      })
      if (!response.ok) throw new Error("Failed to suspend")
      fetchRestaurants((page - 1) * size, size, statusFilter, searchQuery)
      setModalOpen(false)
    } catch (err) {
      setError(err.message)
    }
  }

  const markConfigured = async (id) => {
    try {
      const response = await fetch(`${API_HOST}/restaurants/${id}/configure`, {
        method: "POST",
        headers: { ...getAuthHeaders() },
      })
      if (!response.ok) throw new Error("Failed to configure")
      fetchRestaurants((page - 1) * size, size, statusFilter, searchQuery)
    } catch (err) {
      setError(err.message)
    }
  }

  const getStats = async (id) => {
    try {
      const response = await fetch(`${API_HOST}/restaurants/${id}/stats`, {
        headers: { ...getAuthHeaders() },
      })
      if (!response.ok) throw new Error("Failed to get stats")
      const data = await response.json()
      setSelectedRestaurant((prev) => ({ ...prev, stats: data }))
      setModalType("stats")
      setModalOpen(true)
    } catch (err) {
      setError(err.message)
    }
  }

  const getRestaurantBySlug = async (slug) => {
    try {
      const response = await fetch(`${API_HOST}/restaurants/slug/${slug}`, {
        headers: { ...getAuthHeaders() },
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || "Restaurant non trouvé")
      }
      return await response.json()
    } catch (err) {
      console.error("Erreur lors de la récupération du restaurant par slug:", err)
      setError(err.message || "Erreur lors de la récupération du restaurant")
      throw err
    }
  }

  const validateSettings = async (restaurantId, settings) => {
    try {
      const response = await fetch(`${API_HOST}/restaurants/${restaurantId}/validate-settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          ...(settings || {}),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || "Échec de la validation des paramètres")
      }

      const result = await response.json()
      setSelectedRestaurant((prev) => ({
        ...prev,
        validation: result,
      }))
      toast.success("Paramètres validés avec succès")
      return result
    } catch (err) {
      console.error("Erreur lors de la validation des paramètres:", err)
      setError(err.message)
      toast.error(err.message || "Erreur lors de la validation des paramètres")
      throw err
    }
  }

  const handleValidateSettings = async () => {
    try {
      setLoading(true)
      const settings = {}
      if (selectedRestaurant?.id) {
        const result = await validateSettings(selectedRestaurant.id, settings)
        console.log("Paramètres validés:", result)
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const checkFeature = async (feature) => {
    try {
      const response = await fetch(`${API_HOST}/restaurants/${selectedRestaurant.id}/features/${feature}`, {
        headers: { ...getAuthHeaders() },
      })
      if (!response.ok) throw new Error("Failed to check feature")
      const data = await response.json()
      return data.enabled
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  const renderModalContent = () => {
    if (!modalOpen) return null
    const isView = modalType === "view"
    const isEdit = modalType === "edit"
    const isCreate = modalType === "create" || modalType === "register"
    const isSuspend = modalType === "suspend"
    const isDelete = modalType === "delete"
    const isSettings = modalType === "settings"
    const isStats = modalType === "stats"

    const handleSubmit = (e) => {
      e.preventDefault()
      if (isCreate) {
        if (modalType === "register") {
          registerWithOwner()
        } else {
          createRestaurant()
        }
      } else if (isEdit) {
        updateRestaurant()
      } else if (isSuspend) {
        suspend()
      } else if (isDelete) {
        deleteRestaurant()
      } else if (isSettings) {
        updateSetting(formData.setting_path, formData.setting_value)
      }
    }

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-300">
        <div className="bg-background dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-foreground dark:text-white capitalize flex items-center">
              {modalType === "create" && <Plus className="mr-2" size={20} />}
              {modalType === "edit" && <Edit className="mr-2" size={20} />}
              {modalType === "view" && <Eye className="mr-2" size={20} />}
              {modalType === "delete" && <Trash2 className="mr-2" size={20} />}
              {modalType === "suspend" && <AlertCircle className="mr-2" size={20} />}
              {modalType === "settings" && <Settings className="mr-2" size={20} />}
              {modalType === "register" && <UserPlus className="mr-2" size={20} />}
              {modalType === "stats" && <BarChart className="mr-2" size={20} />}
              {modalType.charAt(0).toUpperCase() + modalType.slice(1)} Restaurant
            </h2>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 shadow-lg rounded-full flex items-center justify-center text-foreground dark:text-white transition-all hover:scale-110 duration-200"
            >
              <CircleX />
            </button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 dark:border-red-600 p-4 mb-6 rounded-lg animate-in slide-in-from-top duration-300">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-300" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                  </div>
                </div>
              </div>
            )}
            {isStats && selectedRestaurant?.stats && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 p-5 rounded-xl border border-border dark:border-gray-700 shadow-sm animate-in fade-in slide-in-from-top duration-500">
                  <h3 className="text-lg font-semibold text-foreground dark:text-gray-200 mb-3">
                    {selectedRestaurant.stats.name}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div key="id">
                      <span className="text-muted-foreground dark:text-gray-400">{"ID:"}</span>
                      <span className="ml-2 font-mono text-foreground dark:text-gray-200">
                        {selectedRestaurant.stats.restaurant_id}
                      </span>
                    </div>
                    <div key="created_at">
                      <span className="text-muted-foreground dark:text-gray-400">{"Créé le:"}</span>
                      <span className="ml-2 text-foreground dark:text-gray-200">
                        {new Date(selectedRestaurant.stats.created_at).toLocaleDateString("fr-FR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    className="bg-background dark:bg-gray-800 border border-border dark:border-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-left duration-500 delay-100"
                    key="status"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">Statut</p>
                        <div className="mt-2">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                              selectedRestaurant.stats.status === "active"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : selectedRestaurant.stats.status === "suspended"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {selectedRestaurant.stats.status === "active"
                              ? "Actif"
                              : selectedRestaurant.stats.status === "suspended"
                                ? "Suspendu"
                                : "Fermé"}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`p-3 rounded-full ${
                          selectedRestaurant.stats.status === "active"
                            ? "bg-green-100 dark:bg-green-900"
                            : selectedRestaurant.stats.status === "suspended"
                              ? "bg-yellow-100 dark:bg-yellow-900"
                              : "bg-red-100 dark:bg-red-900"
                        }`}
                      >
                        {selectedRestaurant.stats.status === "active" ? (
                          <CheckCircle className="text-green-600 dark:text-green-300" size={24} />
                        ) : (
                          <AlertCircle
                            className={
                              selectedRestaurant.stats.status === "suspended"
                                ? "text-yellow-600 dark:text-yellow-300"
                                : "text-red-600 dark:text-red-300"
                            }
                            size={24}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <div
                    className="bg-background dark:bg-gray-800 border border-border dark:border-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom duration-500 delay-200"
                    key="configured"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">Configuration</p>
                        <div className="mt-2">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                              selectedRestaurant.stats.is_configured
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {selectedRestaurant.stats.is_configured ? "Configuré" : "Non configuré"}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`p-3 rounded-full ${
                          selectedRestaurant.stats.is_configured
                            ? "bg-green-100 dark:bg-green-900"
                            : "bg-red-100 dark:bg-red-900"
                        }`}
                      >
                        {selectedRestaurant.stats.is_configured ? (
                          <CheckCircle className="text-green-600 dark:text-green-300" size={24} />
                        ) : (
                          <XCircle className="text-red-600 dark:text-red-300" size={24} />
                        )}
                      </div>
                    </div>
                  </div>
                  <div
                    className="bg-background dark:bg-gray-800 border border-border dark:border-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-right duration-500 delay-300"
                    key="users"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">Utilisateurs</p>
                        <p className="text-2xl font-bold text-foreground dark:text-gray-200 mt-1">
                          {selectedRestaurant.stats.user_count}
                        </p>
                      </div>
                      <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                        <UserPlus className="text-blue-600 dark:text-blue-300" size={24} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-background dark:bg-gray-800 p-5 rounded-xl border border-border dark:border-gray-700 shadow-sm animate-in fade-in slide-in-from-bottom duration-500 delay-400">
                  <h4 className="font-semibold text-foreground dark:text-gray-200 mb-3 flex items-center">
                    <Settings className="mr-2" size={18} />
                    Données brutes (JSON)
                  </h4>
                  <pre className="text-sm text-muted-foreground dark:text-gray-400 overflow-x-auto bg-background dark:bg-gray-900 p-4 rounded-lg border border-border dark:border-gray-700 font-mono shadow-inner">
                    {JSON.stringify(selectedRestaurant.stats, null, 2)}
                  </pre>
                </div>
              </div>
            )}
            {!isStats && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {(isCreate || isEdit || isView) && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="animate-in fade-in slide-in-from-left duration-300" key="name">
                        <label className="block text-sm font-medium text-foreground dark:text-gray-200 mb-1">Nom</label>
                        <Input
                          type="text"
                          name="name"
                          value={formData.name || ""}
                          onChange={handleInputChange}
                          placeholder="Nom du restaurant"
                          className="w-full"
                          readOnly={isView}
                          required
                        />
                      </div>
                      <div className="animate-in fade-in slide-in-from-right duration-300" key="siret">
                        <label className="block text-sm font-medium text-foreground dark:text-gray-200 mb-1">
                          SIRET
                        </label>
                        <Input
                          type="text"
                          name="siret"
                          value={formData.siret || ""}
                          onChange={handleInputChange}
                          placeholder="SIRET (14 chiffres)"
                          className="w-full"
                          readOnly={isView}
                          required={isCreate}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="animate-in fade-in slide-in-from-left duration-300 delay-100" key="email">
                        <label className="block text-sm font-medium text-foreground dark:text-gray-200 mb-1">
                          Email
                        </label>
                        <Input
                          type="email"
                          name="email"
                          value={formData.email || ""}
                          onChange={handleInputChange}
                          placeholder="Email"
                          className="w-full"
                          readOnly={isView}
                          required
                        />
                      </div>
                      <div className="animate-in fade-in slide-in-from-right duration-300 delay-100" key="phone">
                        <label className="block text-sm font-medium text-foreground dark:text-gray-200 mb-1">
                          Téléphone
                        </label>
                        <Input
                          type="text"
                          name="phone"
                          value={formData.phone || ""}
                          onChange={handleInputChange}
                          placeholder="Téléphone"
                          className="w-full"
                          readOnly={isView}
                        />
                      </div>
                    </div>
                    {!isCreate && (
                      <div
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300 delay-200"
                        key="status_config"
                      >
                        <div>
                          <label className="block text-sm font-medium text-foreground dark:text-gray-200 mb-1">
                            Statut
                          </label>
                          <select
                            name="status"
                            value={formData.status || ""}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-background dark:bg-gray-700 text-foreground dark:text-gray-200 transition-all duration-200"
                            disabled={isView}
                          >
                            <option value="active">Actif</option>
                            <option value="suspended">Suspendu</option>
                            <option value="closed">Fermé</option>
                          </select>
                        </div>
                        <div className="flex items-center">
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              name="is_configured"
                              checked={formData.is_configured || false}
                              onChange={(e) => setFormData((prev) => ({ ...prev, is_configured: e.target.checked }))}
                              disabled={isView}
                              className="w-5 h-5 text-blue-600 dark:text-blue-400 border-border dark:border-gray-600 rounded focus:ring-blue-500 bg-background dark:bg-gray-700 transition-all duration-200"
                            />
                            <span className="text-sm font-medium text-foreground dark:text-gray-200">Configuré</span>
                          </label>
                        </div>
                      </div>
                    )}
                    <div className="animate-in fade-in duration-300 delay-300" key="settings">
                      <label className="block text-sm font-medium text-foreground dark:text-gray-200 mb-1">
                        Paramètres (JSON)
                      </label>
                      <textarea
                        name="settings"
                        value={formData.settings ? JSON.stringify(formData.settings, null, 2) : "{}"}
                        onChange={(e) => setFormData((prev) => ({ ...prev, settings: e.target.value }))}
                        placeholder="Paramètres (JSON)"
                        className="w-full p-3 border border-border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-background dark:bg-gray-700 text-foreground dark:text-gray-200 font-mono text-sm transition-all duration-200"
                        readOnly={isView}
                        rows={4}
                      />
                    </div>
                    {modalType === "register" && (
                      <div
                        className="border-t border-border dark:border-gray-600 pt-4 animate-in fade-in duration-300 delay-400"
                        key="owner_info"
                      >
                        <h3 className="text-lg font-semibold text-foreground dark:text-gray-200 mb-3">
                          Informations du propriétaire
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div key="owner_name">
                            <label className="block text-sm font-medium text-foreground dark:text-gray-200 mb-1">
                              Nom du propriétaire
                            </label>
                            <Input
                              type="text"
                              name="owner_name"
                              value={formData.owner_name || ""}
                              onChange={handleInputChange}
                              placeholder="Nom du propriétaire"
                              className="w-full"
                              required
                            />
                          </div>
                          <div key="owner_email">
                            <label className="block text-sm font-medium text-foreground dark:text-gray-200 mb-1">
                              Email du propriétaire
                            </label>
                            <Input
                              type="email"
                              name="owner_email"
                              value={formData.owner_email || ""}
                              onChange={handleInputChange}
                              placeholder="Email du propriétaire"
                              className="w-full"
                              required
                            />
                          </div>
                        </div>
                        <div className="mt-4" key="owner_password">
                          <label className="block text-sm font-medium text-foreground dark:text-gray-200 mb-1">
                            Mot de passe
                          </label>
                          <Input
                            type="password"
                            name="owner_password"
                            value={formData.owner_password || ""}
                            onChange={handleInputChange}
                            placeholder="Mot de passe du propriétaire"
                            className="w-full"
                            required
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
                {isSuspend && (
                  <div className="animate-in fade-in duration-300" key="suspend_reason">
                    <label className="block text-sm font-medium text-foreground dark:text-gray-200 mb-1">
                      Raison de la suspension
                    </label>
                    <textarea
                      name="reason"
                      value={formData.reason || ""}
                      onChange={handleInputChange}
                      placeholder="Raison de la suspension"
                      className="w-full p-3 border border-border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-background dark:bg-gray-700 text-foreground dark:text-gray-200 transition-all duration-200"
                      rows={4}
                    />
                  </div>
                )}
                {isDelete && (
                  <div className="animate-in fade-in duration-300" key="delete_type">
                    <label className="block text-sm font-medium text-foreground dark:text-gray-200 mb-1">
                      Type de suppression
                    </label>
                    <select
                      name="hard_delete"
                      value={formData.hard_delete || "false"}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-background dark:bg-gray-700 text-foreground dark:text-gray-200 transition-all duration-200"
                    >
                      <option value="false">Suppression douce</option>
                      <option value="true">Suppression définitive</option>
                    </select>
                  </div>
                )}
                {isSettings && (
                  <div
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300"
                    key="settings_form"
                  >
                    <div>
                      <label className="block text-sm font-medium text-foreground dark:text-gray-200 mb-1">
                        Chemin du paramètre
                      </label>
                      <Input
                        type="text"
                        name="setting_path"
                        value={formData.setting_path || ""}
                        onChange={handleInputChange}
                        placeholder="ex: theme"
                        className="w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground dark:text-gray-200 mb-1">
                        Valeur
                      </label>
                      <Input
                        type="text"
                        name="setting_value"
                        value={formData.setting_value || ""}
                        onChange={handleInputChange}
                        placeholder="Valeur du paramètre"
                        className="w-full"
                        required
                      />
                    </div>
                  </div>
                )}
                {isView && selectedRestaurant && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    {selectedRestaurant.stats && (
                      <div
                        className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4 rounded-xl shadow-sm border border-border dark:border-gray-700"
                        key="stats"
                      >
                        <h3 className="font-bold text-foreground dark:text-gray-200 mb-2 flex items-center">
                          <BarChart className="mr-2" size={18} />
                          Statistiques
                        </h3>
                        <pre className="text-sm text-muted-foreground dark:text-gray-400 overflow-x-auto bg-background dark:bg-gray-900 p-3 rounded-lg border border-border dark:border-gray-700">
                          {JSON.stringify(selectedRestaurant.stats, null, 2)}
                        </pre>
                      </div>
                    )}
                    {selectedRestaurant.validation && (
                      <div
                        className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4 rounded-xl shadow-sm border border-border dark:border-gray-700"
                        key="validation"
                      >
                        <h3 className="font-bold text-foreground dark:text-gray-200 mb-2 flex items-center">
                          <CheckCircle className="mr-2" size={18} />
                          Validation
                        </h3>
                        <pre className="text-sm text-muted-foreground dark:text-gray-400 overflow-x-auto bg-background dark:bg-gray-900 p-3 rounded-lg border border-border dark:border-gray-700">
                          {JSON.stringify(selectedRestaurant.validation, null, 2)}
                        </pre>
                      </div>
                    )}
                    <Button
                      type="button"
                      onClick={async () => {
                        const enabled = await checkFeature("example_feature")
                        alert(`Fonctionnalité activée: ${enabled}`)
                      }}
                      className="px-4 py-2"
                    >
                      Vérifier la fonctionnalité exemple
                    </Button>
                  </div>
                )}
                <div className="flex justify-end space-x-3 pt-4 border-t border-border dark:border-gray-600">
                  <Button type="button" onClick={() => setModalOpen(false)} variant="secondary">
                    {isStats ? "Fermer" : "Annuler"}
                  </Button>
                  {!isView && !isStats && (
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                    >
                      Valider
                    </Button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 rounded-lg">
      <div className="container mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-600 p-4 mb-6 rounded-xl flex items-center shadow-sm animate-in slide-in-from-top duration-300">
            <AlertCircle className="mr-3 text-red-500 dark:text-red-300" size={20} />
            <span className="text-red-700 dark:text-red-200">{error}</span>
          </div>
        )}
        <div className="bg-background dark:bg-gray-800 rounded-2xl shadow-md border border-border dark:border-gray-700 p-6 mb-6 animate-in fade-in slide-in-from-top duration-500">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground dark:text-gray-400"
                size={20}
              />
              <Input
                type="text"
                placeholder="Rechercher des restaurants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12"
              />
            </div>
            <select
              value={statusFilter || ""}
              onChange={(e) => setStatusFilter(e.target.value || null)}
              className="px-4 py-3 border border-border dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-background dark:bg-gray-700 text-foreground dark:text-gray-200 transition-all duration-200 min-w-[150px]"
            >
              <option value="">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="suspended">Suspendu</option>
              <option value="closed">Fermé</option>
            </select>
            <Button
              onClick={() => {
                setModalType("register")
                setFormData({})
                setModalOpen(true)
              }}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            >
              <UserPlus className="mr-2" size={18} /> Enregistrer avec propriétaire
            </Button>
          </div>
        </div>
        <Card className="rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom duration-500">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background dark:bg-gray-800 border-b border-border dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground dark:text-gray-200">Nom</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground dark:text-gray-200">
                    Email
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground dark:text-gray-200">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground dark:text-gray-200">
                    Configuré
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground dark:text-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground dark:text-gray-400">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 dark:border-blue-400 border-t-transparent"></div>
                        <span className="ml-3 text-lg">Chargement...</span>
                      </div>
                    </td>
                  </tr>
                ) : restaurants.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground dark:text-gray-400">
                      Aucun restaurant trouvé
                    </td>
                  </tr>
                ) : (
                  restaurants.map((resto, index) => (
                    <tr
                      key={resto.id}
                      className="hover:bg-accent dark:hover:bg-gray-700 transition-all duration-200 animate-in fade-in slide-in-from-bottom"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-foreground dark:text-gray-200">{resto.name}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground dark:text-gray-400">{resto.email}</td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                            resto.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : resto.status === "suspended"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {resto.status === "active" ? "Actif" : resto.status === "suspended" ? "Suspendu" : "Fermé"}
                        </span>
                      </td>
                      <td className="px-6 py-4 justify-center flex items-center">
                        {resto.is_configured ? (
                          <CheckCircle className="text-green-500 dark:text-green-400" size={20} />
                        ) : (
                          <XCircle className="text-red-500 dark:text-red-400" size={20} />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2 justify-center">
                          <Tooltip text="Voir les détails">
                            <button
                              onClick={() => getRestaurant(resto.id)}
                              className="p-2 text-blue-500 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-lg transition-all duration-200 hover:scale-110"
                            >
                              <Eye size={18} />
                            </button>
                          </Tooltip>
                          <Tooltip text="Modifier">
                            <button
                              onClick={() => {
                                setSelectedRestaurant(resto)
                                setFormData(resto)
                                setModalType("edit")
                                setModalOpen(true)
                              }}
                              className="p-2 text-yellow-500 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-900/50 rounded-lg transition-all duration-200 hover:scale-110"
                            >
                              <Edit size={18} />
                            </button>
                          </Tooltip>
                          <Tooltip text="Supprimer">
                            <button
                              onClick={() => {
                                setSelectedRestaurant(resto)
                                setFormData({ hard_delete: "false" })
                                setModalType("delete")
                                setModalOpen(true)
                              }}
                              className="p-2 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/50 rounded-lg transition-all duration-200 hover:scale-110"
                            >
                              <Trash2 size={18} />
                            </button>
                          </Tooltip>
                          <Tooltip text="Activer">
                            <button
                              onClick={() => activate(resto.id)}
                              className="p-2 text-green-500 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/50 rounded-lg transition-all duration-200 hover:scale-110"
                            >
                              <RotateCcw size={18} />
                            </button>
                          </Tooltip>
                          <Tooltip text="Suspendre">
                            <button
                              onClick={() => {
                                setSelectedRestaurant(resto)
                                setFormData({})
                                setModalType("suspend")
                                setModalOpen(true)
                              }}
                              className="p-2 text-orange-500 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/50 rounded-lg transition-all duration-200 hover:scale-110"
                            >
                              <AlertCircle size={18} />
                            </button>
                          </Tooltip>
                          <Tooltip text="Marquer comme configuré">
                            <button
                              onClick={() => markConfigured(resto.id)}
                              className="p-2 text-purple-500 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/50 rounded-lg transition-all duration-200 hover:scale-110"
                            >
                              <CheckCircle size={18} />
                            </button>
                          </Tooltip>
                          <Tooltip text="Voir les statistiques">
                            <button
                              onClick={() => getStats(resto.id)}
                              className="p-2 text-indigo-500 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/50 rounded-lg transition-all duration-200 hover:scale-110"
                            >
                              <BarChart size={18} />
                            </button>
                          </Tooltip>
                          <Tooltip text="Paramètres">
                            <button
                              onClick={() => {
                                setSelectedRestaurant(resto)
                                setFormData({})
                                setModalType("settings")
                                setModalOpen(true)
                              }}
                              className="p-2 text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200 hover:scale-110"
                            >
                              <Settings size={18} />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
        <div className="flex items-center justify-between mt-6 bg-background dark:bg-gray-800 rounded-2xl shadow-md border border-border dark:border-gray-700 px-6 py-4 animate-in fade-in slide-in-from-bottom duration-500 delay-200">
          <div className="text-sm text-muted-foreground dark:text-gray-400">
            Affichage de {Math.min((page - 1) * size + 1, total)} à {Math.min(page * size, total)} sur {total}{" "}
            restaurants
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1 || loading}
              variant="secondary"
            >
              <ChevronLeft className="mr-1" size={18} /> Précédent
            </Button>
            <span className="px-4 py-2 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-xl font-medium shadow-sm">
              Page {page} sur {Math.ceil(total / size)}
            </span>
            <Button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page >= Math.ceil(total / size) || loading}
              variant="secondary"
            >
              Suivant <ChevronRight className="ml-1" size={18} />
            </Button>
          </div>
        </div>
      </div>
      {renderModalContent()}
    </div>
  )
}

export default Restaurant
