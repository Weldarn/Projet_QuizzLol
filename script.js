let version = "";
let loreGlobal = "";
//
document.addEventListener("DOMContentLoaded", function () {
  fetch("https://ddragon.leagueoflegends.com/api/versions.json")
    .then((response) => response.json())
    .then((versions) => {
      version = versions[0];
      getChampionData();
      populateClassSelect();
    });

  function getChampionData() {
    let url = `http://ddragon.leagueoflegends.com/cdn/${version}/data/fr_FR/champion.json`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        let championsData = data.data;
        displayChampions(championsData);

        document
          .querySelector("#search")
          .addEventListener("input", function () {
            filterChampions(championsData);
          });
      })
      .catch((error) => console.error("Error:", error));
  }

  function getChampionSpells(championId, blurb) {
    let url = `http://ddragon.leagueoflegends.com/cdn/${version}/data/fr_FR/champion/${championId}.json`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        let championData = data.data[championId];
        passiveGlobal = championData.passive;
        displayAbilities(championData.spells, championData.passive, blurb);
      })
      .catch((error) => console.error("Error:", error));
  }

  function displayChampions(champions) {
    let menuChampion = document.querySelector(".menu_champion");
    menuChampion.innerHTML = "";

    for (let champ in champions) {
      let champion = champions[champ];
      let imgElement = document.createElement("img");

      imgElement.src = `http://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion.image.full}`;

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

  function populateClassSelect() {
    let url = `http://ddragon.leagueoflegends.com/cdn/${version}/data/fr_FR/champion.json`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        let allChampionData = data.data;
        let classes = [];

        for (let champion in allChampionData) {
          allChampionData[champion].tags.forEach((tag) => {
            if (!classes.includes(tag)) {
              classes.push(tag);
            }
          });
        }

        let classSelect = document.querySelector("#class-select");

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
      })
      .catch((error) => console.error("Error:", error));
  }

  populateClassSelect();

  function displayProfile(champion) {
    let profileElement = document.querySelector("#modal-profile");
    let loreElement = document.querySelector("#modal-description");

    profileElement.innerHTML = `
      <div class="champion-profile">
        <img src="http://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion.image.full}">
        <h2>${champion.name}</h2>
      </div>
    `;

    loreElement.innerHTML = `<p>${champion.blurb}</p>`;
  }

  function displayAbilities(spells, passive, lore) {
    let modalAbilities = document.querySelector("#modal-abilities");
    modalAbilities.innerHTML = "";

    let imgElementPassive = document.createElement("img");
    imgElementPassive.src = `http://ddragon.leagueoflegends.com/cdn/${version}/img/passive/${passive.image.full}`;

    imgElementPassive.addEventListener("click", function () {
      displayAbilityDescription(
        `${passive.name} (Passif)`,
        passive.description
      );
    });

    modalAbilities.appendChild(imgElementPassive);

    let abilityKeys = ["Q", "W", "E", "R"];
    for (let i = 0; i < spells.length; i++) {
      let spell = spells[i];
      let imgElement = document.createElement("img");
      imgElement.src = `http://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spell.id}.png`;

      imgElement.addEventListener("click", function () {
        displayAbilityDescription(
          `${spell.name} (${abilityKeys[i]})`,
          spell.description
        );
      });

      modalAbilities.appendChild(imgElement);
    }

    imgElementPassive.click();

    loreGlobal = lore;
  }

  function displayAbilityDescription(name, description) {
    if (document.querySelector("#modal-abilities").style.display !== "none") {
      document.querySelector("#modal-description").innerHTML = `
        <h2>${name}</h2>
        <p>${description}</p>
      `;
    }
  }

  function filterChampions(champions) {
    let searchValue = document.querySelector("#search").value.toLowerCase();

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

document.querySelector("#abilities-btn").addEventListener("click", function () {
  document.querySelector("#modal-profile").style.display = "none";
  document.querySelector("#modal-abilities").style.display = "flex";
  document.querySelector("#profile-btn").classList.remove("active");
  this.classList.add("active");

  displayAbilityDescription(
    `${passiveGlobal.name} (Passif)`,
    passiveGlobal.description
  );
});

function filterChampionsByClass(selectedClass) {
  let url = `http://ddragon.leagueoflegends.com/cdn/${version}/data/fr_FR/champion.json`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      let championsData = data.data;

      let filteredChampions = {};

      for (let champ in championsData) {
        let champion = championsData[champ];

        if (champion.tags.includes(selectedClass)) {
          filteredChampions[champ] = champion;
        }
      }

      displayChampions(filteredChampions);
    })
    .catch((error) => console.error("Error:", error));
}

document.querySelector("#profile-btn").addEventListener("click", function () {
  console.log("Profile button clicked, lore: ", loreGlobal);

  document.querySelector("#modal-abilities").style.display = "none";
  document.querySelector("#modal-profile").style.display = "flex";
  document.querySelector("#abilities-btn").classList.remove("active");
  this.classList.add("active");

  document.querySelector(
    "#modal-description"
  ).innerHTML = `<p>${loreGlobal}</p>`;
});

document.querySelector("#close-modal").addEventListener("click", function () {
  document.querySelector("#modal").style.display = "none";
});

document
  .querySelector("#class-select")
  .addEventListener("change", function (e) {
    filterChampionsByClass(e.target.value);
  });

document.addEventListener("click", function (e) {
  let modal = document.querySelector("#modal");
  if (e.target === modal) {
    modal.style.display = "none";
  }
});
