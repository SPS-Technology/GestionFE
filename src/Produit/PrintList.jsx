import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint } from "@fortawesome/free-solid-svg-icons";

const PrintList = ({ tableId, title, produitList, filteredProduits }) => {
  const handlePrint = () => {
    
    const printWindow = window.open("", "_blank", "");

    if (printWindow) {
      const tableToPrint = document.getElementById(tableId);

      if (tableToPrint) {
        const newWindowDocument = printWindow.document;
        newWindowDocument.write(`
          <!DOCTYPE html>
          <html lang="fr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css">
            <style>
              body {
                font-family: 'Arial', sans-serif;
                margin-bottom: 60px;
              }
              .page-header {
                text-align: center;
                font-size: 24px;
                margin-bottom: 20px;
              }
              .h1 {
                text-align: center;
              }
              .list-title {
                font-size: 18px;
                margin-bottom: 10px;
              }
              .header {
                font-size: 16px;
                margin-bottom: 10px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
              }
              .footer {
                position: fixed;
                bottom: 0;
                width: 100%;
                text-align: center;
                font-size: 14px;
                margin-top: 30px;
                background-color: #fff;
              }
              @media print {
                .footer {
                  position: fixed;
                  bottom: 0;
                }
                body {
                  margin-bottom: 0;
                }
                .no-print {
                  display: none;
                }
              }
              .content-wrapper {
                margin-bottom: 100px;
              }
              .extra-space {
                margin-bottom: 30px;
              }
            </style>
          </head>
          <body>
    <div class="page-header print-no-date">${title}</div>
    <div class="content-wrapper">
      <table>
        <thead>
          <tr>
            <th>Code de produit</th>
            <th>designation</th>
            <th>Type de Quantité</th>
            <th>Calibre</th>
            <th>Categorie</th>
          </tr>
        </thead>
        <tbody>
          ${filteredProduits.map((produit) => `
            <tr key=${produit.id}>
              <td>${produit.Code_produit}</td>
              <td>${produit.designation}</td>
              <td>${produit.type_quantite}</td>
              <td>${produit.calibre}</td>
              <td>${produit.categorie.categorie}</td>

            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
    <script>
      setTimeout(() => {
        window.print();
        window.onafterprint = function () {
          window.close();
        };
      }, 1000);
    </script>
  </body>
          </html>
        `);

        newWindowDocument.close();
      } else {
        console.error(`Table with ID '${tableId}' not found.`);
      }
    } else {
      console.error("Error opening print window.");
    }
  };
  
  return (
    <button className="btn btn-secondary btn btn-sm" onClick={handlePrint}>
      <FontAwesomeIcon icon={faPrint} className="me-2" />
    </button>
  );
};

export default PrintList;