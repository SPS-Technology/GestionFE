const handleDeletezone = async (zoneId) => {
    try {
      const response = await axios.delete(
        `http://localhost:8000/api/zones/${zoneId}`
      );
      console.log(response.data);
      Swal.fire({
        icon: "success",
        title: "Succès!",
        text: "zone supprimé avec succès.",
      });
    } catch (error) {
      console.error("Error deleting zone:", error);
      Swal.fire({
        icon: "error",
        title: "Erreur!",
        text: "Échec de la suppression de la zone.",
      });
    }
  };
  const handleAddZone = async () => {
    const { value: zoneData } = await Swal.fire({
      title: "Ajouter une zone",
      html: `
          <form id="addZoneForm">
              <input id="swal-input1" class="swal2-input" placeholder="zone" name="zone">
              <div class="form-group mt-3">
                  <table class="table table-hover">
                      <thead>
                          <tr>
                              <th>Id</th>
                              <th>zone</th>
                          </tr>
                      </thead>
                      <tbody>
                          ${zones
                            .map(
                              (zone) => `
                              <tr key=${zone.id}>
                                  <td>${zone.id}</td>
                                  <td>${zone.zone}</td>
                                  <td>
                                      <select id="actionDropdown_${zone.id}" class="form-control">
                                          <option value="">Select Action</option>
                                          <option value="modify_${zone.id}">Modifier</option>
                                          <option value="delete_${zone.id}">Supprimer</option>
                                      </select>
                                  </td>
                              </tr>
                          `
                            )
                            .join("")}
                      </tbody>
                  </table>
              </div>
          </form>
      `,
      showCancelButton: true,
      confirmButtonText: "Ajouter",
      cancelButtonText: "Annuler",
      preConfirm: () => {
        const zone = Swal.getPopup().querySelector("#swal-input1").value;
        return { zone };
      },
    });

    if (zoneData) {
      try {
        const response = await axios.post(
          "http://localhost:8000/api/zones",
          zoneData
        );
        console.log(response.data);
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "zone ajoutée avec succès.",
        });
      } catch (error) {
        console.error("Error adding Zone:", error);
        Swal.fire({
          icon: "error",
          title: "Erreur!",
          text: "Échec de l'ajout de la zone.",
        });
      }
    }
  };
  document.addEventListener("change", async function (event) {
    if (event.target && event.target.id.startsWith("actionDropdown_")) {
      const [action, zoneId] = event.target.value.split("_");
      if (action === "delete") {
        // Delete action
        handleDeletezone(zoneId);
      } else if (action === "modify") {
        // Modify action
        try {
          const response = await axios.get(
            `http://localhost:8000/api/zones/${zoneId}`
          );
          const zoneToModify = response.data;

          if (!zoneToModify) {
            console.error("Zone not found or data is missing");
            return;
          }

          const zoneValue =
            zoneToModify && zoneToModify.zone
              ? zoneToModify.zone
              : "";

          const { value: modifiedData } = await Swal.fire({
            title: "Modifier une zone",
            html: `
                    <form id="modifyZoneForm">
                        <input id="swal-modify-input1" class="swal2-input" placeholder="zone" name="zone" value="${zoneValue}">
                    </form>
                `,
            showCancelButton: true,
            confirmButtonText: "Modifier",
            cancelButtonText: "Annuler",
            preConfirm: () => {
              const modifiedZone = Swal.getPopup().querySelector(
                "#swal-modify-input1"
              ).value;

              return {
                zone: modifiedZone,
              };
            },
          });

          if (modifiedData) {
            const modifyResponse = await axios.put(
              `http://localhost:8000/api/zones/${zoneId}`,
              modifiedData
            );
            console.log(modifyResponse.data);
            Swal.fire({
              icon: "success",
              title: "Succès!",
              text: "zone modifiée avec succès.",
            });
          }
        } catch (error) {
          console.error(
            "Erreur lors de la modification de la zone:",
            error
          );
          Swal.fire({
            icon: "error",
            title: "Erreur!",
            text: "Échec de la modification de la zone.",
          });
        }
      }

      // Clear selection after action
      event.target.value = "";
    }
  });