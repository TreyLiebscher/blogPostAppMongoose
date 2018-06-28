'use strict';

exports.DATABASE_URL = process.env.DATABASE_URL ||
global.DATABASE_URL || 
'mongodb://localhost/blogpostsapp';
exports.PORT = process.env.PORT || 9090;