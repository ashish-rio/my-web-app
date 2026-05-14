const mongoose = require('mongoose');
const dns = require('node:dns');

const configureDnsForAtlas = () => {
    if (!process.env.MONGO_URI.startsWith('mongodb+srv://')) {
        return;
    }

    const dnsServers = process.env.DNS_SERVERS
        ? process.env.DNS_SERVERS.split(',').map((server) => server.trim()).filter(Boolean)
        : ['8.8.8.8', '1.1.1.1'];

    dns.setServers(dnsServers);
};

// Ek function banaya jo database se judne ka wait karega (async/await)
const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI .env file mein missing hai');
        }

        configureDnsForAtlas();

        // Yeh line .env locker se link uthayegi aur connect karegi
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
        });
        console.log(`Bhai, Database Connect Ho Gaya: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error aagaya: ${error.message}`);

        if (error.message.includes('querySrv')) {
            console.error('MongoDB Atlas SRV DNS resolve nahi ho raha. Internet/DNS check karo, ya Atlas se standard mongodb:// connection string use karo.');
        }

        if (error.message.includes('IP that isn\'t whitelisted')) {
            console.error('Fix: MongoDB Atlas > Network Access > Add IP Address mein apna current IP allow karo. Testing ke liye 0.0.0.0/0 bhi use kar sakte ho, lekin production ke liye safe nahi hai.');
        }

        process.exit(1); // Agar error aaya toh server ko turant band kar do
    }
};

// Is function ko export kiya taaki server.js isko use kar sake
module.exports = connectDB;
