var openvoxel = window.openvoxel;

function createInstance() {
    openvoxel.createInstance();
}

function runInstance(id) {
    openvoxel.runInstance(id);

    openvoxel.oninstancedetails(id, (_event, details) => {
        if (details == 'RESET') {
            openvoxel.removeinstancedetails(id);
            document.getElementById(id).innerText = document.getElementById(id).dataset.description;
        }
        else document.getElementById(id).innerText = details;
    });
};

const ALLINSTANCES = document.querySelectorAll('.INSTANCEEL');
function searchInstance(query) {
    ALLINSTANCES.forEach(e => {
        let inpt = e.querySelector('div > input');
        let val = inpt.value || inpt.placeholder;

        if (!val.toLowerCase().includes(query.toLowerCase())) e.hidden = true;
        else e.hidden = false;
    })
}

async function deleteInstance(id) {
    let toDelete = await openvoxel.deleteInstance(id);

    if (toDelete) openvoxel.forceRefresh();
};

async function installMoreMods(id) {
    let refresh = await openvoxel.installMoreMods(id);

    if (refresh) openvoxel.forceRefresh();
};