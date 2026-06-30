import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

const [, , ...args] = process.argv;

function readOption(name, fallback = null) {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1] ?? fallback;
}

const yearText = readOption("--year");
const monthText = readOption("--month", "0");
const jsDir = readOption("--js-dir", "/private/tmp/koyomi8-js");
const outputPath = readOption("--output", null);

if (!yearText || !outputPath) {
  console.error(
    [
      "usage:",
      "  node scripts/generate-koyomi-reference-csv-from-js.mjs --year 2021 --month 2 --output data-workbench/calendar-notes/fixtures/koyomi-reference-2021-02.csv",
      "",
      "required js files in --js-dir:",
      "  std.js, stdlib.js, zassetsu.js, rekicyuu_o2n.js, rekicyuu.js",
    ].join("\n"),
  );
  process.exit(1);
}

const year = Number(yearText);
const month = Number(monthText);

if (!Number.isInteger(year) || year < 1900) {
  throw new Error(`invalid --year: ${yearText}`);
}

if (!Number.isInteger(month) || month < 0 || month > 12) {
  throw new Error(`invalid --month: ${monthText}`);
}

function createElementStore() {
  const elements = new Map();

  return function getElementById(id) {
    if (!elements.has(id)) {
      elements.set(id, {
        id,
        style: {},
        innerHTML: "",
        href: "",
        download: "",
        selectedIndex: 0,
        options: [],
        length: 0,
        add(option) {
          this.options.push(option);
          this.length = this.options.length;
        },
      });
    }

    return elements.get(id);
  };
}

async function evaluateKoyomiScripts() {
  const getElementById = createElementStore();
  const context = {
    console,
    navigator: {
      appVersion: "5.0",
      appName: "Netscape",
      userAgent: "Node",
    },
    Blob: class Blob {
      constructor(parts, options) {
        this.parts = parts;
        this.options = options;
      }
    },
    window: {
      URL: {
        createObjectURL() {
          return "blob:koyomi-reference-csv";
        },
      },
    },
    document: {
      location: "https://koyomi8.com/sub/rekicyuu.html",
      cookie: "",
      getElementById,
      write() {},
      writeln() {},
      YYMM: {
        YY: {
          selectedIndex: 0,
          options: [{ value: year }],
          length: 1,
        },
        MM: {
          selectedIndex: 0,
          options: [{ value: month }],
          length: 1,
        },
      },
    },
    Option: function Option(text, value) {
      return { text, value };
    },
    exit(code) {
      throw new Error(`koyomi script exited: ${code}`);
    },
  };
  context.top = context;

  vm.createContext(context);

  for (const fileName of [
    "std.js",
    "stdlib.js",
    "zassetsu.js",
    "rekicyuu_o2n.js",
    "rekicyuu.js",
  ]) {
    const filePath = path.join(jsDir, fileName);
    const code = await readFile(filePath, "utf8");
    vm.runInContext(code, context, { filename: fileName });
  }

  return context;
}

const context = await evaluateKoyomiScripts();
vm.runInContext(`INIT_KSArray(); MakeTable(0, ${year}, ${month});`, context);

if (!context.CSVBlob) {
  throw new Error("koyomi CSVBlob was not generated");
}

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, context.CSVBlob);

console.log(
  JSON.stringify(
    {
      year,
      month,
      output: outputPath,
      rows: context.CSVBlob.split("\r\n").filter(Boolean).length - 1,
      source: "https://koyomi8.com/sub/rekicyuu.html client script",
    },
    null,
    2,
  ),
);
