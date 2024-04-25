const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email:{
        type:String,
        required:true,
        default:null,
        unique:true
    },
    username:{
        type:String,
        required:true,
        default:null,
        unique:true
    },
    password:{
        type:String,
        required:false, // false si l'utilisateur s'inscrit via Google
        trim:true,
        default:null,
        minLength:8,
        maxLength:300
    },
    phoneNumber:{
        //Format type [indicatif][numero] : un numero français 33671794543
        type:String,
        required:false,
        trim:true,
        default:null
    },
    isAdmin:{
        type:Boolean,
        required:false,
        default:false
    },
    stripeId:{
        type:String,
        required:false,
        default:null
    },
    isLive:{
        type:Boolean,
        required:false,
        default:false
    },
    subscriptionId:{
        type:String,
        default:null,
        required:false
    },
    googleId:{
        type:String,
        required:false,
        default:null
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
