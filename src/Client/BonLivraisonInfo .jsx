import React, { useState, useEffect } from "react";
import axios from "axios";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Box } from "@mui/system";
import Navigation from "../Acceuil/Navigation";
import { Toolbar } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faFilePdf,
  faPrint,
  faPlus,
  faMinus,
} from "@fortawesome/free-solid-svg-icons";
import { keyboard } from "@testing-library/user-event/dist/keyboard";
const BonLivraisonInfo = () => {
  const [bonLivraison, setBonLivraison] = useState([]);
  const [clients, setClients] = useState([]);

  const { clientId } = useParams();
  const [formContainerStyle, setFormContainerStyle] = useState({
    right: "-100%",
  });
  const [tableContainerStyle, setTableContainerStyle] = useState({
    marginRight: "0px",
  });
  useEffect(() => {
    const fetchBonLivraison = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/clients/${clientId}/bonslivraison`
        );
        setBonLivraison(response.data.bonsLivraison);
        console.log(response.data.bonsLivraison);
        const clientResponse = await axios.get(
          "http://localhost:8000/api/clients"
        );
        setClients(clientResponse.data.client);
        console.log("API Response:", clients);

      } catch (error) {
        console.error("Error fetching bon de livraison:", error);
      }
    };

    fetchBonLivraison();
  }, [clientId]);



  const handlePrint = async (livraisonId) => {
    const selectedLivraison = bonLivraison.find(livraison => livraison.id === livraisonId);
    
    // Vérifier si l'ID du client est disponible
    if (selectedLivraison && selectedLivraison.client_id) {
        try {
            // Effectuer une requête pour récupérer les informations détaillées sur le client
            const clientResponse = await axios.get(`http://localhost:8000/api/clients/${selectedLivraison.client_id}`);
            
            // Vérifier si les informations sur le client ont été récupérées avec succès
            if (clientResponse.data) {
                const clientInfo = clientResponse.data;
                console.log("Informations sur le client :", clientInfo);
                
                // Création d'une nouvelle instance de jsPDF
                const doc = new jsPDF();
                
                // Position de départ pour l'impression des données
                let startY = 20;
                
                // Dessiner les informations du client dans un tableau à gauche
                const clientDetails = [
                    { label: "Raison sociale:", value: clientInfo.client.raison_sociale},
                    { label: "Adresse:", value: clientInfo.client.adresse},
                    { label: "Téléphone:", value: clientInfo.client.tele  },
                    { label: "Ville:", value: clientInfo.client.ville }
                ];
                
                // Dessiner le tableau d'informations client à gauche
                doc.setFontSize(10); // Police plus petite pour les informations du client
                clientDetails.forEach((info) => {
                    doc.text(`${info.label}`, 10, startY);
                    doc.text(`${info.value}`, 40, startY);
                    startY += 10; // Espacement entre les lignes du tableau
                });
                
                // Dessiner les informations du bon de livraison dans un tableau à droite
                const livraisonInfo = [
                    { label: "Référence:", value: selectedLivraison.reference },
                    { label: "Date:", value: selectedLivraison.date },
                    { label: "Référence BC:", value: selectedLivraison.ref_BC },
                ];
                
                // Dessiner le tableau des informations du bon de livraison à droite
                startY = 20; // Réinitialiser la position Y
                livraisonInfo.forEach((info) => {
                    doc.text(`${info.label}`, 120, startY);
                    doc.text(`${info.value}`, 160, startY);
                    startY += 10; // Espacement entre les lignes du tableau
                });
                
                // Enregistrer le fichier PDF avec le nom 'bonlivraison.pdf'
                doc.save("bonlivraison.pdf");
            } else {
                console.error("Impossible de récupérer les informations sur le client.");
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des informations sur le client :", error);
        }
    } else {
        console.error("ID du client indisponible.");
    }
};


  // Render bon de livraison information in a table
  return (
    <ThemeProvider theme={createTheme()}>
      <Box sx={{ display: "flex" }}>
        <Navigation />
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 4 }}>
          <Toolbar />
          <h3 className="text-left" style={{ color: "#A31818" }}>
            <EditNoteIcon style={{ fontSize: "24px", marginRight: "8px" }} />
            Liste des bon de livraison
          </h3>
          <div
            id="tableContainer"
            className="table-responsive-sm"
            style={tableContainerStyle}
          >
            <table className="table table-bordered" id="clientsTable">
              <thead
                className="text-center"
                style={{ backgroundColor: "#adb5bd" }}
              >
                <tr>
                  <th>Référence</th>
                  <th>Date</th>
                  <th>Référence BC</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {bonLivraison &&
                  bonLivraison.map((livraison) => (
                    <tr key={livraison.id}>
                      <td>{livraison.reference}</td>
                      <td>{livraison.date}</td>
                      <td>{livraison.ref_BC}</td>
                      <td>
                        {" "}
                        <Button
                          className="col-3 btn btn-sm m-2"
                          onClick={() => handlePrint(livraison.id)}
                        >
                          <FontAwesomeIcon icon={faFilePdf} />
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default BonLivraisonInfo;
