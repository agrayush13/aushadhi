var express = require('express');
var app = express();
var request = require('request');
var bodyParser = require('body-parser');
var Product = require('./models/product');
var mongoose = require('mongoose');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var passportLocalMongoose = require('passport-local-mongoose');
var User = require('./models/user');


var cart = new Map();

mongoose.connect('mongodb://localhost/aushadhi', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Product.create({
//     name: 'FabiFlu',
//     manufacturer: 'GlenMark',
//     tags : ['COVID-19', 'antibiotic'],
//     price: 30,
//     inStock: true,
//     image: "https://cdn.dnaindia.com/sites/default/files/styles/full/public/2020/06/22/910312-ani.jpg"
// }, (err, medicine)=>{
//     if(err){
//         console.log(err);
//     }else{
//         console.log(medicine);
//     }
// });

app.use(bodyParser.urlencoded({ extended: true }));




app.get('/', (req, res)=>{
    Product.find({}, (err, products)=>{
        if(err){
            console.log(err);
        }else{
            res.render('index.ejs', {products: products});
        }
    });
});

app.get('/admin', isLoggedIn,  (req, res)=>{
    res.render('signin.ejs');
});

// ===============================================

app.get('/register', (req, res)=>{
    res.render('register.ejs');
});

app.post('/register', (req, res)=>{
    User.register(new User({username: req.body.username}), req.body.password, (err, user)=>{
      if(err){
          console.log(err);
          return res.render('register.ejs');
      }
      passport.authenticate('local')(req, res, ()=>{
          res.redirect('/');
      });
  });
});

// ==================================================
app.get('/login', (req, res)=>{
    res.render('login.ejs');
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}), (req, res)=>{

});

// ============================================================
app.get('/logout', (req, res)=>{
    req.logout();
    res.redirect('/');
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}


app.post('/admin/', (req, res)=>{
    var product = req.body.product;
    var t = product.tags;
    var tags = t.split(" ");
    product.tags = tags;
    // console.log(product);
    var inSt = false;
    if(product.inStock == 'on') inSt = true;
    Product.create({
        name: product.name,
        manufacturer: product.manufacturer,
        tags : product.tags,
        price: product.price,
        inStock: inSt,
        image: product.image

    }, (err, newProduct)=>{
        if(err){
            console.log(err);
        }else{
            console.log(newProduct);
            res.redirect("/");
        }
    });
});

app.get('/cart',async (req, res)=>{
    var allProducts = [];
    for(var item in cart){
        await Product.findById(item, (err, product)=>{
            if(err){
                console.log(err);
            }else{
                var myItem = {
                    name: product.name,
                    freq: cart[item],
                    price: product.price
                };
                allProducts.push(myItem);
            }
        });
    }
    console.log(allProducts);
    res.render('cart.ejs', {cart : allProducts});
});

app.post('/addToCart', isLoggedIn,  (req, res)=>{
    var item = req.body.itemId;
    if(!cart[item]){
        cart[item]=1;
    }else{
        cart[item] = cart[item]+1;
    }
    console.log(cart);
    res.redirect('/');
});

app.listen(3000, (req, res)=>{
    console.log("Server started....");
});