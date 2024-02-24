import React from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import jsPDF from "jspdf";

const exportToPdf = (produits, selectedItems) => {
  if (!produits || produits.length === 0) {
    alert("Aucune donnée à exporter !");
    return;
  }

  const pdf = new jsPDF();

  const columns = [
    "Nom",
    "Type de Quantité",
    "Calibre",
  ];

  const selectedProduits = produits.filter((produit) =>
    selectedItems.includes(produit.id)
  );

  const rows = selectedProduits.map((produit) => [
    produit.nom,
    produit.type_quantite,
    produit.calibre,
  ]);

  const margin = 10;
  const padding = 5;
  const rowHeight = 10;

  const columnWidths = columns.map(
    (col) => pdf.getStringUnitWidth(col) * 5 + padding * 2
  );
  const tableWidth = columnWidths.reduce((total, width) => total + width, 0);
  const tableHeight = rows.length * rowHeight;

  const startX = (pdf.internal.pageSize.width - tableWidth) / 2;
  const startY = margin;

  pdf.setFont("helvetica", "bold");
  pdf.rect(startX, startY, tableWidth, rowHeight, "F");
  pdf.autoTable({
    head: [columns],
    body: rows,
    startY: startY + padding,
    styles: {
      textColor: [0, 0, 0], // Couleur du texte
      fontSize: 12, // Taille de la police
      fontStyle: 'bold', // Style de police
      cellPadding: padding, // Remplissage de la cellule
      valign: 'middle', // Alignement vertical
      halign: 'center', // Alignement horizontal
    },
    columnStyles: {
      0: { fillColor: [200, 220, 255] }, // Couleur de remplissage de la première colonne
      1: { fillColor: [255, 255, 255] }, // Couleur de remplissage de la deuxième colonne
      2: { fillColor: [200, 220, 255] }, // Couleur de remplissage de la troisième colonne
    },
    theme: 'striped', // Thème de la table
    headStyles: {
      fillColor: [150, 150, 150], // Couleur de remplissage de l'en-tête
      textColor: [255, 255, 255], // Couleur du texte de l'en-tête
      fontSize: 14, // Taille de la police de l'en-tête
      fontStyle: 'bold', // Style de police de l'en-tête
      halign: 'center', // Alignement horizontal de l'en-tête
      valign: 'middle', // Alignement vertical de l'en-tête
    },
  });

  const filename = `produits_${new Date().toISOString()}.pdf`;
  pdf.save(filename);
};

const ExportPdfButton = ({ produits, selectedItems }) => (
    <Button onClick={() => exportToPdf(produits, selectedItems)} className="btn btn-danger btn btn-sm">
      <FontAwesomeIcon icon={faFilePdf} className="me-2" />
    </Button>
);

export default ExportPdfButton;
