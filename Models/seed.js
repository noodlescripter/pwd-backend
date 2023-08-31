const mongoose = require('mongoose');
const { error, log, info } = require('console');
const UserSchema = require('./UserModel'); // Assuming UserModel is defined elsewhere
const PasswordSchema = require('./PassSchema'); // Assuming PassSchema is defined elsewhere

// Connect to the MongoDB database
mongoose.connect('mongodb://admin:pass123@localhost:27017/pwdmanage', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    authSource: 'admin'
}).then(() => {
    info('Connected to DB!! Let\'s get to work!!');
}).catch((err) => {
    error('Error connecting to the database:', err);
    process.exit(1); // Exit the process on database connection error
});

const seeding = async () => {
    try {
        // Delete existing passwords and users
        await PasswordSchema.deleteMany({});
        await UserSchema.deleteMany({});

        // Create a new user
        const newUser = new UserSchema({
            username: 'yourusername', // Set the username here
            // Hashed password should be used, not plain text password
            // Make sure your UserModel handles password hashing
            password: 'hashedpassword' // Replace with hashed password
        });

        await newUser.save();
        log('User seeded successfully:', newUser);

        // Create a new password associated with the user
        const newPassword = new PasswordSchema({
            username: newUser._id, // Use the user's ObjectId
            passFor: 'example.com', // Set the passFor field
            newPass: 'password123' // Set the newPass field
        });

        await newPassword.save();
        log('Password seeded successfully:', newPassword);
    } catch (err) {
        error('Error seeding data:', err);
    }
};

seeding().then(() => {
    mongoose.connection.close(); // Close the database connection after seeding
});
