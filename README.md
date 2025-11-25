# 📚 BookLab - Piattaforma Educativa

Una piattaforma web per insegnanti e studenti che permette di:
- Creare e gestire classi
- Condividere libri in PDF
- Assegnare compiti
- Tracciare l'attività degli studenti
- Visualizzare statistiche in tempo reale

## 🚀 Quick Start

### Installazione locale

```bash
# Installa dipendenze
npm install

# Avvia il server
npm start
```

Il server sarà disponibile su `http://localhost:4000`

### Variabili d'ambiente

Crea un file `.env` nella root:

```
NODE_ENV=production
PORT=3000
```

## 📁 Struttura progetto

- `server.js` - Backend Express.js
- `index.html` - Frontend con tutte le pagine
- `db.json` - Database JSON locale
- `package.json` - Dipendenze Node.js

## 🔌 API Endpoints

### Autenticazione
- `POST /api/auth/login` - Login insegnante/studente
- `POST /api/auth/signup` - Registrazione

### Classi
- `GET /api/snapshot` - Ottieni users e classes
- `POST /api/snapshot` - Salva users e classes

### Attività
- `POST /api/activity` - Salva attività studente
- `GET /api/activities` - Ottieni tutte le attività
- `GET /api/activities/:classId` - Ottieni attività di una classe

## 📊 Funzionalità

### Per insegnanti
- ✅ Creare e gestire classi
- ✅ Caricare libri in PDF
- ✅ Creare compiti con domande
- ✅ Visualizzare risposte degli studenti
- ✅ Monitorare attività in tempo reale
- ✅ Statistiche dettagliate per classe

### Per studenti
- ✅ Unirsi a classi
- ✅ Leggere libri in PDF
- ✅ Risolvere compiti assegnati
- ✅ Visualizzare il proprio progresso

## 🛠 Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript vanilla
- **Backend:** Express.js
- **Database:** JSON file (db.json)
- **Hosting:** Glitch / Render / localhost

## 📝 Note

- Il database è un file JSON locale
- Per la produzione, considera di migrare a MongoDB o PostgreSQL
- Tutte le attività sono tracciabili e visibili agli insegnanti

## 🤝 Supporto

Per problemi o domande, contatta l'amministratore del sistema.
