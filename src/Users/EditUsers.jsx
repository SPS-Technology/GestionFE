import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import Navigation from "../Acceuil/Navigation";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("API_TOKEN");
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "",
    photo: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    role: "",
    photo: "",
    password: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/users/${id}/edit`,
          {
            withCredentials: true,
          }
        );
        const userData = response.data.user; // Assurez-vous d'accéder aux données de l'utilisateur
        setUser({
          name: userData.name,
          email: userData.email,
          role: userData.role,
          photo: userData.photo,
          password: userData.password, // Ajoutez une vérification pour éviter la valeur undefined
        });
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    if (e.target.type === "file") {
      // Handle file input
      const selectedFile = e.target.files[0];

      // Read the contents of the selected file
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser({
          ...user,
          [e.target.name]: reader.result, // Set the photo property to the base64-encoded file content
        });
      };

      if (selectedFile) {
        reader.readAsDataURL(selectedFile);
      }
    } else {
      // Handle other input types (text, etc.)
      setUser({
        ...user,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const csrfToken = document.querySelector(
        'meta[name="csrf-token"]'
      ).content;
      const response = await axios.put(
        `http://localhost:8000/api/users/${id}`,
        user,
        {
          withCredentials: true,
          headers: {
            "X-CSRF-TOKEN": csrfToken,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Modification réussie",
          text: "L'utilisateur a été modifié avec succès!",
        });

        navigate("/users");
        console.log("User updated:", response.data);
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 422) {
          setErrors(error.response.data.errors);
        } 

        else if (error.response.status === 403) {
          Swal.fire({
            icon: "error",
            title: "Accès refusé",
            text: "Vous n'avez pas l'autorisation d'ajouter un utilisateur.",
          });
        }
         else {
          console.error(
            "Erreur de serveur:",
            error.response.status,
            error.response.data
          );
        }
      } else if (error.request) {
        console.error(
          "Erreur de communication avec le serveur:",
          error.request
        );
      } else {
        console.error("Erreur de configuration de la requête:", error.message);
      }
    }
  };

  return (
    <div>
      <Navigation />
      <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
        <i className="fas fa-user-plus" aria-hidden="true"></i>
        <h2 style={{ marginBottom: "20px" }}>Modifer un utilisateur</h2>
        <form onSubmit={handleUpdate}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ marginRight: "10px" }}>Nom:</label>
            <input
              type="text"
              name="name"
              value={user.name}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
            />
            <span style={{ color: "red" }}>{errors.name}</span>
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ marginRight: "10px" }}>Email:</label>
            <input
              type="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
            />
            <span style={{ color: "red" }}>{errors.email}</span>
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ marginRight: "10px" }}>Role:</label>
            <input
              type="text"
              name="role"
              value={user.role}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
            />
            <span style={{ color: "red" }}>{errors.role}</span>
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ marginRight: "10px" }}>photo:</label>
            <input
              type="file"
              name="photo"
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
            />
            <span style={{ color: "red" }}>{errors.photo}</span>
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ marginRight: "10px" }}>Mot de passe:</label>
            <input
              type="text"
              name="password"
              value={user.password}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
            />
            <span style={{ color: "red" }}>{errors.password}</span>
          </div>
          <button
            type="submit"
            style={{
              background: "#4CAF50",
              color: "white",
              padding: "10px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Modifier
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditUser;
