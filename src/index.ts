import { prime } from "./prime";
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
  process.stdout.write(Buffer.from([char]));
}

let primes = prime(100);
function getp(index: number) {
  while (index >= primes.length) {
    primes = prime(primes[primes.length - 1] << 2);
  }

  return primes[index];
}

let x = 0;
let y = 1;
const queues: number[][] = [[], [], []];

export function vm(src: number) {
  x = src;

  for (let i = 0; ; i++) {
    const p = getp(i);

    if (x == 1) {
      return;
    }

    while (x % p == 0) {
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
          y -= queue[0] ?? 0;
          if (y < 0) {
            y = 0;
          }
          break;
        }
        case 5: {
          const queue = queues[0];
          y += queue[0] ?? 0;
          break;
        }
        case 6: {
          const queue = queues[0];
          if (queue.length == 0) {
            queue[0] = 0;
          }
          queue[0] += y % 256;
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
          queue.push(y % 256);
          break;
        }
        case 11: {
          const queue = queues[0];
          if (!queue[0]) {
            for (let j = i; ; j++) {
              const pp = getp(j);
              if (x % pp == 0) {
                x /= pp;
                y *= pp;
              }
            }
          }
          break;
        }
        case 12: {
          const tmp = y;
          y = x;
          x = tmp;
          break;
        }
        case 13: {
          return;
        }
      }
    }
  }
}

// vm(42539);
