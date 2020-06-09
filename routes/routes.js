const express = require('express');
const router = express.Router();
const Admin = require('../config/adminDB');
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const seller = require('../config/sellerRegDb');
const bcrypt = require('bcryptjs');
const xoauth2 = require('xoauth2');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const urlparser = require('body-parser').urlencoded({
    extended: false
});
const passport = require('passport');
require('dotenv').config();
router.use(urlparser);
/*
//Sending emails to users 
var options = {
    auth: {
        api_user: "ajaydhiman6151@gmail.com",
        api_key: "ajaydhiman6151"
    }
}

var client = nodemailer.createTransport(sendgridTransport(options));

var email = {
    from: "ajaydhiman6151@gmail.com",
    to: "dhimanshrishti2@gmail.com",
    subject: "Hello",
    text: 'hello world',
    html: "<h2>Hello this is me sending you a email</h2>"
};

client.sendMail(email, (err, info) => {
    if (err) {
        console.log(err);
    } else {
        console.log("Mail sent...!");
    }
});
*/
router.get('/AdminPanel', (req, res) => {
    seller.find({}, (err, result) => {
        if (err) {
            console.log(err);
            res.sendStatus(404);
        } else {
            var dataArray = Object.values(result);

            //dataArray.push(result);
            console.log(dataArray);
            res.render('adminpanel', {
                data: dataArray[0]
            });
        }
    })

})

router.get("/DeleteButton", (req, res) => {
    console.log(JSON.stringify(req.headers));
    //Finding seller in database and deleting it
    res.json({
        message: "ButtonPressed"
    })
});

router.post('/AdminLogin', (req, res) => {
    console.log(req.body);
    let {
        adminid,
        password
    } = req.body;
    //Verifying the user
    Admin.findOne({
            adminid: adminid
        })
        .then(user => {
            if (!user) {
                req.flash("error_msg", "User does no exist");
                res.redirect('/Admin/AdminLogin');
            } else if (user.password !== password) {
                req.flash("error_msg", "Wrong Password");
                res.redirect('/Admin/AdminLogin');
            } else {
                res.render('adminpanel');
            }

        })
        .catch(err => console.log(err));
});

router.get("/", (req, res) => {
    res.render('sellerhome');
});

router.get('/Register', (req, res) => {
    res.render('seller_register');
});

router.post("/Register", (req, res) => {
    console.log(req.body);
    //Making the seller
    const {
        name,
        email,
        password,
        contact,
        address,
        product_type,
        details
    } = req.body;
    let errors = [];
    //if credentials exist or not
    if (!name || !email || !password || !contact || !address || !product_type || !details) {
        errors.push({
            msg: "Please fill all fields"
        });

    }
    //if email is strong enough or not
    if (password.length < 7) {
        errors.push({
            msg: "Password not strong enough"
        });
    }
    //rerendering the registration template
    if (errors.length > 0) {
        res.render('seller_register', {
            errors,
            name,
            email,
            password,
            contact,
            address,
            product_type,
            details
        });
    } else {
        //finding the seller in databse
        seller.findOne({
                email: email
            })
            .then(user => {
                if (user) {
                    errors.push({
                        msg: "User already exists"
                    }); //rerendering the view upon finding that user already exists
                    res.render('seller_register', {
                        errors,
                        name,
                        email,
                        password,
                        contact,
                        address,
                        product_type,
                        details
                    });
                } else {
                    //Create a user
                    const newSeller = new seller({
                        name,
                        email,
                        password,
                        contact,
                        address,
                        product_type,
                        details
                    });
                    //Hash the password
                    bcrypt.hash(newSeller.password, 10, (err, hash) => {
                        if (err) {
                            throw err
                        }
                        console.log(hash);
                        newSeller.password = hash;
                        //save user in database
                        newSeller.save()
                            .then(user => {
                                    console.log(user);
                                    req.flash('sucsess_msg', "You have registered and can login now");
                                    res.redirect("/Seller");
                                }

                            )
                            .catch(err => console.log(err));
                    });

                }
            })
            .catch(err => console.log("error occured" + err));
    }
});

module.exports = router;