require('dotenv').config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
const passport = require("passport");
const session = require("express-session");
const Localstrategy = require("passport-local")
const flash = require("connect-flash");
const methodOverride = require("method-override");
const multer = require('multer')
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const speakeasy = require('speakeasy');
const twilio = require('twilio');

const client = twilio(
    `${process.env.TWILIO_SID}`,
    `${process.env.TWILIO_AUTH}`
);


const User = require('./models/User.js');
const upload = multer({ dest: 'uploads/' });

let port = 8080;

const MONGO_URL = "mongodb://127.0.0.1:27017/repulsor";


main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));




const sessionOptions = {
    secret: "mysupersecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
}

app.use(session(sessionOptions));
app.use(flash());
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.use((req, res, next) => {
    res.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, private"
    );
    next();
});

app.get("/", (req, res) => {
    res.render("home.ejs");
});

app.use(passport.initialize());
app.use(passport.session());
passport.use(
    new Localstrategy(
        { usernameField: 'email' },  
        User.authenticate()
    )
);


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/repulsor/register", (req, res) => {
    res.render("signup.ejs");
})


app.post('/repulsor/register', async (req, res) => {
    try {
        const {
            Title, Board, Code, City, State,
            email, Contact,
            adminName, adminContact, adminEmail, password
        } = req.body;

        
        const secret = speakeasy.generateSecret({ length: 20 });

       
        const token = speakeasy.totp({
            secret: secret.base32,
            encoding: 'base32',
            step: 300
        });

       
        req.session.tempRegistration = {
            Title, Board, Code, City, State,
            email, Contact,
            adminName, adminContact, adminEmail,
            password,
            otpSecret: secret.base32
        };

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash("error", "Email already registered");
            return res.redirect("/repulsor/register");
        }

        
        await client.messages.create({
            body: `Your OTP is ${token}`,
            from: process.env.TWILIO_PHONE,
            to: `+91${Contact}`
        });

        res.redirect("/repulsor/verify-otp");

    } catch (err) {
        console.log(err);
        req.flash("error", err.message);
        res.redirect("/repulsor/register");
    }
});

app.get('/repulsor/verify-otp', (req, res) => {
    if (!req.session.tempRegistration) {
        return res.redirect("/repulsor/home");
    }
    res.render('otp.ejs');
})

app.post('/repulsor/verify-otp', async (req, res) => {
    try {
        const { otp } = req.body;
        const tempData = req.session.tempRegistration;

        if (!tempData) {
            req.flash("error", "Session expired. Please register again.");
            return res.redirect("/repulsor/register");
        }

        const verified = speakeasy.totp.verify({
            secret: tempData.otpSecret,
            encoding: 'base32',
            token: otp,
            step: 300,
            window: 1
        });

        if (!verified) {
            req.flash("error", "Invalid or expired OTP.");
            return res.redirect("/repulsor/verify-otp");
        }

        const newUser = new User({
            Title: tempData.Title,
            Board: tempData.Board,
            Code: tempData.Code,
            City: tempData.City,
            State: tempData.State,
            email: tempData.email,
            Contact: tempData.Contact,
            adminName: tempData.adminName,
            adminEmail: tempData.adminEmail,
            adminContact: tempData.adminContact
        });

        const registeredSchool = await User.register(newUser, tempData.password);

        delete req.session.tempRegistration;

        req.flash("success", "Registration successful 🎉");
        res.redirect(`/repulsor/adminLogin`);

    } catch (err) {
        console.log(err); 
        req.flash("error", err.message);
        res.redirect("/repulsor/register");
    }
});

app.get("/repulsor/adminLogin", (req, res) => {
    if (req.session.admin) {
        return res.redirect("/repulsor/adminDashboard");
    }
    res.render('login/adminLogin.ejs');
})

function isAdminLoggedIn(req, res, next) {
    if (!req.session.admin) {
        return res.redirect("/repulsor/adminLogin");
    }
    next();
}







app.listen(port, () => {
    console.log(`app is running on ${port}`);
})