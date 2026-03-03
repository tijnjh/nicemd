# nicemd

A tiny Bun server that renders markdown URLs as clean HTML pages.

## Usage

```sh
bun src/main.ts
```

Then pass any publicly accessible markdown URL as the path:

```
http://localhost:3000/https://raw.githubusercontent.com/you/repo/main/README.md
```

It fetches the file, converts it to HTML, sanitizes it, and serves it styled with Tailwind's typography CSS.

## Stack

- [Bun](https://bun.sh) — runtime + markdown parser
- [isomorphic-dompurify](https://github.com/cure53/DOMPurify) — sanitization
- [typecatch](https://github.com/nicholasgasior/typecatch) — typed error handling
