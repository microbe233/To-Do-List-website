const express = require('express');
const mongoose = require('mongoose');
const ejs = require('ejs');
const ejsMate = require('ejs-mate');
const {campgroundSchema} = require('./joiSchemas.js');
const catchAsync = require('./utils/catchAsync');
const ExpressErrors = require('./utils/ExpressErrors');
const path = require('path');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const Review = require('./models/review');




mongoose.connect('mongodb+srv://omarmostafa082002:fYJQfn4bvGrSqFxF@to-do-list.a8971ys.mongodb.net/?retryWrites=true&w=majority&appName=To-Do-List/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:")); 
db.once("open", () => {
   console.log("Database connected");
});

const app = express();

mongoose.set('strictQuery', true);
app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

app.use(express.urlencoded({extended : true}));
app.use(methodOverride('_method'));


const validateCampground = (req,res,next)=>{
     // if(!req.body.campground){throw new ExpressErrors("Invalid Campground Data",400);}

     

    const {error} = campgroundSchema.validate(req.body);
    // const result = campgroundSchema.validate(req.body);
    // console.log(result.error.details);

    if(error){
        const msg = error.details.map(el=>el.message).join(',');
        throw new ExpressErrors(msg,400);
    }else{
        next();
    }
    // console.log(result);
}


app.get('/',(req, res)=>{
    res.render('home');
});

app.get('/campgrounds',catchAsync(async(req, res)=>{

    const campgrounds = await Campground.find();

    res.render('campgrounds/index',{ campgrounds });
}));

app.get('/campgrounds/new',(req, res)=>{

    res.render('campgrounds/new');
});


app.get('/campgrounds/:id',catchAsync(async(req, res)=>{

    const {id} = req.params;
    const campground = await Campground.findById(id);

    res.render('campgrounds/show',{ campground });
}));

app.get('/campgrounds/:id/edit',catchAsync(async(req, res)=>{

    const {id} = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit',{ campground });
}));



app.post('/campgrounds',validateCampground,catchAsync(async(req, res)=>{
    
   
    const campground = new Campground(req.body.campground);
    await campground.save();

    res.redirect(`/campgrounds/${campground._id}`);

}));

app.put('/campgrounds/:id',validateCampground,catchAsync(async(req, res)=>{

    const {id} = req.params;
    await Campground.findByIdAndUpdate(id,{...req.body.campground});
    res.redirect(`/campgrounds/${id}`);
}));

app.delete('/campgrounds/:id',catchAsync(async(req, res)=>{

    await Campground.findByIdAndDelete(req.params.id);
    res.redirect('/campgrounds');
}));

app.post('/campgrounds/:id/reviews', catchAsync(async(req, res)=>{

    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);

}));

app.all('*',(req,res,next)=>{
    return next(new ExpressErrors("Page Not Found!",404));
});

app.use((err,req, res, next)=>{
    const {statusCode = 500 } = err;
    if(!err.message){
        err.message = "Somethin Went Wrong!!";
        
    }
    res.status(statusCode).render('error',{err});
});

app.listen('3000',()=>{
    console.log("listening on Port 3000!");
});
