const express = require('express');
const mongoose = require('mongoose');
const { info, error } = require('console');
const bodyParser = require('body-parser');
const UserSchema = require('./Models/UserModel');
const PassSchema = require('./Models/PassSchema');
const cors = require('cors');
const passport = require('passport');
const passportLocal = require('passport-local');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const app = express();
require('dotenv').config();
const https = require('https');
const fs = require('fs');

const PORT = 8999;

let user;

/* Session config */
const sessionConfig = {
    secret: 'needstobesomesecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 600000,
        secure: false, // Change to 'true' for HTTPS
        httpOnly: true,
        sameSite: 'strict', // Use 'strict' or 'lax' based on your requirements
    },
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(session(sessionConfig));
app.use(cookieParser());

/* Passport initialization */
app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(UserSchema.authenticate()));
passport.serializeUser(UserSchema.serializeUser());
passport.deserializeUser(UserSchema.deserializeUser());

/* Set authentication status in session */
app.use((req, res, next) => {
    res.locals.username = req.session.username || '';
    next();
});

/* Database connection */
mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    authSource: 'admin',
});

const db = mongoose.connection;
db.on('error', error => {
    console.error('MongoDB connection error:', error);
});
db.once('open', () => {
    console.log('Connected to MongoDB');
});

/* Authentication middleware */
const isLoggedIn = function (req, res, next){
    console.log(user, "From auth");
    if(user){
        next();
    } else {
        res.status(401).send("nooo");
    }
};

/* Routes */
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const newUser = new UserSchema({ username });
        await UserSchema.register(newUser, password);
        info('User registered:', newUser);
        res.send(newUser);
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/login', passport.authenticate('local'), async (req, res) => {
    try {
        console.info(req.body, "LOGIN")
        user = req.body.username;
        res.send(req.body);
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/logout', (req, res) => {
    try {
       // req.session.isAuthenticated = 'false';
       // req.session.username = '';
        res.status(200).send('Logged out successfully');
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/mypass', isLoggedIn, async (req, res) => {
    try {
        const allPwd = await PassSchema.find({}).populate('username');
        res.json(allPwd);
    } catch (error) {
        console.error('Error fetching passwords:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/mypass/new', async (req, res) => {
    try {
        const objId = await UserSchema.findByUsername(req.body.username);
        const newPass = new PassSchema(req.body);
        newPass.username = objId._id;
        await newPass.save();
        res.send(newPass);
    } catch (error) {
        console.error('Error creating new password:', error);
        res.status(500).send('Internal Server Error');
    }
});

https
  .createServer(
    {
      key: fs.readFileSync("server.key"),
      cert: fs.readFileSync("server.cert"),
    },
    app
  ).listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
