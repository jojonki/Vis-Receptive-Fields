'use strict';

class Variable {
    constructor({ n_in, j_in, r_in, start_in }) {
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

        this.receptive_field = null;
        this.in_size = null;
        this.out_size = null;
    }

    forward(x) {
        let k = this.kernel_size;
        let s = this.stride;
        let p = this.padding;
        let d = this.dilation;

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
            console.assert(p == pad_L, 'padding and pad_L are different')
        }

        let j_out = j_in * s;
        // let r_out = r_in + (k - 1) * j_in;
        let r_out = r_in + (k - 1) * j_in * d;
        let start_out = start_in + ((k - 1) / 2 - pad_L) * j_in;
        return new Variable({ 'n_in': n_out, 'j_in': j_out, 'r_in': r_out, 'start_in': start_out });
    }
}


function update() {
    // parameters
    let font = '18px Arial';
    let in_color = "#3020ff";
    let pad_color = "Gray";
    let line_color = "Black";
    let layer_colors = ['#4285F4', '#DB4437', '#F4B400', '#0F9D58'];
    let rep_colors = ["#97befc", "#e38e86", "#fae098", "#5ecc96"];

    localStorage.setItem('layer_colors', JSON.stringify(layer_colors));
    let w = 18;
    let h = w;
    let hw = w / 2;
    let L = parseInt(document.getElementById("textInputSize").value);
    let offset = 2;
    let stride_width = w + offset;
    let stride_height = 80;
    const most_left_x = 220;
    const text_offset_x = 10;

    // initialize
    let stage = new createjs.Stage("rf-canvas");

    let MyNet = [];
    let n_layers = localStorage.getItem('n_layers');
    if (n_layers == null) {
        stage.removeAllChildren();
        stage.update();
        return;
    }

    for (let i = 1; i <= n_layers; i++) {
        let layer_name = 'layer' + i;
        let layer_info = JSON.parse(localStorage.getItem(layer_name));
        MyNet.push(
            new ConvLayer(layer_name, layer_info.kernel, layer_info.stride, layer_info.padding, layer_info.dilation)
        )
    }

    // draw input
    let data = new Variable({ 'n_in': L, 'j_in': 1, 'r_in': 1, 'start_in': 0.5 });
    let y = stride_height;
    let coming_padding = MyNet[0].padding;
    for (let i = 0; i < L; i++) {
        let x = most_left_x + stride_width * i;
        drawRect(stage, x, y, w, h, in_color);
    }
    let begin_offset_list = [most_left_x];
    let end_offset_list = [most_left_x + stride_width * (L - 1)];

    // draw layers
    let rf_list = [];
    let rep_origin_x = null;
    let left_offset = 0;
    for (let layer = 0; layer < MyNet.length; layer++) {
        let net = MyNet[layer];
        let kernel = net.kernel_size;
        let stride = net.stride;
        let padding = net.padding;
        let dilation = net.dilation;
        let color = layer_colors[layer % layer_colors.length];
        let y = stride_height * (layer + 2);
        let prev_stride_width = stride_width;

        let prev_L = L;
        L = Math.floor((L + 2 * padding - (dilation * (kernel - 1) + 1)) / stride) + 1;
        if (L <= 0) {
            alert('No more layers can be added.');
            return;
        }
        data = net.forward(data);
        rf_list.push(data.r_in);
        net.receptive_field = data.r_in
        net.in_size = prev_L;
        net.out_size = L;

        left_offset = (data.r_in - 1) * (w + offset) / 2;
        stride_width = stride * stride_width;

        // draw padding into previous layer
        for (let i = 0; i < padding; i++) {
            // left padding
            let prev_y = stride_height * (layer + 1);
            let prev_x = begin_offset_list[layer] - prev_stride_width * (i + 1);
            drawRect(stage, prev_x, prev_y, w, h, pad_color);
            // right padding
            prev_x = end_offset_list[layer] + prev_stride_width * (i + 1);
            drawRect(stage, prev_x, prev_y, w, h, pad_color);
        }

        let data_offset_x = begin_offset_list[layer] - prev_stride_width * padding;
        for (let i = 0; i < L; i++) {
            let x = data_offset_x + stride_width * i + ((kernel - 1) * prev_stride_width) * dilation / 2;
            if (i == 0) {
                begin_offset_list.push(x);
            } else if (i == L - 1) {
                end_offset_list.push(x);
            }
            let is_focus_ndoe = (layer == n_layers - 1 && i == Math.floor((L - 1) / 2)) ? true : false;
            if (is_focus_ndoe) { // base data for RF
                rep_origin_x = x;
                drawRect(stage, x, y, w, h, "red");
            }
            else {
                drawRect(stage, x, y, w, h, color);
            }

            // draw kernel lines
            let prev_y = y - stride_height + w;
            for (let j = 0; j < kernel; j++) {
                let from_x = (x + hw) - prev_stride_width * (kernel - 1) * dilation / 2;
                drawLine(stage, x + hw, y, from_x + (prev_stride_width) * dilation * j, prev_y, line_color);
            }
        }
    }

    // draw receptive field
    for (let layer = 0; layer < rf_list.length; layer++) {
        let rep_field = rf_list[layer];
        let rep_width = rep_field * (w + offset);
        let rep_x = rep_origin_x - (w + offset) * (rf_list[layer] - 1) / 2 - offset / 2;
        let rep_y = stride_height - hw;
        let color = layer_colors[layer % layer_colors.length];
        drawRect(stage, rep_x, rep_y, rep_width, h + hw + stride_height * (layer + 1), rep_colors[layer % rep_colors.length], 1, true);

        let layer_name = 'layer' + (layer + 1);
        let layer_info = JSON.parse(localStorage.getItem(layer_name));
        layer_info['receptive_field'] = MyNet[layer].receptive_field;
        layer_info['in_size'] = MyNet[layer].in_size;
        layer_info['out_size'] = MyNet[layer].out_size;
        localStorage.setItem(layer_name, JSON.stringify(layer_info));
    }

    stage.update();
}