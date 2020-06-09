const passport = require('passport');
const jwtStrategy = require('passport-jwt');
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');

//getting the seller model
const seller = require("../config/sellerRegDb");
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET_OR_KEY;

passport.use(new jwtStrategy());