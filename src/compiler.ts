import { getp } from "@/prime";
import fs from "fs";

export class Compiler {
  static compile(src: string, dst: string) {
    src = fs.readFileSync(src, "utf-8");
    const instructions = src
      .split("\n")
      .map((line) => line.split("//")[0])
      .filter((line) => line.trim())
      .map((line) => Number(line));
    const compiler = new Compiler();
    const out = compiler.compile(instructions);
    fs.writeFileSync(dst, out);
  }

  compile(instructions: number[]) {
    let idx = 0;
    let out = 1n;
    for (let i = 0; i < instructions.length; ) {
      let ins = instructions[i];
      let j = i + 1;
      while (instructions[j] == ins) {
        j++;
      }

      while (ins < idx) {
        ins += 14;
      }

      const p = BigInt(getp(ins));
      for (let k = i; k < j; k++) {
        out *= p;
      }

      i = j;
      idx = ins;
    }
    return String(out);
  }
}

export class Decompiler {
  static decompile(src: string, dst: string) {
    src = fs.readFileSync(src, "utf-8");
    const code = BigInt(src.trim());
    const decompiler = new Decompiler();
    const instructions = decompiler.decompile(code);
    fs.writeFileSync(dst, instructions.map((ins) => String(ins)).join("\n"));
  }

  decompile(src: number | bigint) {
    if (typeof src == "number") {
      src = BigInt(src);
    }

    const instructions: number[] = [];

    for (let i = 0; ; i++) {
      const p = BigInt(getp(i));

      if (src == 1n) {
        break;
      }

      while (src % p == 0n) {
        src /= p;
        instructions.push(i % 14);
      }
    }

    return instructions;
  }
}
