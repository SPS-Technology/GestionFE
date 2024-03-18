import React from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import jsPDF from "jspdf"; // Import jsPDF library
import "jspdf-autotable";

const exportToPdf = (vehicule_livreurs, selectedItems) => {
    console.log("idc", selectedItems);
    if (!vehicule_livreurs || vehicule_livreurs.length === 0 || !selectedItems || selectedItems.length === 0) {
      alert("No data to export!");
      return;
    }
  
    // Map selectedItems to the corresponding vehicule_livreurs
    const selectedvehicule_livreursData = vehicule_livreurs.filter(vehicule_livreur => selectedItems.includes(vehicule_livreur.id));
  
    if (!selectedvehicule_livreursData || selectedvehicule_livreursData.length === 0) {
      alert("No selected data to export!");
      return;
    }
  
    const pdf = new jsPDF();
  
    // Add heading
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text("Liste vehicule_livreurs", pdf.internal.pageSize.width / 2, 15, null, null, "center");
  
    // Define the columns for the table
    const columns = [
      { title: "livreur", dataKey: "livreur_id" },
      { title: "vehicule", dataKey: "vehicule_id" },
      { title: "kilometrage au Debut ", dataKey: "kilometrage_debut" },
      { title: "kilometrage a la fin", dataKey: "kilometrage_fin" },
      { title: "Heure", dataKey: "heure" },
      { title: "Date debut d'affectation", dataKey: "date_debut_affectation" },
      { title: "Date fin d'affectation ", dataKey: "date_fin_affectation" },
    ];
  
    // Convert data to array of objects
    const rows = selectedvehicule_livreursData.map((vehicule_livreur) => ({
      livreur_id: vehicule_livreur.livreur.nom,
      vehicule_id: vehicule_livreur.vehicule.matricule,
      kilometrage_debut: vehicule_livreur.kilometrage_debut,
      kilometrage_fin: vehicule_livreur.kilometrage_fin,
      heure: vehicule_livreur.heure,
      date_debut_affectation: vehicule_livreur.date_debut_affectation,
      date_fin_affectation: vehicule_livreur.date_fin_affectation,
    }));
  
    // Set the margin and padding
    const margin = 5;
    const padding = 5;
  
    // Calculate the width of the columns
    const columnWidths = columns.map(
      (col) => pdf.getStringUnitWidth(col.title) * 5 + padding * 2
    );
    const tableWidth = columnWidths.reduce((total, width) => total + width, 0);
  
    // Set the table position
    const startX = (pdf.internal.pageSize.width - tableWidth) / 2;
    const startY = 25; // Adjust as needed
  
    // Add the table
    pdf.autoTable({
      columns,
      body: rows,
      theme: "grid",
      startY,
      startX, // Center the table horizontally
      styles: {
        overflow: "linebreak",
        columnWidth: "wrap",
        fontSize: 8,
      },
      headerStyles: {
        fillColor: [96, 96, 96],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
      margin: { top: 20 },
    });
  
    // Save the PDF
    pdf.save("vehicule_livreurs.pdf");
  };
  

const ExportPdfButton = ({ vehicule_livreurs, selectedItems }) => {
    const isDisabled = !selectedItems || selectedItems.length === 0;
  
    return (
      <Button
        onClick={() => exportToPdf(vehicule_livreurs, selectedItems)}
        className="btn btn-danger btn-sm ml-2"
        disabled={isDisabled}
      >
        <FontAwesomeIcon icon={faFilePdf} className="" />
      </Button>
    );
  }
  
  export default ExportPdfButton;
  