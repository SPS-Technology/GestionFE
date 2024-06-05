import { Button, Form, Table } from "react-bootstrap";
import React from "react";

const EncaissementForm = ({
                              formData,
                              comptes,
                              banques,
                              Banque,
                              factures,
                              ligneEntrerComptes,
                              editingEncaissement,
                              handleSubmit,
                              handleChange,
                              handlemodepaiementSelection,
                              closeForm,
                              page,
                              rowsPerPage,
                              formContainerStyle
                          }) => (
    <div id="formContainer" className="mt-2" style={formContainerStyle}>
        <Form className="col row" onSubmit={handleSubmit}>
            <Form.Label className="text-center m-2">
                <h5>{editingEncaissement ? 'Modifier encaissement' : 'Ajouter un encaissement'}</h5>
            </Form.Label>
            <Form.Group className="col-sm-5 m-2" controlId="comptes_id">
                <Form.Label>Compte</Form.Label>
                <Form.Select
                    name="comptes_id"
                    value={formData.comptes_id}
                    onChange={handleChange}
                    className="form-select form-select-sm"
                >
                    <option value="">Sélectionner un compte</option>
                    {comptes.map((compte) => (
                        <option key={compte.id} value={compte.id}>
                            {compte.designations}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>
            <Form.Group className="col-sm-10 m-2">
                <Form.Label>Reference</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Reference"
                    name="referencee"
                    value={formData.referencee}
                    onChange={handleChange}
                />
            </Form.Group>
            <Form.Group className="col-sm-5 m-2">
                <Form.Label>Date d'encaissement</Form.Label>
                <Form.Control
                    type="date"
                    placeholder="Date d'encaissement"
                    name="date_encaissement"
                    value={formData.date_encaissement}
                    onChange={handleChange}
                />
            </Form.Group>
            <Form.Group className="col-sm-5 m-2" controlId="type_encaissement">
                <Form.Label>Type d'encaissement</Form.Label>
                <Form.Select
                    name="type_encaissement"
                    value={formData.type_encaissement}
                    onChange={(e) => handlemodepaiementSelection(e.target)}
                    className="form-select form-select-sm"
                >
                    <option value="">Sélectionner un encaissement</option>
                    {banques.map((banque) => (
                        <option key={banque.id} value={banque.mode_de_paiement}>
                            {banque.mode_de_paiement}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>

            <div className="col-md-12">
                <Form.Group controlId="selectedFactureTable">
                    <Table striped bordered hover responsive>
                        <thead>
                        <tr>
                            <th>Client</th>
                            <th>N° de Facture</th>
                            <th>Total TTC</th>
                            <th>Date de Facture</th>
                            <th>N° de Chéque</th>
                            <th>Mode de Paiement</th>
                            <th>Date</th>
                            <th>Avance</th>
                            <th>Status</th>
                            <th>Remarque</th>
                        </tr>
                        </thead>
                        <tbody>
                        {Banque && Banque.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((banque) => {
                            const ligneEntrerCompte = ligneEntrerComptes.find(ligne => ligne.client_id === banque.client_id);
                            const facture = factures.find(facture => facture.id === ligneEntrerCompte?.id_facture);

                            return (
                                <tr key={banque.id}>
                                    <td>{facture?.client.raison_sociale}</td>
                                    <td>{facture?.reference}</td>
                                    <td>{facture?.total_ttc}</td>
                                    <td>{facture?.date}</td>
                                    <td>{banque.numero_cheque}</td>
                                    <td>{banque.mode_de_paiement}</td>
                                    <td>{banque.datee}</td>
                                    <td>{ligneEntrerCompte ? ligneEntrerCompte.avance : 'N/A'}</td>
                                    <td>{banque.Status}</td>
                                    <td>{banque.remarque}</td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </Table>
                </Form.Group>
            </div>
            <Form.Group className="col m-3 text-center">
                <Button type="submit" className="btn btn-success col-6">
                    {editingEncaissement ? 'Modifier' : 'Ajouter'}
                </Button>
                <Button className="btn btn-secondary col-5 offset-1" onClick={closeForm}>
                    Annuler
                </Button>
            </Form.Group>
        </Form>
    </div>
);

export default EncaissementForm;
