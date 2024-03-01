const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    username:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minLength:8,
        maxLength:300
    },
    isAdmin:{
        type:Boolean,
        required:true,
        default:false
    },
})

userSchema.path('email').validate(async function (value) {
    const emailCount = await mongoose.models.User.countDocuments({ email: value });
    return !emailCount; // La validation réussit si aucune autre entrée avec le même e-mail n'est trouvée
}, 'Cet e-mail est déjà utilisé.');

// Méthode pour comparer le mot de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return candidatePassword === this.password;
    } catch (error) {
        throw new Error(error);
    }
};

module.exports = mongoose.model('User', userSchema)
