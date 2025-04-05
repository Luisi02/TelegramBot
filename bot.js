const fs = require("fs");
const TelegramBot = require("node-telegram-bot-api");
const https = require("https"); // Modulo nativo di Node.js

// Carica configurazione
const conf = JSON.parse(fs.readFileSync("conf.json"));
const token = conf.key; // Token del bot Telegram
const lastFmKey = conf.lastfm; // Chiave API di Last.fm

const bot = new TelegramBot(token, { polling: true });

// Funzione per ottenere informazioni sull'artista da Last.fm
function getArtistInfo(artistName, callback) {
    const url = `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(artistName)}&api_key=${lastFmKey}&format=json`;

    https.get(url, (res) => {
        let data = '';

        // Ricezione dei dati
        res.on('data', (chunk) => {
            data += chunk;
        });

        // Fine della ricezione
        res.on('end', () => {
            const artistData = JSON.parse(data);
            const artist = artistData.artist;

            if (artist) {
                callback(null, `Nome: ${artist.name}
Biografia: ${artist.bio.summary || "N/A"}
Popolarità: ${artist.stats.playcount || "N/A"} ascolti
Link: ${artist.url || "N/A"}`);
            } else {
                callback("Artista non trovato.");
            }
        });
    }).on('error', (err) => {
        console.error("Errore durante il recupero dei dati:", err.message);
        callback(`Errore durante il recupero dei dati: ${err.message}`);
    });
}

// Ascolta i messaggi ricevuti dal bot
bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text.trim();
    if (text === "/help"){
        bot.sendMessage(chatId,"Dimmi un nome di un artista ed io ti darò tutte le informazioni su di lui")
    }else{
        // Ottieni informazioni sull'artista
        getArtistInfo(text, (error, artistInfo) => {
            if (error) {
                bot.sendMessage(chatId, error);
            } else {
                bot.sendMessage(chatId, artistInfo);
            }
        });
    }
});