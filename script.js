let version = "";
let loreGlobal = "";
//
document.addEventListener("DOMContentLoaded", function() {
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

  function getChampionSpells(championId, blurb) {
    let url = `http://ddragon.leagueoflegends.com/cdn/${version}/data/fr_FR/champion/${championId}.json`;
  
    fetch(url)
      .then(response => response.json())
      .then(data => {
        let championData = data.data[championId];
        passiveGlobal = championData.passive; // Enregistrez le passif
        displayAbilities(championData.spells, championData.passive, blurb);
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
        getChampionSpells(champion.id, champion.blurb);
        displayProfile(champion);
        document.querySelector('#modal-abilities').style.display = 'none';
        document.querySelector('#modal-profile').style.display = 'flex';
        document.querySelector('#modal').style.display = 'block';
        
        document.querySelector('#abilities-btn').classList.remove('active');
        document.querySelector('#profile-btn').classList.add('active');
      });

      menuChampion.appendChild(imgElement);
    }
  }

  function displayProfile(champion) {
    let profileElement = document.querySelector('#modal-profile');
    let loreElement = document.querySelector('#modal-description');

    profileElement.innerHTML = `
      <div class="champion-profile">
        <img src="http://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion.image.full}">
        <h2>${champion.name}</h2>
      </div>
    `;

    loreElement.innerHTML = `<p>${champion.blurb}</p>`;
  }

  function displayAbilities(spells, passive, lore) {
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
      imgElement.src = `http://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spell.id}.png`;

      imgElement.addEventListener('click', function() {
        displayAbilityDescription(`${spell.name} (${abilityKeys[i]})`, spell.description);
      });

      modalAbilities.appendChild(imgElement);
    }

    // Trigger click event to make passive active by default
    imgElementPassive.click();

    // Store the lore in the global variable
    loreGlobal = lore;
  }

  function displayAbilityDescription(name, description) {
    if (document.querySelector('#modal-abilities').style.display !== 'none') {
      document.querySelector('#modal-description').innerHTML = `
        <h2>${name}</h2>
        <p>${description}</p>
      `;
    }
  }

    // Dans le gestionnaire d'événements du bouton "Compétences", appelez displayAbilityDescription pour afficher la description du passif
  document.querySelector('#abilities-btn').addEventListener('click', function() {
    document.querySelector('#modal-profile').style.display = 'none';
    document.querySelector('#modal-abilities').style.display = 'flex';
    document.querySelector('#profile-btn').classList.remove('active');
    this.classList.add('active');

    // Affichez la description du passif
    displayAbilityDescription(`${passiveGlobal.name} (Passif)`, passiveGlobal.description);
  });

  document.querySelector('#profile-btn').addEventListener('click', function() {
    console.log('Profile button clicked, lore: ', loreGlobal);

    document.querySelector('#modal-abilities').style.display = 'none';
    document.querySelector('#modal-profile').style.display = 'flex';
    document.querySelector('#abilities-btn').classList.remove('active');
    this.classList.add('active');

    // Display lore when profile button is clicked
    document.querySelector('#modal-description').innerHTML = `<p>${loreGlobal}</p>`;
  });

  document.querySelector('#close-modal').addEventListener('click', function() {
    document.querySelector('#modal').style.display = 'none';
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
});

document.addEventListener('click', function(e) {
  let modal = document.querySelector('#modal');
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});