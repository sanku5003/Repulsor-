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
const Student = require('./models/student.js');
const Teacher = require('./models/teacher.js');
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
app.use("/uploads", express.static("uploads"));



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

app.get("/repulsor/logout", (req, res, next) => {
    req.logout(function (err) {
        if (err) return next(err);
        req.flash("success", "Logged out successfully");
        res.redirect("/");
    });
});


app.get("/repulsor/adminLogin", (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect(`/repulsor/${req.user._id}`);
    }
    res.render("login/adminLogin.ejs");
});


// app.post(
//     "/repulsor/adminLogin",
//     passport.authenticate("local", {
//         failureRedirect: "/repulsor/adminLogin",
//         failureFlash: true
//     }),
//     (req, res) => {
//         req.flash("success", "Welcome Back Admin 🎉");

//         // redirect to dynamic admin page
//         res.redirect(`/repulsor/${req.user._id}`);
//     }
// );

app.post("/repulsor/adminLogin", async (req, res, next) => {
    passport.authenticate("local", async (err, user, info) => {
        if (err) return next(err);

        if (!user) {
            req.flash("error", "Invalid Email or Password");
            return res.redirect("/repulsor/adminLogin");
        }

        // Generate OTP
        const secret = speakeasy.generateSecret({ length: 20 });

        const token = speakeasy.totp({
            secret: secret.base32,
            encoding: "base32",
            step: 300
        });

        // Store temporarily in session
        req.session.loginOTP = {
            userId: user._id,
            otpSecret: secret.base32
        };

        // Send SMS
        await client.messages.create({
            body: `Your Login OTP is ${token}`,
            from: process.env.TWILIO_PHONE,
            to: `+91${user.Contact}`
        });

        req.flash("success", "OTP sent to registered mobile number");
        res.redirect("/repulsor/login-otp");

    })(req, res, next);
});


app.get("/repulsor/login-otp", (req, res) => {
    if (!req.session.loginOTP) {
        return res.redirect("/repulsor/adminLogin");
    }
    res.render("login/loginOtp.ejs");
});


app.post("/repulsor/login-otp", async (req, res, next) => {
    const { otp } = req.body;
    const sessionData = req.session.loginOTP;

    if (!sessionData) {
        req.flash("error", "Session expired. Login again.");
        return res.redirect("/repulsor/adminLogin");
    }

    const verified = speakeasy.totp.verify({
        secret: sessionData.otpSecret,
        encoding: "base32",
        token: otp,
        step: 300,
        window: 1
    });

    if (!verified) {
        req.flash("error", "Invalid or expired OTP");
        return res.redirect("/repulsor/login-otp");
    }

    // OTP correct → Log user in manually
    const user = await User.findById(sessionData.userId);

    req.login(user, (err) => {
        if (err) return next(err);

        delete req.session.loginOTP;

        req.flash("success", "Login successful 🎉");
        res.redirect(`/repulsor/${user._id}`);
    });
});



function isAdminLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        req.flash("error", "Please login first!");
        return res.redirect("/repulsor/adminLogin");
    }
    next();
}


app.get("/repulsor/:id", isAdminLoggedIn, async (req, res) => {
    const { id } = req.params;
    if (req.user._id.toString() !== id) {
        req.flash("error", "Unauthorized Access");
        return res.redirect(`/repulsor/${req.user._id}`);
    }

    const admin = await User.findById(id);
    res.render("admin/dashboard.ejs", { admin });
});


app.get("/repulsor/:id/student", isAdminLoggedIn, async (req, res) => {
    const { id } = req.params;
    const { class: classFilter, sec, search } = req.query;
    const admin = await User.findById(id);

    let filter = { school: id };

    // Class filter
    if (classFilter) {
        filter.class = classFilter;
    }

    // Section filter
    if (sec) {
        filter.sec = sec;
    }

    // 🔥Search filter
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { fatherName: { $regex: search, $options: "i" } },
            { city: { $regex: search, $options: "i" } },
            { state: { $regex: search, $options: "i" } },
            { contact: { $regex: search, $options: "i" } },
            { fatherContact: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { registrationNo: { $regex: search, $options: "i" } },
        ];
    }

    const student = await Student.find(filter);

    res.render("admin/student.ejs", {
        student,
        req,
        admin
    });
});



app.get("/repulsor/:id/addStudent",async (req, res) => {
    let { id } = req.params;
    let admin = await User.findById(id);
    res.render('admin/addStudent.ejs', {
        admin, errors: {},
        oldData: {}
    });
})



app.post(
    "/repulsor/:id/addStudent",
    upload.single("photo"),
    async (req, res) => {
        try {
            const { id } = req.params;

            const newStudent = new Student({
                ...req.body,
                school: id,
                addedAt: new Date(),
            });

            if (req.file) {
                newStudent.photo = {
                    url: "/" + req.file.path.replace(/\\/g, "/"),
                    filename: req.file.filename,
                };
            }

            await newStudent.save();

            res.redirect(`/repulsor/${id}/student`);

        } catch (err) {


            if (err.code === 11000) {
                const errors = {};

                if (err.keyPattern.email) {
                    errors.email = "Email already exists";
                }

                if (err.keyPattern.contact) {
                    errors.contact = "Contact number already exists";
                }

                if (err.keyPattern.rollNo) {
                    errors.rollNo = "Roll number already exists";
                }

                if (err.keyPattern.regNo) {
                    errors.regNo = "Registration number already exists";
                }

                return res.render("admin/addStudent.ejs", {
                    errors,
                    oldData: req.body
                });
            }

            console.error(err);
            res.status(500).send("Something went wrong");
        }
    }
);

app.get('/repulsor/:id/staff', isAdminLoggedIn, async (req, res) => {
    let { id } = req.params;

    const admin = await User.findById(id);
    const teacher = await Teacher.find({ school: id });
    res.render('admin/teacher.ejs', { admin, teacher });
})

app.get('/repulsor/:id/addMember', async (req, res) => {
    let { id } = req.params;
    const admin = await User.findById(id);
    res.render('admin/addTeacher.ejs', {
        admin, errors: {},
        oldData: {}
    });
})

app.post('/repulsor/:id/addMember', upload.single("photo"), async (req, res) => {
    try {
        const { id } = req.params;
        const newTeacher = new Teacher({
            ...req.body,
            school: id,
        })

        if (req.file) {
            newTeacher.photo = {
                url: "/" + req.file.path.replace(/\\/g, "/"),
                filename: req.file.filename,
            };

        }

        await newTeacher.save();

        res.redirect(`/repulsor/${id}/staff`);
    } catch(err) {
        if (err.code == 11000) {
            const errors = {};

            if (err.keyPattern.email) {
                errors.email = "Email already exists";
            }

            if (err.keyPattern.contact) {
                errors.contact = "Contact number already exists";
            }

            if (err.keyPattern.teacherid) {
                errors.teacherid = 'this teacherId already exists'
            }
            return res.render("admin/addStudent.ejs", {
                errors,
                oldData: req.body
            });

        }

        console.error(err);
        res.status(500).send("Something went wrong");
    }
})




app.listen(port, () => {
    console.log(`app is running on ${port}`);
})