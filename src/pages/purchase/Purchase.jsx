import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Package, Truck, CheckCircle, ShoppingCart, Loader2, Eye, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";

const baseURL = "http://localhost:8120/api/v1";

const Purchase = () => {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [currentPurchase, setCurrentPurchase] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [currentPurchaseId, setCurrentPurchaseId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [formData, setFormData] = useState({
    expected_delivery: "",
    status: "",
    notes: "",
  });

  const [stats, setStats] = useState({
    pending: 0,
    inTransit: 0,
    totalMonth: 0,
    countMonth: 0,
  });

  const [newOrder, setNewOrder] = useState({
    supplier_id: "",
    supplier_name: "",
    order_number: "",
    order_date: new Date().toISOString().split("T")[0],
    expected_delivery: "",
    items: [],
    total_amount: 0,
    delivery_address: "",
    contact_person: "",
    contact_phone: "",
    notes: "",
    delivery_number: "",
    carrier_name: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No access token found");

      const [orderRes, supplierRes, productRes] = await Promise.all([
        fetch(`${baseURL}/purchases/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${baseURL}/suppliers/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${baseURL}/products/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!orderRes.ok || !supplierRes.ok || !productRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const [orderData, supplierData, productData] = await Promise.all([
        orderRes.json(),
        supplierRes.json(),
        productRes.json(),
      ]);

      const ordersArray = Array.isArray(orderData?.items) ? orderData.items : Array.isArray(orderData) ? orderData : [];
      const suppliersArray = Array.isArray(supplierData?.items) ? supplierData.items : Array.isArray(supplierData) ? supplierData : [];
      const productsArray = Array.isArray(productData?.items) ? productData.items : Array.isArray(productData) ? productData : [];

      setOrders(ordersArray);
      setSuppliers(suppliersArray);
      setProducts(productsArray);

      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const monthOrders = ordersArray.filter((o) => {
        if (!o?.order_date) return false;
        try {
          const d = new Date(o.order_date);
          return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
        } catch (e) {
          console.error("Error processing order date:", e);
          return false;
        }
      });

      const pending = ordersArray.filter((o) => o.status?.toLowerCase() === "pending").length;
      const inTransit = ordersArray.filter((o) => o.status?.toLowerCase() === "in_transit").length;
      const totalMonth = monthOrders.reduce((acc, o) => acc + (Number(o.total_amount?.parsedValue || o.total_amount) || 0), 0);
      const countMonth = monthOrders.length;

      setStats({ pending, inTransit, totalMonth, countMonth });
    } catch (err) {
      setError("Erreur de chargement des données");
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleUpdateStatus = useCallback(async (e) => {
    e.preventDefault();
    if (!currentPurchase) return;

    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No access token found");

      const response = await fetch(`${baseURL}/purchases/${currentPurchase.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          expected_delivery: formData.expected_delivery || currentPurchase.expected_delivery,
          status: formData.status || currentPurchase.status,
          notes: formData.notes || currentPurchase.notes || "",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Échec de la mise à jour");
      }

      const updatedOrder = await response.json();
      setOrders((prev) =>
        prev.map((order) =>
          order.id === currentPurchase.id ? { ...order, ...updatedOrder } : order
        )
      );
      setIsUpdateDialogOpen(false);
      toast.success("Commande mise à jour avec succès");
    } catch (error) {
      toast.error(error.message || "Erreur lors de la mise à jour");
    }
  }, [currentPurchase, formData]);

  const openUpdateDialog = useCallback(async (purchaseId) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No access token found");

      const response = await fetch(`${baseURL}/purchases/${purchaseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Impossible de charger les détails");
      }

      const purchaseDetails = await response.json();
      setCurrentPurchase(purchaseDetails);
      setFormData({
        expected_delivery: purchaseDetails.expected_delivery || "",
        status: purchaseDetails.status || "",
        notes: purchaseDetails.notes || "",
      });
      setIsUpdateDialogOpen(true);
    } catch (error) {
      toast.error("Erreur lors du chargement des détails");
    }
  }, []);

  const handleCancelPurchase = useCallback(async () => {
    if (!cancelReason.trim()) {
      toast.error("Veuillez indiquer une raison d'annulation");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No access token found");

      const response = await fetch(`${baseURL}/purchases/${currentPurchaseId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: cancelReason }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Échec de l'annulation");
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id === currentPurchaseId ? { ...order, status: "cancelled" } : order
        )
      );
      setCancelReason("");
      setIsCancelModalOpen(false);
      toast.success("Commande annulée avec succès");
    } catch (error) {
      toast.error(error.message || "Erreur lors de l'annulation");
    }
  }, [cancelReason, currentPurchaseId]);

  const addItem = useCallback(() => {
    setNewOrder((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { product_id: "", product_name: "", quantity: 1, unit: "pcs", unit_price: 0 },
      ],
    }));
  }, []);

  const updateItem = useCallback((index, field, value) => {
    setNewOrder((prev) => {
      const updatedItems = [...prev.items];
      if (field === "product_id") {
        const selectedProduct = products.find((p) => String(p.id) === String(value));
        if (selectedProduct) {
          updatedItems[index] = {
            ...updatedItems[index],
            product_id: value,
            product_name: selectedProduct.name,
            product_sku: selectedProduct.sku || "",
            unit_price: selectedProduct.price || 0,
            unit: selectedProduct.unit || "pcs",
          };
        }
      } else {
        updatedItems[index] = { ...updatedItems[index], [field]: value };
      }
      return { ...prev, items: updatedItems };
    });
  }, [products]);

  const removeItem = useCallback((index) => {
    setNewOrder((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }, []);

  const handleCreateOrder = useCallback(async (e) => {
    e.preventDefault();
    if (posting) return;

    setPosting(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No access token found");

      if (!newOrder.supplier_id || !newOrder.order_number || !newOrder.delivery_number || !newOrder.carrier_name) {
        toast.error("Veuillez remplir tous les champs obligatoires (fournisseur, numéro de commande, numéro de livraison, transporteur)");
        return;
      }

      const validItems = newOrder.items.filter((item) => item.product_id && item.product_id.trim());
      if (validItems.length === 0) {
        toast.error("Veuillez ajouter au moins un article valide");
        return;
      }

      const totalAmount = validItems.reduce(
        (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0),
        0
      );

      const orderData = {
        ...newOrder,
        order_date: new Date().toISOString().split("T")[0],
        items: validItems.map((item) => ({
          product_id: item.product_id,
          product_sku: item.product_sku || "",
          product_name: item.product_name || "",
          quantity: Number(item.quantity) || 0,
          unit: item.unit || "pcs",
          unit_price: Number(item.unit_price) || 0,
        })),
        total_amount: totalAmount,
      };

      const purchaseResponse = await fetch(`${baseURL}/purchases/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!purchaseResponse.ok) {
        const errorData = await purchaseResponse.json().catch(() => ({}));
        throw new Error(errorData.message || "Erreur lors de la création de la commande");
      }

      const createdOrder = await purchaseResponse.json();
      setOrders((prev) => [...prev, createdOrder]);

      // Création de la réception
      const receptionData = {
        purchase_id: createdOrder.id,
        delivery_number: newOrder.delivery_number,
        carrier_name: newOrder.carrier_name,
        notes: newOrder.notes || "",
      };

      const receptionResponse = await fetch(`${baseURL}/receptions/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(receptionData),
      });

      if (!receptionResponse.ok) {
        const errorData = await receptionResponse.json().catch(() => ({}));
        console.error("Erreur lors de la création de la réception:", errorData);
        toast.warn("Commande créée, mais échec de la création de la réception");
      } else {
        toast.success("Commande et réception créées avec succès");
      }

      setIsNewOrderModalOpen(false);
      setNewOrder({
        supplier_id: "",
        supplier_name: "",
        order_number: "",
        order_date: new Date().toISOString().split("T")[0],
        expected_delivery: "",
        items: [],
        total_amount: 0,
        delivery_address: "",
        contact_person: "",
        contact_phone: "",
        notes: "",
        delivery_number: "",
        carrier_name: "",
      });
    } catch (err) {
      toast.error(err.message || "Échec de création de la commande");
    } finally {
      setPosting(false);
    }
  }, [newOrder, posting]);

  return (
    <div className="min-h-screen bg-background p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold ">Approvisionnement</h1>
      </header>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Package className="text-blue-500" />
            <CardTitle>En attente</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{loading ? "..." : stats.pending}</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Truck className="text-yellow-500" />
            <CardTitle>En transit</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{loading ? "..." : stats.inTransit}</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <ShoppingCart className="text-green-500" />
            <CardTitle>Montant ce mois</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{loading ? "..." : `${stats.totalMonth.toFixed(2)} €`}</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <CheckCircle className="text-purple-500" />
            <CardTitle>Commandes ce mois</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{loading ? "..." : stats.countMonth}</CardContent>
        </Card>
      </div>

      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] w-[90%] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 mb-5">Détails de la commande</DialogTitle>
            {currentPurchase && (
              <DialogDescription asChild>
                <div className="mt-3 space-y-2 text-sm text-gray-600">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between pb-1">
                        <span className="font-medium">N° Commande :</span>
                        <span>{currentPurchase.order_number || "Non spécifié"}</span>
                      </div>
                      <div className="flex justify-between pb-1">
                        <span className="font-medium">Fournisseur :</span>
                        <span>{currentPurchase.supplier_name || currentPurchase.supplier?.name || "Non spécifié"}</span>
                      </div>
                      <div className="flex justify-between pb-1">
                        <span className="font-medium">Date commande :</span>
                        <span>{currentPurchase.order_date ? new Date(currentPurchase.order_date).toLocaleDateString("fr-FR") : "Non spécifié"}</span>
                      </div>
                      <div className="flex justify-between pb-1">
                        <span className="font-medium">Livraison prévue :</span>
                        <span>{currentPurchase.expected_delivery ? new Date(currentPurchase.expected_delivery).toLocaleDateString("fr-FR") : "Non spécifié"}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between pb-1">
                        <span className="font-medium">Montant total :</span>
                        <span className="font-semibold text-green-600">{Number(currentPurchase.total_amount?.parsedValue || currentPurchase.total_amount)?.toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between pb-1">
                        <span className="font-medium">Contact :</span>
                        <span>{currentPurchase.contact_person || "Non spécifié"}</span>
                      </div>
                      <div className="flex justify-between pb-1">
                        <span className="font-medium">Téléphone :</span>
                        <span>{currentPurchase.contact_phone || "Non spécifié"}</span>
                      </div>
                      <div className="flex justify-between pb-1">
                        <span className="font-medium">Adresse :</span>
                        <span className="text-right">{currentPurchase.delivery_address || "Non spécifiée"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Articles commandés :</h4>
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Produit</TableHead>
                            <TableHead>Réf.</TableHead>
                            <TableHead>Qté</TableHead>
                            <TableHead>Prix U.</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentPurchase.items?.map((item, index) => (
                            <TableRow key={`${item.product_id}-${index}`}>
                              <TableCell>{item.product_name || "Non spécifié"}</TableCell>
                              <TableCell>{item.product_sku || "-"}</TableCell>
                              <TableCell>{item.quantity?.parsedValue || item.quantity} {item.unit || "pcs"}</TableCell>
                              <TableCell>{Number(item.unit_price?.parsedValue || item.unit_price)?.toFixed(2)} €</TableCell>
                              <TableCell className="text-right">{Number(item.line_total?.parsedValue || (item.quantity?.parsedValue || item.quantity) * (item.unit_price?.parsedValue || item.unit_price))?.toFixed(2)} €</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </DialogDescription>
            )}
          </DialogHeader>
          <form onSubmit={handleUpdateStatus} className="mt-4 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status" className="text-gray-700">Statut de la commande</Label>
                <Select
                  name="status"
                  value={formData.status}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger id="status" className="w-full border border-gray-200">
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="in_transit">En transit</SelectItem>
                    <SelectItem value="delivered">Livré</SelectItem>
                    <SelectItem value="cancelled">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expected_delivery" className="text-gray-700">Date de livraison</Label>
                <Input
                  id="expected_delivery"
                  name="expected_delivery"
                  type="date"
                  value={formData.expected_delivery}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes" className="text-gray-700">Notes supplémentaires</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Ajouter des informations complémentaires..."
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" className="bg-sky-500 text-white">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Annuler la commande</DialogTitle>
            <DialogDescription>Veuillez indiquer la raison de l'annulation de la commande.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cancelReason" className="text-gray-700">Raison de l'annulation</Label>
              <Textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Entrez la raison de l'annulation..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCancelModalOpen(false)}>
              Annuler
            </Button>
            <Button type="button" className="bg-red-500 text-white" onClick={handleCancelPurchase}>
              Confirmer l'annulation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="mb-6">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Liste des Commandes</CardTitle>
          <Button onClick={() => setIsNewOrderModalOpen(true)} className="bg-sky-500 text-white">
            <Plus className="mr-2 h-4 w-4" /> Nouvelle Commande
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                <p className="text-sm text-gray-500">Chargement des commandes...</p>
              </div>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Une erreur est survenue lors du chargement des commandes. Veuillez réessayer.</AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Commande</TableHead>
                  <TableHead>Fournisseur</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Livraison</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead className="text-center">Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.order_number || "Non spécifié"}</TableCell>
                      <TableCell>{order.supplier_name || order.supplier?.name || "Non spécifié"}</TableCell>
                      <TableCell>{order.delivery_address || "Non spécifiée"}</TableCell>
                      <TableCell>{order.order_date ? new Date(order.order_date).toLocaleDateString("fr-FR") : "Non spécifié"}</TableCell>
                      <TableCell>{order.expected_delivery ? new Date(order.expected_delivery).toLocaleDateString("fr-FR") : "Non spécifié"}</TableCell>
                      <TableCell>{Number(order.total_amount?.parsedValue || order.total_amount)?.toFixed(2)} €</TableCell>
                      <TableCell className="text-center">
                        {(() => {
                          const statusMap = {
                            pending: { label: "En attente", variant: "outline" },
                            in_transit: { label: "En transit", variant: "secondary" },
                            delivered: { label: "Livré", variant: "default" },
                            cancelled: { label: "Annulé", variant: "destructive" },
                          };
                          const status = order.status?.toLowerCase();
                          const statusInfo = statusMap[status] || { label: status || "Inconnu", variant: "outline" };
                          return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
                        })()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="icon" onClick={() => openUpdateDialog(order.id)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {order.status?.toLowerCase() === "pending" && (
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-red-600 hover:bg-red-50 border-red-200"
                              onClick={() => {
                                setCurrentPurchaseId(order.id);
                                setIsCancelModalOpen(true);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan="8" className="text-center text-gray-500">
                      Aucune commande trouvée
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isNewOrderModalOpen} onOpenChange={setIsNewOrderModalOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Créer une Nouvelle Commande</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Fournisseur</Label>
              <Select
                value={newOrder.supplier_id}
                onValueChange={(v) => {
                  const supplier = suppliers.find((s) => String(s.id) === String(v));
                  setNewOrder({
                    ...newOrder,
                    supplier_id: v,
                    supplier_name: supplier ? supplier.name : "",
                  });
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sélectionner un fournisseur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Fournisseurs</SelectLabel>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Numéro de commande</Label>
                <Input
                  placeholder="ex: CMD-2025-001"
                  value={newOrder.order_number}
                  onChange={(e) => setNewOrder({ ...newOrder, order_number: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium">Date de livraison prévue</Label>
                <Input
                  type="date"
                  value={newOrder.expected_delivery}
                  onChange={(e) => setNewOrder({ ...newOrder, expected_delivery: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium">Numéro de livraison</Label>
                <Input
                  placeholder="ex: LIV-2025-001"
                  value={newOrder.delivery_number}
                  onChange={(e) => setNewOrder({ ...newOrder, delivery_number: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium">Transporteur</Label>
                <Input
                  placeholder="ex: DHL"
                  value={newOrder.carrier_name}
                  onChange={(e) => setNewOrder({ ...newOrder, carrier_name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium">Adresse de livraison</Label>
                <Input
                  placeholder="ex: Strasbourg, rue du marché"
                  value={newOrder.delivery_address}
                  onChange={(e) => setNewOrder({ ...newOrder, delivery_address: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium">Contact</Label>
                <Input
                  placeholder="Nom du contact"
                  value={newOrder.contact_person}
                  onChange={(e) => setNewOrder({ ...newOrder, contact_person: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium">Téléphone</Label>
                <Input
                  placeholder="ex: +261 34 00 000 00"
                  value={newOrder.contact_phone}
                  onChange={(e) => setNewOrder({ ...newOrder, contact_phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium">Notes</Label>
              <Textarea
                placeholder="Ajouter une remarque (facultatif)"
                value={newOrder.notes}
                onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
              />
            </div>
            <div className="mt-4">
              <h3 className="font-semibold mb-2 text-lg">Articles</h3>
              {newOrder.items.map((item, index) => {
                const totalLigne = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
                return (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-7 gap-2 mb-2 items-end">
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs font-medium">Produit</Label>
                      <Select
                        value={item.product_id}
                        onValueChange={(v) => updateItem(index, "product_id", v)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder={item.product_name || "Sélectionner un produit"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Produits</SelectLabel>
                            {products.map((p) => (
                              <SelectItem key={p.id} value={String(p.id)}>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Qté</Label>
                      <Input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Unité</Label>
                      <Input
                        value={item.unit}
                        onChange={(e) => updateItem(index, "unit", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Prix unitaire</Label>
                      <Input
                        type="number"
                        value={item.unit_price}
                        readOnly
                        className="cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Total</Label>
                      <div className="text-sm font-semibold text-right pr-2">{totalLigne.toFixed(2)} €</div>
                    </div>
                    <div className="flex items-center justify-center">
                      <Button size="icon" variant="ghost" onClick={() => removeItem(index)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              <Button variant="outline" onClick={addItem} className="mt-2">
                <Plus className="h-4 w-4 mr-2" /> Ajouter un article
              </Button>
            </div>
            <div className="border-t pt-3 mt-4 text-right">
              <h3 className="text-base font-semibold">
                Total général :{" "}
                <span className="text-sky-600">
                  {newOrder.items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0), 0).toFixed(2)} €
                </span>
              </h3>
            </div>
          </div>
          <DialogFooter className="mt-6 flex flex-col sm:flex-row justify-end gap-2">
            <Button variant="outline" onClick={() => setIsNewOrderModalOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleCreateOrder}
              className="bg-sky-500 text-white"
              disabled={posting}
            >
              {posting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Créer la commande"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Purchase;