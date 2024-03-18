import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Form, Button } from "react-bootstrap";
import "../style.css";
import Navigation from "../Acceuil/Navigation";
import Search from "../Acceuil/Search";
import TablePagination from "@mui/material/TablePagination";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faFilePdf,
  faFileExcel,
  faPrint,
} from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { Toolbar } from "@mui/material";
const StockList = () => {
  // const [existingStock, setExistingStock] = useState([]);
  const [produits, setProduits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [stocks, setStocks] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [notifications, setNotifications] = useState([]);

  //-------------------edit-----------------------//
  const [editingStock, setEditingStock] = useState(null); // State to hold the stock being edited
  const [editingStockId, setEditingStockId] = useState(null);

  //---------------form-------------------//
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    produit_id: "",
    quantite: "",
    seuil_minimal: "",
  });
  const [formContainerStyle, setFormContainerStyle] = useState({
    right: "-100%",
  });
  const [tableContainerStyle, setTableContainerStyle] = useState({
    marginRight: "0px",
  });

  const fetchStocks = async () => {
    try {
      const produitResponse = await axios.get(
        "http://localhost:8000/api/produits"
      );

      console.log("API Response for Produits:", produitResponse.data.produit);

      setProduits(produitResponse.data.produit);
      const response = await axios.get("http://localhost:8000/api/stock");

      console.log("API Response:", response.data);

      setStocks(response.data.stocks);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  useEffect(() => {
    const filtered =
      stocks &&
      stocks.filter((stock) =>
        stock.quantite
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    setFilteredStocks(filtered);
  }, [stocks, searchTerm]);
  const getProduitDesignation = (produitId) => {
    try {
      const produit = produits.find((produit) => produit.id === produitId);

      return produit ? produit.designation : "";
    } catch (error) {
      console.error(`Error finding produit with ID ${produitId}:`, error);
      return "";
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleCheckboxChange = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  //------------------------- stock Delete Selected ---------------------//

  const handleDeleteSelected = () => {
    Swal.fire({
      title: "Êtes-vous sûr de vouloir supprimer ?",
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Oui",
      denyButtonText: "Non",
      customClass: {
        actions: "my-actions",
        cancelButton: "order-1 right-gap",
        confirmButton: "order-2",
        denyButton: "order-3",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        selectedItems.forEach((id) => {
          axios
            .delete(`http://localhost:8000/api/stock/${id}`)
            .then((response) => {
              fetchStocks();
              Swal.fire({
                icon: "success",
                title: "Succès!",
                text: "stock supprimé avec succès.",
              });
            })
            .catch((error) => {
              console.error("Erreur lors de la suppression du stock:", error);
              Swal.fire({
                icon: "error",
                title: "Erreur!",
                text: "Échec de la suppression du stock.",
              });
            });
        });
      }
    });

    setSelectedItems([]);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectAllChange = () => {
    setSelectAll(!selectAll);
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(stocks.map((stock) => stock.id));
    }
  };
  //------------------------- stock print ---------------------//

  const printList = (tableId, title, stockList) => {
    const printWindow = window.open(" ", "_blank", " ");

    if (printWindow) {
      const tableToPrint = document.getElementById(tableId);

      if (tableToPrint) {
        const newWindowDocument = printWindow.document;
        newWindowDocument.write(`
            <!DOCTYPE html>
            <html lang="fr">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <h1 class="h1"> Gestion Commandes </h1>
              <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css">
              <style>
  
                body {
                  font-family: 'Arial', sans-serif;
                  margin-bottom: 60px;
                }
  
                .page-header {
                  text-align: center;
                  font-size: 24px;
                  margin-bottom: 20px;
                }
  
                .h1 {
                  text-align: center;
                }
  
                .list-title {
                  font-size: 18px;
                  margin-bottom: 10px;
                }
  
                .header {
                  font-size: 16px;
                  margin-bottom: 10px;
                }
  
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-bottom: 20px;
                }
  
                th, td {
                  border: 1px solid #ddd;
                  padding: 8px;
                  text-align: left;
                }
  
                .footer {
                  position: fixed;
                  bottom: 0;
                  width: 100%;
                  text-align: center;
                  font-size: 14px;
                  margin-top: 30px;
                  background-color: #fff;
                }
  
                @media print {
                  .footer {
                    position: fixed;
                    bottom: 0;
                  }
  
                  body {
                    margin-bottom: 0;
                  }
                  .no-print {
                    display: none;
                  }
                }
  
                .content-wrapper {
                  margin-bottom: 100px;
                }
  
                .extra-space {
                  margin-bottom: 30px;
                }
              </style>
            </head>
            <body>
              <div class="page-header print-no-date">${title}</div>
              <ul>
                ${
                  Array.isArray(stockList)
                    ? stockList.map((item) => `<li>${item}</li>`).join("")
                    : ""
                }
              </ul>
              <div class="content-wrapper">
                ${tableToPrint.outerHTML}
              </div>
              <script>
                setTimeout(() => {
                  window.print();
                  window.onafterprint = function () {
                    window.close();
                  };
                }, 1000);
              </script>
            </body>
            </html>
          `);

        newWindowDocument.close();
      } else {
        console.error(`Table with ID '${tableId}' not found.`);
      }
    } else {
      console.error("Error opening print window.");
    }
  };
  //------------------------- stock export to pdf ---------------------//

  const exportToPdf = () => {
    const pdf = new jsPDF();

    // Define the columns and rows for the table
    const columns = [
      "ID",
      "Raison Sociale",
      "Adresse",
      "Téléphone",
      "Ville",
      "Abréviation",
      "ice",
      "User",
    ];
    const selectedStocks = stocks.filter((stock) =>
      selectedItems.includes(stock.id)
    );
    const rows = selectedStocks.map((stock) => [
      stock.id,
      stock.raison_sociale,
      stock.adresse,
      stock.tele,
      stock.ville,
      stock.abreviation,
      stock.ice,
      stock.user_id,
    ]);

    // Set the margin and padding
    const margin = 10;
    const padding = 5;

    // Calculate the width of the columns
    const columnWidths = columns.map(
      (col) => pdf.getStringUnitWidth(col) * 5 + padding * 2
    );
    const tableWidth = columnWidths.reduce((total, width) => total + width, 0);

    // Calculate the height of the rows
    const rowHeight = 10;
    const tableHeight = rows.length * rowHeight;

    // Set the table position
    const startX = (pdf.internal.pageSize.width - tableWidth) / 2;
    const startY = margin;

    // Add the table headers
    pdf.setFont("helvetica", "bold");
    pdf.setFillColor(200, 220, 255);
    pdf.rect(startX, startY, tableWidth, rowHeight, "F");
    pdf.autoTable({
      head: [columns],
      startY: startY + padding,
      styles: {
        fillColor: [200, 220, 255],
        textColor: [0, 0, 0],
        fontSize: 10,
      },
      columnStyles: {
        0: { cellWidth: columnWidths[0] },
        1: { cellWidth: columnWidths[1] },
        2: { cellWidth: columnWidths[2] },
        3: { cellWidth: columnWidths[3] },
        4: { cellWidth: columnWidths[4] },
        5: { cellWidth: columnWidths[5] },
        6: { cellWidth: columnWidths[6] },
        7: { cellWidth: columnWidths[7] },
      },
    });

    // Add the table rows
    pdf.setFont("helvetica", "");
    pdf.autoTable({
      body: rows,
      startY: startY + rowHeight + padding * 2,
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: columnWidths[0] },
        1: { cellWidth: columnWidths[1] },
        2: { cellWidth: columnWidths[2] },
        3: { cellWidth: columnWidths[3] },
        4: { cellWidth: columnWidths[4] },
        5: { cellWidth: columnWidths[5] },
        6: { cellWidth: columnWidths[6] },
        7: { cellWidth: columnWidths[7] },
      },
    });

    // Save the PDF
    pdf.save("stocks.pdf");
  };
  //------------------------- stock export to excel ---------------------//

  const exportToExcel = () => {
    const selectedStocks = stocks.filter((stock) =>
      selectedItems.includes(stock.id)
    );
    const ws = XLSX.utils.json_to_sheet(selectedStocks);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Stocks");
    XLSX.writeFile(wb, "stocks.xlsx");
  };

  //------------------------- stock Delete---------------------//
  const handleDelete = (id) => {
    Swal.fire({
      title: "Êtes-vous sûr de vouloir supprimer ce stock ?",
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Oui",
      denyButtonText: "Non",
      customClass: {
        actions: "my-actions",
        cancelButton: "order-1 right-gap",
        confirmButton: "order-2",
        denyButton: "order-3",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`http://localhost:8000/api/stock/${id}`)
          .then((response) => {
            if (response.data.message) {
              // Successful deletion
              fetchStocks();
              Swal.fire({
                icon: "success",
                title: "Succès!",
                text: "stock supprimé avec succès",
              });
            } else if (response.data.error) {
              // Error occurred
              if (
                response.data.error.includes(
                  "Impossible de supprimer ou de mettre à jour une ligne parent : une contrainte de clé étrangère échoue"
                )
              ) {
                // Violated integrity constraint error
                Swal.fire({
                  icon: "error",
                  title: "Erreur!",
                  text: "Impossible de supprimer le stock car il a des produits associés.",
                });
              }
            }
          })
          .catch((error) => {
            // Request error
            console.error("Erreur lors de la suppression du stock:", error);
            Swal.fire({
              icon: "error",
              title: "Erreur!",
              text: `Échec de la suppression du stock. Veuillez consulter la console pour plus d'informations.`,
            });
          });
      } else {
        console.log("Suppression annulée");
      }
    });
  };
  //------------------------- stock EDIT---------------------//

  const handleEdit = (stocks) => {
    setEditingStock(stocks); // Set the stocks to be edited
    // Populate form data with stocks details
    setFormData({
      produit_id: stocks.produit_id,
      quantite: stocks.quantite,
      seuil_minimal: stocks.seuil_minimal,
    });
    if (formContainerStyle.right === "-100%") {
      setFormContainerStyle({ right: "0" });
      setTableContainerStyle({ marginRight: "500px" });
    } else {
      closeForm();
    }
    // Show form
    // setShowForm(true);
  };
  useEffect(() => {
    if (editingStockId !== null) {
      setFormContainerStyle({ right: "0" });
      setTableContainerStyle({ marginRight: "500px" });
    }
  }, [editingStockId]);

  //------------------------- stock SUBMIT---------------------//

  useEffect(() => {
    // Check if quantite is less than or equal to seuil_minimal
    const stocksToNotify = filteredStocks.filter(
      (stock) => stock.quantite <= stock.seuil_minimal
    );

    // Create notifications for each stock that needs attention
    const newNotifications = stocksToNotify.map((stock) => {
      return {
        id: stock.id,
        message: `Stock pour ${getProduitDesignation(
          stock.produit_id
        )} est insufisant.`,
      };
    });

    // Show notifications
    newNotifications.forEach((notification) => {
      toast.info(notification.message, {
        autoClose: false, // You can customize the duration
      });
    });

    // Update notifications state
    setNotifications(newNotifications);
  }, [filteredStocks]);
  const handleSubmit = (e) => {
    e.preventDefault();
    const url = editingStock
      ? `http://localhost:8000/api/stock/${editingStock.id}`
      : "http://localhost:8000/api/stock";
    const method = editingStock ? "put" : "post";
    axios({
      method: method,
      url: url,
      data: formData,
    })
      .then(() => {
        fetchStocks();
        Swal.fire({
          icon: "success",
          title: "Succès!",
          text: `stock ${editingStock ? "modifié" : "ajouté"} avec succès.`,
        });
        setFormData({
          produit_id: "",
          quantite: "",
          seuil_minimal: "",
        });
        setEditingStock(null); // Clear editing stock
        closeForm();
      })
      .catch((error) => {
        console.error(
          `Erreur lors de ${
            editingStock ? "la modification" : "l'ajout"
          } du stock:`,
          error
        );
        Swal.fire({
          icon: "error",
          title: "Erreur!",
          text: `Échec de ${
            editingStock ? "la modification" : "l'ajout"
          } du stock.`,
        });
      });
  };

  //------------------------- stock FORM---------------------//

  const handleShowFormButtonClick = () => {
    if (formContainerStyle.right === "-100%") {
      setFormContainerStyle({ right: "0" });
      setTableContainerStyle({ marginRight: "500px" });
    } else {
      closeForm();
    }
  };

  const closeForm = () => {
    setFormContainerStyle({ right: "-100%" });
    setTableContainerStyle({ marginRight: "0" });
    setShowForm(false); // Hide the form
    setFormData({
      // Clear form data
      produit_id: "",
      quantite: "",
      seuil_minimal: "",
    });
    setEditingStock(null); // Clear editing stock
  };
  const tableHeaderStyleStock = {
    border: "1px solid #ddd",
    padding: "8px",
    textAlign: "center",
    backgroundColor: "#f2f2f2", // Header background color
  };

  const tableCellStyleStock = {
    border: "1px solid #ddd",
    padding: "8px",
    textAlign: "center",
  };
  return (
    <ThemeProvider theme={createTheme()}>
      <Box sx={{ display: "flex" }}>
        <Navigation />
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 4 }}>
          <Toolbar />
          <ToastContainer />
          {notifications.map((notification) => (
            <div key={notification.id}></div>
          ))}
          <div className="container">
            {/* <h3>Produits Stockes</h3> */}
            <div className="search-container d-flex flex-row-reverse mb-3">
              <Search onSearch={handleSearch} />
            </div>
            <div className="add-Ajout-form">
              <Button
                variant="primary"
                className="col-3 btn btn-sm"
                id="showFormButton"
                onClick={handleShowFormButtonClick}
              >
                {showForm ? "Modifier le formulaire" : "Ajouter au stock"}
              </Button>
              <div
                id="formContainer"
                className="mt-2"
                style={formContainerStyle}
              >
                <Form className="col row" onSubmit={handleSubmit}>
                  <Form.Label className="text-center m-2">
                    <h5>
                      {editingStock ? "Modifier le Stock" : "Ajouter au Stock"}
                    </h5>
                  </Form.Label>
                  <Form.Group className="col-sm-5 m-2" controlId="produit_id">
                    <Form.Label>Produit</Form.Label>

                    <Form.Select
                      name="produit_id"
                      value={formData.produit_id}
                      onChange={handleChange}
                      className="form-select form-select-sm"
                      required
                    >
                      <option value="">Sélectionner un Produit</option>
                      {produits.map((produit) => (
                        <option key={produit.id} value={produit.id}>
                          {produit.designation}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="col-sm-5 m-2 ">
                    <Form.Label>Quantite</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Quantite"
                      name="quantite"
                      value={formData.quantite}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="col-sm-10 m-2">
                    <Form.Label>Seuil Minimal</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Seuil Minimal"
                      name="seuil_minimal"
                      value={formData.seuil_minimal}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="col m-3 text-center">
                    <Button type="submit" className="btn btn-success col-6">
                      {editingStock ? "Modifier" : "Ajouter"}
                    </Button>
                    <Button
                      className="btn btn-secondary col-5 offset-1"
                      onClick={closeForm}
                    >
                      Annuler
                    </Button>
                  </Form.Group>
                </Form>
              </div>
            </div>
            <div
              id="tableContainer"
              className="table-responsive-sm"
              style={tableContainerStyle}
            >
              <table className="table" id="stockTable">
                <thead>
                  <tr>
                    <th style={tableHeaderStyleStock} scope="col">
                      <input type="checkbox" onChange={handleSelectAllChange} />
                    </th>
                    <th style={tableHeaderStyleStock} scope="col">
                      Produit
                    </th>
                    <th style={tableHeaderStyleStock} scope="col">
                      Quantite
                    </th>
                    <th style={tableHeaderStyleStock} scope="col">
                      Seuil Minimal
                    </th>

                    <th style={tableHeaderStyleStock} scope="col">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStocks &&
                    filteredStocks
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((stocks) => (
                        <tr key={stocks.id}>
                          <td style={tableCellStyleStock}>
                            <input
                              type="checkbox"
                              onChange={() => handleCheckboxChange(stocks.id)}
                              checked={selectedItems.includes(stocks.id)}
                            />
                          </td>
                          <td style={tableCellStyleStock}>
                            {getProduitDesignation(stocks.produit_id)}
                          </td>
                          <td style={tableCellStyleStock}>{stocks.quantite}</td>
                          <td style={tableCellStyleStock}>
                            {stocks.seuil_minimal}
                          </td>

                          <td style={tableCellStyleStock}>
                            <Button
                              className="btn btn-sm btn-info m-1"
                              onClick={() => handleEdit(stocks)}
                            >
                              <i className="fas fa-edit"></i>
                            </Button>
                            <Button
                              className="btn btn-danger btn-sm m-1"
                              onClick={() => handleDelete(stocks.id)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
              <div className="d-flex flex-row">
                <div className="btn-group col-2">
                  <Button
                    className="btn btn-danger btn-sm"
                    onClick={handleDeleteSelected}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                  <Button
                    className="btn btn-secondary btn-sm"
                    onClick={() =>
                      printList("stockTable", "Liste des Stocks", stocks)
                    }
                  >
                    <FontAwesomeIcon icon={faPrint} />
                  </Button>
                  <Button
                    className="btn btn-danger btn-sm ml-2"
                    onClick={exportToPdf}
                  >
                    <FontAwesomeIcon icon={faFilePdf} />
                  </Button>
                  <Button
                    className="btn btn-success btn-sm ml-2"
                    onClick={exportToExcel}
                  >
                    <FontAwesomeIcon icon={faFileExcel} />
                  </Button>
                </div>
              </div>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredStocks.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </div>
          </div>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default StockList;
