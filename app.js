const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const expresslayouts = require('express-ejs-layouts');
const app = express();
const bodyParser = require('body-parser');
const router = require('./routes/routes')
const passport = require('passport');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const flash = require('connect-flash');
const session = require('express-session');
const cors = require("cors");
const {
    isAuthenticate
} = require('./config/passportAuth');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./config/dbConfig');
//require('./config/adminAuth')(passport);

//creating token function

makeToken = (user) => {

    jwt.sign({
        sub: user.email,
        password: user.password
    }, 'thisismysecret', (err, token) => {
        console.log(token);
    });

};


//Setting middleware

const urlencoded = bodyParser.urlencoded({
    extended: false
});
app.use(expresslayouts);
app.set('view engine', 'ejs');

//Express session middleware
app.use(urlencoded);
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(cors());
app.use("/Admin", router);
app.use("/", router);

let allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Headers', "*");
    next();
}
app.use(allowCrossDomain);
//Global var middlewRE

app.use((req, res, next) => {
    res.locals.sucsess_msg = req.flash('sucsess_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.info = req.flash('info');
    next();
});

const PORT = process.env.PORT || 5000;

//DB config

//Doing passport authentication  using local

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, (email, password, done) => {
    //match user

    User.findOne({
            email: email
        })
        .then(user => {
            if (!user) {
                return done(null, false, {
                    message: "User not found"
                });
            }
            //Match password of user in database and user that is trying to log in
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err
                if (isMatch) {
                    //console.log(user.id);
                    return done(null, user);

                } else {
                    return done(null, false, {
                        message: "Password incorrect"
                    });
                }
            });
        })
        .catch(err => {
            console.log(err)
        });
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});





//Routes start here

app.get('/Login', (req, res) => {
    res.render("login");
});

app.get('/Register', (req, res) => {
    res.render("register");
});

app.post('/Register', urlencoded, (req, res) => {
    //console.log(req.body);
    const {
        name,
        email,
        password,
        password2
    } = req.body;


    //checking all fields
    let errors = [];
    if (!name || !email || !password || !password2) {
        errors.push({
            msg: "Please fill all fields"
        });
    }
    //check if passwords match
    if (password !== password2) {
        errors.push({
            msg: "Passwords do not match"
        });
    }
    //passwords length matchinhg

    if (password.length < 6) {
        errors.push({
            msg: "Password not long enough"
        });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        //saving user to database
        User.findOne({
                email: email
            })
            .then(user => {
                if (user) {
                    //user exists in database already
                    errors.push({
                        msg: "User already exists "
                    });
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                } else {
                    //create a user
                    const newUser = new User({
                        name,
                        email,
                        password
                    });
                    //making token out of  name 
                    //console.log(newUser);
                    /* jwt.sign({sub:newUser.name,password:newUser.password},'mysecretkey',(err,token)=>{
                         console.log(token);
                         newUser.name = token;
                     });*/
                    //Hashing the password
                    bcrypt.hash(newUser.password, 10, (err, hash) => {
                        if (err) {
                            throw err
                        }
                        newUser.password = hash;
                        //saving the user in database

                        newUser.save()
                            .then(user => {
                                console.log(user);
                                //res.header("auth_token");

                                req.flash('sucsess_msg', "You have registered and can login now");

                                res.redirect('/Login')
                            })
                            .catch(err => {
                                console.log(err)
                            });
                    });
                }

            });

    }
});

app.post('/Login', (req, res, next) => {
    passport.authenticate('local', {
            successRedirect: "Dashboard",
            failureRedirect: "login",
            failureFlash: true
        })
        (req, res, next);
});

/*app.post('/Login',(req,res)=>{
    console.log(req.body.email);
    const token= makeToken(req.body);
    res.end("Adios");
    });*/

app.get('/Admin/AdminLogin', (req, res) => {
    res.render('admin');
});

app.get('/Dashboard', isAuthenticate, (req, res) => {
    res.render('dashboard');
});

app.get('/Logout', (req, res) => {
    req.logOut();
    req.flash('sucsess_msg', "You have logged out");
    res.redirect('/Login');
});
//Routes end here


app.listen(PORT, console.log('Server Started on port ' + PORT));