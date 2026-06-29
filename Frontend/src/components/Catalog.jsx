import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

function Catalog() {
    const [catalog, setCatalog] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const editCarId = queryParams.get('edit');

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate('/'); return; }

        const fetchUserData = fetch('http://localhost:3000/auth/me', {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        }).then(res => {
            if (!res.ok) throw new Error('Brak ważnego tokena');
            return res.json();
        });

        const fetchCatalogData = fetch('http://localhost:3000/catalog', {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json());

        Promise.all([fetchUserData, fetchCatalogData])
            .then(([userData, catalogData]) => {
                if (userData.loggedIn) {
                    setCurrentUser({ ...userData.owner, status: userData.status });
                } else {
                    navigate('/');
                    return;
                }
                setCatalog(catalogData);
                setLoading(false);
            })
            .catch(error => {
                console.error('Błąd inicjalizacji komponentu:', error);
                localStorage.removeItem("token");
                navigate('/');
            });

    }, [navigate]);

    const handleSelect = async (carCatalogId) => {
        const token = localStorage.getItem("token");
        const url = editCarId
            ? `http://localhost:3000/select-car/${editCarId}`
            : 'http://localhost:3000/select-car';

        const method = editCarId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ carCatalogId })
            });

            if (response.ok) {
                alert(editCarId ? "Model zmieniony pomyślnie!" : "Samochód przypisany pomyślnie!");
                navigate('/car');
            } else {
                const errorData = await response.json();
                alert(errorData.error || "Błąd podczas operacji.");
            }
        } catch (err) {
            console.error("Błąd połączenia:", err);
            alert("Brak połączenia z serwerem.");
        }
    };
const handleDelete = async (carId) => {
        if (!window.confirm("Czy na pewno chcesz usunąć ten model z katalogu?")) return;
        
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`http://localhost:3000/catalog/${carId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setCatalog(catalog.filter(c => c._id !== carId));
            } else {
                alert("Błąd podczas usuwania.");
            }
        } catch (err) {
            console.error("Błąd:", err);
        }
    };
    if (loading) return <div className="text-white text-center mt-5"><h3>Ładowanie danych z bazy...</h3></div>;

    return (
        <div className="container mt-4 text-white">
            <h2 className="mb-4">{editCarId ? "Wybierz nową markę dla pojazdu" : "Wybierz samochód z katalogu"}</h2>
       <div className="d-flex align-items-left justify-content-left gap-3 mt-3 mb-3">
  <button onClick={() => navigate('/car')} className="btn btn-secondary">
    Wróć do listy samochodów
  </button>
  {currentUser && currentUser.status === "Admin" && (
    <Link className="btn btn-dark" to="/form">
      Dodaj nowy samochód
    </Link>
  )}
</div>

{catalog.length > 0 ? (
    catalog.map(car => (
        <div key={car._id} className="card bg-light text-dark p-3 mb-3 d-flex flex-row justify-content-between align-items-center">
            <div>
                <strong>{car.Manufacturer}</strong> - {car.ModelName} ({car.Country})
            </div>
            <div className="d-flex gap-2">
              
                {editCarId && (
                    <button onClick={() => handleSelect(car._id)} className="btn btn-primary btn-sm">
                        Zmień markę
                    </button>
                )}
                {currentUser && currentUser.status !== "Admin" && !editCarId && (
                    <button onClick={() => handleSelect(car._id)} className="btn btn-success btn-sm">
                        Wypożycz
                    </button>
                )}
                {currentUser && currentUser.status === "Admin" && (
                    <>
                        <button onClick={() => navigate(`/form/${car._id}`)} className="btn btn-primary btn-sm">
                            Edytuj
                        </button>
                        <button onClick={() => handleDelete(car._id)} className="btn btn-danger btn-sm">
                            Usuń
                        </button>
                    </>
                )}

             
            </div>
        </div>
    ))
) : (
    <p>Brak dostępnych samochodów w katalogu.</p>
)}
        </div>
    );
}

export default Catalog;