const devicePixelRatio = window.devicePixelRatio || 1;
let [windowWidth, windowHeight] = [
    window.innerWidth * devicePixelRatio,
    window.innerHeight * devicePixelRatio,
];

const [ canvas, ctx ] = initCanvas(undefined, windowWidth, windowHeight);
let activeScreen = {};

const bd = {
    level_1: false,
    level_2: false,
    level_3: false,
    level_4: false,
    level_5: false
}

const fonts = {
    title: {
        font: "Back to 1982",
        size: function() {
            return canvas.width * 0.08;
        }
    },

    sub_title: {
        font: "Invasion 2000",
        size: function() {
            return canvas.width * 0.03;
        }
    },

    text: {
        font: 'Arcade Classic',
        size: function() {
            return canvas.width * 0.03;
        }
    },

    normal_text: {
        font: 'Verdana',
        size: function() {
            return canvas.width * 0.02;
        }
    },

    small_text: {
        font: 'Verdana',
        size: function() {
            return canvas.width * 0.01;
        }
    }
};

const colorSchema = {
    azul: {
        normal: "rgb(0, 0, 127)",
        hover: "rgb(30, 30, 160)",
        pressed: "rgb(0, 0, 100)"
    },

    branco: {
        normal: "rgb(255, 255, 255)",
        hover: "rgb(235, 235, 235)",
        pressed: "rgb(220, 220, 220)"
    },

    branco_hover: {
        normal: "rgba(0, 0, 0, 0)",
        hover: "rgba(255, 255, 255, 0.3)",
        pressed: "rgba(0, 0, 0, 0.4)"
    },

    cinza: {
        normal: "rgb(70, 70, 70)",
        hover: "rgb(90, 90, 90)",
        pressed: "rgb(50, 50, 50)"
    },

    preto: {
        normal: "rgb(0, 0, 0)",
        hover: "rgb(30, 30, 30)",
        pressed: "rgb(20, 20, 20)"
    },

    "preto-t40": {
        normal: "rgba(0, 0, 0, 0.4)",
        hover: "rgba(0, 0, 0, 0.4)",
        pressed: "rgba(0, 0, 0, 0.4)"
    },

    vermelho: {
        normal: "rgb(127, 0, 0)",
        hover: "rgb(160, 30, 30)",
        pressed: "rgb(100, 0, 0)"
    },

    verde: {
        normal: "rgb(0, 127, 0)",
        hover: "rgb(30, 160, 30)",
        pressed: "rgb(0, 100, 0)"
    }
}

const textAlign = {
    horizontal: {
        left: "start",
        center: "center",
        right: "end"
    },

    vertical: {
        top: "bottom",
        center: "middle",
        bottom: "top",
        alphabetic: "alphabetic",
        ideographic: "ideographic"
    }
}

function initCanvas(container = undefined, width = 300, height = 150) {
    const canvasContainer = {};
    canvasContainer.canvas = document.createElement('canvas');
    canvasContainer.ctx = canvasContainer.canvas.getContext('2d');
    canvasContainer.canvas.width = width;
    canvasContainer.canvas.height = height;

    canvasContainer.ctx.fillCircle = function (x, y, radius, color) {
        this.fillStyle = color;
        this.beginPath();
        this.moveTo(x, y);
        this.arc(x, y, radius, 0, Math.PI * 2, false);
        this.fill();
        this.closePath();
    };

    canvasContainer.ctx.strokeCircle = function(x, y, radius, color) {
        this.fillStyle = color;
        this.beginPath();
        this.moveTo(x, y);
        this.arc(x, y, radius, 0, Math.PI * 2, false);
        this.stroke();
        this.closePath();
    };

    canvasContainer.ctx.fillRectWithRadius = function(x, y, width, height, radius, color) {
        this.fillStyle = color;
        this.fillRect(x + radius, y, width - 2 * radius, height);
        this.fillRect(x, y + radius, width, height - 2 * radius);

        this.fillCircle(x + radius, y + radius, radius, color);
        this.fillCircle(x + width - radius, y + radius, radius, color);
        this.fillCircle(x + radius, y + height - radius, radius, color);
        this.fillCircle(x + width - radius, y + height - radius, radius, color);
    };

    canvasContainer.ctx.strokeRectWithRadius = function(x, y, width, height, radius, color) {
        this.strokeStyle = color;

        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.moveTo(x + width - radius, y);
        ctx.arc(x + width - radius, y + radius, radius, Math.PI / -2, 0, false);
        ctx.moveTo(x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.moveTo(x + width, y + height - radius);
        ctx.arc(x + width - radius, y + height - radius, radius, 0, Math.PI * -1.5, false);
        ctx.moveTo(x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.moveTo(x + radius, y + height);
        ctx.arc(x + radius, y + height - radius, radius, Math.PI * -1.5, Math.PI * -1, false);
        ctx.moveTo(x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.moveTo(x, y + radius);
        ctx.arc(x + radius, y + radius, radius, Math.PI, Math.PI / -2, false);
        ctx.stroke();
        ctx.closePath();
    };

    if (container)
        container.appendChild(canvasContainer.canvas);
    else
        document.querySelector('body').appendChild(canvasContainer.canvas);

    return [ canvasContainer.canvas, canvasContainer.ctx ];
}

const mouseEvents = {
    previousX: undefined,
    previousY: undefined,
    touchTriggered: false,

    mouseDown(e) {
        if (mouseEvents.touchTriggered) {
            mouseEvents.touchTriggered = false;
            return;
        }

        if (activeScreen.label == 'tutorial') {
            changeScreen(screens.lobby);
            return;
        }

        if (activeScreen.game_running) return;

        activeScreen.objects.forEach(obj => {
            if (obj.state == 'hover') {
                obj.pressed = true;
                if (obj.hasClick) obj.onclick();
            }
        });

        this.previousX = e.clientX - getOffset(canvas).left;
        this.previousY = e.clientY - getOffset(canvas).top;
    },

    mouseMove(e) {
        if (activeScreen.game_running) return;
        const x = e.clientX - getOffset(canvas).left;
        const y = e.clientY - getOffset(canvas).top;

        if (!this.previousX) this.previousX = x;
        if (!this.previousY) this.previousY = y;

        let changeObjPos = undefined;

        activeScreen.objects.forEach(obj => {
            if (x >= obj.x() && y >= obj.y() && x <= obj.x() + obj.width() && y <= obj.y() + obj.height()) obj.state = 'hover';
            else obj.state = 'normal';

            if (obj.isDraggable && obj.pressed) {
                if (obj.name.includes('loop_block-')) {
                    if (obj.firstDrag) {
                        obj.loop_count--;
                        obj.text = obj.loop_count;
                        activeScreen.getObject(obj.parthener).loop_count = obj.loop_count;
                        obj.firstDrag = false;
                    }
                }

                const posX = (obj.x() + x - this.previousX) / canvas.width;
                const posY = (obj.y() + y - this.previousY) / canvas.height;
                obj.x = function() { return canvas.width * posX; };
                obj.y = function() { return canvas.height * posY; };
                obj.hasBeenDraggable = true;
                changeObjPos = obj;
            }
        });

        if (changeObjPos) {
            activeScreen.destroyObject(changeObjPos.name);
            activeScreen.objects.push(changeObjPos);
            activeScreen.objPosition[changeObjPos.name] = activeScreen.objects.length - 1;
        }

        this.previousX = x;
        this.previousY = y;
    },

    mouseUp(e) {
        if (activeScreen.game_running) return;

        activeScreen.objects.forEach(obj => {
            obj.pressed = false;

            if (obj.name.includes('loop_block-')) {
                obj.firstDrag = true;
            }
        });
    },

    touchDown(e) {
        mouseEvents.touchTriggered = true;

        if (activeScreen.label == 'tutorial') {
            changeScreen(screens.lobby);
            return;
        }

        if (activeScreen.game_running) return;
        const x = e.changedTouches['0'].clientX - getOffset(canvas).left;
        const y = e.changedTouches['0'].clientY - getOffset(canvas).top;

        if (!this.previousX) this.previousX = x;
        if (!this.previousY) this.previousY = y;

        activeScreen.objects.forEach(obj => {
            if (x >= obj.x() && y >= obj.y() && x <= obj.x() + obj.width() && y <= obj.y() + obj.height()) {
                obj.state = 'hover';
                obj.pressed = true;
                if (obj.hasClick) obj.onclick();
            } else obj.state = 'normal';
        });

        this.previousX = e.changedTouches['0'].clientX - getOffset(canvas).left;
        this.previousY = e.changedTouches['0'].clientY - getOffset(canvas).top;
    },

    touchMove(e) {
        if (activeScreen.game_running) return;
        const x = e.changedTouches['0'].clientX - getOffset(canvas).left;
        const y = e.changedTouches['0'].clientY - getOffset(canvas).top;

        let changeObjPos = undefined;

        activeScreen.objects.forEach(obj => {
            if (x >= obj.x() && y >= obj.y() && x <= obj.x() + obj.width() && y <= obj.y() + obj.height()) obj.state = 'hover';
            else obj.state = 'normal';

            if (obj.isDraggable && obj.pressed) {
                if (obj.name.includes('loop_block-')) {
                    if (obj.firstDrag) {
                        obj.loop_count--;
                        obj.text = obj.loop_count;
                        activeScreen.getObject(obj.parthener).loop_count = obj.loop_count;
                        obj.firstDrag = false;
                    }
                }

                const posX = (obj.x() + x - this.previousX) / canvas.width;
                const posY = (obj.y() + y - this.previousY) / canvas.height;
                obj.x = function() { return canvas.width * posX; };
                obj.y = function() { return canvas.height * posY; };
                obj.hasBeenDraggable = true;
                changeObjPos = obj;
            }
        });

        if (changeObjPos) {
            activeScreen.destroyObject(changeObjPos.name);
            activeScreen.objects.push(changeObjPos);
            activeScreen.objPosition[changeObjPos.name] = activeScreen.objects.length - 1;
        }

        this.previousX = x;
        this.previousY = y;
    },

    touchUp(e) {
        if (activeScreen.game_running) return;

        activeScreen.objects.forEach(obj => {
            obj.pressed = false;
            if (obj.type != 'block') obj.state = 'normal';

            if (obj.name.includes('loop_block-')) {
                obj.firstDrag = true;
            }
        });
    }
}

function getOffset( el ) {
    var _x = 0;
    var _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return { top: _y, left: _x };
}

function hasColision(obj1, obj2) {
    if (((obj1.x() >= obj2.x() && obj1.x() <= obj2.x() + obj2.width()) ||
         (obj1.x() + obj1.width() >= obj2.x() && obj1.x() + obj1.width() <= obj2.x() + obj2.width())) &&
        ((obj1.y() >= obj2.y() && obj1.y() <= obj2.y() + obj2.height()) || (obj1.y() +obj1.height() >= obj2.y() && obj1.y() +obj2.height() <= obj2.y() + obj2.height()))
    ) return true;

    return false;
}

function resizeViewPort(e) {
    [windowWidth, windowHeight] = [
        window.innerWidth * devicePixelRatio,
        window.innerHeight * devicePixelRatio,
    ];

    ctx.scale(devicePixelRatio, devicePixelRatio);

    canvas.width = windowWidth;
    canvas.height = windowHeight;

    activeScreen.objects.forEach(obj => {
        obj.resetView();
    });
}

class RenderObject {
    constructor (
        name, type,
        x, y,
        width, height,
        borderRadius,
        fillColor = "",
        strokeColor = "", strokeWidth = 0,
        text = "", textColor = "",
        textAlign = "", textVerticalAlign = "", textPosition = "",
        font = "", fontSize = 0,
        isDraggable = false, hasClick = false, hasHover = false,
        hasFill = false, hasStroke = false, hasText = false,
        imageSrc = null, imageHoverSrc = null, hasImage = false
    ) {
        this.name = name;
        this.type = type;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.borderRadius = borderRadius;
        this.fillColor = fillColor;
        this.strokeColor = strokeColor;
        this.strokeWidth = strokeWidth;
        this.text = text;
        this.textAlign = textAlign;
        this.textVerticalAlign = textVerticalAlign;
        this.textPosition = textPosition;
        this.textColor = textColor;
        this.font = font;
        this.fontSize = fontSize;
        this.hasClick = hasClick;
        this.hasHover = hasHover;
        this.isDraggable = isDraggable;
        this.hasFill = hasFill;
        this.hasStroke = hasStroke;
        this.hasText = hasText;
        this.imageSrc = imageSrc;
        this.imageHoverSrc = imageHoverSrc;
        this.hasImage = hasImage

        this.pressed = false;
        this.state = 'normal';
        this.hasBeenDraggable = false;
        this.active = true;

        if (this.hasImage) {
            this.image = new Image();
            this.image.src = this.imageSrc;

            if (this.hasHover) {
                this.imageHover = new Image();
                this.imageHover.src = this.imageHoverSrc;
            }
        }
    }

    render() {
        try {
            if (this.type == "block") {
                const grid = activeScreen.getObject("grid");
                if (grid.itens.all[this.name].index < grid.offset || grid.itens.all[this.name].index > grid.offset + grid.count - 1) return;
            }

            if (this.hasImage) {
                ctx.drawImage(this.hasHover ? (this.state == 'hover' ? this.imageHover : this.image) : this.image, this.spriteX, this.spriteY, this.spriteWidth, this.spriteHeight, this.sprX(), this.sprY(), this.sprWidth(), this.sprHeight());
            }

            if (this.hasFill) {
                if (this.borderRadius() > 0) {
                    ctx.beginPath();
                    ctx.fillStyle = colorSchema[this.fillColor][this.active ? 'hover' : (this.hasHover ? this.state : 'normal')];
                    ctx.roundRect(this.x(), this.y(), this.width(), this.height(), this.borderRadius());
                    ctx.fill();
                    ctx.closePath();
                }

                else {
                    ctx.fillStyle = colorSchema[this.fillColor][this.active ? 'hover' : (this.hasHover ? this.state : 'normal')];
                    ctx.fillRect(this.x(), this.y(), this.width(), this.height());
                }
            }

            if (this.hasStroke) {
                ctx.lineWidth = this.strokeWidth;

                if (this.borderRadius() > 0) {
                    ctx.beginPath();
                    ctx.fillStyle = colorSchema[this.strokeColor][this.hasHover ? this.state : 'normal'];
                    ctx.roundRect(this.x(), this.y(), this.width(), this.height(), this.borderRadius());
                    ctx.stroke();
                    ctx.closePath();
                }

                else {
                    ctx.strokeStyle = colorSchema[this.strokeColor][this.hasHover ? this.state : 'normal'];
                    ctx.strokeRect(this.x(), this.y(), this.width(), this.height());
                }
            }

            if (this.hasText) {
                ctx.fillStyle = colorSchema[this.textColor][this.hasHover ? this.state : 'normal'];
                ctx.textAlign = this.textAlign;
                ctx.textBaseline = this.textVerticalAlign;
                ctx.font = `${this.fontSize()}px '${this.font}'`;

                let x = this.x();
                let y = this.y();

                if (this.textPosition == "center") {
                    x += this.width() / 2;
                    y += this.height() / 2;
                }

                ctx.fillText(this.text, x, y);
            }
        } catch (err) {
            if (activeScreen.objPosition[this.name]) throw err;
        }
    }

    update = function() {};
    onhover = function() {};
    onclick = function() {};
    resetView = function() {};
}

const screens = {
    menu: {
        label: "menu",
        objects: [],
        objPosition: [],
        onload: true,

        render() {
            this.update();
            this.background.render();

            this.objects.forEach(obj => {
                obj.update();
                obj.render();
            });
        },

        update() {
            if (this.onload) {
                this.objects.push(
                    new RenderObject("title", "interface", null, null, null, null, null, null, null, 0, "UNIOPEN", "branco", textAlign.horizontal.center, textAlign.vertical.center, "center", fonts.title.font, fonts.title.size, false, false, false, false, false, true),
                    new RenderObject("sub_title", "interface", null, null, null, null, null, null, null, 0, "LOGICA DE PROGRAMACAO", "branco", textAlign.horizontal.center, textAlign.vertical.center, "center", fonts.sub_title.font, fonts.sub_title.size, false, false, false, false, false, true),
                    new RenderObject("uni_logo", "interface", null, null, null, null, null, null, null, 0, null, null, null, null, null, null, null, false, false, false, false, false, false, "./assets/image/unimontes.png", null, true),
                    new RenderObject("play_button", "interface", null, null, null, null, null, null, null, 0, "JOGAR", "branco", textAlign.horizontal.center, textAlign.vertical.center, "center", fonts.text.font, fonts.text.size, false, true, true, false, false, true, "./assets/image/menu/play_button.png", "./assets/image/menu/play_button-hover.png", true),
                )

                this.objects.forEach((obj, index) => this.objPosition[obj.name] = index);

                const title = this.getObject("title");
                title.init = function() {
                    this.x = function() { return canvas.width / 2; };
                    this.y = function() { return canvas.height * 0.45; };
                    this.width = function() { return 0; };
                    this.height = this.width;
                    this.borderRadius = this.width;
                }

                const sub_title = this.getObject("sub_title");
                sub_title.init = function() {
                    this.x = function() { return canvas.width / 2; };
                    this.y = function() { return canvas.height * 0.6; };
                    this.width = function() { return 0; };
                    this.height = this.width;
                    this.borderRadius = this.width;
                }

                const uni_logo = this.getObject("uni_logo");
                uni_logo.init = function() {
                    this.x = function() { return canvas.width * 0.02; };
                    this.y = function() { return canvas.height * 0.02; };
                    this.width = function() { return canvas.width * 0.1; };
                    this.height = function() { return this.width() * (412 / 872); };
                    this.borderRadius = function() { return 0; };

                    this.spriteX = 0;
                    this.spriteY = 0;
                    this.spriteWidth = 872;
                    this.spriteHeight = 412;

                    this.sprX = this.x;
                    this.sprY = this.y;
                    this.sprWidth = this.width;
                    this.sprHeight = this.height;
                }

                const play_button = this.getObject("play_button");
                play_button.init = function() {
                    this.x = function() { return canvas.width * 0.5 - this.width() * 0.5; };
                    this.y = function() { return canvas.height * 0.78; };
                    this.width = function() { return canvas.width * 0.25; };
                    this.height = function() { return this.width() * (130 / 400); };
                    this.borderRadius = function() { return 0; };

                    this.spriteX = 0;
                    this.spriteY = 0;
                    this.spriteWidth = 400;
                    this.spriteHeight = 130;

                    this.sprX = this.x;
                    this.sprY = this.y;
                    this.sprWidth = this.width;
                    this.sprHeight = this.height;

                    this.onclick = function() {
                        changeScreen(screens.tutorial);
                    }
                }

                this.objects.forEach(obj => { obj.init() });

                this.background.image.src = this.background.imageSrc;
                this.onload = false;
            }
        },

        background: {
            image: new Image(),
            imageSrc: "./assets/image/background.png",
            layerColor: "rgba(0, 0, 0, 0.5)",

            render() {
                ctx.drawImage(this.image, 0, 0, canvas.width, canvas.height);
                ctx.fillStyle = this.layerColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        },

        getObject(name) {
            return this.objects[this.objPosition[name]];
        },

        destroyObject(name) {
            const pos = this.objPosition[name];
            const aux = [];

            this.objects.forEach((obj, index) => {
                if (index != pos) aux.push(obj);
            });

            this.objects = aux;
            this.objPosition[name] = undefined;

            Object.keys(this.objPosition).forEach(key => {
                if (this.objPosition[key] > pos) this.objPosition[key]--;
            });
        },
    },

    tutorial: {
        label: 'tutorial',
        objects: [],
        objPosition: {},
        onload: true,
        rules: [
            "Seu objetivo em cada fase e coletar todos os cristais azuis.",
            "Para mover seu personagem arraste os blocos de acao para a barra de execucao.",
            "Para executar seu codigo aperte o botão play."
        ],

        background: {
            image: new Image(),
            imageSrc: "./assets/image/background.png",
            layerColor: "rgba(0, 0, 0, 0.8)",

            render() {
                ctx.drawImage(this.image, 0, 0, canvas.width, canvas.height);
                ctx.fillStyle = this.layerColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        },

        render() {
            this.update();

            this.background.render();

            this.objects.forEach(obj => {
                obj.update();
                obj.render();
            });
        },

        update() {
            if (this.onload) {
                this.objects = [];
                this.objPosition = {};

                for (let i = 0; i < this.rules.length; i++) {
                    this.objects.push(
                        new RenderObject("rule_" + (i + 1), "tutorial", null, null, null, null, null, null, null, null, this.rules[i], "branco", textAlign.horizontal.left, textAlign.vertical.center, "left", fonts.small_text.font, fonts.normal_text.size, false, false, false, false, false, true)
                    );

                    this.objects[this.objects.length - 1].init = function() {
                        this.x = function() { return canvas.width * 0.05; }
                        this.y = function() {
                            return canvas.height * 0.15 + canvas.height * 0.1 * i;
                        }

                        this.width = function() { return 0; }
                        this.height = this.width;
                        this.borderRadius = this.width;
                    }
                }

                this.objects.push(
                    new RenderObject(
                        "forward_block", "control",
                        null, null, null, null, null,
                        null, null, 0, null, null, null, null, null, null, 0, false, false, false, false, false, false,
                        "./assets/image/forward_block.png", null, true
                    ),
                    new RenderObject(
                        "turn_block", "control",
                        null, null, null, null, null,
                        null, null, 0, null, null, null, null, null, null, 0, false, false, false, false, false, false,
                        "./assets/image/turn_block.png", null, true
                    ),
                    new RenderObject(
                        "loop_block", "control",
                        null, null, null, null, null,
                        null, null, 0, null, null, null, null, null, null, 0, false, false, false, false, false, false,
                        "./assets/image/loop_block.png", null, true
                    )
                );

                this.objects[this.objects.length - 3].init = function() {
                    this.spriteX = 0;
                    this.spriteY = 0;
                    this.spriteWidth = 214;
                    this.spriteHeight = 214;

                    this.x =  function() { return canvas.width * 0.5 - this.width() * 0.5; };
                    this.y = function() { return canvas.height * 0.45; };
                    this.width = function() { return canvas.height * 0.1; };
                    this.height = function() { return canvas.height * 0.1; };
                    this.borderRadius = function() { return 0; };

                    this.sprX = this.x;
                    this.sprY = this.y;
                    this.sprWidth = this.width;
                    this.sprHeight = this.height;
                };

                this.objects[this.objects.length - 2].init = function() {
                    this.spriteX = 0;
                    this.spriteY = 0;
                    this.spriteWidth = 214;
                    this.spriteHeight = 214;

                    this.x =  function() { return canvas.width * 0.5 - this.width() * 0.5; };
                    this.y = function() { return canvas.height * 0.63; };
                    this.width = function() { return canvas.height * 0.1; };
                    this.height = function() { return canvas.height * 0.1; };
                    this.borderRadius = function() { return 0; };

                    this.sprX = this.x;
                    this.sprY = this.y;
                    this.sprWidth = this.width;
                    this.sprHeight = this.height;
                };

                this.objects[this.objects.length - 1].init = function() {
                    this.spriteX = 0;
                    this.spriteY = 0;
                    this.spriteWidth = 214;
                    this.spriteHeight = 214;

                    this.x =  function() { return canvas.width * 0.5 - this.width() * 0.5; };
                    this.y = function() { return canvas.height * 0.8; };
                    this.width = function() { return canvas.height * 0.1; };
                    this.height = function() { return canvas.height * 0.1; };
                    this.borderRadius = function() { return 0; };

                    this.sprX = this.x;
                    this.sprY = this.y;
                    this.sprWidth = this.width;
                    this.sprHeight = this.height;
                };

                this.objects.push(
                    new RenderObject("forward_desc", "tutorial", null, null, null, null, null, null, null, null, "Move o personagem para frente", "branco", textAlign.horizontal.center, textAlign.vertical.center, "center", fonts.text.font, fonts.normal_text.size, false, false, false, false, false, true),
                    new RenderObject("turn_desc", "tutorial", null, null, null, null, null, null, null, null, "Rotaciona o personagem em -45 graus", "branco", textAlign.horizontal.center, textAlign.vertical.center, "center", fonts.text.font, fonts.normal_text.size, false, false, false, false, false, true),
                    new RenderObject("loop_desc", "tutorial", null, null, null, null, null, null, null, null, "Repete os blocos que estão em seu interior", "branco", textAlign.horizontal.center, textAlign.vertical.center, "center", fonts.text.font, fonts.normal_text.size, false, false, false, false, false, true)
                );

                this.objects[this.objects.length - 3].init = function() {
                    this.x = function() {
                        const f = activeScreen.getObject("forward_block");
                        return f.x() + f.width() / 2;
                    }

                    this.y = function() {
                        const f = activeScreen.getObject("forward_block");
                        return f.y() + f.height() * 1.2;
                    }

                    this.width = function() { return 0; }
                    this.height = this.width;
                    this.borderRadius = this.width;
                }

                this.objects[this.objects.length - 2].init = function() {
                    this.x = function() {
                        const f = activeScreen.getObject("turn_block");
                        return f.x() + f.width() / 2;
                    }

                    this.y = function() {
                        const f = activeScreen.getObject("turn_block");
                        return f.y() + f.height() * 1.2;
                    }

                    this.width = function() { return 0; }
                    this.height = this.width;
                    this.borderRadius = this.width;
                }

                this.objects[this.objects.length - 1].init = function() {
                    this.x = function() {
                        const f = activeScreen.getObject("loop_block");
                        return f.x() + f.width() / 2;
                    }

                    this.y = function() {
                        const f = activeScreen.getObject("loop_block");
                        return f.y() + f.height() * 1.2;
                    }

                    this.width = function() { return 0; }
                    this.height = this.width;
                    this.borderRadius = this.width;
                }

                this.objects.push(
                    new RenderObject("continue", "tutorial", null, null, null, null, null, null, null, null, "Pressione a tela para continuar", "branco", textAlign.horizontal.right, textAlign.vertical.bottom, "center", fonts.text.font, fonts.normal_text.size, false, false, false, false, false, true)
                )

                this.objects[this.objects.length - 1].init = function() {
                    this.x = function() {
                        return canvas.width * 0.99;
                    }

                    this.y = function() {
                        return canvas.height * 0.96;
                    }

                    this.width = function() { return 0; }
                    this.height = this.width;
                    this.borderRadius = this.width;
                }

                this.objects.forEach((obj, index) => {
                    activeScreen.objPosition[obj.name] = index;
                });

                this.objects.forEach(obj => { obj.init(); });

                this.background.image.src = this.background.imageSrc;
                this.onload = false;
            }
        },

        getObject(name) {
            return this.objects[this.objPosition[name]];
        }
    },

    lobby: {
        label: "lobby",
        objPosition: [],
        objects: [],
        onload: true,

        render() {
            this.update();
            this.background.render();

            this.objects.forEach(obj => {
                obj.update();
                obj.render();
            });
        },

        update() {
            if (this.onload) {
                let redirect = true;

                for (let i = 0; i < Object.keys(bd).length; i++) {
                    if (!bd['level_' + (i + 1)]) {
                        redirect = false;
                        break;
                    }
                }

                if (redirect) changeScreen(screens.final);

                for (let i = 0; i < 5; i++) {
                    this.objects.push(
                        new RenderObject("level_" + (i + 1), "button", null, null, null, null, null, null, null, 0, i + 1, "branco", textAlign.horizontal.center, textAlign.vertical.center, "center", fonts.title.font, fonts.sub_title.size, false, true, true, false, false, true, "./assets/image/menu/lobby_button.png", "./assets/image/menu/lobby_button-hover.png", true)
                    );

                    this.objects[this.objects.length - 1].init = function() {
                        this.index = i;
                        this.disabled = true;

                        if (!bd["level_" + i] && this.index > 0) {
                            this.disabled = false;
                            this.image.src = "./assets/image/menu/lobby_button-disabled.png";
                            this.imageHover.src = "./assets/image/menu/lobby_button-disabled.png";
                        }

                        this.x = function() {
                            return canvas.width / 2 + ((i - 2) * (this.width() + this.mx()) - this.width() * 0.5);
                        }

                        this.y = function() {
                            return canvas.height / 2 - this.height() / 2;
                        }

                        this.width = function() {
                            return canvas.width * 0.12;
                        }

                        this.height = function() {
                            return canvas.width * 0.12;
                        }

                        this.mx = function() {
                            return canvas.width * 0.05;
                        }

                        this.spriteX = 0;
                        this.spriteY = 0;
                        this.spriteWidth = 207;
                        this.spriteHeight = 207;
                        this.sprX = this.x;
                        this.sprY = this.y;
                        this.sprWidth = this.width;
                        this.sprHeight = this.height;

                        this.onclick = function() {
                            if (!this.disabled) return;
                            changeScreen(screens.levels["level_" + (this.index + 1)]);
                        }
                    }
                }

                this.objects.forEach((obj, index) => {
                    this.objPosition[obj.name] = index;
                    obj.init();
                });

                this.background.image.src = this.background.imageSrc;
                this.onload = false;
            }
        },

        background: {
            image: new Image(),
            imageSrc: "./assets/image/background.png",
            layerColor: "rgba(0, 0, 0, 0.7)",

            render() {
                ctx.drawImage(this.image, 0, 0, canvas.width, canvas.height);
                ctx.fillStyle = this.layerColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        },
    },

    levels: {
        level_1: {
            label: "level_1",
            level: {
                paths: [
                    "#####",
                ],

                itens: [
                    ".####",
                ],

                enemies: [
                    ".....",
                ],

                player: {
                    x: 1,
                    y: 1,
                    direction: 'L'
                },

                columns: 5,
                lines: 1,
                quantItens: 4,
            },

            onload: true,
            objects: [],
            objPosition: {},
            game_running: false,

            background: {
                image: new Image(),
                imageSrc: "./assets/image/background.png",
                layerColor: "rgba(0, 0, 0, 0.5)",

                render() {
                    ctx.drawImage(this.image, 0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = this.layerColor;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
            },

            render() {
                this.update();
                this.background.render();

                this.objects.forEach(obj => {
                    if (!this.game_running) obj.update();
                    else if (obj.name == 'player') obj.update();

                    if (obj.active) obj.render();
                    if (obj.renderAux) obj.renderAux();
                });

                if (this.game_running) {
                    this.run_game();
                }
            },

            update() {
                if (this.onload) {
                    this.background.image.src = this.background.imageSrc;

                    this.objects = [];
                    this.objects.push(
                        new RenderObject(
                            "grid", "interface",
                            null, null, null, null, null,
                            null, null, 0, null, null, null, null, null, null, 0, false, false, false, false, false, false,
                            "./assets/image/grid.png", null, true
                        ),
                        new RenderObject(
                            "play_button", "interface",
                            null, null, null, null, null,
                            null, null, 0, null, null, null, null, null, null, 0, false, true, true, false, false, false,
                            "./assets/image/play_button.png", "./assets/image/play_button-hover.png", true
                        ),
                        new RenderObject(
                            "left_arrow", "interface",
                            null, null, null, null, function() { return 0; },
                            null, null, 0, null, null,
                            null, null,
                            null, null, null,
                            false, true, true, false, false, false,
                            "./assets/image/arrow_left.png", "./assets/image/arrow_left-hover.png", true
                        ),
                        new RenderObject(
                            "right_arrow", "interface",
                            null, null, null, null, function() { return 0; },
                            null, null, 0, null, null,
                            null, null,
                            null, null, null,
                            false, true, true, false, false, false,
                            "./assets/image/arrow_right.png", "./assets/image/arrow_right-hover.png", true
                        ),
                        new RenderObject(
                            "forward_block", "control",
                            null, null, null, null, null,
                            null, null, 0, null, null, null, null, null, null, 0, true, false, true, false, false, false,
                            "./assets/image/forward_block.png", "./assets/image/forward_block-hover.png", true
                        ),
                        new RenderObject(
                            "turn_block", "control",
                            null, null, null, null, null,
                            null, null, 0, null, null, null, null, null, null, 0, true, false, true, false, false, false,
                            "./assets/image/turn_block.png", "./assets/image/turn_block-hover.png", true
                        ),
                        new RenderObject(
                            "loop_block", "control",
                            null, null, null, null, null,
                            null, null, 0, null, null, null, null, null, null, 0, true, false, true, false, false, false,
                            "./assets/image/loop_block.png", "./assets/image/loop_block-hover.png", true
                        )
                    );

                    this.objects.forEach((obj, index) => {
                        this.objPosition[obj.name] = index;
                    });

                    const grid = this.getObject("grid");
                    grid.init = function() {
                        this.count = 0;
                        this.offset = 0;

                        this.x = function() { return canvas.width * 0.2; };
                        this.y = function() { return canvas.height * 0.7; };
                        this.width = function() { return canvas.width * 0.6; };
                        this.height = function() { return canvas.height * 0.15; };
                        this.borderRadius = function() { return 0; };

                        this.spriteX = 0;
                        this.spriteY = 0;
                        this.spriteWidth = 1285;
                        this.spriteHeight = 252;

                        this.sprX = this.x;
                        this.sprY = this.y;
                        this.sprWidth = this.width;
                        this.sprHeight = this.height;

                        this.itens = {
                            all: {},
                            count: 0
                        };

                        this.padding = {
                            x: function() {
                                return activeScreen.getObject("grid").width() * 0.05;
                            },

                            y: function() {
                                return (activeScreen.getObject("grid").height() - canvas.height * 0.1) * 0.5;
                            }
                        };

                        this.update = function() {
                            const size = this.width() - this.padding.x() * 2;
                            this.count = Math.floor(size / activeScreen.getObject("forward_block").width());
                        };
                    };

                    const play_button = this.getObject("play_button");
                    play_button.init = function() {
                        this.spriteX = 0;
                        this.spriteY = 0;
                        this.spriteWidth = 214;
                        this.spriteHeight = 214;

                        this.x = function() { return canvas.width * 0.2 + canvas.width * 0.65; },

                        this.y = function() {
                            const grid = activeScreen.getObject("grid");
                            return grid.y() + grid.padding.y();
                        }

                        this.width = function() { return canvas.height * 0.1; },
                        this.height = function() { return canvas.height * 0.1; },
                        this.borderRadius = function() { return this.width() * 0.1; },

                        this.onclick = function() {
                            if (this.checkBlocks()) {
                                this.state = 'normal';
                                activeScreen.game_running = true;
                            }

                            else { alert("Não coloque dois blocos de repetição entrelaçados!\nColoque o bloco de abertura e de fechamento na mesma região"); }
                        }

                        this.checkBlocks = function() {
                            const grid = activeScreen.getObject("grid");
                            const tmp = Array(grid.itens.count);

                            Object.keys(grid.itens.all).forEach(key => {
                                tmp[grid.itens.all[key].index] = {
                                    name: key,
                                    type: grid.itens.all[key].type
                                }
                            });

                            let res = true;
                            let parthener = undefined;
                            tmp.forEach(item => {
                                if (!res) return;

                                if (item.type == 'loop') {
                                    if (!parthener) parthener = activeScreen.getObject(item.name).parthener;
                                    else {
                                        if (parthener == item.name) parthener = undefined;
                                        else res = false;
                                    }
                                }
                            });

                            return res;
                        }

                        this.sprX = this.x;
                        this.sprY = this.y;
                        this.sprWidth = this.width;
                        this.sprHeight = this.height;
                    };

                    const forward_block = this.getObject("forward_block");
                    forward_block.init = function() {
                        this.spriteX = 0;
                        this.spriteY = 0;
                        this.spriteWidth = 214;
                        this.spriteHeight = 214;

                        this.x =  function() { return canvas.width * 0.5 - this.width() * 1.5 - 10; };
                        this.y = function() {
                            const grid = activeScreen.getObject('grid');
                            return grid.y() + grid.height() + grid.padding.y();
                        };

                        this.width = function() { return canvas.height * 0.1; };
                        this.height = function() { return canvas.height * 0.1; };
                        this.borderRadius = function() { return canvas.height * 0.1 * 0.35; };

                        this.resetPosition = function(resetObj = false) {
                            this.x =  function() { return canvas.width * 0.5 - this.width() * 1.5 - 10; };
                            this.y = function() {
                                const grid = activeScreen.getObject('grid');
                                return grid.y() + grid.height() + grid.padding.y();
                            };
                            this.width = function() { return canvas.height * 0.1; };
                            this.height = function() { return canvas.height * 0.1; };
                            this.borderRadius = function() { return canvas.height * 0.1 * 0.35; };
                        };

                        this.placeInGrid = function() {
                            const grid = activeScreen.getObject("grid");

                            let num = 0;
                            Object.keys(grid.itens.all).forEach(key => {
                                if (key.includes("forward") && key.length > this.name.length) num = Math.max(num, Number(key.split("-")[1]));
                            });

                            const objName = this.name + '-' + (num + 1);
                            const objPos = activeScreen.objPosition[this.name];

                            activeScreen.objects.splice(objPos, 0,
                                new RenderObject(objName, "block", null, null, null, null, this.borderRadius, this.fillColor, this.strokeColor, this.strokeWidth, this.text, this.textColor, this.textAlign, this.textVerticalAlign, this.textPosition, this.font, this.fontSize, true, false, true, false, false, false, this.imageSrc, this.imageHoverSrc, true)
                            );

                            Object.keys(activeScreen.objPosition).forEach(key => {
                                if (objPos <= activeScreen.objPosition[key]) activeScreen.objPosition[key]++;
                            });

                            activeScreen.objPosition[objName] = objPos;

                            grid.itens.all[objName] = {
                                type: "forward",
                                index: Object.keys(grid.itens.all).length
                            };

                            grid.itens.count++;

                            const newObj = activeScreen.getObject(objName);

                            newObj.init = function() {
                                this.spriteX = 0;
                                this.spriteY = 0;
                                this.spriteWidth = 214;
                                this.spriteHeight = 214;

                                this.width = function() {
                                    return canvas.height * 0.1;
                                };

                                this.height = function() {
                                    return this.width();
                                };

                                this.x = function() {
                                    const gridObj = activeScreen.getObject('grid');
                                    return gridObj.x() + gridObj.padding.x() + this.width() * (gridObj.itens.all[this.name].index - gridObj.offset);
                                };

                                this.y = function() {
                                    const gridObj = activeScreen.getObject('grid');
                                    return gridObj.padding.y() + gridObj.y();
                                };

                                this.resetPosition = function() {
                                    this.width = function() {
                                        return canvas.height * 0.1;
                                    };

                                    this.height = function() {
                                        return this.width();
                                    };

                                    this.x = function() {
                                        const gridObj = activeScreen.getObject('grid');
                                        return gridObj.x() + gridObj.padding.x() + this.width() * (gridObj.itens.all[this.name].index - gridObj.offset);
                                    };

                                    this.y = function() {
                                        const gridObj = activeScreen.getObject('grid');
                                        return gridObj.padding.y() + gridObj.y();
                                    };
                                };

                                this.update = function() {
                                    if (grid.itens.all[this.name].index < grid.offset || grid.itens.all[this.name].index > grid.offset + grid.count - 1) this.state = 'normal';

                                    this.sprX = this.x;
                                    this.sprY = this.y;
                                    this.sprWidth = this.width;
                                    this.sprHeight = this.height;

                                    if (this.hasBeenDraggable && !this.pressed) {
                                        const grid = activeScreen.getObject("grid");

                                        if (hasColision(this, grid)) {
                                            const pos = this.positionSwapCheck();
                                            if (pos !== null) this.changePosition(pos);
                                            this.resetPosition();
                                        }

                                        else {
                                            activeScreen.destroyObject(this.name);
                                            const aux = {};
                                            Object.keys(grid.itens.all).forEach(key => {
                                                if (key != this.name) {
                                                    let pos = grid.itens.all[key];
                                                    if (grid.itens.all[key].index > grid.itens.all[this.name].index) pos.index--;
                                                    aux[key] = pos;
                                                }
                                            });

                                            grid.itens.count--;
                                            grid.itens.all = aux;
                                        }

                                        this.hasBeenDraggable = false;
                                    }
                                };

                                this.changePosition = function(name) {
                                    const grid = activeScreen.getObject("grid");
                                    const itemIndex = grid.itens.all[name].index;
                                    const thisIndex = grid.itens.all[this.name].index;
                                    let newPosition;

                                    if (itemIndex > thisIndex) {
                                        newPosition = itemIndex;
                                        Object.keys(grid.itens.all).forEach(key => {
                                            if (key == this.name) return;
                                            if (grid.itens.all[key].index >= grid.itens.all[this.name].index && grid.itens.all[key].index <= newPosition) grid.itens.all[key].index--;
                                        });
                                    }

                                    else {
                                        newPosition = itemIndex;
                                        Object.keys(grid.itens.all).forEach(key => {
                                            if (key == this.name) return;
                                            if (grid.itens.all[key].index <= grid.itens.all[this.name].index && grid.itens.all[key].index >= newPosition) grid.itens.all[key].index++;
                                        });
                                    }

                                    grid.itens.all[this.name].index = newPosition;
                                };

                                this.positionSwapCheck = function() {
                                    let res = null;

                                    activeScreen.objects.forEach(obj => {
                                        if (res !== null) return;

                                        if (obj.type == "block") {
                                            if (obj.state == "hover" && obj.name != this.name) {
                                                obj.state = 'normal';
                                                res = obj.name;
                                            }
                                        }
                                    });

                                    return res;
                                };
                            }

                            newObj.init();
                        };

                        this.update = function() {
                            this.sprX = this.x;
                            this.sprY = this.y;
                            this.sprWidth = this.width;
                            this.sprHeight = this.height;

                            if (this.hasBeenDraggable && !this.pressed) {
                                if (hasColision(this, activeScreen.getObject("grid"))) this.placeInGrid();

                                this.resetPosition();
                                this.hasBeenDraggable = false;
                            }
                        };
                    };

                    const turn_block = this.getObject("turn_block");
                    turn_block.init = function() {
                        this.spriteX = 0;
                        this.spriteY = 0;
                        this.spriteWidth = 214;
                        this.spriteHeight = 214;

                        this.x =  function() { return canvas.width * 0.5 - this.width() * 0.5; };
                        this.y = function() {
                            const grid = activeScreen.getObject('grid');
                            return grid.y() + grid.height() + grid.padding.y();
                        };

                        this.width = function() { return canvas.height * 0.1; };
                        this.height = function() { return canvas.height * 0.1; };
                        this.borderRadius = function() { return canvas.height * 0.1 * 0.1; };

                        this.resetPosition = function() {
                            this.x =  function() { return canvas.width * 0.5 - this.width() * 0.5; };
                            this.y = function() {
                                const grid = activeScreen.getObject('grid');
                                return grid.y() + grid.height() + grid.padding.y();
                            };
                            this.width = function() { return canvas.height * 0.1; };
                            this.height = function() { return canvas.height * 0.1; };
                            this.borderRadius = function() { return canvas.height * 0.1 * 0.1; };
                        };

                        this.placeInGrid = function() {
                            const grid = activeScreen.getObject("grid");

                            let num = 0;
                            Object.keys(grid.itens.all).forEach(key => {
                                if (key.includes("turn") && key.length > this.name.length) num = Math.max(num, Number(key.split("-")[1]));
                            });

                            const objName = this.name + '-' + (num + 1);
                            const objPos = activeScreen.objPosition["forward_block"];

                            activeScreen.objects.splice(objPos, 0,
                                new RenderObject(objName, "block", null, null, null, null, this.borderRadius, this.fillColor, this.strokeColor, this.strokeWidth, null, null, null, null, null, null, 0, true, false, true, false, false, false, this.imageSrc, this.imageHoverSrc, this.hasImage)
                            );

                            Object.keys(activeScreen.objPosition).forEach(key => {
                                if (objPos <= activeScreen.objPosition[key]) activeScreen.objPosition[key]++;
                            });

                            activeScreen.objPosition[objName] = objPos;

                            grid.itens.all[objName] = {
                                type: "turn",
                                index: Object.keys(grid.itens.all).length
                            };

                            grid.itens.count++;

                            const newObj = activeScreen.getObject(objName);

                            newObj.init = function() {
                                this.spriteX = 0;
                                this.spriteY = 0;
                                this.spriteWidth = 214;
                                this.spriteHeight = 214;

                                this.width = function() {
                                    return canvas.height * 0.1;
                                };

                                this.height = function() {
                                    return this.width();
                                };

                                this.x = function() {
                                    const gridObj = activeScreen.getObject('grid');
                                    return gridObj.x() + gridObj.padding.x() + this.width() * (gridObj.itens.all[this.name].index - gridObj.offset);
                                };

                                this.y = function() {
                                    const gridObj = activeScreen.getObject('grid');
                                    return gridObj.padding.y() + gridObj.y();
                                };

                                this.resetPosition = function() {
                                    this.width = function() {
                                        return canvas.height * 0.1;
                                    };

                                    this.height = function() {
                                        return this.width();
                                    };

                                    this.x = function() {
                                        const gridObj = activeScreen.getObject('grid');
                                        return gridObj.x() + gridObj.padding.x() + this.width() * (gridObj.itens.all[this.name].index - gridObj.offset);
                                    };

                                    this.y = function() {
                                        const gridObj = activeScreen.getObject('grid');
                                        return gridObj.padding.y() + gridObj.y();
                                    };
                                };

                                this.update = function() {
                                    if (grid.itens.all[this.name].index < grid.offset || grid.itens.all[this.name].index > grid.offset + grid.count - 1) this.state = 'normal';

                                    this.sprX = this.x;
                                    this.sprY = this.y;
                                    this.sprWidth = this.width;
                                    this.sprHeight = this.height;

                                    if (this.hasBeenDraggable && !this.pressed) {
                                        const grid = activeScreen.getObject("grid");
                                        if (hasColision(this, grid)) {
                                            const pos = this.positionSwapCheck();
                                            if (pos !== null) this.changePosition(pos);

                                            this.resetPosition();
                                        }

                                        else {
                                            activeScreen.destroyObject(this.name);
                                            const aux = {};
                                            Object.keys(grid.itens.all).forEach(key => {
                                                if (key != this.name) {
                                                    let pos = grid.itens.all[key];
                                                    if (grid.itens.all[key].index > grid.itens.all[this.name].index) pos.index--;
                                                    aux[key] = pos;
                                                }
                                            });

                                            grid.itens.count--;
                                            grid.itens.all = aux;
                                        }

                                        this.hasBeenDraggable = false;
                                    }
                                };

                                this.changePosition = function(name) {
                                    const grid = activeScreen.getObject("grid");
                                    const itemIndex = grid.itens.all[name].index;
                                    const thisIndex = grid.itens.all[this.name].index;
                                    let newPosition;

                                    if (itemIndex > thisIndex) {
                                        newPosition = itemIndex;
                                        Object.keys(grid.itens.all).forEach(key => {
                                            if (key == this.name) return;
                                            if (grid.itens.all[key].index >= grid.itens.all[this.name].index && grid.itens.all[key].index <= newPosition) grid.itens.all[key].index--;
                                        });
                                    }

                                    else {
                                        newPosition = itemIndex;
                                        Object.keys(grid.itens.all).forEach(key => {
                                            if (key == this.name) return;
                                            if (grid.itens.all[key].index <= grid.itens.all[this.name].index && grid.itens.all[key].index >= newPosition) grid.itens.all[key].index++;
                                        });
                                    }

                                    grid.itens.all[this.name].index = newPosition;
                                };

                                this.positionSwapCheck = function() {
                                    let res = null;

                                    activeScreen.objects.forEach(obj => {
                                        if (res !== null) return;

                                        if (obj.type == "block") {
                                            if (obj.state == "hover" && obj.name != this.name) {
                                                res = obj.name;
                                            }
                                        }
                                    });

                                    return res;
                                };
                            }

                            newObj.init();
                        };

                        this.update = function() {
                            this.sprX = this.x;
                            this.sprY = this.y;
                            this.sprWidth = this.width;
                            this.sprHeight = this.height;

                            if (this.hasBeenDraggable && !this.pressed) {
                                if (hasColision(this, activeScreen.getObject("grid"))) this.placeInGrid();

                                this.resetPosition();
                                this.hasBeenDraggable = false;
                            }
                        };
                    };

                    const loop_block = this.getObject("loop_block");
                    loop_block.init = function() {
                        this.spriteX = 0;
                        this.spriteY = 0;
                        this.spriteWidth = 214;
                        this.spriteHeight = 214;

                        this.x =  function() { return canvas.width * 0.5 + this.width() * 0.5 + 10; };
                        this.y = function() {
                            const grid = activeScreen.getObject('grid');
                            return grid.y() + grid.height() + grid.padding.y();
                        };
                        this.width = function() { return canvas.height * 0.1; };
                        this.height = function() { return canvas.height * 0.1; };
                        this.borderRadius = function() { return canvas.height * 0.1 * 0.1; };

                        this.resetPosition = function() {
                            this.x =  function() { return canvas.width * 0.5 + this.width() * 0.5 + 10; };
                            this.y = function() {
                                const grid = activeScreen.getObject('grid');
                                return grid.y() + grid.height() + grid.padding.y();
                            };

                            this.width = function() { return canvas.height * 0.1; };
                            this.height = function() { return canvas.height * 0.1; };
                            this.borderRadius = function() { return canvas.height * 0.1 * 0.1; };
                        };

                        this.placeInGrid = function() {
                            const grid = activeScreen.getObject("grid");

                            let num = 0;
                            Object.keys(grid.itens.all).forEach(key => {
                                if (key.includes("loop") && key.length > this.name.length) num = Math.max(num, Number(key.split("-")[1]));
                            });

                            const objName = this.name + '-';
                            const objPos = activeScreen.objPosition["forward_block"];

                            activeScreen.objects.splice(objPos, 0,
                                new RenderObject(objName + (num + 1), "block", null, null, null, null, this.borderRadius, this.fillColor, this.strokeColor, this.strokeWidth, null, null, null, null, null, null, 0, true, true, true, false, false, false, this.imageSrc, this.imageHoverSrc, true),
                                new RenderObject(objName + (num + 2), "block", null, null, null, null, this.borderRadius, this.fillColor, this.strokeColor, this.strokeWidth, "", "branco", null, null, null, null, 0, true, true, true, false, false, false, this.imageSrc, this.imageHoverSrc, true)
                            );

                            Object.keys(activeScreen.objPosition).forEach(key => {
                                if (objPos <= activeScreen.objPosition[key]) activeScreen.objPosition[key] += 2;
                            });

                            activeScreen.objPosition[objName + (num + 1)] = objPos;
                            activeScreen.objPosition[objName + (num + 2)] = objPos + 1;

                            grid.itens.all[objName + (num + 1)] = {
                                type: "loop",
                                index: Object.keys(grid.itens.all).length
                            };

                            grid.itens.all[objName + (num + 2)] = {
                                type: "loop",
                                index: Object.keys(grid.itens.all).length
                            };

                            grid.itens.count += 2;

                            const newObj = activeScreen.getObject(objName + (num + 1));

                            newObj.init = function() {
                                this.spriteX = 0;
                                this.spriteY = 0;
                                this.spriteWidth = 214;
                                this.spriteHeight = 214;

                                this.parthener = objName + (num + 2);
                                this.loop_count = 2;
                                this.firstDrag = true;

                                this.renderAux = function() {
                                    const grid = activeScreen.getObject("grid");

                                    try {
                                        if (grid.itens.all[this.name].index < grid.offset || grid.itens.all[this.name].index > grid.offset + grid.count - 1) return;
                                    }

                                    catch (err) {
                                        if (grid.itens.all[this.parthener]) throw err;
                                    }

                                    const x = this.x() + this.width() * 0.82;
                                    const y = this.y() + this.width() * 0.18 * 0.5;

                                    ctx.fillCircle(x, y, this.width() * 0.18, "rgb(160, 30, 30)");
                                    ctx.fillStyle = "rgb(240, 240, 240)";
                                    ctx.textAlign = textAlign.horizontal.center;
                                    ctx.textBaseline = textAlign.vertical.center;
                                    ctx.font = `${fonts.small_text.size()}px '${fonts.small_text.font}'`;
                                    ctx.fillText(this.loop_count, x, y);
                                }

                                this.width = function() {
                                    return canvas.height * 0.1;
                                };

                                this.height = function() {
                                    return this.width();
                                };

                                this.x = function() {
                                    const gridObj = activeScreen.getObject('grid');
                                    return gridObj.x() + gridObj.padding.x() + this.width() * (gridObj.itens.all[this.name].index - gridObj.offset);
                                };

                                this.y = function() {
                                    const gridObj = activeScreen.getObject('grid');
                                    return gridObj.padding.y() + gridObj.y();
                                };

                                this.resetPosition = function() {
                                    this.width = function() {
                                        return canvas.height * 0.1;
                                    };

                                    this.height = function() {
                                        return this.width();
                                    };

                                    this.x = function() {
                                        const gridObj = activeScreen.getObject('grid');
                                        return gridObj.x() + gridObj.padding.x() + this.width() * (gridObj.itens.all[this.name].index - gridObj.offset);
                                    };

                                    this.y = function() {
                                        const gridObj = activeScreen.getObject('grid');
                                        return gridObj.padding.y() + gridObj.y();
                                    };
                                };

                                this.update = function() {
                                    if (grid.itens.all[this.name].index < grid.offset || grid.itens.all[this.name].index > grid.offset + grid.count - 1) this.state = 'normal';

                                    this.sprX = this.x;
                                    this.sprY = this.y;
                                    this.sprWidth = this.width;
                                    this.sprHeight = this.height;

                                    if (this.hasBeenDraggable && !this.pressed) {
                                        const grid = activeScreen.getObject("grid");
                                        if (hasColision(this, grid)) {
                                            const pos = this.positionSwapCheck();
                                            if (pos !== null) this.changePosition(pos);

                                            this.resetPosition();
                                        }

                                        else {
                                            activeScreen.destroyObject(this.parthener);

                                            let aux = {};
                                            Object.keys(grid.itens.all).forEach(key => {
                                                if (key != this.parthener) {
                                                    let pos = grid.itens.all[key];
                                                    if (grid.itens.all[key].index > grid.itens.all[this.parthener].index) pos.index--;
                                                    aux[key] = pos;
                                                }
                                            });

                                            grid.itens.count--;
                                            grid.itens.all = aux;

                                            activeScreen.destroyObject(this.name);
                                            aux = {};
                                            Object.keys(grid.itens.all).forEach(key => {
                                                if (key != this.name) {
                                                    let pos = grid.itens.all[key];
                                                    if (grid.itens.all[key].index > grid.itens.all[this.name].index) pos.index--;
                                                    aux[key] = pos;
                                                }
                                            });

                                            grid.itens.count--;
                                            grid.itens.all = aux;
                                        }

                                        this.hasBeenDraggable = false;
                                    }
                                };

                                this.changePosition = function(name) {
                                    const grid = activeScreen.getObject("grid");
                                    const itemIndex = grid.itens.all[name].index;
                                    const thisIndex = grid.itens.all[this.name].index;
                                    let newPosition;

                                    if (itemIndex > thisIndex) {
                                        newPosition = itemIndex;
                                        Object.keys(grid.itens.all).forEach(key => {
                                            if (key == this.name) return;
                                            if (grid.itens.all[key].index >= grid.itens.all[this.name].index && grid.itens.all[key].index <= newPosition) grid.itens.all[key].index--;
                                        });
                                    }

                                    else {
                                        newPosition = itemIndex;
                                        Object.keys(grid.itens.all).forEach(key => {
                                            if (key == this.name) return;
                                            if (grid.itens.all[key].index <= grid.itens.all[this.name].index && grid.itens.all[key].index >= newPosition) grid.itens.all[key].index++;
                                        });
                                    }

                                    grid.itens.all[this.name].index = newPosition;
                                };

                                this.positionSwapCheck = function() {
                                    let res = null;

                                    activeScreen.objects.forEach(obj => {
                                        if (res !== null) return;

                                        if (obj.type == "block") {
                                            if (obj.state == "hover" && obj.name != this.name) {
                                                res = obj.name;
                                            }
                                        }
                                    });

                                    return res;
                                };

                                this.onclick = function() {
                                    const grid = activeScreen.getObject("grid");
                                    if (grid.itens.all[this.name].index < grid.offset || grid.itens.all[this.name].index > grid.offset + grid.count - 1) return;

                                    if (this.loop_count < 10) this.loop_count++;
                                    else this.loop_count = 2;

                                    activeScreen.getObject(this.parthener).loop_count = this.loop_count;
                                }
                            }

                            const newObj2 = activeScreen.getObject(objName + (num + 2));
                            newObj2.init = newObj.init;

                            newObj.init();
                            newObj2.init();
                            newObj2.parthener = objName + (num + 1);
                            newObj2.loop_count = 2;
                        };

                        this.update = function() {
                            this.sprX = this.x;
                            this.sprY = this.y;
                            this.sprWidth = this.width;
                            this.sprHeight = this.height;

                            if (this.hasBeenDraggable && !this.pressed) {
                                if (hasColision(this, activeScreen.getObject("grid"))) this.placeInGrid();

                                this.resetPosition();
                                this.hasBeenDraggable = false;
                            }
                        };
                    };

                    const left_arrow = this.getObject("left_arrow");
                    left_arrow.init = function() {
                        this.spriteX = 0;
                        this.spriteY = 0;
                        this.spriteWidth = 512;
                        this.spriteHeight = 512;

                        this.x = function() {
                            const grid = activeScreen.getObject("grid");
                            return grid.x() - grid.padding.x() / 2;
                        };

                        this.y = function() {
                            const grid = activeScreen.getObject("grid");
                            return grid.y() + (grid.height() - this.height()) / 2;
                        };

                        this.width = function() {
                            return this.height();
                        };

                        this.height = function() {
                            const grid = activeScreen.getObject("grid");
                            return grid.height() * 0.45;
                        };

                        this.sprX = this.x;
                        this.sprY = this.y;
                        this.sprWidth = this.width;
                        this.sprHeight = this.height;

                        this.onclick = function() {
                            const grid = activeScreen.getObject("grid");
                            grid.offset = Math.max(0, grid.offset - 1);
                        };
                    };

                    const right_arrow = this.getObject("right_arrow");
                    right_arrow.init = function() {
                        this.spriteX = 0;
                        this.spriteY = 0;
                        this.spriteWidth = 512;
                        this.spriteHeight = 512;

                        this.x = function() {
                            const grid = activeScreen.getObject("grid");
                            return grid.x() + grid.width() - grid.padding.x() / 2;
                        };

                        this.y = function() {
                            const grid = activeScreen.getObject("grid");
                            return grid.y() + (grid.height() - this.height()) / 2;
                        };

                        this.width = function() {
                            return this.height();
                        };

                        this.height = function() {
                            const grid = activeScreen.getObject("grid");
                            return grid.height() * 0.45;
                        };

                        this.sprX = this.x;
                        this.sprY = this.y;
                        this.sprWidth = this.width;
                        this.sprHeight = this.height;

                        this.onclick = function() {
                            const grid = activeScreen.getObject("grid");
                            if (grid.itens.count - grid.offset > grid.count) grid.offset++;
                        };
                    };

                    this.objects.forEach(obj => { obj.init() });

                    this.initLevel();
                    this.onload = false;
                }
            },

            initLevel() {
                const grid = this.getObject("grid");

                this.objects.push(
                    new RenderObject("level_frame", "level", null, null, null, null, null, "preto-t40", "branco", 1, null, null, null, null, null, null, 0, false, false, false, true, true, false),
                );

                this.objPosition["level_frame"] = this.objects.length - 1;

                const level_frame = this.getObject("level_frame");
                level_frame.objects_per_line = this.level.columns;
                level_frame.lines = this.level.lines;
                level_frame.init = function() {
                    this.x = grid.x;

                    this.y = function() {
                        return canvas.height * 0.35 - this.height() * 0.5;
                    }

                    this.width = grid.width;

                    this.height = function() {
                        return canvas.height * 0.6;
                    }

                    this.borderRadius = function() { return 0; }
                };

                level_frame.init();

                let blocks = [];

                this.level.paths.forEach((line, index) => {
                    for (let i = 0; i < line.length; i++) {
                        switch (line.charAt(i)) {
                            case "#": {
                                const block = new RenderObject("path_block-", "level_block", null, null, null, null, null, null, null, 0, null, null, null, null, null, null, 0, false, false, false, false, false, false, "./assets/image/blocks_tiles/path_block", null, true)

                                block.init = function() {
                                    this.spriteX = 0;
                                    this.spriteY = 0;
                                    this.spriteWidth = 32;
                                    this.spriteHeight = 32;

                                    this.name += (index * level_frame.objects_per_line + i);
                                    this.line = index;
                                    this.index = i;

                                    this.x = function() {
                                        const frame = activeScreen.getObject("level_frame");
                                        if (frame.objects_per_line % 2 == 0) {
                                            return frame.x() + frame.width() * 0.5 + (this.width() + this.px()) * (this.index - frame.objects_per_line / 2);
                                        }

                                        else {
                                            if (this.index == Math.floor(frame.objects_per_line / 2)) return frame.x() + frame.width() * 0.5 - (this.width() + this.px()) * 0.5;
                                            else return frame.x() + frame.width() * 0.5 + (this.width() + this.px()) * (this.index - frame.objects_per_line / 2);
                                        }
                                    };

                                    this.y = function() {
                                        const frame = activeScreen.getObject("level_frame");
                                        if (frame.lines % 2 == 0) {
                                            return frame.y() + frame.height() * 0.5 + (this.height() + this.py()) * (this.line - frame.lines / 2);
                                        }

                                        else {
                                            if (this.line == Math.floor(frame.lines / 2)) return frame.y() + frame.height() * 0.5 - (this.height() + this.py()) * 0.5;
                                            else return frame.y() + frame.height() * 0.5 + (this.height() + this.py()) * (this.line - frame.lines / 2);
                                        }
                                    }

                                    this.height = function() {
                                        return canvas.height * 0.06;
                                    };

                                    this.width = this.height;

                                    this.sprX = this.x;
                                    this.sprY = this.y;
                                    this.sprWidth = this.width;
                                    this.sprHeight = this.height;

                                    this.px = function() {
                                        return 0;
                                    };

                                    this.py = function() {
                                        return 0;
                                    };

                                    this.borderRadius = function() { return 0; }

                                    let bottom = false, left = false, right = false, top = false;

                                    if (i % level_frame.objects_per_line == 0) left = true;
                                    if (i % level_frame.objects_per_line == level_frame.objects_per_line - 1) right = true;
                                    if (index % level_frame.lines == 0) top = true;
                                    if (index % level_frame.lines == level_frame.lines - 1) bottom = true;

                                    this.imageSrc += (bottom ? "-bottom" : "") + (left ? "-left" : "") + (right ? "-right" : "") + (top ? "-top" : "") + ".png";
                                    this.image.src = this.imageSrc;
                                }

                                const shadow = new RenderObject("path_block-", "level_block-shadow", null, null, null, null, null, "preto-t40", null, 0, null, null, null, null, null, null, 0, false, false, false, true, false, false)
                                shadow.init = function() {
                                    this.name += (index * level_frame.objects_per_line + i) + "-shadow";
                                    this.line = index;
                                    this.index = i;

                                    this.x = function() {
                                        const block = activeScreen.getObject(this.name.split("-shadow")[0]);
                                        return block.x() + block.width() * 0.15;
                                    };

                                    this.y = function() {
                                        const block = activeScreen.getObject(this.name.split("-shadow")[0]);
                                        return block.y() + block.height() * 0.15;
                                    }

                                    this.height = function() {
                                        const block = activeScreen.getObject(this.name.split("-shadow")[0]);
                                        return block.height();
                                    };

                                    this.width = this.height;

                                    this.borderRadius = function() { return 0; }
                                }

                                blocks.push(shadow);
                                blocks.push(block);
                                break;
                            }
                        }
                    }
                });

                blocks.forEach(obj => {
                    obj.init();
                    activeScreen.objects.push(obj);
                    activeScreen.objPosition[obj.name] = activeScreen.objects.length - 1;
                });

                blocks = [];

                this.level.itens.forEach((line, index) => {
                    for (let i = 0; i < line.length; i++) {
                        if (this.level.itens[index].charAt(i) == "#") {
                            const aux = new RenderObject("item-" + (this.level.lines * index + i), "level", null, null, null, null, null, "verde", null, 0, null, null, null, null, null, null, 0, false, false, false, false, false, false, "./assets/image/item.png", null, true);
                            aux.init = function() {
                                this.spriteX = 0;
                                this.spriteY = 0;
                                this.spriteWidth = 24;
                                this.spriteHeight = 24;

                                this.x = function() {
                                    const tmp = activeScreen.getObject("path_block-" + (activeScreen.level.lines * index + i));
                                    return tmp.x() + (tmp.width() - this.width()) / 2;
                                }

                                this.y = function() {
                                    const tmp = activeScreen.getObject("path_block-" + (activeScreen.level.lines * index + i));
                                    return tmp.y() + (tmp.height() - this.height()) / 2;
                                }

                                this.width = function() {
                                    const tmp = activeScreen.getObject("path_block-" + (activeScreen.level.lines * index + i));
                                    return tmp.width() * 0.3;
                                }

                                this.height = function() {
                                    const tmp = activeScreen.getObject("path_block-" + (activeScreen.level.lines * index + i));
                                    return tmp.height() * 0.3;
                                }

                                this.sprX = this.x;
                                this.sprY = this.y;
                                this.sprWidth = this.width;
                                this.sprHeight = this.height;

                                this.borderRadius = function() { return 0; }
                            };

                            blocks.push(aux);
                        }
                    }
                });

                const player = new RenderObject("player", "player", null, null, null, null, null, null, "azul", 1, null, null, null, null, null, null, 0, false, false, false, false, false, false, "./assets/image/player.png", null, true)
                player.init = function() {
                    this.itensCollected = 0;

                    this.resetState = function() {
                        this.stateCord = {
                            x: activeScreen.level.player.x,
                            y: activeScreen.level.player.y,
                            direction: activeScreen.level.player.direction
                        }
                    }

                    this.resetState();

                    this.x = function() {
                        const block = activeScreen.getObject('path_block-0');
                        return block.x() + (block.width() + block.px()) * (this.stateCord.x - 1) + (block.width() - this.width()) / 2;
                    }

                    this.y = function() {
                        const block = activeScreen.getObject('path_block-0');
                        return block.y() + (block.height() + block.py()) * (this.stateCord.y - 1) + (block.height() - this.height()) / 2;
                    }

                    this.height = function() {
                        const block = activeScreen.getObject('path_block-0');
                        return block.height() * 0.8;
                    }

                    this.width = function() {
                        return this.height() * (this.statesMap[this.animState].width / this.statesMap[this.animState].height);
                    }

                    this.sprX = this.x;
                    this.sprY = this.y;
                    this.sprWidth = this.width;
                    this.sprHeight = this.height;

                    this.borderRadius = function() {
                        return 0;
                    }

                    this.animState = 'idle';
                    this.animTemp = 0;
                    this.currentFrame = 0;
                    this.changeState = {
                        new: 'idle',
                        ready: true
                    };

                    this.statesMap = {
                        idle: {
                            coords: {
                                'N': {
                                    x: 0,
                                    y: 69
                                },

                                'L': {
                                    x: 1,
                                    y: 38
                                },

                                'S': {
                                    x: 1,
                                    y: 6
                                },

                                'O': {
                                    x: 0,
                                    y: 102
                                }
                            },

                            width: 15,
                            height: 22,
                            offset: 81,
                            count: 2,
                            vel: 20,
                        },

                        walk: {
                            coords: {
                                'N': {
                                    x: 0,
                                    y: 69
                                },

                                'L': {
                                    x: 1,
                                    y: 38
                                },

                                'S': {
                                    x: 1,
                                    y: 6
                                },

                                'O': {
                                    x: 0,
                                    y: 102
                                }
                            },

                            width: 15,
                            height: 22,
                            offset: 1,
                            count: 4,
                            vel: 4
                        },

                        die: {

                        }
                    }

                    this.spriteX = 0;
                    this.spriteY = 0;
                    this.spriteWidth = 0;
                    this.spriteHeight = 0;

                    this.itensBuffer = [];

                    this.movement = {
                        has: false,
                        fun: null
                    }

                    this.update = function() {
                        if (activeScreen.passForward == 1) {
                            try {
                                let numX = Math.round(this.stateCord.x);
                                let numY = Math.round(this.stateCord.y);

                                if (this.stateCord.direction == 'L') {
                                    numX -= 0;
                                    numY -= 1;
                                }
                                else if (this.stateCord.direction == 'O') {
                                    numX -= 2;
                                    numY -= 1;
                                }
                                else if (this.stateCord.direction == 'S') {
                                    numX -= 1;
                                    numY -= 0;
                                }
                                else {
                                    numX -= 1;
                                    numY -= 2;
                                }

                                const i = activeScreen.getObject("item-" + (numY * activeScreen.level.columns + numX));
                                i.active = false;
                                this.itensCollected++;
                                this.itensBuffer.push(i.name);
                            }

                            catch { }
                        }

                        if (this.changeState.ready) {
                            this.spriteX = this.statesMap[this.changeState.new].coords[this.stateCord.direction].x;
                            this.spriteY = this.statesMap[this.changeState.new].coords[this.stateCord.direction].y;
                            this.spriteWidth = this.statesMap[this.changeState.new].width;
                            this.spriteHeight = this.statesMap[this.changeState.new].height;
                            this.stateCord.x = Math.round(this.stateCord.x);
                            this.stateCord.y = Math.round(this.stateCord.y);
                            this.animState = this.changeState.new;
                            this.changeState.ready = false;
                            this.currentFrame = 0;
                            this.animTemp = 0;
                        }

                        if (this.animTemp == this.statesMap[this.animState].vel) {
                            if (this.currentFrame == this.statesMap[this.animState].count - 1) {
                                this.spriteX = this.statesMap[this.animState].coords[this.stateCord.direction].x;
                                this.currentFrame = 0;
                            }

                            else {
                                this.spriteX += this.spriteWidth + this.statesMap[this.animState].offset;
                                this.currentFrame++;
                            }

                            if (this.movement.has) this.movement.fun();
                            else
                                switch (this.animState) {
                                    case 'idle': {
                                        break;
                                    }

                                    case 'walk': {
                                        switch (this.stateCord.direction) {
                                            case 'N': {
                                                if (this.stateCord.y > 1) {
                                                    if (activeScreen.level.paths[Math.round(this.stateCord.y - 2)].charAt(Math.round(this.stateCord.x - 1)) == '#') {
                                                        this.movement.has = true;
                                                        this.movement.fun = function() {
                                                            const player = activeScreen.getObject('player');
                                                            player.stateCord.y -= 1 / (60 / player.statesMap[player.animState].vel); }
                                                        this.stateCord.y -= 1 / (60 / this.statesMap[this.animState].vel);
                                                    }
                                                }

                                                break;
                                            }

                                            case 'L': {
                                                if (this.stateCord.x < activeScreen.level.columns) {
                                                    if (activeScreen.level.paths[Math.round(this.stateCord.y - 1)].charAt(Math.round(this.stateCord.x)) == '#') {
                                                        this.movement.has = true;
                                                        this.movement.fun = function() {
                                                            const player = activeScreen.getObject('player');
                                                            player.stateCord.x += 1 / (60 / player.statesMap[player.animState].vel);
                                                        }
                                                        this.stateCord.x += 1 / (60 / this.statesMap[this.animState].vel);
                                                    }
                                                }

                                                break;
                                            }
                                            case 'S': {
                                                if (this.stateCord.y < activeScreen.level.lines) {
                                                    if (activeScreen.level.paths[Math.round(this.stateCord.y)].charAt(Math.round(this.stateCord.x - 1)) == '#') {
                                                        this.movement.has = true;
                                                        this.movement.fun = function() {
                                                            const player = activeScreen.getObject('player');
                                                            player.stateCord.y += 1 / (60 / player.statesMap[player.animState].vel);
                                                        }
                                                        this.stateCord.y += 1 / (60 / this.statesMap[this.animState].vel);
                                                    }
                                                }

                                                break;
                                            }
                                            case 'O': {
                                                if (this.stateCord.x > 1) {
                                                    if (activeScreen.level.paths[Math.round(this.stateCord.y - 1)].charAt(Math.round(this.stateCord.x - 2)) == '#') {
                                                        this.movement.has = true;
                                                        this.movement.fun = function() {
                                                            const player = activeScreen.getObject('player');
                                                            player.stateCord.x -= 1 / (60 / player.statesMap[player.animState].vel); }
                                                        this.stateCord.x -= 1 / (60 / this.statesMap[this.animState].vel);
                                                    }
                                                }

                                                break;
                                            }
                                        }

                                        break;
                                    }
                                }

                            this.animTemp = 0;
                        }

                        this.animTemp++;
                    }
                }

                blocks.push(player);

                blocks.forEach(block => {
                    block.init();
                    activeScreen.objects.push(block);
                    activeScreen.objPosition[block.name] = activeScreen.objects.length - 1;
                });
            },

            getObject(name) {
                return this.objects[this.objPosition[name]];
            },

            destroyObject(name) {
                const pos = this.objPosition[name];
                const aux = [];

                this.objects.forEach((obj, index) => {
                    if (index != pos) aux.push(obj);
                });

                this.objects = aux;
                this.objPosition[name] = undefined;

                Object.keys(this.objPosition).forEach(key => {
                    if (this.objPosition[key] > pos) this.objPosition[key]--;
                });
            },

            counter: 0,
            current: 0,
            loop_index: [],
            passForward: 0,

            run_game() {
                const itens = this.getObject("grid").itens;
                const player = this.getObject("player");

                if (this.passForward > 0) this.passForward--;

                if (this.counter % 60 * 5 == 0) {
                    player.movement.has = false;

                    player.changeState = {
                        new: 'idle',
                        ready: true
                    }

                    let obj = undefined, objKey = undefined;

                    Object.keys(itens.all).forEach(key => {
                        const aux = this.getObject(key);

                        if (itens.all[key].index == this.current) {
                            obj = itens.all[key];
                            objKey = key;
                            aux.state = 'hover';
                        }

                        else aux.state = 'normal';
                    });

                    if (!(itens.count > this.current)) this.current++;

                    else {
                        switch (obj.type) {
                            case "forward": {
                                this.passForward = 1;

                                player.changeState = {
                                    new: 'walk',
                                    ready: true
                                }

                                break;
                            }

                            case "turn": {
                                const dir = player.stateCord.direction == 'N' ? 'L' : player.stateCord.direction == 'L' ? 'S' : player.stateCord.direction == 'S' ? 'O' : 'N';
                                player.stateCord.direction = dir;

                                break;
                            }

                            case "loop": {
                                let found = undefined;

                                this.loop_index.forEach(obj => {
                                    if (obj.end == this.current && obj.count > 1) {
                                        found = obj.start;
                                        obj.count--;
                                    }

                                    else if (obj.end == this.current && obj.count <= 1) {
                                        obj.count = this.getObject(objKey).loop_count;
                                        found = this.current;
                                    }
                                });

                                if (found != undefined) this.current = found;

                                else {
                                    const name = this.getObject(objKey).parthener;
                                    let endIndex = undefined;

                                    Object.keys(itens.all).forEach(key => {
                                        if (endIndex) return;
                                        if (key == name) endIndex = itens.all[key].index;
                                    });

                                    this.loop_index.push({ start: this.current, end: endIndex, count: this.getObject(objKey).loop_count });
                                }

                                break;
                            }
                        }

                        this.current++;
                        this.counter = 0;
                    }
                }

                if (itens.count == this.current - 1) {
                    this.game_running = false;
                    this.counter = 0;
                    this.current = 0;
                    this.loop_index = [];
                    player.resetState();
                    player.changeState = {
                        new: 'idle',
                        ready: true
                    }

                    player.itensBuffer.forEach(item => {
                        this.getObject(item).active = true;
                    });

                    if (player.itensCollected == activeScreen.level.quantItens) {
                        bd[this.label] = true;
                        changeScreen(screens.lobby);
                    }

                    player.itensCollected = 0;
                }

                this.counter++;
            }
        },

        level_2: {
            label: "level_2",
            level: {
                paths: [
                    "###",
                    "#.#",
                    "###",
                ],

                itens: [
                    "##.",
                    "#.#",
                    "###",
                ],

                enemies: [
                    "...",
                    "...",
                    "...",
                ],

                player: {
                    x: 3,
                    y: 1,
                    direction: 'S'
                },

                columns: 3,
                lines: 3,
                quantItens: 7,
            },

            onload: true,
            objects: [],
            objPosition: {},
            game_running: false,

            background: {
                image: new Image(),
                imageSrc: "./assets/image/background.png",
                layerColor: "rgba(0, 0, 0, 0.5)",

                render() {
                    ctx.drawImage(this.image, 0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = this.layerColor;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
            },

            render() {
                this.update();
                this.background.render();

                this.objects.forEach(obj => {
                    if (!this.game_running) obj.update();
                    else if (obj.name == 'player') obj.update();

                    if (obj.active) obj.render();
                    if (obj.renderAux) obj.renderAux();
                });

                if (this.game_running) {
                    this.run_game();
                }
            },

            update() {
                if (this.onload) {
                    this.background.image.src = this.background.imageSrc;

                    this.objects = [];
                    this.objects.push(
                        new RenderObject(
                            "grid", "interface",
                            null, null, null, null, null,
                            null, null, 0, null, null, null, null, null, null, 0, false, false, false, false, false, false,
                            "./assets/image/grid.png", null, true
                        ),
                        new RenderObject(
                            "play_button", "interface",
                            null, null, null, null, null,
                            null, null, 0, null, null, null, null, null, null, 0, false, true, true, false, false, false,
                            "./assets/image/play_button.png", "./assets/image/play_button-hover.png", true
                        ),
                        new RenderObject(
                            "left_arrow", "interface",
                            null, null, null, null, function() { return 0; },
                            null, null, 0, null, null,
                            null, null,
                            null, null, null,
                            false, true, true, false, false, false,
                            "./assets/image/arrow_left.png", "./assets/image/arrow_left-hover.png", true
                        ),
                        new RenderObject(
                            "right_arrow", "interface",
                            null, null, null, null, function() { return 0; },
                            null, null, 0, null, null,
                            null, null,
                            null, null, null,
                            false, true, true, false, false, false,
                            "./assets/image/arrow_right.png", "./assets/image/arrow_right-hover.png", true
                        ),
                        new RenderObject(
                            "forward_block", "control",
                            null, null, null, null, null,
                            null, null, 0, null, null, null, null, null, null, 0, true, false, true, false, false, false,
                            "./assets/image/forward_block.png", "./assets/image/forward_block-hover.png", true
                        ),
                        new RenderObject(
                            "turn_block", "control",
                            null, null, null, null, null,
                            null, null, 0, null, null, null, null, null, null, 0, true, false, true, false, false, false,
                            "./assets/image/turn_block.png", "./assets/image/turn_block-hover.png", true
                        ),
                        new RenderObject(
                            "loop_block", "control",
                            null, null, null, null, null,
                            null, null, 0, null, null, null, null, null, null, 0, true, false, true, false, false, false,
                            "./assets/image/loop_block.png", "./assets/image/loop_block-hover.png", true
                        )
                    );

                    this.objects.forEach((obj, index) => {
                        this.objPosition[obj.name] = index;
                    });

                    const grid = this.getObject("grid");
                    grid.init = function() {
                        this.count = 0;
                        this.offset = 0;

                        this.x = function() { return canvas.width * 0.2; };
                        this.y = function() { return canvas.height * 0.7; };
                        this.width = function() { return canvas.width * 0.6; };
                        this.height = function() { return canvas.height * 0.15; };
                        this.borderRadius = function() { return 0; };

                        this.spriteX = 0;
                        this.spriteY = 0;
                        this.spriteWidth = 1285;
                        this.spriteHeight = 252;

                        this.sprX = this.x;
                        this.sprY = this.y;
                        this.sprWidth = this.width;
                        this.sprHeight = this.height;

                        this.itens = {
                            all: {},
                            count: 0
                        };

                        this.padding = {
                            x: function() {
                                return activeScreen.getObject("grid").width() * 0.05;
                            },

                            y: function() {
                                return (activeScreen.getObject("grid").height() - canvas.height * 0.1) * 0.5;
                            }
                        };

                        this.update = function() {
                            const size = this.width() - this.padding.x() * 2;
                            this.count = Math.floor(size / activeScreen.getObject("forward_block").width());
                        };
                    };

                    const play_button = this.getObject("play_button");
                    play_button.init = function() {
                        this.spriteX = 0;
                        this.spriteY = 0;
                        this.spriteWidth = 214;
                        this.spriteHeight = 214;

                        this.x = function() { return canvas.width * 0.2 + canvas.width * 0.65; },

                        this.y = function() {
                            const grid = activeScreen.getObject("grid");
                            return grid.y() + grid.padding.y();
                        }

                        this.width = function() { return canvas.height * 0.1; },
                        this.height = function() { return canvas.height * 0.1; },
                        this.borderRadius = function() { return this.width() * 0.1; },

                        this.onclick = function() {
                            if (this.checkBlocks()) {
                                this.state = 'normal';
                                activeScreen.game_running = true;
                            }

                            else { alert("Não coloque dois blocos de repetição entrelaçados!\nColoque o bloco de abertura e de fechamento na mesma região"); }
                        }

                        this.checkBlocks = function() {
                            const grid = activeScreen.getObject("grid");
                            const tmp = Array(grid.itens.count);

                            Object.keys(grid.itens.all).forEach(key => {
                                tmp[grid.itens.all[key].index] = {
                                    name: key,
                                    type: grid.itens.all[key].type
                                }
                            });

                            let res = true;
                            let parthener = undefined;
                            tmp.forEach(item => {
                                if (!res) return;

                                if (item.type == 'loop') {
                                    if (!parthener) parthener = activeScreen.getObject(item.name).parthener;
                                    else {
                                        if (parthener == item.name) parthener = undefined;
                                        else res = false;
                                    }
                                }
                            });

                            return res;
                        }

                        this.sprX = this.x;
                        this.sprY = this.y;
                        this.sprWidth = this.width;
                        this.sprHeight = this.height;
                    };

                    const forward_block = this.getObject("forward_block");
                    forward_block.init = function() {
                        this.spriteX = 0;
                        this.spriteY = 0;
                        this.spriteWidth = 214;
                        this.spriteHeight = 214;

                        this.x =  function() { return canvas.width * 0.5 - this.width() * 1.5 - 10; };
                        this.y = function() {
                            const grid = activeScreen.getObject('grid');
                            return grid.y() + grid.height() + grid.padding.y();
                        };

                        this.width = function() { return canvas.height * 0.1; };
                        this.height = function() { return canvas.height * 0.1; };
                        this.borderRadius = function() { return canvas.height * 0.1 * 0.35; };

                        this.resetPosition = function(resetObj = false) {
                            this.x =  function() { return canvas.width * 0.5 - this.width() * 1.5 - 10; };
                            this.y = function() {
                                const grid = activeScreen.getObject('grid');
                                return grid.y() + grid.height() + grid.padding.y();
                            };
                            this.width = function() { return canvas.height * 0.1; };
                            this.height = function() { return canvas.height * 0.1; };
                            this.borderRadius = function() { return canvas.height * 0.1 * 0.35; };
                        };

                        this.placeInGrid = function() {
                            const grid = activeScreen.getObject("grid");

                            let num = 0;
                            Object.keys(grid.itens.all).forEach(key => {
                                if (key.includes("forward") && key.length > this.name.length) num = Math.max(num, Number(key.split("-")[1]));
                            });

                            const objName = this.name + '-' + (num + 1);
                            const objPos = activeScreen.objPosition[this.name];

                            activeScreen.objects.splice(objPos, 0,
                                new RenderObject(objName, "block", null, null, null, null, this.borderRadius, this.fillColor, this.strokeColor, this.strokeWidth, this.text, this.textColor, this.textAlign, this.textVerticalAlign, this.textPosition, this.font, this.fontSize, true, false, true, false, false, false, this.imageSrc, this.imageHoverSrc, true)
                            );

                            Object.keys(activeScreen.objPosition).forEach(key => {
                                if (objPos <= activeScreen.objPosition[key]) activeScreen.objPosition[key]++;
                            });

                            activeScreen.objPosition[objName] = objPos;

                            grid.itens.all[objName] = {
                                type: "forward",
                                index: Object.keys(grid.itens.all).length
                            };

                            grid.itens.count++;

                            const newObj = activeScreen.getObject(objName);

                            newObj.init = function() {
                                this.spriteX = 0;
                                this.spriteY = 0;
                                this.spriteWidth = 214;
                                this.spriteHeight = 214;

                                this.width = function() {
                                    return canvas.height * 0.1;
                                };

                                this.height = function() {
                                    return this.width();
                                };

                                this.x = function() {
                                    const gridObj = activeScreen.getObject('grid');
                                    return gridObj.x() + gridObj.padding.x() + this.width() * (gridObj.itens.all[this.name].index - gridObj.offset);
                                };

                                this.y = function() {
                                    const gridObj = activeScreen.getObject('grid');
                                    return gridObj.padding.y() + gridObj.y();
                                };

                                this.resetPosition = function() {
                                    this.width = function() {
                                        return canvas.height * 0.1;
                                    };

                                    this.height = function() {
                                        return this.width();
                                    };

                                    this.x = function() {
                                        const gridObj = activeScreen.getObject('grid');
                                        return gridObj.x() + gridObj.padding.x() + this.width() * (gridObj.itens.all[this.name].index - gridObj.offset);
                                    };

                                    this.y = function() {
                                        const gridObj = activeScreen.getObject('grid');
                                        return gridObj.padding.y() + gridObj.y();
                                    };
                                };

                                this.update = function() {
                                    if (grid.itens.all[this.name].index < grid.offset || grid.itens.all[this.name].index > grid.offset + grid.count - 1) this.state = 'normal';

                                    this.sprX = this.x;
                                    this.sprY = this.y;
                                    this.sprWidth = this.width;
                                    this.sprHeight = this.height;

                                    if (this.hasBeenDraggable && !this.pressed) {
                                        const grid = activeScreen.getObject("grid");

                                        if (hasColision(this, grid)) {
                                            const pos = this.positionSwapCheck();
                                            if (pos !== null) this.changePosition(pos);
                                            this.resetPosition();
                                        }

                                        else {
                                            activeScreen.destroyObject(this.name);
                                            const aux = {};
                                            Object.keys(grid.itens.all).forEach(key => {
                                                if (key != this.name) {
                                                    let pos = grid.itens.all[key];
                                                    if (grid.itens.all[key].index > grid.itens.all[this.name].index) pos.index--;
                                                    aux[key] = pos;
                                                }
                                            });

                                            grid.itens.count--;
                                            grid.itens.all = aux;
                                        }

                                        this.hasBeenDraggable = false;
                                    }
                                };

                                this.changePosition = function(name) {
                                    const grid = activeScreen.getObject("grid");
                                    const itemIndex = grid.itens.all[name].index;
                                    const thisIndex = grid.itens.all[this.name].index;
                                    let newPosition;

                                    if (itemIndex > thisIndex) {
                                        newPosition = itemIndex;
                                        Object.keys(grid.itens.all).forEach(key => {
                                            if (key == this.name) return;
                                            if (grid.itens.all[key].index >= grid.itens.all[this.name].index && grid.itens.all[key].index <= newPosition) grid.itens.all[key].index--;
                                        });
                                    }

                                    else {
                                        newPosition = itemIndex;
                                        Object.keys(grid.itens.all).forEach(key => {
                                            if (key == this.name) return;
                                            if (grid.itens.all[key].index <= grid.itens.all[this.name].index && grid.itens.all[key].index >= newPosition) grid.itens.all[key].index++;
                                        });
                                    }

                                    grid.itens.all[this.name].index = newPosition;
                                };

                                this.positionSwapCheck = function() {
                                    let res = null;

                                    activeScreen.objects.forEach(obj => {
                                        if (res !== null) return;

                                        if (obj.type == "block") {
                                            if (obj.state == "hover" && obj.name != this.name) {
                                                obj.state = 'normal';
                                                res = obj.name;
                                            }
                                        }
                                    });

                                    return res;
                                };
                            }

                            newObj.init();
                        };

                        this.update = function() {
                            this.sprX = this.x;
                            this.sprY = this.y;
                            this.sprWidth = this.width;
                            this.sprHeight = this.height;

                            if (this.hasBeenDraggable && !this.pressed) {
                                if (hasColision(this, activeScreen.getObject("grid"))) this.placeInGrid();

                                this.resetPosition();
                                this.hasBeenDraggable = false;
                            }
                        };
                    };

                    const turn_block = this.getObject("turn_block");
                    turn_block.init = function() {
                        this.spriteX = 0;
                        this.spriteY = 0;
                        this.spriteWidth = 214;
                        this.spriteHeight = 214;

                        this.x =  function() { return canvas.width * 0.5 - this.width() * 0.5; };
                        this.y = function() {
                            const grid = activeScreen.getObject('grid');
                            return grid.y() + grid.height() + grid.padding.y();
                        };

                        this.width = function() { return canvas.height * 0.1; };
                        this.height = function() { return canvas.height * 0.1; };
                        this.borderRadius = function() { return canvas.height * 0.1 * 0.1; };

                        this.resetPosition = function() {
                            this.x =  function() { return canvas.width * 0.5 - this.width() * 0.5; };
                            this.y = function() {
                                const grid = activeScreen.getObject('grid');
                                return grid.y() + grid.height() + grid.padding.y();
                            };
                            this.width = function() { return canvas.height * 0.1; };
                            this.height = function() { return canvas.height * 0.1; };
                            this.borderRadius = function() { return canvas.height * 0.1 * 0.1; };
                        };

                        this.placeInGrid = function() {
                            const grid = activeScreen.getObject("grid");

                            let num = 0;
                            Object.keys(grid.itens.all).forEach(key => {
                                if (key.includes("turn") && key.length > this.name.length) num = Math.max(num, Number(key.split("-")[1]));
                            });

                            const objName = this.name + '-' + (num + 1);
                            const objPos = activeScreen.objPosition["forward_block"];

                            activeScreen.objects.splice(objPos, 0,
                                new RenderObject(objName, "block", null, null, null, null, this.borderRadius, this.fillColor, this.strokeColor, this.strokeWidth, null, null, null, null, null, null, 0, true, false, true, false, false, false, this.imageSrc, this.imageHoverSrc, this.hasImage)
                            );

                            Object.keys(activeScreen.objPosition).forEach(key => {
                                if (objPos <= activeScreen.objPosition[key]) activeScreen.objPosition[key]++;
                            });

                            activeScreen.objPosition[objName] = objPos;

                            grid.itens.all[objName] = {
                                type: "turn",
                                index: Object.keys(grid.itens.all).length
                            };

                            grid.itens.count++;

                            const newObj = activeScreen.getObject(objName);

                            newObj.init = function() {
                                this.spriteX = 0;
                                this.spriteY = 0;
                                this.spriteWidth = 214;
                                this.spriteHeight = 214;

                                this.width = function() {
                                    return canvas.height * 0.1;
                                };

                                this.height = function() {
                                    return this.width();
                                };

                                this.x = function() {
                                    const gridObj = activeScreen.getObject('grid');
                                    return gridObj.x() + gridObj.padding.x() + this.width() * (gridObj.itens.all[this.name].index - gridObj.offset);
                                };

                                this.y = function() {
                                    const gridObj = activeScreen.getObject('grid');
                                    return gridObj.padding.y() + gridObj.y();
                                };

                                this.resetPosition = function() {
                                    this.width = function() {
                                        return canvas.height * 0.1;
                                    };

                                    this.height = function() {
                                        return this.width();
                                    };

                                    this.x = function() {
                                        const gridObj = activeScreen.getObject('grid');
                                        return gridObj.x() + gridObj.padding.x() + this.width() * (gridObj.itens.all[this.name].index - gridObj.offset);
                                    };

                                    this.y = function() {
                                        const gridObj = activeScreen.getObject('grid');
                                        return gridObj.padding.y() + gridObj.y();
                                    };
                                };

                                this.update = function() {
                                    if (grid.itens.all[this.name].index < grid.offset || grid.itens.all[this.name].index > grid.offset + grid.count - 1) this.state = 'normal';

                                    this.sprX = this.x;
                                    this.sprY = this.y;
                                    this.sprWidth = this.width;
                                    this.sprHeight = this.height;

                                    if (this.hasBeenDraggable && !this.pressed) {
                                        const grid = activeScreen.getObject("grid");
                                        if (hasColision(this, grid)) {
                                            const pos = this.positionSwapCheck();
                                            if (pos !== null) this.changePosition(pos);

                                            this.resetPosition();
                                        }

                                        else {
                                            activeScreen.destroyObject(this.name);
                                            const aux = {};
                                            Object.keys(grid.itens.all).forEach(key => {
                                                if (key != this.name) {
                                                    let pos = grid.itens.all[key];
                                                    if (grid.itens.all[key].index > grid.itens.all[this.name].index) pos.index--;
                                                    aux[key] = pos;
                                                }
                                            });

                                            grid.itens.count--;
                                            grid.itens.all = aux;
                                        }

                                        this.hasBeenDraggable = false;
                                    }
                                };

                                this.changePosition = function(name) {
                                    const grid = activeScreen.getObject("grid");
                                    const itemIndex = grid.itens.all[name].index;
                                    const thisIndex = grid.itens.all[this.name].index;
                                    let newPosition;

                                    if (itemIndex > thisIndex) {
                                        newPosition = itemIndex;
                                        Object.keys(grid.itens.all).forEach(key => {
                                            if (key == this.name) return;
                                            if (grid.itens.all[key].index >= grid.itens.all[this.name].index && grid.itens.all[key].index <= newPosition) grid.itens.all[key].index--;
                                        });
                                    }

                                    else {
                                        newPosition = itemIndex;
                                        Object.keys(grid.itens.all).forEach(key => {
                                            if (key == this.name) return;
                                            if (grid.itens.all[key].index <= grid.itens.all[this.name].index && grid.itens.all[key].index >= newPosition) grid.itens.all[key].index++;
                                        });
                                    }

                                    grid.itens.all[this.name].index = newPosition;
                                };

                                this.positionSwapCheck = function() {
                                    let res = null;

                                    activeScreen.objects.forEach(obj => {
                                        if (res !== null) return;

                                        if (obj.type == "block") {
                                            if (obj.state == "hover" && obj.name != this.name) {
                                                res = obj.name;
                                            }
                                        }
                                    });

                                    return res;
                                };
                            }

                            newObj.init();
                        };

                        this.update = function() {
                            this.sprX = this.x;
                            this.sprY = this.y;
                            this.sprWidth = this.width;
                            this.sprHeight = this.height;

                            if (this.hasBeenDraggable && !this.pressed) {
                                if (hasColision(this, activeScreen.getObject("grid"))) this.placeInGrid();

                                this.resetPosition();
                                this.hasBeenDraggable = false;
                            }
                        };
                    };

                    const loop_block = this.getObject("loop_block");
                    loop_block.init = function() {
                        this.spriteX = 0;
                        this.spriteY = 0;
                        this.spriteWidth = 214;
                        this.spriteHeight = 214;

                        this.x =  function() { return canvas.width * 0.5 + this.width() * 0.5 + 10; };
                        this.y = function() {
                            const grid = activeScreen.getObject('grid');
                            return grid.y() + grid.height() + grid.padding.y();
                        };
                        this.width = function() { return canvas.height * 0.1; };
                        this.height = function() { return canvas.height * 0.1; };
                        this.borderRadius = function() { return canvas.height * 0.1 * 0.1; };

                        this.resetPosition = function() {
                            this.x =  function() { return canvas.width * 0.5 + this.width() * 0.5 + 10; };
                            this.y = function() {
                                const grid = activeScreen.getObject('grid');
                                return grid.y() + grid.height() + grid.padding.y();
                            };

                            this.width = function() { return canvas.height * 0.1; };
                            this.height = function() { return canvas.height * 0.1; };
                            this.borderRadius = function() { return canvas.height * 0.1 * 0.1; };
                        };

                        this.placeInGrid = function() {
                            const grid = activeScreen.getObject("grid");

                            let num = 0;
                            Object.keys(grid.itens.all).forEach(key => {
                                if (key.includes("loop") && key.length > this.name.length) num = Math.max(num, Number(key.split("-")[1]));
                            });

                            const objName = this.name + '-';
                            const objPos = activeScreen.objPosition["forward_block"];

                            activeScreen.objects.splice(objPos, 0,
                                new RenderObject(objName + (num + 1), "block", null, null, null, null, this.borderRadius, this.fillColor, this.strokeColor, this.strokeWidth, null, null, null, null, null, null, 0, true, true, true, false, false, false, this.imageSrc, this.imageHoverSrc, true),
                                new RenderObject(objName + (num + 2), "block", null, null, null, null, this.borderRadius, this.fillColor, this.strokeColor, this.strokeWidth, "", "branco", null, null, null, null, 0, true, true, true, false, false, false, this.imageSrc, this.imageHoverSrc, true)
                            );

                            Object.keys(activeScreen.objPosition).forEach(key => {
                                if (objPos <= activeScreen.objPosition[key]) activeScreen.objPosition[key] += 2;
                            });

                            activeScreen.objPosition[objName + (num + 1)] = objPos;
                            activeScreen.objPosition[objName + (num + 2)] = objPos + 1;

                            grid.itens.all[objName + (num + 1)] = {
                                type: "loop",
                                index: Object.keys(grid.itens.all).length
                            };

                            grid.itens.all[objName + (num + 2)] = {
                                type: "loop",
                                index: Object.keys(grid.itens.all).length
                            };

                            grid.itens.count += 2;

                            const newObj = activeScreen.getObject(objName + (num + 1));

                            newObj.init = function() {
                                this.spriteX = 0;
                                this.spriteY = 0;
                                this.spriteWidth = 214;
                                this.spriteHeight = 214;

                                this.parthener = objName + (num + 2);
                                this.loop_count = 2;
                                this.firstDrag = true;

                                this.renderAux = function() {
                                    const grid = activeScreen.getObject("grid");

                                    try {
                                        if (grid.itens.all[this.name].index < grid.offset || grid.itens.all[this.name].index > grid.offset + grid.count - 1) return;
                                    }

                                    catch (err) {
                                        if (grid.itens.all[this.parthener]) throw err;
                                    }

                                    const x = this.x() + this.width() * 0.82;
                                    const y = this.y() + this.width() * 0.18 * 0.5;

                                    ctx.fillCircle(x, y, this.width() * 0.18, "rgb(160, 30, 30)");
                                    ctx.fillStyle = "rgb(240, 240, 240)";
                                    ctx.textAlign = textAlign.horizontal.center;
                                    ctx.textBaseline = textAlign.vertical.center;
                                    ctx.font = `${fonts.small_text.size()}px '${fonts.small_text.font}'`;
                                    ctx.fillText(this.loop_count, x, y);
                                }

                                this.width = function() {
                                    return canvas.height * 0.1;
                                };

                                this.height = function() {
                                    return this.width();
                                };

                                this.x = function() {
                                    const gridObj = activeScreen.getObject('grid');
                                    return gridObj.x() + gridObj.padding.x() + this.width() * (gridObj.itens.all[this.name].index - gridObj.offset);
                                };

                                this.y = function() {
                                    const gridObj = activeScreen.getObject('grid');
                                    return gridObj.padding.y() + gridObj.y();
                                };

                                this.resetPosition = function() {
                                    this.width = function() {
                                        return canvas.height * 0.1;
                                    };

                                    this.height = function() {
                                        return this.width();
                                    };

                                    this.x = function() {
                                        const gridObj = activeScreen.getObject('grid');
                                        return gridObj.x() + gridObj.padding.x() + this.width() * (gridObj.itens.all[this.name].index - gridObj.offset);
                                    };

                                    this.y = function() {
                                        const gridObj = activeScreen.getObject('grid');
                                        return gridObj.padding.y() + gridObj.y();
                                    };
                                };

                                this.update = function() {
                                    if (grid.itens.all[this.name].index < grid.offset || grid.itens.all[this.name].index > grid.offset + grid.count - 1) this.state = 'normal';

                                    this.sprX = this.x;
                                    this.sprY = this.y;
                                    this.sprWidth = this.width;
                                    this.sprHeight = this.height;

                                    if (this.hasBeenDraggable && !this.pressed) {
                                        const grid = activeScreen.getObject("grid");
                                        if (hasColision(this, grid)) {
                                            const pos = this.positionSwapCheck();
                                            if (pos !== null) this.changePosition(pos);

                                            this.resetPosition();
                                        }

                                        else {
                                            activeScreen.destroyObject(this.parthener);

                                            let aux = {};
                                            Object.keys(grid.itens.all).forEach(key => {
                                                if (key != this.parthener) {
                                                    let pos = grid.itens.all[key];
                                                    if (grid.itens.all[key].index > grid.itens.all[this.parthener].index) pos.index--;
                                                    aux[key] = pos;
                                                }
                                            });

                                            grid.itens.count--;
                                            grid.itens.all = aux;

                                            activeScreen.destroyObject(this.name);
                                            aux = {};
                                            Object.keys(grid.itens.all).forEach(key => {
                                                if (key != this.name) {
                                                    let pos = grid.itens.all[key];
                                                    if (grid.itens.all[key].index > grid.itens.all[this.name].index) pos.index--;
                                                    aux[key] = pos;
                                                }
                                            });

                                            grid.itens.count--;
                                            grid.itens.all = aux;
                                        }

                                        this.hasBeenDraggable = false;
                                    }
                                };

                                this.changePosition = function(name) {
                                    const grid = activeScreen.getObject("grid");
                                    const itemIndex = grid.itens.all[name].index;
                                    const thisIndex = grid.itens.all[this.name].index;
                                    let newPosition;

                                    if (itemIndex > thisIndex) {
                                        newPosition = itemIndex;
                                        Object.keys(grid.itens.all).forEach(key => {
                                            if (key == this.name) return;
                                            if (grid.itens.all[key].index >= grid.itens.all[this.name].index && grid.itens.all[key].index <= newPosition) grid.itens.all[key].index--;
                                        });
                                    }

                                    else {
                                        newPosition = itemIndex;
                                        Object.keys(grid.itens.all).forEach(key => {
                                            if (key == this.name) return;
                                            if (grid.itens.all[key].index <= grid.itens.all[this.name].index && grid.itens.all[key].index >= newPosition) grid.itens.all[key].index++;
                                        });
                                    }

                                    grid.itens.all[this.name].index = newPosition;
                                };

                                this.positionSwapCheck = function() {
                                    let res = null;

                                    activeScreen.objects.forEach(obj => {
                                        if (res !== null) return;

                                        if (obj.type == "block") {
                                            if (obj.state == "hover" && obj.name != this.name) {
                                                res = obj.name;
                                            }
                                        }
                                    });

                                    return res;
                                };

                                this.onclick = function() {
                                    const grid = activeScreen.getObject("grid");
                                    if (grid.itens.all[this.name].index < grid.offset || grid.itens.all[this.name].index > grid.offset + grid.count - 1) return;

                                    if (this.loop_count < 10) this.loop_count++;
                                    else this.loop_count = 2;

                                    activeScreen.getObject(this.parthener).loop_count = this.loop_count;
                                }
                            }

                            const newObj2 = activeScreen.getObject(objName + (num + 2));
                            newObj2.init = newObj.init;

                            newObj.init();
                            newObj2.init();
                            newObj2.parthener = objName + (num + 1);
                            newObj2.loop_count = 2;
                        };

                        this.update = function() {
                            this.sprX = this.x;
                            this.sprY = this.y;
                            this.sprWidth = this.width;
                            this.sprHeight = this.height;

                            if (this.hasBeenDraggable && !this.pressed) {
                                if (hasColision(this, activeScreen.getObject("grid"))) this.placeInGrid();

                                this.resetPosition();
                                this.hasBeenDraggable = false;
                            }
                        };
                    };

                    const left_arrow = this.getObject("left_arrow");
                    left_arrow.init = function() {
                        this.spriteX = 0;
                        this.spriteY = 0;
                        this.spriteWidth = 512;
                        this.spriteHeight = 512;

                        this.x = function() {
                            const grid = activeScreen.getObject("grid");
                            return grid.x() - grid.padding.x() / 2;
                        };

                        this.y = function() {
                            const grid = activeScreen.getObject("grid");
                            return grid.y() + (grid.height() - this.height()) / 2;
                        };

                        this.width = function() {
                            return this.height();
                        };

                        this.height = function() {
                            const grid = activeScreen.getObject("grid");
                            return grid.height() * 0.45;
                        };

                        this.sprX = this.x;
                        this.sprY = this.y;
                        this.sprWidth = this.width;
                        this.sprHeight = this.height;

                        this.onclick = function() {
                            const grid = activeScreen.getObject("grid");
                            grid.offset = Math.max(0, grid.offset - 1);
                        };
                    };

                    const right_arrow = this.getObject("right_arrow");
                    right_arrow.init = function() {
                        this.spriteX = 0;
                        this.spriteY = 0;
                        this.spriteWidth = 512;
                        this.spriteHeight = 512;

                        this.x = function() {
                            const grid = activeScreen.getObject("grid");
                            return grid.x() + grid.width() - grid.padding.x() / 2;
                        };

                        this.y = function() {
                            const grid = activeScreen.getObject("grid");
                            return grid.y() + (grid.height() - this.height()) / 2;
                        };

                        this.width = function() {
                            return this.height();
                        };

                        this.height = function() {
                            const grid = activeScreen.getObject("grid");
                            return grid.height() * 0.45;
                        };

                        this.sprX = this.x;
                        this.sprY = this.y;
                        this.sprWidth = this.width;
                        this.sprHeight = this.height;

                        this.onclick = function() {
                            const grid = activeScreen.getObject("grid");
                            if (grid.itens.count - grid.offset > grid.count) grid.offset++;
                        };
                    };

                    this.objects.forEach(obj => { obj.init() });

                    this.initLevel();
                    this.onload = false;
                }
            },

            initLevel() {
                const grid = this.getObject("grid");

                this.objects.push(
                    new RenderObject("level_frame", "level", null, null, null, null, null, "preto-t40", "branco", 1, null, null, null, null, null, null, 0, false, false, false, true, true, false),
                );

                this.objPosition["level_frame"] = this.objects.length - 1;

                const level_frame = this.getObject("level_frame");
                level_frame.objects_per_line = this.level.columns;
                level_frame.lines = this.level.lines;
                level_frame.init = function() {
                    this.x = grid.x;

                    this.y = function() {
                        return canvas.height * 0.35 - this.height() * 0.5;
                    }

                    this.width = grid.width;

                    this.height = function() {
                        return canvas.height * 0.6;
                    }

                    this.borderRadius = function() { return 0; }
                };

                level_frame.init();

                let blocks = [];

                this.level.paths.forEach((line, index) => {
                    for (let i = 0; i < line.length; i++) {
                        switch (line.charAt(i)) {
                            case "#": {
                                const block = new RenderObject("path_block-", "level_block", null, null, null, null, null, null, null, 0, null, null, null, null, null, null, 0, false, false, false, false, false, false, "./assets/image/blocks_tiles/path_block", null, true)

                                block.init = function() {
                                    this.spriteX = 0;
                                    this.spriteY = 0;
                                    this.spriteWidth = 32;
                                    this.spriteHeight = 32;

                                    this.name += (index * level_frame.objects_per_line + i);
                                    this.line = index;
                                    this.index = i;

                                    this.x = function() {
                                        const frame = activeScreen.getObject("level_frame");
                                        if (frame.objects_per_line % 2 == 0) {
                                            return frame.x() + frame.width() * 0.5 + (this.width() + this.px()) * (this.index - frame.objects_per_line / 2);
                                        }

                                        else {
                                            if (this.index == Math.floor(frame.objects_per_line / 2)) return frame.x() + frame.width() * 0.5 - (this.width() + this.px()) * 0.5;
                                            else return frame.x() + frame.width() * 0.5 + (this.width() + this.px()) * (this.index - frame.objects_per_line / 2);
                                        }
                                    };

                                    this.y = function() {
                                        const frame = activeScreen.getObject("level_frame");
                                        if (frame.lines % 2 == 0) {
                                            return frame.y() + frame.height() * 0.5 + (this.height() + this.py()) * (this.line - frame.lines / 2);
                                        }

                                        else {
                                            if (this.line == Math.floor(frame.lines / 2)) return frame.y() + frame.height() * 0.5 - (this.height() + this.py()) * 0.5;
                                            else return frame.y() + frame.height() * 0.5 + (this.height() + this.py()) * (this.line - frame.lines / 2);
                                        }
                                    }

                                    this.height = function() {
                                        return canvas.height * 0.06;
                                    };

                                    this.width = this.height;

                                    this.sprX = this.x;
                                    this.sprY = this.y;
                                    this.sprWidth = this.width;
                                    this.sprHeight = this.height;

                                    this.px = function() {
                                        return 0;
                                    };

                                    this.py = function() {
                                        return 0;
                                    };

                                    this.borderRadius = function() { return 0; }

                                    let bottom = false, left = false, right = false, top = false;

                                    if (i % level_frame.objects_per_line == 0) left = true;
                                    if (i % level_frame.objects_per_line == level_frame.objects_per_line - 1) right = true;
                                    if (index % level_frame.lines == 0) top = true;
                                    if (index % level_frame.lines == level_frame.lines - 1) bottom = true;

                                    this.imageSrc += (bottom ? "-bottom" : "") + (left ? "-left" : "") + (right ? "-right" : "") + (top ? "-top" : "") + ".png";
                                    this.image.src = this.imageSrc;
                                }

                                const shadow = new RenderObject("path_block-", "level_block-shadow", null, null, null, null, null, "preto-t40", null, 0, null, null, null, null, null, null, 0, false, false, false, true, false, false)
                                shadow.init = function() {
                                    this.name += (index * level_frame.objects_per_line + i) + "-shadow";
                                    this.line = index;
                                    this.index = i;

                                    this.x = function() {
                                        const block = activeScreen.getObject(this.name.split("-shadow")[0]);
                                        return block.x() + block.width() * 0.15;
                                    };

                                    this.y = function() {
                                        const block = activeScreen.getObject(this.name.split("-shadow")[0]);
                                        return block.y() + block.height() * 0.15;
                                    }

                                    this.height = function() {
                                        const block = activeScreen.getObject(this.name.split("-shadow")[0]);
                                        return block.height();
                                    };

                                    this.width = this.height;

                                    this.borderRadius = function() { return 0; }
                                }

                                blocks.push(shadow);
                                blocks.push(block);
                                break;
                            }
                        }
                    }
                });

                blocks.forEach(obj => {
                    obj.init();
                    activeScreen.objects.push(obj);
                    activeScreen.objPosition[obj.name] = activeScreen.objects.length - 1;
                });

                blocks = [];

                this.level.itens.forEach((line, index) => {
                    for (let i = 0; i < line.length; i++) {
                        if (this.level.itens[index].charAt(i) == "#") {
                            const aux = new RenderObject("item-" + (this.level.columns * index + i), "level", null, null, null, null, null, "verde", null, 0, null, null, null, null, null, null, 0, false, false, false, false, false, false, "./assets/image/item.png", null, true);
                            aux.init = function() {
                                this.spriteX = 0;
                                this.spriteY = 0;
                                this.spriteWidth = 24;
                                this.spriteHeight = 24;

                                this.x = function() {
                                    const tmp = activeScreen.getObject("path_block-" + (activeScreen.level.columns * index + i));
                                    return tmp.x() + (tmp.width() - this.width()) / 2;
                                }

                                this.y = function() {
                                    const tmp = activeScreen.getObject("path_block-" + (activeScreen.level.columns * index + i));
                                    return tmp.y() + (tmp.height() - this.height()) / 2;
                                }

                                this.width = function() {
                                    const tmp = activeScreen.getObject("path_block-" + (activeScreen.level.columns * index + i));
                                    return tmp.width() * 0.3;
                                }

                                this.height = function() {
                                    const tmp = activeScreen.getObject("path_block-" + (activeScreen.level.columns * index + i));
                                    return tmp.height() * 0.3;
                                }

                                this.sprX = this.x;
                                this.sprY = this.y;
                                this.sprWidth = this.width;
                                this.sprHeight = this.height;

                                this.borderRadius = function() { return 0; }
                            };

                            blocks.push(aux);
                        }
                    }
                });

                const player = new RenderObject("player", "player", null, null, null, null, null, null, "azul", 1, null, null, null, null, null, null, 0, false, false, false, false, false, false, "./assets/image/player.png", null, true)
                player.init = function() {
                    this.itensCollected = 0;

                    this.resetState = function() {
                        this.stateCord = {
                            x: activeScreen.level.player.x,
                            y: activeScreen.level.player.y,
                            direction: activeScreen.level.player.direction
                        }
                    }

                    this.resetState();

                    this.x = function() {
                        const block = activeScreen.getObject('path_block-0');
                        return block.x() + (block.width() + block.px()) * (this.stateCord.x - 1) + (block.width() - this.width()) / 2;
                    }

                    this.y = function() {
                        const block = activeScreen.getObject('path_block-0');
                        return block.y() + (block.height() + block.py()) * (this.stateCord.y - 1) + (block.height() - this.height()) / 2;
                    }

                    this.height = function() {
                        const block = activeScreen.getObject('path_block-0');
                        return block.height() * 0.8;
                    }

                    this.width = function() {
                        return this.height() * (this.statesMap[this.animState].width / this.statesMap[this.animState].height);
                    }

                    this.sprX = this.x;
                    this.sprY = this.y;
                    this.sprWidth = this.width;
                    this.sprHeight = this.height;

                    this.borderRadius = function() {
                        return 0;
                    }

                    this.animState = 'idle';
                    this.animTemp = 0;
                    this.currentFrame = 0;
                    this.changeState = {
                        new: 'idle',
                        ready: true
                    };

                    this.statesMap = {
                        idle: {
                            coords: {
                                'N': {
                                    x: 0,
                                    y: 69
                                },

                                'L': {
                                    x: 1,
                                    y: 38
                                },

                                'S': {
                                    x: 1,
                                    y: 6
                                },

                                'O': {
                                    x: 0,
                                    y: 102
                                }
                            },

                            width: 15,
                            height: 22,
                            offset: 81,
                            count: 2,
                            vel: 20,
                        },

                        walk: {
                            coords: {
                                'N': {
                                    x: 0,
                                    y: 69
                                },

                                'L': {
                                    x: 1,
                                    y: 38
                                },

                                'S': {
                                    x: 1,
                                    y: 6
                                },

                                'O': {
                                    x: 0,
                                    y: 102
                                }
                            },

                            width: 15,
                            height: 22,
                            offset: 1,
                            count: 4,
                            vel: 4
                        },

                        die: {

                        }
                    }

                    this.spriteX = 0;
                    this.spriteY = 0;
                    this.spriteWidth = 0;
                    this.spriteHeight = 0;

                    this.itensBuffer = [];

                    this.movement = {
                        has: false,
                        fun: null
                    }

                    this.update = function() {
                        if (activeScreen.passForward == 1) {
                            try {
                                let numX = Math.round(this.stateCord.x);
                                let numY = Math.round(this.stateCord.y);

                                if (this.stateCord.direction == 'L') {
                                    numX -= 0;
                                    numY -= 1;
                                }
                                else if (this.stateCord.direction == 'O') {
                                    numX -= 2;
                                    numY -= 1;
                                }
                                else if (this.stateCord.direction == 'S') {
                                    numX -= 1;
                                    numY -= 0;
                                }
                                else {
                                    numX -= 1;
                                    numY -= 2;
                                }

                                const i = activeScreen.getObject("item-" + (numY * activeScreen.level.columns + numX));
                                i.active = false;
                                this.itensCollected++;
                                this.itensBuffer.push(i.name);
                            }

                            catch { }
                        }

                        if (this.changeState.ready) {
                            this.spriteX = this.statesMap[this.changeState.new].coords[this.stateCord.direction].x;
                            this.spriteY = this.statesMap[this.changeState.new].coords[this.stateCord.direction].y;
                            this.spriteWidth = this.statesMap[this.changeState.new].width;
                            this.spriteHeight = this.statesMap[this.changeState.new].height;
                            this.stateCord.x = Math.round(this.stateCord.x);
                            this.stateCord.y = Math.round(this.stateCord.y);
                            this.animState = this.changeState.new;
                            this.changeState.ready = false;
                            this.currentFrame = 0;
                            this.animTemp = 0;
                        }

                        if (this.animTemp == this.statesMap[this.animState].vel) {
                            if (this.currentFrame == this.statesMap[this.animState].count - 1) {
                                this.spriteX = this.statesMap[this.animState].coords[this.stateCord.direction].x;
                                this.currentFrame = 0;
                            }

                            else {
                                this.spriteX += this.spriteWidth + this.statesMap[this.animState].offset;
                                this.currentFrame++;
                            }

                            if (this.movement.has) this.movement.fun();
                            else
                                switch (this.animState) {
                                    case 'idle': {
                                        break;
                                    }

                                    case 'walk': {
                                        switch (this.stateCord.direction) {
                                            case 'N': {
                                                if (this.stateCord.y > 1) {
                                                    if (activeScreen.level.paths[Math.round(this.stateCord.y - 2)].charAt(Math.round(this.stateCord.x - 1)) == '#') {
                                                        this.movement.has = true;
                                                        this.movement.fun = function() {
                                                            const player = activeScreen.getObject('player');
                                                            player.stateCord.y -= 1 / (60 / player.statesMap[player.animState].vel); }
                                                        this.stateCord.y -= 1 / (60 / this.statesMap[this.animState].vel);
                                                    }
                                                }

                                                break;
                                            }

                                            case 'L': {
                                                if (this.stateCord.x < activeScreen.level.columns) {
                                                    if (activeScreen.level.paths[Math.round(this.stateCord.y - 1)].charAt(Math.round(this.stateCord.x)) == '#') {
                                                        this.movement.has = true;
                                                        this.movement.fun = function() {
                                                            const player = activeScreen.getObject('player');
                                                            player.stateCord.x += 1 / (60 / player.statesMap[player.animState].vel);
                                                        }
                                                        this.stateCord.x += 1 / (60 / this.statesMap[this.animState].vel);
                                                    }
                                                }

                                                break;
                                            }
                                            case 'S': {
                                                if (this.stateCord.y < activeScreen.level.lines) {
                                                    if (activeScreen.level.paths[Math.round(this.stateCord.y)].charAt(Math.round(this.stateCord.x - 1)) == '#') {
                                                        this.movement.has = true;
                                                        this.movement.fun = function() {
                                                            const player = activeScreen.getObject('player');
                                                            player.stateCord.y += 1 / (60 / player.statesMap[player.animState].vel);
                                                        }
                                                        this.stateCord.y += 1 / (60 / this.statesMap[this.animState].vel);
                                                    }
                                                }

                                                break;
                                            }
                                            case 'O': {
                                                if (this.stateCord.x > 1) {
                                                    if (activeScreen.level.paths[Math.round(this.stateCord.y - 1)].charAt(Math.round(this.stateCord.x - 2)) == '#') {
                                                        this.movement.has = true;
                                                        this.movement.fun = function() {
                                                            const player = activeScreen.getObject('player');
                                                            player.stateCord.x -= 1 / (60 / player.statesMap[player.animState].vel); }
                                                        this.stateCord.x -= 1 / (60 / this.statesMap[this.animState].vel);
                                                    }
                                                }

                                                break;
                                            }
                                        }

                                        break;
                                    }
                                }

                            this.animTemp = 0;
                        }

                        this.animTemp++;
                    }
                }

                blocks.push(player);

                blocks.forEach(block => {
                    block.init();
                    activeScreen.objects.push(block);
                    activeScreen.objPosition[block.name] = activeScreen.objects.length - 1;
                });
            },

            getObject(name) {
                return this.objects[this.objPosition[name]];
            },

            destroyObject(name) {
                const pos = this.objPosition[name];
                const aux = [];

                this.objects.forEach((obj, index) => {
                    if (index != pos) aux.push(obj);
                });

                this.objects = aux;
                this.objPosition[name] = undefined;

                Object.keys(this.objPosition).forEach(key => {
                    if (this.objPosition[key] > pos) this.objPosition[key]--;
                });
            },

            counter: 0,
            current: 0,
            loop_index: [],
            passForward: 0,

            run_game() {
                const itens = this.getObject("grid").itens;
                const player = this.getObject("player");

                if (this.passForward > 0) this.passForward--;

                if (this.counter % 60 * 5 == 0) {
                    player.movement.has = false;
                    player.changeState = {
                        new: 'idle',
                        ready: true
                    }

                    let obj = undefined, objKey = undefined;

                    Object.keys(itens.all).forEach(key => {
                        const aux = this.getObject(key);

                        if (itens.all[key].index == this.current) {
                            obj = itens.all[key];
                            objKey = key;
                            aux.state = 'hover';
                        }

                        else aux.state = 'normal';
                    });

                    if (!(itens.count > this.current)) this.current++;

                    else {
                        switch (obj.type) {
                            case "forward": {
                                this.passForward = 1;

                                player.changeState = {
                                    new: 'walk',
                                    ready: true
                                }

                                break;
                            }

                            case "turn": {
                                const dir = player.stateCord.direction == 'N' ? 'L' : player.stateCord.direction == 'L' ? 'S' : player.stateCord.direction == 'S' ? 'O' : 'N';
                                player.stateCord.direction = dir;

                                break;
                            }

                            case "loop": {
                                let found = undefined;

                                this.loop_index.forEach(obj => {
                                    if (obj.end == this.current && obj.count > 1) {
                                        found = obj.start;
                                        obj.count--;
                                    }

                                    else if (obj.end == this.current && obj.count <= 1) {
                                        obj.count = this.getObject(objKey).loop_count;
                                        found = this.current;
                                    }
                                });

                                if (found != undefined) this.current = found;

                                else {
                                    const name = this.getObject(objKey).parthener;
                                    let endIndex = undefined;

                                    Object.keys(itens.all).forEach(key => {
                                        if (endIndex) return;
                                        if (key == name) endIndex = itens.all[key].index;
                                    });

                                    this.loop_index.push({ start: this.current, end: endIndex, count: this.getObject(objKey).loop_count });
                                }

                                break;
                            }
                        }

                        this.current++;
                        this.counter = 0;
                    }
                }

                if (itens.count == this.current - 1) {
                    this.game_running = false;
                    this.counter = 0;
                    this.current = 0;
                    this.loop_index = [];
                    player.resetState();
                    player.changeState = {
                        new: 'idle',
                        ready: true
                    }

                    player.itensBuffer.forEach(item => {
                        this.getObject(item).active = true;
                    });

                    if (player.itensCollected == activeScreen.level.quantItens) {
                        bd[this.label] = true;
                        changeScreen(screens.lobby);
                    }

                    player.itensCollected = 0;
                }

                this.counter++;
            }
        },

        level_3: {
            label: "level_3",
            level: {
                paths: [
                    "..#..",
                    "..#..",
                    "#####",
                    "..#..",
                    "..#.."
                ],

                itens: [
                    "..#..",
                    "..#..",
                    "##.##",
                    "..#..",
                    "..#.."
                ],

                enemies: [
                    ".....",
                    ".....",
                    ".....",
                    ".....",
                    "....."
                ],

                player: {
                    x: 3,
                    y: 3,
                    direction: 'S'
                },

                columns: 5,
                lines: 5,
                quantItens: 8,
            },

            onload: true,
            objects: [],
            objPosition: {},
            game_running: false,

            background: {
                image: new Image(),
                imageSrc: "./assets/image/background.png",
                layerColor: "rgba(0, 0, 0, 0.5)",

                render() {
                    ctx.drawImage(this.image, 0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = this.layerColor;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
            },

            render() {
                this.update();
                this.background.render();

                this.objects.forEach(obj => {
                    if (!this.game_running) obj.update();
                    else if (obj.name == 'player') obj.update();

                    if (obj.active) obj.render();
                    if (obj.renderAux) obj.renderAux();
                });

                if (this.game_running) {
                    this.run_game();
                }
            },

            update() {
                if (this.onload) {
                    this.background.image.src = this.background.imageSrc;

                    this.objects = [];
                    this.objects.push(
                        new RenderObject(
                            "grid", "interface",
                            null, null, null, null, null,
                            null, null, 0, null, null, null, null, null, null, 0, false, false, false, false, false, false,
                            "./assets/image/grid.png", null, true
                        ),
                        new RenderObject(
                            "play_button", "interface",
                            null, null, null, null, null,
                            null, null, 0, null, null, null, null, null, null, 0, false, true, true, false, false, false,
                            "./assets/image/play_button.png", "./assets/image/play_button-hover.png", true
                        ),
                        new RenderObject(
                            "left_arrow", "interface",
                            null, null, null, null, function() { return 0; },
                            null, null, 0, null, null,
                            null, null,
                            null, null, null,
                            false, true, true, false, false, false,
                            "./assets/image/arrow_left.png", "./assets/image/arrow_left-hover.png", true
                        ),
                        new RenderObject(
                            "right_arrow", "interface",
                            null, null, null, null, function() { return 0; },
                            null, null, 0, null, null,
                            null, null,
                            null, null, null,
                            false, true, true, false, false, false,
                            "./assets/image/arrow_right.png", "./assets/image/arrow_right-hover.png", true
                        ),
                        new RenderObject(
                            "forward_block", "control",
                            null, null, null, null, null,
                            null, null, 0, null, null, null, null, null, null, 0, true, false, true, false, false, false,
                            "./assets/image/forward_block.png", "./assets/image/forward_block-hover.png", true
                        ),
                        new RenderObject(
                            "turn_block", "control",
                            null, null, null, null, null,
                            null, null, 0, null, null, null, null, null, null, 0, true, false, true, false, false, false,
                            "./assets/image/turn_block.png", "./assets/image/turn_block-hover.png", true
                        ),
                        new RenderObject(
                            "loop_block", "control",
                            null, null, null, null, null,
                            null, null, 0, null, null, null, null, null, null, 0, true, false, true, false, false, false,
                            "./assets/image/loop_block.png", "./assets/image/loop_block-hover.png", true
                        )
                    );

                    this.objects.forEach((obj, index) => {
                        this.objPosition[obj.name] = index;
                    });

                    const grid = this.getObject("grid");
                    grid.init = function() {
                        this.count = 0;
                        this.offset = 0;

                        this.x = function() { return canvas.width * 0.2; };
                        this.y = function() { return canvas.height * 0.7; };
                        this.width = function() { return canvas.width * 0.6; };
                        this.height = function() { return canvas.height * 0.15; };
                        this.borderRadius = function() { return 0; };

                        this.spriteX = 0;
                        this.spriteY = 0;
                        this.spriteWidth = 1285;
                        this.spriteHeight = 252;

                        this.sprX = this.x;
                        this.sprY = this.y;
                        this.sprWidth = this.width;
                        this.sprHeight = this.height;

                        this.itens = {
                            all: {},
                            count: 0
                        };

                        this.padding = {
                            x: function() {
                                return activeScreen.getObject("grid").width() * 0.05;
                            },

                            y: function() {
                                return (activeScreen.getObject("grid").height() - canvas.height * 0.1) * 0.5;
                            }
                        };

                        this.update = function() {
                            const size = this.width() - this.padding.x() * 2;
                            this.count = Math.floor(size / activeScreen.getObject("forward_block").width());
                        };
                    };

                    const play_button = this.getObject("play_button");
                    play_button.init = function() {
                        this.spriteX = 0;
                        this.spriteY = 0;
                        this.spriteWidth = 214;
                        this.spriteHeight = 214;

                        this.x = function() { return canvas.width * 0.2 + canvas.width * 0.65; },

                        this.y = function() {
                            const grid = activeScreen.getObject("grid");
                            return grid.y() + grid.padding.y();
                        }

                        this.width = function() { return canvas.height * 0.1; },
                        this.height = function() { return canvas.height * 0.1; },
                        this.borderRadius = function() { return this.width() * 0.1; },

                        this.onclick = function() {
                            if (this.checkBlocks()) {
                                this.state = 'normal';
                                activeScreen.game_running = true;
                            }

                            else { alert("Não coloque dois blocos de repetição entrelaçados!\nColoque o bloco de abertura e de fechamento na mesma região"); }
                        }

                        this.checkBlocks = function() {
                            const grid = activeScreen.getObject("grid");
                            const tmp = Array(grid.itens.count);

                            Object.keys(grid.itens.all).forEach(key => {
                                tmp[grid.itens.all[key].index] = {
                                    name: key,
                                    type: grid.itens.all[key].type
                                }
                            });

                            let res = true;
                            let parthener = undefined;
                            tmp.forEach(item => {
                                if (!res) return;

                                if (item.type == 'loop') {
                                    if (!parthener) parthener = activeScreen.getObject(item.name).parthener;
                                    else {
                                        if (parthener == item.name) parthener = undefined;
                                        else res = false;
                                    }
                                }
                            });

                            return res;
                        }

                        this.sprX = this.x;
                        this.sprY = this.y;
                        this.sprWidth = this.width;
                        this.sprHeight = this.height;
                    };

                    const forward_block = this.getObject("forward_block");
                    forward_block.init = function() {
                        this.spriteX = 0;
                        this.spriteY = 0;
                        this.spriteWidth = 214;
                        this.spriteHeight = 214;

                        this.x =  function() { return canvas.width * 0.5 - this.width() * 1.5 - 10; };
                        this.y = function() {
                            const grid = activeScreen.getObject('grid');
                            return grid.y() + grid.height() + grid.padding.y();
                        };

                        this.width = function() { return canvas.height * 0.1; };
                        this.height = function() { return canvas.height * 0.1; };
                        this.borderRadius = function() { return canvas.height * 0.1 * 0.35; };

                        this.resetPosition = function(resetObj = false) {
                            this.x =  function() { return canvas.width * 0.5 - this.width() * 1.5 - 10; };
                            this.y = function() {
                                const grid = activeScreen.getObject('grid');
                                return grid.y() + grid.height() + grid.padding.y();
                            };
                            this.width = function() { return canvas.height * 0.1; };
                            this.height = function() { return canvas.height * 0.1; };
                            this.borderRadius = function() { return canvas.height * 0.1 * 0.35; };
                        };

                        this.placeInGrid = function() {
                            const grid = activeScreen.getObject("grid");

                            let num = 0;
                            Object.keys(grid.itens.all).forEach(key => {
                                if (key.includes("forward") && key.length > this.name.length) num = Math.max(num, Number(key.split("-")[1]));
                            });

                            const objName = this.name + '-' + (num + 1);
                            const objPos = activeScreen.objPosition[this.name];

                            activeScreen.objects.splice(objPos, 0,
                                new RenderObject(objName, "block", null, null, null, null, this.borderRadius, this.fillColor, this.strokeColor, this.strokeWidth, this.text, this.textColor, this.textAlign, this.textVerticalAlign, this.textPosition, this.font, this.fontSize, true, false, true, false, false, false, this.imageSrc, this.imageHoverSrc, true)
                            );

                            Object.keys(activeScreen.objPosition).forEach(key => {
                                if (objPos <= activeScreen.objPosition[key]) activeScreen.objPosition[key]++;
                            });

                            activeScreen.objPosition[objName] = objPos;

                            grid.itens.all[objName] = {
                                type: "forward",
                                index: Object.keys(grid.itens.all).length
                            };

                            grid.itens.count++;

                            const newObj = activeScreen.getObject(objName);

                            newObj.init = function() {
                                this.spriteX = 0;
                                this.spriteY = 0;
                                this.spriteWidth = 214;
                                this.spriteHeight = 214;

                                this.width = function() {
                                    return canvas.height * 0.1;
                                };

                                this.height = function() {
                                    return this.width();
                                };

                                this.x = function() {
                                    const gridObj = activeScreen.getObject('grid');
                                    return gridObj.x() + gridObj.padding.x() + this.width() * (gridObj.itens.all[this.name].index - gridObj.offset);
                                };

                                this.y = function() {
                                    const gridObj = activeScreen.getObject('grid');
                                    return gridObj.padding.y() + gridObj.y();
                                };

                                this.resetPosition = function() {
                                    this.width = function() {
                                        return canvas.height * 0.1;
                                    };

                                    this.height = function() {
                                        return this.width();
                                    };

                                    this.x = function() {
                                        const gridObj = activeScreen.getObject('grid');
                                        return gridObj.x() + gridObj.padding.x() + this.width() * (gridObj.itens.all[this.name].index - gridObj.offset);
                                    };

                                    this.y = function() {
                                        const gridObj = activeScreen.getObject('grid');
                                        return gridObj.padding.y() + gridObj.y();
                                    };
                                };

                                this.update = function() {
                                    if (grid.itens.all[this.name].index < grid.offset || grid.itens.all[this.name].index > grid.offset + grid.count - 1) this.state = 'normal';

                                    this.sprX = this.x;
                                    this.sprY = this.y;
                                    this.sprWidth = this.width;
                                    this.sprHeight = this.height;

                                    if (this.hasBeenDraggable && !this.pressed) {
                                        const grid = activeScreen.getObject("grid");

                                        if (hasColision(this, grid)) {
                                            const pos = this.positionSwapCheck();
                                            if (pos !== null) this.changePosition(pos);
                                            this.resetPosition();
                                        }

                                        else {
                                            activeScreen.destroyObject(this.name);
                                            const aux = {};
                                            Object.keys(grid.itens.all).forEach(key => {
                                                if (key != this.name) {
                                                    let pos = grid.itens.all[key];
                                                    if (grid.itens.all[key].index > grid.itens.all[this.name].index) pos.index--;
                                                    aux[key] = pos;
                                                }
                                            });

                                            grid.itens.count--;
                                            grid.itens.all = aux;
                                        }

                                        this.hasBeenDraggable = false;
                                    }
                                };

                                this.changePosition = function(name) {
                                    const grid = activeScreen.getObject("grid");
                                    const itemIndex = grid.itens.all[name].index;
                                    const thisIndex = grid.itens.all[this.name].index;
                                    let newPosition;

                                    if (itemIndex > thisIndex) {
                                        newPosition = itemIndex;
                                        Object.keys(grid.itens.all).forEach(key => {
                                            if (key == this.name) return;
                                            if (grid.itens.all[key].index >= grid.itens.all[this.name].index && grid.itens.all[key].index <= newPosition) grid.itens.all[key].index--;
                                        });
                                    }

                                    else {
                                        newPosition = itemIndex;
                                        Object.keys(grid.itens.all).forEach(key => {
                                            if (key == this.name) return;
                                            if (grid.itens.all[key].index <= grid.itens.all[this.name].index && grid.itens.all[key].index >= newPosition) grid.itens.all[key].index++;
                                        });
                                    }

                                    grid.itens.all[this.name].index = newPosition;
                                };

                                this.positionSwapCheck = function() {
                                    let res = null;

                                    activeScreen.objects.forEach(obj => {
                                        if (res !== null) return;

                                        if (obj.type == "block") {
                                            if (obj.state == "hover" && obj.name != this.name) {
                                                obj.state = 'normal';
                                                res = obj.name;
                                            }
                                        }
                                    });

                                    return res;
                                };
                            }

                            newObj.init();
                        };

                        this.update = function() {
                            this.sprX = this.x;
                            this.sprY = this.y;
                            this.sprWidth = this.width;
                            this.sprHeight = this.height;

                            if (this.hasBeenDraggable && !this.pressed) {
                                if (hasColision(this, activeScreen.getObject("grid"))) this.placeInGrid();

                                this.resetPosition();
                                this.hasBeenDraggable = false;
                            }
                        };
                    };

                    const turn_block = this.getObject("turn_block");
                    turn_block.init = function() {
                        this.spriteX = 0;
                        this.spriteY = 0;
                        this.spriteWidth = 214;
                        this.spriteHeight = 214;

                        this.x =  function() { return canvas.width * 0.5 - this.width() * 0.5; };
                        this.y = function() {
                            const grid = activeScreen.getObject('grid');
                            return grid.y() + grid.height() + grid.padding.y();
                        };

                        this.width = function() { return canvas.height * 0.1; };
                        this.height = function() { return canvas.height * 0.1; };
                        this.borderRadius = function() { return canvas.height * 0.1 * 0.1; };

                        this.resetPosition = function() {
                            this.x =  function() { return canvas.width * 0.5 - this.width() * 0.5; };
                            this.y = function() {
                                const grid = activeScreen.getObject('grid');
                                return grid.y() + grid.height() + grid.padding.y();
                            };
                            this.width = function() { return canvas.height * 0.1; };
                            this.height = function() { return canvas.height * 0.1; };
                            this.borderRadius = function() { return canvas.height * 0.1 * 0.1; };
                        };

                        this.placeInGrid = function() {
                            const grid = activeScreen.getObject("grid");

                            let num = 0;
                            Object.keys(grid.itens.all).forEach(key => {
                                if (key.includes("turn") && key.length > this.name.length) num = Math.max(num, Number(key.split("-")[1]));
                            });

                            const objName = this.name + '-' + (num + 1);
                            const objPos = activeScreen.objPosition["forward_block"];

                            activeScreen.objects.splice(objPos, 0,
                                new RenderObject(objName, "block", null, null, null, null, this.borderRadius, this.fillColor, this.strokeColor, this.strokeWidth, null, null, null, null, null, null, 0, true, false, true, false, false, false, this.imageSrc, this.imageHoverSrc, this.hasImage)
                            );

                            Object.keys(activeScreen.objPosition).forEach(key => {
                                if (objPos <= activeScreen.objPosition[key]) activeScreen.objPosition[key]++;
                            });

                            activeScreen.objPosition[objName] = objPos;

                            grid.itens.all[objName] = {
                                type: "turn",
                                index: Object.keys(grid.itens.all).length
                            };

                            grid.itens.count++;

                            const newObj = activeScreen.getObject(objName);

                            newObj.init = function() {
                                this.spriteX = 0;
                                this.spriteY = 0;
                                this.spriteWidth = 214;
                                this.spriteHeight = 214;

                                this.width = function() {
                                    return canvas.height * 0.1;
                                };

                                this.height = function() {
                                    return this.width();
                                };

                                this.x = function() {
                                    const gridObj = activeScreen.getObject('grid');
                                    return gridObj.x() + gridObj.padding.x() + this.width() * (gridObj.itens.all[this.name].index - gridObj.offset);
                                };

                                this.y = function() {
                                    const gridObj = activeScreen.getObject('grid');
                                    return gridObj.padding.y() + gridObj.y();
                                };

                                this.resetPosition = function() {
                                    this.width = function() {
                                        return canvas.height * 0.1;
                                    };

                                    this.height = function() {
                                        return this.width();
                                    };

                                    this.x = function() {
                                        const gridObj = activeScreen.getObject('grid');
                                        return gridObj.x() + gridObj.padding.x() + this.width() * (gridObj.itens.all[this.name].index - gridObj.offset);
                                    };

                                    this.y = function() {
                                        const gridObj = activeScreen.getObject('grid');
                                        return gridObj.padding.y() + gridObj.y();
                                    };
                                };

                                this.update = function() {
                                    if (grid.itens.all[this.name].index < grid.offset || grid.itens.all[this.name].index > grid.offset + grid.count - 1) this.state = 'normal';

                                    this.sprX = this.x;
                                    this.sprY = this.y;
                                    this.sprWidth = this.width;
                                    this.sprHeight = this.height;

                                    if (this.hasBeenDraggable && !this.pressed) {
                                        const grid = activeScreen.getObject("grid");
                                        if (hasColision(this, grid)) {
                                            const pos = this.positionSwapCheck();
                                            if (pos !== null) this.changePosition(pos);

                                            this.resetPosition();
                                        }

                                        else {
                                            activeScreen.destroyObject(this.name);
                                            const aux = {};
                                            Object.keys(grid.itens.all).forEach(key => {
                                                if (key != this.name) {
                                                    let pos = grid.itens.all[key];
                                                    if (grid.itens.all[key].index > grid.itens.all[this.name].index) pos.index--;
                                                    aux[key] = pos;
                                                }
                                            });

                                            grid.itens.count--;
                                            grid.itens.all = aux;
                                        }

                                        this.hasBeenDraggable = false;
                                    }
                                };

                                this.changePosition = function(name) {
                                    const grid = activeScreen.getObject("grid");
                                    const itemIndex = grid.itens.all[name].index;
                                    const thisIndex = grid.itens.all[this.name].index;
                                    let newPosition;

                                    if (itemIndex > thisIndex) {
                                        newPosition = itemIndex;
                                        Object.keys(grid.itens.all).forEach(key => {
                                            if (key == this.name) return;
                                            if (grid.itens.all[key].index >= grid.itens.all[this.name].index && grid.itens.all[key].index <= newPosition) grid.itens.all[key].index--;
                                        });
                                    }

                                    else {
                                        newPosition = itemIndex;
                                        Object.keys(grid.itens.all).forEach(key => {
                                            if (key == this.name) return;
                                            if (grid.itens.all[key].index <= grid.itens.all[this.name].index && grid.itens.all[key].index >= newPosition) grid.itens.all[key].index++;
                                        });
                                    }

                                    grid.itens.all[this.name].index = newPosition;
                                };

                                this.positionSwapCheck = function() {
                                    let res = null;

                                    activeScreen.objects.forEach(obj => {
                                        if (res !== null) return;

                                        if (obj.type == "block") {
                                            if (obj.state == "hover" && obj.name != this.name) {
                                                res = obj.name;
                                            }
                                        }
                                    });

                                    return res;
                                };
                            }

                            newObj.init();
                        };

                        this.update = function() {
                            this.sprX = this.x;
                            this.sprY = this.y;
                            this.sprWidth = this.width;
                            this.sprHeight = this.height;

                            if (this.hasBeenDraggable && !this.pressed) {
                                if (hasColision(this, activeScreen.getObject("grid"))) this.placeInGrid();

                                this.resetPosition();
                                this.hasBeenDraggable = false;
                            }
                        };
                    };

                    const loop_block = this.getObject("loop_block");
                    loop_block.init = function() {
                        this.spriteX = 0;
                        this.spriteY = 0;
                        this.spriteWidth = 214;
                        this.spriteHeight = 214;

                        this.x =  function() { return canvas.width * 0.5 + this.width() * 0.5 + 10; };
                        this.y = function() {
                            const grid = activeScreen.getObject('grid');
                            return grid.y() + grid.height() + grid.padding.y();
                        };
                        this.width = function() { return canvas.height * 0.1; };
                        this.height = function() { return canvas.height * 0.1; };
                        this.borderRadius = function() { return canvas.height * 0.1 * 0.1; };

                        this.resetPosition = function() {
                            this.x =  function() { return canvas.width * 0.5 + this.width() * 0.5 + 10; };
                            this.y = function() {
                                const grid = activeScreen.getObject('grid');
                                return grid.y() + grid.height() + grid.padding.y();
                            };

                            this.width = function() { return canvas.height * 0.1; };
                            this.height = function() { return canvas.height * 0.1; };
                            this.borderRadius = function() { return canvas.height * 0.1 * 0.1; };
                        };

                        this.placeInGrid = function() {
                            const grid = activeScreen.getObject("grid");

                            let num = 0;
                            Object.keys(grid.itens.all).forEach(key => {
                                if (key.includes("loop") && key.length > this.name.length) num = Math.max(num, Number(key.split("-")[1]));
                            });

                            const objName = this.name + '-';
                            const objPos = activeScreen.objPosition["forward_block"];

                            activeScreen.objects.splice(objPos, 0,
                                new RenderObject(objName + (num + 1), "block", null, null, null, null, this.borderRadius, this.fillColor, this.strokeColor, this.strokeWidth, null, null, null, null, null, null, 0, true, true, true, false, false, false, this.imageSrc, this.imageHoverSrc, true),
                                new RenderObject(objName + (num + 2), "block", null, null, null, null, this.borderRadius, this.fillColor, this.strokeColor, this.strokeWidth, "", "branco", null, null, null, null, 0, true, true, true, false, false, false, this.imageSrc, this.imageHoverSrc, true)
                            );

                            Object.keys(activeScreen.objPosition).forEach(key => {
                                if (objPos <= activeScreen.objPosition[key]) activeScreen.objPosition[key] += 2;
                            });

                            activeScreen.objPosition[objName + (num + 1)] = objPos;
                            activeScreen.objPosition[objName + (num + 2)] = objPos + 1;

                            grid.itens.all[objName + (num + 1)] = {
                                type: "loop",
                                index: Object.keys(grid.itens.all).length
                            };

                            grid.itens.all[objName + (num + 2)] = {
                                type: "loop",
                                index: Object.keys(grid.itens.all).length
                            };

                            grid.itens.count += 2;

                            const newObj = activeScreen.getObject(objName + (num + 1));

                            newObj.init = function() {
                                this.spriteX = 0;
                                this.spriteY = 0;
                                this.spriteWidth = 214;
                                this.spriteHeight = 214;

                                this.parthener = objName + (num + 2);
                                this.loop_count = 2;
                                this.firstDrag = true;

                                this.renderAux = function() {
                                    const grid = activeScreen.getObject("grid");

                                    try {
                                        if (grid.itens.all[this.name].index < grid.offset || grid.itens.all[this.name].index > grid.offset + grid.count - 1) return;
                                    }

                                    catch (err) {
                                        if (grid.itens.all[this.parthener]) throw err;
                                    }

                                    const x = this.x() + this.width() * 0.82;
                                    const y = this.y() + this.width() * 0.18 * 0.5;

                                    ctx.fillCircle(x, y, this.width() * 0.18, "rgb(160, 30, 30)");
                                    ctx.fillStyle = "rgb(240, 240, 240)";
                                    ctx.textAlign = textAlign.horizontal.center;
                                    ctx.textBaseline = textAlign.vertical.center;
                                    ctx.font = `${fonts.small_text.size()}px '${fonts.small_text.font}'`;
                                    ctx.fillText(this.loop_count, x, y);
                                }

                                this.width = function() {
                                    return canvas.height * 0.1;
                                };

                                this.height = function() {
                                    return this.width();
                                };

                                this.x = function() {
                                    const gridObj = activeScreen.getObject('grid');
                                    return gridObj.x() + gridObj.padding.x() + this.width() * (gridObj.itens.all[this.name].index - gridObj.offset);
                                };

                                this.y = function() {
                                    const gridObj = activeScreen.getObject('grid');
                                    return gridObj.padding.y() + gridObj.y();
                                };

                                this.resetPosition = function() {
                                    this.width = function() {
                                        return canvas.height * 0.1;
                                    };

                                    this.height = function() {
                                        return this.width();
                                    };

                                    this.x = function() {
                                        const gridObj = activeScreen.getObject('grid');
                                        return gridObj.x() + gridObj.padding.x() + this.width() * (gridObj.itens.all[this.name].index - gridObj.offset);
                                    };

                                    this.y = function() {
                                        const gridObj = activeScreen.getObject('grid');
                                        return gridObj.padding.y() + gridObj.y();
                                    };
                                };

                                this.update = function() {
                                    if (grid.itens.all[this.name].index < grid.offset || grid.itens.all[this.name].index > grid.offset + grid.count - 1) this.state = 'normal';

                                    this.sprX = this.x;
                                    this.sprY = this.y;
                                    this.sprWidth = this.width;
                                    this.sprHeight = this.height;

                                    if (this.hasBeenDraggable && !this.pressed) {
                                        const grid = activeScreen.getObject("grid");
                                        if (hasColision(this, grid)) {
                                            const pos = this.positionSwapCheck();
                                            if (pos !== null) this.changePosition(pos);

                                            this.resetPosition();
                                        }

                                        else {
                                            activeScreen.destroyObject(this.parthener);

                                            let aux = {};
                                            Object.keys(grid.itens.all).forEach(key => {
                                                if (key != this.parthener) {
                                                    let pos = grid.itens.all[key];
                                                    if (grid.itens.all[key].index > grid.itens.all[this.parthener].index) pos.index--;
                                                    aux[key] = pos;
                                                }
                                            });

                                            grid.itens.count--;
                                            grid.itens.all = aux;

                                            activeScreen.destroyObject(this.name);
                                            aux = {};
                                            Object.keys(grid.itens.all).forEach(key => {
                                                if (key != this.name) {
                                                    let pos = grid.itens.all[key];
                                                    if (grid.itens.all[key].index > grid.itens.all[this.name].index) pos.index--;
                                                    aux[key] = pos;
                                                }
                                            });

                                            grid.itens.count--;
                                            grid.itens.all = aux;
                                        }

                                        this.hasBeenDraggable = false;
                                    }
                                };

                                this.changePosition = function(name) {
                                    const grid = activeScreen.getObject("grid");
                                    const itemIndex = grid.itens.all[name].index;
                                    const thisIndex = grid.itens.all[this.name].index;
                                    let newPosition;

                                    if (itemIndex > thisIndex) {
                                        newPosition = itemIndex;
                                        Object.keys(grid.itens.all).forEach(key => {
                                            if (key == this.name) return;
                                            if (grid.itens.all[key].index >= grid.itens.all[this.name].index && grid.itens.all[key].index <= newPosition) grid.itens.all[key].index--;
                                        });
                                    }

                                    else {
                                        newPosition = itemIndex;
                                        Object.keys(grid.itens.all).forEach(key => {
                                            if (key == this.name) return;
                                            if (grid.itens.all[key].index <= grid.itens.all[this.name].index && grid.itens.all[key].index >= newPosition) grid.itens.all[key].index++;
                                        });
                                    }

                                    grid.itens.all[this.name].index = newPosition;
                                };

                                this.positionSwapCheck = function() {
                                    let res = null;

                                    activeScreen.objects.forEach(obj => {
                                        if (res !== null) return;

                                        if (obj.type == "block") {
                                            if (obj.state == "hover" && obj.name != this.name) {
                                                res = obj.name;
                                            }
                                        }
                                    });

                                    return res;
                                };

                                this.onclick = function() {
                                    const grid = activeScreen.getObject("grid");
                                    if (grid.itens.all[this.name].index < grid.offset || grid.itens.all[this.name].index > grid.offset + grid.count - 1) return;

                                    if (this.loop_count < 10) this.loop_count++;
                                    else this.loop_count = 2;

                                    activeScreen.getObject(this.parthener).loop_count = this.loop_count;
                                }
                            }

                            const newObj2 = activeScreen.getObject(objName + (num + 2));
                            newObj2.init = newObj.init;

                            newObj.init();
                            newObj2.init();
                            newObj2.parthener = objName + (num + 1);
                            newObj2.loop_count = 2;
                        };

                        this.update = function() {
                            this.sprX = this.x;
                            this.sprY = this.y;
                            this.sprWidth = this.width;
                            this.sprHeight = this.height;

                            if (this.hasBeenDraggable && !this.pressed) {
                                if (hasColision(this, activeScreen.getObject("grid"))) this.placeInGrid();

                                this.resetPosition();
                                this.hasBeenDraggable = false;
                            }
                        };
                    };

                    const left_arrow = this.getObject("left_arrow");
                    left_arrow.init = function() {
                        this.spriteX = 0;
                        this.spriteY = 0;
                        this.spriteWidth = 512;
                        this.spriteHeight = 512;

                        this.x = function() {
                            const grid = activeScreen.getObject("grid");
                            return grid.x() - grid.padding.x() / 2;
                        };

                        this.y = function() {
                            const grid = activeScreen.getObject("grid");
                            return grid.y() + (grid.height() - this.height()) / 2;
                        };

                        this.width = function() {
                            return this.height();
                        };

                        this.height = function() {
                            const grid = activeScreen.getObject("grid");
                            return grid.height() * 0.45;
                        };

                        this.sprX = this.x;
                        this.sprY = this.y;
                        this.sprWidth = this.width;
                        this.sprHeight = this.height;

                        this.onclick = function() {
                            const grid = activeScreen.getObject("grid");
                            grid.offset = Math.max(0, grid.offset - 1);
                        };
                    };

                    const right_arrow = this.getObject("right_arrow");
                    right_arrow.init = function() {
                        this.spriteX = 0;
                        this.spriteY = 0;
                        this.spriteWidth = 512;
                        this.spriteHeight = 512;

                        this.x = function() {
                            const grid = activeScreen.getObject("grid");
                            return grid.x() + grid.width() - grid.padding.x() / 2;
                        };

                        this.y = function() {
                            const grid = activeScreen.getObject("grid");
                            return grid.y() + (grid.height() - this.height()) / 2;
                        };

                        this.width = function() {
                            return this.height();
                        };

                        this.height = function() {
                            const grid = activeScreen.getObject("grid");
                            return grid.height() * 0.45;
                        };

                        this.sprX = this.x;
                        this.sprY = this.y;
                        this.sprWidth = this.width;
                        this.sprHeight = this.height;

                        this.onclick = function() {
                            const grid = activeScreen.getObject("grid");
                            if (grid.itens.count - grid.offset > grid.count) grid.offset++;
                        };
                    };

                    this.objects.forEach(obj => { obj.init() });

                    this.initLevel();
                    this.onload = false;
                }
            },

            initLevel() {
                const grid = this.getObject("grid");

                this.objects.push(
                    new RenderObject("level_frame", "level", null, null, null, null, null, "preto-t40", "branco", 1, null, null, null, null, null, null, 0, false, false, false, true, true, false),
                );

                this.objPosition["level_frame"] = this.objects.length - 1;

                const level_frame = this.getObject("level_frame");
                level_frame.objects_per_line = this.level.columns;
                level_frame.lines = this.level.lines;
                level_frame.init = function() {
                    this.x = grid.x;

                    this.y = function() {
                        return canvas.height * 0.35 - this.height() * 0.5;
                    }

                    this.width = grid.width;

                    this.height = function() {
                        return canvas.height * 0.6;
                    }

                    this.borderRadius = function() { return 0; }
                };

                level_frame.init();

                let blocks = [];

                this.level.paths.forEach((line, index) => {
                    for (let i = 0; i < line.length; i++) {
                        switch (line.charAt(i)) {
                            case "#": {
                                const block = new RenderObject("path_block-", "level_block", null, null, null, null, null, null, null, 0, null, null, null, null, null, null, 0, false, false, false, false, false, false, "./assets/image/blocks_tiles/path_block", null, true)

                                block.init = function() {
                                    this.spriteX = 0;
                                    this.spriteY = 0;
                                    this.spriteWidth = 32;
                                    this.spriteHeight = 32;

                                    this.name += (index * level_frame.objects_per_line + i);
                                    this.line = index;
                                    this.index = i;

                                    this.x = function() {
                                        const frame = activeScreen.getObject("level_frame");
                                        if (frame.objects_per_line % 2 == 0) {
                                            return frame.x() + frame.width() * 0.5 + (this.width() + this.px()) * (this.index - frame.objects_per_line / 2);
                                        }

                                        else {
                                            if (this.index == Math.floor(frame.objects_per_line / 2)) return frame.x() + frame.width() * 0.5 - (this.width() + this.px()) * 0.5;
                                            else return frame.x() + frame.width() * 0.5 + (this.width() + this.px()) * (this.index - frame.objects_per_line / 2);
                                        }
                                    };

                                    this.y = function() {
                                        const frame = activeScreen.getObject("level_frame");
                                        if (frame.lines % 2 == 0) {
                                            return frame.y() + frame.height() * 0.5 + (this.height() + this.py()) * (this.line - frame.lines / 2);
                                        }

                                        else {
                                            if (this.line == Math.floor(frame.lines / 2)) return frame.y() + frame.height() * 0.5 - (this.height() + this.py()) * 0.5;
                                            else return frame.y() + frame.height() * 0.5 + (this.height() + this.py()) * (this.line - frame.lines / 2);
                                        }
                                    }

                                    this.height = function() {
                                        return canvas.height * 0.06;
                                    };

                                    this.width = this.height;

                                    this.sprX = this.x;
                                    this.sprY = this.y;
                                    this.sprWidth = this.width;
                                    this.sprHeight = this.height;

                                    this.px = function() {
                                        return 0;
                                    };

                                    this.py = function() {
                                        return 0;
                                    };

                                    this.borderRadius = function() { return 0; }

                                    let bottom = false, left = false, right = false, top = false;

                                    if (i % level_frame.objects_per_line == 0) left = true;
                                    if (i % level_frame.objects_per_line == level_frame.objects_per_line - 1) right = true;
                                    if (index % level_frame.lines == 0) top = true;
                                    if (index % level_frame.lines == level_frame.lines - 1) bottom = true;

                                    this.imageSrc += (bottom ? "-bottom" : "") + (left ? "-left" : "") + (right ? "-right" : "") + (top ? "-top" : "") + ".png";
                                    this.image.src = this.imageSrc;
                                }

                                const shadow = new RenderObject("path_block-", "level_block-shadow", null, null, null, null, null, "preto-t40", null, 0, null, null, null, null, null, null, 0, false, false, false, true, false, false)
                                shadow.init = function() {
                                    this.name += (index * level_frame.objects_per_line + i) + "-shadow";
                                    this.line = index;
                                    this.index = i;

                                    this.x = function() {
                                        const block = activeScreen.getObject(this.name.split("-shadow")[0]);
                                        return block.x() + block.width() * 0.15;
                                    };

                                    this.y = function() {
                                        const block = activeScreen.getObject(this.name.split("-shadow")[0]);
                                        return block.y() + block.height() * 0.15;
                                    }

                                    this.height = function() {
                                        const block = activeScreen.getObject(this.name.split("-shadow")[0]);
                                        return block.height();
                                    };

                                    this.width = this.height;

                                    this.borderRadius = function() { return 0; }
                                }

                                blocks.push(shadow);
                                blocks.push(block);
                                break;
                            }
                        }
                    }
                });

                blocks.forEach(obj => {
                    obj.init();
                    activeScreen.objects.push(obj);
                    activeScreen.objPosition[obj.name] = activeScreen.objects.length - 1;
                });

                blocks = [];

                this.level.itens.forEach((line, index) => {
                    for (let i = 0; i < line.length; i++) {
                        if (this.level.itens[index].charAt(i) == "#") {
                            const aux = new RenderObject("item-" + (this.level.lines * index + i), "level", null, null, null, null, null, "verde", null, 0, null, null, null, null, null, null, 0, false, false, false, false, false, false, "./assets/image/item.png", null, true);
                            aux.init = function() {
                                this.spriteX = 0;
                                this.spriteY = 0;
                                this.spriteWidth = 24;
                                this.spriteHeight = 24;

                                this.x = function() {
                                    const tmp = activeScreen.getObject("path_block-" + (activeScreen.level.lines * index + i));
                                    return tmp.x() + (tmp.width() - this.width()) / 2;
                                }

                                this.y = function() {
                                    const tmp = activeScreen.getObject("path_block-" + (activeScreen.level.lines * index + i));
                                    return tmp.y() + (tmp.height() - this.height()) / 2;
                                }

                                this.width = function() {
                                    const tmp = activeScreen.getObject("path_block-" + (activeScreen.level.lines * index + i));
                                    return tmp.width() * 0.3;
                                }

                                this.height = function() {
                                    const tmp = activeScreen.getObject("path_block-" + (activeScreen.level.lines * index + i));
                                    return tmp.height() * 0.3;
                                }

                                this.sprX = this.x;
                                this.sprY = this.y;
                                this.sprWidth = this.width;
                                this.sprHeight = this.height;

                                this.borderRadius = function() { return 0; }
                            };

                            blocks.push(aux);
                        }
                    }
                });

                const player = new RenderObject("player", "player", null, null, null, null, null, null, "azul", 1, null, null, null, null, null, null, 0, false, false, false, false, false, false, "./assets/image/player.png", null, true)
                player.init = function() {
                    this.itensCollected = 0;

                    this.resetState = function() {
                        this.stateCord = {
                            x: activeScreen.level.player.x,
                            y: activeScreen.level.player.y,
                            direction: activeScreen.level.player.direction
                        }
                    }

                    this.resetState();

                    this.x = function() {
                        const block = activeScreen.getObject('path_block-2');
                        return block.x() - (block.width() + block.px()) * 2 + (block.width() + block.px()) * (this.stateCord.x - 1) + (block.width() - this.width()) / 2;
                    }

                    this.y = function() {
                        const block = activeScreen.getObject('path_block-2');
                        return block.y() + (block.height() + block.py()) * (this.stateCord.y - 1) + (block.height() - this.height()) / 2;
                    }

                    this.height = function() {
                        const block = activeScreen.getObject('path_block-2');
                        return block.height() * 0.8;
                    }

                    this.width = function() {
                        return this.height() * (this.statesMap[this.animState].width / this.statesMap[this.animState].height);
                    }

                    this.sprX = this.x;
                    this.sprY = this.y;
                    this.sprWidth = this.width;
                    this.sprHeight = this.height;

                    this.borderRadius = function() {
                        return 0;
                    }

                    this.animState = 'idle';
                    this.animTemp = 0;
                    this.currentFrame = 0;
                    this.changeState = {
                        new: 'idle',
                        ready: true
                    };

                    this.statesMap = {
                        idle: {
                            coords: {
                                'N': {
                                    x: 0,
                                    y: 69
                                },

                                'L': {
                                    x: 1,
                                    y: 38
                                },

                                'S': {
                                    x: 1,
                                    y: 6
                                },

                                'O': {
                                    x: 0,
                                    y: 102
                                }
                            },

                            width: 15,
                            height: 22,
                            offset: 81,
                            count: 2,
                            vel: 20,
                        },

                        walk: {
                            coords: {
                                'N': {
                                    x: 0,
                                    y: 69
                                },

                                'L': {
                                    x: 1,
                                    y: 38
                                },

                                'S': {
                                    x: 1,
                                    y: 6
                                },

                                'O': {
                                    x: 0,
                                    y: 102
                                }
                            },

                            width: 15,
                            height: 22,
                            offset: 1,
                            count: 4,
                            vel: 4
                        },

                        die: {

                        }
                    }

                    this.spriteX = 0;
                    this.spriteY = 0;
                    this.spriteWidth = 0;
                    this.spriteHeight = 0;

                    this.itensBuffer = [];

                    this.movement = {
                        has: false,
                        fun: null
                    }

                    this.update = function() {
                        if (activeScreen.passForward == 1) {
                            try {
                                let numX = Math.round(this.stateCord.x);
                                let numY = Math.round(this.stateCord.y);

                                if (this.stateCord.direction == 'L') {
                                    numX -= 0;
                                    numY -= 1;
                                }
                                else if (this.stateCord.direction == 'O') {
                                    numX -= 2;
                                    numY -= 1;
                                }
                                else if (this.stateCord.direction == 'S') {
                                    numX -= 1;
                                    numY -= 0;
                                }
                                else {
                                    numX -= 1;
                                    numY -= 2;
                                }

                                const i = activeScreen.getObject("item-" + (numY * activeScreen.level.columns + numX));
                                let push = true;

                                this.itensBuffer.forEach(element => {
                                    if (element == i.name) push = false;
                                });

                                if (push) {
                                    i.active = false;
                                    this.itensCollected++;
                                    this.itensBuffer.push(i.name);
                                }
                            }

                            catch { }
                        }

                        if (this.changeState.ready) {
                            this.spriteX = this.statesMap[this.changeState.new].coords[this.stateCord.direction].x;
                            this.spriteY = this.statesMap[this.changeState.new].coords[this.stateCord.direction].y;
                            this.spriteWidth = this.statesMap[this.changeState.new].width;
                            this.spriteHeight = this.statesMap[this.changeState.new].height;
                            this.stateCord.x = Math.round(this.stateCord.x);
                            this.stateCord.y = Math.round(this.stateCord.y);
                            this.animState = this.changeState.new;
                            this.changeState.ready = false;
                            this.currentFrame = 0;
                            this.animTemp = 0;
                        }

                        if (this.animTemp == this.statesMap[this.animState].vel) {
                            if (this.currentFrame == this.statesMap[this.animState].count - 1) {
                                this.spriteX = this.statesMap[this.animState].coords[this.stateCord.direction].x;
                                this.currentFrame = 0;
                            }

                            else {
                                this.spriteX += this.spriteWidth + this.statesMap[this.animState].offset;
                                this.currentFrame++;
                            }

                            if (this.movement.has) this.movement.fun();
                            else
                                switch (this.animState) {
                                    case 'idle': {
                                        break;
                                    }

                                    case 'walk': {
                                        switch (this.stateCord.direction) {
                                            case 'N': {
                                                if (this.stateCord.y > 1) {
                                                    if (activeScreen.level.paths[Math.round(this.stateCord.y - 2)].charAt(Math.round(this.stateCord.x - 1)) == '#') {
                                                        this.movement.has = true;
                                                        this.movement.fun = function() {
                                                            const player = activeScreen.getObject('player');
                                                            player.stateCord.y -= 1 / (60 / player.statesMap[player.animState].vel); }
                                                        this.stateCord.y -= 1 / (60 / this.statesMap[this.animState].vel);
                                                    }
                                                }

                                                break;
                                            }

                                            case 'L': {
                                                if (this.stateCord.x < activeScreen.level.columns) {
                                                    if (activeScreen.level.paths[Math.round(this.stateCord.y - 1)].charAt(Math.round(this.stateCord.x)) == '#') {
                                                        this.movement.has = true;
                                                        this.movement.fun = function() {
                                                            const player = activeScreen.getObject('player');
                                                            player.stateCord.x += 1 / (60 / player.statesMap[player.animState].vel);
                                                        }
                                                        this.stateCord.x += 1 / (60 / this.statesMap[this.animState].vel);
                                                    }
                                                }

                                                break;
                                            }
                                            case 'S': {
                                                if (this.stateCord.y < activeScreen.level.lines) {
                                                    if (activeScreen.level.paths[Math.round(this.stateCord.y)].charAt(Math.round(this.stateCord.x - 1)) == '#') {
                                                        this.movement.has = true;
                                                        this.movement.fun = function() {
                                                            const player = activeScreen.getObject('player');
                                                            player.stateCord.y += 1 / (60 / player.statesMap[player.animState].vel);
                                                        }
                                                        this.stateCord.y += 1 / (60 / this.statesMap[this.animState].vel);
                                                    }
                                                }

                                                break;
                                            }
                                            case 'O': {
                                                if (this.stateCord.x > 1) {
                                                    if (activeScreen.level.paths[Math.round(this.stateCord.y - 1)].charAt(Math.round(this.stateCord.x - 2)) == '#') {
                                                        this.movement.has = true;
                                                        this.movement.fun = function() {
                                                            const player = activeScreen.getObject('player');
                                                            player.stateCord.x -= 1 / (60 / player.statesMap[player.animState].vel); }
                                                        this.stateCord.x -= 1 / (60 / this.statesMap[this.animState].vel);
                                                    }
                                                }

                                                break;
                                            }
                                        }

                                        break;
                                    }
                                }

                            this.animTemp = 0;
                        }

                        this.animTemp++;
                    }
                }

                blocks.push(player);

                blocks.forEach(block => {
                    block.init();
                    activeScreen.objects.push(block);
                    activeScreen.objPosition[block.name] = activeScreen.objects.length - 1;
                });
            },

            getObject(name) {
                return this.objects[this.objPosition[name]];
            },

            destroyObject(name) {
                const pos = this.objPosition[name];
                const aux = [];

                this.objects.forEach((obj, index) => {
                    if (index != pos) aux.push(obj);
                });

                this.objects = aux;
                this.objPosition[name] = undefined;

                Object.keys(this.objPosition).forEach(key => {
                    if (this.objPosition[key] > pos) this.objPosition[key]--;
                });
            },

            counter: 0,
            current: 0,
            loop_index: [],
            passForward: 0,

            run_game() {
                const itens = this.getObject("grid").itens;
                const player = this.getObject("player");

                if (this.passForward > 0) this.passForward--;

                if (this.counter % 60 * 5 == 0) {
                    player.movement.has = false;
                    player.changeState = {
                        new: 'idle',
                        ready: true
                    }

                    let obj = undefined, objKey = undefined;

                    Object.keys(itens.all).forEach(key => {
                        const aux = this.getObject(key);

                        if (itens.all[key].index == this.current) {
                            obj = itens.all[key];
                            objKey = key;
                            aux.state = 'hover';
                        }

                        else aux.state = 'normal';
                    });

                    if (!(itens.count > this.current)) this.current++;

                    else {
                        switch (obj.type) {
                            case "forward": {
                                this.passForward = 1;

                                player.changeState = {
                                    new: 'walk',
                                    ready: true
                                }

                                break;
                            }

                            case "turn": {
                                const dir = player.stateCord.direction == 'N' ? 'L' : player.stateCord.direction == 'L' ? 'S' : player.stateCord.direction == 'S' ? 'O' : 'N';
                                player.stateCord.direction = dir;

                                break;
                            }

                            case "loop": {
                                let found = undefined;

                                this.loop_index.forEach(obj => {
                                    if (obj.end == this.current && obj.count > 1) {
                                        found = obj.start;
                                        obj.count--;
                                    }

                                    else if (obj.end == this.current && obj.count <= 1) {
                                        obj.count = this.getObject(objKey).loop_count;
                                        found = this.current;
                                    }
                                });

                                if (found != undefined) this.current = found;

                                else {
                                    const name = this.getObject(objKey).parthener;
                                    let endIndex = undefined;

                                    Object.keys(itens.all).forEach(key => {
                                        if (endIndex) return;
                                        if (key == name) endIndex = itens.all[key].index;
                                    });

                                    this.loop_index.push({ start: this.current, end: endIndex, count: this.getObject(objKey).loop_count });
                                }

                                break;
                            }
                        }

                        this.current++;
                        this.counter = 0;
                    }
                }

                if (itens.count == this.current - 1) {
                    this.game_running = false;
                    this.counter = 0;
                    this.current = 0;
                    this.loop_index = [];
                    player.resetState();
                    player.changeState = {
                        new: 'idle',
                        ready: true
                    }

                    player.itensBuffer.forEach(item => {
                        this.getObject(item).active = true;
                    });

                    player.itensBuffer = [];

                    if (player.itensCollected == activeScreen.level.quantItens) {
                        bd[this.label] = true;
                        changeScreen(screens.lobby);
                    }

                    player.itensCollected = 0;
                }

                this.counter++;
            }
        },

        level_4: {
            label: "level_4",
            level: {
                paths: [
                    "..#..",
                    ".###.",
                    "##.##",
                    ".###.",
                    "..#.."
                ],

                itens: [
                    ".....",
                    ".###.",
                    "##.##",
                    ".###.",
                    "..#.."
                ],

                enemies: [
                    ".....",
                    ".....",
                    ".....",
                    ".....",
                    "....."
                ],

                player: {
                    x: 3,
                    y: 1,
                    direction: 'S'
                },

                columns: 5,
                lines: 5,
                quantItens: 11,
            },

            onload: true,
            objects: [],
            objPosition: {},
            game_running: false,

            background: {
                image: new Image(),
                imageSrc: "./assets/image/background.png",
                layerColor: "rgba(0, 0, 0, 0.5)",

                render() {
                    ctx.drawImage(this.image, 0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = this.layerColor;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
            },

            render() {
                this.update();
                this.background.render();

                this.objects.forEach(obj => {
                    if (!this.game_running) obj.update();
                    else if (obj.name == 'player') obj.update();

                    if (obj.active) obj.render();
                    if (obj.renderAux) obj.renderAux();
                });

                if (this.game_running) {
                    this.run_game();
                }
            },

            update() {
                if (this.onload) {
                    this.background.image.src = this.background.imageSrc;

                    this.objects = [];
                    this.objects.push(
                        new RenderObject(
                            "grid", "interface",
                            null, null, null, null, null,
                            null, null, 0, null, null, null, null, null, null, 0, false, false, false, false, false, false,
                            "./assets/image/grid.png", null, true
                        ),
                        new RenderObject(
                            "play_button", "interface",
                            null, null, null, null, null,
                            null, null, 0, null, null, null, null, null, null, 0, false, true, true, false, false, false,
                            "./assets/image/play_button.png", "./assets/image/play_button-hover.png", true
                        ),
                        new RenderObject(
                            "left_arrow", "interface",
                            null, null, null, null, function() { return 0; },
                            null, null, 0, null, null,
                            null, null,
                            null, null, null,
                            false, true, true, false, false, false,
                            "./assets/image/arrow_left.png", "./assets/image/arrow_left-hover.png", true
                        ),
                        new RenderObject(
                            "right_arrow", "interface",
                            null, null, null, null, function() { return 0; },
                            null, null, 0, null, null,
                            null, null,
                            null, null, null,
                            false, true, true, false, false, false,
                            "./assets/image/arrow_right.png", "./assets/image/arrow_right-hover.png", true
                        ),
                        new RenderObject(
                            "forward_block", "control",
                            null, null, null, null, null,
                            null, null, 0, null, null, null, null, null, null, 0, true, false, true, false, false, false,
                            "./assets/image/forward_block.png", "./assets/image/forward_block-hover.png", true
                        ),
                        new RenderObject(
                            "turn_block", "control",
                            null, null, null, null, null,
                            null, null, 0, null, null, null, null, null, null, 0, true, false, true, false, false, false,
                            "./assets/image/turn_block.png", "./assets/image/turn_block-hover.png", true
                        ),
                        new RenderObject(
                            "loop_block", "control",
                            null, null, null, null, null,
                            null, null, 0, null, null, null, null, null, null, 0, true, false, true, false, false, false,
                            "./assets/image/loop_block.png", "./assets/image/loop_block-hover.png", true
                        )
                    );

                    this.objects.forEach((obj, index) => {
                        this.objPosition[obj.name] = index;
                    });

                    const grid = this.getObject("grid");
                    grid.init = function() {
                        this.count = 0;
                        this.offset = 0;

                        this.x = function() { return canvas.width * 0.2; };
                        this.y = function() { return canvas.height * 0.7; };
                        this.width = function() { return canvas.width * 0.6; };
                        this.height = function() { return canvas.height * 0.15; };
                        this.borderRadius = function() { return 0; };

                        this.spriteX = 0;
                        this.spriteY = 0;
                        this.spriteWidth = 1285;
                        this.spriteHeight = 252;

                        this.sprX = this.x;
                        this.sprY = this.y;
                        this.sprWidth = this.width;
                        this.sprHeight = this.height;

                        this.itens = {
                            all: {},
                            count: 0
                        };

                        this.padding = {
                            x: function() {
                                return activeScreen.getObject("grid").width() * 0.05;
                            },

                            y: function() {
                                return (activeScreen.getObject("grid").height() - canvas.height * 0.1) * 0.5;
                            }
                        };

                        this.update = function() {
                            const size = this.width() - this.padding.x() * 2;
                            this.count = Math.floor(size / activeScreen.getObject("forward_block").width());
                        };
                    };

                    const play_button = this.getObject("play_button");
                    play_button.init = function() {
                        this.spriteX = 0;
                        this.spriteY = 0;
                        this.spriteWidth = 214;
                        this.spriteHeight = 214;

                        this.x = function() { return canvas.width * 0.2 + canvas.width * 0.65; },

                        this.y = function() {
                            const grid = activeScreen.getObject("grid");
                            return grid.y() + grid.padding.y();
                        }

                        this.width = function() { return canvas.height * 0.1; },
                        this.height = function() { return canvas.height * 0.1; },
                        this.borderRadius = function() { return this.width() * 0.1; },

                        this.onclick = function() {
                            if (this.checkBlocks()) {
                                this.state = 'normal';
                                activeScreen.game_running = true;
                            }

                            else { alert("Não coloque dois blocos de repetição entrelaçados!\nColoque o bloco de abertura e de fechamento na mesma região"); }
                        }

                        this.checkBlocks = function() {
                            const grid = activeScreen.getObject("grid");
                            const tmp = Array(grid.itens.count);

                            Object.keys(grid.itens.all).forEach(key => {
                                tmp[grid.itens.all[key].index] = {
                                    name: key,
                                    type: grid.itens.all[key].type
                                }
                            });

                            let res = true;
                            let parthener = undefined;
                            tmp.forEach(item => {
                                if (!res) return;

                                if (item.type == 'loop') {
                                    if (!parthener) parthener = activeScreen.getObject(item.name).parthener;
                                    else {
                                        if (parthener == item.name) parthener = undefined;
                                        else res = false;
                                    }
                                }
                            });

                            return res;
                        }

                        this.sprX = this.x;
                        this.sprY = this.y;
                        this.sprWidth = this.width;
                        this.sprHeight = this.height;
                    };

                    const forward_block = this.getObject("forward_block");
                    forward_block.init = function() {
                        this.spriteX = 0;
                        this.spriteY = 0;
                        this.spriteWidth = 214;
                        this.spriteHeight = 214;

                        this.x =  function() { return canvas.width * 0.5 - this.width() * 1.5 - 10; };
                        this.y = function() {
                            const grid = activeScreen.getObject('grid');
                            return grid.y() + grid.height() + grid.padding.y();
                        };

                        this.width = function() { return canvas.height * 0.1; };
                        this.height = function() { return canvas.height * 0.1; };
                        this.borderRadius = function() { return canvas.height * 0.1 * 0.35; };

                        this.resetPosition = function(resetObj = false) {
                            this.x =  function() { return canvas.width * 0.5 - this.width() * 1.5 - 10; };
                            this.y = function() {
                                const grid = activeScreen.getObject('grid');
                                return grid.y() + grid.height() + grid.padding.y();
                            };
                            this.width = function() { return canvas.height * 0.1; };
                            this.height = function() { return canvas.height * 0.1; };
                            this.borderRadius = function() { return canvas.height * 0.1 * 0.35; };
                        };

                        this.placeInGrid = function() {
                            const grid = activeScreen.getObject("grid");

                            let num = 0;
                            Object.keys(grid.itens.all).forEach(key => {
                                if (key.includes("forward") && key.length > this.name.length) num = Math.max(num, Number(key.split("-")[1]));
                            });

                            const objName = this.name + '-' + (num + 1);
                            const objPos = activeScreen.objPosition[this.name];

                            activeScreen.objects.splice(objPos, 0,
                                new RenderObject(objName, "block", null, null, null, null, this.borderRadius, this.fillColor, this.strokeColor, this.strokeWidth, this.text, this.textColor, this.textAlign, this.textVerticalAlign, this.textPosition, this.font, this.fontSize, true, false, true, false, false, false, this.imageSrc, this.imageHoverSrc, true)
                            );

                            Object.keys(activeScreen.objPosition).forEach(key => {
                                if (objPos <= activeScreen.objPosition[key]) activeScreen.objPosition[key]++;
                            });

                            activeScreen.objPosition[objName] = objPos;

                            grid.itens.all[objName] = {
                                type: "forward",
                                index: Object.keys(grid.itens.all).length
                            };

                            grid.itens.count++;

                            const newObj = activeScreen.getObject(objName);

                            newObj.init = function() {
                                this.spriteX = 0;
                                this.spriteY = 0;
                                this.spriteWidth = 214;
                                this.spriteHeight = 214;

                                this.width = function() {
                                    return canvas.height * 0.1;
                                };

                                this.height = function() {
                                    return this.width();
                                };

                                this.x = function() {
                                    const gridObj = activeScreen.getObject('grid');
                                    return gridObj.x() + gridObj.padding.x() + this.width() * (gridObj.itens.all[this.name].index - gridObj.offset);
                                };

                                this.y = function() {
                                    const gridObj = activeScreen.getObject('grid');
                                    return gridObj.padding.y() + gridObj.y();
                                };

                                this.resetPosition = function() {
                                    this.width = function() {
                                        return canvas.height * 0.1;
                                    };

                                    this.height = function() {
                                        return this.width();
                                    };

                                    this.x = function() {
                                        const gridObj = activeScreen.getObject('grid');
                                        return gridObj.x() + gridObj.padding.x() + this.width() * (gridObj.itens.all[this.name].index - gridObj.offset);
                                    };

                                    this.y = function() {
                                        const gridObj = activeScreen.getObject('grid');
                                        return gridObj.padding.y() + gridObj.y();
                                    };
                                };

                                this.update = function() {
                                    if (grid.itens.all[this.name].index < grid.offset || grid.itens.all[this.name].index > grid.offset + grid.count - 1) this.state = 'normal';

                                    this.sprX = this.x;
                                    this.sprY = this.y;
                                    this.sprWidth = this.width;
                                    this.sprHeight = this.height;

                                    if (this.hasBeenDraggable && !this.pressed) {
                                        const grid = activeScreen.getObject("grid");

                                        if (hasColision(this, grid)) {
                                            const pos = this.positionSwapCheck();
                                            if (pos !== null) this.changePosition(pos);
                                            this.resetPosition();
                                        }

                                        else {
                                            activeScreen.destroyObject(this.name);
                                            const aux = {};
                                            Object.keys(grid.itens.all).forEach(key => {
                                                if (key != this.name) {
                                                    let pos = grid.itens.all[key];
                                                    if (grid.itens.all[key].index > grid.itens.all[this.name].index) pos.index--;
                                                    aux[key] = pos;
                                                }
                                            });

                                            grid.itens.count--;
                                            grid.itens.all = aux;
                                        }

                                        this.hasBeenDraggable = false;
                                    }
                                };

                                this.changePosition = function(name) {
                                    const grid = activeScreen.getObject("grid");
                                    const itemIndex = grid.itens.all[name].index;
                                    const thisIndex = grid.itens.all[this.name].index;
                                    let newPosition;

                                    if (itemIndex > thisIndex) {
                                        newPosition = itemIndex;
                                        Object.keys(grid.itens.all).forEach(key => {
                                            if (key == this.name) return;
                                            if (grid.itens.all[key].index >= grid.itens.all[this.name].index && grid.itens.all[key].index <= newPosition) grid.itens.all[key].index--;
                                        });
                                    }

                                    else {
                                        newPosition = itemIndex;
                                        Object.keys(grid.itens.all).forEach(key => {
                                            if (key == this.name) return;
                                            if (grid.itens.all[key].index <= grid.itens.all[this.name].index && grid.itens.all[key].index >= newPosition) grid.itens.all[key].index++;
                                        });
                                    }

                                    grid.itens.all[this.name].index = newPosition;
                                };

                                this.positionSwapCheck = function() {
                                    let res = null;

                                    activeScreen.objects.forEach(obj => {
                                        if (res !== null) return;

                                        if (obj.type == "block") {
                                            if (obj.state == "hover" && obj.name != this.name) {
                                                obj.state = 'normal';
                                                res = obj.name;
                                            }
                                        }
                                    });

                                    return res;
                                };
                            }

                            newObj.init();
                        };

                        this.update = function() {
                            this.sprX = this.x;
                            this.sprY = this.y;
                            this.sprWidth = this.width;
                            this.sprHeight = this.height;

                            if (this.hasBeenDraggable && !this.pressed) {
                                if (hasColision(this, activeScreen.getObject("grid"))) this.placeInGrid();

                                this.resetPosition();
                                this.hasBeenDraggable = false;
                            }
                        };
                    };

                    const turn_block = this.getObject("turn_block");
                    turn_block.init = function() {
                        this.spriteX = 0;
                        this.spriteY = 0;
                        this.spriteWidth = 214;
                        this.spriteHeight = 214;

                        this.x =  function() { return canvas.width * 0.5 - this.width() * 0.5; };
                        this.y = function() {
                            const grid = activeScreen.getObject('grid');
                            return grid.y() + grid.height() + grid.padding.y();
                        };

                        this.width = function() { return canvas.height * 0.1; };
                        this.height = function() { return canvas.height * 0.1; };
                        this.borderRadius = function() { return canvas.height * 0.1 * 0.1; };

                        this.resetPosition = function() {
                            this.x =  function() { return canvas.width * 0.5 - this.width() * 0.5; };
                            this.y = function() {
                                const grid = activeScreen.getObject('grid');
                                return grid.y() + grid.height() + grid.padding.y();
                            };
                            this.width = function() { return canvas.height * 0.1; };
                            this.height = function() { return canvas.height * 0.1; };
                            this.borderRadius = function() { return canvas.height * 0.1 * 0.1; };
                        };

                        this.placeInGrid = function() {
                            const grid = activeScreen.getObject("grid");

                            let num = 0;
                            Object.keys(grid.itens.all).forEach(key => {
                                if (key.includes("turn") && key.length > this.name.length) num = Math.max(num, Number(key.split("-")[1]));
                            });

                            const objName = this.name + '-' + (num + 1);
                            const objPos = activeScreen.objPosition["forward_block"];

                            activeScreen.objects.splice(objPos, 0,
                                new RenderObject(objName, "block", null, null, null, null, this.borderRadius, this.fillColor, this.strokeColor, this.strokeWidth, null, null, null, null, null, null, 0, true, false, true, false, false, false, this.imageSrc, this.imageHoverSrc, this.hasImage)
                            );

                            Object.keys(activeScreen.objPosition).forEach(key => {
                                if (objPos <= activeScreen.objPosition[key]) activeScreen.objPosition[key]++;
                            });

                            activeScreen.objPosition[objName] = objPos;

                            grid.itens.all[objName] = {
                                type: "turn",
                                index: Object.keys(grid.itens.all).length
                            };

                            grid.itens.count++;

                            const newObj = activeScreen.getObject(objName);

                            newObj.init = function() {
                                this.spriteX = 0;
                                this.spriteY = 0;
                                this.spriteWidth = 214;
                                this.spriteHeight = 214;

                                this.width = function() {
                                    return canvas.height * 0.1;
                                };

                                this.height = function() {
                                    return this.width();
                                };

                                this.x = function() {
                                    const gridObj = activeScreen.getObject('grid');
                                    return gridObj.x() + gridObj.padding.x() + this.width() * (gridObj.itens.all[this.name].index - gridObj.offset);
                                };

                                this.y = function() {
                                    const gridObj = activeScreen.getObject('grid');
                                    return gridObj.padding.y() + gridObj.y();
                                };

                                this.resetPosition = function() {
                                    this.width = function() {
                                        return canvas.height * 0.1;
                                    };

                                    this.height = function() {
                                        return this.width();
                                    };

                                    this.x = function() {
                                        const gridObj = activeScreen.getObject('grid');
                                        return gridObj.x() + gridObj.padding.x() + this.width() * (gridObj.itens.all[this.name].index - gridObj.offset);
                                    };

                                    this.y = function() {
                                        const gridObj = activeScreen.getObject('grid');
                                        return gridObj.padding.y() + gridObj.y();
                                    };
                                };

                                this.update = function() {
                                    if (grid.itens.all[this.name].index < grid.offset || grid.itens.all[this.name].index > grid.offset + grid.count - 1) this.state = 'normal';

                                    this.sprX = this.x;
                                    this.sprY = this.y;
                                    this.sprWidth = this.width;
                                    this.sprHeight = this.height;

                                    if (this.hasBeenDraggable && !this.pressed) {
                                        const grid = activeScreen.getObject("grid");
                                        if (hasColision(this, grid)) {
                                            const pos = this.positionSwapCheck();
                                            if (pos !== null) this.changePosition(pos);

                                            this.resetPosition();
                                        }

                                        else {
                                            activeScreen.destroyObject(this.name);
                                            const aux = {};
                                            Object.keys(grid.itens.all).forEach(key => {
                                                if (key != this.name) {
                                                    let pos = grid.itens.all[key];
                                                    if (grid.itens.all[key].index > grid.itens.all[this.name].index) pos.index--;
                                                    aux[key] = pos;
                                                }
                                            });

                                            grid.itens.count--;
                                            grid.itens.all = aux;
                                        }

                                        this.hasBeenDraggable = false;
                                    }
                                };

                                this.changePosition = function(name) {
                                    const grid = activeScreen.getObject("grid");
                                    const itemIndex = grid.itens.all[name].index;
                                    const thisIndex = grid.itens.all[this.name].index;
                                    let newPosition;

                                    if (itemIndex > thisIndex) {
                                        newPosition = itemIndex;
                                        Object.keys(grid.itens.all).forEach(key => {
                                            if (key == this.name) return;
                                            if (grid.itens.all[key].index >= grid.itens.all[this.name].index && grid.itens.all[key].index <= newPosition) grid.itens.all[key].index--;
                                        });
                                    }

                                    else {
                                        newPosition = itemIndex;
                                        Object.keys(grid.itens.all).forEach(key => {
                                            if (key == this.name) return;
                                            if (grid.itens.all[key].index <= grid.itens.all[this.name].index && grid.itens.all[key].index >= newPosition) grid.itens.all[key].index++;
                                        });
                                    }

                                    grid.itens.all[this.name].index = newPosition;
                                };

                                this.positionSwapCheck = function() {
                                    let res = null;

                                    activeScreen.objects.forEach(obj => {
                                        if (res !== null) return;

                                        if (obj.type == "block") {
                                            if (obj.state == "hover" && obj.name != this.name) {
                                                res = obj.name;
                                            }
                                        }
                                    });

                                    return res;
                                };
                            }

                            newObj.init();
                        };

                        this.update = function() {
                            this.sprX = this.x;
                            this.sprY = this.y;
                            this.sprWidth = this.width;
                            this.sprHeight = this.height;

                            if (this.hasBeenDraggable && !this.pressed) {
                                if (hasColision(this, activeScreen.getObject("grid"))) this.placeInGrid();

                                this.resetPosition();
                                this.hasBeenDraggable = false;
                            }
                        };
                    };

                    const loop_block = this.getObject("loop_block");
                    loop_block.init = function() {
                        this.spriteX = 0;
                        this.spriteY = 0;
                        this.spriteWidth = 214;
                        this.spriteHeight = 214;

                        this.x =  function() { return canvas.width * 0.5 + this.width() * 0.5 + 10; };
                        this.y = function() {
                            const grid = activeScreen.getObject('grid');
                            return grid.y() + grid.height() + grid.padding.y();
                        };
                        this.width = function() { return canvas.height * 0.1; };
                        this.height = function() { return canvas.height * 0.1; };
                        this.borderRadius = function() { return canvas.height * 0.1 * 0.1; };

                        this.resetPosition = function() {
                            this.x =  function() { return canvas.width * 0.5 + this.width() * 0.5 + 10; };
                            this.y = function() {
                                const grid = activeScreen.getObject('grid');
                                return grid.y() + grid.height() + grid.padding.y();
                            };

                            this.width = function() { return canvas.height * 0.1; };
                            this.height = function() { return canvas.height * 0.1; };
                            this.borderRadius = function() { return canvas.height * 0.1 * 0.1; };
                        };

                        this.placeInGrid = function() {
                            const grid = activeScreen.getObject("grid");

                            let num = 0;
                            Object.keys(grid.itens.all).forEach(key => {
                                if (key.includes("loop") && key.length > this.name.length) num = Math.max(num, Number(key.split("-")[1]));
                            });

                            const objName = this.name + '-';
                            const objPos = activeScreen.objPosition["forward_block"];

                            activeScreen.objects.splice(objPos, 0,
                                new RenderObject(objName + (num + 1), "block", null, null, null, null, this.borderRadius, this.fillColor, this.strokeColor, this.strokeWidth, null, null, null, null, null, null, 0, true, true, true, false, false, false, this.imageSrc, this.imageHoverSrc, true),
                                new RenderObject(objName + (num + 2), "block", null, null, null, null, this.borderRadius, this.fillColor, this.strokeColor, this.strokeWidth, "", "branco", null, null, null, null, 0, true, true, true, false, false, false, this.imageSrc, this.imageHoverSrc, true)
                            );

                            Object.keys(activeScreen.objPosition).forEach(key => {
                                if (objPos <= activeScreen.objPosition[key]) activeScreen.objPosition[key] += 2;
                            });

                            activeScreen.objPosition[objName + (num + 1)] = objPos;
                            activeScreen.objPosition[objName + (num + 2)] = objPos + 1;

                            grid.itens.all[objName + (num + 1)] = {
                                type: "loop",
                                index: Object.keys(grid.itens.all).length
                            };

                            grid.itens.all[objName + (num + 2)] = {
                                type: "loop",
                                index: Object.keys(grid.itens.all).length
                            };

                            grid.itens.count += 2;

                            const newObj = activeScreen.getObject(objName + (num + 1));

                            newObj.init = function() {
                                this.spriteX = 0;
                                this.spriteY = 0;
                                this.spriteWidth = 214;
                                this.spriteHeight = 214;

                                this.parthener = objName + (num + 2);
                                this.loop_count = 2;
                                this.firstDrag = true;

                                this.renderAux = function() {
                                    const grid = activeScreen.getObject("grid");

                                    try {
                                        if (grid.itens.all[this.name].index < grid.offset || grid.itens.all[this.name].index > grid.offset + grid.count - 1) return;
                                    }

                                    catch (err) {
                                        if (grid.itens.all[this.parthener]) throw err;
                                    }

                                    const x = this.x() + this.width() * 0.82;
                                    const y = this.y() + this.width() * 0.18 * 0.5;

                                    ctx.fillCircle(x, y, this.width() * 0.18, "rgb(160, 30, 30)");
                                    ctx.fillStyle = "rgb(240, 240, 240)";
                                    ctx.textAlign = textAlign.horizontal.center;
                                    ctx.textBaseline = textAlign.vertical.center;
                                    ctx.font = `${fonts.small_text.size()}px '${fonts.small_text.font}'`;
                                    ctx.fillText(this.loop_count, x, y);
                                }

                                this.width = function() {
                                    return canvas.height * 0.1;
                                };

                                this.height = function() {
                                    return this.width();
                                };

                                this.x = function() {
                                    const gridObj = activeScreen.getObject('grid');
                                    return gridObj.x() + gridObj.padding.x() + this.width() * (gridObj.itens.all[this.name].index - gridObj.offset);
                                };

                                this.y = function() {
                                    const gridObj = activeScreen.getObject('grid');
                                    return gridObj.padding.y() + gridObj.y();
                                };

                                this.resetPosition = function() {
                                    this.width = function() {
                                        return canvas.height * 0.1;
                                    };

                                    this.height = function() {
                                        return this.width();
                                    };

                                    this.x = function() {
                                        const gridObj = activeScreen.getObject('grid');
                                        return gridObj.x() + gridObj.padding.x() + this.width() * (gridObj.itens.all[this.name].index - gridObj.offset);
                                    };

                                    this.y = function() {
                                        const gridObj = activeScreen.getObject('grid');
                                        return gridObj.padding.y() + gridObj.y();
                                    };
                                };

                                this.update = function() {
                                    if (grid.itens.all[this.name].index < grid.offset || grid.itens.all[this.name].index > grid.offset + grid.count - 1) this.state = 'normal';

                                    this.sprX = this.x;
                                    this.sprY = this.y;
                                    this.sprWidth = this.width;
                                    this.sprHeight = this.height;

                                    if (this.hasBeenDraggable && !this.pressed) {
                                        const grid = activeScreen.getObject("grid");
                                        if (hasColision(this, grid)) {
                                            const pos = this.positionSwapCheck();
                                            if (pos !== null) this.changePosition(pos);

                                            this.resetPosition();
                                        }

                                        else {
                                            activeScreen.destroyObject(this.parthener);

                                            let aux = {};
                                            Object.keys(grid.itens.all).forEach(key => {
                                                if (key != this.parthener) {
                                                    let pos = grid.itens.all[key];
                                                    if (grid.itens.all[key].index > grid.itens.all[this.parthener].index) pos.index--;
                                                    aux[key] = pos;
                                                }
                                            });

                                            grid.itens.count--;
                                            grid.itens.all = aux;

                                            activeScreen.destroyObject(this.name);
                                            aux = {};
                                            Object.keys(grid.itens.all).forEach(key => {
                                                if (key != this.name) {
                                                    let pos = grid.itens.all[key];
                                                    if (grid.itens.all[key].index > grid.itens.all[this.name].index) pos.index--;
                                                    aux[key] = pos;
                                                }
                                            });

                                            grid.itens.count--;
                                            grid.itens.all = aux;
                                        }

                                        this.hasBeenDraggable = false;
                                    }
                                };

                                this.changePosition = function(name) {
                                    const grid = activeScreen.getObject("grid");
                                    const itemIndex = grid.itens.all[name].index;
                                    const thisIndex = grid.itens.all[this.name].index;
                                    let newPosition;

                                    if (itemIndex > thisIndex) {
                                        newPosition = itemIndex;
                                        Object.keys(grid.itens.all).forEach(key => {
                                            if (key == this.name) return;
                                            if (grid.itens.all[key].index >= grid.itens.all[this.name].index && grid.itens.all[key].index <= newPosition) grid.itens.all[key].index--;
                                        });
                                    }

                                    else {
                                        newPosition = itemIndex;
                                        Object.keys(grid.itens.all).forEach(key => {
                                            if (key == this.name) return;
                                            if (grid.itens.all[key].index <= grid.itens.all[this.name].index && grid.itens.all[key].index >= newPosition) grid.itens.all[key].index++;
                                        });
                                    }

                                    grid.itens.all[this.name].index = newPosition;
                                };

                                this.positionSwapCheck = function() {
                                    let res = null;

                                    activeScreen.objects.forEach(obj => {
                                        if (res !== null) return;

                                        if (obj.type == "block") {
                                            if (obj.state == "hover" && obj.name != this.name) {
                                                res = obj.name;
                                            }
                                        }
                                    });

                                    return res;
                                };

                                this.onclick = function() {
                                    const grid = activeScreen.getObject("grid");
                                    if (grid.itens.all[this.name].index < grid.offset || grid.itens.all[this.name].index > grid.offset + grid.count - 1) return;

                                    if (this.loop_count < 10) this.loop_count++;
                                    else this.loop_count = 2;

                                    activeScreen.getObject(this.parthener).loop_count = this.loop_count;
                                }
                            }

                            const newObj2 = activeScreen.getObject(objName + (num + 2));
                            newObj2.init = newObj.init;

                            newObj.init();
                            newObj2.init();
                            newObj2.parthener = objName + (num + 1);
                            newObj2.loop_count = 2;
                        };

                        this.update = function() {
                            this.sprX = this.x;
                            this.sprY = this.y;
                            this.sprWidth = this.width;
                            this.sprHeight = this.height;

                            if (this.hasBeenDraggable && !this.pressed) {
                                if (hasColision(this, activeScreen.getObject("grid"))) this.placeInGrid();

                                this.resetPosition();
                                this.hasBeenDraggable = false;
                            }
                        };
                    };

                    const left_arrow = this.getObject("left_arrow");
                    left_arrow.init = function() {
                        this.spriteX = 0;
                        this.spriteY = 0;
                        this.spriteWidth = 512;
                        this.spriteHeight = 512;

                        this.x = function() {
                            const grid = activeScreen.getObject("grid");
                            return grid.x() - grid.padding.x() / 2;
                        };

                        this.y = function() {
                            const grid = activeScreen.getObject("grid");
                            return grid.y() + (grid.height() - this.height()) / 2;
                        };

                        this.width = function() {
                            return this.height();
                        };

                        this.height = function() {
                            const grid = activeScreen.getObject("grid");
                            return grid.height() * 0.45;
                        };

                        this.sprX = this.x;
                        this.sprY = this.y;
                        this.sprWidth = this.width;
                        this.sprHeight = this.height;

                        this.onclick = function() {
                            const grid = activeScreen.getObject("grid");
                            grid.offset = Math.max(0, grid.offset - 1);
                        };
                    };

                    const right_arrow = this.getObject("right_arrow");
                    right_arrow.init = function() {
                        this.spriteX = 0;
                        this.spriteY = 0;
                        this.spriteWidth = 512;
                        this.spriteHeight = 512;

                        this.x = function() {
                            const grid = activeScreen.getObject("grid");
                            return grid.x() + grid.width() - grid.padding.x() / 2;
                        };

                        this.y = function() {
                            const grid = activeScreen.getObject("grid");
                            return grid.y() + (grid.height() - this.height()) / 2;
                        };

                        this.width = function() {
                            return this.height();
                        };

                        this.height = function() {
                            const grid = activeScreen.getObject("grid");
                            return grid.height() * 0.45;
                        };

                        this.sprX = this.x;
                        this.sprY = this.y;
                        this.sprWidth = this.width;
                        this.sprHeight = this.height;

                        this.onclick = function() {
                            const grid = activeScreen.getObject("grid");
                            if (grid.itens.count - grid.offset > grid.count) grid.offset++;
                        };
                    };

                    this.objects.forEach(obj => { obj.init() });

                    this.initLevel();
                    this.onload = false;
                }
            },

            initLevel() {
                const grid = this.getObject("grid");

                this.objects.push(
                    new RenderObject("level_frame", "level", null, null, null, null, null, "preto-t40", "branco", 1, null, null, null, null, null, null, 0, false, false, false, true, true, false),
                );

                this.objPosition["level_frame"] = this.objects.length - 1;

                const level_frame = this.getObject("level_frame");
                level_frame.objects_per_line = this.level.columns;
                level_frame.lines = this.level.lines;
                level_frame.init = function() {
                    this.x = grid.x;

                    this.y = function() {
                        return canvas.height * 0.35 - this.height() * 0.5;
                    }

                    this.width = grid.width;

                    this.height = function() {
                        return canvas.height * 0.6;
                    }

                    this.borderRadius = function() { return 0; }
                };

                level_frame.init();

                let blocks = [];

                this.level.paths.forEach((line, index) => {
                    for (let i = 0; i < line.length; i++) {
                        switch (line.charAt(i)) {
                            case "#": {
                                const block = new RenderObject("path_block-", "level_block", null, null, null, null, null, null, null, 0, null, null, null, null, null, null, 0, false, false, false, false, false, false, "./assets/image/blocks_tiles/path_block", null, true)

                                block.init = function() {
                                    this.spriteX = 0;
                                    this.spriteY = 0;
                                    this.spriteWidth = 32;
                                    this.spriteHeight = 32;

                                    this.name += (index * level_frame.objects_per_line + i);
                                    this.line = index;
                                    this.index = i;

                                    this.x = function() {
                                        const frame = activeScreen.getObject("level_frame");
                                        if (frame.objects_per_line % 2 == 0) {
                                            return frame.x() + frame.width() * 0.5 + (this.width() + this.px()) * (this.index - frame.objects_per_line / 2);
                                        }

                                        else {
                                            if (this.index == Math.floor(frame.objects_per_line / 2)) return frame.x() + frame.width() * 0.5 - (this.width() + this.px()) * 0.5;
                                            else return frame.x() + frame.width() * 0.5 + (this.width() + this.px()) * (this.index - frame.objects_per_line / 2);
                                        }
                                    };

                                    this.y = function() {
                                        const frame = activeScreen.getObject("level_frame");
                                        if (frame.lines % 2 == 0) {
                                            return frame.y() + frame.height() * 0.5 + (this.height() + this.py()) * (this.line - frame.lines / 2);
                                        }

                                        else {
                                            if (this.line == Math.floor(frame.lines / 2)) return frame.y() + frame.height() * 0.5 - (this.height() + this.py()) * 0.5;
                                            else return frame.y() + frame.height() * 0.5 + (this.height() + this.py()) * (this.line - frame.lines / 2);
                                        }
                                    }

                                    this.height = function() {
                                        return canvas.height * 0.06;
                                    };

                                    this.width = this.height;

                                    this.sprX = this.x;
                                    this.sprY = this.y;
                                    this.sprWidth = this.width;
                                    this.sprHeight = this.height;

                                    this.px = function() {
                                        return 0;
                                    };

                                    this.py = function() {
                                        return 0;
                                    };

                                    this.borderRadius = function() { return 0; }

                                    let bottom = false, left = false, right = false, top = false;

                                    if (i % level_frame.objects_per_line == 0) left = true;
                                    if (i % level_frame.objects_per_line == level_frame.objects_per_line - 1) right = true;
                                    if (index % level_frame.lines == 0) top = true;
                                    if (index % level_frame.lines == level_frame.lines - 1) bottom = true;

                                    this.imageSrc += (bottom ? "-bottom" : "") + (left ? "-left" : "") + (right ? "-right" : "") + (top ? "-top" : "") + ".png";
                                    this.image.src = this.imageSrc;
                                }

                                const shadow = new RenderObject("path_block-", "level_block-shadow", null, null, null, null, null, "preto-t40", null, 0, null, null, null, null, null, null, 0, false, false, false, true, false, false)
                                shadow.init = function() {
                                    this.name += (index * level_frame.objects_per_line + i) + "-shadow";
                                    this.line = index;
                                    this.index = i;

                                    this.x = function() {
                                        const block = activeScreen.getObject(this.name.split("-shadow")[0]);
                                        return block.x() + block.width() * 0.15;
                                    };

                                    this.y = function() {
                                        const block = activeScreen.getObject(this.name.split("-shadow")[0]);
                                        return block.y() + block.height() * 0.15;
                                    }

                                    this.height = function() {
                                        const block = activeScreen.getObject(this.name.split("-shadow")[0]);
                                        return block.height();
                                    };

                                    this.width = this.height;

                                    this.borderRadius = function() { return 0; }
                                }

                                blocks.push(shadow);
                                blocks.push(block);
                                break;
                            }
                        }
                    }
                });

                blocks.forEach(obj => {
                    obj.init();
                    activeScreen.objects.push(obj);
                    activeScreen.objPosition[obj.name] = activeScreen.objects.length - 1;
                });

                blocks = [];

                this.level.itens.forEach((line, index) => {
                    for (let i = 0; i < line.length; i++) {
                        if (this.level.itens[index].charAt(i) == "#") {
                            const aux = new RenderObject("item-" + (this.level.lines * index + i), "level", null, null, null, null, null, "verde", null, 0, null, null, null, null, null, null, 0, false, false, false, false, false, false, "./assets/image/item.png", null, true);
                            aux.init = function() {
                                this.spriteX = 0;
                                this.spriteY = 0;
                                this.spriteWidth = 24;
                                this.spriteHeight = 24;

                                this.x = function() {
                                    const tmp = activeScreen.getObject("path_block-" + (activeScreen.level.lines * index + i));
                                    return tmp.x() + (tmp.width() - this.width()) / 2;
                                }

                                this.y = function() {
                                    const tmp = activeScreen.getObject("path_block-" + (activeScreen.level.lines * index + i));
                                    return tmp.y() + (tmp.height() - this.height()) / 2;
                                }

                                this.width = function() {
                                    const tmp = activeScreen.getObject("path_block-" + (activeScreen.level.lines * index + i));
                                    return tmp.width() * 0.3;
                                }

                                this.height = function() {
                                    const tmp = activeScreen.getObject("path_block-" + (activeScreen.level.lines * index + i));
                                    return tmp.height() * 0.3;
                                }

                                this.sprX = this.x;
                                this.sprY = this.y;
                                this.sprWidth = this.width;
                                this.sprHeight = this.height;

                                this.borderRadius = function() { return 0; }
                            };

                            blocks.push(aux);
                        }
                    }
                });

                const player = new RenderObject("player", "player", null, null, null, null, null, null, "azul", 1, null, null, null, null, null, null, 0, false, false, false, false, false, false, "./assets/image/player.png", null, true)
                player.init = function() {
                    this.itensCollected = 0;

                    this.resetState = function() {
                        this.stateCord = {
                            x: activeScreen.level.player.x,
                            y: activeScreen.level.player.y,
                            direction: activeScreen.level.player.direction
                        }
                    }

                    this.resetState();

                    this.x = function() {
                        const block = activeScreen.getObject('path_block-2');
                        return block.x() - (block.width() + block.px()) * 2 + (block.width() + block.px()) * (this.stateCord.x - 1) + (block.width() - this.width()) / 2;
                    }

                    this.y = function() {
                        const block = activeScreen.getObject('path_block-2');
                        return block.y() + (block.height() + block.py()) * (this.stateCord.y - 1) + (block.height() - this.height()) / 2;
                    }

                    this.height = function() {
                        const block = activeScreen.getObject('path_block-2');
                        return block.height() * 0.8;
                    }

                    this.width = function() {
                        return this.height() * (this.statesMap[this.animState].width / this.statesMap[this.animState].height);
                    }

                    this.sprX = this.x;
                    this.sprY = this.y;
                    this.sprWidth = this.width;
                    this.sprHeight = this.height;

                    this.borderRadius = function() {
                        return 0;
                    }

                    this.animState = 'idle';
                    this.animTemp = 0;
                    this.currentFrame = 0;
                    this.changeState = {
                        new: 'idle',
                        ready: true
                    };

                    this.statesMap = {
                        idle: {
                            coords: {
                                'N': {
                                    x: 0,
                                    y: 69
                                },

                                'L': {
                                    x: 1,
                                    y: 38
                                },

                                'S': {
                                    x: 1,
                                    y: 6
                                },

                                'O': {
                                    x: 0,
                                    y: 102
                                }
                            },

                            width: 15,
                            height: 22,
                            offset: 81,
                            count: 2,
                            vel: 20,
                        },

                        walk: {
                            coords: {
                                'N': {
                                    x: 0,
                                    y: 69
                                },

                                'L': {
                                    x: 1,
                                    y: 38
                                },

                                'S': {
                                    x: 1,
                                    y: 6
                                },

                                'O': {
                                    x: 0,
                                    y: 102
                                }
                            },

                            width: 15,
                            height: 22,
                            offset: 1,
                            count: 4,
                            vel: 4
                        },

                        die: {

                        }
                    }

                    this.spriteX = 0;
                    this.spriteY = 0;
                    this.spriteWidth = 0;
                    this.spriteHeight = 0;

                    this.itensBuffer = [];

                    this.movement = {
                        has: false,
                        fun: null
                    }

                    this.update = function() {
                        if (activeScreen.passForward == 1) {
                            try {
                                let numX = Math.round(this.stateCord.x);
                                let numY = Math.round(this.stateCord.y);

                                if (this.stateCord.direction == 'L') {
                                    numX -= 0;
                                    numY -= 1;
                                }
                                else if (this.stateCord.direction == 'O') {
                                    numX -= 2;
                                    numY -= 1;
                                }
                                else if (this.stateCord.direction == 'S') {
                                    numX -= 1;
                                    numY -= 0;
                                }
                                else {
                                    numX -= 1;
                                    numY -= 2;
                                }

                                const i = activeScreen.getObject("item-" + (numY * activeScreen.level.columns + numX));
                                let push = true;

                                this.itensBuffer.forEach(element => {
                                    if (element == i.name) push = false;
                                });

                                if (push) {
                                    i.active = false;
                                    this.itensCollected++;
                                    this.itensBuffer.push(i.name);
                                }
                            }

                            catch { }
                        }

                        if (this.changeState.ready) {
                            this.spriteX = this.statesMap[this.changeState.new].coords[this.stateCord.direction].x;
                            this.spriteY = this.statesMap[this.changeState.new].coords[this.stateCord.direction].y;
                            this.spriteWidth = this.statesMap[this.changeState.new].width;
                            this.spriteHeight = this.statesMap[this.changeState.new].height;
                            this.stateCord.x = Math.round(this.stateCord.x);
                            this.stateCord.y = Math.round(this.stateCord.y);
                            this.animState = this.changeState.new;
                            this.changeState.ready = false;
                            this.currentFrame = 0;
                            this.animTemp = 0;
                        }

                        if (this.animTemp == this.statesMap[this.animState].vel) {
                            if (this.currentFrame == this.statesMap[this.animState].count - 1) {
                                this.spriteX = this.statesMap[this.animState].coords[this.stateCord.direction].x;
                                this.currentFrame = 0;
                            }

                            else {
                                this.spriteX += this.spriteWidth + this.statesMap[this.animState].offset;
                                this.currentFrame++;
                            }

                            if (this.movement.has) this.movement.fun();
                            else
                                switch (this.animState) {
                                    case 'idle': {
                                        break;
                                    }

                                    case 'walk': {
                                        switch (this.stateCord.direction) {
                                            case 'N': {
                                                if (this.stateCord.y > 1) {
                                                    if (activeScreen.level.paths[Math.round(this.stateCord.y - 2)].charAt(Math.round(this.stateCord.x - 1)) == '#') {
                                                        this.movement.has = true;
                                                        this.movement.fun = function() {
                                                            const player = activeScreen.getObject('player');
                                                            player.stateCord.y -= 1 / (60 / player.statesMap[player.animState].vel); }
                                                        this.stateCord.y -= 1 / (60 / this.statesMap[this.animState].vel);
                                                    }
                                                }

                                                break;
                                            }

                                            case 'L': {
                                                if (this.stateCord.x < activeScreen.level.columns) {
                                                    if (activeScreen.level.paths[Math.round(this.stateCord.y - 1)].charAt(Math.round(this.stateCord.x)) == '#') {
                                                        this.movement.has = true;
                                                        this.movement.fun = function() {
                                                            const player = activeScreen.getObject('player');
                                                            player.stateCord.x += 1 / (60 / player.statesMap[player.animState].vel);
                                                        }
                                                        this.stateCord.x += 1 / (60 / this.statesMap[this.animState].vel);
                                                    }
                                                }

                                                break;
                                            }
                                            case 'S': {
                                                if (this.stateCord.y < activeScreen.level.lines) {
                                                    if (activeScreen.level.paths[Math.round(this.stateCord.y)].charAt(Math.round(this.stateCord.x - 1)) == '#') {
                                                        this.movement.has = true;
                                                        this.movement.fun = function() {
                                                            const player = activeScreen.getObject('player');
                                                            player.stateCord.y += 1 / (60 / player.statesMap[player.animState].vel);
                                                        }
                                                        this.stateCord.y += 1 / (60 / this.statesMap[this.animState].vel);
                                                    }
                                                }

                                                break;
                                            }
                                            case 'O': {
                                                if (this.stateCord.x > 1) {
                                                    if (activeScreen.level.paths[Math.round(this.stateCord.y - 1)].charAt(Math.round(this.stateCord.x - 2)) == '#') {
                                                        this.movement.has = true;
                                                        this.movement.fun = function() {
                                                            const player = activeScreen.getObject('player');
                                                            player.stateCord.x -= 1 / (60 / player.statesMap[player.animState].vel); }
                                                        this.stateCord.x -= 1 / (60 / this.statesMap[this.animState].vel);
                                                    }
                                                }

                                                break;
                                            }
                                        }

                                        break;
                                    }
                                }

                            this.animTemp = 0;
                        }

                        this.animTemp++;
                    }
                }

                blocks.push(player);

                blocks.forEach(block => {
                    block.init();
                    activeScreen.objects.push(block);
                    activeScreen.objPosition[block.name] = activeScreen.objects.length - 1;
                });
            },

            getObject(name) {
                return this.objects[this.objPosition[name]];
            },

            destroyObject(name) {
                const pos = this.objPosition[name];
                const aux = [];

                this.objects.forEach((obj, index) => {
                    if (index != pos) aux.push(obj);
                });

                this.objects = aux;
                this.objPosition[name] = undefined;

                Object.keys(this.objPosition).forEach(key => {
                    if (this.objPosition[key] > pos) this.objPosition[key]--;
                });
            },

            counter: 0,
            current: 0,
            loop_index: [],
            passForward: 0,

            run_game() {
                const itens = this.getObject("grid").itens;
                const player = this.getObject("player");

                if (this.passForward > 0) this.passForward--;

                if (this.counter % 60 * 5 == 0) {
                    player.movement.has = false;
                    player.changeState = {
                        new: 'idle',
                        ready: true
                    }

                    let obj = undefined, objKey = undefined;

                    Object.keys(itens.all).forEach(key => {
                        const aux = this.getObject(key);

                        if (itens.all[key].index == this.current) {
                            obj = itens.all[key];
                            objKey = key;
                            aux.state = 'hover';
                        }

                        else aux.state = 'normal';
                    });

                    if (!(itens.count > this.current)) this.current++;

                    else {
                        switch (obj.type) {
                            case "forward": {
                                this.passForward = 1;

                                player.changeState = {
                                    new: 'walk',
                                    ready: true
                                }

                                break;
                            }

                            case "turn": {
                                const dir = player.stateCord.direction == 'N' ? 'L' : player.stateCord.direction == 'L' ? 'S' : player.stateCord.direction == 'S' ? 'O' : 'N';
                                player.stateCord.direction = dir;

                                break;
                            }

                            case "loop": {
                                let found = undefined;

                                this.loop_index.forEach(obj => {
                                    if (obj.end == this.current && obj.count > 1) {
                                        found = obj.start;
                                        obj.count--;
                                    }

                                    else if (obj.end == this.current && obj.count <= 1) {
                                        obj.count = this.getObject(objKey).loop_count;
                                        found = this.current;
                                    }
                                });

                                if (found != undefined) this.current = found;

                                else {
                                    const name = this.getObject(objKey).parthener;
                                    let endIndex = undefined;

                                    Object.keys(itens.all).forEach(key => {
                                        if (endIndex) return;
                                        if (key == name) endIndex = itens.all[key].index;
                                    });

                                    this.loop_index.push({ start: this.current, end: endIndex, count: this.getObject(objKey).loop_count });
                                }

                                break;
                            }
                        }

                        this.current++;
                        this.counter = 0;
                    }
                }

                if (itens.count == this.current - 1) {
                    this.game_running = false;
                    this.counter = 0;
                    this.current = 0;
                    this.loop_index = [];
                    player.resetState();
                    player.changeState = {
                        new: 'idle',
                        ready: true
                    }

                    player.itensBuffer.forEach(item => {
                        this.getObject(item).active = true;
                    });

                    player.itensBuffer = [];

                    if (player.itensCollected == activeScreen.level.quantItens) {
                        bd[this.label] = true;
                        changeScreen(screens.lobby);
                    }

                    player.itensCollected = 0;
                }

                this.counter++;
            }
        },

        level_5: {
            label: "level_5",
            level: {
                paths: [
                    "#####",
                    "#.#.#",
                    "#####",
                    "#.#.#",
                    "#####"
                ],

                itens: [
                    "#####",
                    "#.#.#",
                    "##.##",
                    "#.#.#",
                    "#####"
                ],

                enemies: [
                    ".....",
                    ".....",
                    ".....",
                    ".....",
                    "....."
                ],

                player: {
                    x: 3,
                    y: 3,
                    direction: 'S'
                },

                columns: 5,
                lines: 5,
                quantItens: 20,
            },

            onload: true,
            objects: [],
            objPosition: {},
            game_running: false,

            background: {
                image: new Image(),
                imageSrc: "./assets/image/background.png",
                layerColor: "rgba(0, 0, 0, 0.5)",

                render() {
                    ctx.drawImage(this.image, 0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = this.layerColor;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
            },

            render() {
                this.update();
                this.background.render();

                this.objects.forEach(obj => {
                    if (!this.game_running) obj.update();
                    else if (obj.name == 'player') obj.update();

                    if (obj.active) obj.render();
                    if (obj.renderAux) obj.renderAux();
                });

                if (this.game_running) {
                    this.run_game();
                }
            },

            update() {
                if (this.onload) {
                    this.background.image.src = this.background.imageSrc;

                    this.objects = [];
                    this.objects.push(
                        new RenderObject(
                            "grid", "interface",
                            null, null, null, null, null,
                            null, null, 0, null, null, null, null, null, null, 0, false, false, false, false, false, false,
                            "./assets/image/grid.png", null, true
                        ),
                        new RenderObject(
                            "play_button", "interface",
                            null, null, null, null, null,
                            null, null, 0, null, null, null, null, null, null, 0, false, true, true, false, false, false,
                            "./assets/image/play_button.png", "./assets/image/play_button-hover.png", true
                        ),
                        new RenderObject(
                            "left_arrow", "interface",
                            null, null, null, null, function() { return 0; },
                            null, null, 0, null, null,
                            null, null,
                            null, null, null,
                            false, true, true, false, false, false,
                            "./assets/image/arrow_left.png", "./assets/image/arrow_left-hover.png", true
                        ),
                        new RenderObject(
                            "right_arrow", "interface",
                            null, null, null, null, function() { return 0; },
                            null, null, 0, null, null,
                            null, null,
                            null, null, null,
                            false, true, true, false, false, false,
                            "./assets/image/arrow_right.png", "./assets/image/arrow_right-hover.png", true
                        ),
                        new RenderObject(
                            "forward_block", "control",
                            null, null, null, null, null,
                            null, null, 0, null, null, null, null, null, null, 0, true, false, true, false, false, false,
                            "./assets/image/forward_block.png", "./assets/image/forward_block-hover.png", true
                        ),
                        new RenderObject(
                            "turn_block", "control",
                            null, null, null, null, null,
                            null, null, 0, null, null, null, null, null, null, 0, true, false, true, false, false, false,
                            "./assets/image/turn_block.png", "./assets/image/turn_block-hover.png", true
                        ),
                        new RenderObject(
                            "loop_block", "control",
                            null, null, null, null, null,
                            null, null, 0, null, null, null, null, null, null, 0, true, false, true, false, false, false,
                            "./assets/image/loop_block.png", "./assets/image/loop_block-hover.png", true
                        )
                    );

                    this.objects.forEach((obj, index) => {
                        this.objPosition[obj.name] = index;
                    });

                    const grid = this.getObject("grid");
                    grid.init = function() {
                        this.count = 0;
                        this.offset = 0;

                        this.x = function() { return canvas.width * 0.2; };
                        this.y = function() { return canvas.height * 0.7; };
                        this.width = function() { return canvas.width * 0.6; };
                        this.height = function() { return canvas.height * 0.15; };
                        this.borderRadius = function() { return 0; };

                        this.spriteX = 0;
                        this.spriteY = 0;
                        this.spriteWidth = 1285;
                        this.spriteHeight = 252;

                        this.sprX = this.x;
                        this.sprY = this.y;
                        this.sprWidth = this.width;
                        this.sprHeight = this.height;

                        this.itens = {
                            all: {},
                            count: 0
                        };

                        this.padding = {
                            x: function() {
                                return activeScreen.getObject("grid").width() * 0.05;
                            },

                            y: function() {
                                return (activeScreen.getObject("grid").height() - canvas.height * 0.1) * 0.5;
                            }
                        };

                        this.update = function() {
                            const size = this.width() - this.padding.x() * 2;
                            this.count = Math.floor(size / activeScreen.getObject("forward_block").width());
                        };
                    };

                    const play_button = this.getObject("play_button");
                    play_button.init = function() {
                        this.spriteX = 0;
                        this.spriteY = 0;
                        this.spriteWidth = 214;
                        this.spriteHeight = 214;

                        this.x = function() { return canvas.width * 0.2 + canvas.width * 0.65; },

                        this.y = function() {
                            const grid = activeScreen.getObject("grid");
                            return grid.y() + grid.padding.y();
                        }

                        this.width = function() { return canvas.height * 0.1; },
                        this.height = function() { return canvas.height * 0.1; },
                        this.borderRadius = function() { return this.width() * 0.1; },

                        this.onclick = function() {
                            if (this.checkBlocks()) {
                                this.state = 'normal';
                                activeScreen.game_running = true;
                            }

                            else { alert("Não coloque dois blocos de repetição entrelaçados!\nColoque o bloco de abertura e de fechamento na mesma região"); }
                        }

                        this.checkBlocks = function() {
                            const grid = activeScreen.getObject("grid");
                            const tmp = Array(grid.itens.count);

                            Object.keys(grid.itens.all).forEach(key => {
                                tmp[grid.itens.all[key].index] = {
                                    name: key,
                                    type: grid.itens.all[key].type
                                }
                            });

                            let res = true;
                            let parthener = undefined;
                            tmp.forEach(item => {
                                if (!res) return;

                                if (item.type == 'loop') {
                                    if (!parthener) parthener = activeScreen.getObject(item.name).parthener;
                                    else {
                                        if (parthener == item.name) parthener = undefined;
                                        else res = false;
                                    }
                                }
                            });

                            return res;
                        }

                        this.sprX = this.x;
                        this.sprY = this.y;
                        this.sprWidth = this.width;
                        this.sprHeight = this.height;
                    };

                    const forward_block = this.getObject("forward_block");
                    forward_block.init = function() {
                        this.spriteX = 0;
                        this.spriteY = 0;
                        this.spriteWidth = 214;
                        this.spriteHeight = 214;

                        this.x =  function() { return canvas.width * 0.5 - this.width() * 1.5 - 10; };
                        this.y = function() {
                            const grid = activeScreen.getObject('grid');
                            return grid.y() + grid.height() + grid.padding.y();
                        };

                        this.width = function() { return canvas.height * 0.1; };
                        this.height = function() { return canvas.height * 0.1; };
                        this.borderRadius = function() { return canvas.height * 0.1 * 0.35; };

                        this.resetPosition = function(resetObj = false) {
                            this.x =  function() { return canvas.width * 0.5 - this.width() * 1.5 - 10; };
                            this.y = function() {
                                const grid = activeScreen.getObject('grid');
                                return grid.y() + grid.height() + grid.padding.y();
                            };
                            this.width = function() { return canvas.height * 0.1; };
                            this.height = function() { return canvas.height * 0.1; };
                            this.borderRadius = function() { return canvas.height * 0.1 * 0.35; };
                        };

                        this.placeInGrid = function() {
                            const grid = activeScreen.getObject("grid");

                            let num = 0;
                            Object.keys(grid.itens.all).forEach(key => {
                                if (key.includes("forward") && key.length > this.name.length) num = Math.max(num, Number(key.split("-")[1]));
                            });

                            const objName = this.name + '-' + (num + 1);
                            const objPos = activeScreen.objPosition[this.name];

                            activeScreen.objects.splice(objPos, 0,
                                new RenderObject(objName, "block", null, null, null, null, this.borderRadius, this.fillColor, this.strokeColor, this.strokeWidth, this.text, this.textColor, this.textAlign, this.textVerticalAlign, this.textPosition, this.font, this.fontSize, true, false, true, false, false, false, this.imageSrc, this.imageHoverSrc, true)
                            );

                            Object.keys(activeScreen.objPosition).forEach(key => {
                                if (objPos <= activeScreen.objPosition[key]) activeScreen.objPosition[key]++;
                            });

                            activeScreen.objPosition[objName] = objPos;

                            grid.itens.all[objName] = {
                                type: "forward",
                                index: Object.keys(grid.itens.all).length
                            };

                            grid.itens.count++;

                            const newObj = activeScreen.getObject(objName);

                            newObj.init = function() {
                                this.spriteX = 0;
                                this.spriteY = 0;
                                this.spriteWidth = 214;
                                this.spriteHeight = 214;

                                this.width = function() {
                                    return canvas.height * 0.1;
                                };

                                this.height = function() {
                                    return this.width();
                                };

                                this.x = function() {
                                    const gridObj = activeScreen.getObject('grid');
                                    return gridObj.x() + gridObj.padding.x() + this.width() * (gridObj.itens.all[this.name].index - gridObj.offset);
                                };

                                this.y = function() {
                                    const gridObj = activeScreen.getObject('grid');
                                    return gridObj.padding.y() + gridObj.y();
                                };

                                this.resetPosition = function() {
                                    this.width = function() {
                                        return canvas.height * 0.1;
                                    };

                                    this.height = function() {
                                        return this.width();
                                    };

                                    this.x = function() {
                                        const gridObj = activeScreen.getObject('grid');
                                        return gridObj.x() + gridObj.padding.x() + this.width() * (gridObj.itens.all[this.name].index - gridObj.offset);
                                    };

                                    this.y = function() {
                                        const gridObj = activeScreen.getObject('grid');
                                        return gridObj.padding.y() + gridObj.y();
                                    };
                                };

                                this.update = function() {
                                    if (grid.itens.all[this.name].index < grid.offset || grid.itens.all[this.name].index > grid.offset + grid.count - 1) this.state = 'normal';

                                    this.sprX = this.x;
                                    this.sprY = this.y;
                                    this.sprWidth = this.width;
                                    this.sprHeight = this.height;

                                    if (this.hasBeenDraggable && !this.pressed) {
                                        const grid = activeScreen.getObject("grid");

                                        if (hasColision(this, grid)) {
                                            const pos = this.positionSwapCheck();
                                            if (pos !== null) this.changePosition(pos);
                                            this.resetPosition();
                                        }

                                        else {
                                            activeScreen.destroyObject(this.name);
                                            const aux = {};
                                            Object.keys(grid.itens.all).forEach(key => {
                                                if (key != this.name) {
                                                    let pos = grid.itens.all[key];
                                                    if (grid.itens.all[key].index > grid.itens.all[this.name].index) pos.index--;
                                                    aux[key] = pos;
                                                }
                                            });

                                            grid.itens.count--;
                                            grid.itens.all = aux;
                                        }

                                        this.hasBeenDraggable = false;
                                    }
                                };

                                this.changePosition = function(name) {
                                    const grid = activeScreen.getObject("grid");
                                    const itemIndex = grid.itens.all[name].index;
                                    const thisIndex = grid.itens.all[this.name].index;
                                    let newPosition;

                                    if (itemIndex > thisIndex) {
                                        newPosition = itemIndex;
                                        Object.keys(grid.itens.all).forEach(key => {
                                            if (key == this.name) return;
                                            if (grid.itens.all[key].index >= grid.itens.all[this.name].index && grid.itens.all[key].index <= newPosition) grid.itens.all[key].index--;
                                        });
                                    }

                                    else {
                                        newPosition = itemIndex;
                                        Object.keys(grid.itens.all).forEach(key => {
                                            if (key == this.name) return;
                                            if (grid.itens.all[key].index <= grid.itens.all[this.name].index && grid.itens.all[key].index >= newPosition) grid.itens.all[key].index++;
                                        });
                                    }

                                    grid.itens.all[this.name].index = newPosition;
                                };

                                this.positionSwapCheck = function() {
                                    let res = null;

                                    activeScreen.objects.forEach(obj => {
                                        if (res !== null) return;

                                        if (obj.type == "block") {
                                            if (obj.state == "hover" && obj.name != this.name) {
                                                obj.state = 'normal';
                                                res = obj.name;
                                            }
                                        }
                                    });

                                    return res;
                                };
                            }

                            newObj.init();
                        };

                        this.update = function() {
                            this.sprX = this.x;
                            this.sprY = this.y;
                            this.sprWidth = this.width;
                            this.sprHeight = this.height;

                            if (this.hasBeenDraggable && !this.pressed) {
                                if (hasColision(this, activeScreen.getObject("grid"))) this.placeInGrid();

                                this.resetPosition();
                                this.hasBeenDraggable = false;
                            }
                        };
                    };

                    const turn_block = this.getObject("turn_block");
                    turn_block.init = function() {
                        this.spriteX = 0;
                        this.spriteY = 0;
                        this.spriteWidth = 214;
                        this.spriteHeight = 214;

                        this.x =  function() { return canvas.width * 0.5 - this.width() * 0.5; };
                        this.y = function() {
                            const grid = activeScreen.getObject('grid');
                            return grid.y() + grid.height() + grid.padding.y();
                        };

                        this.width = function() { return canvas.height * 0.1; };
                        this.height = function() { return canvas.height * 0.1; };
                        this.borderRadius = function() { return canvas.height * 0.1 * 0.1; };

                        this.resetPosition = function() {
                            this.x =  function() { return canvas.width * 0.5 - this.width() * 0.5; };
                            this.y = function() {
                                const grid = activeScreen.getObject('grid');
                                return grid.y() + grid.height() + grid.padding.y();
                            };
                            this.width = function() { return canvas.height * 0.1; };
                            this.height = function() { return canvas.height * 0.1; };
                            this.borderRadius = function() { return canvas.height * 0.1 * 0.1; };
                        };

                        this.placeInGrid = function() {
                            const grid = activeScreen.getObject("grid");

                            let num = 0;
                            Object.keys(grid.itens.all).forEach(key => {
                                if (key.includes("turn") && key.length > this.name.length) num = Math.max(num, Number(key.split("-")[1]));
                            });

                            const objName = this.name + '-' + (num + 1);
                            const objPos = activeScreen.objPosition["forward_block"];

                            activeScreen.objects.splice(objPos, 0,
                                new RenderObject(objName, "block", null, null, null, null, this.borderRadius, this.fillColor, this.strokeColor, this.strokeWidth, null, null, null, null, null, null, 0, true, false, true, false, false, false, this.imageSrc, this.imageHoverSrc, this.hasImage)
                            );

                            Object.keys(activeScreen.objPosition).forEach(key => {
                                if (objPos <= activeScreen.objPosition[key]) activeScreen.objPosition[key]++;
                            });

                            activeScreen.objPosition[objName] = objPos;

                            grid.itens.all[objName] = {
                                type: "turn",
                                index: Object.keys(grid.itens.all).length
                            };

                            grid.itens.count++;

                            const newObj = activeScreen.getObject(objName);

                            newObj.init = function() {
                                this.spriteX = 0;
                                this.spriteY = 0;
                                this.spriteWidth = 214;
                                this.spriteHeight = 214;

                                this.width = function() {
                                    return canvas.height * 0.1;
                                };

                                this.height = function() {
                                    return this.width();
                                };

                                this.x = function() {
                                    const gridObj = activeScreen.getObject('grid');
                                    return gridObj.x() + gridObj.padding.x() + this.width() * (gridObj.itens.all[this.name].index - gridObj.offset);
                                };

                                this.y = function() {
                                    const gridObj = activeScreen.getObject('grid');
                                    return gridObj.padding.y() + gridObj.y();
                                };

                                this.resetPosition = function() {
                                    this.width = function() {
                                        return canvas.height * 0.1;
                                    };

                                    this.height = function() {
                                        return this.width();
                                    };

                                    this.x = function() {
                                        const gridObj = activeScreen.getObject('grid');
                                        return gridObj.x() + gridObj.padding.x() + this.width() * (gridObj.itens.all[this.name].index - gridObj.offset);
                                    };

                                    this.y = function() {
                                        const gridObj = activeScreen.getObject('grid');
                                        return gridObj.padding.y() + gridObj.y();
                                    };
                                };

                                this.update = function() {
                                    if (grid.itens.all[this.name].index < grid.offset || grid.itens.all[this.name].index > grid.offset + grid.count - 1) this.state = 'normal';

                                    this.sprX = this.x;
                                    this.sprY = this.y;
                                    this.sprWidth = this.width;
                                    this.sprHeight = this.height;

                                    if (this.hasBeenDraggable && !this.pressed) {
                                        const grid = activeScreen.getObject("grid");
                                        if (hasColision(this, grid)) {
                                            const pos = this.positionSwapCheck();
                                            if (pos !== null) this.changePosition(pos);

                                            this.resetPosition();
                                        }

                                        else {
                                            activeScreen.destroyObject(this.name);
                                            const aux = {};
                                            Object.keys(grid.itens.all).forEach(key => {
                                                if (key != this.name) {
                                                    let pos = grid.itens.all[key];
                                                    if (grid.itens.all[key].index > grid.itens.all[this.name].index) pos.index--;
                                                    aux[key] = pos;
                                                }
                                            });

                                            grid.itens.count--;
                                            grid.itens.all = aux;
                                        }

                                        this.hasBeenDraggable = false;
                                    }
                                };

                                this.changePosition = function(name) {
                                    const grid = activeScreen.getObject("grid");
                                    const itemIndex = grid.itens.all[name].index;
                                    const thisIndex = grid.itens.all[this.name].index;
                                    let newPosition;

                                    if (itemIndex > thisIndex) {
                                        newPosition = itemIndex;
                                        Object.keys(grid.itens.all).forEach(key => {
                                            if (key == this.name) return;
                                            if (grid.itens.all[key].index >= grid.itens.all[this.name].index && grid.itens.all[key].index <= newPosition) grid.itens.all[key].index--;
                                        });
                                    }

                                    else {
                                        newPosition = itemIndex;
                                        Object.keys(grid.itens.all).forEach(key => {
                                            if (key == this.name) return;
                                            if (grid.itens.all[key].index <= grid.itens.all[this.name].index && grid.itens.all[key].index >= newPosition) grid.itens.all[key].index++;
                                        });
                                    }

                                    grid.itens.all[this.name].index = newPosition;
                                };

                                this.positionSwapCheck = function() {
                                    let res = null;

                                    activeScreen.objects.forEach(obj => {
                                        if (res !== null) return;

                                        if (obj.type == "block") {
                                            if (obj.state == "hover" && obj.name != this.name) {
                                                res = obj.name;
                                            }
                                        }
                                    });

                                    return res;
                                };
                            }

                            newObj.init();
                        };

                        this.update = function() {
                            this.sprX = this.x;
                            this.sprY = this.y;
                            this.sprWidth = this.width;
                            this.sprHeight = this.height;

                            if (this.hasBeenDraggable && !this.pressed) {
                                if (hasColision(this, activeScreen.getObject("grid"))) this.placeInGrid();

                                this.resetPosition();
                                this.hasBeenDraggable = false;
                            }
                        };
                    };

                    const loop_block = this.getObject("loop_block");
                    loop_block.init = function() {
                        this.spriteX = 0;
                        this.spriteY = 0;
                        this.spriteWidth = 214;
                        this.spriteHeight = 214;

                        this.x =  function() { return canvas.width * 0.5 + this.width() * 0.5 + 10; };
                        this.y = function() {
                            const grid = activeScreen.getObject('grid');
                            return grid.y() + grid.height() + grid.padding.y();
                        };
                        this.width = function() { return canvas.height * 0.1; };
                        this.height = function() { return canvas.height * 0.1; };
                        this.borderRadius = function() { return canvas.height * 0.1 * 0.1; };

                        this.resetPosition = function() {
                            this.x =  function() { return canvas.width * 0.5 + this.width() * 0.5 + 10; };
                            this.y = function() {
                                const grid = activeScreen.getObject('grid');
                                return grid.y() + grid.height() + grid.padding.y();
                            };

                            this.width = function() { return canvas.height * 0.1; };
                            this.height = function() { return canvas.height * 0.1; };
                            this.borderRadius = function() { return canvas.height * 0.1 * 0.1; };
                        };

                        this.placeInGrid = function() {
                            const grid = activeScreen.getObject("grid");

                            let num = 0;
                            Object.keys(grid.itens.all).forEach(key => {
                                if (key.includes("loop") && key.length > this.name.length) num = Math.max(num, Number(key.split("-")[1]));
                            });

                            const objName = this.name + '-';
                            const objPos = activeScreen.objPosition["forward_block"];

                            activeScreen.objects.splice(objPos, 0,
                                new RenderObject(objName + (num + 1), "block", null, null, null, null, this.borderRadius, this.fillColor, this.strokeColor, this.strokeWidth, null, null, null, null, null, null, 0, true, true, true, false, false, false, this.imageSrc, this.imageHoverSrc, true),
                                new RenderObject(objName + (num + 2), "block", null, null, null, null, this.borderRadius, this.fillColor, this.strokeColor, this.strokeWidth, "", "branco", null, null, null, null, 0, true, true, true, false, false, false, this.imageSrc, this.imageHoverSrc, true)
                            );

                            Object.keys(activeScreen.objPosition).forEach(key => {
                                if (objPos <= activeScreen.objPosition[key]) activeScreen.objPosition[key] += 2;
                            });

                            activeScreen.objPosition[objName + (num + 1)] = objPos;
                            activeScreen.objPosition[objName + (num + 2)] = objPos + 1;

                            grid.itens.all[objName + (num + 1)] = {
                                type: "loop",
                                index: Object.keys(grid.itens.all).length
                            };

                            grid.itens.all[objName + (num + 2)] = {
                                type: "loop",
                                index: Object.keys(grid.itens.all).length
                            };

                            grid.itens.count += 2;

                            const newObj = activeScreen.getObject(objName + (num + 1));

                            newObj.init = function() {
                                this.spriteX = 0;
                                this.spriteY = 0;
                                this.spriteWidth = 214;
                                this.spriteHeight = 214;

                                this.parthener = objName + (num + 2);
                                this.loop_count = 2;
                                this.firstDrag = true;

                                this.renderAux = function() {
                                    const grid = activeScreen.getObject("grid");

                                    try {
                                        if (grid.itens.all[this.name].index < grid.offset || grid.itens.all[this.name].index > grid.offset + grid.count - 1) return;
                                    }

                                    catch (err) {
                                        if (grid.itens.all[this.parthener]) throw err;
                                    }

                                    const x = this.x() + this.width() * 0.82;
                                    const y = this.y() + this.width() * 0.18 * 0.5;

                                    ctx.fillCircle(x, y, this.width() * 0.18, "rgb(160, 30, 30)");
                                    ctx.fillStyle = "rgb(240, 240, 240)";
                                    ctx.textAlign = textAlign.horizontal.center;
                                    ctx.textBaseline = textAlign.vertical.center;
                                    ctx.font = `${fonts.small_text.size()}px '${fonts.small_text.font}'`;
                                    ctx.fillText(this.loop_count, x, y);
                                }

                                this.width = function() {
                                    return canvas.height * 0.1;
                                };

                                this.height = function() {
                                    return this.width();
                                };

                                this.x = function() {
                                    const gridObj = activeScreen.getObject('grid');
                                    return gridObj.x() + gridObj.padding.x() + this.width() * (gridObj.itens.all[this.name].index - gridObj.offset);
                                };

                                this.y = function() {
                                    const gridObj = activeScreen.getObject('grid');
                                    return gridObj.padding.y() + gridObj.y();
                                };

                                this.resetPosition = function() {
                                    this.width = function() {
                                        return canvas.height * 0.1;
                                    };

                                    this.height = function() {
                                        return this.width();
                                    };

                                    this.x = function() {
                                        const gridObj = activeScreen.getObject('grid');
                                        return gridObj.x() + gridObj.padding.x() + this.width() * (gridObj.itens.all[this.name].index - gridObj.offset);
                                    };

                                    this.y = function() {
                                        const gridObj = activeScreen.getObject('grid');
                                        return gridObj.padding.y() + gridObj.y();
                                    };
                                };

                                this.update = function() {
                                    if (grid.itens.all[this.name].index < grid.offset || grid.itens.all[this.name].index > grid.offset + grid.count - 1) this.state = 'normal';

                                    this.sprX = this.x;
                                    this.sprY = this.y;
                                    this.sprWidth = this.width;
                                    this.sprHeight = this.height;

                                    if (this.hasBeenDraggable && !this.pressed) {
                                        const grid = activeScreen.getObject("grid");
                                        if (hasColision(this, grid)) {
                                            const pos = this.positionSwapCheck();
                                            if (pos !== null) this.changePosition(pos);

                                            this.resetPosition();
                                        }

                                        else {
                                            activeScreen.destroyObject(this.parthener);

                                            let aux = {};
                                            Object.keys(grid.itens.all).forEach(key => {
                                                if (key != this.parthener) {
                                                    let pos = grid.itens.all[key];
                                                    if (grid.itens.all[key].index > grid.itens.all[this.parthener].index) pos.index--;
                                                    aux[key] = pos;
                                                }
                                            });

                                            grid.itens.count--;
                                            grid.itens.all = aux;

                                            activeScreen.destroyObject(this.name);
                                            aux = {};
                                            Object.keys(grid.itens.all).forEach(key => {
                                                if (key != this.name) {
                                                    let pos = grid.itens.all[key];
                                                    if (grid.itens.all[key].index > grid.itens.all[this.name].index) pos.index--;
                                                    aux[key] = pos;
                                                }
                                            });

                                            grid.itens.count--;
                                            grid.itens.all = aux;
                                        }

                                        this.hasBeenDraggable = false;
                                    }
                                };

                                this.changePosition = function(name) {
                                    const grid = activeScreen.getObject("grid");
                                    const itemIndex = grid.itens.all[name].index;
                                    const thisIndex = grid.itens.all[this.name].index;
                                    let newPosition;

                                    if (itemIndex > thisIndex) {
                                        newPosition = itemIndex;
                                        Object.keys(grid.itens.all).forEach(key => {
                                            if (key == this.name) return;
                                            if (grid.itens.all[key].index >= grid.itens.all[this.name].index && grid.itens.all[key].index <= newPosition) grid.itens.all[key].index--;
                                        });
                                    }

                                    else {
                                        newPosition = itemIndex;
                                        Object.keys(grid.itens.all).forEach(key => {
                                            if (key == this.name) return;
                                            if (grid.itens.all[key].index <= grid.itens.all[this.name].index && grid.itens.all[key].index >= newPosition) grid.itens.all[key].index++;
                                        });
                                    }

                                    grid.itens.all[this.name].index = newPosition;
                                };

                                this.positionSwapCheck = function() {
                                    let res = null;

                                    activeScreen.objects.forEach(obj => {
                                        if (res !== null) return;

                                        if (obj.type == "block") {
                                            if (obj.state == "hover" && obj.name != this.name) {
                                                res = obj.name;
                                            }
                                        }
                                    });

                                    return res;
                                };

                                this.onclick = function() {
                                    const grid = activeScreen.getObject("grid");
                                    if (grid.itens.all[this.name].index < grid.offset || grid.itens.all[this.name].index > grid.offset + grid.count - 1) return;

                                    if (this.loop_count < 10) this.loop_count++;
                                    else this.loop_count = 2;

                                    activeScreen.getObject(this.parthener).loop_count = this.loop_count;
                                }
                            }

                            const newObj2 = activeScreen.getObject(objName + (num + 2));
                            newObj2.init = newObj.init;

                            newObj.init();
                            newObj2.init();
                            newObj2.parthener = objName + (num + 1);
                            newObj2.loop_count = 2;
                        };

                        this.update = function() {
                            this.sprX = this.x;
                            this.sprY = this.y;
                            this.sprWidth = this.width;
                            this.sprHeight = this.height;

                            if (this.hasBeenDraggable && !this.pressed) {
                                if (hasColision(this, activeScreen.getObject("grid"))) this.placeInGrid();

                                this.resetPosition();
                                this.hasBeenDraggable = false;
                            }
                        };
                    };

                    const left_arrow = this.getObject("left_arrow");
                    left_arrow.init = function() {
                        this.spriteX = 0;
                        this.spriteY = 0;
                        this.spriteWidth = 512;
                        this.spriteHeight = 512;

                        this.x = function() {
                            const grid = activeScreen.getObject("grid");
                            return grid.x() - grid.padding.x() / 2;
                        };

                        this.y = function() {
                            const grid = activeScreen.getObject("grid");
                            return grid.y() + (grid.height() - this.height()) / 2;
                        };

                        this.width = function() {
                            return this.height();
                        };

                        this.height = function() {
                            const grid = activeScreen.getObject("grid");
                            return grid.height() * 0.45;
                        };

                        this.sprX = this.x;
                        this.sprY = this.y;
                        this.sprWidth = this.width;
                        this.sprHeight = this.height;

                        this.onclick = function() {
                            const grid = activeScreen.getObject("grid");
                            grid.offset = Math.max(0, grid.offset - 1);
                        };
                    };

                    const right_arrow = this.getObject("right_arrow");
                    right_arrow.init = function() {
                        this.spriteX = 0;
                        this.spriteY = 0;
                        this.spriteWidth = 512;
                        this.spriteHeight = 512;

                        this.x = function() {
                            const grid = activeScreen.getObject("grid");
                            return grid.x() + grid.width() - grid.padding.x() / 2;
                        };

                        this.y = function() {
                            const grid = activeScreen.getObject("grid");
                            return grid.y() + (grid.height() - this.height()) / 2;
                        };

                        this.width = function() {
                            return this.height();
                        };

                        this.height = function() {
                            const grid = activeScreen.getObject("grid");
                            return grid.height() * 0.45;
                        };

                        this.sprX = this.x;
                        this.sprY = this.y;
                        this.sprWidth = this.width;
                        this.sprHeight = this.height;

                        this.onclick = function() {
                            const grid = activeScreen.getObject("grid");
                            if (grid.itens.count - grid.offset > grid.count) grid.offset++;
                        };
                    };

                    this.objects.forEach(obj => { obj.init() });

                    this.initLevel();
                    this.onload = false;
                }
            },

            initLevel() {
                const grid = this.getObject("grid");

                this.objects.push(
                    new RenderObject("level_frame", "level", null, null, null, null, null, "preto-t40", "branco", 1, null, null, null, null, null, null, 0, false, false, false, true, true, false),
                );

                this.objPosition["level_frame"] = this.objects.length - 1;

                const level_frame = this.getObject("level_frame");
                level_frame.objects_per_line = this.level.columns;
                level_frame.lines = this.level.lines;
                level_frame.init = function() {
                    this.x = grid.x;

                    this.y = function() {
                        return canvas.height * 0.35 - this.height() * 0.5;
                    }

                    this.width = grid.width;

                    this.height = function() {
                        return canvas.height * 0.6;
                    }

                    this.borderRadius = function() { return 0; }
                };

                level_frame.init();

                let blocks = [];

                this.level.paths.forEach((line, index) => {
                    for (let i = 0; i < line.length; i++) {
                        switch (line.charAt(i)) {
                            case "#": {
                                const block = new RenderObject("path_block-", "level_block", null, null, null, null, null, null, null, 0, null, null, null, null, null, null, 0, false, false, false, false, false, false, "./assets/image/blocks_tiles/path_block", null, true)

                                block.init = function() {
                                    this.spriteX = 0;
                                    this.spriteY = 0;
                                    this.spriteWidth = 32;
                                    this.spriteHeight = 32;

                                    this.name += (index * level_frame.objects_per_line + i);
                                    this.line = index;
                                    this.index = i;

                                    this.x = function() {
                                        const frame = activeScreen.getObject("level_frame");
                                        if (frame.objects_per_line % 2 == 0) {
                                            return frame.x() + frame.width() * 0.5 + (this.width() + this.px()) * (this.index - frame.objects_per_line / 2);
                                        }

                                        else {
                                            if (this.index == Math.floor(frame.objects_per_line / 2)) return frame.x() + frame.width() * 0.5 - (this.width() + this.px()) * 0.5;
                                            else return frame.x() + frame.width() * 0.5 + (this.width() + this.px()) * (this.index - frame.objects_per_line / 2);
                                        }
                                    };

                                    this.y = function() {
                                        const frame = activeScreen.getObject("level_frame");
                                        if (frame.lines % 2 == 0) {
                                            return frame.y() + frame.height() * 0.5 + (this.height() + this.py()) * (this.line - frame.lines / 2);
                                        }

                                        else {
                                            if (this.line == Math.floor(frame.lines / 2)) return frame.y() + frame.height() * 0.5 - (this.height() + this.py()) * 0.5;
                                            else return frame.y() + frame.height() * 0.5 + (this.height() + this.py()) * (this.line - frame.lines / 2);
                                        }
                                    }

                                    this.height = function() {
                                        return canvas.height * 0.06;
                                    };

                                    this.width = this.height;

                                    this.sprX = this.x;
                                    this.sprY = this.y;
                                    this.sprWidth = this.width;
                                    this.sprHeight = this.height;

                                    this.px = function() {
                                        return 0;
                                    };

                                    this.py = function() {
                                        return 0;
                                    };

                                    this.borderRadius = function() { return 0; }

                                    let bottom = false, left = false, right = false, top = false;

                                    if (i % level_frame.objects_per_line == 0) left = true;
                                    if (i % level_frame.objects_per_line == level_frame.objects_per_line - 1) right = true;
                                    if (index % level_frame.lines == 0) top = true;
                                    if (index % level_frame.lines == level_frame.lines - 1) bottom = true;

                                    this.imageSrc += (bottom ? "-bottom" : "") + (left ? "-left" : "") + (right ? "-right" : "") + (top ? "-top" : "") + ".png";
                                    this.image.src = this.imageSrc;
                                }

                                const shadow = new RenderObject("path_block-", "level_block-shadow", null, null, null, null, null, "preto-t40", null, 0, null, null, null, null, null, null, 0, false, false, false, true, false, false)
                                shadow.init = function() {
                                    this.name += (index * level_frame.objects_per_line + i) + "-shadow";
                                    this.line = index;
                                    this.index = i;

                                    this.x = function() {
                                        const block = activeScreen.getObject(this.name.split("-shadow")[0]);
                                        return block.x() + block.width() * 0.15;
                                    };

                                    this.y = function() {
                                        const block = activeScreen.getObject(this.name.split("-shadow")[0]);
                                        return block.y() + block.height() * 0.15;
                                    }

                                    this.height = function() {
                                        const block = activeScreen.getObject(this.name.split("-shadow")[0]);
                                        return block.height();
                                    };

                                    this.width = this.height;

                                    this.borderRadius = function() { return 0; }
                                }

                                blocks.push(shadow);
                                blocks.push(block);
                                break;
                            }
                        }
                    }
                });

                blocks.forEach(obj => {
                    obj.init();
                    activeScreen.objects.push(obj);
                    activeScreen.objPosition[obj.name] = activeScreen.objects.length - 1;
                });

                blocks = [];

                this.level.itens.forEach((line, index) => {
                    for (let i = 0; i < line.length; i++) {
                        if (this.level.itens[index].charAt(i) == "#") {
                            const aux = new RenderObject("item-" + (this.level.lines * index + i), "level", null, null, null, null, null, "verde", null, 0, null, null, null, null, null, null, 0, false, false, false, false, false, false, "./assets/image/item.png", null, true);
                            aux.init = function() {
                                this.spriteX = 0;
                                this.spriteY = 0;
                                this.spriteWidth = 24;
                                this.spriteHeight = 24;

                                this.x = function() {
                                    const tmp = activeScreen.getObject("path_block-" + (activeScreen.level.lines * index + i));
                                    return tmp.x() + (tmp.width() - this.width()) / 2;
                                }

                                this.y = function() {
                                    const tmp = activeScreen.getObject("path_block-" + (activeScreen.level.lines * index + i));
                                    return tmp.y() + (tmp.height() - this.height()) / 2;
                                }

                                this.width = function() {
                                    const tmp = activeScreen.getObject("path_block-" + (activeScreen.level.lines * index + i));
                                    return tmp.width() * 0.3;
                                }

                                this.height = function() {
                                    const tmp = activeScreen.getObject("path_block-" + (activeScreen.level.lines * index + i));
                                    return tmp.height() * 0.3;
                                }

                                this.sprX = this.x;
                                this.sprY = this.y;
                                this.sprWidth = this.width;
                                this.sprHeight = this.height;

                                this.borderRadius = function() { return 0; }
                            };

                            blocks.push(aux);
                        }
                    }
                });

                const player = new RenderObject("player", "player", null, null, null, null, null, null, "azul", 1, null, null, null, null, null, null, 0, false, false, false, false, false, false, "./assets/image/player.png", null, true)
                player.init = function() {
                    this.itensCollected = 0;

                    this.resetState = function() {
                        this.stateCord = {
                            x: activeScreen.level.player.x,
                            y: activeScreen.level.player.y,
                            direction: activeScreen.level.player.direction
                        }
                    }

                    this.resetState();

                    this.x = function() {
                        const block = activeScreen.getObject('path_block-2');
                        return block.x() - (block.width() + block.px()) * 2 + (block.width() + block.px()) * (this.stateCord.x - 1) + (block.width() - this.width()) / 2;
                    }

                    this.y = function() {
                        const block = activeScreen.getObject('path_block-2');
                        return block.y() + (block.height() + block.py()) * (this.stateCord.y - 1) + (block.height() - this.height()) / 2;
                    }

                    this.height = function() {
                        const block = activeScreen.getObject('path_block-2');
                        return block.height() * 0.8;
                    }

                    this.width = function() {
                        return this.height() * (this.statesMap[this.animState].width / this.statesMap[this.animState].height);
                    }

                    this.sprX = this.x;
                    this.sprY = this.y;
                    this.sprWidth = this.width;
                    this.sprHeight = this.height;

                    this.borderRadius = function() {
                        return 0;
                    }

                    this.animState = 'idle';
                    this.animTemp = 0;
                    this.currentFrame = 0;
                    this.changeState = {
                        new: 'idle',
                        ready: true
                    };

                    this.statesMap = {
                        idle: {
                            coords: {
                                'N': {
                                    x: 0,
                                    y: 69
                                },

                                'L': {
                                    x: 1,
                                    y: 38
                                },

                                'S': {
                                    x: 1,
                                    y: 6
                                },

                                'O': {
                                    x: 0,
                                    y: 102
                                }
                            },

                            width: 15,
                            height: 22,
                            offset: 81,
                            count: 2,
                            vel: 20,
                        },

                        walk: {
                            coords: {
                                'N': {
                                    x: 0,
                                    y: 69
                                },

                                'L': {
                                    x: 1,
                                    y: 38
                                },

                                'S': {
                                    x: 1,
                                    y: 6
                                },

                                'O': {
                                    x: 0,
                                    y: 102
                                }
                            },

                            width: 15,
                            height: 22,
                            offset: 1,
                            count: 4,
                            vel: 4
                        },

                        die: {

                        }
                    }

                    this.spriteX = 0;
                    this.spriteY = 0;
                    this.spriteWidth = 0;
                    this.spriteHeight = 0;

                    this.itensBuffer = [];

                    this.movement = {
                        has: false,
                        fun: null
                    }

                    this.update = function() {
                        if (activeScreen.passForward == 1) {
                            try {
                                let numX = Math.round(this.stateCord.x);
                                let numY = Math.round(this.stateCord.y);

                                if (this.stateCord.direction == 'L') {
                                    numX -= 0;
                                    numY -= 1;
                                }
                                else if (this.stateCord.direction == 'O') {
                                    numX -= 2;
                                    numY -= 1;
                                }
                                else if (this.stateCord.direction == 'S') {
                                    numX -= 1;
                                    numY -= 0;
                                }
                                else {
                                    numX -= 1;
                                    numY -= 2;
                                }

                                const i = activeScreen.getObject("item-" + (numY * activeScreen.level.columns + numX));
                                let push = true;

                                this.itensBuffer.forEach(element => {
                                    if (element == i.name) push = false;
                                });

                                if (push) {
                                    i.active = false;
                                    this.itensCollected++;
                                    this.itensBuffer.push(i.name);
                                }
                            }

                            catch { }
                        }

                        if (this.changeState.ready) {
                            this.spriteX = this.statesMap[this.changeState.new].coords[this.stateCord.direction].x;
                            this.spriteY = this.statesMap[this.changeState.new].coords[this.stateCord.direction].y;
                            this.spriteWidth = this.statesMap[this.changeState.new].width;
                            this.spriteHeight = this.statesMap[this.changeState.new].height;
                            this.stateCord.x = Math.round(this.stateCord.x);
                            this.stateCord.y = Math.round(this.stateCord.y);
                            this.animState = this.changeState.new;
                            this.changeState.ready = false;
                            this.currentFrame = 0;
                            this.animTemp = 0;
                        }

                        if (this.animTemp == this.statesMap[this.animState].vel) {
                            if (this.currentFrame == this.statesMap[this.animState].count - 1) {
                                this.spriteX = this.statesMap[this.animState].coords[this.stateCord.direction].x;
                                this.currentFrame = 0;
                            }

                            else {
                                this.spriteX += this.spriteWidth + this.statesMap[this.animState].offset;
                                this.currentFrame++;
                            }

                            if (this.movement.has) this.movement.fun();
                            else
                                switch (this.animState) {
                                    case 'idle': {
                                        break;
                                    }

                                    case 'walk': {
                                        switch (this.stateCord.direction) {
                                            case 'N': {
                                                if (this.stateCord.y > 1) {
                                                    if (activeScreen.level.paths[Math.round(this.stateCord.y - 2)].charAt(Math.round(this.stateCord.x - 1)) == '#') {
                                                        this.movement.has = true;
                                                        this.movement.fun = function() {
                                                            const player = activeScreen.getObject('player');
                                                            player.stateCord.y -= 1 / (60 / player.statesMap[player.animState].vel); }
                                                        this.stateCord.y -= 1 / (60 / this.statesMap[this.animState].vel);
                                                    }
                                                }

                                                break;
                                            }

                                            case 'L': {
                                                if (this.stateCord.x < activeScreen.level.columns) {
                                                    if (activeScreen.level.paths[Math.round(this.stateCord.y - 1)].charAt(Math.round(this.stateCord.x)) == '#') {
                                                        this.movement.has = true;
                                                        this.movement.fun = function() {
                                                            const player = activeScreen.getObject('player');
                                                            player.stateCord.x += 1 / (60 / player.statesMap[player.animState].vel);
                                                        }
                                                        this.stateCord.x += 1 / (60 / this.statesMap[this.animState].vel);
                                                    }
                                                }

                                                break;
                                            }
                                            case 'S': {
                                                if (this.stateCord.y < activeScreen.level.lines) {
                                                    if (activeScreen.level.paths[Math.round(this.stateCord.y)].charAt(Math.round(this.stateCord.x - 1)) == '#') {
                                                        this.movement.has = true;
                                                        this.movement.fun = function() {
                                                            const player = activeScreen.getObject('player');
                                                            player.stateCord.y += 1 / (60 / player.statesMap[player.animState].vel);
                                                        }
                                                        this.stateCord.y += 1 / (60 / this.statesMap[this.animState].vel);
                                                    }
                                                }

                                                break;
                                            }
                                            case 'O': {
                                                if (this.stateCord.x > 1) {
                                                    if (activeScreen.level.paths[Math.round(this.stateCord.y - 1)].charAt(Math.round(this.stateCord.x - 2)) == '#') {
                                                        this.movement.has = true;
                                                        this.movement.fun = function() {
                                                            const player = activeScreen.getObject('player');
                                                            player.stateCord.x -= 1 / (60 / player.statesMap[player.animState].vel); }
                                                        this.stateCord.x -= 1 / (60 / this.statesMap[this.animState].vel);
                                                    }
                                                }

                                                break;
                                            }
                                        }

                                        break;
                                    }
                                }

                            this.animTemp = 0;
                        }

                        this.animTemp++;
                    }
                }

                blocks.push(player);

                blocks.forEach(block => {
                    block.init();
                    activeScreen.objects.push(block);
                    activeScreen.objPosition[block.name] = activeScreen.objects.length - 1;
                });
            },

            getObject(name) {
                return this.objects[this.objPosition[name]];
            },

            destroyObject(name) {
                const pos = this.objPosition[name];
                const aux = [];

                this.objects.forEach((obj, index) => {
                    if (index != pos) aux.push(obj);
                });

                this.objects = aux;
                this.objPosition[name] = undefined;

                Object.keys(this.objPosition).forEach(key => {
                    if (this.objPosition[key] > pos) this.objPosition[key]--;
                });
            },

            counter: 0,
            current: 0,
            loop_index: [],
            passForward: 0,

            run_game() {
                const itens = this.getObject("grid").itens;
                const player = this.getObject("player");

                if (this.passForward > 0) this.passForward--;

                if (this.counter % 60 * 5 == 0) {
                    player.movement.has = false;
                    player.changeState = {
                        new: 'idle',
                        ready: true
                    }

                    let obj = undefined, objKey = undefined;

                    Object.keys(itens.all).forEach(key => {
                        const aux = this.getObject(key);

                        if (itens.all[key].index == this.current) {
                            obj = itens.all[key];
                            objKey = key;
                            aux.state = 'hover';
                        }

                        else aux.state = 'normal';
                    });

                    if (!(itens.count > this.current)) this.current++;

                    else {
                        switch (obj.type) {
                            case "forward": {
                                this.passForward = 1;

                                player.changeState = {
                                    new: 'walk',
                                    ready: true
                                }

                                break;
                            }

                            case "turn": {
                                const dir = player.stateCord.direction == 'N' ? 'L' : player.stateCord.direction == 'L' ? 'S' : player.stateCord.direction == 'S' ? 'O' : 'N';
                                player.stateCord.direction = dir;

                                break;
                            }

                            case "loop": {
                                let found = undefined;

                                this.loop_index.forEach(obj => {
                                    if (obj.end == this.current && obj.count > 1) {
                                        found = obj.start;
                                        obj.count--;
                                    }

                                    else if (obj.end == this.current && obj.count <= 1) {
                                        obj.count = this.getObject(objKey).loop_count;
                                        found = this.current;
                                    }
                                });

                                if (found != undefined) this.current = found;

                                else {
                                    const name = this.getObject(objKey).parthener;
                                    let endIndex = undefined;

                                    Object.keys(itens.all).forEach(key => {
                                        if (endIndex) return;
                                        if (key == name) endIndex = itens.all[key].index;
                                    });

                                    this.loop_index.push({ start: this.current, end: endIndex, count: this.getObject(objKey).loop_count });
                                }

                                break;
                            }
                        }

                        this.current++;
                        this.counter = 0;
                    }
                }

                if (itens.count == this.current - 1) {
                    this.game_running = false;
                    this.counter = 0;
                    this.current = 0;
                    this.loop_index = [];
                    player.resetState();
                    player.changeState = {
                        new: 'idle',
                        ready: true
                    }

                    player.itensBuffer.forEach(item => {
                        this.getObject(item).active = true;
                    });

                    player.itensBuffer = [];

                    if (player.itensCollected == activeScreen.level.quantItens) {
                        bd[this.label] = true;
                        changeScreen(screens.final);
                    }

                    player.itensCollected = 0;
                }

                this.counter++;
            }
        },
    },

    final: {
        label: "final",
        objects: [],
        objPosition: {},
        onload: true,

        render() {
            this.update();
            this.background.render();
            this.objects[0].render();
        },

        update() {
            if (this.onload) {
                this.objects.push(
                    new RenderObject("text", "iterface", function() { return canvas.width / 2; }, function() { return canvas.height / 2; }, function() { return 0; }, function() { return 0; }, function() { return 0; }, null, null, null, "Voce ganhou", "branco", textAlign.horizontal.center, textAlign.vertical.center, "center", fonts.title.font, fonts.title.size, false, false, false, false, false, true)
                )
                this.objPosition['text'] = 0;
                this.background.image.src = this.background.imageSrc;
                this.onload = false;
            }
        },

        background: {
            image: new Image(),
            imageSrc: "./assets/image/background.png",
            layerColor: "rgba(0, 0, 0, 0.8)",

            render() {
                ctx.drawImage(this.image, 0, 0, canvas.width, canvas.height);
                ctx.fillStyle = this.layerColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        },
    },

    orientation_error: {
        image: new Image(),
        src: "./assets/image/orientation.png",
        x: null,
        y: null,
        width: null,
        height: null,
        sprX: null,
        sprY: null,
        sprWidth: null,
        sprHeight: null,
        onload: true,

        render() {
            this.update();
            ctx.drawImage(this.image, this.sprX, this.sprY, this.sprWidth, this.sprHeight, this.x(), this.y(), this.width(), this.height())
        },

        update() {
            if (this.onload) {
                this.x = function() {
                    return canvas.width / 2 - this.width() / 2;
                }

                this.y = function() {
                    return canvas.height / 2 - this.height() / 2;
                }

                this.width = function() {
                    return canvas.width * 0.4;
                }

                this.height = function() {
                    return this.width() * (this.sprHeight / this.sprWidth);
                }

                this.sprX = 0;
                this.sprY = 0;
                this.sprWidth = 512;
                this.sprHeight = 512;

                this.image.src = this.src;
                this.onload = false;
            }
        }
    }
}

function changeScreen(newScreen) {
    activeScreen = newScreen;
    activeScreen.onload = true;
}

function checkOrientation() {
    return window.innerWidth > window.innerHeight;
}

function cloneObj(o) {
    const gdcc = "__getDeepCircularCopy__";
    if (o !== Object(o)) {
        return o;
    }

    var set = gdcc in o,
        cache = o[gdcc],
        result;
    if (set && typeof cache == "function") {
        return cache();
    }

    o[gdcc] = function() { return result; };
    if (o instanceof Array) {
        result = [];
        for (var i=0; i<o.length; i++) {
            result[i] = cloneObj(o[i]);
        }
    } else {
        result = {};
        for (var prop in o)
            if (prop != gdcc)
                result[prop] = cloneObj(o[prop]);
            else if (set)
                result[prop] = cloneObj(cache);
    }
    if (set) {
        o[gdcc] = cache;
    } else {
        delete o[gdcc];
    }
    return result;
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (orientationOk) activeScreen.render();
    else screens.orientation_error.render();

    requestAnimationFrame(loop);
}

let orientationOk = true;

window.addEventListener('DOMContentLoaded', () => { orientationOk = checkOrientation(); });
window.addEventListener('orientationchange', (e) => { orientationOk = checkOrientation(); });
window.onresize = function (e) { orientationOk = checkOrientation(); resizeViewPort(e); };
window.onmousedown = function (e) { mouseEvents.mouseDown(e) };
window.onmousemove = function (e) { mouseEvents.mouseMove(e) };
window.onmouseup = function (e) { mouseEvents.mouseUp(e) };
window.addEventListener("touchstart", mouseEvents.touchDown);
window.addEventListener("touchmove", mouseEvents.touchMove);
window.addEventListener("touchend", mouseEvents.touchUp);
window.addEventListener("touchcancel", mouseEvents.touchUp);

changeScreen(screens.menu);
loop();
