const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authenticateJWT = require("../middleware/auth");
const { Cars, Owner, CarsCatalogModel, User } = require("../models/Cars");
router.get("/catalog", authenticateJWT, async (req, res) => {
  try {
    const catalog = await CarsCatalogModel.find().lean();
    res.status(200).json(catalog);
  } catch (err) {
    res.status(500).json({ error: "Błąd serwera." });
  }
});
router.post("/catalog", authenticateJWT, async (req, res) => {
  if (req.user.status !== "Admin") {
    return res.status(403).json({ error: "Brak uprawnień!" });
  }
  try {
    const newCar = new CarsCatalogModel({
        Manufacturer: req.body.manufacturer,
        ModelName: req.body.modelName,
        Country: req.body.country
    });
    await newCar.save();
    res.status(201).json(newCar);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Nieprawidłowe dane modelu." });
  }
});
router.get("/catalog/:id", authenticateJWT, async (req, res) => {
  try {
    const item = await CarsCatalogModel.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ error: "Nie znaleziono w katalogu." });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Błąd serwera." });
  }
});



router.put("/catalog/:id", authenticateJWT, async (req, res) => {
  if (req.user.status !== "Admin") {
    return res.status(403).json({ error: "Brak uprawnień do edycji katalogu!" });
  }
  try {
    const updatedCatalogItem = await CarsCatalogModel.findByIdAndUpdate(
      req.params.id,
      {
        Manufacturer: req.body.manufacturer,
        ModelName: req.body.modelName,
        Country: req.body.country
      },
      { new: true }
    );

    if (!updatedCatalogItem) {
      return res.status(404).json({ error: "Nie znaleziono takiego modelu w katalogu." });
    }

    res.json({ success: true, message: "Zaktualizowano pomyślnie słownik auta", data: updatedCatalogItem });
  } catch (err) {
    console.error("Błąd aktualizacji katalogu:", err);
    res.status(400).json({ error: "Nie udało się zaktualizować." });
  }
});

router.delete("/catalog/:id", authenticateJWT, async (req, res) => {
  if (req.user.status !== "Admin") {
    return res.status(403).json({ error: "Brak uprawnień!" });
  }
  try {
    const deleted = await CarsCatalogModel.findByIdAndDelete(req.params.id);
    if (deleted) {
      res.json({ success: true, message: "Usunięto pomyślnie" });
    } else {
      res.status(404).json({ error: "Nie znaleziono modelu." });
    }
  } catch (err) {
    res.status(500).json({ error: "Błąd serwera." });
  }
});

router.get("/list", authenticateJWT, async (req, res) => {
  try {
    let query = {};

    if (req.user.status !== "Admin") {
      if (!req.user.ownerId) {
        return res.status(403).json({ error: "Brak przypisanego ID właściciela w tokenie." });
      }
      query = { Owner: new mongoose.Types.ObjectId(req.user.ownerId) };
    } 
    const docs = await Cars.find(query)
      .sort({ _id: -1 })
      .populate('Owner')
      .populate('CarCatalog') 
      .lean();

    res.json(docs);
  } catch (err) {
    console.error("Błąd podczas pobierania danych:", err);
    res.status(500).json({ error: "Wystąpił błąd podczas pobierania danych." });
  }
});

router.post("/select-car", authenticateJWT, async (req, res) => {
  try {
    const { carCatalogId } = req.body; 
    const ownerId = req.user.ownerId;

    if (!ownerId) {
      return res.status(400).json({ error: "Użytkownik nie posiada profilu właściciela." });
    }

    const assignedCar = new Cars({
      CarCatalog: new mongoose.Types.ObjectId(carCatalogId), 
      Owner: new mongoose.Types.ObjectId(ownerId) 
    });
    
    await assignedCar.save();
    res.status(200).json({ message: "Samochód pomyślnie przypisany!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Błąd podczas przypisywania auta." });
  }
});

router.put("/select-car/:id", authenticateJWT, async (req, res) => {
  try {
    const { carCatalogId } = req.body; 
    const carId = req.params.id; 
    const ownerId = req.user.ownerId;
    let filter = { _id: carId };
    if (req.user.status !== "Admin") {
      filter.Owner = ownerId;
    }

    const updatedCar = await Cars.findOneAndUpdate(
      filter, 
      { CarCatalog: new mongoose.Types.ObjectId(carCatalogId) },
      { new: true }
    );

    if (!updatedCar) {
      return res.status(404).json({ error: "Nie znaleziono samochodu lub brak uprawnień." });
    }

    res.json({ success: true, message: "Samochód został zmieniony pomyślnie!", car: updatedCar });
  } catch (err) {
    console.error("Błąd zmiany auta:", err);
    res.status(500).json({ error: "Wystąpił błąd podczas aktualizacji." });
  }
});

router.get("/owners/:id", authenticateJWT, async (req, res) => {
  try {
    const owner = await Owner.findById(req.params.id).lean();
    if (owner) {
      res.json(owner);
    } else {
      res.status(404).json({ error: "Nie znaleziono właściciela o podanym ID." });
    } 
  } catch (err) {
    res.status(500).json({ error: "Wystąpił błąd podczas pobierania danych." }); 
  }
});



router.delete("/:id", authenticateJWT, async (req, res) => { 
  try {
    let filter = { _id: req.params.id };
    if (req.user.status !== "Admin") {
      filter.Owner = req.user.ownerId;
    }

    const car = await Cars.findOneAndDelete(filter);
    if (car) {
      res.json({ success: true, message: "Usunięto pomyślnie" }); 
    } else {
      res.status(404).json({ error: "Nie znaleziono samochodu lub brak uprawnień do jego usunięcia." });
    }
  } catch (err) {
    console.error("Błąd podczas usuwania:", err);
    res.status(500).json({ error: "Wystąpił błąd podczas usuwania rekordu." });
  }
});

module.exports = router;