/*global $, jQuery, console*/
/*jslint browser: true*/
function init() {
    "use strict";
    var vinyl = $("#vinyl"),
        vinylWidth = $('#vinyl-width'),
        add = $('#add'),
        rowPattern = $('#row-pattern'),
        ns = 'http://www.w3.org/2000/svg',
        btnStack = $("#stack"),
        elements = $("#elements"),
        elRowCounter = 0;

    function special(object, spec, func) {
        var prop;
        for (prop in spec) {
            if (spec.hasOwnProperty(prop)) {
                func(object, prop, spec[prop]);
            }
        }
        return object;
    }

    /**
     * byHeight - sort objects by height
     *
     * @param  {object} prev
     * @param  {object} next
     * @return {number}
     */
    function byHeight(prev, next) {
        return prev.height === next.height ?
                0 : prev.height < next.height ?
                1 : -1;
    }

    function rectangle(spec) {
        return special(
            document.createElementNS(ns, 'rect'),
            spec,
            function (o, prop, val) {
                o.setAttributeNS(null, prop, val);
            }
        );
    }



    function randomize(n, m) {
        return Math.floor((Math.random() * (m - n)) + n);
    }

    function randomColor() {
        var max = 0xffffff;
        return '#' + (randomize(0, max)).toString(16);
    }

    function randomData() {
        var data = [], i;
        for (i = 0; i < randomize(4, 14); i += 1) {
            data[i] = {
                id: i,
                width: randomize(5, vinyl.width()),
                height: randomize(5, vinyl.width() + 50)
            };
        }
        // data.forEach(vertically);
        return data.sort(byHeight);
    }

    function putRectangle() {
        var row = rowPattern.clone();
        elements.append(row);
        elRowCounter += 1;
        row.removeAttr("id")
            .addClass("element-row")
            .find(".inner-num").text(elRowCounter);
    }

    function processData() {
        var rows = $(".element-row");
        return rows.map(function (i) {
            return {
                width: +rows.eq(i).find("input[name=width]").val(),
                height: +rows.eq(i).find("input[name=height]").val()
            };
        });
    }

    function vertically(o) {
        var tmp;
        if (o.height < o.width) {
            tmp = o.height;
            o.height = o.width;
            o.width = tmp;
        }
    }

    function turn(o) {
        var result = {
            id: o.id,
            width: o.height,
            height: o.width
        };

        return result;
    }

    function tf(arr) {
        var normal = [], // less container width
            wide = [], // above container width
            result,
            width = vinyl.width();
        arr.forEach(vertically);
        // Make sure that the widest are at the beginning of the array
        arr.sort(byHeight);
        // Filtering objects that longer then container width
        arr.forEach(function (o) {
            if (o.width > width || o.height > width) {
                wide.push(o);
            } else {
                normal.push(o);
            }
        });
        result = wide.map(function (o) {
            return [o];
        }).concat(normal.map(function (o) {
            return [o, turn(o)];
        }));
        return result;
        // wide.forEach(function (o) {
        //     console.log(o);
        // });
        // normal.forEach(function (o){
        //     console.log(o);
        // });
    }

    function display(arr) {
        var color = [
            randomize(0, 255),
            randomize(0, 255),
            randomize(0, 255)
        ];
        arr.forEach(function (item) {
            item.fill = "#" + color.map(function (item) {
                return item <= 15 ?
                        "0" + item.toString(16) :
                        item.toString(16);
            }).join("");
            // console.log(item.fill);
            color.forEach(function (it, i, a) {
                a[i] -= it < 15 ? 0 : 15;
            });
        });
    }

    function combine() {
        var args = [].slice.call(arguments),
            result = [];
        function nested(elements, result) {
            return elements.length ?
                    [].concat.apply([], elements[0].map(
                        function (symbol) {
                            return nested(
                                elements.slice(1),
                                result.concat(symbol)
                            );
                        }
                    ))
                    // : [result];
                    : [result.map(function(object){
                        return special({}, object, function (obj, prop, val) {
                            obj[prop] = val;
                        });
                    })];
        }
        return nested(args, result);
    }

    function stack(array) {
        var box = [],
            totalHeight = 0,
            gap = {
                width: vinyl.width(),
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
            var tmp;
            item.x = gap.x;
            item.y = gap.y;
            gap.width -= item.width;
            gap.x += item.width;
            tmp = item.y + item.height;
            totalHeight = totalHeight > tmp ?
                            totalHeight :
                            tmp;
            // console.log(totalHeight);
            box.push(item);
            chain = {
                head: item,
                prev: chain
            };
        }

        // How to make proper x offset?
        function extend() {
            var chainPointer = chain.prev,
                xTotalOffset = chain.head.width,
                haha = chain.head.height + chain.head.y,
                blah = chainPointer.head.height + chainPointer.head.y;
            // Search x in chain
            while (haha >= blah) {
                xTotalOffset += chainPointer.head.width;
                chainPointer = chainPointer.prev;
                blah = chainPointer.head.height + chainPointer.head.y;
            }
            gap.x -= xTotalOffset;
            gap.width += xTotalOffset;
            gap.y = chain.head.height + chain.head.y;
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
        return [totalHeight, box];
    }

    function stackTest(d) {
        var i,
            test = $('#test'),
            buf = null;

        function rectangleSVGGenerator() {
            // var ud = stack([
            //     {width: 199, height: 275, id: 1},
            //     {width: 71, height: 226, id: 2},
            //     {width: 11, height: 84, id: 3},
            //     {width: 80, height: 50, id: 4},
            //     {width: 256, height: 265, id: 5},
            //     {width: 31, height: 53, id: 6},
            //     {width: 140, height: 214, id: 7}
            //     // {width: 100, height: 77, id: 8}
            // ]);
            var ud = stack(randomData());
            // console.log(ud.length);
            display(ud);
            return $(ud.map(function (r) {
                return rectangle(r);
            }));
        }

        buf = rectangleSVGGenerator(d);
        console.log(buf);
        i = 0;
        test.click(function () {
            if (i <= buf.length) {
                vinyl.append(buf.eq(i));
            } else {
                test.toggle();
            }
            i += 1;
            // buf.each(function(i,e) {
            //     vinyl.append(e);
            // });
        });
        init.rd = randomData;
    }

    function byTotalHeight(prev, next) {
        return prev[0] === next[0] ?
                0 : prev[0] > next[0] ?
                1 : -1;
    }

    function run() {
        var variations = combine.apply(null, tf(randomData())),
            blah = variations.map(stack);

        console.log(variations.length);
        blah.sort(byTotalHeight);
        blah.forEach(function (item) {
            display(item[1]);
            item[1] = $(item[1].map(function (o) {
                return rectangle(o);
            }));
        });
        function show() {
            var id = [],
                i = 0,
                pointer,
                idClsss = "rect-set-";
            function showNext() {
                if (pointer) {
                    /*!!! id index overflow !!!*/
                    $("." + pointer).toggle();
                    pointer = id[id.indexOf(pointer) + 1];

                } else {
                    pointer = id[0];
                }
                $("." + pointer).toggle();
            }
            blah.forEach(function (item) {
                id.push(idClsss + i);
                item[1].attr("class", id[i]);
                i += 1;
                vinyl.append(item[1]);
            });
            $('#test').click(function () {
                showNext();
            });
        }
        show();
    }

    add.bind({
        click: putRectangle
    });
    vinylWidth.bind({
        change: function () {
            var value = vinylWidth.val();
            // Width limit
            if (value > 200) {
                vinylWidth.val(200);
                value = 600;
            } else {
                value *= 3;
            }
            $(".vinyl-background").css("width", value);
            vinyl.get(0).setAttributeNS(null, "width", value);
        }
    });
    btnStack.bind({
        click: function () {
            // stackTest(processData());
            // console.log(combine.apply(null, tf(randomData())).length);
            run();
            btnStack.toggle();
        }
    });
    init.rc = randomColor;
}
