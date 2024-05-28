window.onload = () => {
    const SKIN3D = document.getElementById('GETSKIN3D');
    SKIN3D.classList.add('move-up');
    localStorage.setItem('skin3D-moved', 'true');

    console.log('Loaded!');
}