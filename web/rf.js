
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

class Variable {
    constructor(n_in, j_in, r_in, start_in) {
        this.n_in = n_in
        this.j_in = j_in
        this.r_in = r_in
        this.start_in = start_in
    }

    print() {
        //         console.log.(f'\tn_in={this.n_in}'
        // f'\n\tjump={this.j_in}'
        // f'\n\treceptive size={this.r_in}'
        // f'\n\tstart={this.start_in}')
    }
}

class ConvLayer {
    constructor(name, kernel_size, stride, padding) {
        this.name = name;
        this.kernel_size = kernel_size;
        this.stride = stride;
        this.padding = padding;
    }

    forward(x) {
        let k = this.kernel_size;
        let s = this.stride;
        let p = this.padding;

        let n_in = x.n_in;
        let j_in = x.j_in;
        let r_in = x.r_in;
        let start_in = x.start_in;

        let n_out = Math.floor((n_in - k + 2 * p) / s) + 1;

        // # calculate actual pad length(sum of both side paddings)
        let total_pad = (k + (n_out - 1) * s) - n_in;
        // # if pad is odd, pad_L is truncated by floor.
        // # e.g.) toal_pad = 3, pad_L = 1, pad_R = 2
        let pad_L = Math.floor(total_pad / 2);
        let pad_R = Math.ceil(total_pad / 2);
        if (pad_L == pad_R) {
            // assert p == pad_L
        }

        let j_out = j_in * s;
        let r_out = r_in + (k - 1) * j_in;
        let start_out = start_in + ((k - 1) / 2 - pad_L) * j_in;
        return new Variable(n_out, j_out, r_out, start_out)
    }
}


function init() {
    var stage = new createjs.Stage("demoCanvas");
    let in_color = "#4285F4";
    let line_color = "Black";
    // let layer_colors = ["#FBBC05", "#34A853", "#EA4335"];
    // https://coolors.co/palettes/trending
    let layer_colors = ["#ef476f", "#ffd166", "#06d6a0", "#118ab2", "#073b4c"];
    let w = 30;
    let hw = w / 2;
    let L = 50;
    let offset = 4;
    let stride_width = w + offset;
    let stride_height = 120;

    let data = new Variable(n_in = L, j_in = 1, r_in = 1, start_in = 0.5);
    // draw input data
    for (let i = 0; i < data.n_in; i++) {
        // var circle = new createjs.Shape();
        let x = stride_width * (i + 1);
        let y = stride_height;
        // circle.graphics.beginFill(in_color).drawRect(x, y, w, w);
        drawRect(stage, x, y, w, w, in_color);
        // stage.addChild(circle);
    }

    MyNet = [
        new ConvLayer('conv1', 3, 2, 1),
        new ConvLayer('conv2', 3, 2, 1),
        new ConvLayer('conv3', 3, 2, 1),
        // new ConvLayer('conv3', 3, 2, 1),
    ];
    rep_fields = []

    let n_layers = MyNet.length;
    let rep_origin_x = null;
    for (let layer = 0; layer < n_layers; layer++) {
        net = MyNet[layer];
        data = net.forward(data);
        rep_fields.push(data.r_in);

        let kernel = net.kernel_size;
        let stride = net.stride;

        // draw layer
        let color = layer_colors[layer % layer_colors.length];
        let y = 80 * layer;
        L = Math.floor((L - kernel) / stride) + 1;
        let prev_stride_w = stride_width;
        stride_width = stride * stride_width;
        for (let i = 0; i < L; i++) {
            let x = stride_width * (i + 1);
            let y = stride_height * (layer + 2)
            // console.log(layer, i, x, y);
            drawRect(stage, x, y, w, w, color);
            if (layer == n_layers - 1 && i == Math.floor((L - 1) / 2)) {
                rep_origin_x = x;
            }

            let prev_y = y - stride_height + w;
            for (let j = 0; j < kernel; j++) {
                drawLine(stage, x + hw, y, x - prev_stride_w + prev_stride_w * j + hw, prev_y, line_color);
            }
        }
    }

    // draw receptive field
    for (let layer = 0; layer < n_layers; layer++) {
        let rep_field = rep_fields[layer];
        let rep_width = rep_field * (w + offset);
        let rep_x = rep_origin_x - (rep_field - 1) * (w + offset) / 2 - offset / 2;
        let rep_y = stride_height - (hw * (layer + 1)) / 2;
        let color = layer_colors[layer % layer_colors.length];
        drawRect(stage, rep_x, rep_y, rep_width, w + hw * (layer + 1), color, alpha = 0.8, behind = true);
    }


    stage.update();
}