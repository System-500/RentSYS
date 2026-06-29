const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const Joi = require("joi")

const OwnerSchema = new mongoose.Schema({
    Name: String,
    Surname: String,
    DateOfBirth: Date,
    PESEL: String,
});
const CarsCatalog = new mongoose.Schema({
    Manufacturer: String,
    ModelName: String,
    Country: String,
});

const CarsSchema = new mongoose.Schema({
    Owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner' },
    CarCatalog: { type: mongoose.Schema.Types.ObjectId, ref: 'CarsCatalog' }
});

const UserSchema = new mongoose.Schema({
    Status: { type: String, default: "User", required: true },
    Email: { type: String, required: true, unique: true },
    Password: { type: String, required: true },
    Owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner' }
});



UserSchema.methods.generateAuthToken = function () {
    const secretKey = process.env.JWTPRIVATEKEY || "Chlebiczek!";
    const ownerIdValue = this.Owner?._id || this.Owner;
    const token = jwt.sign(
        { id: this._id, ownerId: ownerIdValue, status: this.Status || "User" }, 
        secretKey, 
        { expiresIn: "7d" }
    );
    return token;
};





const Cars = mongoose.model("Cars", CarsSchema);
const Owner = mongoose.model("Owner", OwnerSchema);
const User = mongoose.model("User", UserSchema);
const CarsCatalogModel = mongoose.model("CarsCatalog", CarsCatalog);

const validateUser = (data) => {
    const schema = Joi.object({
        Email: Joi.string().email().required().label("Email").messages({
            "string.email": "Nieprawidłowy format email.",
            "string.empty": "Email jest wymagany."
        }),
        Password: Joi.string().required().min(5).label("Password").messages({
            "string.min": "Hasło musi mieć co najmniej {#limit} znaków.",
            "string.empty": "Hasło jest wymagane."
        })
    });
    return schema.validate(data);
};

const validateOwner = (data) => {
    const schema = Joi.object({
        Name: Joi.string().required().label("Name").messages({
            "string.empty": "Imię jest wymagane."
        }),
        Surname: Joi.string().required().label("Surname").messages({
            "string.empty": "Nazwisko jest wymagane."
        }),
        DateOfBirth: Joi.date().required().label("DateOfBirth").messages({
            "date.empty": "Data urodzenia jest wymagana."
        }),
        PESEL: Joi.string().required().length(11).pattern(/^[0-9]+$/).label("PESEL").messages({
            "string.length": "PESEL musi składać się z 11 cyfr.",
            "string.pattern.base": "PESEL musi składać się tylko z cyfr.",
            "string.empty": "PESEL jest wymagany."
        })
    });
    return schema.validate(data);
};



module.exports = { Cars, Owner, User, CarsCatalogModel, validateUser, validateOwner };