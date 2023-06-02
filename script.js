let version = "";

fetch('https://ddragon.leagueoflegends.com/api/versions.json')
  .then(response => response.json())
  .then(versions => {
    version = versions[0];  
    getChampionData();
  });

function getChampionData() {
  let url = `http://ddragon.leagueoflegends.com/cdn/${version}/data/fr_FR/champion.json`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      let championsData = data.data;
      displayChampions(championsData);

      document.querySelector('#search').addEventListener('input', function() {
        filterChampions(championsData);
      });
    })
    .catch(error => console.error('Error:', error));
}

function displayChampions(champions) {
  let menuChampion = document.querySelector('.menu_champion');
  menuChampion.innerHTML = '';

  for (let champ in champions) {
    let champion = champions[champ];
    let imgElement = document.createElement('img');

    imgElement.src = `http://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion.image.full}`;
      
    imgElement.addEventListener('click', function() {
        getChampionSpells(champion.id);  
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
      displayAbilities(championData.spells, championData.passive);
    })
    .catch(error => console.error('Error:', error));
}

function displayAbilities(spells, passive) {
  let modalAbilities = document.querySelector('#modal-abilities');
  modalAbilities.innerHTML = '';

  let imgElementPassive = document.createElement('img');
  imgElementPassive.src = `http://ddragon.leagueoflegends.com/cdn/${version}/img/passive/${passive.image.full}`;

  imgElementPassive.addEventListener('click', function() {
    displayAbilityDescription(`${passive.name} (Passif)`, passive.description);
  });

  modalAbilities.appendChild(imgElementPassive);

  let abilityKeys = ['Q', 'W', 'E', 'R'];
  for (let i = 0; i < spells.length; i++) {
    let spell = spells[i];
    let imgElement = document.createElement('img');
    imgElement.src = `http://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spell.image.full}`;

    imgElement.addEventListener('click', function() {
      displayAbilityDescription(`${spell.name} (${abilityKeys[i]})`, spell.description);  // Ajoutez la touche à côté du nom de la compétence
    });

    modalAbilities.appendChild(imgElement);
  }
  
  document.querySelector('#modal').style.display = "block";
}

function displayAbilityDescription(name, description) {
  let modalDescription = document.querySelector('#modal-description');
  modalDescription.innerHTML = `<h2>${name}</h2>${description}`;
}

document.querySelector('#modal').addEventListener('click', function(e) {
  if (e.target == this) {
    this.style.display = "none";
  }
});

document.querySelector('.close').addEventListener('click', function() {
  document.querySelector('#modal').style.display = "none";
});

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