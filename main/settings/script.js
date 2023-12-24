var openvoxel = window.openvoxel;
let TOGGLESETTINGS = document.querySelectorAll('.TOGGLESETTING');

TOGGLESETTINGS.forEach(tgglset => {
    tgglset.onchange = async () => {
        let result = await openvoxel.setSetting(tgglset.dataset.setting, tgglset.checked);
        if (result !== true) {
            tgglset.checked = openvoxel.defaultSettings[tgglset.dataset.setting];
            alert(result);
        }
    };
});


let INPUTSETTINGS = document.querySelectorAll('.INPUTSETTING');

INPUTSETTINGS.forEach(set => {
    set.onblur = async () => {
        let result = await openvoxel.setSetting(set.dataset.setting, parseInt(set.value));
        if (result !== true) {
            set.value = openvoxel.defaultSettings[set.dataset.setting];
            alert(result);
        }
    };
});


document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.key === 'Escape') {
        document.activeElement?.blur();
    }
});

document.getElementById('OPENLOGS').onclick = () => openvoxel.openLogs();
document.getElementById('OPENGAMEFOLDER').onclick = () => openvoxel.openGameFolder();