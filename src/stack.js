/*globals console*/
function stack(array) {
    'use strict';
    var box = [],
        gap = {
            width: 152,
            x: 0,
            y: 0
        },
        chain = {
            head: {},
            prev: {}
        },
        queue = array,
        i;
    function compare(item) {
        return gap.width > item.width;
    }
    function insert(item) {
        item.x = gap.x;
        item.y = gap.y;
        gap.width -= item.width;
        gap.x += item.width;
        box.push(item);
        chain = {
            head: item,
            prev: chain
        };
    }
    // How to make proper x offset?
    function extend() {
        var chainPointer = chain.prev,
            xTotalOffset = chain.head.width;
        // Search x in chain.
        while (chain.head.height >= chainPointer.head.height) {
            xTotalOffset += chainPointer.head.width;
            chainPointer = chainPointer.prev;
        }
        gap.x -= xTotalOffset;
        gap.width += xTotalOffset;
        gap.y = chain.head.height;
        chain = chainPointer;
    }
    gap.compare = compare;
    gap.extend = extend;
    gap.insert = insert;
    while (queue.length) {
        for (i = 0; i < queue.length; i += 1) {
            if (gap.compare(queue[i])) {
                gap.insert(queue[i]);
                queue.splice(i, 1);
                i -= 1;
            }
        }
        gap.extend();
    }
    return box;
}
function stackTest() {
    'use strict';
    var i,
        j,
        result;
    function randomize(n, m) {
        return Math.floor((Math.random() * (m - n)) + n);
    }
    function randomData() {
        var data = [];
        for (i = 0; i < randomize(4, 16); i += 1) {
            data[i] = {
                width: randomize(5, 145),
                height: randomize(5, 145)
            };
        }
        return data;
    }
    for (j = 0; j < 99; j += 1) {
        try {
            result = stack(randomData());
            console.log(result);
        } catch (e) {
            console.log(e);
        }
    }
}
