import mongoose from 'mongoose';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  phone: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ['admin', 'customer'],
    default: 'customer',
  },

  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
}, { timestamps: true });

// Before saving the password into database we are hashing it (this is like a middleware)
userSchema.pre("save", async function (next){
    // NOTE: arrow function should not be used because that will not give current context
    
    
    if(this.isModified("password")){// isModified is provided by this hook only
        this.password= await bcrypt.hash(this.password, 10)//10 is number of rounds 
    }

    // current password is hashed now whenever the data of user is 'saved' it will saved hashed password
    next(); 
})

userSchema.methods.isPasswordCorrect= async function(candidatePassword){
    return await bcrypt.compare(candidatePassword,this.password);
}

userSchema.methods.generateAccessToken= function(){
    // we will simply generate the access token while logging in (after the user is authenticated)
    return jwt.sign({
        _id:this._id,
        email:this.email,
        role:this.role  
    },  
    
    process.env.ACCESS_TOKEN_SECRET,

    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
)

}


const User = mongoose.model('User', userSchema);
export default User;
