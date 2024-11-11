document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("priceForm").addEventListener("submit", async function(event) {
        event.preventDefault(); 

        const input = document.getElementById("find_objet_price");
        const url = input.value;
        const result = document.getElementById("result");

        // Nettoyer le champ de résultat au début
        result.innerHTML = "Chargement...";

        try {
            // Appelle ton serveur backend pour récupérer les données
            const serverUrl = `http://localhost:3000/fetch-data?url=${encodeURIComponent(url)}`;
            const response = await axios.get(serverUrl);
            console.log(response);
            // Vérifie si les données sont bien reçues
            if (response.data && response.data.productTitle) {
                // Formate le résultat (tu peux personnaliser selon le format des données reçues)
                result.innerHTML = `
                    <h3>Produit: ${response.data.productTitle}</h3>
                    <h4>Aperçu:</h4>
                    <div>${response.data.productOverview}</div>
                    <h4>Détails:</h4>
                    <div>${response.data.productPrice}</div>
                `;
            } else {
                result.innerHTML = "Aucune donnée trouvée pour cet objet.";
            }
        } catch (error) {
            result.innerHTML = `Erreur: ${error.message}`;
        }

        // Vide l'input après soumission
        input.value = '';
    });
});
