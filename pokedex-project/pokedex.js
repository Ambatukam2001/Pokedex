const pokemonCount = 90; 
var pokedex = {}; 
var isSortedAlphabetically = false; 

window.onload = async function() {
    createLoader(); 

    for (let i = 1; i <= pokemonCount; i++) {
        await getPokemon(i);
    }
    updateTable(); 

    setTimeout(removeLoader, 3000);

    document.querySelector('.search-bar').addEventListener('input', function() {
        createLoader(); 

        let searchTerm = this.value.toLowerCase(); 

        setTimeout(function() {
            updateTable(searchTerm);
            removeLoader();
        }, 3000);
    });
}

function createLoader() {
    let existingLoader = document.getElementById('pokeball-loader');
    if (!existingLoader) {
        const loader = document.createElement('div');
        loader.id = 'pokeball-loader';
        loader.innerHTML = `
            <div class="pokeball-loader">
                <div class="pokeball"></div>
            </div>
        `;
        document.body.appendChild(loader);
        applyLoaderStyles();
    }
}

function removeLoader() {
    let existingLoader = document.getElementById('pokeball-loader');
    if (existingLoader) {
        existingLoader.remove();
    }
}

function applyLoaderStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
        #pokeball-loader {
            display: flex;
            justify-content: center;
            align-items: center;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1000;
        }
        .pokeball {
            border: 5px solid #f3f4f6;
            border-top-color: #cc0000;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

async function getPokemon(num) {
    let url = "https://pokeapi.co/api/v2/pokemon/" + num.toString();
    let res = await fetch(url);
    let pokemon = await res.json();

    let pokemonName = pokemon["name"];
    let pokemonType = pokemon["types"].map(typeInfo => typeInfo.type.name);
    let pokemonImg = pokemon["sprites"]["front_default"];
    let pokemonAbilities = pokemon["abilities"].map(abilityInfo => abilityInfo.ability.name);

    res = await fetch(pokemon["species"]["url"]);
    let pokemonDesc = await res.json();
    pokemonDesc = pokemonDesc["flavor_text_entries"].find(entry => entry.language.name === "en").flavor_text;

    pokedex[num] = {
        "name": pokemonName,
        "img": pokemonImg,
        "types": pokemonType,
        "abilities": pokemonAbilities,
        "desc": pokemonDesc
    };
}

function addPokemonToTable(pokemon) {
    let tableBody = document.querySelector('.tablee tbody');
    let row = tableBody.insertRow();

    let cellImg = row.insertCell(0);
    let imgElement = document.createElement('img');
    imgElement.src = pokemon["img"];
    imgElement.alt = pokemon["name"];
    cellImg.appendChild(imgElement);

    let cellName = row.insertCell(1);
    cellName.textContent = capitalizeFirstLetter(pokemon["name"]);

    let cellTypes = row.insertCell(2);
    cellTypes.textContent = pokemon["types"].map(capitalizeFirstLetter).join(', ');

    let cellAbilities = row.insertCell(3);
    cellAbilities.textContent = pokemon["abilities"].map(capitalizeFirstLetter).join(', ');

    let cellDesc = row.insertCell(4);
    cellDesc.textContent = pokemon["desc"];
}

function capitalizeFirstLetter(string) {
    return string.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function updateTable(searchTerm = '') {
    let tableBody = document.querySelector('.tablee tbody');
    tableBody.innerHTML = '';

    let filteredPokedex = Object.values(pokedex).filter(pokemon => 
        pokemon.name.toLowerCase().includes(searchTerm)
    );

    filteredPokedex.forEach(pokemon => addPokemonToTable(pokemon));
}

function sortPokemonAlphabetically() {
    let sortedPokedex = Object.values(pokedex).sort((a, b) => a.name.localeCompare(b.name));
    let tableBody = document.querySelector('.tablee tbody');
    tableBody.innerHTML = ''; 

    sortedPokedex.forEach(pokemon => addPokemonToTable(pokemon));
}

function sortPokemonRandomly() {
    let shuffledPokedex = Object.values(pokedex).sort(() => 0.5 - Math.random());
    let tableBody = document.querySelector('.tablee tbody');
    tableBody.innerHTML = ''; 

    shuffledPokedex.forEach(pokemon => addPokemonToTable(pokemon));
}

function toggleSort() {
    if (isSortedAlphabetically) {
        sortPokemonRandomly();
    } else {
        sortPokemonAlphabetically();
    }
    isSortedAlphabetically = !isSortedAlphabetically; 
}