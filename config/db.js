const mongoose = require("mongoose");

require("dotenv").config();

mongoose.set('strictQuery', false);

const connection = mongoose.connect('mongodb+srv://ncclasses:Alam%40123@cluster0.lagrdny.mongodb.net/ncclasses?retryWrites=true&w=majority');



module.exports = {connection}