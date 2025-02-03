import { getp } from "@/prime";
import fs from "fs";

export class VM {
  private x = 0n;
  private y = 1n;
  private queues: number[][] = [[], [], []];

  private getc() {
    const buffer = Buffer.alloc(1);
    fs.readSync(0, buffer, {
      offset: 0,
      length: 1,
    });
    return buffer[0];
  }

  private putc(char: number) {
    const buffer = Buffer.from([char]);
    fs.writeSync(1, buffer);
  }

  reset() {
    this.x = 0n;
    this.y = 1n;
    this.queues[0].length = 0;
    this.queues[1].length = 0;
    this.queues[2].length = 0;
  }

  execute(src: number | bigint) {
    if (typeof src == "number") {
      src = BigInt(src);
    }
    this.x = src;

    run: for (let i = 0; ; i++) {
      const p = BigInt(getp(i));

      if (this.x == 1n) {
        return;
      }

      div: while (this.x % p == 0n) {
        this.x /= p;
        this.y *= p;

        switch (i % 14) {
          case 0: {
            this.queues.push(this.queues.shift()!);
            break;
          }
          case 1: {
            this.queues.unshift(this.queues.pop()!);
            break;
          }
          case 2: {
            const queue = this.queues[0];
            this.putc(queue[0] ?? 0);
            break;
          }
          case 3: {
            const queue = this.queues[0];
            queue[0] = this.getc();
            break;
          }
          case 4: {
            const queue = this.queues[0];
            this.y -= BigInt(queue[0] ?? 0);
            if (this.y < 0) {
              this.y = 0n;
            }
            break;
          }
          case 5: {
            const queue = this.queues[0];
            this.y += BigInt(queue[0] ?? 0);
            break;
          }
          case 6: {
            const queue = this.queues[0];
            if (queue.length == 0) {
              queue[0] = 0;
            }
            queue[0] += Number(this.y % 256n);
            queue[0] %= 256;
            break;
          }
          case 7: {
            const queue = this.queues[0];
            const next = this.queues[1];
            next.push(queue.shift() ?? 0);
            break;
          }
          case 8: {
            const queue = this.queues[0];
            const prev = this.queues[2];
            prev.push(queue.shift() ?? 0);
            break;
          }
          case 9: {
            const queue = this.queues[0];
            queue.shift();
            break;
          }
          case 10: {
            const queue = this.queues[0];
            queue.push(Number(this.y % 256n));
            break;
          }
          case 11: {
            const queue = this.queues[0];
            if (!queue[0]) {
              for (let j = i; ; j++) {
                const pp = BigInt(getp(j));
                if (this.x % pp == 0n) {
                  this.x /= pp;
                  this.y *= pp;
                  break;
                }
              }
            }
            break;
          }
          case 12: {
            const tmp = this.y;
            this.y = this.x;
            this.x = tmp;
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
}
