const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
            unique: true,
            validate: {
                validator: function (v) {
                return /^(84|0[3|5|7|8|9])+([0-9]{8})$/.test(v);
                },
                message: 'Please enter a valid phone number',
            },
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            validate: {
                validator: function (v) {
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
                },
                message: 'Please enter a valid email',
            },
        },
        accessCode: {
            type: String,
            default: "",
        },
        accessCodeType: {
            type: String,
            default: "",
        },
        accessCodeValidUntil: {
            type: Date,
            default: null,
        },
        accessCodeTryCount: {
            type: Number,
            default: 0,
        },
        setupToken: {
            type: String,
            unique: true,
            default: "",
        },
        username: {
            type: String,
            unique: true,
            trim: true,
            maxlength: [20, 'Username cannot exceed 20 characters'],
        },
        password: {
            type: String,
        },
        department: {
            type: String,
            trim: true,
        },
        role: {
            type: String,
            enum: ['employee', 'manager', 'admin'],
            default: 'employee',
            validate: {
                validator: function (v) {
                    return ['employee', 'manager', 'admin'].includes(v);
                },
                message: 'Invalid role',
            },
        },
        enabled: {
            type: Boolean,
            default: true,
        },
        deleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = mongoose.model('User', userSchema);
