const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 4000;
const DB_PATH = path.join(__dirname, 'db.json');
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.static(__dirname)); // Serve file statici dalla cartella root

// Connessione a MongoDB (se disponibile)
let isMongoConnected = false;
if (MONGODB_URI) {
    mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            console.log('✅ Connesso a MongoDB Atlas');
            isMongoConnected = true;
        })
        .catch(err => {
            console.warn('⚠️ MongoDB non disponibile, usando JSON locale:', err.message);
            isMongoConnected = false;
        });
}

// Schema MongoDB
const collectionSchema = new mongoose.Schema({
    type: String,
    data: mongoose.Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now }
});

let DBCollection;
if (isMongoConnected || MONGODB_URI) {
    try {
        DBCollection = mongoose.model('DBCollection', collectionSchema);
    } catch (e) {
        // Model già esiste
        DBCollection = mongoose.model('DBCollection');
    }
}

function readDB() {
    try {
        // Se MongoDB è connesso, leggi da lì
        if (isMongoConnected && DBCollection) {
            // Nota: questo è asincrono, ma readDB è sincrono
            // Usiamo una connessione sincrona a JSON per ora
            // I dati verranno sincronizzati in writeDB
        }
        
        // Fallback a JSON locale
        const content = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        console.error('Impossibile leggere il database locale:', error);
        return { users: [], classes: [], activities: [], updatedAt: null };
    }
}

function writeDB(db) {
    try {
        // Salva in JSON locale (sempre)
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
        
        // Se MongoDB è connesso, sincronizza anche lì
        if (isMongoConnected && DBCollection) {
            DBCollection.updateOne(
                { type: 'maindb' },
                { type: 'maindb', data: db, createdAt: new Date() },
                { upsert: true }
            ).catch(err => console.error('Errore sincronizzazione MongoDB:', err));
        }
    } catch (error) {
        console.error('Impossibile scrivere il database locale:', error);
    }
}

// Funzione asincrona per leggere da MongoDB
async function readDBMongo() {
    try {
        if (!isMongoConnected || !DBCollection) {
            return readDB(); // Fallback a JSON
        }
        
        const doc = await DBCollection.findOne({ type: 'maindb' });
        if (doc && doc.data) {
            return doc.data;
        }
        return readDB(); // Fallback se non trovato
    } catch (error) {
        console.error('Errore lettura MongoDB:', error);
        return readDB(); // Fallback a JSON
    }
}

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/snapshot', (req, res) => {
    const db = readDB();
    res.json({
        users: db.users || [],
        classes: db.classes || [],
        updatedAt: db.updatedAt || null
    });
});

app.post('/api/snapshot', (req, res) => {
    const { users, classes } = req.body || {};

    if (!Array.isArray(users) || !Array.isArray(classes)) {
        return res.status(400).json({ message: 'Formato snapshot non valido' });
    }

    const db = readDB();
    db.users = users;
    db.classes = classes;
    db.updatedAt = new Date().toISOString();

    writeDB(db);
    res.json({ status: 'ok', updatedAt: db.updatedAt });
});

// Endpoint per salvare un'attività
app.post('/api/activity', (req, res) => {
    const activity = req.body;
    
    if (!activity || !activity.userId || !activity.classId) {
        return res.status(400).json({ message: 'Attività non valida' });
    }

    const db = readDB();
    if (!db.activities) {
        db.activities = [];
    }

    activity.id = Date.now().toString();
    activity.timestamp = new Date().toISOString();
    db.activities.push(activity);

    writeDB(db);
    res.json({ status: 'ok', activity });
});

// Endpoint per ottenere le attività
app.get('/api/activities', (req, res) => {
    const db = readDB();
    const activities = db.activities || [];
    res.json({ activities });
});

// Endpoint per ottenere le attività di una classe
app.get('/api/activities/:classId', (req, res) => {
    const { classId } = req.params;
    const db = readDB();
    const activities = (db.activities || []).filter(a => a.classId === classId);
    res.json({ activities });
});

// Endpoint per ottenere lo status del database
app.get('/api/db-status', (req, res) => {
    res.json({
        status: 'ok',
        mongoConnected: isMongoConnected,
        database: isMongoConnected ? 'MongoDB Atlas' : 'JSON locale',
        timestamp: new Date().toISOString()
    });
});

app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint non trovato' });
});

app.listen(PORT, () => {
    const dbType = isMongoConnected ? '📊 MongoDB Atlas' : '💾 JSON locale';
    console.log(`\n🚀 BookLab API attiva su http://localhost:${PORT}`);
    console.log(`📁 Database: ${dbType}`);
    console.log(`⏰ Timestamp: ${new Date().toISOString()}\n`);
});

