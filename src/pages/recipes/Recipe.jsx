import React, { useState, useEffect } from "react";
import { AiOutlineSetting } from "react-icons/ai";
import { BiFork } from "react-icons/bi";
import {
  Plus,
  BarChart3,
  Edit,
  Trash2,
  Search,
  AlertCircle,
  ChefHat,
  ShoppingCart,
  Recycle,
  MenuIcon,
  ListChecks,
  Settings,
  FileText,
  Clock,
  Calculator,
  Star,
  Activity,
  Loader2,
  Wand2,
  Brain,
  TriangleAlert,
  RefreshCcw,
  Euro,
  Leaf,
  List,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "react-hot-toast";

const API_HOST = "http://localhost:8120/api/v1";
const TOKEN_KEY = "access_token";

const Recipe = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [inventoryProducts, setInventoryProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
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
    photo_url: "",
  });
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [stats, setStats] = useState(null);
  const [kitchenAnalysis, setKitchenAnalysis] = useState(null);
  const [shoppingSuggestions, setShoppingSuggestions] = useState(null);
  const [antiWasteResults, setAntiWasteResults] = useState(null);
  const [menuAvailability, setMenuAvailability] = useState(null);
  const [showAIGenerateModal, setShowAIGenerateModal] = useState(false);
  const [aiGenerationParams, setAIGenerationParams] = useState({
    recipe_name: "",
    portions: 1,
    cuisine_type: "",
    dietary_restrictions: [""],
    max_cost: 0
  });
  
  // États pour la gestion de la génération IA
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [recipeDetails, setRecipeDetails] = useState(null);
  const [showRecipeDetails, setShowRecipeDetails] = useState(false);
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
  };

  const [aiGeneratedRecipe, setAIGeneratedRecipe] = useState(null);
  const [showAIPreview, setShowAIPreview] = useState(false);

  const generateRecipeWithAI = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      // Nettoyer les restrictions vides
      const cleanParams = {
        ...aiGenerationParams,
        dietary_restrictions: aiGenerationParams.dietary_restrictions.filter(r => r.trim() !== '')
      };

      const response = await fetch(`${API_HOST}/recipes/generate-ai`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(cleanParams)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la génération de la recette');
      }
      
      if (data.success) {
        setAIGeneratedRecipe(data);
        setShowAIGenerateModal(false);
        toast.success('Recette générée avec succès !');
      } else {
        throw new Error(data.message || 'Erreur lors de la génération de la recette');
      }
    } catch (err) {
      console.error('Erreur lors de la génération de la recette:', err);
      setError(err.message);
      toast.error(`Erreur: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const getHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchRecipes = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await fetch(`${API_HOST}/recipes?${queryParams}`, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch recipes");
      const data = await response.json();
      setRecipes(data.items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipeDetails = async (recipeId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_HOST}/recipes/${recipeId}`, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch recipe details");
      const data = await response.json();
      setRecipeDetails(data);
      setShowRecipeDetails(true);
    } catch (err) {
      setError(err.message);
      toast.error("Erreur lors du chargement des détails de la recette");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_HOST}/recipes/stats/summary`, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setStats(mockStats);
    }
  };

  const analyzeKitchen = async () => {
    try {
      const response = await fetch(`${API_HOST}/recipes/analyze/kitchen-situation?deep_analysis=true`, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error("Failed to analyze kitchen");
      const data = await response.json();
      setKitchenAnalysis(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const suggestShopping = async () => {
    try {
      const response = await fetch(
        `${API_HOST}/recipes/suggest/shopping-list?priorities=urgent&priorities=popular`,
        {
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error("Failed to suggest shopping");
      const data = await response.json();
      setShoppingSuggestions(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleValidation = async () => {
    if (!shoppingSuggestions) return;
    try {
      const response = await fetch(`${API_HOST}/recipes/validate-shopping-suggestions`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          recipe_id: selectedRecipe?.id,
          validation_timestamp: new Date().toISOString(),
        }),
      });
      if (!response.ok) {
        throw new Error("Échec de la validation des suggestions d'achat");
      }
      setShoppingSuggestions((prev) => ({
        ...prev,
        require_manual_validation: false,
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
      if (response.ok) {
        if (data.success) {
          setAIGeneratedRecipe(data);
          setShowAIPreview(true);
        } else if (data.status === "error" && data.critical_ingredients) {
          setAntiWasteResults({
            status: "error",
            error: data.error || "Échec de l'analyse anti-gaspillage",
            critical_ingredients: data.critical_ingredients.map((item) => ({
              id: item.id || `item-${Math.random().toString(36).substr(2, 9)}`,
              sku: item.sku || "N/A",
              name: item.name || "Ingrédient inconnu",
              quantity: item.quantity || 0,
              unit: item.unit || "unité",
              expiry_date: item.expiry_date || new Date().toISOString().split("T")[0],
              days_until_expiry: item.days_until_expiry || 0,
            })),
          });
          toast.error(data.error || "Erreur lors de l'analyse anti-gaspillage");
        } else {
          throw new Error(data.error || "Échec de l'analyse anti-gaspillage");
        }
      } else {
        setAntiWasteResults(data);
        toast.success("Suggestions anti-gaspillage chargées avec succès");
      }
    } catch (err) {
      console.error("Erreur dans suggestAntiWaste:", err);
      setError(err.message || "Une erreur est survenue lors de l'analyse anti-gaspillage");
      setAntiWasteResults({
        status: "error",
        error: err.message || "Une erreur est survenue",
        critical_ingredients: [],
      });
      toast.error(err.message || "Erreur lors de l'analyse anti-gaspillage");
    } finally {
      setLoading(false);
    }
  };

  const analyzeMenu = async () => {
    try {
      const response = await fetch(`${API_HOST}/recipes/analyze/menu-availability?auto_update=false`, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error("Failed to analyze menu");
      const data = await response.json();
      setMenuAvailability(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const createRecipe = async () => {
    try {
      // Create a new FormData object
      const formData = new FormData();

      // Prepare the recipe data
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
        photo_url: newRecipe.photo_url ? "file" : "", // Indicate if a file is included
        video_url: newRecipe.video_url || "",
        code: newRecipe.code || "",
        other_costs: Number(newRecipe.other_costs) || 0,
        haccp_points: newRecipe.haccp_points || {},
        instructions: newRecipe.instructions || { steps: [], notes: "", tips: "" },
        ingredients: (newRecipe.ingredients || []).map((ingredient) => ({
          inventory_item_id: ingredient.product_id || "",
          quantity: Number(ingredient.quantity) || 1,
          unit: ingredient.unit || "unit",
          quantity_gross: 1,
          quantity_net: 1,
          is_optional: false,
          notes: "",
          inventory_sku: ingredient.sku || "",
          inventory_name: ingredient.name || "",
          inventory_unit_cost: Number(ingredient.cost_per_unit) || 0,
          inventory_unit: ingredient.unit || "unit",
        })),
        sub_recipes: newRecipe.sub_recipes || [],
        is_validated: newRecipe.is_validated || false,
      };

      // Append each field individually
      formData.append("name", newRecipe.name || "");
      formData.append("code", newRecipe.code || "");
      formData.append("recipe_type", newRecipe.recipe_type || "dish");
      formData.append("category", newRecipe.category || "main");
      formData.append("yield_quantity", String(newRecipe.yield_quantity) || "1");
      formData.append("yield_unit", newRecipe.yield_unit || "portion");
      formData.append("prep_time_minutes", String(newRecipe.prep_time_minutes) || "0");
      formData.append("cooking_time_minutes", String(newRecipe.cooking_time_minutes) || "0");
      formData.append("rest_time_minutes", String(newRecipe.rest_time_minutes) || "0");
      formData.append("dlc_days", String(newRecipe.dlc_days) || "3");
      formData.append("storage_temp", newRecipe.storage_temp || "");
      formData.append("target_price", String(newRecipe.target_price) || "0");
      formData.append("other_costs", String(newRecipe.other_costs) || "0");
      formData.append("is_validated", String(newRecipe.is_validated || false));
      
      // Append ingredients as individual fields
      newRecipe.ingredients.forEach((ingredient, index) => {
        formData.append(`ingredients[${index}][name]`, ingredient.name || "");
        formData.append(`ingredients[${index}][product_id]`, ingredient.product_id || "");
        formData.append(`ingredients[${index}][sku]`, ingredient.sku || "");
        formData.append(`ingredients[${index}][batch_number]`, ingredient.batch_number || "");
        formData.append(`ingredients[${index}][quantity]`, String(ingredient.quantity) || "0");
        formData.append(`ingredients[${index}][unit]`, ingredient.unit || "");
        formData.append(`ingredients[${index}][cost_per_unit]`, String(ingredient.cost_per_unit) || "0");
        formData.append(`ingredients[${index}][expiry_date]`, ingredient.expiry_date || "");
        formData.append(`ingredients[${index}][supplier_code]`, ingredient.supplier_code || "");
        formData.append(`ingredients[${index}][location]`, ingredient.location || "");
        formData.append(`ingredients[${index}][is_active]`, String(ingredient.is_active !== false));
      });
      
      // Append instructions
      formData.append("instructions[steps]", JSON.stringify(newRecipe.instructions.steps || []));
      formData.append("instructions[notes]", newRecipe.instructions.notes || "");
      formData.append("instructions[tips]", newRecipe.instructions.tips || "");
      
      // Append sub_recipes if any
      if (newRecipe.sub_recipes && newRecipe.sub_recipes.length > 0) {
        newRecipe.sub_recipes.forEach((subRecipe, index) => {
          formData.append(`sub_recipes[${index}]`, subRecipe);
        });
      }

      // Handle the image file if it exists
      if (newRecipe.photo_url && newRecipe.photo_url.startsWith("data:")) {
        // Convert the base64 image (data URL) to a Blob
        const response = await fetch(newRecipe.photo_url);
        const blob = await response.blob();

        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (blob.size > maxSize) {
          throw new Error("L'image dépasse la taille maximale de 5MB");
        }

        const fileName = `recipe_image_${Date.now()}.jpg`; // Generate a unique file name
        formData.append("imagefile", blob, fileName);
      }

      // Make the POST request
      const response = await fetch(`${API_HOST}/recipes/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}`, // Only include Authorization header
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Échec de la création de la recette");
      }

      const data = await response.json();
      setRecipes([...recipes, data]);
      setShowCreateModal(false);
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
        is_validated: false,
        photo_url: "", // Reset photo_url
      });
      toast.success("Recette créée avec succès");
    } catch (err) {
      console.error("Erreur lors de la création de la recette:", err);
      setError(err.message || "Une erreur est survenue lors de la création de la recette");
      toast.error(err.message || "Erreur lors de la création de la recette");
    }
  };

  const updateRecipe = async () => {
    try {
      const response = await fetch(`${API_HOST}/recipes/${selectedRecipe.id}`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(selectedRecipe),
      });
      if (!response.ok) throw new Error("Failed to update recipe");
      const data = await response.json();
      setRecipes(recipes.map((r) => (r.id === data.id ? data : r)));
      setShowEditModal(false);
      toast.success("Recette mise à jour avec succès");
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Erreur lors de la mise à jour de la recette");
    }
  };

  const deleteRecipe = async (id) => {
    try {
      const response = await fetch(`${API_HOST}/recipes/${id}?permanent=false`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error("Failed to delete recipe");
      setRecipes(recipes.filter((r) => r.id !== id));
      toast.success("Recette supprimée avec succès");
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Erreur lors de la suppression de la recette");
    }
  };

  const toggleActive = async (id) => {
    try {
      const response = await fetch(`${API_HOST}/recipes/${id}/toggle-active`, {
        method: "POST",
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error("Failed to toggle active");
      const data = await response.json();
      setRecipes(recipes.map((r) => (r.id === id ? { ...r, is_active: data.is_active } : r)));
      toast.success("Statut de la recette mis à jour");
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Erreur lors de la mise à jour du statut");
    }
  };

  const calculateCost = async (id) => {
    try {
      const response = await fetch(`${API_HOST}/recipes/${id}/calculate-cost`, {
        method: "POST",
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error("Failed to calculate cost");
      const data = await response.json();
      setRecipes(
        recipes.map((r) =>
          r.id === id ? { ...r, food_cost: data.food_cost, total_cost: data.total_cost } : r
        )
      );
      toast.success("Coût calculé avec succès");
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Erreur lors du calcul du coût");
    }
  };

  const improveRecipe = async (id, goal = "cost") => {
    // Vérification des paramètres
    if (!id) {
      const msg = "ID de recette manquant";
      setError(msg);
      toast.error(msg);
      return;
    }
  
    // Optionnel : valider que goal est "cost", "quality" ou "speed"
    const validGoals = ["cost", "quality", "speed"];
    if (!validGoals.includes(goal)) {
      const msg = "Objectif invalide. Utilisez : cost, quality, speed";
      setError(msg);
      toast.error(msg);
      return;
    }
  
    try {
      const response = await fetch(`${API_HOST}/api/v1/recipes/${id}/improve`, {
        method: "POST",
        headers: {
          ...getHeaders(),
          "Content-Type": "application/json",
        },
        // Envoi direct de la string "cost", "quality", etc.
        body: JSON.stringify(goal),
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur ${response.status}`);
      }
  
      // Succès
      await fetchRecipes();
      toast.success(`Recette optimisée pour : ${goal} !`);
  
    } catch (err) {
      const errorMsg = err.message || "Erreur lors de l'optimisation";
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const exportSheet = async (id) => {
    try {
      const response = await fetch(`${API_HOST}/recipes/${id}/technical-sheet`, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error("Failed to export sheet");
      const data = await response.json();
      console.log("Technical Sheet:", data);
      toast.success("Fiche technique exportée avec succès");
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Erreur lors de l'exportation de la fiche technique");
    }
  };

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    if (token) {
      fetchRecipes({ is_active: true });
      fetchStats();
      const fetchInventoryProducts = async () => {
        try {
          const response = await fetch(`${API_HOST}/inventory/items`, {
            headers: getHeaders(),
          });
          if (!response.ok) throw new Error("Échec du chargement des produits de l'inventaire");
          const data = await response.json();
          const formattedProducts = data.items.map((item) => ({
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
            is_expired: item.is_expired,
          }));
          setInventoryProducts(formattedProducts);
        } catch (err) {
          console.error("Error fetching inventory products:", err);
          setError("Erreur lors du chargement des produits de l'inventaire");
          toast.error("Erreur lors du chargement des produits de l'inventaire");
        }
      };
      fetchInventoryProducts();
    } else {
      setError("No access token found. Please login.");
      setLoading(false);
      toast.error("Veuillez vous connecter pour accéder aux recettes");
    }
  }, []);

  const filteredRecipes = recipes.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInstructionsChange = (field, value, setter, current) => {
    setter({
      ...current,
      instructions: {
        ...current.instructions,
        [field]: field === "steps" ? value.split("\n").filter(Boolean) : value,
      },
    });
  };

  const addIngredient = (product = null) => {
    if (product) {
      // Vérifier si le produit existe déjà dans les ingrédients
      const existingIngredientIndex = newRecipe.ingredients.findIndex(
        (ing) => ing.product_id === product.id && ing.batch_number === product.batch_number
      );

      if (existingIngredientIndex >= 0) {
        // Si le produit avec le même numéro de lot existe déjà, on met à jour la quantité
        const updatedIngredients = [...newRecipe.ingredients];
        updatedIngredients[existingIngredientIndex] = {
          ...updatedIngredients[existingIngredientIndex],
          quantity: (parseFloat(updatedIngredients[existingIngredientIndex].quantity) || 0) + 1,
        };
        setNewRecipe({ ...newRecipe, ingredients: updatedIngredients });
      } else {
        // Sinon, on ajoute un nouvel ingrédient avec les détails du lot
        setNewRecipe({
          ...newRecipe,
          ingredients: [
            ...newRecipe.ingredients,
            {
              id: `${product.id}-${Date.now()}`,
              name: product.name,
              product_id: product.id,
              sku: product.sku,
              batch_number: product.batch_number || `LOT-${Date.now()}`,
              quantity: 1,
              unit: product.unit || "unité",
              cost_per_unit: product.cost_price || 0,
              expiry_date: product.expiry_date || null,
              reception_date: new Date().toISOString().split('T')[0],
              supplier_code: product.supplier_code || "",
              location: product.location || "",
              is_active: true,
            },
          ],
        });
      }
      setSelectedProduct("");
    } else {
      // Ajout d'un nouvel ingrédient manuel (sans produit de l'inventaire)
      setNewRecipe({
        ...newRecipe,
        ingredients: [
          ...newRecipe.ingredients,
          {
            id: `manual-${Date.now()}`,
            name: "",
            product_id: null,
            sku: "",
            batch_number: `LOT-${Date.now()}`,
            quantity: 0,
            unit: "g",
            cost_per_unit: 0,
            expiry_date: null,
            reception_date: new Date().toISOString().split('T')[0],
            supplier_code: "",
            location: "",
            is_active: true,
          },
        ],
      });
    }
  };

  const updateIngredient = (index, field, value) => {
    const updatedIngredients = [...newRecipe.ingredients];
    
    // Gestion spéciale pour les champs numériques
    if (['quantity', 'cost_per_unit'].includes(field)) {
      // S'assurer que la valeur est un nombre valide
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        updatedIngredients[index] = { 
          ...updatedIngredients[index], 
          [field]: numValue 
        };
      }
    } 
    // Gestion spéciale pour la date d'expiration
    else if (field === 'expiry_date') {
      updatedIngredients[index] = { 
        ...updatedIngredients[index], 
        expiry_date: value || null 
      };
    }
    // Gestion standard pour les autres champs
    else {
      updatedIngredients[index] = { 
        ...updatedIngredients[index], 
        [field]: value 
      };
    }
    
    setNewRecipe({ ...newRecipe, ingredients: updatedIngredients });
  };

  const removeIngredient = (index) => {
    const updatedIngredients = newRecipe.ingredients.filter((_, i) => i !== index);
    setNewRecipe({ ...newRecipe, ingredients: updatedIngredients });
  };

  // Fonction pour formater la DLC
  const formatDLCDays = (days) => {
    if (!days) return 'Non spécifiée';
    if (days === 1) return '1 jour';
    return `${days} jours`;
  };

  // Composant de la modale des détails de la recette
  const [isImproving, setIsImproving] = useState(false);
  const [improvedRecipe, setImprovedRecipe] = useState(null);
  const [showImprovedVersion, setShowImprovedVersion] = useState(false);

  const handleImproveRecipe = async () => {
    if (!recipeDetails?.id) return;
    
    setIsImproving(true);
    setImprovedRecipe(null);
    setShowImprovedVersion(false);
    
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await fetch(`${API_HOST}/recipes/${recipeDetails.id}/improve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
       
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Échec de l\'amélioration de la recette');
      }
      
      const data = await response.json();
      
      // Formater les données pour correspondre à la structure attendue
      const formattedImprovedRecipe = {
        ...data.improved,
        recipe_type: recipeDetails.recipe_type,
        yield_quantity: data.improved.portions,
        yield_unit: 'portion',
        instructions: {
          steps: data.improved.steps || [],
          tips: data.message || ''
        },
        ingredients: data.improved.ingredients.map(ing => ({
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          cost_per_unit: ing.cost / (ing.quantity || 1),
          cost: ing.cost
        })),
        cost_per_portion: data.improved.food_cost,
        target_price: data.improved.target_price,
        margin: data.improved.margin,
        optimization: data.optimization,
        model_used: data.model_used
      };
      
      setImprovedRecipe(formattedImprovedRecipe);
      setShowImprovedVersion(true);
      
      toast.success(data.message || 'Recette améliorée avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'amélioration de la recette:', error);
      toast.error(error.message || 'Erreur lors de l\'amélioration de la recette');
    } finally {
      setIsImproving(false);
    }
  };

  const RecipeDetailsModal = () => {
    if (!recipeDetails) return null;
    
    const displayRecipe = showImprovedVersion && improvedRecipe ? improvedRecipe : recipeDetails;
    
    return (
      <Dialog open={showRecipeDetails} onOpenChange={setShowRecipeDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <DialogTitle className="text-2xl font-bold">
                {displayRecipe.name}
                {showImprovedVersion && improvedRecipe && (
                  <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">
                    Version améliorée
                  </Badge>
                )}
              </DialogTitle>
              <Button 
                variant="outline" 
                onClick={handleImproveRecipe}
                disabled={isImproving}
                className="flex items-center gap-2"
              >
                {isImproving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Amélioration en cours...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    Améliorer avec l'IA
                  </>
                )}
              </Button>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Type: {recipeDetails.recipe_type || 'Non spécifié'}</span>
              <span>•</span>
              <span>Catégorie: {recipeDetails.category || 'Non spécifiée'}</span>
              <span>•</span>
              <span>Portions: {recipeDetails.yield_quantity || 1} {recipeDetails.yield_unit || 'portion'}</span>
            </div>
          </DialogHeader>
          
          {showImprovedVersion && improvedRecipe && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <RefreshCcw className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Voici la version améliorée de votre recette. Vous pouvez comparer avec l'originale.
              </AlertDescription>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-auto -mr-2 -mt-2 text-green-600 hover:text-green-700"
                onClick={() => setShowImprovedVersion(false)}
              >
                Voir la version originale
              </Button>
            </Alert>
          )}
          
          {!showImprovedVersion && improvedRecipe && (
            <Alert className="mb-4 bg-blue-50 border-blue-200">
              <Eye className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Vous consultez la version originale de la recette.
              </AlertDescription>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-auto -mr-2 -mt-2 text-blue-600 hover:text-blue-700"
                onClick={() => setShowImprovedVersion(true)}
              >
                Voir la version améliorée
              </Button>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {displayRecipe.optimization && (
                <div className="space-y-2 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <Wand2 className="h-4 w-4" />
                    <span className="font-medium">Optimisation :</span>
                    <Badge variant="outline" className="ml-1">
                      {displayRecipe.optimization}
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-2">
                      (Modèle: {displayRecipe.model_used || 'N/A'})
                    </span>
                  </div>
                  {displayRecipe.margin !== undefined && (
                    <div className="text-sm">
                      <span className="font-medium">Marge : </span>
                      <span>{(displayRecipe.margin * 100).toFixed(0)}%</span>
                    </div>
                  )}
                </div>
              )}
              <div className="space-y-2">
                <h3 className="font-semibold">Informations</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Coût par portion</p>
                    <p className="font-medium">
                      {typeof displayRecipe.cost_per_portion === 'number' 
                        ? displayRecipe.cost_per_portion.toFixed(2) 
                        : '0.00'} €
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Prix cible</p>
                    <p className="font-medium">
                      {typeof displayRecipe.target_price === 'number' 
                        ? displayRecipe.target_price.toFixed(2) 
                        : '0.00'} €
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Temps de préparation</p>
                    <p>{displayRecipe.prep_time_minutes || 0} minutes</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Temps de cuisson</p>
                    <p>{recipeDetails.cooking_time_minutes || 0} minutes</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Coût par portion</p>
                    <p>{recipeDetails.cost_per_portion ? `${recipeDetails.cost_per_portion} €` : 'Non spécifié'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">DLC</p>
                    <p>{recipeDetails.formatted_dlc || formatDLCDays(recipeDetails.dlc_days)}</p>
                  </div>
                </div>
              </div>

              {displayRecipe.instructions?.steps?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Étapes de préparation</h3>
                  <ol className="list-decimal pl-5 space-y-2">
                    {displayRecipe.instructions.steps.map((step, index) => (
                      <li key={index} className="text-sm">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {recipeDetails.instructions?.tips && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Astuces</h3>
                  <p className="text-sm">{recipeDetails.instructions.tips}</p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Ingrédients</h3>
                  {displayRecipe.optimization && (
                    <Badge variant="outline" className="text-xs">
                      Coût total : {
                        displayRecipe.ingredients?.reduce((sum, ing) => {
                          const cost = typeof ing.cost === 'number' ? ing.cost : 0;
                          return sum + cost;
                        }, 0).toFixed(2)
                      } €
                    </Badge>
                  )}
                </div>
                {displayRecipe.ingredients?.length > 0 ? (
                  <ul className="space-y-2">
                    {displayRecipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded">
                        <div>
                          <span className="font-medium">{ingredient.quantity || 0} {ingredient.unit || ''} {ingredient.name || ''}</span>
                          {ingredient.cost_per_unit !== undefined && (
                            <span className="text-xs text-muted-foreground ml-2">
                              ({
                                typeof ingredient.cost_per_unit === 'number' 
                                  ? ingredient.cost_per_unit.toFixed(2)
                                  : '0.00'
                              }€/{ingredient.unit || 'unité'})
                            </span>
                          )}
                        </div>
                        {ingredient.cost !== undefined && (
                          <span className="font-medium">
                            {typeof ingredient.cost === 'number' 
                              ? ingredient.cost.toFixed(2) 
                              : '0.00'} €
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucun ingrédient</p>
                )}
              </div>

              {recipeDetails.sub_recipes?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Sous-recettes</h3>
                  <ul className="space-y-1">
                    {recipeDetails.sub_recipes.map((subRecipe, index) => (
                      <li key={index} className="text-sm">
                        {subRecipe.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="flex justify-between items-center gap-2 mt-6">
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={async () => {
                  if (window.confirm('Êtes-vous sûr de vouloir supprimer cette recette ?')) {
                    try {
                      const response = await fetch(`${API_HOST}/recipes/${recipeDetails.id}`, {
                        method: 'DELETE',
                        headers: getHeaders(),
                      });
                      if (!response.ok) throw new Error('Échec de la suppression');
                      toast.success('Recette supprimée avec succès');
                      setShowRecipeDetails(false);
                      fetchRecipes({ is_active: true });
                    } catch (error) {
                      toast.error(error.message || 'Erreur lors de la suppression');
                    }
                  }
                }}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </Button>
              
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const response = await fetch(`${API_HOST}/recipes/${recipeDetails.id}/toggle-active`, {
                      method: 'POST',
                      headers: getHeaders(),
                    });
                    if (!response.ok) throw new Error('Échec du changement de statut');
                    const data = await response.json();
                    toast.success(`Recette ${data.is_active ? 'activée' : 'désactivée'} avec succès`);
                    setRecipeDetails({ ...recipeDetails, is_active: data.is_active });
                    fetchRecipes({ is_active: true });
                  } catch (error) {
                    toast.error(error.message || 'Erreur lors du changement de statut');
                  }
                }}
                className="flex items-center gap-2"
              >
                <Activity className="h-4 w-4" />
                {recipeDetails.is_active ? 'Désactiver' : 'Activer'}
              </Button>
              
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const response = await fetch(`${API_HOST}/recipes/${recipeDetails.id}/calculate-cost`, {
                      method: 'POST',
                      headers: getHeaders(),
                    });
                    if (!response.ok) throw new Error('Échec du calcul du coût');
                    const data = await response.json();
                    toast.success('Coût calculé avec succès');
                    setRecipeDetails({ 
                      ...recipeDetails, 
                      food_cost: data.food_cost,
                      total_cost: data.total_cost,
                      cost_per_portion: data.cost_per_portion
                    });
                    fetchRecipes({ is_active: true });
                  } catch (error) {
                    toast.error(error.message || 'Erreur lors du calcul du coût');
                  }
                }}
                className="flex items-center gap-2"
              >
                <Calculator className="h-4 w-4" />
                Calculer le coût
              </Button>
            </div>
            
            <Button variant="outline" onClick={() => setShowRecipeDetails(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // Composant pour afficher l'aperçu de la recette générée par IA
  const AIGeneratedPreview = ({ recipe, onClose, onCreate }) => {
    if (!recipe) return null;
    
    return (
      <Dialog open={!!recipe} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {recipe.data.name}
              <Badge variant="outline" className="ml-2">
                Généré par IA
              </Badge>
            </DialogTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Type: {recipe.data.recipe_type || 'Non spécifié'}</span>
              <span>•</span>
              <span>Catégorie: {recipe.data.category || 'Non spécifiée'}</span>
              <span>•</span>
              <span>Portions: {recipe.data.portions || 1}</span>
            </div>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <Wand2 className="h-4 w-4" />
                  <span>Généré avec {recipe.model_used}</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Coût des ingrédients</p>
                    <p className="font-medium">{recipe.data.food_cost?.toFixed(2)} €</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Prix de vente suggéré</p>
                    <p className="font-medium">{recipe.data.sale_price?.toFixed(2)} €</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Marge brute</p>
                    <p className="font-medium">{recipe.data.margin?.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Étapes de préparation</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  {recipe.data.steps?.map((step, index) => (
                    <li key={index} className="text-sm">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-semibold">Ingrédients</h3>
                <ul className="space-y-2">
                  {recipe.data.ingredients?.map((ingredient, index) => (
                    <li key={index} className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">
                          {ingredient.quantity} {ingredient.unit} {ingredient.name}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({ingredient.category})
                        </span>
                      </div>
                      <span className="font-medium">
                        {(ingredient.quantity * ingredient.unit_price).toFixed(2)} €
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => {
                // Copier les données dans le formulaire de création
                setNewRecipe({
                  name: recipe.data.name,
                  code: recipe.data.code,
                  recipe_type: recipe.data.recipe_type,
                  category: recipe.data.category,
                  yield_quantity: recipe.data.portions,
                  yield_unit: 'portion',
                  prep_time_minutes: recipe.data.prep_time || 0,
                  cooking_time_minutes: recipe.data.cooking_time || 0,
                  dlc_days: recipe.data.dlc_days || 3,
                  target_price: recipe.data.sale_price || 0,
                  instructions: {
                    steps: recipe.data.steps || [],
                    notes: '',
                    tips: ''
                  },
                  ingredients: recipe.data.ingredients?.map(ing => ({
                    name: ing.name,
                    quantity: ing.quantity,
                    unit: ing.unit,
                    cost_per_unit: ing.unit_price,
                    category: ing.category
                  })) || [],
                  sub_recipes: []
                });
                setShowCreateModal(true);
                onClose();
              }}>
                Modifier avant création
              </Button>
              <Button onClick={onCreate}>
                Créer la recette
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <AIGeneratedPreview 
        recipe={aiGeneratedRecipe}
        onClose={() => setAIGeneratedRecipe(null)}
        onCreate={async () => {
          try {
            const response = await fetch(`${API_HOST}${aiGeneratedRecipe.workflow.endpoint}`, {
              method: aiGeneratedRecipe.workflow.method,
              headers: getHeaders(),
              body: JSON.stringify(aiGeneratedRecipe.data)
            });
            
            if (!response.ok) throw new Error('Erreur lors de la création de la recette');
            
            toast.success('Recette créée avec succès !');
            fetchRecipes();
            setAIGeneratedRecipe(null);
          } catch (error) {
            console.error('Erreur:', error);
            toast.error(error.message || 'Erreur lors de la création de la recette');
          }
        }}
      />
      
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Modale des détails de la recette */}
        <RecipeDetailsModal />
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 mb-10">
          <div className="relative col-span-9 flex bg-gradient-to-br from-orange-400 to-orange-500 space-x-6 items-center rounded-2xl min-w-3xl pr-10 pt-4 pb-5">
            <div className="mr-48">
              <img
                src="/image/macaronie.png"
                alt=""
                className="absolute -top-4 h-52 w-52"
              />
            </div>
            <div className="w-full p-0">
              <div className="flex justify-between w-full">
                <h1 className="text-4xl font-bold flex items-center text-white">
                  Créez votre recette
                </h1>
                <div className="flex gap-2">
                  <Button onClick={() => setShowAIGenerateModal(true)} variant="outline">
                    <Brain className="mr-2 h-4 w-4" />
                    Générer avec IA
                  </Button>
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Nouvelle recette
                  </Button>
                </div>
              </div>
              <p className="text-orange-200 text-xs mt-2">
                Générez ou créez manuellement vos recettes
              </p>
              <p>
                <div className="space-x-1 mt-5">
                  <span className="bg-orange-400 rounded-sm text-orange-200 px-2 py-1 text-xs font-bold">
                    sous-recette
                  </span>
                  <span className="bg-orange-400 rounded-sm text-orange-200 px-2 py-1 text-xs font-bold">
                    recette
                  </span>
                  <span className="bg-orange-400 rounded-sm text-orange-200 px-2 py-1 text-xs font-bold">
                    ingrédient
                  </span>
                </div>
              </p>
            </div>
          </div>
          <div className="col-span-3 bg-slate-100 border rounded-2xl p-5 flex flex-col justify-between">
            <div className="text-md font-semibold flex justify-between items-center">
              <span className="flex items-center justify-between space-x-1">
                <span className="text-gray-600">
                  <BiFork size={20} />
                </span>
                <span>Votre recette</span>
              </span>
              <span className="text-orange-600">
                <AiOutlineSetting size={20} />
              </span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h1 className="font-bold text-4xl">
                  12 <span className="text-sm text-gray-400">recettes créées</span>
                </h1>
              </div>
              <div className="flex items-center">
                <img src="/image/macaronie.png" alt="" className="w-7 h-7" />
                <img src="/image/salade.png" alt="" className="w-7 h-7" />
              </div>
            </div>
          </div>
        </div>
        {/* Stats Summary */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Recettes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_recipes}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Actives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active_recipes}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Coût Moyen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€ {stats.average_cost.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Marge Moyenne
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.average_margin}%</div>
              </CardContent>
            </Card>
          </div>
        )}
        {/* AI Features */}
        <Tabs defaultValue="recipes" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="recipes">
              <List className="w-4 h-4 mr-2 text-sky-500" />
              Liste des recettes
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
          {/* Onglet Liste des recettes */}
          <TabsContent value="recipes" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recipes.map((recipe) => (
                <Card key={recipe.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-4">
                    <div className="flex flex-col justify-between h-full">
                      <div className="relative h-32 mb-4">
                        <img
                          src={"http://localhost:8120"+recipe.imagefile || "/image/burgeur.png"}
                          alt={recipe.name}
                          className="w-40 h-40 absolute -top-8 left-1/2 transform -translate-x-1/2 object-cover rounded-lg shadow-md"
                          onError={(e) => {
                            e.target.src = "/image/placeholder-recipe.png";
                          }}
                        />
                        
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-lg mb-1 line-clamp-2 h-12 flex items-center justify-center">
                          {recipe.name}
                        </p>
                        <p className="text-gray-500 text-sm mb-3 line-clamp-2 h-10">
                          {recipe.category} • {recipe.recipe_type}
                        </p>
                      </div>
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                        <span className="font-semibold text-xl">
                          <span className="text-orange-600">
                            {parseFloat(recipe.cost_per_portion || 0).toFixed(2)}
                          </span>
                          €
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-orange-600 text-white px-4 py-1 rounded-full text-sm hover:bg-orange-700"
                          onClick={() => {
                            setSelectedRecipe(recipe);
                            setShowEditModal(true);
                          }}
                        >
                          Modifier
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

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
                        <CardTitle className="text-md font-semibold text-green-600">
                          Points Forts
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
                          {kitchenAnalysis.kitchen_situation.ai_insights.analysis.points_forts.map(
                            (p, i) => (
                              <li key={i}>{p}</li>
                            )
                          )}
                        </ul>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-red-500">
                      <CardHeader>
                        <CardTitle className="text-md font-semibold text-red-600">
                          Points Faibles
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
                          {kitchenAnalysis.kitchen_situation.ai_insights.analysis.points_faibles.map(
                            (p, i) => (
                              <li key={i}>{p}</li>
                            )
                          )}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-l-4 border-blue-500">
                      <CardHeader>
                        <CardTitle className="text-md font-semibold text-blue-600">
                          Opportunités
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
                          {kitchenAnalysis?.kitchen_situation?.ai_insights?.analysis?.opportunites
                            ?.length > 0 ? (
                            kitchenAnalysis.kitchen_situation.ai_insights.analysis.opportunites.map(
                              (p, i) => (
                                <li key={i}>{p}</li>
                              )
                            )
                          ) : (
                            <li className="text-muted-foreground italic">
                              Aucune opportunité identifiée
                            </li>
                          )}
                        </ul>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-orange-500">
                      <CardHeader>
                        <CardTitle className="text-md font-semibold text-orange-600">
                          Risques
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
                          {kitchenAnalysis?.kitchen_situation?.ai_insights?.analysis?.risques
                            ?.length > 0 ? (
                            kitchenAnalysis.kitchen_situation.ai_insights.analysis.risques.map(
                              (p, i) => (
                                <li key={i}>{p}</li>
                              )
                            )
                          ) : (
                            <li className="text-muted-foreground italic">
                              Aucun risque identifié
                            </li>
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
                      {kitchenAnalysis.kitchen_situation.ai_insights.analysis.actions_prioritaires.map(
                        (a, i) => (
                          <div
                            key={i}
                            className="border p-3 rounded-lg bg-muted/10"
                          >
                            <p className="font-medium text-foreground">{a.action}</p>
                            <p className="text-xs mt-1">
                              <strong>Urgence :</strong>{" "}
                              <Badge
                                variant={a.urgence === "high" ? "destructive" : "secondary"}
                              >
                                {a.urgence}
                              </Badge>{" "}
                              — <strong>Impact :</strong> {a.impact}
                            </p>
                          </div>
                        )
                      )}
                    </CardContent>
                  </Card>
                  <Card className="border border-muted/30">
                    <CardHeader>
                      <CardTitle className="text-md font-semibold text-teal-600">
                        Recommandations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
                        {kitchenAnalysis.kitchen_situation.ai_insights.analysis.recommendations.map(
                          (r, i) => (
                            <li key={i}>{r}</li>
                          )
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-md font-semibold text-center">
                          Score d’Efficacité
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex justify-center items-center">
                        <div className="text-4xl font-bold text-sky-600">
                          {kitchenAnalysis.kitchen_situation.ai_insights.analysis.score_efficacite}
                          %
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
                          {kitchenAnalysis?.kitchen_situation?.ai_insights?.analysis
                            ?.tendances_saisonnieres?.length > 0 ? (
                            kitchenAnalysis.kitchen_situation.ai_insights.analysis.tendances_saisonnieres.map(
                              (t, i) => (
                                <li key={i}>{t}</li>
                              )
                            )
                          ) : (
                            <li className="text-muted-foreground italic">
                              Aucune tendance saisonnière identifiée
                            </li>
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
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-yellow-500" />
                    Suggestions d’Achats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 text-sm">
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
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
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
                              <span className="font-semibold text-sm">{item.item}</span>
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
                            <div className="text-xs">
                              Quantité : {item.quantity} {item.unit} — Prix estimé :{" "}
                              <span className="font-medium">{item.estimated_price}€</span>{" "}
                              / Total : <span className="font-semibold">{item.total_cost}€</span>
                            </div>
                            <div className="text-xs mt-2">
                              🏪 Fournisseur :{" "}
                              <span className="font-medium">{item.supplier_suggestion}</span>
                            </div>
                            <div className="text-xs italic mt-1">💡 {item.reason}</div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-yellow-200">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-500 text-white">Priorité</Badge>
                      <span className="text-sm">
                        {shoppingSuggestions?.shopping_suggestions?.priority_items?.length > 0
                          ? shoppingSuggestions.shopping_suggestions.priority_items.join(", ")
                          : "Aucun"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-green-600" />
                      <span className="text-sm">
                        Saison :{" "}
                        {shoppingSuggestions?.shopping_suggestions?.seasonal_items?.length > 0
                          ? shoppingSuggestions.shopping_suggestions.seasonal_items.join(", ")
                          : "Aucune"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4 text-red-500" />
                      <span className="text-sm">
                        Anti-gaspillage :{" "}
                        {shoppingSuggestions?.shopping_suggestions?.anti_waste_items?.length > 0
                          ? shoppingSuggestions.shopping_suggestions.anti_waste_items.join(", ")
                          : "Aucun"}
                      </span>
                    </div>
                  </div>
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
                  {shoppingSuggestions.shopping_suggestions.warnings?.length > 0 && (
                    <div className="mt-3 border-t border-yellow-200 pt-2">
                      <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-1">
                        <TriangleAlert className="h-4 w-4 text-yellow-700" />
                        Avertissements :
                      </h4>
                      <ul className="list-disc list-inside text-sm text-yellow-900 space-y-1">
                        {shoppingSuggestions.shopping_suggestions.warnings.map((warning, idx) => (
                          <li key={idx}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {shoppingSuggestions.shopping_suggestions.alternatives?.length > 0 && (
                    <div className="mt-3 border-t border-yellow-200 pt-2">
                      <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-1">
                        <RefreshCcw className="h-4 w-4 text-yellow-700" />
                        Alternatives proposées :
                      </h4>
                      <ul className="list-disc list-inside text-sm text-yellow-900 space-y-1">
                        {shoppingSuggestions.shopping_suggestions.alternatives.map((alt, idx) => (
                          <li key={idx}>
                            <span className="font-medium">{alt.original}</span> →{" "}
                            <span className="font-medium text-yellow-800">{alt.alternative}</span>{" "}
                            <span className="italic text-muted-foreground">({alt.reason})</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
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
            {antiWasteResults && (
              <Card className="border border-red-300 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trash2 className="h-5 w-5 text-red-500" />
                    Analyse Anti-Gaspillage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  {antiWasteResults.status === "error" && (
                    <Alert variant="destructive" className="border-red-400">
                      <AlertCircle className="h-4 w-4 text-red-700" />
                      <AlertDescription className="text-red-800 font-medium">
                        Erreur détectée : {antiWasteResults.error}
                      </AlertDescription>
                    </Alert>
                  )}
                  {antiWasteResults.critical_ingredients && antiWasteResults.critical_ingredients.length > 0 && (
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
                              <span className="font-semibold text-red-800">{item.name}</span>
                              <Badge variant="destructive" className="bg-red-500 text-white">
                                {item.days_until_expiry < 0
                                  ? "Périmé"
                                  : `Expire dans ${item.days_until_expiry} j`}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              SKU : <span className="font-medium">{item.sku}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Date d'expiration : <span className="font-medium">{item.expiry_date}</span>
                            </div>
                            <div className="text-xs mt-1">
                              Quantité restante : <span className="font-medium">{item.quantity} {item.unit}</span>
                            </div>
                            {item.days_until_expiry < 0 && (
                              <div className="text-xs mt-2 text-red-700 italic">
                                ⚠️ Cet ingrédient est déjà expiré depuis {Math.abs(item.days_until_expiry)} jours.
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="pt-3 border-t border-red-200 text-xs text-muted-foreground">
                    Vérification effectuée par le module <strong>Anti-Gaspillage IA</strong>.
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="menu">
            {menuAvailability && (
              <Card className="border border-green-300 shadow-md mt-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <ChefHat className="h-5 w-5 text-foreground" />
                    Analyse du Menu Disponible
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 text-sm">
                  <div className="rounded-lg border border-green-200 p-3 shadow-sm">
                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-green-700" /> Résumé du menu :
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      <div>
                        🍽️ Total recettes : <strong>{menuAvailability.summary.total_recipes}</strong>
                      </div>
                      <div>
                        ✅ Réalisables : <strong>{menuAvailability.summary.can_make}</strong>
                      </div>
                      <div>
                        ❌ Non réalisables : <strong>{menuAvailability.summary.cannot_make}</strong>
                      </div>
                      <div>
                        ⚠️ Partiellement dispos :{" "}
                        <strong>{menuAvailability.summary.partially_available}</strong>
                      </div>
                      <div>
                        📊 Taux dispo : <strong>{menuAvailability.summary.availability_rate}%</strong>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <ListChecks className="h-4 w-4 text-green-700" /> Détails des recettes :
                    </h3>
                    <div className="space-y-3">
                      {menuAvailability.detailed_analysis.map((r, index) => (
                        <div
                          key={index}
                          className="rounded-lg border border-green-200 p-3 shadow-sm hover:shadow-md transition"
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
                  {menuAvailability.optimization_suggestions && (
                    <div className="rounded-lg border border-green-200 p-3 shadow-sm space-y-3">
                      <h3 className="font-semibold text-green-900 mb-1 flex items-center gap-2">
                        <Settings className="h-4 w-4 text-green-700" /> Optimisation du menu :
                      </h3>
                      <p className="text-xs text-muted-foreground italic">
                        {menuAvailability.optimization_suggestions.optimization_strategy}
                      </p>
                      <div>
                        <h4 className="font-medium mb-1">⚡ Actions immédiates :</h4>
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
                      {menuAvailability.optimization_suggestions.purchasing_priorities?.length > 0 && (
                        <div>
                          <h4 className="font-medium text-green-800 mb-1">🛒 Priorités d’achat :</h4>
                          <ul className="list-disc list-inside text-sm text-green-900 space-y-1">
                            {menuAvailability.optimization_suggestions.purchasing_priorities.map((p, i) => (
                              <li key={i}>
                                <strong>{p.ingredient}</strong> — urgence{" "}
                                <Badge
                                  className={
                                    p.urgency === "critique" ? "bg-red-500 text-white" : "bg-yellow-400 text-black"
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
                      {menuAvailability.optimization_suggestions.recommendations?.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-1">💡 Recommandations :</h4>
                          <ul className="list-disc list-inside text-sm text-green-900 space-y-1">
                            {menuAvailability.optimization_suggestions.recommendations.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="pt-2 text-xs text-muted-foreground">
                        🔢 Score de performance :{" "}
                        <span className="font-semibold text-green-800">
                          {menuAvailability.optimization_suggestions.performance_score} / 100
                        </span>
                        {" | "}🧠 Modèle :{" "}
                        <code className="text-green-700">{menuAvailability.optimization_suggestions.model_used}</code>
                      </div>
                    </div>
                  )}
                  <div className="pt-3 border-t border-green-200 text-xs text-muted-foreground">
                    Dernière mise à jour : <span className="font-medium">{menuAvailability.timestamp}</span> — Auto-update :{" "}
                    {menuAvailability.auto_update_applied ? "Activé" : "Désactivé"}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
        <div className="space-y-10">
          {/* Search */}
          <div className="relative">
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
          <Card className="border-0">
            <CardContent className="p-1 border-0">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">Chargement...</div>
              ) : filteredRecipes.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">Aucune recette trouvée</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                  {filteredRecipes.map((recipe) => (
                    <Card key={recipe.id}>
                      <CardContent>
                        <div className="flex flex-col justify-between">
                          <div className="relative h-32">
                            <img
                              src={recipe.photo_url || "/image/salade.png"}
                              alt={recipe.name}
                              className="w-40 h-40 absolute -top-8 left-2 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.src = "/image/salade.png";
                              }}
                            />
                          </div>
                          <div className="flex-col items-center justify-center">
                            <p className="text-center font-bold">
                              <strong>{recipe.name}</strong>
                            </p>
                            <p className="text-center text-gray-500">
                              {recipe.description || "Lorem ipsum dolor sit amet consectetur"}
                            </p>
                          </div>
                          <div className="flex justify-between items-center mt-3 gap-2">
                            <span className="font-semibold text-xl">
                              <span className="text-orange-600">
                                {parseFloat(recipe.cost_per_portion || 0).toFixed(1)}
                              </span>
                              €
                            </span>
                            <div className="flex gap-2">
                              <button
                                className="border border-gray-300 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-100 transition-colors"
                                onClick={() => fetchRecipeDetails(recipe.id)}
                              >
                                Détails
                              </button>
                              <button
                                className="bg-orange-600 text-white px-4 py-1 rounded-full text-sm hover:bg-orange-700 transition-colors"
                                onClick={() => {
                                  setSelectedRecipe(recipe);
                                  setShowEditModal(true);
                                }}
                              >
                                Modifier
                              </button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
                    onChange={(e) =>
                      setNewRecipe({ ...newRecipe, yield_quantity: Number.parseFloat(e.target.value) })
                    }
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
                    onChange={(e) =>
                      setNewRecipe({ ...newRecipe, prep_time_minutes: Number.parseInt(e.target.value) })
                    }
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
                    onChange={(e) =>
                      setNewRecipe({ ...newRecipe, rest_time_minutes: Number.parseInt(e.target.value) })
                    }
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
                    onChange={(e) =>
                      setNewRecipe({ ...newRecipe, other_costs: Number.parseFloat(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target_price">Prix Cible</Label>
                  <Input
                    id="target_price"
                    type="number"
                    step="0.01"
                    value={newRecipe.target_price}
                    onChange={(e) =>
                      setNewRecipe({ ...newRecipe, target_price: Number.parseFloat(e.target.value) })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Image de la recette</Label>
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden">
                    {newRecipe.photo_url ? (
                      <>
                        <img
                          src={newRecipe.photo_url}
                          alt="Aperçu"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/100";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setNewRecipe({ ...newRecipe, photo_url: "" })}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-2">
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
                          className="w-6 h-6 text-gray-400 mx-auto mb-1"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                        <span className="text-xs text-gray-500">Ajouter une photo</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setNewRecipe({ ...newRecipe, photo_url: event.target.result });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Format: JPG, PNG</p>
                    <p>Taille max: 5MB</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Ingrédients</h3>
                  <div className="flex gap-2">
                    <Select
                      value={selectedProduct}
                      onValueChange={(value) => {
                        const product = inventoryProducts.find((p) => p.id === value);
                        if (product) {
                          addIngredient(product);
                        }
                      }}
                    >
                      <SelectTrigger className="w-[250px]">
                        <SelectValue placeholder="Sélectionner un produit" />
                      </SelectTrigger>
                      <SelectContent>
                        {inventoryProducts.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} ({product.sku || "N/A"})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {newRecipe.ingredients.map((ingredient, index) => (
                  <div key={ingredient.id || index} className="space-y-2 w-full">
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-4">
                        <Input
                          placeholder="Nom de l'ingrédient"
                          value={ingredient.name}
                          onChange={(e) => updateIngredient(index, "name", e.target.value)}
                        />
                      </div>
                      <div className="col-span-1">
                        <Input
                          type="number"
                          placeholder="Qté"
                          min="0"
                          step="0.01"
                          value={ingredient.quantity}
                          onChange={(e) =>
                            updateIngredient(index, "quantity", Number.parseFloat(e.target.value) || 0)
                          }
                        />
                      </div>
                      <div className="col-span-1">
                        <Input
                          placeholder="Unité"
                          value={ingredient.unit}
                          onChange={(e) => updateIngredient(index, "unit", e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        <div className="relative">
                          <Input
                            type="text"
                            placeholder="N° de lot"
                            value={ingredient.batch_number || ''}
                            onChange={(e) => updateIngredient(index, "batch_number", e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="date"
                          placeholder="Date d'expiration"
                          value={ingredient.expiry_date || ''}
                          onChange={(e) => updateIngredient(index, "expiry_date", e.target.value)}
                        />
                      </div>
                      <div className="col-span-1">
                        <div className="relative">
                          <span className="absolute left-2 top-2 text-xs">€</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="P.U"
                            value={ingredient.cost_per_unit || 0}
                            onChange={(e) =>
                              updateIngredient(index, "cost_per_unit", Number.parseFloat(e.target.value) || 0)
                            }
                            className="pl-6 pr-2"
                            disabled={ingredient.product_id !== null}
                          />
                        </div>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          onClick={() => removeIngredient(index)}
                          className="h-9 w-9"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground pl-4">
                      {ingredient.sku && (
                        <div className="col-span-2">
                          <span className="font-medium">SKU:</span> {ingredient.sku}
                        </div>
                      )}
                      {ingredient.location && (
                        <div className="col-span-2">
                          <span className="font-medium">Emplacement:</span> {ingredient.location}
                        </div>
                      )}
                      {ingredient.supplier_code && (
                        <div className="col-span-2">
                          <span className="font-medium">Fournisseur:</span> {ingredient.supplier_code}
                        </div>
                      )}
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
              <Button className="bg-sky-500 text-white" onClick={createRecipe}>
                Créer
              </Button>
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

      {/* Modal de génération IA */}
      <Dialog open={showAIGenerateModal} onOpenChange={setShowAIGenerateModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Générer une recette avec IA
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ai_recipe_name">Nom de la recette</Label>
              <Input
                id="ai_recipe_name"
                placeholder="Ex: Lasagnes végétariennes"
                value={aiGenerationParams.recipe_name}
                onChange={(e) =>
                  setAIGenerationParams({
                    ...aiGenerationParams,
                    recipe_name: e.target.value,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ai_portions">Nombre de portions</Label>
                <Input
                  id="ai_portions"
                  type="number"
                  min="1"
                  value={aiGenerationParams.portions}
                  onChange={(e) =>
                    setAIGenerationParams({
                      ...aiGenerationParams,
                      portions: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ai_cuisine_type">Type de cuisine</Label>
                <Input
                  id="ai_cuisine_type"
                  placeholder="Ex: Italienne, Française, Asiatique..."
                  value={aiGenerationParams.cuisine_type}
                  onChange={(e) =>
                    setAIGenerationParams({
                      ...aiGenerationParams,
                      cuisine_type: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Régimes alimentaires (facultatif)</Label>
              <div className="space-y-2">
                {aiGenerationParams.dietary_restrictions.map((restriction, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Ex: Sans gluten, Végétarien, Halal..."
                      value={restriction}
                      onChange={(e) => {
                        const newRestrictions = [...aiGenerationParams.dietary_restrictions];
                        newRestrictions[index] = e.target.value;
                        setAIGenerationParams({
                          ...aiGenerationParams,
                          dietary_restrictions: newRestrictions,
                        });
                      }}
                    />
                    {index > 0 && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const newRestrictions = aiGenerationParams.dietary_restrictions.filter(
                            (_, i) => i !== index
                          );
                          setAIGenerationParams({
                            ...aiGenerationParams,
                            dietary_restrictions: newRestrictions,
                          });
                        }}
                      >
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
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() =>
                    setAIGenerationParams({
                      ...aiGenerationParams,
                      dietary_restrictions: [...aiGenerationParams.dietary_restrictions, ""],
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une restriction
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="ai_max_cost">Coût maximum (€)</Label>
                <span className="text-sm text-muted-foreground">
                  {aiGenerationParams.max_cost} €
                </span>
              </div>
              <Slider
                id="ai_max_cost"
                min={0}
                max={50}
                step={1}
                value={[aiGenerationParams.max_cost]}
                onValueChange={([value]) =>
                  setAIGenerationParams({
                    ...aiGenerationParams,
                    max_cost: value,
                  })
                }
                className="py-4"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAIGenerateModal(false)}
              disabled={isGenerating}
            >
              Annuler
            </Button>
            <Button
              onClick={generateRecipeWithAI}
              disabled={isGenerating || !aiGenerationParams.recipe_name.trim()}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Générer la recette
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    
  );
};

export default Recipe
