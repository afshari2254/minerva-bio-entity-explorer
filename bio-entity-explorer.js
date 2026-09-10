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
    };

    if (typeof minervaDefine === 'function') {

        minervaDefine(function () {
            return new BioEntityExplorer();
        });

    }

}());
