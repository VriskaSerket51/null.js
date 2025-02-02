import { prime } from "@/prime";

import fs from "fs";

function getc() {
  const buffer = Buffer.alloc(1);
  fs.readSync(0, buffer, {
    offset: 0,
    length: 1,
  });
  return buffer[0];
}

function putc(char: number) {
  const buffer = Buffer.from([char]);
  fs.writeSync(1, buffer);
}

let primes = prime(100);
function getp(index: number) {
  while (index >= primes.length) {
    primes = prime(primes[primes.length - 1] << 2);
  }

  return primes[index];
}

let x = 0n;
let y = 1n;
const queues: number[][] = [[], [], []];

export function vm(src: number | bigint) {
  if (typeof src == "number") {
    src = BigInt(src);
  }
  x = src;

  run: for (let i = 0; ; i++) {
    const p = BigInt(getp(i));

    if (x == 1n) {
      return;
    }

    div: while (x % p == 0n) {
      x /= p;
      y *= p;

      switch (i % 14) {
        case 0: {
          queues.push(queues.shift()!);
          break;
        }
        case 1: {
          queues.unshift(queues.pop()!);
          break;
        }
        case 2: {
          const queue = queues[0];
          putc(queue[0] ?? 0);
          break;
        }
        case 3: {
          const queue = queues[0];
          queue[0] = getc();
          break;
        }
        case 4: {
          const queue = queues[0];
          y -= BigInt(queue[0] ?? 0);
          if (y < 0) {
            y = 0n;
          }
          break;
        }
        case 5: {
          const queue = queues[0];
          y += BigInt(queue[0] ?? 0);
          break;
        }
        case 6: {
          const queue = queues[0];
          if (queue.length == 0) {
            queue[0] = 0;
          }
          queue[0] += Number(y % 256n);
          queue[0] %= 256;
          break;
        }
        case 7: {
          const queue = queues[0];
          const next = queues[1];
          next.push(queue.shift() ?? 0);
          break;
        }
        case 8: {
          const queue = queues[0];
          const prev = queues[2];
          prev.push(queue.shift() ?? 0);
          break;
        }
        case 9: {
          const queue = queues[0];
          queue.shift();
          break;
        }
        case 10: {
          const queue = queues[0];
          queue.push(Number(y % 256n));
          break;
        }
        case 11: {
          const queue = queues[0];
          if (!queue[0]) {
            for (let j = i; ; j++) {
              const pp = BigInt(getp(j));
              if (x % pp == 0n) {
                x /= pp;
                y *= pp;
                break;
              }
            }
          }
          break;
        }
        case 12: {
          const tmp = y;
          y = x;
          x = tmp;
          i = -1;
          break div;
        }
        case 13: {
          break run;
        }
      }
    }
  }

  console.log();
}

vm(42539);
