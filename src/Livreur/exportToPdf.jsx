import React from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import jsPDF from "jspdf"; // Import jsPDF library
import "jspdf-autotable";

const exportToPdf = (livreurs, selectedItems) => {
    console.log("idc", selectedItems);
    if (!livreurs || livreurs.length === 0 || !selectedItems || selectedItems.length === 0) {
      alert("No data to export!");
      return;
    }
  
    // Map selectedItems to the corresponding livreurs
    const selectedlivreursData = livreurs.filter(livreur => selectedItems.includes(livreur.id));
  
    if (!selectedlivreursData || selectedlivreursData.length === 0) {
      alert("No selected data to export!");
      return;
    }
  
    const pdf = new jsPDF();
  
    // Add heading
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text("Liste livreurs", pdf.internal.pageSize.width / 2, 15, null, null, "center");
  
    // Define the columns for the table
    const columns = [
      { title: "Nom", dataKey: "nom" },
      { title: "prenom", dataKey: "prenom" },
      { title: "adresse", dataKey: "adresse" },
      { title: "tele", dataKey: "tele" },
      { title: "cin", dataKey: "cin" },
    ];
  
    // Convert data to array of objects
    const rows = selectedlivreursData.map((livreur) => ({
      nom: livreur.nom,
      prenom: livreur.prenom,
      adresse: livreur.adresse,
      tele: livreur.tele,
      cin: livreur.cin,
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
    pdf.save("livreurs.pdf");
  };
  

const ExportPdfButton = ({ livreurs, selectedItems }) => {
    const isDisabled = !selectedItems || selectedItems.length === 0;
  
    return (
      <Button
        onClick={() => exportToPdf(livreurs, selectedItems)}
        className="btn btn-danger btn-sm ml-2"
        disabled={isDisabled}
      >
        <FontAwesomeIcon icon={faFilePdf} className="" />
      </Button>
    );
  }
  
  export default ExportPdfButton;
  