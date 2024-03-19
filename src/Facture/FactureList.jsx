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
import {faTrash, faFilePdf, faPrint, faPlus,faMinus,} from "@fortawesome/free-solid-svg-icons";
import TablePagination from "@mui/material/TablePagination";


const FactureList = () => {
  const [factures, setFactures] = useState([]);
  const [clients, setClients] = useState([]);
  const [devises, setDevises] = useState([]);
  const [formData, setFormData] = useState({ reference: "", date: "", ref_BL: "", ref_BC: "", modePaiement: "", });
  const [formContainerStyle, setFormContainerStyle] = useState({ right: '-100%' });
  const [tableContainerStyle, setTableContainerStyle] = useState({ marginRight: '0px' });
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredfactures, setFilteredfactures] = useState([]);

    // Pagination calculations
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [page, setPage] = useState(0);
    const indexOfLastFacture = (page + 1) * rowsPerPage;
    const indexOfFirstFacture = indexOfLastFacture - rowsPerPage;
    const currentFactures = factures.slice(indexOfFirstFacture, indexOfLastFacture);

    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };
    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };
  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 
    const fetchFactures = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/factures");
        setFactures(response.data.facture);

        const ClientResponse = await axios.get(
          "http://localhost:8000/api/clients"
        );
        // console.log("API Response:", response.data);
        setClients(ClientResponse.data.client);

        const DeviesResponse = await axios.get(
          "http://localhost:8000/api/devises"
        );
        setDevises(DeviesResponse.data.devis);
      } catch (error) {
        console.error("Error fetching factures:", error);
      }
    };

  useEffect(() => {
    fetchFactures();
  }, []);

  useEffect(() => {
    const filtered = factures.filter((facture) =>
    facture.reference
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

    setFilteredfactures(filtered);
  }, [factures, searchTerm]);
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (formData.id) {
        // Editing an existing entry
        await axios.put(
          `http://localhost:8000/api/factures/${formData.id}`,
          formData
        );
      } else {
        // Adding a new entry
        await axios.post("http://localhost:8000/api/factures", formData);
      }
      fetchFactures();
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
      ref_BL: "",
      ref_BC: "",
      modePaiement: "",
      client_id: "",
      devis_id: "",
      id: "",
    });
  };

  const handleEdit = (facture) => {
  // Populate the form data with the details of the selected facture
  setFormData({
    id: facture.id,
    reference: facture.reference,
    date: facture.date,
    ref_BL: facture.ref_BL,
    ref_BC: facture.ref_BC,
    modePaiement: facture.modePaiement,
    client_id: facture.client_id,
    id_devis: facture.id_devis,
    user_id: facture.user_id,
  });
  if (formContainerStyle.right === '-100%') {
    setFormContainerStyle({ right: '0' });
    setTableContainerStyle({ marginRight: '500px' });
  } else {
    closeForm();
  }
};

const closeForm = () => {
  setFormContainerStyle({ right: '-100%' });
  setTableContainerStyle({ marginRight: '0' });
  setShowForm(false); // Hide the form
  setFormData({ // Clear form data
    raison_sociale: '',
    abreviation: '',
    adresse: '',
    tele: '',
    ville: '',
    zone_id: '',
    user_id: '',
    ice: '',
    code_postal: '',
  });

};

const handleShowFormButtonClick = () => {
  if (formContainerStyle.right === "-100%") {
    setFormContainerStyle({ right: "-0%" });
    setTableContainerStyle({ marginRight: "600px" });
  } else {
    closeForm();
  }
};

const handleFactureExport = async (factureId) => {
  try {
    const response = await axios.get(`http://localhost:8000/api/factures/${factureId}`);
    const selectedFacture = response.data.facture;

    if (!selectedFacture) {
      console.error("Facture not found");
      return;
    }

    const doc = new jsPDF();
    let startY = 20;

     // Draw rectangle around client info
     const clientInfoX = 10;
     const clientInfoY = startY + 10;
     const clientInfoWidth = 60;
     const clientInfoHeight = 30;
     doc.rect(clientInfoX, clientInfoY, clientInfoWidth, clientInfoHeight, "S");
 
     // Info Client
     const clientInfo = [
       { label: 'Raison sociale:', value: selectedFacture.clients.raison_sociale },
       { label: 'Adresse:', value: selectedFacture.clients.adresse },
       { label: 'Téléphone:', value: selectedFacture.clients.tele },
       { label: 'ICE:', value: selectedFacture.clients.ice }
     ];
 
     let clientInfoYPosition = startY + 15; // Adjust startY position for text

     clientInfo.forEach((info) => {
       doc.setFontSize(8); // Set font size to 8
       doc.text(`${info.label}`, clientInfoX + 5, clientInfoYPosition);
       doc.text(`${info.value}`, clientInfoX + 30, clientInfoYPosition);
       clientInfoYPosition += 5; // Adjust vertical spacing
     });
 
     startY += 50; // Adjust startY position after client info and rectangle

    // Table for factureInfo
    const factureInfoRows = [
      { title: 'N° Facture' },
      { title: 'Date:' },
      { title: 'REF BL N°:' },
      { title: 'REF BC N°:' },
      { title: 'Mode de Paiement:' }
    ];

    const factureInfoBody = [
      selectedFacture.reference,
      selectedFacture.date,
      selectedFacture.ref_BL,
      selectedFacture.ref_BC,
      selectedFacture.modePaiement
    ];

    doc.autoTable({
      head: [factureInfoRows.map(row => row.title)],
      body: [factureInfoBody],
      startY: startY,
      margin: { top: 20 },
      styles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        fontSize: 8
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 40 },
      },
      headerStyles: {
        fillColor: [187, 187, 187],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
    });

    startY = doc.lastAutoTable.finalY + 10; // Move startY position below the factureInfo table

    let ligneData = [];

    if (selectedFacture.devis && selectedFacture.devis.lignedevis) {
      ligneData = selectedFacture.devis.lignedevis;
    } else if (selectedFacture.ligne_facture && selectedFacture.ligne_facture.length > 0) {
      ligneData = selectedFacture.ligne_facture;
    }

    if (ligneData.length > 0) {
      startY += 2; // Add space between factureInfo and ligneData table

      const headersLigne = ['#', 'Code produit', 'Désignation', 'Prix', 'Quantité', 'Total HT',];
      const rowsLigne = ligneData.map((ligne, index) => [
        index + 1,
        ligne.Code_produit,
        ligne.designation,
        ligne.prix_vente,
        ligne.quantite,
        (ligne.quantite * ligne.prix_vente).toFixed(2)
      ]);

      doc.autoTable({
        head: [headersLigne],
        body: rowsLigne,
        startY: startY,
        margin: { top: 20 },
        styles: {
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          fontSize: 8
        },
        columnStyles: {
          0: { cellWidth: 7 },
          1: { cellWidth: 40 },
          2: { cellWidth: 50 },
          3: { cellWidth: 20 },
          4: { cellWidth: 25 },
          5: { cellWidth: 30 }
        },
        headerStyles: {
          fillColor: [187, 187, 187],
          textColor: [0, 0, 0],
          fontStyle: "bold",
        },
      });

      const totalHT = ligneData.reduce((total, ligne) => total + (ligne.quantite * ligne.prix_vente), 0);
      const TVA = 0.2 * totalHT;
      const TTC = totalHT + TVA;

      const montantTable = [
        { label: 'Montant Total Hors Taxes:', value: `${totalHT.toFixed(2)} DH` },
        { label: 'TVA (20%):', value: `${TVA.toFixed(2)} DH` },
        { label: 'TTC:', value: `${TTC.toFixed(2)} DH` },
        { label: 'Total en lettres:', value: `${nombreEnLettres(TTC)} Dirhams` }
      ];

      doc.autoTable({
        body: montantTable.map(row => [row.label, row.value]),
        startY: doc.lastAutoTable.finalY + 10,
        margin: { top: 20 },
        styles: {
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          fontSize: 8
        }
      });

      const totalEnLettres = `Arrêteé la présente facture à la somme tout taxe comprise de : ${nombreEnLettres(TTC)} Dirhams`;
      doc.setFontSize(10);
      doc.text(totalEnLettres, 10, startY + 70);

      doc.save("facture.pdf");
    } else {
      console.error("No ligne data found in selected facture");
    }
  } catch (error) {
    console.error("Error exporting facture:", error);
  }
};

function nombreEnLettres(nombre) {
  const units = ['', 'un', 'Deux', 'Trois', 'Quatre', 'Cinq', 'Six', 'Sept', 'Huit', 'Neuf'];
  const teens = ['Dix', 'Onze', 'Douze', 'Treize', 'Quatorze', 'Quinze', 'Seize', 'Dix-Sept', 'Dix-Huit', 'Dix-Neuf'];
  const tens = ['', 'Dix', 'Vingt', 'Trente', 'Quarante', 'Cinquante', 'Soixante', 'Soixante-Dix', 'Quatre-Vingt', 'Quatre-Vingt-Dix'];

  let parts = [];

  if (nombre === 0) {
    return 'zéro';
  }

  if (nombre >= 1000) {
    parts.push(nombreEnLettres(Math.floor(nombre / 1000)) + ' Mille');
    nombre %= 1000;
  }

  if (nombre >= 100) {
    parts.push(units[Math.floor(nombre / 100)] + ' Cent');
    nombre %= 100;
  }

  if (nombre >= 10 && nombre <= 19) {
    parts.push(teens[nombre - 10]);
    nombre = 0;
  } else if (nombre >= 20 || nombre === 10) {
    parts.push(tens[Math.floor(nombre / 10)]);
    nombre %= 10;
  }

  if (nombre > 0) {
    parts.push(units[nombre]);
  }

  return parts.join(' ');
}

  return (
    <ThemeProvider theme={createTheme()}>
      <Box sx={{ display: "flex" }}>
        <Navigation />
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 4 }}>
          <Toolbar />
          <div className="">
            <h2>Liste des Factures</h2>
          </div>
          <div className="search-container d-flex flex-row-reverse col-3" role="search">
              <Search onSearch={handleSearch} type="search" />
          </div>
          <div className="container">
          <Button
              variant="primary"
              className="col-2 btn btn-sm m-2"
              id="showFormButton"
              onClick={handleShowFormButtonClick}
            >
              {showForm ? "Modifier le formulaire" : "Ajouter un Facture"}
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
                <Form.Group className="m-2 col-4" controlId="ref_BL">
                  <Form.Label>ref_BL</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.ref_BL}
                    onChange={handleChange}
                    name="ref_BL"
                  />
                </Form.Group>
                <Form.Group className="m-2 col-4" controlId="ref_BC">
                  <Form.Label>ref_BC</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.ref_BC}
                    onChange={handleChange}
                    name="ref_BC"
                  />
                </Form.Group>
                <Form.Group className="m-2 col-4" controlId="modePaiement">
                  <Form.Label>Mode de Paiement:</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.modePaiement}
                    onChange={handleChange}
                    name="modePaiement"
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
            <div id="tableContainer" className="table-responsive-sm" style={tableContainerStyle}>
              <table className="table table-bordered">
                <thead className="text-center"  style={{ backgroundColor: "#adb5bd" }}>
                  <tr>
                    <th>N° Facture</th>
                    <th>Date</th>
                    <th>Client</th>
                    <th>Total HT</th>
                    <th>TVA</th>
                    <th>Total TTC</th>
                    <th>REF BL N°</th>
                    <th>REF BC N°</th>
                    <th>Mode de Paiement</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody className="text-center">
                {filteredfactures
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((facture) => (
                      <tr key={facture.id}>
                        <td>{facture.reference}</td>
                        <td>{facture.date}</td>
                        <td>{facture.clients.raison_sociale}</td>
                        <td>{facture.total_ht}</td>
                        <td>{facture.tva}</td>
                        <td>{facture.total_ttc}</td>
                        <td>{facture.ref_BL}</td>
                        <td>{facture.ref_BC}</td>
                        <td>{facture.modePaiement}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-info m-1"
                            onClick={() => handleEdit(facture)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <Button
                                className="btn btn-sm m-2"
                                onClick={() => handleFactureExport(facture.id)}
                              >
                                <FontAwesomeIcon icon={faFilePdf} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredfactures.length}
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

export default FactureList;