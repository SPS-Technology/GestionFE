import React from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import jsPDF from "jspdf"; // Import jsPDF library

const exportToPdf = (clients, selectedItems) => {
  if (!clients || clients.length === 0) {
    alert("No data to export!");
    return;
  }

    const pdf = new jsPDF();
  
    // Define the columns and rows for the table
    const columns = [
      "ID",
      "Raison Sociale",
      "Adresse",
      "Téléphone",
      "Ville",
      "Abréviation",
      "Zone",
      "User",
    ];
    const selectedclients = clients.filter((client) =>
      selectedItems.includes(client.id)
    );
    const rows = selectedclients.map((client) => [
      client.id,
      client.raison_sociale,
      client.adresse,
      client.tele,
      client.ville,
      client.abreviation,
      client.zone,
      client.user_id,
    ]);
  
    // Set the margin and padding
    const margin = 10;
    const padding = 5;
  
    // Calculate the width of the columns
    const columnWidths = columns.map(
      (col) => pdf.getStringUnitWidth(col) * 5 + padding * 2
    );
    const tableWidth = columnWidths.reduce((total, width) => total + width, 0);
  
    // Calculate the height of the rows
    const rowHeight = 10;
    const tableHeight = rows.length * rowHeight;
  
    // Set the table position
    const startX = (pdf.internal.pageSize.width - tableWidth) / 2;
    const startY = margin;
  
    // Add the table headers
    pdf.setFont("helvetica", "bold");
    pdf.setFillColor(200, 220, 255);
    pdf.rect(startX, startY, tableWidth, rowHeight, "F");
    pdf.autoTable({
      head: [columns],
      startY: startY + padding,
      styles: {
        fillColor: [200, 220, 255],
        textColor: [0, 0, 0],
        fontSize: 10,
      },
      columnStyles: {
        0: { cellWidth: columnWidths[0] },
        1: { cellWidth: columnWidths[1] },
        2: { cellWidth: columnWidths[2] },
        3: { cellWidth: columnWidths[3] },
        4: { cellWidth: columnWidths[4] },
        5: { cellWidth: columnWidths[5] },
        6: { cellWidth: columnWidths[6] },
        7: { cellWidth: columnWidths[7] },
      },
    });
  
    // Add the table rows
    pdf.setFont("helvetica", "");
    pdf.autoTable({
      body: rows,
      startY: startY + rowHeight + padding * 2,
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: columnWidths[0] },
        1: { cellWidth: columnWidths[1] },
        2: { cellWidth: columnWidths[2] },
        3: { cellWidth: columnWidths[3] },
        4: { cellWidth: columnWidths[4] },
        5: { cellWidth: columnWidths[5] },
        6: { cellWidth: columnWidths[6] },
        7: { cellWidth: columnWidths[7] },
      },
    });
  
    // Save the PDF
    pdf.save("clients.pdf");
};

const ExportPdfButton = ({ clients, selectedItems }) => (
  <Button onClick={() => exportToPdf(clients, selectedItems)} className="btn btn-danger btn-sm ml-2">
    <FontAwesomeIcon icon={faFilePdf} className="me-2" />
  </Button>
);


export default ExportPdfButton;