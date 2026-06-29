import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function CarForm() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [manufacturer, setManufacturer] = useState('');
  const [modelName, setModelName] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(id ? true : false);
  
  useEffect(() => {
    if (!id) return; 

    const token = localStorage.getItem("token");
    fetch(`http://localhost:3000/catalog/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setManufacturer(data.Manufacturer || '');
        setModelName(data.ModelName || '');
        setCountry(data.Country || '');
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        alert("Błąd podczas ładowania danych pojazdu.");
      });
  }, [id]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const carData = { manufacturer, modelName, country };
    const url = id ? `http://localhost:3000/catalog/${id}` : 'http://localhost:3000/catalog';
    const method = id ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(carData)
      });

      if (response.ok) {
        alert(id ? "Model zaktualizowany!" : "Dodano nowy model!");
        navigate('/catalog'); 
      } else {
        alert("Błąd zapisu.");
      }
      if(curentUser.status !== "Admin") {
        alert("Brak uprawnień do edycji katalogu!");
        navigate('/catalog');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-white text-center mt-5">Ładowanie...</div>;

  return (
    <div className="container mt-4 text-white">
      <h2>{id ? "Edytuj model" : "Dodaj nowy model"}</h2>
      <form onSubmit={handleSubmit} className="mt-4 bg-light text-dark p-4 rounded">
        <div className="mb-3">
          <label className="form-label">Producent</label>
          <input type="text" className="form-control" value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Model</label>
          <input type="text" className="form-control" value={modelName} onChange={(e) => setModelName(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Kraj</label>
          <input type="text" className="form-control" value={country} onChange={(e) => setCountry(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-success me-2">Zapisz</button>
        <button type="button" onClick={() => navigate('/catalog')} className="btn btn-secondary">Anuluj</button>
      </form>
    </div>
  );
}

export default CarForm;