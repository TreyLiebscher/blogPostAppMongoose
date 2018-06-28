'use strict';

const mongoose = require('mongoose');

const blogSchema = mongoose.Schema({
    title: {type: String, required: true},
    author: {
        firstName: {type: String, required: true},
        lastName: {type: String, required: true}
    },
    content: {type: String, required: true}
});

blogSchema.virtual('authorString').get(function() {
    return `${this.author.firstName} ${this.author.lastName}`.trim();
});

blogSchema.methods.serialize = function() {
    return {
        id: this._id,
        title: this.title,
        author: this.authorString,
        content: this.content
    };
}

const BlogPost = mongoose.model('post', blogSchema);

module.exports = { BlogPost };