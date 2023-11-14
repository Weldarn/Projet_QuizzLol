let version = "";
let loreGlobal = "";
let championsDataGlobal = {};
let itemsDataGlobal = {};
let passiveGlobal = {};

function displayAbilityDescription(name, description) {
  if (document.querySelector("#modal-abilities").style.display !== "none") {
    document.querySelector("#modal-description").innerHTML = `<h2>${name}</h2><p>${description}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  fetch('https://ddragon.leagueoflegends.com/api/versions.json')
    .then((response) => response.json())
    .then((versions) => {
      version = versions[0];

      if (document.querySelector(".menu_champion")) {
        getChampionData();
      }

      if (document.querySelector(".menu_item")) {
        getItemData();
      }

    });

  function getChampionData() {
    let url = `https://ddragon.leagueoflegends.com/cdn/${version}/data/fr_FR/champion.json`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        championsDataGlobal = data.data;
        displayChampions(championsDataGlobal);
        populateClassSelect();
        populateItemsSelect();

        document.querySelector("#search").addEventListener("input", filterChampions);
        document.querySelector("#class-select").addEventListener("change", filterChampions);
      })
      .catch((error) => console.error("Error:", error));
  }

  function getChampionSpells(championId, blurb) {
    let url = `https://ddragon.leagueoflegends.com/cdn/${version}/data/fr_FR/champion/${championId}.json`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        let championData = data.data[championId];
        passiveGlobal = championData.passive;
        displayAbilities(championData.spells, championData.passive, blurb);
      })
      .catch((error) => console.error("Error:", error));
  }

  function getItemData() {
    let url = `https://ddragon.leagueoflegends.com/cdn/${version}/data/fr_FR/item.json`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        itemsDataGlobal = data.data;
        displayItems(itemsDataGlobal);
        populateItemsSelect();

        document.querySelector("#search-items").addEventListener("input", filterItems);
        document.querySelector("#items_filter").addEventListener("change", filterItems);
      })
      .catch((error) => console.error("Error:", error));
  }

  function displayChampions(champions) {
    let menuChampion = document.querySelector(".menu_champion");
    if (menuChampion) {
      menuChampion.innerHTML = "";

      for (let champ in champions) {
        let champion = champions[champ];
        let imgElement = document.createElement("img");

        imgElement.src = `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion.image.full}`;

        imgElement.addEventListener("click", function () {
          getChampionSpells(champion.id, champion.blurb);
          displayProfile(champion);
          document.querySelector("#modal-abilities").style.display = "none";
          document.querySelector("#modal-profile").style.display = "flex";
          document.querySelector("#modal").style.display = "block";

          document.querySelector("#abilities-btn").classList.remove("active");
          document.querySelector("#profile-btn").classList.add("active");
        });

        menuChampion.appendChild(imgElement);
      }
    }
  }

  function displayItemProfile(item) {
    let profileElement = document.querySelector("#item-profile");
    profileElement.innerHTML = `
    <div class="item-profile">
      <img src='https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${item.image.full}'>
      <h2>${item.name}</h2>
      <p>${item.description}</p>
    </div>
  `;
    document.querySelector("#item-modal").style.display = "block";
  }

  function displayProfile(champion) {
    let profileElement = document.querySelector("#modal-profile");
    let loreElement = document.querySelector("#modal-description");

    profileElement.innerHTML = `
      <div class="champion-profile">
        <img src='https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion.image.full}'>
        <h2>${champion.name}</h2>
      </div>
    `;

    loreElement.innerHTML = `<p>${champion.blurb}</p>`;
  }

  function displayAbilities(spells, passive, lore) {
    let modalAbilities = document.querySelector("#modal-abilities");
    modalAbilities.innerHTML = "";

    let imgElementPassive = document.createElement("img");
    imgElementPassive.src = `https://ddragon.leagueoflegends.com/cdn/${version}/img/passive/${passive.image.full}`;

    imgElementPassive.addEventListener("click", function () {
      displayAbilityDescription(`${passive.name} (Passif)`, passive.description);
    });

    modalAbilities.appendChild(imgElementPassive);

    let abilityKeys = ["Q", "W", "E", "R"];
    for (let i = 0; i < spells.length; i++) {
      let spell = spells[i];
      let imgElement = document.createElement("img");
      imgElement.src = `https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spell.id}.png`;

      imgElement.addEventListener("click", function () {
        displayAbilityDescription(`${spell.name} (${abilityKeys[i]})`, spell.description);
      });

      modalAbilities.appendChild(imgElement);
    }

    imgElementPassive.click();
    loreGlobal = lore;
  }

  function filterChampions() {
    let searchValue = document.querySelector("#search").value.toLowerCase();
    let selectedClass = document.querySelector("#class-select").value;

    let filteredChampions = {};

    for (let champ in championsDataGlobal) {
      let champion = championsDataGlobal[champ];

      if (champion.name.toLowerCase().startsWith(searchValue) && (selectedClass === "" || champion.tags.includes(selectedClass))) {
        filteredChampions[champ] = champion;
      }
    }

    displayChampions(filteredChampions);
  }

  function populateClassSelect() {
    let classSelect = document.querySelector("#class-select");
    let classes = [];

    for (let champion in championsDataGlobal) {
      championsDataGlobal[champion].tags.forEach((tag) => {
        if (!classes.includes(tag)) {
          classes.push(tag);
        }
      });
    }

    const translations = {
      Assassin: "Assassin",
      Fighter: "Combattant",
      Mage: "Mage",
      Marksman: "Tireur",
      Support: "Support",
      Tank: "Tank",
    };

    classes.forEach((c) => {
      let option = document.createElement("option");
      option.value = c;
      option.text = translations[c] ? translations[c] : c;
      classSelect.add(option);
    });
  }

  function displayItems(items) {
    let menuItem = document.querySelector(".menu_item");
    if (menuItem) {
      menuItem.innerHTML = "";

      for (let itemId in items) {
        let item = items[itemId];
        let itemContainer = document.createElement("div");
        itemContainer.classList.add("item-container");

        let imgElement = document.createElement("img");
        imgElement.src = `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${item.image.full}`;

        imgElement.addEventListener("click", function () {
          displayItemProfile(item);
        });

        let nameElement = document.createElement("p");
        nameElement.textContent = item.name;

        itemContainer.appendChild(imgElement);
        itemContainer.appendChild(nameElement);
        menuItem.appendChild(itemContainer);
      }
    }
  }

  function populateItemsSelect() {
    let tagsSet = new Set();
    let tagsSelect = document.querySelector("#items_filter");

    for (let itemId in itemsDataGlobal) {
      let item = itemsDataGlobal[itemId];
      if (item.tags) {
        item.tags.forEach(tag => {
          tagsSet.add(tag);
        });
      }
    }

    const itemTagsTranslations = {
      "Armor": "Armure",
      "Attack": "Attaque",
      "CriticalStrike": "Coup Critique",
      "Damage": "Dégâts",
      "Health": "Santé",
      "Magic": "Magie",
      "Mana": "Mana",
      "Regen": "Régénération",
      "SpellBlock": "Blocage de Sort",
      "Stealth": "Furtivité",
      "Tenacity": "Ténacité",
      "Boots": "Bottes",
      "ManaRegen": "Régénération de Mana",
      "HealthRegen": "Régénération de Vie",
      "SpellDamage": "Dégâts Magiques",
      "LifeSteal": "Vol de Vie",
      "SpellVamp": "Vol de Sort",
      "Jungle": "Jungle",
      "Lane": "Voie",
      "AttackSpeed": "Vitesse d'Attaque",
      "OnHit": "À l'Impact",
      "Trinket": "Bijou",
      "Active": "Actif",
      "Consumable": "Consommable",
      "CooldownReduction": "Réduction du Temps de Rechargement",
      "AbilityHaste": "Hâte",
      "Vision": "Vision",
      "NonbootsMovement": "Mouvement (hors bottes)",
      "MagicPenetration": "Pénétration Magique",
      "ArmorPenetration": "Pénétration d'Armure",
      "Aura": "Aura",
      "Slow": "Ralentissement",
      "MagicResist": "Résistance Magique",
      "GoldPer": "Or par seconde",
    };

    tagsSet.forEach(tag => {
      let translatedTag = itemTagsTranslations[tag] || tag;
      let option = document.createElement("option");
      option.value = tag;
      option.text = translatedTag;
      tagsSelect.add(option);
    });
  }

  function filterItems() {
    let searchValue = document.querySelector("#search-items").value.toLowerCase();
    let selectedTag = document.querySelector("#items_filter").value;

    let itemContainers = document.querySelectorAll(".menu_item .item-container");
    itemContainers.forEach(container => {
      let itemName = container.querySelector("p").textContent.toLowerCase();
      let itemId = container.querySelector("img").src.split("/").pop().split(".")[0];
      let itemTags = itemsDataGlobal[itemId].tags || [];

      if (itemName.startsWith(searchValue) && (selectedTag === "" || itemTags.includes(selectedTag))) {
        container.style.display = "block";
      } else {
        container.style.display = "none";
      }
    });
  }

  var btn = document.getElementById("userprofil-btn");
  var modal = document.getElementById("userprofil-modal");
  var username = localStorage.getItem('username');
  if (username) {
    document.getElementById('pseudo-span').textContent = username;
  }

  btn.onclick = function () {
    modal.style.display = "block";
  }

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }

  if (document.querySelector("#abilities-btn")) {
    document.querySelector("#abilities-btn").addEventListener("click", function () {
      if (document.querySelector("#modal-profile")) {
        document.querySelector("#modal-profile").style.display = "none";
      }
      if (document.querySelector("#modal-abilities")) {
        document.querySelector("#modal-abilities").style.display = "flex";
      }
      if (document.querySelector("#profile-btn")) {
        document.querySelector("#profile-btn").classList.remove("active");
      }
      this.classList.add("active");

      displayAbilityDescription(`${passiveGlobal.name} (Passif)`, passiveGlobal.description);
    });
  }

  if (document.querySelector("#profile-btn")) {
    document.querySelector("#profile-btn").addEventListener("click", function () {
      if (document.querySelector("#modal-abilities")) {
        document.querySelector("#modal-abilities").style.display = "none";
      }
      if (document.querySelector("#modal-profile")) {
        document.querySelector("#modal-profile").style.display = "flex";
      }
      if (document.querySelector("#abilities-btn")) {
        document.querySelector("#abilities-btn").classList.remove("active");
      }
      this.classList.add("active");

      if (document.querySelector("#modal-description")) {
        document.querySelector("#modal-description").innerHTML = `<p>${loreGlobal}</p>`;
      }
    });
  }

  if (document.querySelector("#close-modal")) {
    document.querySelector("#close-modal").addEventListener("click", function () {
      if (document.querySelector("#modal")) {
        document.querySelector("#modal").style.display = "none";
      }
    });
  }

  if (document.querySelector("#close-item-modal")) {
    document.querySelector("#close-item-modal").addEventListener("click", function () {
      if (document.querySelector("#item-modal")) {
        document.querySelector("#item-modal").style.display = "none";
      }
    });
  }

  if (document.querySelector("#class-select")) {
    document.querySelector("#class-select").addEventListener("change", function (e) {
      filterChampions();
    });
  }

  document.addEventListener("click", function (e) {
    let modal = document.querySelector("#modal");
    if (modal && e.target === modal) {
      modal.style.display = "none";
    }
  });

  document.addEventListener("click", function (e) {
    let modal = document.querySelector("#item-modal");
    if (modal && e.target === modal) {
      modal.style.display = "none";
    }
  });
});
