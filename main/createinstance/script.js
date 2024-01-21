var openvoxel = window.openvoxelinstance;

var INSTANCE = {
    id: crypto.randomUUID(),
    icon: undefined,
    name: undefined,
    version: undefined,
    modloader: undefined,
    modloaderversion: undefined,
    issnapshot: false,
};

var PAGES = {
    name: document.getElementById('PAGE-NAME'),
    v: document.getElementById('PAGE-V'),
    loader: document.getElementById('PAGE-LOADER'),
    finish: document.getElementById('PAGE-FINISH'),
};

hide(PAGES.v);
hide(PAGES.loader);
hide(PAGES.finish);

var addfabricEl = document.getElementById('addfabric');
// var addforgeEl = document.getElementById('addforge');

function hide(el) { el.style.visibility = 'hidden' };
function show(el) { el.style.visibility = 'visible' };
function hideShow(hid, sho) { hide(hid); show(sho) };

async function close() { await openvoxel.close() };

async function changeIcon() {
    let got = await openvoxel.setIcon();
    if (!got) return;
    document.getElementById('ICON').src = got;
}

function afterName() {
    INSTANCE.name = document.getElementById('NAME').value;
    hideShow(PAGES.name, PAGES.v);
};

function addFabric() {
    if (addfabricEl.dataset.enabled == "true") {
        INSTANCE.modloader = undefined;
        addfabricEl.dataset.enabled = "false"
    }
    else {
        INSTANCE.modloader = 'Fabric';
        addfabricEl.dataset.enabled = "true";
        // addforgeEl.dataset.enabled = "false";
    }
};

function showSnapshots(el) {
    el.dataset.enabled = (el.dataset.enabled == 'true') ? 'false' : 'true';

    document.querySelectorAll('[data-issnapshot="true"]')
        .forEach(e => e.hidden = (el.dataset.enabled == 'false'));
}

/* function addForge() {
    if (addforgeEl.dataset.enabled == "true") {
        addforgeEl.dataset.enabled = "false"
        INSTANCE.modloader = undefined;
    }
    else {
        INSTANCE.modloader = 'Forge';
        addforgeEl.dataset.enabled = "true";
        addfabricEl.dataset.enabled = "false";
    }
}; */

function prepareFinish() {
    document.getElementById('recap').innerHTML = `Minecraft ${INSTANCE.version}<br />${INSTANCE.modloader ? `with ${INSTANCE.modloader} v${INSTANCE.modloaderversion}` : ''}`;
    document.getElementById('ICON').style.visibility = 'visible';
}

async function afterVersion() {
    INSTANCE.version = document.getElementById('V').value;
    INSTANCE.issnapshot = document.getElementById('V').dataset.issnapshot == 'true';

    if (INSTANCE.modloader) {
        let lodr = document.getElementById('LOADER');
        lodr.innerHTML = '';

        if (INSTANCE.modloader == 'Fabric') {
            let got = (await (await fetch('https://meta.fabricmc.net/v2/versions/loader/' + INSTANCE.version)).json()).map(l => l.loader.version);
            got.forEach(e => {
                let el = document.createElement('option');
                el.innerText = e;
                lodr.appendChild(el);
            });
        }


        document.getElementById('loadrtxt').innerText = `Choose a ${INSTANCE.modloader} version`;
    } else {
        prepareFinish();
    }

    hideShow(PAGES.v, INSTANCE.modloader ? PAGES.loader : PAGES.finish);
};

function afterModloader() {
    INSTANCE.modloaderversion = document.getElementById('LOADER').value;
    if (!INSTANCE.modloaderversion) INSTANCE.modloader = undefined;

    prepareFinish();
    hideShow(PAGES.loader, PAGES.finish);
};

function finishBack() {
    if (INSTANCE.modloader) hideShow(PAGES.finish, PAGES.loader)
    else hideShow(PAGES.finish, PAGES.v)
};

async function finish() {
    INSTANCE.icon = document.getElementById('ICON').src;
    await openvoxel.create(INSTANCE);
    await openvoxel.forceRefresh();
    await close();
};

function checkNameInput(el) {
    if (el.value == "") {
        document.getElementById('afterNameClick').onclick = null;
        document.getElementById('afterNameClick').classList.add('disabled');
        document.getElementById('afterNameClick').classList.remove('pointer');
    } else {
        document.getElementById('afterNameClick').onclick = afterName;
        document.getElementById('afterNameClick').classList.remove('disabled');
        document.getElementById('afterNameClick').classList.add('pointer');
    }
};

function checkVersionInput() {
    document.getElementById('afterVersionClick').onclick = afterVersion;
    document.getElementById('afterVersionClick').classList.remove('disabled');
    document.getElementById('afterVersionClick').classList.add('pointer');
}

function checkLoaderInput() {
    document.getElementById('afterLoaderClick').onclick = afterModloader;
    document.getElementById('afterLoaderClick').classList.remove('disabled');
    document.getElementById('afterLoaderClick').classList.add('pointer');
}