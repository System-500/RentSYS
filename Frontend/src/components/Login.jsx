import { useState } from "react"
import axios from "axios"
import { Link } from "react-router-dom"
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); 
    const URL = "http://localhost:3000/auth/login";
    const data = { email, password };

    try {
      const response = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("token", result.token); 
        navigate('/car');
      } else {
        setError(result.message || "Błąd logowania");
      }
    } catch (error) {
      console.error("Błąd sieci:", error);
      setError("Nie można połączyć się z serwerem.");
    }
  };


  return (
    <div className="container mt-4 text-white w-100">
      <h3 className="text-center mt-4 mx-auto">Strona logowania</h3>
      <hr id="login-hr" />
      
      
      <form onSubmit={handleLogin} className="d-flex flex-column align-items-center text-left w-100 mt-3 mb-5">
        <div className="form-group mb-3 w-50">
          <input 
              type="email" 
              className="form-control" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
          />
        </div>

        <div className="form-group mb-3 w-50">
          <input 
              type="password" 
              className="form-control" 
              placeholder="Hasło" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
          />
        </div>
        {error && <div className="alert alert-danger w-50">{error}</div>}
        
        <button type="submit" className="btn btn-dark w-50">Zaloguj się</button>

        <p className="mt-3 text-center">
            Nie masz konta? <Link to="/register" className="text-light">Zarejestruj się</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;