'use strict';

function addLayer() {
    let n_layers = parseInt(localStorage.getItem('n_layers'));
    if (isNaN(n_layers)) {
        n_layers = 0;
    }
    n_layers += 1;

    let kernel = parseInt(document.getElementById('textKernelSize').value);
    let stride = parseInt(document.getElementById('textStride').value);
    let padding = parseInt(document.getElementById('textPadding').value);
    let dilation = parseInt(document.getElementById('textDilation').value);
    let layer_info = JSON.stringify({ "kernel": kernel, "stride": stride, 'padding': padding, 'dilation': dilation });
    let layer_name = 'layer' + n_layers;

    localStorage.setItem(layer_name, layer_info);
    localStorage.setItem('n_layers', n_layers);
}

function resetLayer(cmd) {
    if (cmd == 'ALL') {
        localStorage.clear();
    } else if (cmd == 'LAST') {
        let n_layers = parseInt(localStorage.getItem('n_layers'));
        if (!isNaN(n_layers) && n_layers > 0) {
            localStorage.removeItem('layer' + n_layers)
            n_layers -= 1;
            localStorage.setItem('n_layers', n_layers);
            if (n_layers == 0) {
                resetLayer('ALL');
            }
        }
    } else {
        console.warn('Unknown resetLayer command:', cmd)
    }
    updateTable();
}
function clearTable() {
    document.getElementById('layerTable').innerHTML = '';
}
function updateTable() {
    clearTable();
    let n_layers = parseInt(localStorage.getItem('n_layers'));
    if (isNaN(n_layers)) {
        return
    }
    let layer_colors = JSON.parse(localStorage.getItem('layer_colors'));
    let headers = ['Layer #', 'Kernel', 'Stride', 'Padding', 'Dilation', 'In size', 'Out size', 'Receptive Field'];
    let tbl = document.createElement('table');
    tbl.className = 'table table-striped';
    let tbody = document.createElement('tbody');
    for (let layer = 0; layer < n_layers + 1; layer++) {
        if (layer == 0) {
            let thead = document.createElement('thead');
            // thead.className = 'thead-striped';
            let tr = document.createElement('tr');
            headers.forEach(head => {
                let th = document.createElement('th');
                th.appendChild(document.createTextNode(head));
                tr.appendChild(th);
            });
            thead.appendChild(tr);
            tbl.appendChild(thead);
        } else {
            // var tr = tbl.insertRow();
            let net = JSON.parse(localStorage.getItem('layer' + layer));
            let tr = document.createElement('tr');
            tr.style.color = 'white';
            tr.style.backgroundColor = layer_colors[(layer - 1) % layer_colors.length];
            headers.forEach(head => {
                let td = tr.insertCell();
                let text = '';
                switch (head) {
                    case 'Layer #':
                        text = layer;
                        break;
                    case 'Kernel':
                        text = net.kernel;
                        break;
                    case 'Stride':
                        text = net.stride;
                        break;
                    case 'Padding':
                        text = net.padding;
                        break;
                    case 'Dilation':
                        text = net.dilation;
                        break;
                    case 'Receptive Field':
                        text = net.receptive_field;
                        break;
                    case 'In size':
                        text = net.in_size;
                        break;
                    case 'Out size':
                        text = net.out_size;
                        break;

                }
                td.appendChild(document.createTextNode(text));
                tr.append(td);
            });
            tbody.appendChild(tr);
        }
    }
    tbl.appendChild(tbody);
    layerTable.appendChild(tbl);
}

function init() {
    const checkbox = document.getElementById('renderChecked')
    const canvas = document.getElementById('rf-canvas');
    checkbox.addEventListener('change', (event) => {
        if (event.currentTarget.checked) {
            canvas.style.display = 'block';
        } else {
            canvas.style.display = 'none';
        }
    })
}