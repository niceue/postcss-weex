var postcss = require('postcss');
var utils = require('../utils');

module.exports = function(opts) {
    var absLenUnit = new RegExp('\\b(\\d+(\\.\\d+)?)' + opts.absLenUnit + '\\b', 'g');
    var relLenUnit = new RegExp('\\b(\\d+(\\.\\d+)?)' + opts.relLenUnit + '\\b', 'g');

    return function(decl) {
        // convert relative length based 75px
        decl.value = decl.value.replace(relLenUnit, function($0, $1) {
            return $1 == 0 ? $1 : ($1 * 75 / opts.remUnit) + 'px';
        });

        // convert absolute length unit to wx
        decl.value = decl.value.replace(absLenUnit, function($0, $1) {
            return $1 == 0 ? $1 : ($1 / opts.baseDpr) + 'wx';
        });
        // remove !important since weex not support
        decl.important = false;

        var props;

        var prop = decl.prop.toLowerCase();
        var values = postcss.list.space(decl.value);

        switch (prop) {
            case 'background':
                if (utils.isColor(decl.value)) {
                    decl.replaceWith({
                        prop: prop + '-color',
                        value: decl.value
                    });
                } else if (utils.isLinearGradient(decl.value)) {
                    decl.replaceWith({
                        prop: prop + '-image',
                        value: decl.value
                    });
                }

                break;
            case 'margin':
            case 'padding':
                copyValues(values);

                props = createProps(prop);
                props.forEach(function(prop, i) {
                    decl.cloneBefore({
                        prop:  prop,
                        value: values[i]
                    });
                });

                decl.remove();

                break;
            case 'border-radius':
                if (utils.isLength(decl.value)) {
                    props = createProps(prop, 1);
                    props.forEach(function(prop) {
                        decl.cloneBefore({
                            prop:  prop,
                            value: decl.value
                        });
                    });

                    decl.remove();
                }

                break;
            case 'border':
            case 'border-left':
            case 'border-top':
            case 'border-right':
            case 'border-bottom':
                if (prop === 'border') {
                    props = createProps(prop)
                } else {
                    props = [prop];
                }

                props.forEach(function(prop) {
                    values.forEach(function(value) {
                        if (utils.isLength(value)) {
                            decl.cloneBefore({
                                prop:  prop + '-width',
                                value: value
                            });
                        } else if (utils.isBorderStyle(value)) {
                            decl.cloneBefore({
                                prop:  prop + '-style',
                                value: value
                            });
                        } else if (utils.isColor(value)) {
                            decl.cloneBefore({
                                prop:  prop + '-color',
                                value: value
                            });
                        }
                    });
                });

                decl.remove();

                break;
            case 'font':
                values.forEach(function(value) {
                    if (utils.isFontSize(value)) {
                        decl.cloneBefore({
                            prop:  prop + '-size',
                            value: value
                        });
                    } else if (utils.isFontWeight(value)) {
                        decl.cloneBefore({
                            prop:  prop + '-weight',
                            value: value
                        });
                    } else if (utils.isFontStyle(value)) {
                        decl.cloneBefore({
                            prop:  prop + '-style',
                            value: value
                        });
                    } else {
                        decl.cloneBefore({
                            prop:  prop + '-family',
                            value: value
                        });
                    }
                });

                decl.remove();

                break;
        }
    };
};

function createProps(base, type) {
    type = type || 0;

    var props;

    if (type === 0/*边*/) {
        props = [
            base + '-top',
            base + '-right',
            base + '-bottom',
            base + '-left'
        ];
    } else if (type === 1/*角*/) {
        props = [
            'border-top-left-radius',
            'border-top-right-radius',
            'border-bottom-right-radius',
            'border-bottom-left-radius'
        ];
    }

    return props;
}

function copyValues(values) {
    if (!values[1]) values[1] = values[0];
    if (!values[2]) values[2] = values[0];
    if (!values[3]) values[3] = values[1];
}