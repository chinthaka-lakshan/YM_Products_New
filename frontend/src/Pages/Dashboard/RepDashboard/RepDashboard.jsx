import React, { useState, useRef, useEffect } from "react";
import "./RepDashboard.css";
import RepSidebar from "../../../components/Sidebar/RepSidebar/RepSidebar";
import RepNavbar from "../../../components/RepNavbar/RepNavbar";
import orderIcon from "../../../assets/order.png";
import returnIcon from "../../../assets/return.png";
import GoodReturnIcon from "../../../assets/GoodReturn.png";
import BadReturnIcon from "../../../assets/BadReturn.png";
import StoreFrontIcon from "@mui/icons-material/Store";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";

const RepDashboard = () => {
  const [shops, setShops] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [isReturn, setIsReturn] = useState(false); // To distinguish between order/return
  const [isGood, setIsGood] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState(null); // For viewing confirmed order
  const [totalOrderDiscount, setTotalOrderDiscount] = useState(0);

  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showShopsModal, setShowShopsModal] = useState(false);
  const [showItemsModal, setShowItemsModal] = useState(false);

  const [searchShopTerm, setSearchShopTerm] = useState("");
  const [searchItemTerm, setSearchItemTerm] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef();

  const [returnBalance, setReturnBalance] = useState(0);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        window.innerWidth <= 768 &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  //fetch shops
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/shops");
        setShops(response.data);
      } catch (error) {
        console.error("Error fetching shops: ", error);
      }
    };
    fetchShops();
  }, []);

  //fetch items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/items");
        setItems(response.data);
      } catch (error) {
        console.error("Error fetching items: ", error);
      }
    };
    fetchItems();
  }, []);

  const handleAddOrderClick = () => {
    setIsReturn(false);
    setTotalOrderDiscount(0);
    setShowShopsModal(true);
  };

  const handleAddReturnClick = () => {
    setIsReturn(true);
    setShowReturnModal(true);
  };

  const handleAddGoodReturnClick = () => {
    setShowReturnModal(false);
    setShowShopsModal(true);
    setIsGood(true);
  };

  const handleAddBadReturnClick = () => {
    setShowReturnModal(false);
    setShowShopsModal(true);
    setIsGood(false);
  };

  // Modify the handleShopSelect function to fetch return balance
  const handleShopSelect = async (shop) => {
    setSelectedShop(shop);
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/returns/${shop.id}`,
        { withCredentials: true }
      );
      setReturnBalance(response.data.return_balance || 0);
    } catch (error) {
      console.error("Error fetching return balance", error);
      setReturnBalance(0);
    }
    setShowShopsModal(false);
    setSearchShopTerm("");
    setShowItemsModal(true);
  };

  const handleItemSelect = (item) => {
    setSelectedItems([
      ...selectedItems,
      { item: item.item, orderQty: 1, unitPrice: item.unitPrice },
    ]);
  };

  const updateItemQuantity = (itemName, quantity) => {
    setSelectedItems((prev) =>
      prev.map((i) => (i.item === itemName ? { ...i, orderQty: quantity } : i))
    );
  };

  const removeSelectedItem = (itemName) => {
    setSelectedItems((prev) => prev.filter((i) => i.item !== itemName));
  };

  const handleCancelOrder = () => {
    setSelectedItems([]);
    setSelectedShop(null);
    setShowItemsModal(false);
    setSearchItemTerm("");
    setEditingOrderId(null);
    setTotalOrderDiscount(0);
  };

  const handleConfirmOrder = () => {
    const confirmedOrder = {
      shop: selectedShop,
      items: selectedItems,
      isReturn: isReturn,
      isGood: isGood,
    };

    setOrderToEdit(confirmedOrder); // Show confirmed view
    setShowItemsModal(false);
    setSearchItemTerm("");
    setSelectedItems([]);
    setSelectedShop(null);
    setTotalOrderDiscount(0);
  };

  const handleEditOrder = () => {
    if (orderToEdit) {
      setSelectedShop(orderToEdit.shop);
      setSelectedItems(orderToEdit.items);
      setIsReturn(orderToEdit.isReturn);
      setShowItemsModal(true);
      setOrderToEdit(null);
    }
  };

  const username = localStorage.getItem("username");
  const userToken = localStorage.getItem("admin_token");

  const checkAdjustedOrderCost = async (shopId, orderAmount) => {
    try {
      console.log("se;", selectedShop);

      console.log("id", shopId);

      if (shopId != null) {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/calculate-order-cost/${shopId}/${orderAmount}`,
          { withCredentials: true }
        );
        const data = response.data;
        console.log("respons: ", data.return_balance);
        console.log("kooo");

        return data.return_balance ?? orderAmount;
      }
    } catch (error) {
      console.error("Error fetching order cost", error);
      return orderAmount;
    }
  };

  let itemsArray;
  const setItemsAfterSelection = () => {
    if (selectedItems != null) {
      itemsArray = Array.isArray(selectedItems?.items)
        ? selectedItems.items
        : [];
    }
    console.log("itemssss: ", itemsArray);
  };
  let readyToSaveOrder;
  const setReadyToSaveOrder = () => {
    readyToSaveOrder = {
      shop_id: orderToEdit?.shop.id,
      total_price: 0,
      items: itemsArray.map((item) => ({
        item_id: item.id,
        quantity: item.orderQty,
        item_expenses: item.itemExpenses || 0,
      })),
      user_name: username,
      status: "Pending",
      return_balance: 0,
    };
  };

  const handleGenerateInvoice = () => {
    setItemsAfterSelection();
    setReadyToSaveOrder();
    console.log("ko", orderToEdit);
    console.log(selectedShop);

    console.log("save", readyToSaveOrder);

    //if (selectedShop != null) {
    const totalPrice = orderToEdit?.items.reduce(
      (sum, item) => sum + item.unitPrice * item.orderQty,
      0
    );
    console.log("tot", totalPrice);

    const afterTot = checkAdjustedOrderCost(selectedShop?.id, totalPrice);

    if (orderToEdit.isReturn) {
      const remainBalance = axios
        .get(`http://127.0.0.1:8000/api/returns/${orderToEdit.shop.id}`)
        .then((data) => {
          if (data != null) {
            return data;
          }
        });
      const returnRecord = {
        shop_id: orderToEdit?.shop.id,
        type: "",
        return_cost: totalPrice,
        user_name: username,
        items: itemsArray.map((item) => ({
          item_id: item.id,
          qty: item.orderQty,
          weight: item.itemExpenses || 0,
        })),
      };
      if (orderToEdit.isGood) {
        returnRecord.type = "good";
      } else {
        returnRecord.type = "bad";
      }
      console.log("newR: ", newReturn);
      readyToSaveOrder.total_price = afterTot;
      readyToSaveOrder.return_balance = remainBalance;
      try {
        if (returnRecord.type === "good" || returnRecord.type === "bad") {
          const response = axios.post(
            "http://127.0.0.1:8000/api/returns",
            returnRecord,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userToken}`,
              },
            }
          );
          console.log("Return saved Successfully!", response.data);
          console.log("Return data:!", response.data.data);

          if (response != null) {
            console.log("erres:", response);

            setCurrentReturnInvoiceItems(response.data?.items);
          }
        }
      } catch (error) {
        console.error("Error saving Return!", error);
      }
    } else {
      console.log("order:", readyToSaveOrder);

      const response = axios.post(
        "http://127.0.0.1:8000/api/orders",
        readyToSaveOrder,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          //withCredentials: true,
        }
        // body: JSON.stringify(newOrder),
      );
      if (response != null) {
        console.log(response.data);
        setCurrentReturnInvoiceItems(response.data.data?.items);
      }
    }
    //setReturnToEdit(newReturn);
    console.log("Generating invoice for:", orderToEdit);
    // Logic to generate invoice (PDF/download/API call)

    console.log("selt", orderToEdit.items);
    console.log(orderToEdit);
    console.log("Ready to save: ", readyToSaveOrder);
    // }
  };

  return (
    <div className="RepDashboard">
      <RepSidebar isOpen={sidebarOpen} ref={sidebarRef} />
      <div className="RepDashboardContainer">
        <RepNavbar onMenuClick={toggleSidebar} />

        <div className="RepButtonsContainer">
          <div className="RepButton" onClick={handleAddOrderClick}>
            <img src={orderIcon} alt="Add Order" />
            <p>Add Order</p>
          </div>
          <div className="RepButton" onClick={handleAddReturnClick}>
            <img src={returnIcon} alt="Add Return" />
            <p>Add Return</p>
          </div>
        </div>

        {/* Return Type Modal */}
        {showReturnModal && (
          <div className="ModalBackdrop">
            <div className="Modal">
              <h2 className="ModalTitle">Select Return Type</h2>
              <div className="ScrollableContent">
                <div className="ReturnButtonsContainer">
                  <div
                    className="ReturnButton"
                    onClick={handleAddGoodReturnClick}
                  >
                    <img src={GoodReturnIcon} alt="Good Return" />
                    <p>Good Return</p>
                  </div>
                  <div
                    className="ReturnButton"
                    onClick={handleAddBadReturnClick}
                  >
                    <img src={BadReturnIcon} alt="Bad Return" />
                    <p>Bad Return</p>
                  </div>
                </div>
              </div>
              <div className="ModalButtons">
                <button
                  className="CancelButton"
                  onClick={() => setShowReturnModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Shops Modal */}
        {showShopsModal && (
          <div className="ModalBackdrop">
            <div className="Modal">
              <h2 className="ModalTitle">Select Shop</h2>
              <div className="SearchInputWrapper">
                <input
                  type="text"
                  className="SearchInput"
                  placeholder="Search Shops..."
                  value={searchShopTerm}
                  onChange={(e) => setSearchShopTerm(e.target.value)}
                />
                <SearchIcon className="SearchIcon" />
              </div>
              <div className="ScrollableContent">
                <div className="ShopsGrid">
                  {[...shops]
                    .filter((shop) =>
                      shop.shop_name
                        .toLowerCase()
                        .includes(searchShopTerm.toLowerCase())
                    )
                    .sort((a, b) => a.shop_name.localeCompare(b.shop_name))
                    .map((shop, index) => (
                      <div
                        key={index}
                        className="ShopCard"
                        onClick={() => handleShopSelect(shop)}
                      >
                        <h2 className="CardTitle">{shop.shop_name}</h2>
                        <div className="ShopCardMiddle">
                          <StoreFrontIcon className="ShopCardIcon" />
                          <div className="ShopCardDetails">
                            <span>{shop.location}</span>
                            <span>{shop.contact}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              <div className="ModalButtons">
                <button
                  className="CancelButton"
                  onClick={() => setShowShopsModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Items Modal */}
        {showItemsModal && (
          <div className="ModalBackdrop">
            <div className="Modal">
              <h2 className="ModalTitle">
                {isReturn ? "Select Return Items" : "Select Items"}
              </h2>
              <div className="SearchInputWrapper">
                <input
                  type="text"
                  className="SearchInput"
                  placeholder="Search Items..."
                  value={searchItemTerm}
                  onChange={(e) => setSearchItemTerm(e.target.value)}
                />
                <SearchIcon className="SearchIcon" />
              </div>
              <div className="ScrollableContent">
                <div className="DistributionStockGrid">
                  {[...items]
                    .filter((item) =>
                      item.item
                        .toLowerCase()
                        .includes(searchItemTerm.toLowerCase())
                    )
                    .sort((a, b) => a.item.localeCompare(b.item))
                    .map((item, index) => {
                      const selected = selectedItems.find(
                        (i) => i.item === item.item
                      );
                      return (
                        <div key={index} className="DistributionItemCard">
                          <h2 className="CardTitle">{item.item}</h2>
                          <div className="DistributionItemCardMiddle">
                            <ShoppingCartIcon className="DistributionItemCardIcon" />
                            <div className="DistributionItemCardDetails">
                              <span>
                                <strong>Price (LKR): </strong>
                                {item.unitPrice}
                              </span>
                              <span>
                                <strong>In Stock: </strong>
                                {item.quantity}
                              </span>
                              {selected ? (
                                <div className="SelectedItemControl">
                                  <input
                                    type="number"
                                    min="1"
                                    className="QtyInput"
                                    value={selected.orderQty}
                                    onChange={(e) => {
                                      const qty = parseInt(e.target.value, 10);
                                      if (!isNaN(qty) && qty > 0) {
                                        updateItemQuantity(item.item, qty);
                                      } else {
                                        updateItemQuantity(item.item, "");
                                      }
                                    }}
                                    placeholder="Qty"
                                  />
                                  <button
                                    className="ClearQtyBtn"
                                    title="Clear"
                                    onClick={() =>
                                      removeSelectedItem(item.item)
                                    }
                                  >
                                    {" "}
                                    ❌{" "}
                                  </button>
                                </div>
                              ) : (
                                <button
                                  className="SelectItemBtn"
                                  onClick={() => handleItemSelect(item)}
                                >
                                  Select
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
              <div className="ModalButtons">
                <button className="CancelButton" onClick={handleCancelOrder}>
                  Cancel
                </button>
                <button className="ConfirmButton" onClick={handleConfirmOrder}>
                  {editingOrderId ? "Update" : isReturn ? "Confirm" : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmed Order View */}
        {orderToEdit && (
          <div className="ModalBackdrop">
            <div className="Modal">
              <h2 className="ModalTitle">
                {orderToEdit.isReturn ? "Return Items" : "Order Items"}
              </h2>
              <h3 className="ModalSubTitle">
                {orderToEdit.shop?.shop_name}
                {orderToEdit.shop.location
                  ? ` - ${orderToEdit.shop.location}`
                  : ""}
              </h3>
              <div className="ScrollableContent">
                <table className="ConfirmedOrderTable">
                  <colgroup>
                    <col style={{ width: "28%" }} />
                    <col style={{ width: "22%" }} />
                    <col style={{ width: "25%" }} />
                    <col style={{ width: "25%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th class="QuantityHeader">Quantity</th>
                      <th>Unit Price (LKR)</th>
                      <th>Total (LKR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...orderToEdit.items]
                      .sort((a, b) => a.item.localeCompare(b.item))
                      .map((item, index) => (
                        <tr key={item.index}>
                          <td>{item.item}</td>
                          <td>{item.orderQty}</td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              value={
                                item.editedPrice !== undefined
                                  ? item.editedPrice
                                  : item.unitPrice
                              } // Show editedPrice if available, else fallback to original unitPrice
                              onChange={(e) => {
                                const value = e.target.value;
                                // Allow empty input (clear the field)
                                if (value === "") {
                                  setOrderToEdit((prev) => {
                                    const updatedItems = [...prev.items];
                                    updatedItems[index].editedPrice = ""; // Set to empty if cleared
                                    return { ...prev, items: updatedItems };
                                  });
                                  return;
                                }
                                // Validate and allow numbers with up to 2 decimals
                                const regex = /^\d*\.?\d{0,2}$/;
                                if (regex.test(value)) {
                                  setOrderToEdit((prev) => {
                                    const updatedItems = [...prev.items];
                                    updatedItems[index].editedPrice = value;
                                    return { ...prev, items: updatedItems };
                                  });
                                }
                              }}
                              onBlur={() => {
                                setOrderToEdit((prev) => {
                                  const updatedItems = [...prev.items];
                                  const currentEdited =
                                    updatedItems[index].editedPrice;
                                  // If the field is empty, fallback to original price
                                  if (
                                    currentEdited === "" ||
                                    currentEdited === undefined
                                  ) {
                                    updatedItems[index].editedPrice = undefined; // This will allow the input to fallback to unitPrice
                                  } else {
                                    const val = parseFloat(currentEdited);
                                    updatedItems[index].editedPrice = isNaN(val)
                                      ? ""
                                      : val.toFixed(2); // Ensure two decimal points
                                  }
                                  return { ...prev, items: updatedItems };
                                });
                              }}
                              className="UnitPriceInput"
                            />
                          </td>
                          <td>
                            {(() => {
                              const unitPrice =
                                item.editedPrice !== undefined &&
                                item.editedPrice !== ""
                                  ? parseFloat(item.editedPrice)
                                  : parseFloat(item.unitPrice);
                              return (item.orderQty * unitPrice).toFixed(2);
                            })()}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td>Total Items: {orderToEdit.items.length}</td>
                      <td>
                        Total Units:{" "}
                        {orderToEdit.items.reduce(
                          (sum, item) => sum + Number(item.orderQty || 0),
                          0
                        )}
                      </td>
                      <td>
                        {orderToEdit.isReturn
                          ? "Return Difference"
                          : "Item Discounts"}
                        :{" "}
                        {orderToEdit.items
                          .reduce((sum, item) => {
                            const originalPrice = item.unitPrice; // The original price from the inventory
                            const editedUnitPrice =
                              item.editedPrice || originalPrice; // The price entered by the user
                            const priceDifference =
                              originalPrice - editedUnitPrice; // Difference between original and edited price
                            const itemDifference =
                              priceDifference * item.orderQty; // Difference for this item based on quantity
                            return sum + itemDifference;
                          }, 0)
                          .toFixed(2)}
                      </td>
                      <td>
                        Sub Total:{" "}
                        {orderToEdit.items
                          .reduce((sum, item) => {
                            const unitPrice =
                              item.editedPrice !== undefined &&
                              item.editedPrice !== ""
                                ? parseFloat(item.editedPrice)
                                : parseFloat(item.unitPrice);
                            return sum + item.orderQty * unitPrice;
                          }, 0)
                          .toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      {orderToEdit.isReturn ? (
                        <td colSpan="2"></td>
                      ) : (
                        <td>
                          <label>Order Discount:</label>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={totalOrderDiscount}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Allow empty string to let user clear the input
                              if (value === "") {
                                setTotalOrderDiscount("");
                                return;
                              }
                              // Regex to allow only numbers with up to 2 decimal places
                              const regex = /^\d*\.?\d{0,2}$/;
                              if (regex.test(value)) {
                                setTotalOrderDiscount(value);
                              }
                            }}
                            onBlur={() => {
                              // Format to 2 decimal places on blur if value is valid
                              if (totalOrderDiscount !== "") {
                                const parsed = parseFloat(totalOrderDiscount);
                                if (!isNaN(parsed)) {
                                  setTotalOrderDiscount(parsed.toFixed(2));
                                }
                              }
                            }}
                            placeholder="0.00"
                            className="DiscountInput"
                          />
                        </td>
                      )}
                      <td>
                        <label>Total Discount: </label>
                        {(() => {
                          const itemDiscount = orderToEdit.items.reduce((sum, item) => {
                            const originalPrice = parseFloat(item.unitPrice);
                            const editedPrice =
                              item.editedPrice !== undefined && item.editedPrice !== ""
                                ? parseFloat(item.editedPrice)
                                : originalPrice;
                            return sum + (originalPrice - editedPrice) * item.orderQty;
                          }, 0);
                          const orderDiscount = parseFloat(totalOrderDiscount || 0);
                          return (itemDiscount + orderDiscount).toFixed(2);
                        })()}
                      </td>
                      <td>
                        <div>Return Balance: {returnBalance.toFixed(2)}</div>
                      </td>
                      <td>
                        <strong>Grand Total:</strong>{" "}
                        {(
                          (orderToEdit?.items?.reduce((sum, item) => {
                            const unitPrice =
                              item.editedPrice !== undefined &&
                              item.editedPrice !== ""
                                ? parseFloat(item.editedPrice)
                                : parseFloat(item.unitPrice);
                            return sum + item.orderQty * unitPrice;
                          }, 0) || 0) - (parseFloat(totalOrderDiscount) || 0)
                        ).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div className="ModalButtons">
                <button
                  className="CancelButton"
                  onClick={() => setOrderToEdit(null)}
                >
                  Cancel
                </button>
                <button className="EditButton" onClick={handleEditOrder}>
                  Edit {orderToEdit.isReturn ? "Return" : "Order"}
                </button>
                <button
                  className="GenerateInvoice"
                  onClick={handleGenerateInvoice}
                >
                  Generate Invoice
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepDashboard;
