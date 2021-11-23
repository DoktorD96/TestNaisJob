const mongoose = require('mongoose');
require('dotenv').config();

mongoose
    .connect(process.env.MONGODBURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(console.log(`MongoDB connected`))
    .catch(err => console.log(err));