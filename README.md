# Compile C to WebAssembly

## Dependancies

- LLVM - at least version 8
- cmake - at least version 3.16
- WABT

## Getting started

Clone this repo, then

```console
./build.sh
```

Start a local webserver (see below).

Point your browser to http://localhost:8000/index.html

## Install LLVM

```console
$ sudo apt-get install llvm-8 clang-8 lld-8
```

## Build cmake

```console
$ mkdir ~/temp
$ cd ~/temp
$ wget https://cmake.org/files/v3.16/cmake-3.16.0.tar.gz
$ tar -xzvf cmake-3.16.0.tar.gz
$ cd cmake-3.16.0/
$ ./bootstrap
$ make -j$(nproc)
$ sudo make install
$ cmake --version
```

## Clone and build WABT

```console
$ git clone --recursive https://github.com/WebAssembly/wabt
$ cd wabt
$ git submodule update --init
$ mkdir build
$ cd build
$ cmake ..
$ cmake --build
$ sudo make install
```

https://surma.dev/things/c-to-webassembly/

## Run a local webserver for testing

```console
python3 -m http.server 8000
```

## Usefull commands

```console
$ wasm-objdump -x main.o
```

```console
wasm2wat main.wasm
```
