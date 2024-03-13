import React, { useState, useEffect } from "react";
import axios from "axios";
import Navigation from "../Acceuil/Navigation";
import Swal from "sweetalert2";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { Toolbar } from "@mui/material";
import { Form, Button, Modal, Table } from "react-bootstrap";
import "../style.css";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faTrash, faFilePdf, faPrint, faPlus,faMinus,} from "@fortawesome/free-solid-svg-icons";


const FactureList = () => {
  const [factures, setFactures] = useState([]);
  const [clients, setClients] = useState([]);
  const [devises, setDevises] = useState([]);
  const [formData, setFormData] = useState({ reference: "", date: "", ref_BL: "", ref_BC: "", modePaiement: "", });
  const [formContainerStyle, setFormContainerStyle] = useState({ right: '-100%' });
  const [tableContainerStyle, setTableContainerStyle] = useState({ marginRight: '0px' });
  const [showForm, setShowForm] = useState(false);


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

const handleFactureExport = (factureId) => {
  const selectedDevis = factures.find((facture) => facture.id === factureId);

  // Check if selectedDevis is valid
  if (!selectedDevis) {
    console.error("Selected facture not found");
    return;
  }

  const doc = new jsPDF();

  let startY = 20;

  const clientInfo = [
    { label: 'Raison sociale:', value: selectedDevis.clients.raison_sociale },
    { label: 'Adresse:', value: selectedDevis.clients.adresse },
    { label: 'Téléphone:', value: selectedDevis.clients.tele },
    { label: 'ICE:', value: selectedDevis.clients.ice }
  ];

  doc.setFontSize(10);
  clientInfo.forEach((info) => {
    doc.text(`${info.label}`, 10, startY);
    doc.text(`${info.value}`, 50, startY);
    startY += 10;
  });

  const factureInfo = [
    { label: 'N° Facture:', value: selectedDevis.reference },
    { label: 'Date:', value: selectedDevis.date },
    { label: 'REF BL N°:', value: selectedDevis.ref_BL },
    { label: 'REF BC N°:', value: selectedDevis.ref_BC },
    { label: 'Mode de Paiement:', value: selectedDevis.modePaiement }
  ];

  startY = 20;

  factureInfo.forEach((info) => {
    doc.text(`${info.label}`, 120, startY);
    doc.text(`${info.value}`, 160, startY);
    startY += 10;
  });

  if (selectedDevis.devis && selectedDevis.devis.lignedevis) {
    const headersLigneDevis = ['#', 'Code produit', 'Désignation', 'Quantité', 'Prix', 'Total HT',];
    const rowsLigneDevis = selectedDevis.devis.lignedevis.map((lignedevis, index) => [
      index + 1,
      lignedevis.Code_produit,
      lignedevis.designation,
      lignedevis.quantite,
      lignedevis.prix_vente,
      (lignedevis.quantite * lignedevis.prix_vente).toFixed(2)
    ]);

    doc.autoTable({
      head: [headersLigneDevis],
      body: rowsLigneDevis,
      startY: startY + 20,
      margin: { top: 20 },
      styles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        fontSize: 8
      },
      columnStyles: {
        0: { cellWidth: 8 }, // Largeur de la colonne du numéro de ligne
        1: { cellWidth: 40 }, // Largeur de la colonne du code produit
        2: { cellWidth: 60 }, // Largeur de la colonne de la désignation
        3: { cellWidth: 20 }, // Largeur de la colonne de la quantité
        4: { cellWidth: 25 }, // Largeur de la colonne du prix
        5: { cellWidth: 30 }  // Largeur de la colonne du total
      },
    });

    const totalHT = selectedDevis.devis.lignedevis.reduce((total, lignedevis) => total + (lignedevis.quantite * lignedevis.prix_vente), 0);
    const TVA = 0.2 * totalHT;
    const TTC = totalHT + TVA;

    // Générer un tableau pour les informations de montant total, TVA, TTC et Total en lettres
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

    doc.save("facture.pdf");
  } else {
    console.error("Ligne devis not found in selected facture");
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
          <div className="container">
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
                    <th>REF BL N°</th>
                    <th>REF BC N°</th>
                    <th>Mode de Paiement</th>
                    <th>Client</th>
                    <th>Devis</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody className="text-center">
                  {factures &&
                    factures.map((facture) => (
                      <tr key={facture.id}>
                        <td>{facture.reference}</td>
                        <td>{facture.date}</td>
                        <td>{facture.ref_BL}</td>
                        <td>{facture.ref_BC}</td>
                        <td>{facture.modePaiement}</td>
                        <td>{facture.clients.raison_sociale}</td>
                        <td>{facture.devis.reference}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-info m-1"
                            onClick={() => handleEdit(facture)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <Button
                                className="col-3 btn btn-sm m-2"
                                onClick={() => handleFactureExport(facture.id)}
                              >
                                <FontAwesomeIcon icon={faFilePdf} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default FactureList;
