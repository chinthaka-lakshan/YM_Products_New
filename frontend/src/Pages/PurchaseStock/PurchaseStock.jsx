import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "./PurchaseStock.css";
import AdminNavbar from "../../components/AdminNavbar/AdminNavbar";
import AdminSidebar from "../../components/Sidebar/AdminSidebar/AdminSidebar";
import InventoryIcon from "@mui/icons-material/ShoppingCart";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";

const PurchaseStock = () => {
    const [items, setItems] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [newItem, setNewItem] = useState({ item: "", weight: "" });
    const [editItem, setEditItem] = useState({ item: "", weight: "" });
    const [editIndex, setEditIndex] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(null);
    const navigate = useNavigate();

    // Fetch purchase stocks from API
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Verify token first
            try {
                await api.get('/auth/verify');
            } catch (verifyError) {
                localStorage.removeItem('auth_token');
                navigate('/login');
                return;
            }

            const response = await api.get("/purchase_stock");
            setItems(response.data);
        } catch (error) {
            console.error("Error fetching purchase stock:", error);
            setError(error.response?.data?.message || "Failed to load purchase stock");
            if (error.response?.status === 401) {
                localStorage.removeItem('auth_token');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [navigate]);

    // Add new item via API
    const handleAddItem = async () => {
        if (!newItem.item || !newItem.weight) {
            alert("Please fill all fields");
            return;
        }

        try {
            await api.post("/purchase_stock", newItem);
            await fetchData();
            setNewItem({ item: "", weight: "" });
            setShowAddModal(false);
            alert("Item added successfully!");
        } catch (error) {
            console.error("Error adding purchase stock:", error);
            if (error.response?.status === 401) {
                localStorage.removeItem('auth_token');
                navigate('/login');
            } else {
                alert(error.response?.data?.message || "Failed to add item. Check input.");
            }
        }
    };

    const handleEditClick = (index) => {
        setEditIndex(index);
        setEditItem(items[index]);
        setShowEditModal(true);
    };

    const handleEditItem = async () => {
        try {
            const id = items[editIndex].id;
            await api.put(`/purchase_stock/${id}`, editItem);
            await fetchData();
            setShowEditModal(false);
            alert("Item updated successfully!");
        } catch (error) {
            console.error("Error updating purchase stock:", error);
            if (error.response?.status === 401) {
                localStorage.removeItem('auth_token');
                navigate('/login');
            } else {
                alert(error.response?.data?.message || "Failed to update item.");
            }
        }
    };

    const handleDeleteItem = async (id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;

        try {
            setDeleteLoading(id);
            await api.delete(`/purchase_stock/${id}`);
            await fetchData();
            alert("Item deleted successfully!");
        } catch (error) {
            console.error("Error deleting item:", error);
            if (error.response?.status === 401) {
                localStorage.removeItem('auth_token');
                navigate('/login');
            } else {
                alert(error.response?.data?.message || "Failed to delete item.");
            }
        } finally {
            setDeleteLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="PurchaseStock">
                <AdminSidebar />
                <div className="PurchaseStockContainer">
                    <AdminNavbar />
                    <div className="loading-container">
                        <CircularProgress />
                        <p>Loading purchase stock...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="PurchaseStock">
                <AdminSidebar />
                <div className="PurchaseStockContainer">
                    <AdminNavbar />
                    <div className="error-container">
                        <Alert severity="error">{error}</Alert>
                        <Button 
                            variant="contained" 
                            color="primary"
                            onClick={fetchData}
                        >
                            Retry
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="PurchaseStock">
            <AdminSidebar />
            <div className="PurchaseStockContainer">
                <AdminNavbar />
                <div className="PurchaseStockCardsContainer">
                    <div className="PurchaseStockTop">
                        <h1>Purchase Stock</h1>
                        <Button 
                            variant="contained" 
                            color="primary"
                            onClick={() => setShowAddModal(true)}
                        >
                            Add New
                        </Button>
                    </div>
                    <div className="PurchaseStockGrid">
                        {items.map((item, index) => (
                            <div key={item.id} className="PurchaseItemCard">
                                <h2>{item.item}</h2>
                                <div className="PurchaseItemCardMiddle">
                                    <InventoryIcon className="PurchaseItemCardIcon" />
                                    <div className="PurchaseItemCardDetails">
                                        <span><strong>Weight (kg): </strong>{item.weight}</span>
                                    </div>
                                </div>
                                <div className="PurchaseItemCardButtons">
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={() => handleDeleteItem(item.id)}
                                        disabled={deleteLoading === item.id}
                                    >
                                        {deleteLoading === item.id ? <CircularProgress size={20} /> : "Delete"}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => handleEditClick(index)}
                                    >
                                        Update
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="ModalBackdrop">
                    <div className="Modal">
                        <h2>Add New Purchase Item</h2>
                        <div className="ModalMiddle">
                            <InventoryIcon className="ModalIcon" />
                            <div className="ModalInputs">
                                <input
                                    type="text"
                                    placeholder="Enter Item Name"
                                    value={newItem.item}
                                    onChange={(e) => setNewItem({ ...newItem, item: e.target.value })}
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Enter Weight (kg)"
                                    value={newItem.weight}
                                    onChange={(e) => setNewItem({ ...newItem, weight: e.target.value })}
                                    required
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>
                        <div className="ModalButtons">
                            <Button 
                                variant="outlined"
                                onClick={() => setShowAddModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button 
                                variant="contained"
                                color="primary"
                                onClick={handleAddItem}
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="ModalBackdrop">
                    <div className="Modal">
                        <h2>Update Purchase Item</h2>
                        <div className="ModalMiddle">
                            <InventoryIcon className="ModalIcon" />
                            <div className="ModalInputs">
                                <input
                                    type="text"
                                    placeholder="Enter Item Name"
                                    value={editItem.item}
                                    onChange={(e) => setEditItem({ ...editItem, item: e.target.value })}
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Enter Weight (kg)"
                                    value={editItem.weight}
                                    onChange={(e) => setEditItem({ ...editItem, weight: e.target.value })}
                                    required
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>
                        <div className="ModalButtons">
                            <Button 
                                variant="outlined"
                                onClick={() => setShowEditModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button 
                                variant="contained"
                                color="primary"
                                onClick={handleEditItem}
                            >
                                Update
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PurchaseStock;