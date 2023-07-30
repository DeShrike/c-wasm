"use strict";

function make_environment(...envs) {
    return new Proxy(envs, {
        get(target, prop, receiver) {
            for (let env of envs) {
                if (env.hasOwnProperty(prop)) {
                    return env[prop];
                }
            }

            return (...args) => { console.error("NOT IMPLEMENTED: " + prop, args); }
        }
    });
}

function print(value)
{
  // const s = extract_string(value);
  // console.log("print:", s);
}

const imports = {
    "sqrt": Math.sqrt,
    "print": print,
};
  
async function run()
{
    const fs = require('fs');
    const buffer = fs.readFileSync('./main.wasm');
    const lib = await WebAssembly
        .instantiate(new Uint8Array(buffer), { "env": make_environment(imports) })
        .then(res => res.instance.exports);

    const numbers = [];
    for (let i = 1; i < 100; i++) {
        numbers.push(i);
    }

    const cPtr = lib.c_malloc(numbers.length * 4);

    // Turn that sequence of 32-bit integers into a Uint32Array, starting at that address.
    const cnumbers = new Uint32Array(
      lib.memory.buffer,
      cPtr,
      numbers.length
    );
  
    // Copy the values from JS to C.
    cnumbers.set(numbers);

    console.log("");
    console.log("Calling WebAssembly functions:");
    console.log("add(1234, 3456)", lib.add(1234, 3456));
    console.log("square_root(42)", lib.square_root(42));
    console.log("sum([1, 2, ... 100])", lib.sum(cPtr, numbers.length));
    console.log("");
}

run();
