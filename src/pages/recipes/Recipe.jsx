import { AiOutlineSetting } from "react-icons/ai"; 
import { BiFork } from "react-icons/bi"; 
"use client"

import { useState, useEffect } from "react"
import {Plus,BarChart3,Edit,Trash2,Search,AlertCircle,ChefHat,
        ShoppingCart,Recycle,MenuIcon,ListChecks,Settings,FileText,Clock,
        Calculator,Star,Activity,RotateCcw, 
        TriangleAlert,RefreshCcw,Brain,
        Euro,Leaf,List} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const API_HOST = "http://localhost:8120/api/v1"
const TOKEN_KEY = "access_token"

const Recipe = () => {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [inventoryProducts, setInventoryProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newRecipe, setNewRecipe] = useState({
    name: "",
    code: "",
    recipe_type: "dish",
    category: "main",
    yield_quantity: 1,
    yield_unit: "portion",
    prep_time_minutes: 0,
    cooking_time_minutes: 0,
    rest_time_minutes: 0,
    dlc_days: 3,

    other_costs: 0,
    target_price: 0,
    instructions: { steps: [], notes: "", tips: "" },
    ingredients: [],
    sub_recipes: [],
    is_validated: false,
  })
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [stats, setStats] = useState(null)
  const [kitchenAnalysis, setKitchenAnalysis] = useState(null)
  const [shoppingSuggestions, setShoppingSuggestions] = useState(null)
  const [antiWasteSuggestions, setAntiWasteSuggestions] = useState(null)
  const [menuAvailability, setMenuAvailability] = useState(null)
  const [antiWasteResults, setAntiWasteResults] = useState(null);
  


  

  const mockStats = {
    total_recipes: 10,
    active_recipes: 8,
    average_cost: 5.5,
    average_margin: 65,
    by_category: { main: 5, dessert: 3, other: 2 },
    features: {
      intelligence: "4 endpoints IA actifs",
      anti_waste: "Création automatique disponible",
      menu_optimization: "Analyse temps réel",
    },
  }

  const getHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }
  }

  const fetchRecipes = async (params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const queryParams = new URLSearchParams(params).toString()
      const response = await fetch(`${API_HOST}/recipes?${queryParams}`, {
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error("Failed to fetch recipes")
      const data = await response.json()
      setRecipes(data.items)
    } catch (err) {
      setError(err.message)
    
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_HOST}/recipes/stats/summary`, {
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error("Failed to fetch stats")
      const data = await response.json()
      setStats(data)
    } catch (err) {
      setStats(mockStats)
    }
  }

  const analyzeKitchen = async () => {
    try {
      const response = await fetch(`${API_HOST}/recipes/analyze/kitchen-situation?deep_analysis=true`, {
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error("Failed to analyze kitchen")
      const data = await response.json()
      setKitchenAnalysis(data)
    } catch (err) {
      setError(err.message)
    }
  }

  const suggestShopping = async () => {
    try {
      const response = await fetch(`${API_HOST}/recipes/suggest/shopping-list?priorities=urgent&priorities=popular`, {
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error("Failed to suggest shopping")
      const data = await response.json()
      setShoppingSuggestions(data)
    } catch (err) {
      setError(err.message)
    }
  }

  // Handle manual validation of shopping suggestions
  const handleValidation = async () => {
    if (!shoppingSuggestions) return;
    
    try {
      const response = await fetch(
        `${API_HOST}/recipes/validate-shopping-suggestions`,
        {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            recipe_id: selectedRecipe?.id,
            validation_timestamp: new Date().toISOString()
          })
        }
      );
      
      if (!response.ok) {
        throw new Error("Échec de la validation des suggestions d'achat");
      }
      
      // Update local state to reflect validation
      setShoppingSuggestions(prev => ({
        ...prev,
        require_manual_validation: false
      }));
      
      toast.success("Suggestions d'achat validées avec succès");
    } catch (error) {
      console.error("Erreur lors de la validation des suggestions:", error);
      toast.error(error.message || "Erreur lors de la validation des suggestions");
    }
  };


  const suggestAntiWaste = async () => {
    try {
      setLoading(true);
      setError(null);
      setAntiWasteResults(null);
      
      const response = await fetch(`${API_HOST}/recipes/suggest/anti-waste?auto_create=false`, {
        headers: getHeaders(),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Si l'API retourne une erreur avec des ingrédients critiques
        // if (data.status === "error" && data.critical_ingredients) {
        //   setAntiWasteResults({
        //     status: "error",
        //     error: data.error,
        //     critical_ingredients: data.critical_ingredients.map(item => ({
        //       ...item,
        //       // S'assurer que les champs requis sont présents
        //       id: item.id || `item-${Math.random().toString(36).substr(2, 9)}`,
        //       sku: item.sku || 'N/A',
        //       name: item.name || 'Ingrédient inconnu',
        //       quantity: item.quantity || 0,
        //       unit: item.unit || 'unité',
        //       expiry_date: item.expiry_date || new Date().toISOString().split('T')[0],
        //       days_until_expiry: item.days_until_expiry || 0
        //     }))
        //   });
        // } else {
        //   throw new Error(data.error || "Échec de l'analyse anti-gaspillage");
        // }
        console.log('erreur')
      } else {
        // Si tout va bien, stocker les suggestions
        setAntiWasteSuggestions(data);
        console.log(data)
        setAntiWasteResults(data);
        console.log('ok')

      }
    } catch (err) {
      console.error("Erreur dans suggestAntiWaste:", err);
      setError(err.message);
      setAntiWasteResults({
        status: "error",
        error: err.message,
        critical_ingredients: []
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzeMenu = async () => {
    try {
      const response = await fetch(`${API_HOST}/recipes/analyze/menu-availability?auto_update=false`, {
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error("Failed to analyze menu")
      const data = await response.json()
      setMenuAvailability(data)
    } catch (err) {
      setError(err.message)
    }
  }

  const createRecipe = async () => {
    try {
      // Préparer les données de la recette selon le format attendu par l'API
      const recipeData = {
        name: newRecipe.name || "",
        recipe_type: newRecipe.recipe_type || "dish",
        category: newRecipe.category || "other",
        yield_quantity: Number(newRecipe.yield_quantity) || 1,
        yield_unit: newRecipe.yield_unit || "portion",
        prep_time_minutes: Number(newRecipe.prep_time_minutes) || 0,
        cooking_time_minutes: Number(newRecipe.cooking_time_minutes) || 0,
        rest_time_minutes: Number(newRecipe.rest_time_minutes) || 0,
        dlc_days: Number(newRecipe.dlc_days) || 3,
        storage_temp: newRecipe.storage_temp || "",
        target_price: Number(newRecipe.target_price) || 0,
        photo_url: newRecipe.photo_url || "",
        video_url: newRecipe.video_url || "",
        code: newRecipe.code || "",
        other_costs: Number(newRecipe.other_costs) || 0,
        haccp_points: newRecipe.haccp_points || {},
        instructions: newRecipe.instructions || { steps: [], notes: "", tips: "" },
        // Formater les ingrédients selon le format attendu
        ingredients: (newRecipe.ingredients || []).map(ingredient => ({
          inventory_item_id: ingredient.product_id || "",
          quantity: Number(ingredient.quantity) || 1,
          unit: ingredient.unit || "unit",
          quantity_gross: 1, // Valeur par défaut modifiée pour éviter l'erreur de validation
          quantity_net: 1,   // Valeur par défaut modifiée pour éviter l'erreur de validation
          is_optional: false, // Valeur par défaut
          notes: "",         // Valeur par défaut
          inventory_sku: ingredient.sku || "",
          inventory_name: ingredient.name || "",
          inventory_unit_cost: Number(ingredient.cost_per_unit) || 0,
          inventory_unit: ingredient.unit || "unit"
        })),
        sub_recipes: newRecipe.sub_recipes || [],
        is_validated: newRecipe.is_validated || false
      }

      const response = await fetch(`${API_HOST}/recipes/`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(recipeData),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || "Échec de la création de la recette")
      }
      
      const data = await response.json()
      setRecipes([...recipes, data])
      setShowCreateModal(false)
      // Réinitialiser le formulaire
      setNewRecipe({
        name: "",
        recipe_type: "dish",
        category: "other",
        yield_quantity: 1,
        yield_unit: "portion",
        prep_time_minutes: 0,
        cooking_time_minutes: 0,
        rest_time_minutes: 0,
        dlc_days: 3,
        other_costs: 0,
        target_price: 0,
        instructions: { steps: [], notes: "", tips: "" },
        ingredients: [],
        sub_recipes: [],
        is_validated: false
      })
    } catch (err) {
      console.error("Erreur lors de la création de la recette:", err)
      setError(err.message || "Une erreur est survenue lors de la création de la recette")
    }
  }

  const updateRecipe = async () => {
    try {
      const response = await fetch(`${API_HOST}/recipes/${selectedRecipe.id}`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(selectedRecipe),
      })
      if (!response.ok) throw new Error("Failed to update recipe")
      const data = await response.json()
      setRecipes(recipes.map((r) => (r.id === data.id ? data : r)))
      setShowEditModal(false)
    } catch (err) {
      setError(err.message)
    }
  }

  const deleteRecipe = async (id) => {
    try {
      const response = await fetch(`${API_HOST}/recipes/${id}?permanent=false`, {
        method: "DELETE",
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error("Failed to delete recipe")
      setRecipes(recipes.filter((r) => r.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  const toggleActive = async (id) => {
    try {
      const response = await fetch(`${API_HOST}/recipes/${id}/toggle-active`, {
        method: "POST",
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error("Failed to toggle active")
      const data = await response.json()
      setRecipes(recipes.map((r) => (r.id === id ? { ...r, is_active: data.is_active } : r)))
    } catch (err) {
      setError(err.message)
    }
  }

  const calculateCost = async (id) => {
    try {
      const response = await fetch(`${API_HOST}/recipes/${id}/calculate-cost`, {
        method: "POST",
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error("Failed to calculate cost")
      const data = await response.json()
      setRecipes(
        recipes.map((r) => (r.id === id ? { ...r, food_cost: data.food_cost, total_cost: data.total_cost } : r)),
      )
    } catch (err) {
      setError(err.message)
    }
  }

  const improveRecipe = async (id, goal) => {
    try {
      const response = await fetch(`${API_HOST}/recipes/${id}/improve`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ optimization_goal: goal }),
      })
      if (!response.ok) throw new Error("Failed to improve recipe")
      fetchRecipes()
    } catch (err) {
      setError(err.message)
    }
  }

  const exportSheet = async (id) => {
    try {
      const response = await fetch(`${API_HOST}/recipes/${id}/technical-sheet`, {
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error("Failed to export sheet")
      const data = await response.json()
      console.log("Technical Sheet:", data)
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null
    if (token) {
      fetchRecipes({ is_active: true })
      fetchStats()
      const fetchInventoryProducts = async () => {
        try {
          const response = await fetch(`${API_HOST}/inventory/items`, {
            headers: getHeaders(),
          })
          if (!response.ok) throw new Error("Échec du chargement des produits de l'inventaire")
          const data = await response.json()
          // Mapper les données pour correspondre à la structure attendue
          const formattedProducts = data.items.map(item => ({
            id: item.id,
            name: item.name,
            sku: item.sku,
            unit: item.unit,
            cost_price: item.unit_cost ? parseFloat(item.unit_cost) : 0,
            quantity: parseFloat(item.quantity) || 0,
            location: item.location,
            expiry_date: item.expiry_date,
            batch_number: item.batch_number,
            is_active: item.is_active,
            is_low: item.is_low,
            is_expired: item.is_expired
          }))
          setInventoryProducts(formattedProducts)
        } catch (err) {
          console.error("Error fetching inventory products:", err)
          setError("Erreur lors du chargement des produits de l'inventaire")
        }
      }
      fetchInventoryProducts()
    } else {
      setError("No access token found. Please login.")
      // setRecipes(mockRecipes)
      // setStats(mockStats)
      setLoading(false)
    }
  }, [])

  const filteredRecipes = recipes.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleInstructionsChange = (field, value, setter, current) => {
    setter({
      ...current,
      instructions: {
        ...current.instructions,
        [field]: field === "steps" ? value.split("\n").filter(Boolean) : value,
      },
    })
  }

  const addIngredient = (product = null) => {
    if (product) {
      // Ajouter un ingrédient à partir d'un produit de l'inventaire
      setNewRecipe({
        ...newRecipe,
        ingredients: [
          ...newRecipe.ingredients,
          {
            name: product.name,
            product_id: product.id,
            sku: product.sku,
            batch_number: product.batch_number,
            quantity: 1,
            unit: product.unit || "unité",
            cost_per_unit: product.cost_price || 0,
          },
        ],
      })
      setSelectedProduct("")
    } else {
      // Ajouter un ingrédient vide
      setNewRecipe({
        ...newRecipe,
        ingredients: [
          ...newRecipe.ingredients,
          { 
            name: "", 
            product_id: null,
            quantity: 0, 
            unit: "g", 
            cost_per_unit: 0 
          },
        ],
      })
    }
  }

  const updateIngredient = (index, field, value) => {
    const updatedIngredients = [...newRecipe.ingredients]
    updatedIngredients[index] = { ...updatedIngredients[index], [field]: value }
    setNewRecipe({ ...newRecipe, ingredients: updatedIngredients })
  }

  const removeIngredient = (index) => {
    const updatedIngredients = newRecipe.ingredients.filter((_, i) => i !== index)
    setNewRecipe({ ...newRecipe, ingredients: updatedIngredients })
  }

  return (
    <div className="min-h-screen bg-background p-6 ">
      <div className="max-w-7xl mx-auto space-y-6 ">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4  mb-10">

        <div className="  relative col-span-9 flex   bg-gradient-to-br from-orange-400 to-orange-500  space-x-6  items-center  rounded-2xl  min-w-3xl  pr-10 pt-4 pb-5">
          <div className="mr-48">
            <img src="/image/macaronie.png" alt="" className=" absolute -top-4  h-52 w-52 " />
          </div>


        <div className=" w-full p-0">
          <div className="flex justify-between  w-full ">
             <h1 className="text-4xl  font-bold flex items-center  text-white">
            Cree votre recette 
             </h1>
           <Button 
            className="text-orange-500 shadow-lg text-sm rounded-2xl bg-white "
            onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4" />
            Nouvelle Recette
          </Button>
          </div>
         
          <p className="text-orange-200 text-xs">
            Lorem ipsum dolor, sit amet consectetur 
          </p>
           <p className="text-orange-200 text-xs">
            Lorem ipsum dolor, sit amet consectetur adipisicing earum 
           
          </p>
          <p>
            <div className="space-x-1 mt-5">
              <span className="bg-orange-400 rounded-sm text-orange-200 px-2 py-1 text-xs font-bold">
                sousrecette 
              </span>
              <span className="bg-orange-400 rounded-sm text-orange-200 px-2 py-1 text-xs font-bold">
                recette 
              </span>
              <span className="bg-orange-400 rounded-sm text-orange-200 px-2 py-1 text-xs font-bold">
                ingredient 
              </span>
            </div>
          </p>
          </div>

          
        </div>

        <div className="col-span-3 bg-slate-100 border rounded-2xl p-5 flex flex-col justify-between">
          <div className=" text-md font-semibold flex justify-between items-center ">
            <span className="flex items-center justify-between space-x-1">
              <span className="text-gray-600">
              <BiFork size={20}/> 

              </span>
              <span>
              Votre recette

              </span>

            </span>
              <span className="text-orange-600">
            
              <AiOutlineSetting size={20} />
            </span>
          </div>
<div className="flex items-end justify-between">

          <div>
            <h1 className="font-bold text-4xl ">
            12 <span className="text-sm text-gray-400">recette crée</span>

            </h1>
          </div>
          <div className="flex items-center">
            <img src="/image/macaronie.png" alt="" className="w-7 h-7"/>
            <img src="/image/salade.png" alt="" className="w-7 h-7"/>
          </div>
</div>

        </div>
        </div>


        {/* Stats Summary */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Recettes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_recipes}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Actives</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active_recipes}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Coût Moyen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€ {stats.average_cost.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Marge Moyenne</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.average_margin}%</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* AI Features */}
        <Tabs defaultValue="kitchen" className="space-y-4  ">
          <TabsList className="grid w-full grid-cols-5 ">
            <TabsTrigger> 
              <List className="w-4 h-4 mr-2 text-sky-500" />
              Liste des recette
            </TabsTrigger>
            <TabsTrigger value="kitchen" onClick={analyzeKitchen}>
              <Activity className="w-4 h-4 mr-2 text-teal-500" />
              Analyser Cuisine
            </TabsTrigger>
            <TabsTrigger value="shopping" onClick={suggestShopping}>
              <ShoppingCart className="w-4 h-4 mr-2 text-yellow-600" />
              Suggestions Courses
            </TabsTrigger>
            <TabsTrigger value="antiwaste" onClick={suggestAntiWaste}>
              <Recycle className="w-4 h-4 mr-2 text-green-600" />
              Anti-Gaspillage
            </TabsTrigger>
            <TabsTrigger value="menu" onClick={analyzeMenu}>
              <MenuIcon className="w-4 h-4 mr-2 text-pink-600" />
              Disponibilité Menu
            </TabsTrigger>
          </TabsList>
          <TabsContent value="kitchen">
            {kitchenAnalysis && (
              <Card>
                <CardContent className="p-4 space-y-6">


                <Card className="border border-muted/30 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Activity className="w-5 h-5 text-sky-500" />
          Analyse Générale de la Cuisine
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {kitchenAnalysis.kitchen_situation.ai_insights.analysis.situation_generale}
        </p>
      </CardContent>
    </Card>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="border-l-4 border-green-500">
        <CardHeader>
          <CardTitle className="text-md font-semibold text-green-600">Points Forts</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
            {kitchenAnalysis.kitchen_situation.ai_insights.analysis.points_forts.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-red-500">
        <CardHeader>
          <CardTitle className="text-md font-semibold text-red-600">Points Faibles</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
            {kitchenAnalysis.kitchen_situation.ai_insights.analysis.points_faibles.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="border-l-4 border-blue-500">
        <CardHeader>
          <CardTitle className="text-md font-semibold text-blue-600">Opportunités</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
            {kitchenAnalysis?.kitchen_situation?.ai_insights?.analysis?.opportunites?.length > 0 ? (
              kitchenAnalysis.kitchen_situation.ai_insights.analysis.opportunites.map((p, i) => (
                <li key={i}>{p}</li>
              ))
            ) : (
              <li className="text-muted-foreground italic">Aucune opportunité identifiée</li>
            )}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-orange-500">
        <CardHeader>
          <CardTitle className="text-md font-semibold text-orange-600">Risques</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
            {kitchenAnalysis?.kitchen_situation?.ai_insights?.analysis?.risques?.length > 0 ? (
              kitchenAnalysis.kitchen_situation.ai_insights.analysis.risques.map((p, i) => (
                <li key={i}>{p}</li>
              ))
            ) : (
              <li className="text-muted-foreground italic">Aucun risque identifié</li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
    <Card className="border border-muted/30">
      <CardHeader>
        <CardTitle className="text-md font-semibold text-purple-600">
          Actions Prioritaires
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {kitchenAnalysis.kitchen_situation.ai_insights.analysis.actions_prioritaires.map((a, i) => (
          <div key={i} className="border p-3 rounded-lg bg-muted/10">
            <p className="font-medium text-foreground">{a.action}</p>
            <p className="text-xs mt-1">
              <strong>Urgence :</strong>{" "}
              <Badge variant={a.urgence === "high" ? "destructive" : "secondary"}>
                {a.urgence}
              </Badge>{" "}
              — <strong>Impact :</strong> {a.impact}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>

    {/* Recommandations */}
    <Card className="border border-muted/30">
      <CardHeader>
        <CardTitle className="text-md font-semibold text-teal-600">Recommandations</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
          {kitchenAnalysis.kitchen_situation.ai_insights.analysis.recommendations.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-md font-semibold text-center">Score d’Efficacité</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center">
          <div className="text-4xl font-bold text-sky-600">
            {kitchenAnalysis.kitchen_situation.ai_insights.analysis.score_efficacite}%
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-md font-semibold text-center text-amber-600">
            Tendances Saisonnières
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
            {kitchenAnalysis?.kitchen_situation?.ai_insights?.analysis?.tendances_saisonnieres?.length > 0 ? (
              kitchenAnalysis.kitchen_situation.ai_insights.analysis.tendances_saisonnieres.map((t, i) => (
                <li key={i}>{t}</li>
              ))
            ) : (
              <li className="text-muted-foreground italic">Aucune tendance saisonnière identifiée</li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
                  
                 
                </CardContent>
              </Card>
            )}
          </TabsContent>


          <TabsContent value="shopping">
            {shoppingSuggestions && (
             <Card className="border border-yellow-300 bg-background shadow-md">
             <CardHeader>
               <CardTitle className="flex items-center gap-2 ">
                 <ShoppingCart className="h-5 w-5 text-yellow-500" />
                 Suggestions d’Achats
               </CardTitle>
             </CardHeader>
       
             <CardContent className="space-y-5 text-sm">
               {/* Alerte de validation */}
               {shoppingSuggestions.require_manual_validation && (
                 <Alert
                   variant="warning"
                   className="border-yellow-400 flex items-center gap-2"
                 >
                  
                   <AlertDescription className="text-yellow-800 font-semibold">
                     {shoppingSuggestions.validation_required}
                   </AlertDescription>
                 </Alert>
               )}
       
               {/* Liste des achats suggérés */}
               <div>
                 <h3 className="font-semibold  mb-3  flex items-center gap-2">
                   <FileText className="h-4 w-4 text-yellow-700" />
                   Liste des achats suggérés
                 </h3>
       
                 <div className="space-y-3">
                   {shoppingSuggestions.shopping_suggestions.shopping_list.map(
                     (item, index) => (
                       <div
                         key={index}
                         className="rounded-xl border border-yellow-200 p-4 shadow-sm hover:shadow-md transition"
                       >
                         <div className="flex justify-between items-center mb-1">
                           <span className="font-semibold text-sm">
                             {item.item}
                           </span>
                           <Badge
                             variant="secondary"
                             className={`${
                               item.priority === "high"
                                 ? "bg-red-500 text-white"
                                 : item.priority === "medium"
                                 ? "bg-yellow-400 text-black"
                                 : "bg-green-400 text-black"
                             } capitalize`}
                           >
                             {item.priority}
                           </Badge>
                         </div>
       
                         <div className="text-xs ">
                           Quantité : {item.quantity} {item.unit} — Prix estimé :{" "}
                           <span className="font-medium">{item.estimated_price}€</span> 
                           {" "} / Total :{" "}
                           <span className="font-semibold ">
                             {item.total_cost}€
                           </span>
                         </div>
       
                         <div className="text-xs mt-2">
                           🏪 Fournisseur :{" "}
                           <span className="font-medium">{item.supplier_suggestion}</span>
                         </div>
       
                         <div className="text-xs italic mt-1">
                           💡 {item.reason}
                         </div>
                       </div>
                     )
                   )}
                 </div>
               </div>
       
               {/* Priorités, saisonnalité et anti-gaspillage */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-yellow-200">
                 <div className="flex items-center gap-2">
                   <Badge className="bg-red-500 text-white">Priorité</Badge>
                   <span className="text-sm ">
                     {shoppingSuggestions?.shopping_suggestions?.priority_items?.length > 0 
                       ? shoppingSuggestions.shopping_suggestions.priority_items.join(", ")
                       : "Aucun"}
                   </span>
                 </div>
                 <div className="flex items-center gap-2">
                   <Leaf className="h-4 w-4 text-green-600" />
                   <span className="text-sm ">
                     Saison :{" "}
                     {shoppingSuggestions?.shopping_suggestions?.seasonal_items?.length > 0 
                       ? shoppingSuggestions.shopping_suggestions.seasonal_items.join(", ")
                       : "Aucune"}
                   </span>
                 </div>
                 <div className="flex items-center gap-2">
                   <Trash2 className="h-4 w-4 text-red-500" />
                   <span className="text-sm ">
                     Anti-gaspillage :{" "}
                     {shoppingSuggestions?.shopping_suggestions?.anti_waste_items?.length > 0 
                       ? shoppingSuggestions.shopping_suggestions.anti_waste_items.join(", ")
                       : "Aucun"}
                   </span>
                 </div>
               </div>
       
               {/* Informations globales */}
               <div className="pt-3 border-t border-yellow-200 space-y-2 text-sm text-yellow-900">
                 <div className="flex items-center gap-2">
                   <Euro className="h-4 w-4 text-yellow-700" />
                   <strong>Budget estimé :</strong>{" "}
                   {shoppingSuggestions.shopping_suggestions.budget_estimate}€
                 </div>
       
                 <div className="flex items-center gap-2">
                   <Brain className="h-4 w-4 text-yellow-700" />
                   <strong>Modèle IA :</strong>{" "}
                   {shoppingSuggestions.shopping_suggestions.model_used}
                 </div>
       
                 <div className="text-muted-foreground text-xs leading-relaxed">
                   🧠 {shoppingSuggestions.shopping_suggestions.reasoning}
                 </div>
               </div>
       
               {/* Avertissements */}
               {shoppingSuggestions.shopping_suggestions.warnings?.length > 0 && (
                 <div className="mt-3 border-t border-yellow-200 pt-2">
                   <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-1">
                     <TriangleAlert className="h-4 w-4 text-yellow-700" />
                     Avertissements :
                   </h4>
                   <ul className="list-disc list-inside text-sm text-yellow-900 space-y-1">
                     {shoppingSuggestions.shopping_suggestions.warnings.map(
                       (warning, idx) => (
                         <li key={idx}>{warning}</li>
                       )
                     )}
                   </ul>
                 </div>
               )}
       
               {/* Alternatives */}
               {shoppingSuggestions.shopping_suggestions.alternatives?.length > 0 && (
                 <div className="mt-3 border-t border-yellow-200 pt-2">
                   <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-1">
                     <RefreshCcw className="h-4 w-4 text-yellow-700" />
                     Alternatives proposées :
                   </h4>
                   <ul className="list-disc list-inside text-sm text-yellow-900 space-y-1">
                     {shoppingSuggestions.shopping_suggestions.alternatives.map(
                       (alt, idx) => (
                         <li key={idx}>
                           <span className="font-medium">{alt.original}</span> →{" "}
                           <span className="font-medium text-yellow-800">
                             {alt.alternative}
                           </span>{" "}
                           <span className="italic text-muted-foreground">
                             ({alt.reason})
                           </span>
                         </li>
                       )
                     )}
                   </ul>
                 </div>
               )}
       
               {/* Bouton de validation manuelle */}
               {shoppingSuggestions.require_manual_validation && (
                 <div className="pt-4 border-t border-yellow-200 flex justify-end">
                   <Button onClick={handleValidation} variant="destructive">
                     Valider manuellement
                   </Button>
                 </div>
               )}
             </CardContent>
           </Card>
            )}
          </TabsContent>
          <TabsContent value="antiwaste">
            {antiWasteSuggestions && (
              <Card className="border border-red-300  shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 ">
                  <Trash2 className="h-5 w-5 text-red-500" />
                  Analyse Anti-Gaspillage
                  
                </CardTitle>
              </CardHeader>
          
              <CardContent className="space-y-4 text-sm">
                {/* Message d'erreur principal */}
                {antiWasteResults && antiWasteResults.status === "error" && (
                  <Alert variant="destructive" className="border-red-400 ">
                    <AlertCircle className="h-4 w-4 text-red-700" />
                    <AlertDescription className="text-red-800 font-medium">
                      Erreur détectée : {antiWasteResults.error}
                    </AlertDescription>
                  </Alert>
                )}
          
                {/* Liste des ingrédients critiques */}
                {antiWasteResults && antiWasteResults.critical_ingredients &&
                  antiWasteResults.critical_ingredients.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-red-700" /> Ingrédients critiques :
                      </h3>
          
                      <div className="space-y-3">
                        {antiWasteResults.critical_ingredients.map((item, index) => (
                          <div
                            key={index}
                            className="rounded-lg border border-red-200 bg-white p-3 shadow-sm hover:shadow-md transition"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-red-800">
                                {item.name}
                              </span>
                              <Badge
                                variant="destructive"
                                className="bg-red-500 text-white"
                              >
                                {item.days_until_expiry < 0
                                  ? "Périmé"
                                  : `Expire dans ${item.days_until_expiry} j`}
                              </Badge>
                            </div>
          
                            <div className="text-xs text-muted-foreground mt-1">
                              SKU : <span className="font-medium">{item.sku}</span>
                            </div>
          
                            <div className="text-sm text-muted-foreground">
                              Date d'expiration :{" "}
                              <span className="font-medium">
                                {item.expiry_date}
                              </span>
                            </div>
          
                            <div className="text-xs mt-1">
                              Quantité restante :{" "}
                              <span className="font-medium">
                                {item.quantity} {item.unit}
                              </span>
                            </div>
          
          
                            {item.days_until_expiry < 0 && (
                              <div className="text-xs mt-2 text-red-700 italic">
                                ⚠️ Cet ingrédient est déjà expiré depuis{" "}
                                {Math.abs(item.days_until_expiry)} jours.
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  


                  )}
          
                {/* Footer d’information */}
                <div className="pt-3 border-t border-red-200 text-xs text-muted-foreground">
                  Vérification effectuée par le module <strong>Anti-Gaspillage IA</strong>.
                </div>
              </CardContent>
                  

            </Card>

            
            )}
          </TabsContent>
          <TabsContent value="menu">
            {menuAvailability && (
               <Card className="border border-green-300  shadow-md mt-4">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2 text-foreground">
                   <ChefHat className="h-5 w-5 text-foreground" />
                   Analyse du Menu Disponible
                 </CardTitle>
               </CardHeader>
             
               <CardContent className="space-y-5 text-sm">
                 {/* Résumé global */}
                 <div className="rounded-lg border border-green-200  p-3 shadow-sm">
                   <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                     <BarChart3 className="h-4 w-4 text-green-700" /> Résumé du menu :
                   </h3>
                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                     <div>🍽️ Total recettes : <strong>{menuAvailability.summary.total_recipes}</strong></div>
                     <div>✅ Réalisables : <strong>{menuAvailability.summary.can_make}</strong></div>
                     <div>❌ Non réalisables : <strong>{menuAvailability.summary.cannot_make}</strong></div>
                     <div>⚠️ Partiellement dispos : <strong>{menuAvailability.summary.partially_available}</strong></div>
                     <div>📊 Taux dispo : <strong>{menuAvailability.summary.availability_rate}%</strong></div>
                   </div>
                 </div>
             
                 {/* Détails des recettes */}
                 <div>
                   <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                     <ListChecks className="h-4 w-4 text-green-700" /> Détails des recettes :
                   </h3>
                   <div className="space-y-3">
                     {menuAvailability.detailed_analysis.map((r, index) => (
                       <div
                         key={index}
                         className="rounded-lg border border-green-200  p-3 shadow-sm hover:shadow-md transition"
                       >
                         <div className="flex justify-between items-center">
                           <span className="font-semibold text-foreground">{r.recipe_name}</span>
                           <Badge
                             className={
                               r.can_make
                                 ? "bg-green-500 text-white"
                                 : r.partially_available
                                 ? "bg-yellow-400 text-black"
                                 : "bg-red-500 text-white"
                             }
                           >
                             {r.can_make ? "Disponible" : r.partially_available ? "Partiel" : "Indisponible"}
                           </Badge>
                         </div>
                         <div className="text-xs text-muted-foreground mt-1">
                           Type : <span className="font-medium">{r.recipe_type}</span> — Code :{" "}
                           <span className="font-medium">{r.recipe_code}</span>
                         </div>
                         {r.missing_ingredients.length > 0 && (
                           <div className="text-xs mt-2 text-red-600">
                             ❌ Ingrédients manquants : {r.missing_ingredients.join(", ")}
                           </div>
                         )}
                       </div>
                     ))}
                   </div>
                 </div>
             
                 {/* Optimisation et actions */}
                 {menuAvailability.optimization_suggestions && (
                   <div className="rounded-lg border border-green-200  p-3 shadow-sm space-y-3">
                     <h3 className="font-semibold text-green-900 mb-1 flex items-center gap-2">
                       <Settings className="h-4 w-4 text-green-700" /> Optimisation du menu :
                     </h3>
                     <p className="text-xs text-muted-foreground italic">
                       {menuAvailability.optimization_suggestions.optimization_strategy}
                     </p>
             
                     {/* Actions immédiates */}
                     <div>
                       <h4 className="font-medium  mb-1">⚡ Actions immédiates :</h4>
                       <ul className="list-disc list-inside text-sm text-green-900 space-y-1">
                         {menuAvailability.optimization_suggestions.immediate_actions.map((a, i) => (
                           <li key={i}>
                             <span className="font-medium">{a.action}</span> — priorité{" "}
                             <Badge
                               className={
                                 a.priority === "high"
                                   ? "bg-red-500 text-white"
                                   : a.priority === "medium"
                                   ? "bg-yellow-400 text-black"
                                   : "bg-green-400 text-black"
                               }
                             >
                               {a.priority}
                             </Badge>{" "}
                             ({a.timeframe})
                           </li>
                         ))}
                       </ul>
                     </div>
             
                     {/* Ajustements du menu */}
                     {menuAvailability.optimization_suggestions.menu_adjustments?.length > 0 && (
                       <div>
                         <h4 className="font-medium text-green-800 mb-1">📋 Ajustements du menu :</h4>
                         <ul className="list-disc list-inside text-sm text-green-900 space-y-1">
                           {menuAvailability.optimization_suggestions.menu_adjustments.map((m, i) => (
                             <li key={i}>
                               <strong>{m.recipe_name}</strong> — Recommandation :{" "}
                               <Badge className="bg-green-400 text-black">{m.recommendation}</Badge>{" "}
                               <span className="italic text-muted-foreground">({m.reason})</span>
                             </li>
                           ))}
                         </ul>
                       </div>
                     )}
             
                     {/* Priorités d'achat */}
                     {menuAvailability.optimization_suggestions.purchasing_priorities?.length > 0 && (
                       <div>
                         <h4 className="font-medium text-green-800 mb-1">🛒 Priorités d’achat :</h4>
                         <ul className="list-disc list-inside text-sm text-green-900 space-y-1">
                           {menuAvailability.optimization_suggestions.purchasing_priorities.map((p, i) => (
                             <li key={i}>
                               <strong>{p.ingredient}</strong> — urgence{" "}
                               <Badge
                                 className={
                                   p.urgency === "critique"
                                     ? "bg-red-500 text-white"
                                     : "bg-yellow-400 text-black"
                                 }
                               >
                                 {p.urgency}
                               </Badge>{" "}
                               (impact sur : {p.impact_recipes.join(", ")} — coût estimé : {p.estimated_cost}€)
                             </li>
                           ))}
                         </ul>
                       </div>
                     )}
             
                     {/* Alternatives & opportunités */}
                     <div>
                       {menuAvailability.optimization_suggestions.alternative_recipes?.length > 0 && (
                         <div>
                           <h4 className="font-medium text-green-800 mb-1">🔁 Alternatives :</h4>
                           <ul className="list-disc list-inside text-sm text-green-900 space-y-1">
                             {menuAvailability.optimization_suggestions.alternative_recipes.map((alt, i) => (
                               <li key={i}>
                                 <strong>{alt.for_recipe}</strong> → <strong>{alt.alternative}</strong>{" "}
                                 <span className="italic text-muted-foreground">({alt.reason})</span>
                               </li>
                             ))}
                           </ul>
                         </div>
                       )}
             
                       {menuAvailability.optimization_suggestions.seasonal_opportunities?.length > 0 && (
                         <div className="mt-2">
                           <h4 className="font-medium text-green-800 mb-1">🌿 Opportunités saisonnières :</h4>
                           <ul className="list-disc list-inside text-sm text-green-900 space-y-1">
                             {menuAvailability.optimization_suggestions.seasonal_opportunities.map((s, i) => (
                               <li key={i}>{s}</li>
                             ))}
                           </ul>
                         </div>
                       )}
                     </div>
             
                     {/* Recommandations globales */}
                     {menuAvailability.optimization_suggestions.recommendations?.length > 0 && (
                       <div>
                         <h4 className="font-medium  mb-1">💡 Recommandations :</h4>
                         <ul className="list-disc list-inside text-sm text-green-900 space-y-1">
                           {menuAvailability.optimization_suggestions.recommendations.map((r, i) => (
                             <li key={i}>{r}</li>
                           ))}
                         </ul>
                       </div>
                     )}
             
                     {/* Score de performance */}
                     <div className="pt-2 text-xs text-muted-foreground">
                       🔢 Score de performance :{" "}
                       <span className="font-semibold text-green-800">
                         {menuAvailability.optimization_suggestions.performance_score} / 100
                       </span>
                       {" | "}🧠 Modèle :{" "}
                       <code className="text-green-700">
                         {menuAvailability.optimization_suggestions.model_used}
                       </code>
                     </div>
                   </div>
                 )}
             
                 {/* Footer */}
                 <div className="pt-3 border-t border-green-200 text-xs text-muted-foreground">
                   Dernière mise à jour :{" "}
                   <span className="font-medium">{menuAvailability.timestamp}</span> — Auto-update :{" "}
                   {menuAvailability.auto_update_applied ? "Activé" : "Désactivé"}
                 </div>
               </CardContent>
             </Card>
            )}
          </TabsContent>
        </Tabs>
<div className="space-y-10">
   {/* Search */}
        <div className=" relative ">
          <Search className="absolute left-3 top-1 h-7 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher par nom ou code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-72"
          />
        </div>

        {/* Recipes Table */}
        <Card className="border-0   ">
          <CardContent className="p-1 border-0">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Chargement...</div>
            ) : (
              <div className="grid grid-cols-4 gap-10">
                
             
                <Card>
                  <CardContent>
                    <div className="flex flex-col justify-between">
                      <div className="relative h-32">
                      <img src="/image/salade.png" alt="" className="w-40 h-40 absolute -top-8 left-2" />
                      </div>
                      <div className="flex-col items-center justify-center">
                      <p className="text-center  font-bold"><strong>Salade et tomate au citron</strong>.</p>
                      <p className="text-center text-gray-500">Lorem ipsum dolor sit amet consectetuam nulla, possimus</p>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                          <span className="font-semibold text-xl ">
                          <span className="text-orange-600 ">17</span>,1£ </span>
                          <button className="bg-orange-600 text-white px-4 py-1 rounded-full text-sm ">Edit</button>

                      </div>
                    </div>
                  </CardContent>
                </Card>   
                <Card>
                  <CardContent>
                    <div className="flex flex-col justify-between">
                      <div className="relative h-32">
                      <img src="/image/salade.png" alt="" className="w-40 h-40 absolute -top-8 left-2" />
                      </div>
                      <div className="flex-col items-center justify-center">
                      <p className="text-center  font-bold"><strong>Salade et tomate au citron</strong>.</p>
                      <p className="text-center text-gray-500">Lorem ipsum dolor sit amet consectetuam nulla, possimus</p>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                          <span className="font-semibold text-xl ">
                          <span className="text-orange-600 ">17</span>,1£ </span>
                          <button className="bg-orange-600 text-white px-4 py-1 rounded-full text-sm ">Edit</button>

                      </div>
                    </div>
                  </CardContent>
                </Card>   
                <Card>
                  <CardContent>
                    <div className="flex flex-col justify-between">
                      <div className="relative h-32">
                      <img src="/image/salade.png" alt="" className="w-40 h-40 absolute -top-8 left-2" />
                      </div>
                      <div className="flex-col items-center justify-center">
                      <p className="text-center  font-bold"><strong>Salade et tomate au citron</strong>.</p>
                      <p className="text-center text-gray-500">Lorem ipsum dolor sit amet consectetuam nulla, possimus</p>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                          <span className="font-semibold text-xl ">
                          <span className="text-orange-600 ">17</span>,1£ </span>
                          <button className="bg-orange-600 text-white px-4 py-1 rounded-full text-sm ">Edit</button>

                      </div>
                    </div>
                  </CardContent>
                </Card>   
                <Card>
                  <CardContent>
                    <div className="flex flex-col justify-between">
                      <div className="relative h-32">
                      <img src="/image/salade.png" alt="" className="w-40 h-40 absolute -top-8 left-2" />
                      </div>
                      <div className="flex-col items-center justify-center">
                      <p className="text-center  font-bold"><strong>Salade et tomate au citron</strong>.</p>
                      <p className="text-center text-gray-500">Lorem ipsum dolor sit amet consectetuam nulla, possimus</p>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                          <span className="font-semibold text-xl ">
                          <span className="text-orange-600 ">17</span>,1£ </span>
                          <button className="bg-orange-600 text-white px-4 py-1 rounded-full text-sm ">Edit</button>

                      </div>
                    </div>
                  </CardContent>
                </Card>   
                <Card>
                  <CardContent>
                    <div className="flex flex-col justify-between">
                      <div className="relative h-32">
                      <img src="/image/salade.png" alt="" className="w-40 h-40 absolute -top-8 left-2" />
                      </div>
                      <div className="flex-col items-center justify-center">
                      <p className="text-center  font-bold"><strong>Salade et tomate au citron</strong>.</p>
                      <p className="text-center text-gray-500">Lorem ipsum dolor sit amet consectetuam amet dolor <span className="text-orange-500 underline ">voir</span></p>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                          <span className="font-semibold text-xl ">
                          <span className="text-orange-600 ">17</span>,1£ </span>
                          <button className="bg-orange-600 text-white px-4 py-1 rounded-full text-sm ">Edit</button>

                      </div>
                    </div>
                  </CardContent>
                </Card>   
                <Card>
                  <CardContent>
                    <div className="flex flex-col justify-between">
                      <div className="relative h-32">
                      <img src="/image/salade.png" alt="" className="w-40 h-40 absolute -top-8 left-2" />
                      </div>
                      <div className="flex-col items-center justify-center">
                      <p className="text-center  font-bold"><strong>Salade et tomate au citron</strong>.</p>
                      <p className="text-center text-gray-500">Lorem ipsum dolor sit amet consectetuam nulla, possimus</p>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                          <span className="font-semibold text-xl ">
                          <span className="text-orange-600 ">17</span>,1£ </span>
                          <button className="bg-orange-600 text-white px-4 py-1 rounded-full text-sm ">Edit</button>

                      </div>
                    </div>
                  </CardContent>
                </Card>   
                <Card>
                  <CardContent>
                    <div className="flex flex-col justify-between">
                      <div className="relative h-32">
                      <img src="/image/salade.png" alt="" className="w-40 h-40 absolute -top-8 left-2" />
                      </div>
                      <div className="flex-col items-center justify-center">
                      <p className="text-center  font-bold"><strong>Salade et tomate au citron</strong>.</p>
                      <p className="text-center text-gray-500">Lorem ipsum dolor sit amet consectetuam nulla, possimus</p>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                          <span className="font-semibold text-xl ">
                          <span className="text-orange-600 ">17</span>,1£ </span>
                          <button className="bg-orange-600 text-white px-4 py-1 rounded-full text-sm ">Edit</button>

                      </div>
                    </div>
                  </CardContent>
                </Card>   
                <Card>
                  <CardContent>
                    <div className="flex flex-col justify-between">
                      <div className="relative h-32">
                      <img src="/image/salade.png" alt="" className="w-40 h-40 absolute -top-8 left-2" />
                      </div>
                      <div className="flex-col items-center justify-center">
                      <p className="text-center  font-bold"><strong>Salade et tomate au citron</strong>.</p>
                      <p className="text-center text-gray-500">Lorem ipsum dolor sit amet consectetuam nulla, possimus</p>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                          <span className="font-semibold text-xl ">
                          <span className="text-orange-600 ">17</span>,1£ </span>
                          <button className="bg-orange-600 text-white px-4 py-1 rounded-full text-sm ">Edit</button>

                      </div>
                    </div>
                  </CardContent>
                </Card>
                


                

                 

              
              </div>
            )}
          </CardContent>
        </Card>
</div>
       

        {/* Create Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer Recette</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom</Label>
                  <Input
                    id="name"
                    value={newRecipe.name}
                    onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Code</Label>
                  <Input
                    id="code"
                    value={newRecipe.code}
                    onChange={(e) => setNewRecipe({ ...newRecipe, code: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipe_type">Type de Recette</Label>
                  <Select
                    value={newRecipe.recipe_type}
                    onValueChange={(value) => setNewRecipe({ ...newRecipe, recipe_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dish">Plat</SelectItem>
                      <SelectItem value="sub_recipe">Sous-recette</SelectItem>
                      <SelectItem value="dessert">Dessert</SelectItem>
                      <SelectItem value="beverage">Boisson</SelectItem>
                      <SelectItem value="anti_waste">Anti-gaspillage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Select
                    value={newRecipe.category}
                    onValueChange={(value) => setNewRecipe({ ...newRecipe, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">Entrée</SelectItem>
                      <SelectItem value="main">Principal</SelectItem>
                      <SelectItem value="side">Accompagnement</SelectItem>
                      <SelectItem value="dessert">Dessert</SelectItem>
                      <SelectItem value="sauce">Sauce</SelectItem>
                      <SelectItem value="base">Base</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="yield_quantity">Quantité Rendement</Label>
                  <Input
                    id="yield_quantity"
                    type="number"
                    value={newRecipe.yield_quantity}
                    onChange={(e) => setNewRecipe({ ...newRecipe, yield_quantity: Number.parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yield_unit">Unité Rendement</Label>
                  <Input
                    id="yield_unit"
                    value={newRecipe.yield_unit}
                    onChange={(e) => setNewRecipe({ ...newRecipe, yield_unit: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prep_time">Temps Préparation (min)</Label>
                  <Input
                    id="prep_time"
                    type="number"
                    value={newRecipe.prep_time_minutes}
                    onChange={(e) => setNewRecipe({ ...newRecipe, prep_time_minutes: Number.parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cooking_time">Temps Cuisson (min)</Label>
                  <Input
                    id="cooking_time"
                    type="number"
                    value={newRecipe.cooking_time_minutes}
                    onChange={(e) =>
                      setNewRecipe({ ...newRecipe, cooking_time_minutes: Number.parseInt(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rest_time">Temps Repos (min)</Label>
                  <Input
                    id="rest_time"
                    type="number"
                    value={newRecipe.rest_time_minutes}
                    onChange={(e) => setNewRecipe({ ...newRecipe, rest_time_minutes: Number.parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dlc_days">DLC (jours)</Label>
                  <Input
                    id="dlc_days"
                    type="number"
                    value={newRecipe.dlc_days}
                    onChange={(e) => setNewRecipe({ ...newRecipe, dlc_days: Number.parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="other_costs">Autres Coûts</Label>
                  <Input
                    id="other_costs"
                    type="number"
                    step="0.01"
                    value={newRecipe.other_costs}
                    onChange={(e) => setNewRecipe({ ...newRecipe, other_costs: Number.parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target_price">Prix Cible</Label>
                  <Input
                    id="target_price"
                    type="number"
                    step="0.01"
                    value={newRecipe.target_price}
                    onChange={(e) => setNewRecipe({ ...newRecipe, target_price: Number.parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Ingrédients</h3>
                  <div className="flex gap-2">
                    <Select 
                      value={selectedProduct} 
                      onValueChange={(value) => {
                        const product = inventoryProducts.find(p => p.id === value)
                        if (product) {
                          addIngredient(product)
                        }
                      }}
                    >
                      <SelectTrigger className="w-[250px]">
                        <SelectValue placeholder="Sélectionner un produit" />
                      </SelectTrigger>
                      <SelectContent>
                        {inventoryProducts.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} ({product.sku || 'N/A'})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                  </div>
                </div>
                {newRecipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-4">
                      <Input
                        placeholder="Nom de l'ingrédient"
                        value={ingredient.name}
                        onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Quantité"
                        value={ingredient.quantity}
                        onChange={(e) => updateIngredient(index, 'quantity', Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        placeholder="Unité (g, ml, etc.)"
                        value={ingredient.unit}
                        onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                      />
                    </div>
                    <div className="col-span-3">
                      <div className="relative">
                        <span className="absolute left-3 top-2">€</span>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Prix unitaire"
                          value={ingredient.cost_per_unit}
                          onChange={(e) => updateIngredient(index, 'cost_per_unit', Number.parseFloat(e.target.value) || 0)}
                          className="pl-8"
                          disabled={ingredient.product_id !== null} // Désactiver si c'est un produit de l'inventaire
                        />
                        {ingredient.product_id && (
                          <span className="absolute right-3 top-2 text-xs text-muted-foreground">
                            Prix fixe
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => removeIngredient(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="steps">Étapes (une par ligne)</Label>
                <Textarea
                  id="steps"
                  value={newRecipe.instructions.steps.join("\n")}
                  onChange={(e) => handleInstructionsChange("steps", e.target.value, setNewRecipe, newRecipe)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newRecipe.instructions.notes}
                  onChange={(e) => handleInstructionsChange("notes", e.target.value, setNewRecipe, newRecipe)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tips">Astuces</Label>
                <Textarea
                  id="tips"
                  value={newRecipe.instructions.tips}
                  onChange={(e) => handleInstructionsChange("tips", e.target.value, setNewRecipe, newRecipe)}
                  rows={2}
                />
              </div>

              

             
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Annuler
              </Button>
              <Button className="bg-sky-500 text-white" onClick={createRecipe}>Créer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        {selectedRecipe && (
          <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Modifier Recette</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_name">Nom</Label>
                    <Input
                      id="edit_name"
                      value={selectedRecipe.name}
                      onChange={(e) => setSelectedRecipe({ ...selectedRecipe, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_code">Code</Label>
                    <Input
                      id="edit_code"
                      value={selectedRecipe.code}
                      onChange={(e) => setSelectedRecipe({ ...selectedRecipe, code: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_recipe_type">Type de Recette</Label>
                    <Select
                      value={selectedRecipe.recipe_type}
                      onValueChange={(value) => setSelectedRecipe({ ...selectedRecipe, recipe_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dish">Plat</SelectItem>
                        <SelectItem value="sub_recipe">Sous-recette</SelectItem>
                        <SelectItem value="dessert">Dessert</SelectItem>
                        <SelectItem value="beverage">Boisson</SelectItem>
                        <SelectItem value="anti_waste">Anti-gaspillage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_category">Catégorie</Label>
                    <Select
                      value={selectedRecipe.category}
                      onValueChange={(value) => setSelectedRecipe({ ...selectedRecipe, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="starter">Entrée</SelectItem>
                        <SelectItem value="main">Principal</SelectItem>
                        <SelectItem value="side">Accompagnement</SelectItem>
                        <SelectItem value="dessert">Dessert</SelectItem>
                        <SelectItem value="sauce">Sauce</SelectItem>
                        <SelectItem value="base">Base</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_yield_quantity">Quantité Rendement</Label>
                    <Input
                      id="edit_yield_quantity"
                      type="number"
                      value={selectedRecipe.yield_quantity}
                      onChange={(e) =>
                        setSelectedRecipe({ ...selectedRecipe, yield_quantity: Number.parseFloat(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_yield_unit">Unité Rendement</Label>
                    <Input
                      id="edit_yield_unit"
                      value={selectedRecipe.yield_unit}
                      onChange={(e) => setSelectedRecipe({ ...selectedRecipe, yield_unit: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_prep_time">Temps Préparation (min)</Label>
                    <Input
                      id="edit_prep_time"
                      type="number"
                      value={selectedRecipe.prep_time_minutes}
                      onChange={(e) =>
                        setSelectedRecipe({ ...selectedRecipe, prep_time_minutes: Number.parseInt(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_cooking_time">Temps Cuisson (min)</Label>
                    <Input
                      id="edit_cooking_time"
                      type="number"
                      value={selectedRecipe.cooking_time_minutes}
                      onChange={(e) =>
                        setSelectedRecipe({ ...selectedRecipe, cooking_time_minutes: Number.parseInt(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_rest_time">Temps Repos (min)</Label>
                    <Input
                      id="edit_rest_time"
                      type="number"
                      value={selectedRecipe.rest_time_minutes || 0}
                      onChange={(e) =>
                        setSelectedRecipe({ ...selectedRecipe, rest_time_minutes: Number.parseInt(e.target.value) })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_dlc_days">DLC (jours)</Label>
                    <Input
                      id="edit_dlc_days"
                      type="number"
                      value={selectedRecipe.dlc_days}
                      onChange={(e) =>
                        setSelectedRecipe({ ...selectedRecipe, dlc_days: Number.parseInt(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_other_costs">Autres Coûts</Label>
                    <Input
                      id="edit_other_costs"
                      type="number"
                      step="0.01"
                      value={selectedRecipe.other_costs || 0}
                      onChange={(e) =>
                        setSelectedRecipe({ ...selectedRecipe, other_costs: Number.parseFloat(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_target_price">Prix Cible</Label>
                    <Input
                      id="edit_target_price"
                      type="number"
                      step="0.01"
                      value={selectedRecipe.target_price || 0}
                      onChange={(e) =>
                        setSelectedRecipe({ ...selectedRecipe, target_price: Number.parseFloat(e.target.value) })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_steps">Étapes (une par ligne)</Label>
                  <Textarea
                    id="edit_steps"
                    value={selectedRecipe?.instructions?.steps?.join("\n") || ""}
                    onChange={(e) =>
                      handleInstructionsChange("steps", e.target.value, setSelectedRecipe, selectedRecipe)
                    }
                    rows={5}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_notes">Notes</Label>
                  <Textarea
                    id="edit_notes"
                    value={selectedRecipe?.instructions?.notes || ""}
                    onChange={(e) =>
                      handleInstructionsChange("notes", e.target.value, setSelectedRecipe, selectedRecipe)
                    }
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_tips">Astuces</Label>
                  <Textarea
                    id="edit_tips"
                    value={selectedRecipe?.instructions?.tips || ""}
                    onChange={(e) =>
                      handleInstructionsChange("tips", e.target.value, setSelectedRecipe, selectedRecipe)
                    }
                    rows={2}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit_is_validated"
                    checked={selectedRecipe.is_validated}
                    onCheckedChange={(checked) => setSelectedRecipe({ ...selectedRecipe, is_validated: checked })}
                  />
                  <Label htmlFor="edit_is_validated">Validée</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Annuler
                </Button>
                <Button onClick={updateRecipe}>Sauvegarder</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* AI Results Display */}
      

      </div>
    </div>
  )
}

export default Recipe
