var openvoxel = window.openvoxel;

function createInstance() {
    openvoxel.createInstance();
}

function runInstance(id, el) {
    openvoxel.runInstance(id);

    openvoxel.oninstancedetails(id, (_event, details) => {
        if (details == 'RESET') {
            openvoxel.removeinstancedetails(id);
            document.getElementById(id).innerText = document.getElementById(id).dataset.description;
        }
        else document.getElementById(id).innerText = details;
    });
};