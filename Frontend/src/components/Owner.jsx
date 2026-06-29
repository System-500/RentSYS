import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

function Owner() {
  const { id } = useParams();
  const navigate = useNavigate(); 

  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate('/');
      return;
    }

    fetch(`http://localhost:3000/owners/${id}`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })
      .then((response) => {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          navigate('/'); 
          return null; 
        }
        if (!response.ok) {
          throw new Error('Błąd serwera przy pobieraniu właściciela');
        }
        return response.json();
      })
      .then((data) => {
        if (data) {
          setOwner(data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Błąd pobierania danych właściciela:', error);
        setLoading(false);
      });
  }, [id, navigate]);

  if (loading) {
    return <div className="text-white text-center mt-5"><h3>Ładowanie danych właściciela...</h3></div>;
  }


  if (!owner) {
    return (
      <div className="text-white text-center mt-5">
        <h3>Nie znaleziono danych właściciela.</h3>
        <Link className="btn btn-secondary mt-3" to="/car">Powrót do listy</Link>
      </div>
    );
  }
const calculateAge = (dob) => {
  if (!dob) return "Brak danych";
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};
  return (
    <div className="container mt-4 text-white" id="owner-details"> 
      <h3 className="text-center mt-4">Szczegóły właściciela</h3>
      <div className="text-left w-75 mx-auto mt-3 mb-3" id="owner-info">
        <p><strong>Imię:</strong> {owner.Name || "Brak danych"}</p>
        <p><strong>Nazwisko:</strong> {owner.Surname || "Brak danych"}</p>
        <p><strong>Wiek:</strong> {owner.DateOfBirth ? new Date().getFullYear() - new Date(owner.DateOfBirth).getFullYear() : "Brak danych"}</p>
        <p><strong>PESEL:</strong> {owner.PESEL || "Brak danych"}</p>
      </div>

      <div className="text-center mt-4">
        <Link className="btn btn-secondary" to="/car">Powrót do listy samochodów</Link>
      </div>
    </div>
  );
}

export default Owner;