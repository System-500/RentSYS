const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 15;
const { Cars, Owner, User, validateUser, validateOwner } = require("../models/Cars");

const JWT_SECRET = process.env.JWTPRIVATEKEY;
function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
            if (err) {
                return res.status(403).json({ error: "Token jest nieprawidłowy lub wygasł." });
            }

            req.user = decodedUser;
            next();
        });
    } else {
        res.status(401).json({ error: "Brak tokenu autoryzacyjnego." });
    }
}
async function login(password, email) {
    if (!email || !password) {
        throw new Error("Adres email oraz hasło są wymagane.");
    }

    const user = await User.findOne({ Email: email.toLowerCase().trim() }).populate('Owner');
    if (!user) {
        throw new Error("Nie znaleziono użytkownika o podanym emailu.");
    }

    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) {
        throw new Error("Nieprawidłowy email lub hasło.");
    }
    return user;
}


async function register(email, password, name, surname, dateOfBirth, pesel) {
    try {
        if (!email || !password || !dateOfBirth || !pesel) {
            throw new Error("Email i hasło oraz data urodzenia są wymagane do rejestracji.");
        }
        const existingUser = await User.findOne({ Email: email.toLowerCase().trim() });
        if (existingUser) {
            throw new Error("Użytkownik o podanym adresie email już istnieje.");
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const age = calculateAge(dateOfBirth);




        const newOwner = new Owner({
            Name: name,
            Surname: surname,
            DateOfBirth: dateOfBirth,
            PESEL: pesel
        });



        const savedOwner = await newOwner.save();

        const newUser = new User({
            Email: email.toLowerCase().trim(),
            Password: hashedPassword,
            Owner: savedOwner._id
        });

        const savedUser = await newUser.save();
        return await User.findById(savedUser._id).populate('Owner');
    } catch (err) {
        throw err;
    }
}

function calculateAge(dateOfBirth) {
    if (!dateOfBirth) return 0;
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

router.post("/login", async (req, res) => {
    const email = req.body.email || req.body.Email;
    const password = req.body.password || req.body.Password;

    try {
        const user = await login(password, email);
        const token = jwt.sign(
            {
                id: user._id,
                ownerId: user.Owner?._id || user.Owner,
                status: user.Status || "User"
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ success: true, message: "Zalogowano pomyślnie.", token });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post("/register", async (req, res) => {
    const email = req.body.email || req.body.Email;
    const password = req.body.password || req.body.Password;
    const name = req.body.name || req.body.Name;
    const surname = req.body.surname || req.body.Surname;
    const dateOfBirth = req.body.dateOfBirth || req.body.DateOfBirth;
    const pesel = req.body.pesel || req.body.PESEL;

    const age = calculateAge(dateOfBirth);
    const { error: userError } = validateUser({ Email: email, Password: password });
    const { error: ownerError } = validateOwner({ Name: name, Surname: surname, DateOfBirth: dateOfBirth, PESEL: pesel });

    if (age < 18) {
        return res.status(400).json({ error: "Musisz mieć co najmniej 18 lat, aby się zarejestrować." });
    }
    else if (age > 120) {
        return res.status(400).json({ error: "Nieprawidłowa data urodzenia. Sprawdź swój wiek." });
    }
    if (userError) return res.status(400).json({ error: userError.details[0].message });
    if (ownerError) return res.status(400).json({ error: ownerError.details[0].message });

    try {
        const user = await register(email, password, name, surname, dateOfBirth, pesel);

        const token = user.generateAuthToken();
        res.json({ success: true, message: "Zarejestrowano i zalogowano.", token }

        );


    } catch (err) {
        res.status(400).json({ error: err.message || "Nie można zarejestrować użytkownika." });
    }
});

router.get("/me", authenticateJWT, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('Owner');
        if (!user) {
            return res.status(404).json({ loggedIn: false, error: "Użytkownik nie istnieje w bazie." });
        }

        res.json({
            loggedIn: true,
            email: user.Email,
            owner: user.Owner,
            status: user.Status || "User"
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/logout", (req, res) => {
    res.json({ success: true, message: "Pomyślnie wylogowano." });
});
router.put("/update-user", authenticateJWT, async (req, res) => {
    const userId = req.user.id;
    const { name, surname, dateOfBirth, pesel } = req.body;
      const age = calculateAge(dateOfBirth);
    const { error: ownerError } = validateOwner({ Name: name, Surname: surname, DateOfBirth: dateOfBirth, PESEL: pesel });

    if (age < 18) {
        return res.status(400).json({ error: "Musisz mieć co najmniej 18 lat." });
    }
    else if (age > 120) {
        return res.status(400).json({ error: "Nieprawidłowa data urodzenia. Sprawdź swój wiek." });
    }
    if (ownerError) return res.status(400).json({ error: ownerError.details[0].message });


    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "Użytkownik nie znaleziony." });
        }

        const ownerId = user.Owner;
        const Uowner = await Owner.findByIdAndUpdate(
            ownerId,
            { Name: name, Surname: surname, DateOfBirth: dateOfBirth, PESEL: pesel },
            { new: true }
        );

        if (!Uowner) {
            return res.status(404).json({ error: "Właściciel nie znaleziony." });
        }


        res.json({ success: true, message: "Zaktualizowano pomyślnie", owner: Uowner });

    } catch (err) {
        console.error("Błąd aktualizacji:", err);
        res.status(400).json({ error: "Nie udało się zaktualizować danych." });
    }
});



module.exports = router;