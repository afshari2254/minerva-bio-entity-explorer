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
.bio-actions {
    display: flex;
    gap: 10px;
    margin-top: 15px;
}

.bio-btn {
    flex: 1;
    padding: 10px;
    border: none;
    border-radius: 7px;
    background: #1a237e;
    color: white;
    font-weight: bold;
    cursor: pointer;
}

.bio-copy {
    width: 100%;
    margin-top: 10px;
    padding: 10px;
    border: 2px solid #1a237e;
    border-radius: 7px;
    background: white;
    color: #1a237e;
    font-weight: bold;
    cursor: pointer;
}
.bio-external {
    margin-top: 15px;
    padding: 15px;
    background: #eef3ff;
    border-left: 5px solid #1a237e;
    border-radius: 7px;
    font-size: 12px;
    line-height: 1.7;
}

.bio-external-title {
    color: #1a237e;
    font-weight: bold;
    font-size: 15px;
    margin-bottom: 8px;
}
.pubmed-article {
    margin-top: 10px;
    padding: 12px;
    background: white;
    border: 1px solid #d1d9e6;
    border-radius: 7px;
}

.pubmed-title {
    color: #1a237e;
    font-weight: bold;
    font-size: 12px;
    margin-bottom: 6px;
}

.pubmed-meta {
    font-size: 10px;
    color: #666;
    line-height: 1.6;
}

.pubmed-open {
    margin-top: 8px;
    padding: 6px 10px;
    border: none;
    border-radius: 5px;
    background: #1a237e;
    color: white;
    cursor: pointer;
    font-size: 10px;
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
                     list="entitySuggestions"
                    placeholder="Search entity, for example TNF..."
                >
<datalist id="entitySuggestions"></datalist>
                <div id="bioResult" class="bio-card">
                    <b>Ready.</b>
                    <p>Search for a biological entity.</p>
                </div>

            </div>
        `;
         // ===== STEP 2: LOAD ENTITIES FROM MINERVA =====
var allEntities = [];
var modelDict = {};
var input = container.querySelector('#bioSearch');
var result = container.querySelector('#bioResult');
        var suggestionList =
    container.querySelector('#entitySuggestions');

input.disabled = true;

result.innerHTML = `
    <b>Loading entities...</b>
`;

Promise.all([
    minervaProxy.project.data.getAllBioEntities(),
    minervaProxy.project.data.getModels()
])
.then(function (results) {

    allEntities = results[0];
    var seenNames = new Set();

allEntities.forEach(function (entity) {

    var name = entity.name || '';

    if (name && !seenNames.has(name)) {

        seenNames.add(name);

        var option =
            document.createElement('option');

        option.value = name;

        option.label =
            entity._type ||
            entity.type ||
            '';

        suggestionList.appendChild(option);
    }

});

    results[1].forEach(function (model) {

        var id = String(
            model.id ||
            model._id ||
            model.modelId
        );

        modelDict[id] =
            model.name ||
            model._name ||
            ('Map ' + id);
    });

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

var locationOptions = '';

instances.forEach(function (entity, index) {

    var id = String(
        entity.modelId ||
        entity._modelId
    );

    var mapName =
        modelDict[id] ||
        ('Map ' + id);

    locationOptions +=
        '<option value="' + index + '">' +
        mapName +
        '</option>';
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
               <b id="bioMinervaId">${first.id}</b>
            </div>

            <div class="bio-info">
                <small>MODEL ID</small>
                <b id="bioModelId">${modelId}</b>
            </div>

            <div class="bio-info">
                <small>POSITION X</small>
               <b id="bioX">${x}</b>
            </div>

            <div class="bio-info">
                <small>POSITION Y</small>
               <b id="bioY">${y}</b>
            </div>

        </div>

        <div class="bio-count">
             ${instances.length} instance(s) found in the MINERVA project
        </div>
        <div style="margin-top:15px;">

    <small style="color:#777;">
        SELECT LOCATION
    </small>

    <select id="bioLocation"
        style="
            width:100%;
            padding:10px;
            margin-top:5px;
            border:2px solid #1a237e;
            border-radius:7px;
            background:white;
        ">

        ${locationOptions}

    </select>

</div>
<div class="bio-actions">

    <button id="bioUniProt" class="bio-btn">
        UniProt
    </button>

    <button id="bioPubMed" class="bio-btn">
        PubMed
    </button>

</div>

<div id="bioExternalInfo"></div>
<div id="bioPubMedInfo"></div>
<button id="bioCopy" class="bio-copy">
    Copy Entity Information
</button>
    `;
            var locationSelect =
    container.querySelector('#bioLocation');

locationSelect.onchange = function () {

    var selected =
        instances[parseInt(this.value)];

    var selectedModelId =
        selected.modelId ||
        selected._modelId ||
        'N/A';

    container.querySelector('#bioMinervaId')
        .textContent = selected.id;

    container.querySelector('#bioModelId')
        .textContent = selectedModelId;

    container.querySelector('#bioX')
        .textContent =
            selected.x !== undefined
                ? Math.round(selected.x)
                : 'N/A';

    container.querySelector('#bioY')
        .textContent =
            selected.y !== undefined
                ? Math.round(selected.y)
                : 'N/A';
};
       container.querySelector('#bioUniProt').onclick = function () {

    var externalInfo =
        container.querySelector('#bioExternalInfo');
           if (String(type).toLowerCase() !== 'protein') {

    externalInfo.innerHTML = `
        <div class="bio-external">

            <div class="bio-external-title">
                UniProt
            </div>

            UniProt information is available for
            <b>protein entities only.</b>

            <br><br>

            <b>Current entity type:</b> ${type}

        </div>
    `;

    return;
}

    externalInfo.innerHTML = `
        <div class="bio-external">
            Loading UniProt information...
        </div>
    `;

   var query =
    'gene_exact:' + selectedName +
    ' AND organism_name:"Homo sapiens"' +
    ' AND reviewed:true';

var apiUrl =
    'https://rest.uniprot.org/uniprotkb/search?query=' +
    encodeURIComponent(query) +
    '&format=tsv' +
    '&fields=accession,protein_name,gene_primary,organism_name,length' +
    '&size=1';

    fetch(apiUrl)

        .then(function (response) {

            if (!response.ok) {
                throw new Error('UniProt request failed');
            }

            return response.text();
        })

        .then(function (text) {

            var lines = text.trim().split('\n');

            if (lines.length < 2) {

                externalInfo.innerHTML = `
                    <div class="bio-external">
                        No UniProt information found.
                    </div>
                `;

                return;
            }

            var values = lines[1].split('\t');

            var accession = values[0] || 'N/A';
            var proteinName = values[1] || 'N/A';
            var gene = values[2] || 'N/A';
            var organism = values[3] || 'N/A';
            var length = values[4] || 'N/A';

            externalInfo.innerHTML = `

                <div class="bio-external">

                    <div class="bio-external-title">
                        UniProt Information
                    </div>

                    <b>Accession:</b>
                    ${accession}
                    <br>

                    <b>Protein:</b>
                    ${proteinName}
                    <br>

                    <b>Gene:</b>
                    ${gene}
                    <br>

                    <b>Organism:</b>
                    ${organism}
                    <br>

                    <b>Sequence Length:</b>
                    ${length}

                </div>
            `;

        })

        .catch(function () {

            externalInfo.innerHTML = `
                <div class="bio-external">
                    Could not load UniProt information.
                </div>
            `;

        });

};
           container.querySelector('#bioPubMed').onclick = function () {

    var pubmedInfo =
        container.querySelector('#bioPubMedInfo');

    pubmedInfo.innerHTML = `
        <div class="bio-external">
            Loading PubMed articles...
        </div>
    `;

    var ncbiBase =
        'https://' +
        'eutils.ncbi.nlm.nih.gov/entrez/eutils/';

    var searchTerm =
        selectedName + '[Title/Abstract]';

    var searchUrl =
        ncbiBase +
        'esearch.fcgi?db=pubmed' +
        '&term=' + encodeURIComponent(searchTerm) +
        '&retmode=json' +
        '&retmax=5' +
        '&sort=relevance';

    fetch(searchUrl)

        .then(function (response) {

            if (!response.ok) {
                throw new Error('PubMed search failed');
            }

            return response.json();
        })

        .then(function (searchData) {

            var ids =
                searchData.esearchresult.idlist;

            if (!ids || ids.length === 0) {

                pubmedInfo.innerHTML = `
                    <div class="bio-external">
                        No PubMed articles found.
                    </div>
                `;

                return null;
            }

            var summaryUrl =
                ncbiBase +
                'esummary.fcgi?db=pubmed' +
                '&id=' + ids.join(',') +
                '&retmode=json';

            return fetch(summaryUrl);
        })

        .then(function (response) {

            if (!response) {
                return null;
            }

            if (!response.ok) {
                throw new Error('PubMed summary failed');
            }

            return response.json();
        })

        .then(function (summaryData) {

            if (!summaryData) {
                return;
            }

            var ids = summaryData.result.uids;

            var html = `
                <div class="bio-external">

                    <div class="bio-external-title">
    Top 5 Relevant PubMed Articles
</div>
            `;

            ids.forEach(function (pmid, index) {

                var article =
                    summaryData.result[pmid];

                var title =
                    article.title || 'No title';

                var journal =
                    article.fulljournalname ||
                    article.source ||
                    'N/A';

                var date =
                    article.pubdate ||
                    'N/A';

                html += `
                    <div class="pubmed-article">

                        <div class="pubmed-title">
                            ${index + 1}. ${title}
                        </div>

                        <div class="pubmed-meta">
                            <b>Journal:</b> ${journal}
                            <br>
                            <b>Published:</b> ${date}
                            <br>
                            <b>PMID:</b> ${pmid}
                        </div>

                        <button
                            class="pubmed-open"
                            data-pmid="${pmid}">
                            Open in PubMed
                        </button>

                    </div>
                `;
            });

            html += `</div>`;

            pubmedInfo.innerHTML = html;


            pubmedInfo
                .querySelectorAll('.pubmed-open')
                .forEach(function (button) {

                    button.onclick = function () {

                        var pmid =
                            this.getAttribute('data-pmid');

                        window.open(
                            'https://' +
                            'pubmed.ncbi.nlm.nih.gov/' +
                            pmid +
                            '/'
                        );

                    };
                });

        })

        .catch(function () {

            pubmedInfo.innerHTML = `
                <div class="bio-external">
                    Could not load PubMed articles.
                </div>
            `;

        });

};
            container.querySelector('#bioCopy').onclick = function () {

    var selectedIndex =
        parseInt(locationSelect.value);

    var selected =
        instances[selectedIndex];

    var selectedModelId =
        selected.modelId ||
        selected._modelId ||
        'N/A';

    var selectedX =
        selected.x !== undefined
            ? Math.round(selected.x)
            : 'N/A';

    var selectedY =
        selected.y !== undefined
            ? Math.round(selected.y)
            : 'N/A';

    var info =
        'Name: ' + selectedName + '\n' +
        'Type: ' + type + '\n' +
        'MINERVA ID: ' + selected.id + '\n' +
        'Model ID: ' + selectedModelId + '\n' +
        'Position X: ' + selectedX + '\n' +
        'Position Y: ' + selectedY + '\n' +
        'Occurrences: ' + instances.length;

    var temp =
        document.createElement('textarea');

    temp.value = info;

    document.body.appendChild(temp);

    temp.select();

    document.execCommand('copy');

    document.body.removeChild(temp);

    this.innerHTML = '✓ Copied!';

};

};
    };

    if (typeof minervaDefine === 'function') {

        minervaDefine(function () {
            return new BioEntityExplorer();
        });

    }

}());
