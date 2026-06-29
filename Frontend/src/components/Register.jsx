import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
    const [imie, setImie] = useState('');
    const [nazwisko, setNazwisko] = useState('');
    const [pesel, setPesel] = useState('');
    const [wiek, setWiek] = useState('');
    const [email, setEmail] = useState('');
    const [haslo, setHaslo] = useState('');
    const [powtorzHaslo, setPowtorzHaslo] = useState('');
    const [komunikat, setKomunikat] = useState('');
    
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault(); 
        if (haslo !== powtorzHaslo) {
            setKomunikat("Hasła nie są takie same!");
            return;
        }

        const userData = { 
            name: imie, 
            surname: nazwisko, 
            pesel : pesel, 
            dateOfBirth: wiek, 
            email : email, 
            password: haslo 
        };

        try {
            const response = await fetch('http://localhost:3000/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                const result = await response.json();
                localStorage.setItem("token", result.token);
                navigate('/car');
            } else {
                const data = await response.json();
                setKomunikat(data.error || "Nie można zarejestrować użytkownika.");
            }
        } catch (error) {
            console.error("Błąd połączenia:", error);
            setKomunikat("Brak połączenia z serwerem. Upewnij się, że backend działa.");
        }
    };

    return (
        <div className="container mt-4 text-white">
            <h3 className="text-center mt-4 mx-auto">Strona rejestracji</h3>
            <hr id="register-hr" />
            <form onSubmit={handleRegister} className="d-flex flex-column align-items-center text-left w-100 mt-3 mb-5">
                <div className="form-group mb-3 w-50">
                    <input type="text" className="form-control" placeholder="Imie" value={imie} onChange={(e) => setImie(e.target.value)} required />
                </div>
                <div className="form-group mb-3 w-50">
                    <input type="text" className="form-control" placeholder="Nazwisko" value={nazwisko} onChange={(e) => setNazwisko(e.target.value)} required />
                </div>
                <div className="form-group mb-3 w-50">
                    <input type="number" className="form-control" placeholder="PESEL" value={pesel} onChange={(e) => setPesel(e.target.value)} />
                </div>
                <div className="form-group mb-3 w-50">
                    <input type="date" className="form-control" value={wiek} onChange={(e) => setWiek(e.target.value)} required />
                </div>
                <div className="form-group mb-3 w-50">
                    <input type="email" className="form-control" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group mb-3 w-50">
                    <input type="password" className="form-control" placeholder="Hasło" value={haslo} onChange={(e) => setHaslo(e.target.value)} required />
                </div>
                <div className="form-group mb-3 w-50">
                    <input type="password" className="form-control" placeholder="Powtórz hasło" value={powtorzHaslo} onChange={(e) => setPowtorzHaslo(e.target.value)} required />
                </div>
                <div className="form-group mb-3 w-50">
                    <p className="text-danger bold" >{komunikat}</p>
                </div>
                <div className="form-group mb-3 w-50">
                    <button className="btn btn-dark w-100" type="submit">Zarejestruj się</button>
                    <p className="mt-3 text-center">
                        Masz już konto? <a href="/" className="text-light">Zaloguj się</a>
                    </p>
                </div>
            </form>
        </div>
    );
}

export default Register;