const pokemonCount = 151;
let pokedex = [];
let isSortedAlphabetically = false;

window.onload = async function() {
    await initPokedex();
    
    // Opening animation trigger
    setTimeout(() => {
        const animation = document.getElementById('opening-animation');
        if (animation) {
            animation.classList.add('open');
            document.body.classList.remove('overflow-hidden');
            setTimeout(() => animation.remove(), 1200);
        }
    }, 500);

    const searchBar = document.querySelector('.search-bar');
    if (searchBar) {
        searchBar.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            updateGrid(searchTerm);
        });
    }
}

async function initPokedex() {
    showGridLoader();
    try {
        const promises = [];
        for (let i = 1; i <= pokemonCount; i++) {
            promises.push(getPokemon(i));
        }
        const results = await Promise.all(promises);
        pokedex = results.filter(p => p !== null);
        updateGrid();
    } catch (error) {
        console.error("Error initializing Pokedex:", error);
    } finally {
        hideGridLoader();
    }
}

function showGridLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.remove('hidden');
}

function hideGridLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('hidden');
}

async function getPokemon(num) {
    try {
        const url = `https://pokeapi.co/api/v2/pokemon/${num}`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const pokemon = await res.json();

        const speciesRes = await fetch(pokemon.species.url);
        const speciesData = await speciesRes.json();
        
        const description = speciesData.flavor_text_entries.find(entry => entry.language.name === "en")?.flavor_text.replace(/\f/g, ' ') || "No description available.";

        // Support for animated GIF
        const gif = pokemon.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_default || 
                    pokemon.sprites.other?.showdown?.front_default || 
                    pokemon.sprites.other['official-artwork'].front_default;

        return {
            id: num,
            name: pokemon.name,
            img: pokemon.sprites.other['official-artwork'].front_default,
            gif: gif,
            types: pokemon.types.map(t => t.type.name),
            abilities: pokemon.abilities.map(a => a.ability.name),
            stats: pokemon.stats.map(s => ({ name: s.stat.name, value: s.base_stat })),
            desc: description
        };
    } catch (error) {
        return null;
    }
}

function createPokemonCard(pokemon) {
    const grid = document.getElementById('pokemon-grid');
    if (!grid) return;
    
    const card = document.createElement('div');
    const primaryType = pokemon.types[0];
    
    // Apply the background color based on the primary type
    card.className = `pokemon-card bg-${primaryType} p-6 cursor-pointer group relative overflow-hidden transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl`;
    
    card.innerHTML = `
        <div class="relative z-10 flex flex-col h-full">
            <div class="flex justify-between items-start mb-4">
                <span class="text-xs font-black text-white/50 tracking-tighter">#${pokemon.id.toString().padStart(3, '0')}</span>
                <div class="flex gap-1">
                    ${pokemon.types.map(t => `<div class="w-2.5 h-2.5 rounded-full bg-white/30 border border-white/20"></div>`).join('')}
                </div>
            </div>
            
            <div class="flex-grow flex items-center justify-center mb-4">
                <div class="relative w-32 h-32 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all duration-500">
                    <img src="${pokemon.img}" alt="${pokemon.name}" class="w-28 h-28 object-contain z-10 drop-shadow-lg group-hover:scale-125 transition-transform duration-500">
                </div>
            </div>
            
            <div class="text-center">
                <h3 class="text-xl font-black text-white lowercase first-letter:uppercase mb-1 drop-shadow-sm">${pokemon.name}</h3>
                <div class="flex justify-center gap-1.5 mt-2">
                    ${pokemon.types.map(t => `<span class="px-2.5 py-1 text-[10px] font-black text-white uppercase tracking-wider bg-white/20 rounded-lg backdrop-blur-sm border border-white/10 italic">${t}</span>`).join('')}
                </div>
            </div>
        </div>
        
        <!-- Large PokeBall watermark in the card background -->
        <div class="absolute -bottom-4 -right-10 w-40 h-40 opacity-10 rotate-12 group-hover:rotate-45 group-hover:scale-110 transition-all duration-700 pointer-events-none">
            <img src="pokeball.png" class="w-full h-full filter invert brightness-200">
        </div>
    `;
    
    card.onclick = () => showModal(pokemon);
    grid.appendChild(card);
}

function showModal(pokemon) {
    const modal = document.getElementById('pokemon-modal');
    const modalLeft = document.getElementById('modal-left');
    
    if (!modal) return;

    // Fill data
    document.getElementById('modal-id').innerText = `#${pokemon.id.toString().padStart(3, '0')}`;
    document.getElementById('modal-name').innerText = pokemon.name;
    document.getElementById('modal-gif').src = pokemon.gif;
    document.getElementById('modal-desc').innerText = pokemon.desc;
    
    const typesContainer = document.getElementById('modal-types');
    typesContainer.innerHTML = pokemon.types.map(t => 
        `<span class="px-4 py-1 rounded-full text-xs font-bold text-white uppercase bg-${t}">${t}</span>`
    ).join('');
    
    const primaryType = pokemon.types[0];
    modalLeft.className = `md:w-1/2 p-10 flex flex-col items-center justify-center relative overflow-hidden bg-${primaryType} transition-colors duration-500`;

    const statsContainer = document.getElementById('modal-stats');
    statsContainer.innerHTML = pokemon.stats.map(s => `
        <div class="space-y-1">
            <div class="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                <span>${s.name.replace('-', ' ')}</span>
                <span>${s.value}</span>
            </div>
            <div class="stat-bar-container">
                <div class="stat-bar bg-${primaryType}" style="width: 0%"></div>
            </div>
        </div>
    `).join('');

    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.add('show');
        const bars = statsContainer.querySelectorAll('.stat-bar');
        pokemon.stats.forEach((s, i) => {
            const percentage = Math.min((s.value / 150) * 100, 100);
            bars[i].style.width = `${percentage}%`;
        });
    }, 10);
    
    document.body.classList.add('overflow-hidden');
}

function closeModal() {
    const modal = document.getElementById('pokemon-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        }, 300);
    }
}

function clearSearch() {
    const searchBar = document.querySelector('.search-bar');
    if (searchBar) {
        searchBar.value = '';
        updateGrid();
    }
}

function updateGrid(searchTerm = '') {
    const grid = document.getElementById('pokemon-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const filtered = pokedex.filter(p => 
        p.name.toLowerCase().includes(searchTerm) || 
        p.types.some(t => t.toLowerCase().includes(searchTerm))
    );

    filtered.forEach(createPokemonCard);
}

function toggleSort() {
    isSortedAlphabetically = !isSortedAlphabetically;
    if (isSortedAlphabetically) {
        pokedex.sort((a, b) => a.name.localeCompare(b.name));
    } else {
        pokedex.sort((a, b) => a.id - b.id);
    }
    const searchField = document.querySelector('.search-bar');
    updateGrid(searchField ? searchField.value.toLowerCase() : '');
}