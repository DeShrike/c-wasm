#!/bin/bash

# Turning C into LLVM IR

echo "Compiling..."

clang-8                    \
  --target=wasm32          \
  -fno-builtin             \
  -nostdlib                \
  --no-standard-libraries  \
  -O3                      \
  -emit-llvm               \
  -c                       \
  -S                       \
  main.c
#  -flto                    \

# Turning LLVM IR into object files

echo "Compiling..."

llc-8           \
  -march=wasm32 \
  -filetype=obj \
  main.ll

# Linking

echo "Linking..."

wasm-ld-8                           \
  --no-entry                        \
  --export-all                      \
  --lto-O3                          \
  --allow-undefined                 \
  -z,stack-size=$[8 * 1024 * 1024]  \
  -o main.wasm                     \
  main.o

# Done

echo "Done"

