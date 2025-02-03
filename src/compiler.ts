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
    const { instructions, out } = decompiler.decompile(code);
    fs.writeFileSync(dst, out);
  }

  decompile(src: number | bigint) {
    if (typeof src == "number") {
      src = BigInt(src);
    }

    const instructions: number[] = [];
    const primes: number[] = [];

    for (let i = 0; ; i++) {
      const p = BigInt(getp(i));

      if (src == 1n) {
        break;
      }

      while (src % p == 0n) {
        src /= p;
        instructions.push(i % 14);
        primes.push(Number(p));
      }
    }

    const out = instructions
      .map((ins, i) => `${String(ins).padEnd(2, " ")}\t\t// ${primes[i]}`)
      .join("\n");

    return { instructions, out };
  }
}
