const LocalStrategy = require('passport-local').Strategy;
const adminSchema = require("./adminDB");
module.exports=function(passport){passport.use('local-2',new LocalStrategy({
    usernameField:'adminid',passwordField:'password'},
    (adminid ,password,done)=>{
        console.log(adminid);
        adminSchema.findOne({adminid:adminid})
        .then(user=>{
            console.log(user);
            //Match the user
            if (!user) {
             done(null,false,{message:"User not found"});  
            }
           
            if (user.password!==password) {
                done(null,false,{message:"Password Incorrect"});
            }
            done(null,user);
        })
        .catch(err=>{console.log(err)});
    }
    ));
    passport.serializeUser((user,done)=>{
        done(null,user.id);
    });
    passport.deserializeUser((id,done)=>{
        User.findById(id,(err,user)=>{
            done(err,user);
        });
    });
}