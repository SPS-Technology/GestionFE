import React, { useState, useEffect } from "react";
import axios from "axios";
import Navigation from "../Acceuil/Navigation";
import Swal from "sweetalert2";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { Toolbar } from "@mui/material";
import { Form, Button, Modal, Table } from "react-bootstrap";
import "../style.css";
import Search from "../Acceuil/Search";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faFilePdf, faPrint, faPlus, faMinus,} from "@fortawesome/free-solid-svg-icons";
import TablePagination from "@mui/material/TablePagination";

const LivraisonList = () => {
  const [livraisons, setLivraisons] = useState([]);
  const [clients, setClients] = useState([]);
  const [devises, setDevises] = useState([]);
  const [formData, setFormData] = useState({ reference: "", date: "", ref_BC: "", client_id: "", user_id: ""});
  const [formContainerStyle, setFormContainerStyle] = useState({ right: "-100%", });
  const [tableContainerStyle, setTableContainerStyle] = useState({ marginRight: "0px",});
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredlivraisons, setFilteredlivraisons] = useState([]);

      // Pagination calculations
      const [rowsPerPage, setRowsPerPage] = useState(5);
      const [page, setPage] = useState(0);
      const indexOfLastLivraison = (page + 1) * rowsPerPage;
      const indexOfFirstLivraison = indexOfLastLivraison - rowsPerPage;
      const currentLivraisons = livraisons.slice(indexOfFirstLivraison, indexOfLastLivraison);

      const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
      };
      const handleChangePage = (event, newPage) => {
        setPage(newPage);
      };

  const fetchLivraisons = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/livraisons");
      setLivraisons(response.data.livraison);

      const ClientResponse = await axios.get(
        "http://localhost:8000/api/clients"
      );
      // console.log("API Response:", response.data);
      setClients(ClientResponse.data.client);

    } catch (error) {
      console.error("Error fetching factures:", error);
    }
  };
  useEffect(() => {
    const filtered = livraisons.filter((livraison) =>
    livraison.reference
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

    setFilteredlivraisons(filtered);
  }, [livraisons, searchTerm]);
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (formData.id) {
        // Editing an existing entry
        await axios.put(
          `http://localhost:8000/api/livraisons/${formData.id}`,
          formData
        );
      } else {
        // Adding a new entry
        await axios.post("http://localhost:8000/api/livraisons", formData);
      }
      fetchLivraisons();
      // Show success message using SweetAlert
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Form submitted successfully!",
      });

      clearFormData();
      closeForm();
    } catch (error) {
      console.error("Error:", error);
      // Handle error as needed
    }
  };
  const clearFormData = () => {
    // Reset the form data to empty values
    setFormData({
      reference: "",
      date: "",
      ref_BC: "",
      client_id: "",
      user_id:"",
    });
  };

  const handleEdit = (livraison) => {
    setFormData({
      id: livraison.id,
      reference: livraison.reference,
      date: livraison.date,
      ref_BC: livraison.ref_BC,
      client_id: livraison.client_id,
      user_id: livraison.user_id,
    });
    if (formContainerStyle.right === "-100%") {
      setFormContainerStyle({ right: "0" });
      setTableContainerStyle({ marginRight: "500px" });
    } else {
      closeForm();
    }
  };
  const handleShowFormButtonClick = () => {
    if (formContainerStyle.right === "-100%") {
      setFormContainerStyle({ right: "-0%" });
      setTableContainerStyle({ marginRight: "600px" });
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
      reference: "",
      date: "",
      ref_BL: "",
      ref_BC: "",
      client_id: "",
      user_id: "",
    });
  };
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <ThemeProvider theme={createTheme()}>
      <Box sx={{ display: "flex" }}>
        <Navigation />
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 4 }}>
          <Toolbar />
          <div  className="container">
          <div className="search-container d-flex flex-row-reverse col-3" role="search">
              <Search onSearch={handleSearch} type="search" />
          </div>
          <Button
              variant="primary"
              className="col-2 btn btn-sm m-2"
              id="showFormButton"
              onClick={handleShowFormButtonClick}
            >
              {showForm ? "Modifier le formulaire" : "Ajouter Bon Livraison"}
            </Button>
          <div id="formContainer" className="" style={formContainerStyle} >
              <Form className="row" onSubmit={handleSubmit}>
                <Form.Group className="m-2 col-4" controlId="reference">
                  <Form.Label>Reference:</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.reference}
                    onChange={handleChange}
                    name="reference"
                  />
                </Form.Group>
                <Form.Group className="m-2 col-4" controlId="date">
                  <Form.Label>Date:</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    name="date"
                  />
                </Form.Group>
                <Form.Group className="m-2 col-4" controlId="ref_BC">
                  <Form.Label>N° BC</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.ref_BC}
                    onChange={handleChange}
                    name="ref_BC"
                  />
                </Form.Group>
                <Form.Group className="m-2 col-4" controlId="client_id">
                  <Form.Label>client_id</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.client_id}
                    onChange={handleChange}
                    name="client_id"
                  />
                </Form.Group>
                <Form.Group className="m-2 col-4" controlId="user_id">
                  <Form.Label>User_id</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.user_id}
                    onChange={handleChange}
                    name="user_id"
                  />
                </Form.Group>
                <div className="col-3 mt-5">
                  <Button
                    className="btn btn-sm"
                    variant="primary"
                    type="submit"
                  >
                    Submit
                  </Button>
                </div>
              </Form>
            </div>
            <div
              id="tableContainer"
              className="table-responsive-sm"
              style={tableContainerStyle}
            >
              <table className="table table-bordered">
                <thead
                  className="text-center"
                  style={{ backgroundColor: "#adb5bd" }}
                >
                  <tr>
                    <th>N° BL</th>
                    <th>Date</th>
                    <th>N° BC</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody className="text-center">
                {filteredlivraisons
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((livraison) => (
                      <tr key={livraison.id}>
                        <td>{livraison.reference}</td>
                        <td>{livraison.date}</td>
                        <td>{livraison.clients.raison_sociale}</td>

                        <td>
                          <button
                            className="btn btn-sm btn-info m-1"
                            onClick={() => handleEdit(livraison)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          {/* <Button
                                className="btn btn-sm m-2"
                                onClick={() => handleLivraisonExport(livraison.id)}
                              >
                                <FontAwesomeIcon icon={faFilePdf} />
                          </Button> */}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredlivraisons.length}
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

export default LivraisonList;
