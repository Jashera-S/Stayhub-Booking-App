const express=require('express');
const cors=require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User.js');
const Place = require('./models/place.js');
const Booking = require('./models/Booking.js');
const cookieParser = require('cookie-parser');
const imageDownloader = require('image-downloader');
const multer = require('multer');
const fs = require('fs');

require('dotenv').config();
const app = express();

const bcryptSalt= bcrypt.genSaltSync(10);
const jwtSecret = 'uytdhbvy677hfhnbkj';

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname+'/uploads'));
app.use(cors({
    credentials:true,
    origin: `${process.env.VITE_FRONTEND_URL}`,

}));

mongoose.connect(process.env.MONGO_URL).then(()=>
    console.log("Mongo connected with the string",process.env.MONGO_URL))
.catch((err)=>console.log(err));

function getUserDataFromReq(req){
    return new Promise((resolve, reject) => {
        jwt.verify(req.cookies.token,jwtSecret,{},async (err,userData)=>{
            if(err) throw err;
            resolve(userData);
        });
    });
}

app.get('/test',(req,res)=>{
    res.json('test ok');
});

app.post('/register',async (req,res)=>{
    const {name,email,password} = req.body;
    try{
        const userDoc = await User.create({
            name,
            email,
            password: bcrypt.hashSync(password, bcryptSalt),
        });
    res.json(userDoc);
    }catch(e){
        res.status(422).json(e);
    }
});

app.post('/login',async (req,res)=>{
    const {email,password} = req.body;
    const userDoc = await User.findOne({email});
    if (userDoc){
        const passOk=bcrypt.compareSync(password,userDoc.password);
        if(passOk){
            jwt.sign({email:userDoc.email, id:userDoc._id},jwtSecret,{},(err,token)=>{
                if(err) throw err;
                res.cookie('token',token).json(userDoc);

            });
        }else{
            res.status(422).json('pass not ok');
        }
    }else{
        res.json('Not found');
    }
});

app.get('/profile', async (req, res) => {
    const { token } = req.cookies;
    if (!token) return res.json(null);

    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) {
            console.error("JWT Verification Error:", err);
            return res.status(401).json({ error: 'Invalid token' });
        }

        try {
            const user = await User.findById(userData.id);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            res.json({ name: user.name, email: user.email, _id: user._id });
        } catch (dbError) {
            console.error("Database Error:", dbError);
            res.status(500).json({ error: "Database query failed" });
        }
    });
});


app.post('/logout',(req,res)=>{
    res.cookie('token', '').json(true);
});

app.post('/upload-by-link', async (req, res) => {
    const { link } = req.body;
    const newName = 'photo' + Date.now() + '.jpg';
    const dest = __dirname + '/uploads/' + newName;

    try {
        await imageDownloader.image({
            url: link,
            dest: dest,
        });
        res.json(newName);
    } catch (error) {
        console.error('Image download failed:', error);
        res.status(500).json({ error: 'Failed to download image' });
    }
});


const photosMiddleware = multer({dest:'uploads/'});
app.post('/upload', photosMiddleware.array('photos', 100), (req, res) => {
    const uploadedFiles = [];
    for (let i = 0; i < req.files.length; i++) {
        const { path, originalname } = req.files[i];
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        const newPath = path + '.' + ext;
        
        try {
            fs.renameSync(path, newPath); // Rename the file with the correct extension
            uploadedFiles.push(newPath.replace(/\\/g, '/').replace('uploads/', ''));
        } catch (err) {
            console.error("Error renaming file:", err);
        }
    }
    res.json(uploadedFiles);
});

app.post('/places' , (req , res) => {
    const {token} = req.cookies;
    const {title,address,addedPhotos,description,perks,extraInfo,
        checkIn,checkOut,maxGuests,price,
    } = req.body;
        jwt.verify(token,jwtSecret,{},async (err,userData)=>{
        if(err) throw err;
        const placeDoc = await Place.create({
            owner: userData.id,
            title,address,photos:addedPhotos,description,perks,extraInfo,
        checkIn,checkOut,maxGuests,price,
        
    });
    res.json(placeDoc);
});
});

app.get('/user-places', (req, res) => {
    const { token } = req.cookies;
    
    if (!token) {
      return res.status(401).json({ message: 'Token is missing' });
    }
  
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) {
        return res.status(401).json({ message: 'Token verification failed', error: err.message });
      }
  
      if (!userData) {
        return res.status(401).json({ message: 'Invalid token, userData not found' });
      }
  
      const { id } = userData;
  
      try {
        const places = await Place.find({ owner: id });
        res.json(places);
      } catch (dbError) {
        return res.status(500).json({ message: 'Database query failed', error: dbError.message });
      }
    });
  });
  

app.get('/places/:id', async (req,res) =>{
    const {id} = req.params;
    res.json(await Place.findById(id));
})

app.put('/places', async (req,res) => {
    const {token} = req.cookies;
    const {id,title,address,addedPhotos,description,perks,extraInfo,
        checkIn,checkOut,maxGuests,price,
    } = req.body;
    jwt.verify(token,jwtSecret,{},async (err,userData)=>{
    const placeDoc = await Place.findById(id);
        if(userData.id === placeDoc.owner.toString()){
            placeDoc.set({
                title,address,photos:addedPhotos,description,perks,extraInfo,
            checkIn,checkOut,maxGuests,price,
            });
            await placeDoc.save();
            res.json('ok');
        }
    });
});

app.get('/places', async (req,res) => {
    res.json(await Place.find());
})

app.post('/bookings' , async (req,res) =>{
    const userData = await getUserDataFromReq(req);
    const {
        place,checkIn,checkOut,numberOfGuests,name,phone,price,
    } = req.body;
    Booking.create({
        place,checkIn,checkOut,numberOfGuests,name,phone,price,
        user:userData.id,
    }).then((doc) => {
        res.json(doc);
    }).catch((err) => {
        throw err;
    });
})

app.get('/bookings', async (req,res) => {
   const userData = await getUserDataFromReq(req);
   res.json( await Booking.find({user:userData.id}).populate('place'))
})
app.listen(4000);