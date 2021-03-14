
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
}

class ConvLayer {
    constructor(name, kernel_size, stride, padding, dilation) {
        this.name = name;
        this.kernel_size = kernel_size;
        this.stride = stride;
        this.padding = padding;
        this.dilation = dilation;
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
    let stage = new createjs.Stage("rf-canvas");
    let font = '20px Arial';
    MyNet = [];
    let n_layers = localStorage.getItem('n_layers');
    console.log(n_layers);
    if (n_layers == null) {
        stage.removeAllChildren();
        stage.update();
        return;
    }

    for (let i = 1; i <= n_layers; i++) {
        let layer_name = 'layer' + i;
        let layer_info = JSON.parse(localStorage.getItem(layer_name));
        console.log(layer_info);
        MyNet.push(
            new ConvLayer(layer_name, layer_info.kernel, layer_info.stride, layer_info.padding, layer_info.dilation)
        )
        console.log(layer_name, layer_info.kernel, layer_info.stride, layer_info.padding, layer_info.dilation);
    }



    let in_color = "#4285F4";
    let line_color = "Black";
    // let layer_colors = ["#FBBC05", "#34A853", "#EA4335"];
    // https://coolors.co/palettes/trending
    let layer_colors = ["#ef476f", "#ffd166", "#06d6a0", "#118ab2", "#073b4c"];
    let w = 18;
    let h = w;
    let hw = w / 2;
    // let L = 80;
    let L = parseInt(document.getElementById("textInputSize").value);
    let offset = 2;
    let stride_width = w + offset;
    let stride_height = 80;
    let most_left_x = 150;
    let text_offset_x = 40;

    let data = new Variable(n_in = L, j_in = 1, r_in = 1, start_in = 0.5);
    let y = stride_height;
    // draw input data
    for (let i = 0; i < data.n_in; i++) {
        // var circle = new createjs.Shape();
        let x = most_left_x + stride_width * i;
        // circle.graphics.beginFill(in_color).drawRect(x, y, w, w);
        drawRect(stage, x, y, w, h, in_color);
        // stage.addChild(circle);
    }
    // text
    var text = new createjs.Text('Input\nL=' + L, font, in_color);
    text.x = text_offset_x;
    text.y += y;
    stage.addChild(text);



    let rf_list = []

    let rep_origin_x = null;
    let left_offset = 0;
    for (let layer = 0; layer < MyNet.length; layer++) {
        net = MyNet[layer];
        let kernel = net.kernel_size;
        let stride = net.stride;
        let color = layer_colors[layer % layer_colors.length];
        let y = stride_height * (layer + 2)
        L = Math.floor((L - kernel) / stride) + 1;

        // draw layer
        console.log('L=' + L);
        if (L <= 0) {
            alert('No more layers can be added.');
            return;
        }
        data = net.forward(data);
        rf_list.push(data.r_in);

        // text
        var layer_info = 'Layer ' + (layer + 1) + "\nK=" + kernel + ", S=" + stride + "\nRF=" + rf_list[rf_list.length - 1]
            + '\nL=' + L;
        var text = new createjs.Text(layer_info, font, color);
        text.x = text_offset_x;
        text.y += y - 30;
        stage.addChild(text);

        let prev_stride_width = stride_width;
        stride_width = stride * stride_width;
        left_offset = (data.r_in - 1) * (w + offset) / 2;
        for (let i = 0; i < L; i++) {
            // console.log(left_offset);
            let x = most_left_x + left_offset + stride_width * i;
            // console.log(layer, i, x, y);
            let is_focus_ndoe = (layer == n_layers - 1 && i == Math.floor((L - 1) / 2)) ? true : false;
            if (is_focus_ndoe) { // base data for RF
                rep_origin_x = x;
                drawRect(stage, x, y, w, h, 'Green');
            } else {
                drawRect(stage, x, y, w, h, color);
            }

            // draw lines
            let prev_y = y - stride_height + w;
            for (let j = 0; j < kernel; j++) {
                let from_x = (x + hw) - prev_stride_width * (kernel - 1) / 2;
                if (is_focus_ndoe) { // base data for RF
                    drawLine(stage, x + hw, y, from_x + (prev_stride_width) * j, prev_y, 'Green');
                } else {
                    drawLine(stage, x + hw, y, from_x + (prev_stride_width) * j, prev_y, line_color);
                }
            }
        }
    }

    // draw receptive field
    for (let layer = 0; layer < rf_list.length; layer++) {
        let rep_field = rf_list[layer];
        let rep_width = rep_field * (w + offset);
        // let rep_x = rep_origin_x - (rep_field - 1) * (w + offset) / 2 - offset / 2;
        // let rep_x = rep_origin_x - (w + offset) * (MyNet[layer].stride - 1) - offset / 2;
        let rep_x = rep_origin_x - (w + offset) * (rf_list[layer] - 1) / 2 - offset / 2;
        if (rep_x < most_left_x) {
            rep_x = most_left_x;
        }
        let rep_y = stride_height - (hw * (layer + 1)) / 2;
        let color = layer_colors[layer % layer_colors.length];
        drawRect(stage, rep_x, rep_y, rep_width, w + hw * (layer + 1), color, alpha = 0.7, behind = true);
    }

    stage.update();
}