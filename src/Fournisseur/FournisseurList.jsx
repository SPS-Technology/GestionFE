import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const FournisseurList = () => {
  const [fournisseurs, setFournisseurs] = useState([]);

  const fetchFournisseurs = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/fournisseurs');
      console.log('API Response:', response.data);
      setFournisseurs(response.data.fournisseurs);
    } catch (error) {
      console.error('Error fetching fournisseurs:', error);
    }
  };

  useEffect(() => {
    fetchFournisseurs();
  }, []);

  const handleEdit = (id) => {
    console.log(`Edit button clicked for Fournisseur ID ${id}`);
  };

  const handleDelete = (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this fournisseur?");
    
    if (isConfirmed) {
      // Perform the deletion logic here
      console.log(`Delete confirmed for Fournisseur ID ${id}`);
      
      // Example: Make a DELETE request to your API
      axios.delete(`http://localhost:8000/api/fournisseurs/${id}`)
        .then(() => {
          // If successful, update the state by fetching the updated list of fournisseurs
          fetchFournisseurs();

          // Show success message using Swal
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Fournisseur supprimé avec succes .',
          });
        })
        .catch((error) => {
          console.error('Error deleting fournisseur:', error);

          // Show error message using Swal
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Failed to delete fournisseur.',
          });
        });
    } else {
      // Handle the case where the user cancels the delete operation
      console.log("Delete canceled");
    }
  };

  return (
    <div>
      <h2>Liste des Fournisseurs</h2>
      {fournisseurs && fournisseurs.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Raison Sociale</th>
              <th>Adresse</th>
              <th>Téléphone</th>
              <th>Ville</th>
              <th>Abréviation</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {fournisseurs.map((fournisseur) => (
              <tr key={fournisseur.id}>
                <td>{fournisseur.id}</td>
                <td>{fournisseur.raison_sociale}</td>
                <td>{fournisseur.adresse}</td>
                <td>{fournisseur.tel}</td>
                <td>{fournisseur.ville}</td>
                <td>{fournisseur.abreviation}</td>
                <td>
                  <button
                    className="btn btn-warning ms-2" 
                    onClick={() => handleEdit(fournisseur.id)}
                  >
                   <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(fournisseur.id)}
                  >
                   <i className="fas fa-minus-circle"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No fournisseurs available</p>
      )}
    </div>
  );
};

export default FournisseurList;
