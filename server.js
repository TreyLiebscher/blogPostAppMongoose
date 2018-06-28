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

function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log("Closing server");
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
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

app.get('/blogPosts/:id', (req, res) => {
    BlogPost
        .findById(req.params.id)
        .then(blogPost => res.json(blogPost.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({
                message: 'Internal Server Error'
            });
        });
});

app.post('/blogPosts', (req, res) => {
    const requiredFields = ['title', 'content', 'author'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }

    BlogPost.create({
            title: req.body.title,
            author: req.body.author,
            content: req.body.content
        })
        .then(blogPost => res.status(201).json(blogPost.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({
                message: 'Internal Server Error'
            });
        });
});

app.put('/blogPosts/:id', (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const message =
            `Request path id (${req.params.id}) and ` +
            `request body id (${req.body.id}) must match`;
        console.error(message);
        return res.status(400).json({
            message: message
        });
    }

    const toUpdate = {};
    const updateableFields = ['title', 'author', 'content'];

    updateableFields.forEach(field => {
        if (field in req.body) {
            toUpdate[field] = req.body[field];
        }
    });

    BlogPost
        .findByIdAndUpdate(req.params.id, {
            $set: toUpdate
        })
        .then(blogPost => res.status(204).end())
        .catch(err => res.status(500).json({
            message: 'Internal Server Error'
        }));
});

app.delete('/blogPosts/:id', (req, res) => {
    BlogPost.findByIdAndRemove(req.params.id)
        .then(blogPost => res.status(204).end())
        .catch(err => res.status(500).json({
            message: 'Internal Server Error'
        }));
});

app.use("*", function (req, res) {
    res.status(404).json({
        message: "Not Found"
    });
});


// runServer(DATABASE_URL, PORT).catch(err => {
//     console.log('CANNOT START SERVER!')
//     process.exit(1)
// })

if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = {
    runServer,
    app,
    closeServer
};