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
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
    }
    
    next();
});

app.use('/feed', feedRoute)
app.use('/auth', authRoute)

// app.use(express.static(path.join(__dirname, 'dist')));

// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'dist', 'index.html'));
// });

mongoose.connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.8f1jhtr.mongodb.net/${process.env.MONGO_DATABASE}`
)
.then(result => {
    app.listen(process.env.PORT, () => {
        console.log(`Server running on port ${process.env.PORT}`);
    });
})
.catch(err => {
    console.log('MongoDB not connected', err)
})