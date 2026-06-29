import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function CarList() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const fetchCars = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate('/');

    try {
      const response = await fetch('http://localhost:3000/list', {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          navigate('/');
          return;
      }

      const data = await response.json();
      setCars(data);
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate('/');
      return;
    }
    fetch('http://localhost:3000/auth/me', { 
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Brak ważnego tokena');
        }
        return response.json();
      })
      .then((data) => {
        if(data.loggedIn) {
          setCurrentUser({ ...data.owner, status: data.status });
        }
      })
      .catch((error) => {
        console.error('Błąd weryfikacji użytkownika:', error);
        localStorage.removeItem("token");
        navigate('/'); 
      });


    fetchCars();
  }, [navigate]);

  const handleDelete = async (id) => {
    if (window.confirm("Czy na pewno chcesz zakończyć wynajem tego samochodu?")) { 
      const token = localStorage.getItem("token");
      try {
        await fetch(`http://localhost:3000/${id}`, { 
          method: 'DELETE',
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
          }
        });
        fetchCars(); 
      } catch (error) {
        console.error('Error deleting car:', error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:3000/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        localStorage.removeItem("token");
        navigate('/');
      } else {
        alert("Błąd podczas wylogowywania na serwerze.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("Brak połączenia z serwerem.");
    }
  };

  if (loading) {
    return <div className="text-white text-center mt-5"><h3>Ładowanie danych z bazy...</h3></div>;
  }
  

  return (

    

    <div className="container mt-4 text-white">
      <div className="position-relative text-center mt-4">
       <div className="position-absolute top-0 end-0 d-flex gap-2">
      <Link className="btn btn-light" to={`/userUpdate`}>Ustawienia konta</Link>
      <button className="btn btn-danger" onClick={handleLogout}>Wyloguj</button>
    </div>
           <h2 id="car-list-title" className="m-0">Lista samochodów</h2>
          <div className="d-flex flex-column align-items-center">
      {currentUser && (
        <h5 id="user-greeting" className="mb-1">
          Hi, {currentUser.Name} {currentUser.Surname}
           {currentUser && currentUser.status === "Admin" && <span className="badge bg-secondary  ms-2">Administrator</span>} 
        </h5>
      )}
      
    </div>
    
        
        <hr id="car-table-hr" className="mt-4" />
      </div>
        
      <div className="text-left w-75 mx-auto mt-3 mb-3">
        {currentUser && currentUser.status !== "Admin" && (
          <Link className="btn btn-dark" to="/catalog">Wypożycz samochód</Link>
        )}
        
      </div>
      

      {currentUser && currentUser.status === "Admin" && (
        <div className="text-left w-75 mx-auto mb-3">
          <Link className="btn btn-secondary" to="/catalog">Zarządzaj katalogiem</Link>
        </div>
      )}

      <div className="table-responsive w-75 mx-auto" id="car-table">
        <table className="table table-striped text-white"> 
          <thead>
            <tr align="center">
               {currentUser && currentUser.status === "Admin" && <th>Właściciel</th>} 
          
              <th>Producent</th>
              <th>Model</th>
              <th>Kraj produkcji</th>
              <th>Akcje</th>
             
            </tr>
          </thead>
          <tbody align="center">
            {cars.length === 0 ? (
              <tr>
                <td colSpan="5">Brak samochodów w bazie danych</td>
              </tr>
            ) : (
              cars.map((car) => (
                <tr key={car._id}>
                  {currentUser && currentUser.status === "Admin" && (
                    <td>
                      {car.Owner ? (
                        <Link to={`/owner/${car.Owner._id}`} className="btn btn-info btn-sm">{car.Owner.Name}</Link>
                      ) : (
                        "Brak właściciela"  
                      )}
                    </td>
                  )}
                  <td>{car.CarCatalog ? car.CarCatalog.Manufacturer : "Brak danych"}</td>
                  <td>{car.CarCatalog ? car.CarCatalog.ModelName : "Brak danych"}</td>
                  <td>{car.CarCatalog ? car.CarCatalog.Country : "Brak danych"}</td>
                  <td align="center">
                    <Link to={`/catalog?edit=${car._id}`} className="btn btn-dark btn-sm me-2">Edytuj</Link>
                    <button onClick={() => handleDelete(car._id)} className="btn btn-sm btn-danger">Zakończ wynajem</button>
                  </td>
                  
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CarList;