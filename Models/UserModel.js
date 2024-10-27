const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    FullName: {
        type: String,
        required: [true, "Please provide a Full Name"]
    },
    ContactNumber: {
        type: String,
        unique: true,
        required: [true, "Please provide a Contact Number"]
    },
    Email: {
        type: String,
        required: [true, "Please provide an Email"],
        unique: true,
        match: [/\S+@\S+\.\S+/, 'Please provide a valid email address']
    },
    DeliveryAddress: {
        City: {
            type: String,
        },
        PinCode: {
            type: String,
        },
        HouseNo: {
            type: String,
        },
        Street: {
            type: String,
        },
        NearByLandMark: {
            type: String,
        },
    },
    Password: {
        type: String,
        required: [true, "Please provide a Password"]
    },
    PasswordChangeOtp: {
        type: String
    },
    OtpExpiredTime: {
        type: Date
    },
    otp:{
        type:String
    },
    NewPassword: {
        type: String
    },
    Role: {
        type: String,
        enum: ['Customer', 'Admin'],
        default: 'Customer'
    },
    referralCode: {
        type: String,
        default: null,
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    getReferralCode: {
        type: String,
    },
    referralCodeBonus: {
        type: Number,
        default:0
    },
    referralStatus: [
        {
            MobileNumber: {
                type: String
            },
            status: {
                type: String,
            }
        }
    ],
    userImage: {
        url: {
            type: String,
            // required: true
        },
        public_id: {
            type: String,
            // required: true
        }
    },
    RefrealBy:{
       type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    RefrealUserIds:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    isDeactive: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
    const user = this;
    if (!user.isModified('Password')) {
        return next();
    }
    try {
        const hashedPassword = await bcrypt.hash(user.Password, 10);
        user.Password = hashedPassword;
        return next();
    } catch (error) {
        return next(error);
    }
});

// Method to compare passwords
UserSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.Password);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;