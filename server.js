const express = require('express');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const cheerio = require('cheerio');
const app = express();
const port = process.env.PORT || 3000;

// Activation du middleware CORS
app.use(cors());

// Utilisation de Helmet pour la sécurité et configuration de la politique CSP
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", "http://localhost:3000", "https://images-eu.ssl-images-amazon.com"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "http://localhost:3000"],
            scriptSrcElem: ["'self'"], // <-- Ajout de cette directive pour les balises <script>
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
        }
    }
}));

// Pour servir des fichiers statiques comme le favicon
app.use(express.static(path.join(__dirname, 'public'))); // Dossier public pour les ressources statiques

// Route pour récupérer les données de produit
app.get('/fetch-data', async (req, res) => {
    const { url } = req.query;

    try {
        const response = await axios.get(url, { timeout: 5000 });
        const $ = cheerio.load(response.data);  // Charge le HTML avec cheerio

        // Récupère les éléments avec les IDs spécifiques
        const productTitle = $('#productTitle').text().trim();
        const productOverview = $('#productOverview_feature_div').html()?.trim() || "Aperçu non trouvé";

        // Extraction du prix avec plusieurs sélecteurs alternatifs
        let productPrice = "Prix non trouvé";
        const priceWhole = $('#corePriceDisplay_desktop_feature_div .a-price-whole').text().trim();
        const priceFraction = $('#corePriceDisplay_desktop_feature_div .a-price-fraction').text().trim() || "00";




        // Utilise le prix extrait ou recherche dans d'autres éléments si nécessaire
        if (priceWhole) {
            productPrice = `${priceWhole},${priceFraction}€`;
        } else {
            const alternativePrice = $('.a-price .a-offscreen').first().text().trim();
            productPrice = alternativePrice || "Prix non trouvé";
        }

        console.log("Titre du produit :", productTitle);
        console.log("Aperçu du produit :", productOverview);
        console.log("Prix principal trouvé :", productPrice);


        // Envoie les données extraites au frontend
        res.json({
            productTitle,
            productOverview,
            productPrice
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Erreur lors de la récupération des données", details: error.message });
    }
});


// Route pour servir la page d'accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Serveur en écoute sur http://localhost:${port}`);
});
