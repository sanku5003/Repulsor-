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

const User = require('./models/User.js');
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

// app.get("/", (req, res) => {
//   res.send("Hi, I am root");
// });

app.use(passport.initialize());
app.use(passport.session());
passport.use(new Localstrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.post('/repulsor/register', async (req, res) => {
    try {
        const {
            Title, Board, Code, City, State,
            email, Contact,
            adminName, adminContact, adminEmail, password
        } = req.body;


        const schoolData = {
            username: email,
            Title,
            Board,
            Code,
            City,
            State,
            email,
            Contact,
            adminName,
            adminContact,
            adminEmail
        };

        const newUser = new User(schoolData);
        const registeredSchool = await User.register(newUser, password);

        req.flash("success", "Registration successful 🎉");

        res.redirect(`/repulsor/${registeredSchool._id}/createWeb`);

    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/repulsor/register");
    }
});

app.get('/repulsor/:id/createWeb', (req, res) => {
    let { id } = req.params;
    res.render('createWeb.ejs');
})


app.get("/repulsor/register", (req, res) => {
    res.render("signup.ejs");
})

app.listen(port, () => {
    console.log(`app is running on ${port}`);
})