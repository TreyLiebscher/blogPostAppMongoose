'use strict';

const express = require('express');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const {
    PORT,
    DATABASE_URL
} = require("./config");
const {
    BlogPost
} = require('./models');

const app = express();
app.use(express.json());

// app.get("/restaurants", (req, res) => {
//     Restaurant.find().sort({name: 1}).limit(10)
//       // we're limiting because restaurants db has > 25,000
//       // documents, and that's too much to process/return
//       .then(restaurants => {
//         res.json({
//           restaurants: restaurants.map(restaurant => restaurant.serialize())
//         });
//       })
//       .catch(err => {
//         console.error(err);
//         res.status(500).json({ message: "Internal server error" });
//       });
//   });

function runServer(databaseUrl = DATABASE_URL, port = PORT) {

    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, err => {
            if (err) {
                return reject(err);
            }
            console.log(`Connected to db: ${databaseUrl}`);
            app.listen(PORT, () => {
                resolve(true)
                console.log(`Your app is listening on port ${port}`);
            });
        })
    })
}




app.get('/blogPosts', (req, res) => {
    BlogPost.find()
        .then(blogPosts => {
            res.json({
                blogPosts: blogPosts.map(blogPost => blogPost.serialize())
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                message: "Internal server error"
            });
        });
});

app.get('*', (req, res) => {
    res.status(404).json({ message: 'Route not handled' });
});


runServer(DATABASE_URL, PORT).catch(err => {
    console.log('CANNOT START SERVER!')
    process.exit(1)
})
