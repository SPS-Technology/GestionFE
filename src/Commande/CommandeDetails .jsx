// CommandeDetails.jsx
import React, { useState, useEffect } from "react";
import TablePagination from "@mui/material/TablePagination";
import "../style.css";
import axios from "axios";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { grey } from "@mui/material/colors";
const CommandeDetails = ({ produits, commande }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [ligneCommandes, setLigneCommandes] = useState(
    commande.ligne_commandes
  );
  const [filteredProduits, setFilteredProduits] = useState([]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const produitLookup = (produitId) => {
    const produit = produits.find((p) => p.id === produitId);
    return produit ? produit.designation : "";
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // useEffect(() => {
  //   // Filter commandes based on the search term
  //   const filtered = produits.filter((commande) =>
  //     commande.reference.toLowerCase().includes(searchTerm.toLowerCase())
  //   );

  //   setFilteredProduits(filtered);
  // }, [produits, searchTerm]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const ligneCommandeDetails = ligneCommandes.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const fetchLigneCommandes = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/ligneCommandes"
      );

      console.log("API Response for ligneCommandes:", response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const fetchStatusCommandes = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/statusCommande"
      );

      console.log("API Response for ligneCommandes:", response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const statusCommandeDetails = commande.status_commandes;
  const handleDeleteLigneCommande = (id) => {
    const isConfirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer ce commande ?"
    );

    if (isConfirmed) {
      axios
        .delete(`http://localhost:8000/api/ligneCommandes/${id}`)
        .then(() => {
          fetchLigneCommandes();
          Swal.fire({
            icon: "success",
            title: "Succès!",
            text: "Ligne Commande supprimé avec succès.",
          });

          setLigneCommandes((prevLigneCommandes) =>
            prevLigneCommandes.filter(
              (ligneCommande) => ligneCommande.id !== id
            )
          );
        })
        .catch((error) => {
          console.error("Erreur lors de la suppression du commande:", error);
          Swal.fire({
            icon: "error",
            title: "Erreur!",
            text: "Échec de la suppression du commande.",
          });
        });
    } else {
      console.log("Suppression annulée");
    }
  };
  const tableHeaderStyle = {
    border: "1px solid #000",
    padding: "8px",
    textAlign: "center",
    backgroundColor: "#f2f2f2", // Header background color
  };

  const tableCellStyle = {
    border: "1px solid #000",
    padding: "8px",
    textAlign: "center",
  };
  return (
    <div className="table-container">
      <table className="table ">
        <thead>
          <tr>
            <th style={tableHeaderStyle}>Produit</th>
            <th style={tableHeaderStyle}>Quantite</th>
            <th style={tableHeaderStyle}>Prix Unitaire</th>
            {/* <th style={tableHeaderStyle}></th> */}
          </tr>
        </thead>
        <tbody style={tableCellStyle}>
          {ligneCommandeDetails.map((ligneCommande) => (
            <tr key={ligneCommande.id}>
              <td style={tableCellStyle}>
                {produitLookup(ligneCommande.produit_id)}
              </td>
              <td style={tableCellStyle}>{ligneCommande.quantite}</td>
              <td style={tableCellStyle}>{ligneCommande.prix_unitaire}</td>
              <td style={tableCellStyle} className="no-print">
                <button
                  onClick={() => handleDeleteLigneCommande(ligneCommande.id)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={commande.ligne_commandes.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        className="no-print"
      />

      <table className="table text-center">
        <thead>
          <tr>
            <th colspan="2">
              Historique des status pour : {commande.reference}
            </th>
          </tr>
          <tr>
            <th style={tableHeaderStyle}>Status</th>
            <th style={tableHeaderStyle}>Date Status</th>
          </tr>
        </thead>
        <tbody>
          {statusCommandeDetails.map((statusCommande) => (
            <tr key={statusCommande.id}>
              <td style={tableCellStyle}>{statusCommande.status}</td>
              <td style={tableCellStyle}>{statusCommande.date_status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CommandeDetails;
