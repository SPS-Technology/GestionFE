import React from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import jsPDF from "jspdf"; // Import jsPDF library
import "jspdf-autotable";

const exportToPdf = (banques, selectedItems) => {
    console.log("idc", selectedItems);
    if (!banques || banques.length === 0 || !selectedItems || selectedItems.length === 0) {
        alert("No data to export!");
        return;
    }

    // Map selectedItems to the corresponding livreurs
    const selectedbanquesData = banques.filter(banque => selectedItems.includes(banque.id));

    if (!selectedbanquesData || selectedbanquesData.length === 0) {
        alert("No selected data to export!");
        return;
    }

    const pdf = new jsPDF();

    // Add heading
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text("Liste banques", pdf.internal.pageSize.width / 2, 15, null, null, "center");

    // Define the columns for the table
    const columns = [
        { title: "Client", dataKey: "client_id" },
        { title: "Numéro de chéque", dataKey: "numero_cheque" },
        { title: "Mode de Paiement", dataKey: "mode_de_paiement" },
        { title: "Date", dataKey: "date" },
        { title: "Remarque", dataKey: "remarque" },


    ];

    // Convert data to array of objects
    const rows = selectedbanquesData.map((banque) => ({
        client_id: banque.client_id,
        numero_cheque: banque.numero_cheque,
        mode_de_paiement: banque.mode_de_paiement,
        avance: banque.avance,
        date: banque.date,
        remarque: banque.remarque,


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
    pdf.save("banques.pdf");
};


const ExportPdfButton = ({ banques, selectedItems }) => {
    const isDisabled = !selectedItems || selectedItems.length === 0;

    return (
        <Button
            onClick={() => exportToPdf(banques, selectedItems)}
            className="btn btn-danger btn-sm ml-2"
            disabled={isDisabled}
        >
            <FontAwesomeIcon icon={faFilePdf} className="" />
        </Button>
    );
}

export default ExportPdfButton;