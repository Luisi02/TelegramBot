const fs = require("fs");
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

// Carica configurazione
const conf = JSON.parse(fs.readFileSync("conf.json"));
const token = conf.key; // Token del bot Telegram
const lastFmKey = conf.lastfm; // Chiave API di Last.fm

const bot = new TelegramBot(token, { polling: true });

// Funzione per ottenere informazioni sull'artista da Last.fm
async function getArtistInfo(artistName) {
    try {
        const url = `https://ws.audioscrobbler.com/2.0/`;
        const params = {
            method: 'artist.getinfo',
            artist: artistName,
            api_key: lastFmKey,
            format: 'json'
        };

        const response = await axios.get(url, { params });
        const artist = response.data.artist;

        if (artist) {
            return `Nome: ${artist.name}
Biografia: ${artist.bio.summary || "N/A"}
Popolarità: ${artist.stats.playcount || "N/A"} ascolti
Link: ${artist.url || "N/A"}`;
        } else {
            return "Artista non trovato.";
        }
    } catch (error) {
        console.error("Errore durante il recupero dei dati:", error.message);
        return `Errore durante il recupero dei dati: ${error.message}`;
    }
}

// Ascolta i messaggi ricevuti dal bot
bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text.trim(); // Usa il testo del messaggio come nome dell'artista

    // Ottieni informazioni sull'artista
    const artistInfo = await getArtistInfo(text);
    bot.sendMessage(chatId, artistInfo);
});