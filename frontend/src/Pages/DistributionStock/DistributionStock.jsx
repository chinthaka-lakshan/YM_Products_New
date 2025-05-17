import React, { useEffect, useState } from "react";
import "./DistributionStock.css";
import AdminNavbar from "../../components/AdminNavbar/AdminNavbar.jsx";
import AdminSidebar from "../../components/Sidebar/AdminSidebar/AdminSidebar.jsx";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import axios from "axios";

const DistributionStock = () => {
  const [items, setItems] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newItem, setNewItem] = useState({
    item: "",
    unitPrice: "",
    quantity: "",
  });
  const [editItem, setEditItem] = useState({
    id: null,
    item: "",
    unitPrice: "",
    quantity: "",
  });
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/items")
      .then((response) => setItems(response.data))
      .catch((error) => console.error("Error fetching items:", error));
  }, []);

  const handleAddItem = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/items", newItem);
      setItems([...items, response.data.item]);
      setNewItem({ item: "", unitPrice: "", quantity: "" });
      alert("Item added successfully!");
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding item:", error);
      alert("Failed to add item.");
    }
  };

  const handleEditClick = (item) => {
    const index = items.findIndex((i) => i.id === item.id);
    setEditIndex(index);
    setEditItem(item);
    setShowEditModal(true);
  };

  const handleEditItem = async () => {
    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/api/items/${editItem.id}`,
        editItem
      );
      if (response.status === 200) {
        const updatedItems = [...items];
        updatedItems[editIndex] = editItem;
        setItems(updatedItems);
        setShowEditModal(false);
        alert("Item updated successfully!");
      }
    } catch (error) {
      console.error("Error updating item:", error);
      alert("Failed to update item.");
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/api/items/${id}`);
      setItems(items.filter((item) => item.id !== id));
      alert("Item deleted successfully!");
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item.");
    }
  };

  return (
    <div className="DistributionStock">
      <AdminSidebar />
      <div className="DistributionStockContainer">
        <AdminNavbar />
        <div className="DistributionStockCardsContainer">
          <div className="DistributionStockTop">
            <h1>Distribution Stock</h1>
            <button className="AddButton" onClick={() => setShowAddModal(true)}>
              Add New
            </button>
          </div>
          <div className="DistributionStockGrid">
            {items.map((item) => (
              <div key={item.id} className="DistributionItemCard">
                <h2>{item.item}</h2>
                <div className="DistributionItemCardMiddle">
                  <ShoppingCartIcon className="DistributionItemCardIcon" />
                  <div className="DistributionItemCardDetails">
                    <span><strong>Price (LKR):</strong> {item.unitPrice}</span>
                    <span><strong>Quantity:</strong> {item.quantity}</span>
                  </div>
                </div>
                <div className="DistributionItemCardButtons">
                  <button
                    className="DeleteButton"
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    Delete
                  </button>
                  <button
                    className="EditButton"
                    onClick={() => handleEditClick(item)}
                  >
                    Update
                  </button>
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
            <h2>Add New Distribution Item</h2>
            <div className="ModalMiddle">
              <ShoppingCartIcon className="ModalIcon" />
              <div className="ModalInputs">
                <input
                  type="text"
                  placeholder="Enter Item Name"
                  value={newItem.item}
                  onChange={(e) =>
                    setNewItem({ ...newItem, item: e.target.value })
                  }
                />
                <input
                  type="number"
                  placeholder="Enter Unit Price (LKR)"
                  value={newItem.unitPrice}
                  onChange={(e) =>
                    setNewItem({ ...newItem, unitPrice: e.target.value })
                  }
                />
                <input
                  type="number"
                  placeholder="Enter Quantity"
                  value={newItem.quantity}
                  onChange={(e) =>
                    setNewItem({ ...newItem, quantity: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="ModalButtons">
              <button
                className="CancelButton"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button className="SaveButton" onClick={handleAddItem}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="ModalBackdrop">
          <div className="Modal">
            <h2>Update Distribution Item</h2>
            <div className="ModalMiddle">
              <ShoppingCartIcon className="ModalIcon" />
              <div className="ModalInputs">
                <input
                  type="text"
                  placeholder="Enter Item Name"
                  value={editItem.item}
                  onChange={(e) =>
                    setEditItem({ ...editItem, item: e.target.value })
                  }
                />
                <input
                  type="number"
                  placeholder="Enter Unit Price (LKR)"
                  value={editItem.unitPrice}
                  onChange={(e) =>
                    setEditItem({ ...editItem, unitPrice: e.target.value })
                  }
                />
                <input
                  type="number"
                  placeholder="Enter Quantity"
                  value={editItem.quantity}
                  onChange={(e) =>
                    setEditItem({ ...editItem, quantity: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="ModalButtons">
              <button
                className="CancelButton"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button className="SaveButton" onClick={handleEditItem}>
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistributionStock;