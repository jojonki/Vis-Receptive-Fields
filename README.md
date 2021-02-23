# Receptive-Field

```
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
```
## Reference
- [A guide to receptive field arithmetic for Convolutional Neural Networks., Dang Ha The Hien.](https://medium.com/mlreview/a-guide-to-receptive-field-arithmetic-for-convolutional-neural-networks-e0f514068807)
