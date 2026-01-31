const { register } = require('esbuild-register/dist/node');
register({
    target: 'node16'
});
require('./prisma/seed.ts');