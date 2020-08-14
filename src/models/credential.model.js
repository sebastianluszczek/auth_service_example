const mongoose = require('mongoose');

const credentialSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        min: 6,
        max: 60
    },
    password: {
        type: String,
        required: true,
        min: 6,
        max: 256
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Credential", credentialSchema);