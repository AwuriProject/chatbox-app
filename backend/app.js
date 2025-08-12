const path = require('path')
const express = require('express')
require("dotenv").config();
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const multer = require('multer')
const feedRoute = require('./routes/feed')
const authRoute = require('./routes/auth')
const app = express()

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
         cb(null, `${new Date().toISOString().replace(/:/g, '-')}_${file.originalname}`)
    }
})

const fileFilter = (req, file, cb) => {
    if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ){
    cb(null, true)
  }else{
    cb(null, false)
  }
}
app.use(bodyParser.json());
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'))

app.use('/images', express.static(path.join(__dirname, 'images')))


app.use((req, res, next) => {
     console.log('CORS middleware hit for:', req.url);
    // res.header('Access-Control-Allow-Origin', 'https://zippy-wisdom-production.up.railway.app');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    
    if (req.method === 'OPTIONS') {
        console.log('Handling OPTIONS preflight request');
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use('/feed', feedRoute)
app.use('/auth', authRoute)

// app.use(express.static(path.join(__dirname, 'dist')));

// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'dist', 'index.html'));
// });
const PORT = process.env.PORT || 3000;

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.8f1jhtr.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`;

mongoose.connect(MONGODB_URI,
    {
        serverSelectionTimeoutMS: 5000, 
        socketTimeoutMS: 45000, 
    }
)
.then(result => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${process.env.PORT}`);
    });
})
.catch(err => {
    console.log('MongoDB not connected', err)
})


// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});