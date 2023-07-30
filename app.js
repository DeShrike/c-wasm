let w = null;
let memory = null;

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

const imports = {
    "sqrt": Math.sqrt,
    "print": print,
};

function run_wasm(obj) {
  w = obj.instance;
  memory = new Uint8Array(w.exports.memory.buffer);

  test1(w);
  test2(w);
  test3(w);
  test4(w);
}

async function load_wasm() {
  fetch("main.wasm").then(response => 
    response.arrayBuffer()
  ).then(bytes => 
    WebAssembly.instantiate(bytes, { "env": make_environment(imports) })
  ).then(run_wasm);
}

function extract_string(address)
{
  let s = "";
  let i = address;
  while (i < memory.length)
  {
    if (memory[i] == 0)
    {
      break;
    }

    s += String.fromCharCode(memory[i]);
    i++;
  }

  return s;
}

function init() {
  load_wasm();
}

function print(value)
{
  const s = extract_string(value);
  console.log("print:", s);
}

function test1(w) {
  element = document.getElementById("test1result");
  let addResult = w.exports.add(42, 666);
  element.innerHTML = addResult;
}

function test2(w) {
  element = document.getElementById("test2result");
  const jsArray = [];
  for (let i = 1; i < 100; i++) {
    jsArray.push(i);
  }

  // Allocate memory for a few 32-bit integers and return get starting address.
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
  let sumResult = w.exports.sum(cArrayPointer, cArray.length);

  // Free the memory.
  w.exports.c_free(cArrayPointer);

  element.innerHTML = sumResult;
}

function test3(w) {
  element = document.getElementById("test3result");
  let sqrtResult = w.exports.square_root(2);
  element.innerHTML = sqrtResult;
}

function test4(w) {
  element = document.getElementById("test4result");
  const msg = "WebAssembly";

  const encoder = new TextEncoder();
  const bytes = encoder.encode(msg);
  const ptr = w.exports.c_malloc(bytes.byteLength);
  const buffer = new Uint8Array(w.exports.memory.buffer, ptr, bytes.byteLength + 1)
  buffer.set(bytes);

  // console.log(buffer, buffer.length);
  let reverseResult = w.exports.reverse(ptr, buffer.length - 1);

  const result = extract_string(reverseResult);

  console.log("test4", reverseResult, typeof(reverseResult));
  element.innerHTML = result;
}
