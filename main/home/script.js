var openvoxel = window.openvoxel;

function updateGame(pretext = 'Launch') {
    const GAME = new URLSearchParams(location.search).get('game');

    if (GAME) {
        document.getElementById('PLAYBG').style.backgroundImage = ` url(../global/img/games/${GAME}-bg.png)`;
        document.getElementById('PLAYBTN').dataset.game = GAME;

        openvoxel.launcher_gameinfo(GAME)?.then(infos => {
            if (infos.split('').length > 18) infos = infos.slice(0, 18) + '...'
            document.getElementById('PLAYTEXT').innerText = pretext + ' ' + infos;
        })
    }
};

updateGame();


const PLAYBTN = document.getElementById('PLAYBTN');
function disablePlayBtn() {
    PLAYBTN.dataset.enabled = "false";
    document.querySelector('.buttons-play').classList.add('playdisabled');
    PLAYBTN.style.cursor = "progress";
    PLAYBTN.style.cursor = "not-allowed";
};
function enablePlayBtn() {
    PLAYBTN.dataset.enabled = "true";
    document.querySelector('.buttons-play').classList.remove('playdisabled');
    PLAYBTN.style.cursor = "pointer";
    updateGame();
};

if (PLAYBTN) {
    PLAYBTN.onclick = async () => {
        if (PLAYBTN.dataset.enabled == "false") return;

        // Play Easter Egg
        if (Math.round(Math.random() * 1000) == 0) document.getElementById('playaudio').play();
        // End Play Easter Egg

        disablePlayBtn()

        let gamename = PLAYBTN.dataset.game;

        let result = await openvoxel.launchgame(gamename);

        if (result != true) alert(result);
        enablePlayBtn();
        updateGame();
    }
};

disablePlayBtn();
openvoxel.isGameLaunched().then(result => {
    if (result.is == true) {
        updateGame('Playing');
    } else {
        enablePlayBtn();
        updateGame();
    }
});


// Get latest news
fetch(`https://www.zygocraft.com/openvoxel/news.json`)
    .then(res => res.json())
    .then(newsList => {
        console.log('Got news!');

        document.querySelectorAll('.GETNEWS').forEach(n => {
            let news = newsList?.[n.dataset.newsindex];
            if (news) {
                n.src = news.image;
                n.onclick = () => openvoxel.openExternal(news.url);
            };
        });
    });


let ArtkiliouPT = 0;
document.getElementById('ArtkiliouPT').addEventListener('click', () => {
    ArtkiliouPT++;
    if (ArtkiliouPT == 4) {
        console.log('Artkiliou!');
        document.getElementById('ArtkiliouPT').dataset.url = undefined;

        var video = document.createElement("video");
        video.src = 'https://www.zygocraft.com/openvoxel/artkiliou.mp4';
        video.preload = "auto";
        video.controls = false;
        video.autoplay = true;
        video.width = '100%';
        video.height = '100%';
        video.id = 'fullytopvideo';

        video.style.visibility = 'hidden';
        document.body.appendChild(video);
        video.load();

        video.addEventListener('loadeddata', () => {
            video.style.visibility = 'visible';

            video.addEventListener('ended', () => openvoxel.closeApp(), false);
        }, false)
    }
});

const STEVELOCKSHOVER = document.getElementById('STEVELOCKSHOVER');
var STEVELOCKSTIME;
function stevelocks(doWhat) {
    if (doWhat == 'enable') {
        console.log('Stevelocks!')
        document.getElementById('stevelocksaudio').play();
        document.getElementById('STEVELOCKSROTATE').classList.add('STEVELOCKSHOVERED');
    }
    else {
        STEVELOCKSTIME = 0;
        document.getElementById('stevelocksaudio').pause();
        document.getElementById('STEVELOCKSROTATE').classList.remove('STEVELOCKSHOVERED');
    }
};
STEVELOCKSHOVER.onmouseenter = () => {
    STEVELOCKSTIME = Date.now();
    setTimeout(() => { if (Date.now() - STEVELOCKSTIME >= 5000) stevelocks('enable') }, 5000)
};
STEVELOCKSHOVER.onmouseleave = () => stevelocks();