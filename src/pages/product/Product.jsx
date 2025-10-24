import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, Eye, ToggleLeft, ToggleRight, Search, ChevronDown,
  Upload, ArrowLeft, X, Menu, Package, BookOpen, Utensils, ClipboardList
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {Textarea} from "@/components/ui/textarea"
import {Input} from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const API_HOST = 'http://localhost:8120/api/v1';
const TOKEN_KEY = 'access_token';

const getToken = () => localStorage.getItem(TOKEN_KEY);

const fetchWithAuth = async (endpoint, options = {}) => {
  const token = getToken();
  if (!token) throw new Error('No access token found');

  const headers = {
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  // Remove Content-Type for FormData to let the browser set it
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_HOST}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) throw new Error(`${response.statusText}`);
  return response.json();
};

const Product = () => {
  const [products, setProducts] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [showRecipe, setShowRecipe] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Toutes catégories');
  const [availabilityFilter, setAvailabilityFilter] = useState('Tous');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: 'other',
    product_type: 'final',
    price: '',
    vat_rate: '10.00',
    description: '',
    unit: 'portion',
    sales_count: 0,
    reference_cost: '',
    recipe_id: '',
    inventory_sku: '',
    is_available: false,
    allergens: '',
    image_file: null, // Added image_file to formData
  });

  useEffect(() => {
    fetchProducts();
    fetchStats();
    fetchRecipes();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/products/');
      setProducts(data.items);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      setProducts([]);
    }
  };

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/recipes/');
      setRecipes(data.items);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await fetchWithAuth('/products/stats/summary');
      setStats(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      // Append all form fields to FormData
      Object.keys(formData).forEach((key) => {
        if (key === 'image_file' && formData[key]) {
          // Use 'image' as the field name for the file upload
          data.append('image', formData[key]);
        } else if (formData[key] !== null && formData[key] !== '') {
          data.append(key, formData[key]);
        }
      });

      if (editingId) {
        await fetchWithAuth(`/products/${editingId}`, {
          method: 'PATCH',
          body: data,
        });
      } else {
        data.append('restaurant_id', 'mock-restaurant-id');
        await fetchWithAuth('/products/', {
          method: 'POST',
          body: data,
        });
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({
        sku: '',
        name: '',
        category: 'other',
        product_type: 'final',
        price: '',
        vat_rate: '10.00',
        description: '',
        unit: 'portion',
        sales_count: 0,
        reference_cost: '',
        recipe_id: '',
        inventory_sku: '',
        is_available: false,
        allergens: '',
        image_file: null,
      });
      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      sku: product.sku,
      name: product.name,
      category: product.category,
      product_type: product.product_type,
      price: product.price,
      vat_rate: product.vat_rate,
      description: product.description,
      unit: product.unit,
      reference_cost: product.reference_cost || '',
      recipe_id: product.recipe_id || '',
      inventory_sku: product.inventory_sku || '',
      is_available: product.is_available,
      allergens: product.allergens || '',
      image_file: null, // Reset image_file for edit
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce produit ?')) {
      try {
        await fetchWithAuth(`/products/${id}`, { method: 'DELETE' });
        fetchProducts();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleToggleAvailability = async (id) => {
    try {
      await fetchWithAuth(`/products/${id}/toggle-availability`, { method: 'POST' });
      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleViewDetail = async (id) => {
    try {
      const data = await fetchWithAuth(`/products/${id}`);
      setShowDetail({
        product: data,
        recipe: data.recipe,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const closeDetailModal = () => {
    setShowDetail(null);
  };

  const handleViewWithRecipe = async (id) => {
    try {
      const data = await fetchWithAuth(`/products/${id}/with-recipe`);
      setShowRecipe(data);
      // Assuming toast is defined elsewhere
      // toast.success("Détails chargés avec succès");
    } catch (err) {
      setError(err.message);
      // toast.error(`Erreur lors du chargement des détails: ${err.message}`);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Implement CSV parsing logic here (e.g., using PapaParse or similar)
    alert('Importation de fichier CSV non implémentée dans cet exemple.');
    setShowImport(false);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'Toutes catégories' || p.category === categoryFilter;
    const matchesAvailability = availabilityFilter === 'Tous' ||
      (availabilityFilter === 'Disponibles' && p.is_available) ||
      (availabilityFilter === 'Indisponibles' && !p.is_available);
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar (unchanged) */}
      <div className="flex-1 justify-center items-center p-6">
        {showDetail ? (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <Button
                onClick={() => setShowDetail(null)}
                className=""
                variant="ghost"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Retour
              </Button>
              <Button onClick={() => handleEdit(showDetail.product)}>
                <Edit className="w-5 h-5 mr-2" />
                Modifier
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    Informations Produit
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><strong>Nom:</strong> {showDetail.product.name}</p>
                  <p><strong>Code:</strong> {showDetail.product.sku}</p>
                  <p><strong>Catégorie:</strong> {showDetail.product.category}</p>
                  <p><strong>Prix de vente:</strong> {Number(showDetail.product.price || 0).toFixed(2)}€</p>
                  <p><strong>Description:</strong> {showDetail.product.description}</p>
                  <p><strong>Allergènes:</strong> {showDetail.product.allergens || "Aucun"}</p>
                  <p><strong>Disponibilité:</strong> {showDetail.product.is_available ? "Disponible" : "Indisponible"}</p>
                  {showDetail.product.image_url && (
                    <p>
                      <strong>Image:</strong>
                      <img src={showDetail.product.image_url} alt={showDetail.product.name} className="mt-2 max-w-xs" />
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    Statistiques
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><strong>Prix de vente:</strong> {Number(showDetail.product.price || 0).toFixed(2)}€</p>
                  <p><strong>Coût matière:</strong> {showDetail.product.food_cost?.toFixed(2)}€</p>
                  <p><strong>Marge:</strong> {showDetail.product.margin_percent?.toFixed(0)}%</p>
                  <p><strong>Ventes ce mois:</strong> {showDetail.product.sales_count}</p>
                </CardContent>
              </Card>

              {showDetail.recipe && (
                <div className="bg-background p-6 rounded-lg shadow col-span-2">
                  <h2 className="text-lg font-semibold mb-4 flex items-center justify-between">
                    Recette Liée
                    <button className="px-4 py-2 bg-background text-foreground rounded-md hover:bg-indigo-700 flex items-center">
                      <Edit className="w-5 h-5 mr-2" />
                      Modifier
                    </button>
                  </h2>
                  <p><strong>Nom:</strong> {showDetail.recipe.name}</p>
                  <p><strong>Coût matière:</strong> {showDetail.recipe.food_cost.toFixed(2)}€</p>
                  <p><strong>Portions:</strong> 1</p>
                  <p><strong>Temps de cuisson:</strong> 12 min</p>
                  <p><strong>Statut:</strong> Active</p>
                  <h3 className="mt-4 font-medium">Ingrédients Principaux:</h3>
                  <ul className="list-disc pl-5">
                    <li>Pâte à pizza - 250g</li>
                    <li>Sauce tomate - 80ml</li>
                    <li>Mozzarella - 125g</li>
                    <li>Basilic frais - 10g</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-foreground">
                Gestion Produits
              </h1>
              <div className="flex space-x-2">
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-sky-500 dark:text-foreground"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Nouveau Produit
                </Button>
              </div>
            </div>

            <div className="flex space-x-4 mb-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Rechercher par nom ou code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border rounded-md text-foreground dark:bg-background dark:text-foreground focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            {loading ? (
              <p className="text-center text-gray-500">Chargement...</p>
            ) : (
              <div className='grid gap-3'>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="group relative">
                      <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg font-semibold">
                                {product.name}
                              </CardTitle>
                              <CardDescription className="text-sm">
                                {product.sku}
                              </CardDescription>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              product.is_available 
                                ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                                : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                            }`}>
                              {product.is_available ? 'Disponible' : 'Indisponible'}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-7 text-sm">
                            <div>
                              <img 
                                src={"http://localhost:8120/"+product.image_url || "/image/burgeur.png"} 
                                alt={product.name} 
                                className='w-full h-54'
                              />
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex justify-between text-lg">
                                {Number(product.price || 0).toFixed(2)}€/ <span className="text-xs">{product.unit}</span>
                              </div>
                              <div className='text-orange-400 font-bold'>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => { e.stopPropagation(); handleViewDetail(product.id); }}
                                  className="h-8 w-8 hover:bg-orange-100"
                                  title="Voir les détails"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <div className="mt-5 absolute -bottom-5 right-5 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background/90 backdrop-blur-sm p-1 rounded-md shadow-md">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); handleEdit(product); }}
                          className="h-8 w-8 hover:bg-orange-100"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); handleToggleAvailability(product.id); }}
                          className="h-8 w-8 hover:bg-orange-100"
                          title={product.is_available ? "Désactiver" : "Activer"}
                        >
                          {product.is_available ? (
                            <ToggleLeft className="h-4 w-4" />
                          ) : (
                            <ToggleRight className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); handleViewDetail(product.id); }}
                          className="h-8 w-8 hover:bg-orange-100"
                          title="Voir les détails"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); handleViewWithRecipe(product.id); }}
                          className="h-8 w-8 hover:bg-orange-100"
                          title="Voir avec recette"
                        >
                          <ClipboardList className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
                              handleDelete(product.id);
                            }
                          }}
                          className="h-8 w-8 text-red-500 hover:bg-red-100"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingId ? "Modifier Produit" : "Nouveau Produit"}
                </h2>
                <button onClick={() => setShowForm(false)}>
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
              <form type="multipart/form-data" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4">
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Nom du produit *"
                    required
                  />
                  <Input
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder="Sku *"
                    required
                  />
                  <Select
                    name="category"
                    value={formData.category}
                    onValueChange={(value) =>
                      handleInputChange({ target: { name: "category", value } })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=" ">Sélectionner...</SelectItem>
                      <SelectItem value="Entrée">Entrée</SelectItem>
                      <SelectItem value="Plat principal">Plat principal</SelectItem>
                      <SelectItem value="Dessert">Dessert</SelectItem>
                      <SelectItem value="Boisson">Boisson</SelectItem>
                      <SelectItem value="Accompagnement">Accompagnement</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Prix de vente (€) *"
                    required
                  />
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Description"
                    className="px-4 py-2 border rounded-md"
                  />
                  <Select
                    value={formData.recipe_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, recipe_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Aucune Recette" />
                    </SelectTrigger>
                    <SelectContent value={formData.recipe_id}>
                      {recipes.map((recipe) => (
                        <SelectItem key={recipe.id} value={recipe.id}>
                          {recipe.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    name="reference_cost"
                    value={formData.reference_cost}
                    onChange={handleInputChange}
                    placeholder="Reference *"
                    required
                  />
                  <div className="flex items-center justify-between">
                    <Input
                      type="file"
                      name="image_file"
                      onChange={handleInputChange}
                      accept="image/*"
                      className="border rounded-md"
                    />
                    {formData.image_file && (
                      <span className="text-sm text-gray-600">
                        {formData.image_file.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-end mt-4 space-x-2">
                  <Button
                    type="button"
                    onClick={() => setShowForm(false)}
                    variant="outline"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="bg-sky-500 hover:bg-sky-800 text-white"
                  >
                    {editingId ? "Mettre à Jour" : "Créer le produit"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        <Dialog open={!!showDetail} onOpenChange={(open) => !open && closeDetailModal()}>
          <DialogContent className="sm:max-w-[600px]">
            {showDetail && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">{showDetail.product.name}</DialogTitle>
                  <DialogDescription>
                    Détails complets du produit
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold">Informations de base</h3>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Référence :</span> {showDetail.product.sku}</p>
                        <p><span className="font-medium">Catégorie :</span> {showDetail.product.category}</p>
                        <p><span className="font-medium">Type :</span> {showDetail.product.product_type}</p>
                        <p><span className="font-medium">Prix :</span> {parseFloat(showDetail.product.price).toFixed(2)} €</p>
                        <p><span className="font-medium">TVA :</span> {parseFloat(showDetail.product.vat_rate).toFixed(2)}%</p>
                        <p><span className="font-medium">Unité :</span> {showDetail.product.unit}</p>
                        <p className="flex items-center gap-2">
                          <span className="font-medium">Statut :</span>
                          {showDetail.product.is_available ? (
                            <Badge className="bg-green-100 text-green-800">Disponible</Badge>
                          ) : (
                            <Badge variant="outline">Indisponible</Badge>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold">Description</h3>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                        {showDetail.product.description || 'Aucune description disponible'}
                      </p>
                      {showDetail.product.allergens && (
                        <div className="mt-2">
                          <h4 className="font-medium text-sm">Allergènes :</h4>
                          <p className="text-sm text-gray-600">{showDetail.product.allergens}</p>
                        </div>
                      )}
                      {showDetail.recipe && (
                        <div className="mt-2">
                          <h4 className="font-medium text-sm">Recette associée :</h4>
                          <p className="text-sm text-gray-600">{showDetail.recipe.name}</p>
                        </div>
                      )}
                      {showDetail.product.image_url && (
                        <div className="mt-2">
                          <h4 className="font-medium text-sm">Image :</h4>
                          <img src={showDetail.product.image_url} alt={showDetail.product.name} className="mt-2 max-w-xs" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={closeDetailModal}
                  >
                    Fermer
                  </Button>
                  <Button
                    onClick={() => {
                      handleEdit(showDetail.product);
                      closeDetailModal();
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {showImport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Importer Produits</h2>
                <button onClick={() => setShowImport(false)}>
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
              <div className="border-2 border-dashed border-gray-300 p-4 text-center">
                <p>Glissez-déposez votre fichier CSV ici</p>
                <p>ou</p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImport}
                  className="mt-2"
                />
              </div>
              <div className="mt-4">
                <p className="font-medium">Format attendu :</p>
                <p className="text-sm text-gray-600">
                  nom,code,categorie,prix,description,recipe_id,allergens,disponible,image_file
                </p>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowImport(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 mr-2"
                >
                  Fermer
                </button>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Importer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Product;