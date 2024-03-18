import React from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import jsPDF from "jspdf"; // Import jsPDF library
import "jspdf-autotable";

const exportToPdf = (recouvrements, selectedItems) => {
    console.log("idc", selectedItems);
    if (!recouvrements || recouvrements.length === 0 || !selectedItems || selectedItems.length === 0) {
        alert("No data to export!");
        return;
    }

    // Map selectedItems to the corresponding livreurs
    const selectedrecouvrementsData = recouvrements.filter(recouvrement => selectedItems.includes(recouvrement.id));

    if (!selectedrecouvrementsData || selectedrecouvrementsData.length === 0) {
        alert("No selected data to export!");
        return;
    }

    const pdf = new jsPDF();

    // Add heading
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text("Liste recouvrements", pdf.internal.pageSize.width / 2, 15, null, null, "center");

    // Define the columns for the table
    const columns = [
        { title: "Client", dataKey: "client_id" },
        { title: "Numéro de Facture", dataKey: "numero_facture" },
        { title: "Montant HT", dataKey: "montant_ht" },
        { title: "Avance", dataKey: "avance" },
        { title: "Mode de Paiement", dataKey: "mode_paiement" },
        { title: "Date D'Echeance", dataKey: "date_echeance" },
        { title: "Reste", dataKey: "reste" },


    ];

    // Convert data to array of objects
    const rows = selectedrecouvrementsData.map((recouvrement) => ({
        client_id: recouvrement.client_id,
        numero_facture: recouvrement.numero_facture,
        montant_ht: recouvrement.montant_ht,
        avance: recouvrement.avance,
        mode_paiement: recouvrement.mode_paiement,
        date_echeance: recouvrement.date_echeance,
        reste: recouvrement.reste,


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
    pdf.save("recouvrements.pdf");
};


const ExportPdfButton = ({ recouvrements, selectedItems }) => {
    const isDisabled = !selectedItems || selectedItems.length === 0;

    return (
        <Button
            onClick={() => exportToPdf(recouvrements, selectedItems)}
            className="btn btn-danger btn-sm ml-2"
            disabled={isDisabled}
        >
            <FontAwesomeIcon icon={faFilePdf} className="" />
        </Button>
    );
}

export default ExportPdfButton;