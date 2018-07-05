const   express                 = require('express'),
        app                     = express(),
        mongoose                = require('mongoose'),
        methodOverride          = require('method-override'),
        config                  = require('./server'),
        expressSanitizer        = require('express-sanitizer'),
        passport                = require('passport'),
        bodyParser              = require('body-parser'),
        localStrategy           = require('passport-local'),
        passportLocalMongoose   = require('passport-local-mongoose'),
        User                    = require('./user'),
        expressSession          = require('express-session');

/* Connected to MLab w/server.js */
mongoose.connect(config.database, (err) => {
    if(err){
        console.log(err);
    } else {
        console.log("Connected to DB");
    }
}) 

/* Event Schema */
var eventSchema = new mongoose.Schema({
    title: String,
    location: String, 
    body: String,
    date: String
});
var Event = mongoose.model('Event', eventSchema);

/* Image Schema */
var imageSchema = new mongoose.Schema({
    title: String,
    image: String, 
    created: {type: Date, default: Date.now}
});
var Image = mongoose.model('Image', imageSchema);

app.use(expressSession({
    /* PassportJS will use this phrase to encode data */
    secret: "I really hope this project gets me a job",
    resave: false,
    saveUninitialized: false
}));

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(expressSanitizer());
/* Must include this lines to use passport */
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
/* From user.js line 9 */
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Landing Page
app.get('/', (req, res, err) => {
    res.redirect('/landing');
});

app.get('/landing', (req, res, err) => {
    res.render('landing');
});

/* Index Page */
app.get('/home', (req, res, err) => {
    Event.find({}, (err, events) => {
        Image.find({}, (err, images) => {
            console.log(events);
            console.log(images);
            if (err) {
                console.log(err);
            } else {
                res.render('home', {
                    events: events,
                    images: images
                });
            } 
        })
   });
});

/* Register Page */
app.get('/register', (req, res, err) => {
   res.render('register');
   if(err){
       console.log(err);
   }
});

app.post('/register', (req, res, err) => {
    /* bodyParser allows us to grab data from form using the name attribute */
    const newUser = new User({username: req.body.username.toLowerCase()})
    User.register(newUser, req.body.password, (err, user) => {
        if(err){
            console.log(err);
            /* Short circuit out of this callback if err */
            return res.render('register');
        }
        passport.authenticate("local")(req, res, () => {
            res.redirect('/adminIndex');
        });
    });
});


/* Login Page */
app.get('/login', (req, res, err) => {
    res.render('login');
    if (err) {
        console.log(err);
    }
});

app.post('/login', passport.authenticate("local", {
    /* This is known as middleware, code that runs before the final callback */
    successRedirect: "/adminIndex",
    failureRedirect: "/login"
    }), (req, res, err) => {
});

/* adminIndex Page */
app.get('/adminIndex', (req, res) => {
    Event.find({}, (err, events) => {
       Image.find({}, (err, images) => {
           console.log(events);
           console.log(images);
           if(err) {
               console.log(err);
           } else {
               res.render('adminIndex', {
                   events: events,
                   images: images
               });
           }
       })
    });
});

/* New Page */
app.get('/new', (req, res, err) => {
    res.render('new');
});

/* Create Routes */
app.post('/newEvent', (req, res, err) => {
    Event.create(req.body.event, (err, newEvent) => {
        if(err) throw err;
        console.log(newEvent);
        res.redirect('/adminIndex');
    });
});

app.post('/newImage', (req, res, err) => {
    Image.create(req.body.image, (err, newImage) =>  {
        if(err) throw err;
        console.log(newImage);
        res.redirect('/adminIndex');   
    });
});

/* Delete Route */
app.delete('/adminIndex/:id', (req, res) => {
    Event.findByIdAndRemove(req.params.id, (err) => {
        Image.findByIdAndRemove(req.params.id, (err) => {
            if(err){
                console.log(err);
            } else {
                res.redirect('/adminIndex');
            }
        });
    });
});

app.listen(config.port, (err) => {
    if (err) throw err;
    console.log("Listening to port " + config.port);
});