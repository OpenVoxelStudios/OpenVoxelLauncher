document.onreadystatechange = function (e) {
    if (document.readyState === 'complete') {

    }
};

window.onload = () => {
    const SKIN3D = document.getElementById('GETSKIN3D');
    if (localStorage.getItem('skin3D-moved') == 'true') {
        SKIN3D.classList.add('dont-move');
    } else {
        SKIN3D.classList.add('move-up');
        localStorage.setItem('skin3D-moved', 'true');
    }

    console.log('Loaded!');
}