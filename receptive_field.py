"""
- Reference
    A guide to receptive field arithmetic for Convolutional Neural Networks., Dang Ha The Hien.
    https://medium.com/mlreview/a-guide-to-receptive-field-arithmetic-for-convolutional-neural-networks-e0f514068807

% python receptive_field.py
input image:
        n_in=284
        jump=1
        receptive size=1
        start=0.5
conv1:
        n_in=69
        jump=4
        receptive size=11
        start=6.5
pool1:
        n_in=34
        jump=8
        receptive size=19
        start=10.5
conv2:
        n_in=34
        jump=8
        receptive size=51
        start=10.5
pool2:
        n_in=16
        jump=16
        receptive size=67
        start=26.5
conv3:
        n_in=16
        jump=16
        receptive size=99
        start=26.5
conv4:
        n_in=16
        jump=16
        receptive size=131
        start=26.5
conv5:
        n_in=16
        jump=16
        receptive size=163
        start=26.5
pool5:
        n_in=7
        jump=32
        receptive size=195
        start=58.5
fc6-conv:
        n_in=2
        jump=32
        receptive size=355
        start=138.5
fc7-conv:
        n_in=2
        jump=32
        receptive size=355
        start=138.5
"""

import math


class Variable:
    def __init__(self, n_in, j_in, r_in, start_in):
        self.n_in = n_in
        self.j_in = j_in
        self.r_in = r_in
        self.start_in = start_in

    def print(self):
        print(f'\tn_in={self.n_in}'
              f'\n\tjump={self.j_in}'
              f'\n\treceptive size={self.r_in}'
              f'\n\tstart={self.start_in}')


class ConvLayer:
    def __init__(self, name, kernel_size, stride, padding):
        self.name = name
        self.kernel_size = kernel_size
        self.stride = stride
        self.padding = padding

    def forward(self, x):
        k = self.kernel_size
        s = self.stride
        p = self.padding

        n_in = x.n_in
        j_in = x.j_in
        r_in = x.r_in
        start_in = x.start_in

        n_out = math.floor((n_in - k + 2 * p) / s) + 1

        # calculate actual pad length (sum of both side paddings)
        total_pad = (k + (n_out - 1) * s) - n_in
        # if pad is odd, pad_L is truncated by floor.
        # e.g.) toal_pad = 3, pad_L=1, pad_R=2
        pad_L = math.floor(total_pad / 2)
        pad_R = math.ceil(total_pad / 2)
        if pad_L == pad_R:
            assert p == pad_L

        j_out = j_in * s
        r_out = r_in + (k - 1) * j_in
        start_out = start_in + ((k - 1) / 2 - pad_L) * j_in
        return Variable(n_out, j_out, r_out, start_out)


AlexNet = [
    ConvLayer('conv1', 11, 4, 0),
    ConvLayer('pool1', 3, 2, 0),
    ConvLayer('conv2', 5, 1, 2),
    ConvLayer('pool2', 3, 2, 0),
    ConvLayer('conv3', 3, 1, 1),
    ConvLayer('conv4', 3, 1, 1),
    ConvLayer('conv5', 3, 1, 1),
    ConvLayer('pool5', 3, 2, 0),
    ConvLayer('fc6-conv', 6, 1, 0),
    ConvLayer('fc7-conv', 1, 1, 0),
]
N_IN = 284
# AlexNet = [ConvLayer('my', 2, 2, 1)]
# N_IN = 5


def printLayer(layer, layer_name):
    print(layer_name + ":")
    layer.print()


def main():
    x = Variable(n_in=N_IN, j_in=1, r_in=1, start_in=0.5)
    printLayer(x, "input image")
    for net in AlexNet:
        x = net.forward(x)
        printLayer(x, net.name)


if __name__ == '__main__':
    main()
