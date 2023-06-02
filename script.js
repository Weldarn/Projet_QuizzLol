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
      
    // Ajoutez un écouteur d'événements de clic à chaque image
    imgElement.addEventListener('click', function() {
        getChampionSpells(champion.id);  // Au lieu d'appeler displayAbilities directement, nous appelons getChampionSpells
    });

    menuChampion.appendChild(imgElement);
  }
}

function getChampionSpells(championId) {
  let url = `http://ddragon.leagueoflegends.com/cdn/${version}/data/fr_FR/champion/${championId}.json`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      let championData = data.data[championId];
      displayAbilities(championData.spells);
    })
    .catch(error => console.error('Error:', error));
}

// Fonction pour afficher les capacités d'un champion dans le modal
function displayAbilities(spells) {
  let modalAbilities = document.querySelector('#modal-abilities');
  modalAbilities.innerHTML = ''; // effacer le contenu actuel
  
  for (let spell of spells) {
      let imgElement = document.createElement('img');
      imgElement.src = `http://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spell.image.full}`;
      
      // Ajouter un écouteur d'événements de clic qui affiche la description de l'attaque
      imgElement.addEventListener('click', function() {
          displayAbilityDescription(spell.description);
      });

      modalAbilities.appendChild(imgElement);
  }
  
  // Montrer le modal
  document.querySelector('#modal').style.display = "block";
}

// Fonction pour afficher la description d'une attaque
function displayAbilityDescription(description) {
  let modalDescription = document.querySelector('#modal-description');
  modalDescription.textContent = description;
}

// Lorsque l'utilisateur clique sur le bouton (x), fermez le modal
document.querySelector('.close').addEventListener('click', function() {
    document.querySelector('#modal').style.display = "none";
});

// Lorsque l'utilisateur clique n'importe où en dehors du modal, fermez le modal
window.onclick = function(event) {
  let modal = document.querySelector('#modal');
  if (event.target == modal) {
      modal.style.display = "none";
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

