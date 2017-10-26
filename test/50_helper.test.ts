/// <reference types="node" />
/// <reference types="mocha" />

import * as fs from 'fs';
import * as ffi from 'ffi';
import {basename, normalize} from 'path';
import * as assert from 'power-assert';
import * as Win from '../src/index';
import * as Conf from '../src/lib/conf';
import * as GT from '../src/lib/types';
import * as H from '../src/lib/helper';
import * as W from '../src/lib/windef';
import {windefSet} from '../src/lib/conf';

const filename = basename(__filename);
const dllDir = normalize(__dirname + '/../src/lib/');
const dlls = <string[]> [];

for (let key of fs.readdirSync(dllDir)) {
    const stat = fs.statSync(normalize(dllDir + key));
    if (stat.isDirectory()) {
        dlls.push(key);
    }
}


describe(filename + ' :gen_api_opts() all', () => {
    for (let dll of dlls) {
        const apiName: string = dll.slice(0, 1).toUpperCase() + dll.slice(1).toLowerCase(); // User32, Kernel32, ...
        const module: any = Win[apiName];

        if (module && module.api) {
            const api: GT.Win32FnDef = module.api;
            let n = 0;

            for (let fn in api) {
                if (!{}.hasOwnProperty.call(api, fn)) {
                    continue;
                }
                n += 1;
            }

            it(`Should ${apiName} number of fns equal to the number of fns return by gen_api_opts`, function() {
                const fns: GT.Win32FnDef = H.gen_api_opts(api);
                const keysize = Object.keys(fns).length;

                assert(typeof fns === 'object' && fns, `fns return by gen_api_opts() not object`);
                assert(keysize === n, `the items of fns ${keysize} not equal to the ${n} numbers of item of the Win.${apiName}`);
            });

        }
        else {
            assert(true);
        }

    }
});


describe(filename + ' :gen_api_opts() specify', () => {
    const apiName = 'Kernel32';
    const module: any = Win[apiName];
    const fn = 'GetLastError';
    const fakeFn = fn + Math.random();

    if (module && module.api) {
        const api: GT.Win32FnDef = module.api;

        it(`Should ${apiName} gen_api_opts(["${fn}"]) correctly)`, function() {
            const fns: GT.Win32FnDef = H.gen_api_opts(api, [fn]);

            const keysize = Object.keys(fns).length;

            assert(keysize === 1);
            assert(typeof fns[fn] === 'object' && fns[fn]);
        });

        it(`Should ${apiName} gen_api_opts(["${fakeFn}"]) return none)`, function() {
            const fns: GT.Win32FnDef = H.gen_api_opts(api, [fakeFn]);
            const keysize = Object.keys(fns).length;

            assert(keysize === 0);
            assert(typeof fns[fakeFn] === 'undefined');
        });
    }
    else {
        assert(true);
    }
});

describe(filename + ' :parse_placeholder(ps, settings) ', () => {
    const fn = 'parse_placeholder()';

    it(`Should ${fn} handle value of ps correctly)`, function() {
        let ps: any;
        try {
            H.parse_placeholder(ps);
            assert(false, 'function should throw error with invalid value of ps, but not');
        }
        catch (ex) {
            assert(true);
        }
    });

});

describe(filename + ' :parse_param_placeholder(param, settings?) ', () => {
    const fn = 'parse_param_placeholder';
    const st = <GT.LoadSettings> {};

    test_settings(fn, st);

    delete st._UNICODE;
    test_settings(fn, st);

    delete st._WIN64;
    test_settings(fn, st);

    it(`Should ${fn} handle value of settings correctly)`, function() {
        try {
            let p: any;
            H.parse_param_placeholder(p, st);
            assert(false, 'should throw Error by invalid param, but not');
        }
        catch (ex) {
            assert(true);
        }
    });

    it(`Should ${fn} handle value of param correctly)`, function() {
        try {
            const p: GT.FFIParamMacro = ['invalid_placeholder', 'int64', 'int32'];
            H.parse_param_placeholder(p, st);
            assert(false, 'should throw Error by invalid param, but not');
        }
        catch (ex) {
            assert(true);
        }
    });

    it(`Should ${fn} handle value of settings for arch of nodejs correctly)`, function() {
        const p1 = 'debug_int64';
        const p2 = 'debug_int32';
        const p: GT.FFIParamMacro = [Conf._WIN64_HOLDER, p1, p2];
        const st = {
            _UNICODE: true,
            _WIN64: true,
        };
        const str1 = H.parse_param_placeholder(p, {...st});
        assert(str1 === p1, `result should be "${p1}", got ${str1}`);

        const str2 = H.parse_param_placeholder(p, {...st, _WIN64: false});
        assert(str2 === p2, `result should be "${p2}", got ${str2}`);
    });

    it(`Should ${fn} handle value of settings for ANSI/UNICODE correctly)`, function() {
        const LPTSTR: GT.FFIParamMacro = [Conf._UNICODE_HOLDER, W.LPWSTR, 'uint8*'];
        const st = {
            _UNICODE: true,
            _WIN64: true,
        };
        const str1 = H.parse_param_placeholder(LPTSTR, {...st});
        assert(str1 === LPTSTR[1], `result should be "${LPTSTR[1]}", got ${str1}`);

        const str2 = H.parse_param_placeholder(LPTSTR, {...st, _UNICODE: false});
        assert(str2 === LPTSTR[2], `result should be "${LPTSTR[2]}", got ${str2}`);
    });

});

function test_settings(fn: string, st: GT.LoadSettings): void {
    const str: GT.FFIParam = H.parse_param_placeholder('int32', st);

    it(`Should ${fn} handle value of settings correctly)`, function() {
        assert(typeof st._UNICODE !== 'undefined', 'st._UNICODE undefined');
        assert(typeof st._WIN64 !== 'undefined', 'st._WIN64 undefined');
        assert(st._UNICODE === true, 'st._UNICODE is false');
        assert(st._WIN64 === (process.arch === 'x64' ? true : false), 'st._WIN64 not match process.arch');
    });
}

describe(filename + ' :parse_placeholder_arch(param, _WIN64)', () => {
    const fn = 'parse_placeholder_arch';

    it(`Should ${fn} handle value of param correctly)`, function() {
        let p: any = 'test';
        const res = H[fn](p, true);
        assert(res === p, 'should ${p} got ${res}');
    });

    it(`Should ${fn} handle value of param correctly)`, function() {
        try {
            let p: any;
            H[fn](p, true);
            assert(false, 'should throw Error by invalid param, but not');
        }
        catch (ex) {
            assert(true);
        }
    });

    it(`Should ${fn} handle value of param correctly)`, function() {
        try {
            let p: any = [1, 2];    // should 3 items
            H[fn](p, true);
            assert(false, 'should throw Error by invalid param, but not');
        }
        catch (ex) {
            assert(true);
        }
    });

});

describe(filename + ' :parse_placeholder_unicode(param, _WIN64)', () => {
    const fn = 'parse_placeholder_unicode';

    it(`Should ${fn} handle value of param correctly)`, function() {
        let p: any = 'test';
        const res = H[fn](p, true);
        assert(res === p, 'should ${p} got ${res}');
    });

    it(`Should ${fn} handle value of param correctly)`, function() {
        try {
            let p: any;
            H[fn](p, true);
            assert(false, 'should throw Error by invalid param, but not');
        }
        catch (ex) {
            assert(true);
        }
    });

    it(`Should ${fn} handle value of param correctly)`, function() {
        try {
            let p: any = [1, 2];    // should 3 items
            H[fn](p, true);
            assert(false, 'should throw Error by invalid param, but not');
        }
        catch (ex) {
            assert(true);
        }
    });

});
