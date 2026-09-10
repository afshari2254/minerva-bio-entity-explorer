(function () {
    'use strict';

    var BioEntityExplorer = function () {
        this.name = 'Bio_Entity_Explorer';
        this.version = '1.0.0';
        this.id = 'bio_entity_explorer_v1';
    };

    BioEntityExplorer.prototype.getName = function () {
        return this.name;
    };

    BioEntityExplorer.prototype.getVersion = function () {
        return this.version;
    };

    BioEntityExplorer.prototype.getId = function () {
        return this.id;
    };

    BioEntityExplorer.prototype.register = function (minervaProxy) {

        var container = minervaProxy.element;

        var style = document.createElement('style');

        style.innerHTML = `
            .bio-wrapper {
                font-family: 'Segoe UI', sans-serif;
                padding: 20px;
                background: #f5f7fb;
                min-height: 500px;
            }

            .bio-title {
                background: #1a237e;
                color: white;
                padding: 18px;
                border-radius: 10px;
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 20px;
            }

            .bio-search {
                width: 100%;
                box-sizing: border-box;
                padding: 14px;
                border: 2px solid #1a237e;
                border-radius: 8px;
                font-size: 15px;
            }

            .bio-card {
    margin-top: 20px;
    background: white;
    padding: 20px;
    border-radius: 10px;
    border-top: 5px solid #1a237e;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.bio-name {
    font-size: 22px;
    font-weight: bold;
    color: #1a237e;
}

.bio-type {
    display: inline-block;
    margin-top: 5px;
    padding: 4px 10px;
    background: #e8eaf6;
    color: #1a237e;
    border-radius: 15px;
    font-size: 11px;
    font-weight: bold;
}

.bio-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 20px;
}

.bio-info {
    background: #f5f7fb;
    padding: 10px;
    border-radius: 7px;
}

.bio-info small {
    display: block;
    color: #777;
    font-size: 9px;
}

.bio-count {
    margin-top: 15px;
    padding: 10px;
    background: #fffde7;
    border-radius: 7px;
    font-weight: bold;
}
`;
        document.head.appendChild(style);

        container.innerHTML = `
            <div class="bio-wrapper">

                <div class="bio-title">
                    🔬 Bio Entity Explorer
                </div>

                <input
                    id="bioSearch"
                    class="bio-search"
                    type="text"
                    placeholder="Search entity, for example TNF..."
                >

                <div id="bioResult" class="bio-card">
                    <b>Ready.</b>
                    <p>Search for a biological entity.</p>
                </div>

            </div>
        `;
         // ===== STEP 2: LOAD ENTITIES FROM MINERVA =====
var allEntities = [];

var input = container.querySelector('#bioSearch');
var result = container.querySelector('#bioResult');

input.disabled = true;

result.innerHTML = `
    <b>Loading entities...</b>
`;

minervaProxy.project.data.getAllBioEntities()
    .then(function (entities) {

        allEntities = entities;

        input.disabled = false;

        result.innerHTML = `
            <b>Ready.</b>
            <p>${allEntities.length} entities loaded from MINERVA.</p>
        `;

    })
    .catch(function () {

        result.innerHTML = `
            <b>Could not load entities.</b>
        `;

    });
        // ===== STEP 3: SEARCH ENTITY =====
        input.oninput = function () {

    var searchText = this.value.trim().toLowerCase();

    if (searchText.length < 2) {

        result.innerHTML = `
            <b>Ready.</b>
            <p>Type at least 2 characters.</p>
        `;

        return;
    }


    var matches = allEntities.filter(function (entity) {

        return (entity.name || '')
            .toLowerCase()
            .indexOf(searchText) !== -1;

    });


    if (matches.length === 0) {

        result.innerHTML = `
            <b>No entity found.</b>
        `;

        return;
    }


    var selectedName = matches[0].name;


    var instances = allEntities.filter(function (entity) {

        return entity.name === selectedName;

    });


    var first = instances[0];

    var type =
        first._type ||
        first.type ||
        'N/A';

    var modelId =
        first.modelId ||
        first._modelId ||
        'N/A';

    var x =
        first.x !== undefined
            ? Math.round(first.x)
            : 'N/A';

    var y =
        first.y !== undefined
            ? Math.round(first.y)
            : 'N/A';


    result.innerHTML = `

        <div class="bio-name">
            ${selectedName}
        </div>

        <div class="bio-type">
            ${type}
        </div>

        <div class="bio-grid">

            <div class="bio-info">
                <small>MINERVA ID</small>
                <b>${first.id}</b>
            </div>

            <div class="bio-info">
                <small>MODEL ID</small>
                <b>${modelId}</b>
            </div>

            <div class="bio-info">
                <small>POSITION X</small>
                <b>${x}</b>
            </div>

            <div class="bio-info">
                <small>POSITION Y</small>
                <b>${y}</b>
            </div>

        </div>

        <div class="bio-count">
            Found in ${instances.length} location(s)
        </div>
    `;

};
    };

    if (typeof minervaDefine === 'function') {

        minervaDefine(function () {
            return new BioEntityExplorer();
        });

    }

}());
