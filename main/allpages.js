const HEADAPI = "https://visage.surgeplay.com/bust/320";
var openvoxel = window.openvoxel;


openvoxel.ongamelaunchdetails((_event, details) => {
    if (document.getElementById('PLAYSUBTEXT')) document.getElementById('PLAYSUBTEXT').innerText = details;
});

const toDataURL = url => fetch(url)
    .then(response => response.blob())
    .then(blob => new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
    }));


Array.from(document.querySelectorAll('.CLOSEAPP')).forEach(function (element) {
    element.addEventListener('click', () => {
        // Do stuff before close

        // Close app
        openvoxel.closeApp();
    });
});


const LOGIN = document.getElementById('LOGIN');
LOGIN?.addEventListener('click', async () => {
    if (LOGIN.dataset.enabled == "false") return;
    LOGIN.dataset.enabled = "false";
    LOGIN.style.cursor = "progress";
    document.getElementById('LOGINTEXT').innerText = "Opened";

    let result = await openvoxel.login();

    if (result) {
        // Logged in
        location.href = "../home/index.ejs"
    }

    else {
        // Failed
        LOGIN.dataset.enabled = "true";
        LOGIN.style.cursor = "pointer";
        document.getElementById('LOGINTEXT').innerText = "Sign In";
    }
});


document.getElementById('LOGOUT')?.addEventListener('click', async () => await openvoxel.logout());


let URLNEEDED = document.querySelectorAll('.OPENURLDEFAULTBROWSER');
for (let url of URLNEEDED) {
    url.style.cursor = "pointer";
    url.onclick = () => {
        if (String(url.dataset?.url) != "undefined") openvoxel.openExternal(url.dataset.url);
    }
};

const NAVIGATETO = document.querySelectorAll('.NAVIGATETO');
for (let navig of NAVIGATETO) {
    navig.style.cursor = "pointer";
    navig.onclick = () => location.href = `../${navig.dataset.to}/index.ejs`;
}

// Game icon redirects
function doIconRedirect(element, gameID) {
    element.classList.add('clickable', 'pointer')
    element.onclick = () => location.href = '../home/index.ejs?game=' + gameID;
};

document.querySelector('.header-game-list')?.childNodes?.forEach(e => {
    if (e?.dataset?.game) doIconRedirect(e, e?.dataset?.game)
})






















// Pinardo Was Here!
const pinardo = document.createElement('div');
pinardo.id = 'pinardo';
document.body.appendChild(pinardo);
let lastPinardoText = [];

// Awesome S0fl!
const S0FL = document.getElementById('AWESOME');
let lastAwesomeText = [];

// ChoosingBerry!
const BERRY = document.getElementById('AWESOME');
let lastBerryText = [];

// Sammy3D!
const s3D = document.createElement('img');
s3D.id = 's3d';
s3D.src = '../global/img/S3D.png';
s3D.style.visibility = 'hidden';
document.body.appendChild(s3D);
let lastS3DText = [];

function pinardize() {
    function pinardatomize(element) {
        if (!element?.style) return;
        if (element.src) element.src = "../global/img/pinardo.png"
        else {
            element.style.backgroundImage = "url('../global/img/pinardo.png')";
            element.style.backgroundSize = 'cover';
            element.style.backgroundPosition = 'center';
        }
    };

    document.querySelectorAll('img').forEach(pinardatomize);
    document.querySelectorAll('*').forEach((el) => {
        if (el.style.backgroundImage) pinardatomize(el)
    });
    pinardatomize(document.querySelector('.logo'));
    pinardatomize(document.querySelector('.header-icons'));
    pinardatomize(document.querySelector('.play'));
    document.querySelector('.header-game-list').childNodes.forEach(pinardatomize)
};
pinardo.onclick = pinardize;

document.onkeydown = (event) => {
    if (['Shift', 'Alt'].includes(event.key)) return;

    if (event.key !== lastPinardoText[lastPinardoText.length - 1] && !pinardo.classList.contains('pinardoenabled')) {
        lastPinardoText.push(event.key);

        if (!"pinardo".startsWith(lastPinardoText.join('').toLowerCase())) lastPinardoText = [];
        if (lastPinardoText.join('').toLowerCase() == 'pinardo') {
            console.log('Pinardo Was Here!');
            pinardo.classList.add('pinardoenabled');
            document.body.style.cursor = 'none';

            setTimeout(() => {
                pinardo.classList.remove('pinardoenabled');
                document.body.style.cursor = 'auto';
            }, 2222);
            lastPinardoText = [];
        };
    }

    if (event.key !== lastS3DText[lastS3DText.length - 1]) {
        lastS3DText.push(event.key);

        if (!"s3d".startsWith(lastS3DText.join('').toLowerCase())) lastS3DText = [];
        if (lastS3DText.join('').toLowerCase() == 's3d') {
            console.log('Sammy3D!');

            document.getElementById('S3DAUDIO').play();
            s3D.style.visibility = 'visible';

            setTimeout(() => {
                s3D.style.visibility = 'hidden';
            }, 1524);
            lastS3DText = [];
        };
    }

    if (S0FL && event.key !== lastAwesomeText[lastAwesomeText.length - 1]) {
        lastAwesomeText.push(event.key);

        if (!"awesome".startsWith(lastAwesomeText.join('').toLowerCase())) lastAwesomeText = [];
        if (lastAwesomeText.join('').toLowerCase() == 'awesome') {
            console.log('Awesome S0FL!');
            lastAwesomeText = [];

            S0FL.classList.toggle('awesomeenabled');
        };
    }

    if (event.key !== lastBerryText[lastBerryText.length - 1] && lastBerryText != -1) {
        lastBerryText.push(event.key);

        if (!"bery".startsWith(lastBerryText.join('').toLowerCase())) lastBerryText = [];
        if (lastBerryText.join('').toLowerCase() == 'bery') {
            console.log('ChoosingBerry!');
            lastBerryText = -1;

            var video = document.createElement("img");
            video.src = 'https://www.zygocraft.com/openvoxel/berry.gif';
            video.width = '100%';
            video.height = '100%';
            video.id = 'fullytopvideo';

            document.body.appendChild(video);
            video.style.visibility = 'hidden';

            video.onload = function() {
                video.style.visibility = 'visible';
    
                setTimeout(() => video.remove(), 4500);
            }
        };
    }
};

function shake(value) { document.querySelectorAll('*').forEach(e => e.classList[value ? "add" : "remove"]('shaking')) };
openvoxel.onCMANIFStuff(shake);
openvoxel.getCMANIFStuff().then(shake);