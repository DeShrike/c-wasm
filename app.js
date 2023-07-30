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

  let m = new Mandel(w);

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

class Mandel
{
    constructor(w) {
        this.buttonStartC = document.getElementById("btnStartC");
        this.buttonStopC = document.getElementById("btnStopC");

        this.canvasC = document.getElementById("canvasC");
        this.w = w;

        this.ctxC = this.canvasC.getContext("2d");

        this.canvasWidth = this.canvasC.width;
        this.canvasHeight = this.canvasC.height;

        this.boundHandleClickStartC = this.startC.bind(this);
        this.boundHandleClickStopC = this.stopC.bind(this);

        this.boundLoopC = this.loopC.bind(this);

        this.buttonStartC.addEventListener("click", this.boundHandleClickStartC);
        this.buttonStopC.addEventListener("click", this.boundHandleClickStopC);

        this.buttonStopC.style.display = "none";

        this.runC = false;

        this.startC();
    }

    startC()
    {
        this.buttonStartC.style.display = "none";
        this.buttonStopC.style.display = "block";
        this.initMandel();

        this.ctxC.fillStyle = "rgba(10,10,10,255)";
        this.ctxC.fillRect( 0, 0, this.canvasWidth, this.canvasHeight );

        this.runC = true;
        requestAnimationFrame(this.boundLoopC);
    }

    stopC()
    {
        this.buttonStartC.style.display = "block";
        this.buttonStopC.style.display = "none";
        this.runC = false;
    }

    initMandel()
    {
        this.minR = -1.016104875794718741911;
        this.maxR = -1.016069839835083325286;
        this.minI = 0.277341371563625000140;
        this.maxI = 0.277367718605270833442;

        // this.minR = -1.016097461503191826601;
        // this.maxR = -1.016097461213187951076;
        // this.minI = 0.277356844127615701971;
        // this.maxI = 0.277356844344781394806;

        this.minR = -2;
        this.maxR = 1;
        this.minI = -1;
        this.maxI = 1;

        this.minR = -1.293019999999999985104;
        this.maxR = -1.193859999999999987472;
        this.minI = 0.12808;
        this.maxI = 0.20245;
     
        this.minR = -0.868819999999999995828;
        this.maxR = -0.858714999999999996086;
        this.minI = 0.239415;
        this.maxI = 0.246935;

        this.maxIterations = 5000;
        this.x = 0;
        this.y = 0;

        this.colors = new Array(16).fill(0).map((_, i) => i === 0 ? '#000' : `#${((1 << 24) * Math.random() | 0).toString(16)}`);

        this.w.exports.initMandel(this.minR, this.maxR, this.minI, this.maxI, this.maxIterations, this.canvasWidth, this.canvasHeight);
    }

    loopC()
    {
        for (let x = 0; x < this.canvasWidth; ++x)
        {
            const iterations = this.w.exports.calcPixel(x, this.y);
            this.ctxC.fillStyle = this.colors[iterations >= this.maxIterations ? 0 : (iterations % this.colors.length - 1) + 1];
            this.ctxC.fillRect( x, this.y, 1, 1 );
        }

        this.y += 1;
        if (this.y >= this.canvasHeight)
        {
            this.stopC();
        }

        if (this.runC)
        {
            requestAnimationFrame(this.boundLoopC);
        }
    }
}
