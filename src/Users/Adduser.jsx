import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Navigation from "../Acceuil/Navigation";

const AddUser = () => {
  const token = localStorage.getItem("API_TOKEN");
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

  const navigate = useNavigate();
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

  const handleChange = (e) => {
    // If the input is a file input (photo), update the state with the selected file
    if (e.target.name === "photo") {
      setUser({
        ...user,
        [e.target.name]: e.target.files[0],
      });
    } else {
      setUser({
        ...user,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const csrfToken = document.querySelector(
        'meta[name="csrf-token"]'
      ).content;
      const formData = new FormData();
      formData.append("name", user.name);
      formData.append("email", user.email);
      formData.append("role", user.role);
      formData.append("photo", user.photo);
      formData.append("password", user.password);

      const response = await axios.post(
        "http://localhost:8000/api/register",
        formData,
        {
          headers: {
            "X-CSRF-TOKEN": csrfToken,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      Swal.fire({
        icon: "success",
        title: "Utilisateur ajouté avec succès!",
        showConfirmButton: false,
        timer: 1500,
      });
      navigate("/users");
      console.log("Nouvel utilisateur :", response.data);

      setUser({
        name: "",
        email: "",
        role: "",
        photo: "",
        password: "",
      });
      setErrors({
        name: "",
        email: "",
        role: "",
        photo: "",
        password: "",
      });
    } catch (error) {
      if (error.response) {
        // La requête a été effectuée, mais le serveur a répondu avec un statut de validation
        const serverErrors = error.response.data.errors;

        // Set errors in state for each field
        setErrors({
          name: serverErrors?.name?.[0] || "",
          email: serverErrors?.email?.[0] || "",
          role: serverErrors?.role?.[0] || "",
          photo: serverErrors?.photo?.[0] || "",
          password: serverErrors?.password?.[0] || "",
        });
      } else if (error.request) {
        // La requête a été effectuée, mais aucune réponse n'a été reçue
        console.error(
          "Erreur lors de la communication avec le serveur :",
          error.request
        );
      } else {
        // Une erreur s'est produite lors de la configuration de la requête
        console.error(
          "Erreur lors de la configuration de la requête :",
          error.message
        );
      }
    }
  };

  return (
    <div>
      <Navigation />
      <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
        <i className="fas fa-user-plus" aria-hidden="true"></i>
        <h2 style={{ marginBottom: "20px" }}>Ajouter un utilisateur</h2>
        <form onSubmit={handleSubmit}>
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
            <label style={{ marginRight: "10px" }}>Photo:</label>
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
            Ajouter
          </button>
        </form>
      </div>
    </div>
  );
};
export default AddUser;
