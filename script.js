// Variables globales para la animación del texto
let rid = null;
const SVG_NS = "http://www.w3.org/2000/svg";
const shape = document.getElementById('shape');
const partialPath = document.getElementById('partialPath');
const theSvg = document.getElementById('theSvg');
const useThePath = document.getElementById('useThePath');

const pathlength = shape.getTotalLength();
let t = 0;
let lengthAtT = pathlength * t;
let d = shape.getAttribute("d");

// Construir array de subpaths
let n = d.match(/C/gi).length;
let pos = 0;
let subpaths = [];

class subPath {
    constructor(d) {
        this.d = d;
        this.get_PointsRy();
        this.previous = subpaths.length > 0 ? subpaths[subpaths.length - 1] : null;
        this.measurePath();
        this.get_M_Point();
        this.lastCubicBezier;
        this.get_lastCubicBezier();
    }

    get_PointsRy() {
        this.pointsRy = [];
        let temp = this.d.split(/[A-Z,a-z\s,]/).filter(v => v);
        temp.map(item => {
            this.pointsRy.push(parseFloat(item));
        });
    }

    measurePath() {
        let path = document.createElementNS(SVG_NS, "path");
        path.setAttributeNS(null, "d", this.d);
        this.pathLength = path.getTotalLength();
    }

    get_M_Point() {
        if (this.previous) {
            let p = this.previous.pointsRy;
            let l = p.length;
            this.M_point = [p[l - 2], p[l - 1]];
        } else {
            let p = this.pointsRy;
            this.M_point = [p[0], p[1]];
        }
    }

    get_lastCubicBezier() {
        let lastIndexOfC = this.d.lastIndexOf("C");
        let temp = this.d
            .substring(lastIndexOfC + 1)
            .split(/[\s,]/)
            .filter(v => v);
        let _temp = [];
        temp.map(item => {
            _temp.push(parseFloat(item));
        });
        this.lastCubicBezier = [this.M_point];
        for (let i = 0; i < _temp.length; i += 2) {
            this.lastCubicBezier.push(_temp.slice(i, i + 2));
        }
    }
}

// Crear subpaths
for (let i = 0; i < n; i++) {
    let newpos = d.indexOf("C", pos + 1);
    if (i > 0) {
        let sPath = new subPath(d.substring(0, newpos));
        subpaths.push(sPath);
    }
    pos = newpos;
}
subpaths.push(new subPath(d));

// Funciones auxiliares
function get_T(t, index) {
    let T;
    lengthAtT = pathlength * t;
    if (index > 0) {
        T = (lengthAtT - subpaths[index - 1].pathLength) / 
            (subpaths[index].pathLength - subpaths[index - 1].pathLength);
    } else {
        T = lengthAtT / subpaths[index].pathLength;
    }
    return T;
}

function getBezierPoints(t, points) {
    let helperPoints = [];
    for (let i = 1; i < 4; i++) {
        let p = lerp(points[i - 1], points[i], t);
        helperPoints.push(p);
    }
    helperPoints.push(lerp(helperPoints[0], helperPoints[1], t));
    helperPoints.push(lerp(helperPoints[1], helperPoints[2], t));
    helperPoints.push(lerp(helperPoints[3], helperPoints[4], t));
    let firstBezier = [
        points[0],
        helperPoints[0],
        helperPoints[3],
        helperPoints[5]
    ];
    return firstBezier;
}

function lerp(A, B, t) {
    return [
        (B[0] - A[0]) * t + A[0],
        (B[1] - A[1]) * t + A[1]
    ];
}

function drawCBezier(points, path, index) {
    let d;
    if (index > 0) {
        d = subpaths[index - 1].d;
    } else {
        d = `M${points[0][0]},${points[0][1]} C`;
    }
    for (let i = 1; i < 4; i++) {
        d += ` ${points[i][0]},${points[i][1]} `;
    }
    path.setAttributeNS(null, "d", d);
}

// Configurar valores iniciales
t = 0.025;

// Función Typing para animación
function Typing() {
    rid = window.requestAnimationFrame(Typing);
    if (t >= 1) {
        window.cancelAnimationFrame(rid);
        rid = null;
    } else {
        t += 0.0025;
    }

    lengthAtT = pathlength * t;
    let index;
    for (index = 0; index < subpaths.length; index++) {
        if (subpaths[index].pathLength >= lengthAtT) {
            break;
        }
    }
    let T = get_T(t, index);
    let newPoints = getBezierPoints(T, subpaths[index].lastCubicBezier);
    drawCBezier(newPoints, partialPath, index);
}

// Función para cambiar a la siguiente fase
function cambiarFase() {
    document.querySelector("#rose-t").style.display = "none";
    document.querySelector("#castle").style.display = "inherit";
    document.querySelector("#theSvg").style.display = "inherit";
    
    // NUEVO: Mostrar el título de la segunda fase
    document.querySelector("#titulo-segunda-fase").style.display = "block";
    
    rid = window.requestAnimationFrame(Typing);
}

// Transición automática después de 10 segundos
setTimeout(cambiarFase, 10000);

// Mostrar mensaje después de 11 segundos (1 segundo después de la transición)
setTimeout(() => {
    document.querySelector("#text-click").style.display = "inherit";
}, 11000);

// Crear partículas de polvo mágico
const head = document.getElementsByTagName('head')[0];
let animationId = 1;

function CreateMagicDust(x1, x2, y1, y2, sizeRatio, fallingTime, animationDelay, node = 'main') {
    let dust = document.createElement('span');
    let animation = document.createElement('style');
    animation.innerHTML = `
        @keyframes blink${animationId} {
            0% {
                top: ${y1}px;
                left: ${x1}px;
                width: ${2 * sizeRatio}px;
                height: ${2 * sizeRatio}px;
                opacity: .4
            }
            20% {
                width: ${4 * sizeRatio}px;
                height: ${4 * sizeRatio}px;
                opacity: .8
            }
            35% {
                width: ${2 * sizeRatio}px;
                height: ${2 * sizeRatio}px;
                opacity: .5
            }
            55% {
                width: ${3 * sizeRatio}px;
                height: ${3 * sizeRatio}px;
                opacity: .7
            }
            80% {
                width: ${sizeRatio}px;
                height: ${sizeRatio}px;
                opacity: .3
            }
            100% {
                top: ${y2}px;
                left: ${x2}px;
                width: 0px;
                height: 0px;
                opacity: .1
            }
        }`;
    head.appendChild(animation);
    dust.classList.add('dustDef');
    dust.setAttribute('style', `animation: blink${animationId++} ${fallingTime}s cubic-bezier(.71, .11, .68, .83) infinite ${animationDelay}s`);
    document.getElementById(node).appendChild(dust);
}

// Crear partículas
[
    [130, 132, 150, 152, .15, 2.5, .1, 'sub'],
    [65, 63, 300, 299, .5, 2, .2, 'sub'],
    [70, 70, 150, 150, .45, 2, .5],
    [75, 78, 160, 170, .6, 2, 1],
    [80, 82, 160, 180, .6, 1, .4],
    [85, 100, 160, 170, .5, 2, .5],
    [125, 110, 170, 180, .25, 3, 1.5],
    [90, 90, 115, 115, .4, 2, 2],
    [93, 95, 200, 200, .4, 3, 1.5],
    [100, 100, 145, 155, .45, 1, .5],
    [100, 90, 170, 230, .35, 2, .75],
    [100, 102, 115, 112, .35, 3, .25],
    [100, 95, 170, 200, .55, 1.5, .75],
    [100, 97, 150, 190, .7, 2, 1.5],
    [105, 100, 160, 180, .5, 1.5, .725],
    [125, 125, 180, 190, .25, 1, .725],
    [130, 130, 135, 135, .45, 3, 1.5],
    [135, 132, 170, 190, .25, 2.5, .75],
    [135, 132, 320, 315, .2, 5, .3, 'sub']
].forEach((o) => CreateMagicDust(...o));

// Animación de la rosa con anime.js
var leafOne = document.querySelector('.leafOne');
var stickLine = document.querySelector('.stickLine');
var leafTwo = document.querySelector('.leafTwo');
var leafS1 = document.querySelector('.leafS1');
var rose1 = document.querySelector('.rose1');
var rose2 = document.querySelector('.rose2');
var rose3 = document.querySelector('.rose3');
var rose4 = document.querySelector('.rose4');

var lineDrawing = anime({
    targets: [leafOne, stickLine, leafTwo, leafS1, rose1, rose2, rose3, rose4],
    strokeDashoffset: [anime.setDashoffset, 0],
    easing: 'easeInOutCubic',
    duration: 4000,
    begin: function(anim) {
        // Configurar stroke inicial
        leafOne.setAttribute("stroke", "black");
        leafOne.setAttribute("fill", "none");
        leafTwo.setAttribute("stroke", "black");
        leafTwo.setAttribute("fill", "none");
        stickLine.setAttribute("stroke", "black");
        stickLine.setAttribute("fill", "none");
        leafS1.setAttribute("stroke", "black");
        leafS1.setAttribute("fill", "none");
        rose1.setAttribute("stroke", "black");
        rose1.setAttribute("fill", "none");
        rose2.setAttribute("stroke", "black");
        rose2.setAttribute("fill", "none");
        rose3.setAttribute("stroke", "black");
        rose3.setAttribute("fill", "none");
        rose4.setAttribute("stroke", "black");
        rose4.setAttribute("fill", "none");
    },
    complete: function(anim) {
        // Aplicar colores finales
        leafOne.setAttribute("fill", "#9CDD05");
        leafOne.setAttribute("stroke", "none");
        leafTwo.setAttribute("fill", "#9CDD05");
        leafTwo.setAttribute("stroke", "none");
        stickLine.setAttribute("fill", "#83AA2E");
        stickLine.setAttribute("stroke", "none");
        leafS1.setAttribute("fill", "#9CDD05");
        leafS1.setAttribute("stroke", "none");
        rose1.setAttribute("fill", "#F37D79");
        rose1.setAttribute("stroke", "none");
        rose2.setAttribute("fill", "#D86666");
        rose2.setAttribute("stroke", "none");
        rose3.setAttribute("fill", "#F37D79");
        rose3.setAttribute("stroke", "none");
        rose4.setAttribute("fill", "#D86666");
        rose4.setAttribute("stroke", "none");
    },
    autoplay: true
});