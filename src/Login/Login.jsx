import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";
import { useAuth } from "../AuthContext";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                "http://localhost:8000/api/login",
                {
                    email: email,
                    password: password,
                },
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            const existingToken = localStorage.getItem("API_TOKEN");

            if (!existingToken) {
                localStorage.setItem("API_TOKEN", response.data.token);
            } else {
                localStorage.setItem("API_TOKEN", response.data.token);
            }

            const userData = response.data.user;

            login(userData);

            navigate("/");
        } catch (error) {
            console.error(error);

            if (error.response) {
                if (error.response.status === 422) {
                    setEmailError(error.response.data.errors.email);
                    setPasswordError(error.response.data.errors.password);
                } else if (error.response.status === 401) {
                    navigate("/login");
                } else if (error.response && error.response.status === 400) {
                    setError("Email or password incorrect");
                } else if (error.response.status === 200) {
                    navigate("/");
                }
            }
        }
    };

    const [isPanelTwoActive, setPanelTwoActive] = useState(false);

    const handlePanelToggle = () => {
        setPanelTwoActive(!isPanelTwoActive);
    };

    return (
        <div className={`form ${isPanelTwoActive ? 'panel-two active' : ''}`}>
            <div className="form-toggle" onClick={handlePanelToggle}></div>
            <div className="form-panel one">
                <div className="form-header">
                    <h1>Account Login</h1>
                </div>
                <div className="form-content">
                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <span className="error">{emailError}</span>
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <span className="error">{passwordError}</span>
                        </div>
                      
                        <div className="form-group">
                            <button type="submit">Log In</button>
                        </div>
                        <span className="error">{error}</span>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
