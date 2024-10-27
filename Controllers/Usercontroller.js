const User = require('../Models/UserModel');
const SendToken = require('../Utils/SendToken');
const SendEmail = require('../Utils/SendEmail');
const Orders = require('../Models/UserModel');
const { deleteImageFromCloudinary, uploadImage } = require('../Utils/Cloudnary');
const crypto = require('crypto')
exports.register = async (req, res) => {
    try {
        const { FullName, Email, ContactNumber, Password, getReferralCode } = req.body;

        const emptyField = []
        if (!FullName) emptyField.push('Name');
        if (!Email) emptyField.push('Email');
        if (!ContactNumber) emptyField.push('ContactNumber');
        if (!Password) emptyField.push('Password');
        if (emptyField.length > 0) return res.status(400).json({
            success: false,
            message: `Please fill in the following fields: ${emptyField.join(', ')} `
        });

        // Check if email or contact number already exists
        const existingUserEmail = await User.findOne({ Email });
        if (existingUserEmail) {
            return res.status(403).json({
                success: false,
                msg: 'User Already Exists With This Email'
            });
        }

        const existingUserContact = await User.findOne({ ContactNumber });
        if (existingUserContact) {
            return res.status(403).json({
                success: false,
                msg: 'User Already Exists With This Contact Number'
            });
        }

        // Check password length
        if (Password.length < 6) {
            return res.status(403).json({
                success: false,
                msg: 'Password Length Must be Greater than 6 Digits'
            });
        }

        let existingUserReferral
        if (getReferralCode) {
            existingUserReferral = await User.findOne({ referralCode: getReferralCode });
            if (!existingUserReferral) {
                return res.status(403).json({
                    success: false,
                    msg: 'Invalid Referral Code'
                });
            }
        }

        // Function to generate a unique referral code
        const generateReferralCode = async () => {
            let code;
            let isUnique = false;

            while (!isUnique) {
                code = Math.random().toString(36).substring(2, 10).toUpperCase(); // 8-character code
                const existingUser = await User.findOne({ referralCode: code });
                if (!existingUser) {
                    isUnique = true;
                }
            }
            return code;
        };

        // Generate referral code
        const referralCode = await generateReferralCode();
        const otpGenerate = crypto.randomInt(100000, 1000000);

        let expireTime = new Date();
        expireTime.setMinutes(expireTime.getMinutes() + 2);
        // Define initial user data
        const userData = {
            FullName,
            Password,
            Email,
            otp: otpGenerate,
            OtpExpiredTime: expireTime,
            ContactNumber,
            RefrealBy: existingUserReferral?._id,
            referralCode,
        };

        // Create new user instance
        const newUser = new User(userData);

        if (newUser) {
            if (getReferralCode) {
                existingUserReferral.referralStatus.push({
                    MobileNumber: ContactNumber,
                    status: "App Downloaded and register Success"
                });
                existingUserReferral.RefrealUserIds.push(newUser._id);
                existingUserReferral.referralCodeBonus = 0;
                await existingUserReferral.save();
            }

            // Save user to database
            await newUser.save();
        }

        // Prepare email options
        const emailOptions = {
            email: Email,
            subject: 'Welcome to Om Sri Sai Sales Solutions!',
            message: `
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            background-color: #f5f5f5;
                            padding: 20px;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: #fff;
                            padding: 20px;
                            border-radius: 8px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        }
                        .header {
                            background-color: #007bff;
                            color: #fff;
                            padding: 10px;
                            text-align: center;
                            border-top-left-radius: 8px;
                            border-top-right-radius: 8px;
                        }
                        .content {
                            padding: 20px;
                        }
                        .content p {
                            margin-bottom: 10px;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 20px;
                            color: #666;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Welcome to Om Sri Sai Sales Solutions!</h1>
                        </div>
                        <div class="content">
                            <p>Dear ${FullName},</p>
                            <p>Thank you for registering with Om Sri Sai Sales Solutions. We are excited to have you onboard.</p>
                            <p>Your One-Time Password (OTP) for account verification is:</p>
                            <h2>${otpGenerate}</h2>
                            <p>This OTP is valid for the next 2 minutes, until ${expireTime.toLocaleTimeString()}.</p>
                            <p>If you have any questions or need assistance, please feel free to contact us.</p>
                        </div>
                        <div class="footer">
                            <p>Best regards,</p>
                            <p>Om Sri Sai Sales Solutions Team</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await SendEmail(emailOptions);

        await SendToken(newUser, res, 201);

    } catch (error) {
        console.error('Error creating user:', error);

        // Handle duplicate key error
        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyValue)[0];
            return res.status(400).json({
                success: false,
                message: `${duplicateField} already exists`
            });
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join('. ')
            });
        }

        // Handle other errors
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};
exports.VerifyUser = async (req, res) => {
    try {
        console.log("i am")
        console.log(req.body)
        const userId = req.user.id._id; // Ensure user ID is correctly accessed
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Find user by ID
        const findUser = await User.findById(userId);
        if (!findUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if the user is already verified
        if (findUser.isVerified) {
            return res.status(200).json({ success: true, message: 'User is already verified' });
        }

        const { otp } = req.body;

        // Match OTP
        if (findUser.otp !== otp) {
            return res.status(401).json({ success: false, message: 'Invalid OTP' });
        }




        findUser.isVerified = true;
        await findUser.save();

        return res.status(200).json({ success: true, message: 'User verified successfully' });
    } catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
exports.VerifyresendOtp = async (req, res) => {


    try {
        // Find the user by email
        const userId = req.user.id._id; // Ensure user ID is correctly accessed
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Find user by ID
        const findUser = await User.findById(userId);
        if (!findUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if the user is already verified
        if (findUser.isVerified) {
            return res.status(200).json({ success: true, message: 'User is already verified' });
        }

        // Generate new OTP and update expiry time
        const OTP = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
        const OTPExpires = new Date();
        OTPExpires.setMinutes(OTPExpires.getMinutes() + 10); // Set expiry time to 10 minutes from now

        // Update user document with new OTP and expiry
        findUser.otp = OTP;
        findUser.OtpExpiredTime = OTPExpires;
        await findUser.save();

        // Prepare email options
        const emailOptions = {
            email: findUser.Email,
            subject: 'Password Reset OTP',
            message: `
                <html>
                <head>
                
                </head>
                <body>
                    <p>Your new OTP for password reset is: <strong>${OTP}</strong></p>
                    <p>Please use this OTP within 10 minutes to reset your password.</p>
                </body>
                </html>
            `
        };

        // Send OTP via email
        await SendEmail(emailOptions);

        res.status(200).json({
            success: true,
            msg: 'New OTP sent successfully. Check your email.'
        });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            msg: 'Internal Server Error'
        });
    }
};

exports.login = async (req, res) => {
    const { ContactNumber, Password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ ContactNumber });
        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'User not found'
            });
        }

        if (user.isDeactive) {
            return res.status(404).json({
                success: false,
                msg: 'Your account is deactivated. Please contact admin'
            });
        }

        // Validate password
        const isMatch = await user.comparePassword(Password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                msg: 'Invalid credentials'
            });
        }

        await SendToken(user, res, 201)
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            msg: 'Internal Server Error'
        });
    }
};

exports.logout = async (req, res) => {
    try {
        // Clearing cookies directly
        res.clearCookie('token'); // Replace 'token' with your cookie name
        res.status(200).json({
            success: true,
            msg: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            msg: 'Internal Server Error'
        });
    }
};

exports.userDetails = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!userId) {
            return res.status(401).json({ message: 'Please login to access this resource.' });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Fetch all orders for the user
        const allOrders = await Orders.find({ userId: user._id });

        // Exclude sensitive information from user details
        const { Password, ...userDetails } = user.toObject();

        res.status(200).json({
            message: 'User details and orders retrieved successfully.',
            user: userDetails,
            orders: allOrders
        });

    } catch (error) {
        console.error('Error fetching user details and orders:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};
exports.passwordChangeRequest = async (req, res) => {
    try {
        const { Email, NewPassword } = req.body;

        // Check password length
        if (NewPassword.length <= 6) {
            return res.status(403).json({
                success: false,
                msg: 'Password Length Must be Greater than 6 Digits'
            });
        }

        // Find user by email
        const user = await User.findOne({ Email });
        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'User not found'
            });
        }

        // Generate OTP and expiry time
        const OTP = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
        const OTPExpires = new Date();
        OTPExpires.setMinutes(OTPExpires.getMinutes() + 10); // Set expiry time to 10 minutes from now

        // Update user document with OTP and expiry
        await User.findOneAndUpdate(
            { Email },
            {
                $set: {
                    PasswordChangeOtp: OTP,
                    OtpExpiredTime: OTPExpires,
                    NewPassword: NewPassword
                }
            },
            { new: true }
        );

        // Prepare email options
        const emailOptions = {
            email: Email,
            subject: 'Password Reset OTP',
            message: `
                <html>
                <head>
                </head>
                <body>
                    <p>Your OTP for password reset is: <strong>${OTP}</strong></p>
                    <p>Please use this OTP within 10 minutes to reset your password.</p>
                </body>
                </html>
            `
        };

        // Send OTP via email
        await SendEmail(emailOptions);

        res.status(200).json({
            success: true,
            msg: 'OTP sent successfully. Check your email.'
        });
    } catch (error) {
        console.error('Password change request error:', error);
        res.status(500).json({
            success: false,
            msg: 'Internal Server Error'
        });
    }
};


exports.verifyOtpAndChangePassword = async (req, res) => {
    const { Email, PasswordChangeOtp, NewPassword } = req.body;
console.log(req.body)
    try {
        // Check if OTP is valid and not expired
        const user = await User.findOne({
            Email,
            PasswordChangeOtp: PasswordChangeOtp
           
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                msg: 'Invalid OTP or OTP expired'
            });
        }
        console.log(user)
        // Update password
        user.Password = NewPassword; // Assign NewPassword from user object to Password field
        user.PasswordChangeOtp = undefined;
        user.OtpExpiredTime = undefined;
        user.NewPassword = undefined; // Clear NewPassword field after using it
        await user.save();

        // // Send password change success email
        // const successEmailOptions = {
        //     email: Email,
        //     subject: 'Password Changed Successfully',
        //     message: `
        //         <html>
        //         <head>
                   
        //         </head>
        //         <body>
        //             <p>Your password has been successfully changed.</p>
        //             <p>If you did not perform this action, please contact us immediately.</p>
        //         </body>
        //         </html>
        //     `
        // };

        // // Send email notification
        // await SendEmail(successEmailOptions);

        res.status(200).json({
            success: true,
            msg: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Verify OTP and change password error:', error);
        res.status(500).json({
            success: false,
            msg: 'Internal Server Error'
        });
    }
};
exports.resendOtp = async (req, res) => {
    const { Email } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ Email });

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'User not found'
            });
        }

        // Generate new OTP and update expiry time
        const OTP = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
        const OTPExpires = new Date();
        OTPExpires.setMinutes(OTPExpires.getMinutes() + 10); // Set expiry time to 10 minutes from now

        // Update user document with new OTP and expiry
        user.PasswordChangeOtp = OTP;
        user.OtpExpiredTime = OTPExpires;
        await user.save();

        // Prepare email options
        const emailOptions = {
            email: Email,
            subject: 'Password Reset OTP',
            message: `
                <html>
                <head>
                
                </head>
                <body>
                    <p>Your new OTP for password reset is: <strong>${OTP}</strong></p>
                    <p>Please use this OTP within 10 minutes to reset your password.</p>
                </body>
                </html>
            `
        };

        // Send OTP via email
        await SendEmail(emailOptions);

        res.status(200).json({
            success: true,
            msg: 'New OTP sent successfully. Check your email.'
        });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            msg: 'Internal Server Error'
        });
    }
};

exports.addDeliveryDetails = async (req, res) => {
    try {
        const user = req.user;
        const userExist = await User.findById(user.id._id);

        if (!userExist) {
            return res.status(404).json({
                success: false,
                msg: 'User not found'
            });
        }

        // Extract DeliveryAddress from req.body
        const { city, pincode, houseNo, street, nearByLandMark } = req.body;

        if (!city || !pincode || !houseNo || !street || !nearByLandMark) {
            return res.status(400).json({
                success: false,
                msg: 'All fields are required'
            });
        }

        // Update user's DeliveryAddress
        userExist.DeliveryAddress = {
            City: city,
            PinCode: pincode,
            HouseNo: houseNo,
            Street: street,
            NearByLandMark: nearByLandMark,
        };

        // Save updated user
        await userExist.save();

        res.status(200).json({
            success: true,
            msg: 'Delivery details added/updated successfully',
            user: userExist
        });
    } catch (error) {
        console.error('Error adding delivery details:', error);
        res.status(500).json({
            success: false,
            msg: 'Internal Server Error'
        });
    }
};

exports.GetDeliveryAddressOfUser = async (req, res) => {
    try {
        const user = req.user;
        const userExist = await User.findById(user.id._id);

        if (userExist) {
            const deliveryAddress = userExist.DeliveryAddress;
            return res.status(200).json({
                success: true,
                deliveryAddress: deliveryAddress
            });
        } else {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
    } catch (error) {
        console.error('Error fetching delivery address:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch delivery address'
        });
    }
};

exports.updateDeliveryAddress = async (req, res) => {
    try {
        const userId = req.user.id._id; // Assuming req.user contains the authenticated user's ID

        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'User not found'
            });
        }
        console.log(req.body)
        // Extract DeliveryAddress fields from req.body that are actually updated
        const { city, pincode, houseNo, street, nearByLandMark } = req.body;

        // Update user's DeliveryAddress fields only if they are provided in req.body
        if (city) user.DeliveryAddress.City = city;
        if (pincode) user.DeliveryAddress.PinCode = pincode;
        if (houseNo) user.DeliveryAddress.HouseNo = houseNo;
        if (street) user.DeliveryAddress.Street = street;
        if (nearByLandMark) user.DeliveryAddress.NearByLandMark = nearByLandMark;

        // Save updated user
        await user.save();

        res.status(200).json({
            success: true,
            msg: 'Delivery address updated successfully',
            user: user // Optionally, you can return the updated user object
        });
    } catch (error) {
        console.error('Error updating delivery address:', error);
        res.status(500).json({
            success: false,
            msg: 'Internal Server Error'
        });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const allUser = await User.find()
        if (!allUser) {
            return res.status(404).json({
                success: false,
                msg: 'User not found'
            })
        }
        res.status(200).json({
            success: true,
            msg: 'All Users',
            data: allUser
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            msg: 'Internal Server Error'
        })
    }
}

exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'User not found'
            });
        }
        // Delete user
        await User.findByIdAndDelete(userId);
        res.status(200).json({
            success: true,
            msg: 'User deleted successfully'
        });

    } catch (error) {
        console.log("Internal server error in deleting user")
        res.status(500).json({
            success: false,
            msg: 'Internal Server Error',
            error: error.message
        })
    }
}

exports.updateUser = async (req, res) => {
    const uploadedImages = [];
    try {
        const id = req.params._id;
        const { FullName, ContactNumber, Email } = req.body;

        const existingUser = await User.findById(id)
        if (!existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User not found',
            })
        }

        existingUser.FullName = FullName;
        existingUser.ContactNumber = ContactNumber;
        existingUser.Email = Email;

        if (req.file) {
            if (existingUser.userImage.public_id) {
                await deleteImageFromCloudinary(existingUser.userImage.public_id)
            }
            const imgUrl = await uploadImage(req.file.path)
            const { image, public_id } = imgUrl;
            existingUser.userImage.url = image;
            existingUser.userImage.public_id = public_id;
            uploadedImages.push = existingUser.userImage.public_id
            try {
                fs.unlink(req.file.path)
            } catch (error) {
                console.log('Error in deleting file from local', error)
            }
        } else {
            res.status(400).json({
                success: false,
                message: 'No image uploaded',
            })
        }
        console.log('mid', existingUser)

        const userupdated = await existingUser.save()
        console.log('aftersve', userupdated)

        if (!userupdated) {
            await deleteImageFromCloudinary(existingUser.userImage.public_id)
            return res.status(400).json({
                success: false,
                message: 'Failed to update user',
            })
        }

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: userupdated
        })

    } catch (error) {
        console.log('Internal server error', error)
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            message: error.message

        })
    }
}

exports.updateUserDeactive = async (req, res) => {
    try {
        const id = req.params._id;
        const { isDeactive } = req.body;
        const user = await User.findById(id)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User is not found'
            })
        }
        user.isDeactive = isDeactive;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
        })

    } catch (error) {
        console.log("Internal server error in updating deactive status", error)
        res.status(500).json({
            success: false,
            message: ' Internal Server Error',
        })
    }
}

exports.getSingleUserById = async (req, res) => {
    try {
        const id = req.params._id;
        const user = await User.findById(id)
        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'User not found'
            })
        }
        res.status(200).json({
            success: true,
            msg: 'User found',
            data: user
        })
    } catch (error) {
        console.log("Internal server error", error)
        res.status(500).json({
            success: false,
            msg: 'Internal Server Error in fetchin single user by id',
            message: error.message
        })
    }
}