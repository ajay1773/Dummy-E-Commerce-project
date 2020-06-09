module.exports= {
    isAuthenticate:function(req,res,next){
    if (req.isAuthenticated()) {
        return next();
    }
     req.flash('error_msg',"You need to login first");
     res.redirect('/Login');   
    

}
}