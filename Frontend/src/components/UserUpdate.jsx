import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function UserUpdate() {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [pesel, setPesel] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [komunikat, setKomunikat] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate('/');
        return;
      }
      try {
        const response = await fetch(`http://localhost:3000/auth/me`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Błąd pobierania danych");
        const data = await response.json();
        
        if (data.owner) {
          setName(data.owner.Name || '');
          setSurname(data.owner.Surname || '');
          setPesel(data.owner.PESEL || '');
          if (data.owner.DateOfBirth) {
            setDateOfBirth(data.owner.DateOfBirth.split('T')[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {

      const response = await fetch(`http://localhost:3000/auth/update-user`, { 
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, surname, pesel, dateOfBirth })
      });

      if (response.ok) {
        alert("Dane zaktualizowane pomyślnie!");
        navigate('/car');
      } else {
        const errData = await response.json();
        setKomunikat(errData.error);
      }
    } catch (error) {
      console.error("Błąd:", error);
      setKomunikat("Brak połączenia z serwerem.");
    }
  };

  return (

    <div className="container mt-4 text-white">
      <h3 className="text-center mt-4 mx-auto">Aktualizacja danych</h3>
      <hr />
      <form onSubmit={handleUpdate} className="d-flex flex-column align-items-center text-left w-100 mt-3 mb-5">
<div className="form-group mb-3 w-50">
        <input type="text" className="form-control" placeholder="Imię" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
            <div className="form-group mb-3 w-50">
        <input type="text" className="form-control" placeholder="Nazwisko" value={surname} onChange={(e) => setSurname(e.target.value)} required />

        </div>
        <div className="form-group mb-3 w-50">
        <input type="number" className="form-control" placeholder="PESEL" value={pesel} onChange={(e) => setPesel(e.target.value)} required />
        </div>
        <div className="form-group mb-3 w-50">
        <input type="date" className="form-control" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
        </div>
        <div className="form-group mb-3 w-50">
        <p className="text-danger bold">{komunikat}</p>
        </div>
        <div className="form-group mt-4">
          <button type="submit" className="btn btn-success m-2">Zaktualizuj</button>
          <Link className="btn btn-secondary" to="/car">Anuluj</Link>
        </div>
      </form>
    </div>
  );
}

export default UserUpdate;