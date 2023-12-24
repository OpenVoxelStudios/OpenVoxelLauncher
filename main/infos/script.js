var openvoxel = window.openvoxel;

let licenses = document.querySelectorAll('.openLicense');

licenses.forEach(l => {
    l.classList.add('pointer');
    l.onclick = () => openvoxel.openLicense(l.dataset.license);
})