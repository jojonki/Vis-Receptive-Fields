'use strict';

function drawRect(stage, x, y, w, h, color, alpha = 1.0, behind = false) {
    let rect = new createjs.Shape();
    rect.graphics.beginFill(color).drawRect(x, y, w, h);
    if (alpha < 1.0) {
        rect.alpha = alpha;
    }
    stage.addChild(rect);
    if (behind) {
        stage.setChildIndex(rect, 0);
    }
}

function drawLine(stage, x1, y1, x2, y2, color, alpha = 1.0) {
    let line = new createjs.Graphics();
    if (alpha < 1.0) {
        line.alpha = alpha;
    }
    line.beginStroke(color);
    line.moveTo(x1, y1);
    line.lineTo(x2, y2);
    line.endStroke();
    let shape = new createjs.Shape(line);
    stage.addChild(shape);
}

function downloadAsPng() {
    document.getElementById("downloader").download = "image.png";
    document.getElementById("downloader").href = document.getElementById("rf-canvas").toDataURL("image/png").replace(/^data:image\/[^;]/, 'data:application/octet-stream');
}