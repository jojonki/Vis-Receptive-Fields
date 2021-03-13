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

function drawLine(stage, x1, y1, x2, y2, color) {
    let line = new createjs.Graphics();
    line.beginStroke(color);
    line.moveTo(x1, y1);
    line.lineTo(x2, y2);
    line.endStroke();
    let shape = new createjs.Shape(line);
    stage.addChild(shape);
}

function init() {
    var stage = new createjs.Stage("demoCanvas");
    let in_color = "#4285F4";
    let line_color = "Black";
    let layer_colors = ["#FBBC05", "#34A853", "#EA4335"];
    let w = 30;
    let hw = w / 2;
    let L = 40;
    let offset = 4;
    let stride_width = w + offset;
    let stride_height = 120;
    // draw input data
    for (let i = 0; i < L; i++) {
        // var circle = new createjs.Shape();
        let x = stride_width * (i + 1);
        let y = stride_height;
        // circle.graphics.beginFill(in_color).drawRect(x, y, w, w);
        drawRect(stage, x, y, w, w, in_color);
        // stage.addChild(circle);
    }

    let kernels = [3, 3, 3];
    let strides = [2, 2, 2];
    let dummy = [3, 7, 15];

    // let pads = [2, 2];
    let n_layers = kernels.length;
    for (let layer = 0; layer < n_layers; layer++) {
        let kernel = kernels[layer];
        let stride = strides[layer];

        // draw layer
        let y = 80 * layer;
        L = Math.floor((L - kernel) / stride) + 1;
        console.log(L);
        let prev_stride_w = stride_width;
        stride_width = stride * stride_width;
        for (let i = 0; i < L; i++) {
            let x = stride_width * (i + 1);
            let y = stride_height * (layer + 2)
            console.log(layer, i, x, y);
            drawRect(stage, x, y, w, w, layer_colors[layer]);

            let prev_y = y - stride_height + w;
            for (let j = 0; j < kernel; j++) {
                drawLine(stage, x + hw, y, x - prev_stride_w + prev_stride_w * j + hw, prev_y, line_color);
            }
        }
    }
    // console.log(x, y);
    let x = 544;
    let y = 480;
    // draw receptive field
    for (let layer = 0; layer < n_layers; layer++) {
        let rep_field = dummy[layer];
        let rep_width = rep_field * (w + offset);

        let rep_x = x - (rep_field - 1) * (w + offset) / 2 - offset / 2;
        let rep_y = stride_height - (hw * (layer + 1)) / 2;
        drawRect(stage, rep_x, rep_y, rep_width, w + hw * (layer + 1), layer_colors[layer], alpha = 0.8, behind = true);
    }


    stage.update();
}