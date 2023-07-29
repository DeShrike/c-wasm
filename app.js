let addfield;
let sumfield;
let sqrtfield;

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

const libm = {
    "sqrt": Math.sqrt,
    "console": console.log,
};

function run_wasm(obj) {
  const w = obj.instance;

  let addresult = w.exports.add(42, 666);
  addfield.innerHTML = addresult;

  const jsArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // Allocate memory for a few 32-bit integers
  // and return get starting address.
  const cArrayPointer = w.exports.c_malloc(jsArray.length * 4);

  // Turn that sequence of 32-bit integers into a Uint32Array, starting at that address.
  const cArray = new Uint32Array(
    w.exports.memory.buffer,
    cArrayPointer,
    jsArray.length
  );

  // Copy the values from JS to C.
  cArray.set(jsArray);

  // Run the function, passing the starting address and length.
  let sumresult = w.exports.sum(cArrayPointer, cArray.length);
  sumfield.innerHTML = sumresult;

  let sqrtresult = w.exports.square_root(2);
  sqrtfield.innerHTML = sqrtresult;
}

async function init_wasm() {
  fetch("main.wasm").then(response => 
    response.arrayBuffer()
  ).then(bytes => 
    WebAssembly.instantiate(bytes, { "env": make_environment(libm) })
  ).then(run_wasm);
}

function init() {
  addfield = document.getElementById("addfield");
  sumfield = document.getElementById("sumfield");
  sqrtfield = document.getElementById("sqrtfield");

  init_wasm();
}
