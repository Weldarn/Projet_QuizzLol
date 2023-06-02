let version = "";

// Récupérer la dernière version de l'API
fetch('https://ddragon.leagueoflegends.com/api/versions.json')
  .then(response => response.json())
  .then(versions => {
    version = versions[0];  // La première version de la liste est la plus récente
    getChampionData();
  });

// Fonction pour obtenir les données des champions
function getChampionData() {
  let url = `http://ddragon.leagueoflegends.com/cdn/${version}/data/fr_FR/champion.json`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      let championsData = data.data;
      displayChampions(championsData);
      
      // Ajouter un événement d'écoute pour le champ de recherche après avoir obtenu les données des champions
      document.querySelector('#search').addEventListener('input', function() {
        filterChampions(championsData);
      });
    })
    .catch(error => console.error('Error:', error));
}

// Fonction pour afficher les champions
function displayChampions(champions) {
  let menuChampion = document.querySelector('.menu_champion');
  menuChampion.innerHTML = '';

  for (let champ in champions) {
    let champion = champions[champ];
    let imgElement = document.createElement('img');

    imgElement.src = `http://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion.image.full}`;
      
    menuChampion.appendChild(imgElement);
  }
}

// Fonction pour filtrer les champions en fonction de la recherche
function filterChampions(champions) {
  let searchValue = document.querySelector('#search').value.toLowerCase();
  
  let filteredChampions = {};
  
  for (let champ in champions) {
    let champion = champions[champ];
    if (champion.name.toLowerCase().startsWith(searchValue)) {
      filteredChampions[champ] = champion;
    }
  }
  
  displayChampions(filteredChampions);
}

