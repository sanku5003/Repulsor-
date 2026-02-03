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

const User = require('./models/User.js');
const upload = multer({ dest: 'uploads/' });
const WebPage = require('./models/webPage.js');
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

app.get("/repulsor/register", (req, res) => {
    res.render("signup.ejs");
})

app.get('/repulsor/:id/createWeb', async (req, res) => {
    let { id } = req.params;
    const user = User.findById(id);
    res.render('createWeb.ejs', { user });
})



app.post(
    "/repulsor/:id/createWeb",
    upload.fields([
        { name: "Logo.url", maxCount: 1 },
        { name: "chairmanPhoto.url", maxCount: 1 },
        { name: "PrincipalPhoto.url", maxCount: 1 },
        { name: "eventPhoto1.url", maxCount: 1 },
        { name: "eventPhoto2.url", maxCount: 1 },
        { name: "eventPhoto3.url", maxCount: 1 }
    ]),
    async (req, res) => {
        try {
            const { id } = req.params;

            const webPage = new WebPage({
                Logo: req.files["Logo.url"]
                    ? {
                        filename: req.files["Logo.url"][0].filename,
                        url: req.files["Logo.url"][0].path
                    }
                    : undefined,

                Since: req.body.Since,
                Welcome: req.body.Welcome,
                tagLine: req.body.tagLine,
                firstDiv: req.body.firstDiv,
                crakedJee: req.body.crakcedJee,
                boardMerit: req.body.boardMerit,
                aboutUs: req.body.aboutUs,

                chairmanName: req.body.chairmanName,
                chairmanAge: req.body.chairmanAge,
                chairmanGender: req.body.ChairmanGender,
                chairmanQualification: req.body.chairmanQualification,

                chairmanPhoto: req.files["chairmanPhoto.url"]
                    ? {
                        filename: req.files["chairmanPhoto.url"][0].filename,
                        url: req.files["chairmanPhoto.url"][0].path
                    }
                    : undefined,

                aboutChairman: req.body.aboutChairman,

                principalName: req.body.PrincipalName,
                principalAge: req.body.PrincipalAge,
                principalGender: req.body.PrincipalGender,
                principalQualification: req.body.PrincipalQualification,

                principalPhoto: req.files["PrincipalPhoto.url"]
                    ? {
                        filename: req.files["PrincipalPhoto.url"][0].filename,
                        url: req.files["PrincipalPhoto.url"][0].path
                    }
                    : undefined,

                aboutprincipal: req.body.aboutPrincipal,

                eventName1: req.body.eventName1,
                eventRole1: req.body.eventrole1,
                eventDate1: req.body.eventDate1,
                aboutEvent1: req.body.aboutEvent1,
                eventPhoto1: req.files["eventPhoto1.url"]
                    ? {
                        filename: req.files["eventPhoto1.url"][0].filename,
                        url: req.files["eventPhoto1.url"][0].path
                    }
                    : undefined,

                eventName2: req.body.eventName2,
                eventRole2: req.body.eventrole2,
                eventDate2: req.body.eventDate2,
                aboutEvent2: req.body.aboutEvent2,
                eventPhoto2: req.files["eventPhoto2.url"]
                    ? {
                        filename: req.files["eventPhoto2.url"][0].filename,
                        url: req.files["eventPhoto2.url"][0].path
                    }
                    : undefined,

                eventName3: req.body.eventName3,
                eventRole3: req.body.eventrole3,
                eventDate3: req.body.eventDate3,
                aboutEvent3: req.body.aboutEvent3,
                eventPhoto3: req.files["eventPhoto3.url"]
                    ? {
                        filename: req.files["eventPhoto3.url"][0].filename,
                        url: req.files["eventPhoto3.url"][0].path
                    }
                    : undefined,

                owner: id
            });

            let pageId = await webPage.save();

            res.redirect(`/repulsor/${pageId._id}`);
        } catch (err) {
            console.error(err);
            res.status(500).send("Something went wrong while creating the webpage");
        }
    }
);

app.get("/repulsor/:id/", async (req, res) => {
    let { id } = req.params;
    let web = await WebPage.findById(id).populate("owner");
    res.render("schoolHome.ejs", { web });
})




app.listen(port, () => {
    console.log(`app is running on ${port}`);
})