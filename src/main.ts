import { Result } from "better-result";
// @ts-expect-error
import twTypographyCss from "./tw-typography.css" with { type: "text" };
import DOMPurify from "isomorphic-dompurify";
import { init, renderToHtml } from "md4x/wasm";

interface Err {
  error: Error;
  message: string;
}

function err(e: Err) {
  return e;
}

await init();

Bun.serve({
  routes: {
    "/*": async (c) => {
      try {
        const urlObj = new URL(c.url);
        const pathname = urlObj.pathname.substring(1);

        const markdownResponse = await Result.tryPromise(() => fetch(pathname));

        if (markdownResponse.isErr()) {
          throw err({
            error: markdownResponse.error,
            message:
              "could not read the markdown file. is the file accessible?",
          });
        }

        const markdown = await Result.tryPromise(() =>
          markdownResponse.value.text(),
        );

        if (markdown.isErr()) {
          throw err({
            error: markdown.error,
            message:
              "could not read the markdown file. is the file accessible?",
          });
        }

        const dirtyHtml = Result.try(() => renderToHtml(markdown.value));

        if (dirtyHtml.isErr()) {
          throw err({
            error: dirtyHtml.error,
            message: "could not convert markdown to HTML.",
          });
        }

        const cleanHtml = Result.try(() => DOMPurify.sanitize(dirtyHtml.value));

        if (cleanHtml.isErr()) {
          throw err({
            error: cleanHtml.error,
            message: "could not sanitize the HTML content.",
          });
        }

        return new Response(getTemplate({ body: cleanHtml.value }), {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      } catch (e) {
        const error = e as Err;
        return Response.json(error, { status: 500 });
      }
    },
  },
});

function getTemplate({ body }: { body: string }) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
        <style>
          ${twTypographyCss}
        </style>
      </head>
      <body>
        <div
          class="prose"
          style="padding: 1rem; margin-inline: auto; width: fit-content"
        >
          ${body}
        </div>
      </body>
    </html>
  `;
}
