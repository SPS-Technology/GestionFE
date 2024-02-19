import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Navigation from "../Acceuil/Navigation";
import TablePagination from "@mui/material/TablePagination";
import Search from "../Acceuil/Search";

const ProduitList = () => {
  const [produits, setProduits] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const fetchProduits = async () => {
    try {
      const produitsResponse = await axios.get(
        "http://localhost:8000/api/produits"
      );
      setProduits(produitsResponse.data.produit);

      const fournisseursResponse = await axios.get(
        "http://localhost:8000/api/fournisseurs"
      );
      setFournisseurs(fournisseursResponse.data.fournisseur);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchProduits();
  }, []);

  useEffect(() => {
    // Filter fournisseurs based on the search term
    const filtered = produits.filter((prod) =>
      prod.nom.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredProducts(filtered);
  }, [produits, searchTerm]);

  const handleSearch = (term) => {
    //setCurrentPage(1); // Reset to the first page when searching
    setSearchTerm(term);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleEdit = (id) => {
    const existingProduit = produits.find((produit) => produit.id === id);

    const fournisseurOptions = fournisseurs.map((fournisseur) => ({
      value: fournisseur.id,
      label: fournisseur.raison_sociale,
    }));

    Swal.fire({
      title: "Modifier Produit",
      html:
        `<label for="nom">Nom</label>` +
        `<input type="text" id="nom" class="swal2-input" value="${existingProduit.nom}">` +
        `<label for="type_quantite">Type Quantité</label>` +
        `<input type="text" id="type_quantite" class="swal2-input" value="${existingProduit.type_quantite}">` +
        `<label for="calibre">Calibre</label>` +
        `<input type="text" id="calibre" class="swal2-input" value="${existingProduit.calibre}">` +
        `<label for="user_id">User</label>` +
        `<input type="text" id="user_id" class="swal2-input" value="${existingProduit.user_id}">` +
        `<label for="fournisseur">Fournisseur</label>` +

        `<select id="fournisseur" class="swal2-input">
  <option value="">Aucun</option>
  ${fournisseurOptions.map(
    (option) => `<option value="${option.value}">${option.label}</option>`
  )}
</select>`,

      confirmButtonText: "modifier",
      focusConfirm: false,
      showCancelButton: true,
      cancelButtonText: "Annuler",
      preConfirm: () => {
        return {
          nom: document.getElementById("nom").value,
          type_quantite: document.getElementById("type_quantite").value,
          calibre: document.getElementById("calibre").value,
          fournisseur_id: document.getElementById("fournisseur").value,
          user_id: document.getElementById("user_id").value,
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .put(`http://localhost:8000/api/produits/${id}`, result.value)
          .then(() => {
            fetchProduits();
            Swal.fire({
              icon: "success",
              title: "Succès!",
              text: "Produit modifié avec succès.",
            });
          })
          .catch((error) => {
            console.error("Erreur lors de la modification du produit:", error);
            Swal.fire({
              icon: "error",
              title: "Erreur!",
              text: "Échec de la modification du produit.",
            });
          });
      }
    });
  };

  const handleDelete = (id) => {
    const isConfirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer ce produit ?"
    );

    if (isConfirmed) {
      axios
        .delete(`http://localhost:8000/api/produits/${id}`)
        .then(() => {
          fetchProduits();
          Swal.fire({
            icon: "success",
            title: "Succès!",
            text: "Produit supprimé avec succès.",
          });
        })
        .catch((error) => {
          console.error("Erreur lors de la suppression du produit:", error);
          Swal.fire({
            icon: "error",
            title: "Erreur!",
            text: "Échec de la suppression du produit.",
          });
        });
    }
  };

  const handleAddProduit = () => {
    const fournisseurOptions = fournisseurs.map((fournisseur) => ({
      value: fournisseur.id,
      label: fournisseur.raison_sociale,
    }));

    Swal.fire({
      title: "Ajouter Produit",
      html:
        `<label for="nom">Nom</label>` +
        `<input type="text" id="nom" class="swal2-input" placeholder="Nom">` +
        `<label for="type_quantite">Type Quantité</label>` +
        `<select id="type_quantite" class="swal2-input">` +
        `<option value="kg">kg</option>` +
        `<option value="unitaire">unitaire</option>` +
        `</select>` +
        `<label for="calibre">Calibre</label>` +
        `<input type="text" id="calibre" class="swal2-input" placeholder="Calibre">` +
        `<label for="user_id">user</label>` +
        `<input type="text" id="user_id" class="swal2-input" placeholder="user_id">` +
        `<label for="fournisseur">Fournisseur</label>` +

        `<select id="fournisseur" class="swal2-input">
          <option value="">Aucun</option>
        ${fournisseurOptions.map(
          (option) => `<option value="${option.value}">${option.label}</option>`
        )}
      </select>`,
      confirmButtonText: "ajouter",
      focusConfirm: false,
      showCancelButton: true,
      cancelButtonText: "Annuler",
      preConfirm: () => {
        return {
          nom: document.getElementById("nom").value,
          type_quantite: document.getElementById("type_quantite").value,
          calibre: document.getElementById("calibre").value,
          fournisseur_id: document.getElementById("fournisseur").value,
          user_id: document.getElementById("user_id").value,
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .post("http://localhost:8000/api/produits", result.value)
          .then(() => {
            fetchProduits();
            Swal.fire({
              icon: "success",
              title: "Succès!",
              text: "Produit ajouté avec succès.",
            });
          })
          .catch((error) => {
            console.error("Erreur lors de l'ajout du produit:", error);
            Swal.fire({
              icon: "error",
              title: "Erreur!",
              text: "Échec de l'ajout du produit.",
            });
          });
      }
    });
  };

  return (
    <div>
      <Navigation />
      <h2>Liste des Produits</h2>
      {filteredProducts && filteredProducts.length > 0 ? (
        <div className="table-container">
          <div className="search-container mb-3">
            <Search onSearch={handleSearch} />
          </div>
          <button className="btn btn-primary mb-3" onClick={handleAddProduit}>
            Ajouter Produit
          </button>
          {produits && produits.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>Type Quantité</th>
                  <th>Calibre</th>
                  <th>fournisseur</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((produit) => {
                    const fournisseur = fournisseurs.find(
                      (fournisseur) => fournisseur.id === produit.fournisseur_id
                    );
                    return (
                      <tr key={produit.id}>
                        <td>{produit.id}</td>
                        <td>{produit.nom}</td>
                        <td>{produit.type_quantite}</td>
                        <td>{produit.calibre}</td>
                        <td>
                          {fournisseur ? (
                            <>{fournisseur.raison_sociale}</>
                          ) : (
                            <div>ce produit n'a aucun fournisseur</div>
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-warning ms-2"
                            onClick={() => handleEdit(produit.id)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDelete(produit.id)}
                          >
                            <i className="fas fa-minus-circle"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          ) : (
            <p></p>
          )}

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredProducts.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </div>
      ) : (
        <p>Loading ....</p>
      )}
    </div>
  );
};

export default ProduitList;
