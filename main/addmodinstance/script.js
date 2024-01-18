var openvoxeladdmod = window.openvoxeladdmod;

document.onkeydown = (key) => {
    if (key.key == 'Enter' || key.key == 'Escape') document.getElementById('SEARCHMODS').blur();
}

var TOINSTALL = [];
function toggleChecked(el) {
    if (TOINSTALL.includes(el.dataset.id)) {
        TOINSTALL = TOINSTALL.filter(e => e != el.dataset.id);
        el.src = '../global/img/icons/download-full.png';
    } else {
        TOINSTALL.push(el.dataset.id);
        el.src = '../global/img/icons/check-full.png';
    };

    document.getElementById('installtxt').innerText = `Install${TOINSTALL.length > 0 ? ` ${TOINSTALL.length} Mods` : ''}`;
}

var MODLIST = document.getElementById('MODLIST');
var PREVIOUS = "";
async function search(query) {
    if (PREVIOUS == query || query.replace(/ /g, '') == '') return;
    PREVIOUS = query;

    MODLIST.innerHTML = '';
    let results = await openvoxeladdmod.search(query)

    results.forEach((mod, i) => {
        let Emod = document.createElement('div');
        Emod.classList.add('mod');
        Emod.style.top = `${i * 115}px`;

        let Eoverlap = document.createElement('div');
        Eoverlap.classList.add('overlap-group');

        let Ep = document.createElement('p');
        Ep.classList.add('description');
        Ep.innerText = mod.description;
        Eoverlap.appendChild(Ep);

        let En = document.createElement('div');
        En.classList.add('name');
        En.innerText = mod.name;
        Eoverlap.appendChild(En);

        let EI = document.createElement('img');
        EI.classList.add('icon');
        EI.src = mod.icon || '../global/img/icons/question-full.png';
        Eoverlap.appendChild(EI);

        let ED = document.createElement('img');
        ED.classList.add('install', 'pointer');
        ED.src = "../global/img/icons/download-full.png";
        ED.dataset.id = mod.id;
        ED.onclick = function () { toggleChecked(this) };
        Eoverlap.appendChild(ED);

        Emod.appendChild(Eoverlap);
        MODLIST.appendChild(Emod);
    });

    if (results.length == 0) {
        let Emod = document.createElement('div');
        Emod.classList.add('mod');

        let Eoverlap = document.createElement('div');
        Eoverlap.classList.add('overlap-group');

        let Ep = document.createElement('p');
        Ep.classList.add('description');
        Ep.innerText = 'Try searching for more generic terms or try removing keywords';
        Eoverlap.appendChild(Ep);

        let En = document.createElement('div');
        En.classList.add('name');
        En.innerText = 'No mod found with these keywords';
        Eoverlap.appendChild(En);

        let EI = document.createElement('img');
        EI.classList.add('icon');
        EI.src = '../global/img/icons/question-full.png';
        Eoverlap.appendChild(EI);

        Emod.appendChild(Eoverlap);
        MODLIST.appendChild(Emod);
    }
};

function INSTALL() {
    openvoxeladdmod.close(TOINSTALL);
}