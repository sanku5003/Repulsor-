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
const Basic = require("./models/webPage/basic.js");
const About = require("./models/webPage/about.js");
const management = require("./models/webPage/management.js");
const Event = require("./models/webPage/events.js");

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

        res.redirect(`/repulsor/${registeredSchool._id}/basic`);

    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/repulsor/register");
    }
});

app.get("/repulsor/register", (req, res) => {
    res.render("signup.ejs");
})

app.get('/repulsor/:id/basic', async (req, res) => {
    let { id } = req.params;
    const user = User.findById(id);
    res.render('webPage/basic.ejs', { user });
})

app.post(
    '/repulsor/:id/basic',
    upload.fields([
        { name: 'logo.url', maxCount: 1 },
        { name: 'cover.url', maxCount: 1 }
    ]),
    async (req, res) => {
        try {
            const { id } = req.params;

            const {
                slogan,
                num1, text1,
                num2, text2,
                num3, text3
            } = req.body;

            const logoFile = req.files['logo.url']?.[0];
            const coverFile = req.files['cover.url']?.[0];

            const basicData = new Basic({
                slogan,
                num1,
                text1,
                num2,
                text2,
                num3,
                text3,
                owner: id,
                logo: logoFile
                    ? {
                        filename: logoFile.filename,
                        url: `/uploads/${logoFile.filename}`
                    }
                    : undefined,
                cover: coverFile
                    ? {
                        filename: coverFile.filename,
                        url: `/uploads/${coverFile.filename}`
                    }
                    : undefined
            });

            await basicData.save();

            req.flash("success", "Basic details saved successfully 🚀");
            res.redirect(`/repulsor/${id}/about`);

        } catch (err) {
            console.error(err);
            req.flash("error", "Something went wrong while saving details");
            res.redirect(`/repulsor/${id}/basic`);
        }
    }
);

app.get("/repulsor/:id/about", (req, res) => {
    let { id } = req.params;
    res.render("webPage/about.ejs");
})

app.post("/repulsor/:id/about", async (req, res) => {
    try {
        const { id } = req.params;
        let { aboutBrief, about } = req.body;
        let aboutData = new About({
            aboutBrief,
            about,
            owner: id
        })

        aboutData.save();
        res.redirect(`/repulsor/${id}/management`);
    } catch {

        req.flash("error", "Something went wrong while saving details");
        res.redirect(`/repulsor/${id}/about`);
    }

})

app.get('/repulsor/:id/management', (req, res) => {
    let { id } = req.params;
    res.render('webpage/management.ejs');
})

// app.post('/repulsor/:id/management', async (req, res) => {
//     try {

//         let team = new management({
//             member: req.body.member,
//             owner: id
//         })
//         await team.save();
//         res.redirect(`/repulsor/${id}/events`);
//     } catch {
//         let { id } = req.params;
//         req.flash("error", "Something went wrong while saving details");
//         res.redirect(`/repulsor/${id}/management`);
//     }


// })


app.post(
    '/repulsor/:id/management',
    upload.any(),
    async (req, res) => {
        try {
            let { id } = req.params;

            // member text data
            const memberBody = req.body.member[0];

            // photo file
            const photoFile = req.files.find(
                f => f.fieldname === 'member[0][photo.url]'
            );

            const team = new management({
                member: [
                    {
                        Role: memberBody.Role,
                        Name: memberBody.Name,
                        age: memberBody.age,
                        Gender: memberBody.Gender,
                        Qualification: memberBody.Qualification,
                        photo: photoFile
                            ? {
                                filename: photoFile.filename,
                                url: `/uploads/${photoFile.filename}`
                            }
                            : undefined
                    }
                ],
                owner: id
            });

            await team.save();
            res.redirect(`/repulsor/${id}/events`);

        } catch (err) {
            console.error(err);
            req.flash("error", "Something went wrong while saving details");
            res.redirect(`/repulsor/${id}/management`);
        }
    }
);


app.get('/repulsor/:id/events', (req, res) => {
    let { id } = req.params;
    res.render('webPage/events.ejs');
})

// app.post('/repulsor/:id/events',  async (req, res) => {
//     try {
//         let { id } = req.params;
//         let eventData = new Event({
//             event: req.body.event,
//             owner: id
//         })

//         await eventData.save();
//         res.redirect(`/repulsor/${id}/home`);
//     } catch {
//         let { id } = req.params;
//         req.flash("error", "Something went wrong while saving details");

//         res.redirect(`/repulsor/${id}/events`);
//     }
// })


app.post(
    '/repulsor/:id/events',
    upload.any(),
    async (req, res) => {
        try {
            let { id } = req.params;

            const eventBody = req.body.event[0];

            // identify files manually
            const primaryFile = req.files.find(
                f => f.fieldname === 'event[0][primaryPhoto.url]'
            );

            const secondaryFile = req.files.find(
                f => f.fieldname === 'event[0][secondaryPhoto.url]'
            );

            const eventData = new Event({
                event: [
                    {
                        Name: eventBody.Name,
                        purpose: eventBody.purpose,
                        about: eventBody.about,
                        primaryPhoto: primaryFile
                            ? {
                                filename: primaryFile.filename,
                                url: `/uploads/${primaryFile.filename}`
                            }
                            : undefined,
                        secondaryPhoto: secondaryFile
                            ? {
                                filename: secondaryFile.filename,
                                url: `/uploads/${secondaryFile.filename}`
                            }
                            : undefined
                    }
                ],
                owner: id
            });

            await eventData.save();
            res.redirect(`/repulsor/${id}/home`);

        } catch (err) {
            console.error(err);
            req.flash("error", "Something went wrong while saving details");
            res.redirect(`/repulsor/${id}/events`);
        }
    }
);



app.get('/repulsor/:id/home', async(req, res) => {
    let { id } = req.params;
    const basicData = await Basic.findOne({owner : id});
    console.log({basicData});
    res.render("webPage/webPage.ejs" , {basicData});
})


app.listen(port, () => {
    console.log(`app is running on ${port}`);
})