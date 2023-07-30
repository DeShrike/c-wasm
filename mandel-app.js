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

function print(value)
{
  //const s = extract_string(value);
  //console.log("print:", s);
  console.log("Print:");
}

function run_wasm(obj) {
    w = obj.instance;
    memory = new Uint8Array(w.exports.memory.buffer);

    let m = new Mandel(w);
}

async function load_wasm() {
  fetch("main.wasm").then(response => 
    response.arrayBuffer()
  ).then(bytes => 
    WebAssembly.instantiate(bytes, { "env": make_environment(imports) })
  ).then(run_wasm);
}

function init() {
    load_wasm();


}

class Mandel
{
    constructor(w) {
        this.buttonStartC = document.getElementById("btnStartC");
        this.buttonStartJS = document.getElementById("btnStartJS");
        this.buttonStopC = document.getElementById("btnStopC");
        this.buttonStopJS = document.getElementById("btnStopJS");

        this.canvasJS = document.getElementById("canvasJS");
        this.canvasC = document.getElementById("canvasC");
        this.w = w;

        this.ctxC = this.canvasC.getContext("2d");
        this.ctxJS = this.canvasJS.getContext("2d");

        this.canvasWidth = this.canvasC.width;
        this.canvasHeight = this.canvasC.height;

        this.boundHandleClickStartC = this.startC.bind(this);
        this.boundHandleClickStartJS = this.startJS.bind(this);
        this.boundHandleClickStopC = this.stopC.bind(this);
        this.boundHandleClickStopJS = this.stopJS.bind(this);

        this.boundLoopJS = this.loopJS.bind(this);
        this.boundLoopC = this.loopC.bind(this);

        this.buttonStartC.addEventListener("click", this.boundHandleClickStartC);
        this.buttonStopC.addEventListener("click", this.boundHandleClickStopC);
        this.buttonStartJS.addEventListener("click", this.boundHandleClickStartJS);
        this.buttonStopJS.addEventListener("click", this.boundHandleClickStopJS);

        this.buttonStopC.style.display = "none";
        this.buttonStopJS.style.display = "none";

        this.runJS = false;
        this.runC = false;
    }

    startC()
    {
        this.buttonStartC.style.display = "none";
        this.buttonStopC.style.display = "block";
        this.buttonStartJS.style.display = "none";
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
        this.buttonStartJS.style.display = "block";
        this.runC = false;
    }

    startJS()
    {
        this.buttonStartJS.style.display = "none";
        this.buttonStopJS.style.display = "block";
        this.buttonStartC.style.display = "none";
        this.initMandel();

        this.ctxJS.fillStyle = "rgba(10,10,10,255)";
        this.ctxJS.fillRect( 0, 0, this.canvasWidth, this.canvasHeight );

        this.runJS = true;
        requestAnimationFrame(this.boundLoopJS);
    }

    stopJS()
    {
        this.buttonStartJS.style.display = "block";
        this.buttonStopJS.style.display = "none";
        this.buttonStartC.style.display = "block";
        this.runJS = false;
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

        this.maxIterations = 5000;
        this.x = 0;
        this.y = 0;

        this.colors = new Array(16).fill(0).map((_, i) => i === 0 ? '#000' : `#${((1 << 24) * Math.random() | 0).toString(16)}`);

        this.w.exports.initMandel(this.minR, this.maxR, this.minI, this.maxI, this.maxIterations, this.canvasWidth, this.canvasHeight);
    }

    loopJS()
    {
        for (let x = 0; x < this.canvasWidth; ++x)
        {
            const iterations = this.calcPixel(x, this.y);
            this.ctxJS.fillStyle = this.colors[iterations >= this.maxIterations ? 0 : (iterations % this.colors.length - 1) + 1];
            this.ctxJS.fillRect( x, this.y, 1, 1 );
        }

        this.y += 1;
        if (this.y >= this.canvasHeight)
        {
            this.stopJS();
        }

        if (this.runJS)
        {
            requestAnimationFrame(this.boundLoopJS);
        }
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

    map(value, minin, maxin, minout, maxout)
    {
        return minout + (value - minin) / (maxin - minin) * (maxout - minout);
    }
    
    calcPixel(x, y)
    {
        const x0 = this.map(x, 0, this.canvasWidth - 1, this.minR, this.maxR);
        const y0 = this.map(y, 0, this.canvasHeight - 1, this.minI, this.maxI);

        let a = 0;
        let b = 0;
        let rx = 0;
        let ry = 0;

        let iterations = 0;
        while (iterations < this.maxIterations && (rx * rx + ry * ry <= 4)) {
            rx = a * a - b * b + x0;
            ry = 2 * a * b + y0;

            a = rx;
            b = ry;
            iterations++;
        }

        return iterations;
    }
}
