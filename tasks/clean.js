'use strict';

const del = require('del');

const isDevelop = !process.env.NODE_ENV || process.env.NODE_ENV == 'develop';

module.exports = function (options) {
    return function () {
        return del([options.path.build.dir, 'tmp']).then(paths => {
            console.log('Рабочая директория очищена\n Удалены:\n', paths.join('\n'));
        });
    };
};