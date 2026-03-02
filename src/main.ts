import { tryCatch } from "typecatch";
// @ts-expect-error
import twTypographyCss from "./tw-typography.css" with { type: "text" };
import DOMPurify from "isomorphic-dompurify";

interface Err {
  error: Error;
  message: string;
}

function err(e: Err) {
  return e;
}

Bun.serve({
  routes: {
    "/*": async (c) => {
      try {
        const urlObj = new URL(c.url);
        const pathname = urlObj.pathname.substring(1);

        const markdownResponse = await tryCatch(fetch(pathname));

        if (markdownResponse.error) {
          throw err({
            error: markdownResponse.error,
            message:
              "could not read the markdown file. is the file accessible?",
          });
        }

        const markdown = await tryCatch(markdownResponse.data.text());

        if (markdown.error) {
          throw err({
            error: markdown.error,
            message:
              "could not read the markdown file. is the file accessible?",
          });
        }

        const dirtyHtml = tryCatch(() => Bun.markdown.html(markdown.data));

        if (dirtyHtml.error) {
          throw err({
            error: dirtyHtml.error,
            message: "could not convert markdown to HTML.",
          });
        }

        const cleanHtml = tryCatch(() => DOMPurify.sanitize(dirtyHtml.data));

        if (cleanHtml.error) {
          throw err({
            error: cleanHtml.error,
            message: "could not sanitize the HTML content.",
          });
        }

        return new Response(getTemplate({ body: cleanHtml.data }), {
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
