const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin'); 
require('dotenv').config(); 

mongoose.connect(process.env.MONGODB_URI, { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(async () => {
    console.log('Connected to MongoDB');

    try {
        const existingAdmin = await Admin.findOne({ email: 'admin@example.com' }); 
        if (existingAdmin) {
            console.log('Admin user already exists.');
            mongoose.disconnect();
            return;
        }

        const plainPassword = 'admin123'; 
        const hashedPassword = bcrypt.hashSync(plainPassword, 10);

        const newAdmin = new Admin({
            email: 'admin@example.com',
            password: hashedPassword,
        });

        const savedAdmin = await newAdmin.save();
        console.log('Admin user created:', savedAdmin);
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        mongoose.disconnect(); 
    }
}).catch(err => {
    console.error('MongoDB connection error:', err);
});