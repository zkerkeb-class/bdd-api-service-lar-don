const mongoose = require('mongoose');

const chatSchema = mongoose.Schema({
    history:[{
        type:JSON,
        required:true,
    }],
    }
);

module.exports = mongoose.model('Chat', chatSchema)
