const mongoose = require('mongoose');
const cities = require('./cities');
const {places,descriptors} = require('./seedHelpers');
const accessKey = 'SeNxgw1o1D_e7FvWay_M-IC-N_zSl-xdH6JTHsISGsw';
const Campground = require('../models/campground');

mongoose.connect('mongodb+srv://omarmostafa082002:fYJQfn4bvGrSqFxF@to-do-list.a8971ys.mongodb.net/?retryWrites=true&w=majority&appName=To-Do-List/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:")); 
db.once("open", () => {
   console.log("Database connected");
});

async function fetchRandomPhoto() {
    const response = await fetch('https://api.unsplash.com/photos/random', {
        headers: {
            Authorization: `Client-ID ${accessKey}`
        }
    });
    
    if (response.ok) {
        const data = await response.json();
        const photoUrl = `${data.urls.regular}&w=468&h=703&fit=crop`;
        console.log(`Random Photo URL: ${photoUrl}`);
        return photoUrl;
    } else {
        console.error('Error fetching photo:', response.status, response.statusText);
    }
}
// const photoUrl = fetchRandomPhoto();
// const imgUrl = fetchRandomPhoto().then((result) => {
//     const photoUrl = result;
//     return photoUrl;
   
// });




const sample = (array) => array[Math.floor(Math.random()*array.length)] ;

const seedDB = async() => {
    await Campground.deleteMany();
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*20)+10;
        const camp = new Campground({
            location :`${cities[random1000].city},${cities[random1000].state}`,
            title : `${sample(places)} ${sample(descriptors)}`,
            image : await fetchRandomPhoto(),
            description:'Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis ipsa maxime quia laudantium hic placeat aspernatur ipsum minus commodi tempore, voluptatem quasi quos eaque non consequuntur incidunt in. Nisi, accusamus!',
            price : price
        });

        await camp.save();
    }
}

seedDB().then( () => {
    mongoose.connection.close();
});

