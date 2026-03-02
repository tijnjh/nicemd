// @ts-expect-error
import twTypographyCss from "./tw-typography.css" with { type: "text" };
import DOMPurify from "isomorphic-dompurify";

Bun.serve({
  routes: {
    "/*": async (c) => {
      const urlObj = new URL(c.url);
      const pathname = urlObj.pathname.substring(1);

      try {
        const markdown = await (await fetch(pathname)).text();

        const dirtyHtml = Bun.markdown.html(markdown);
        const cleanHtml = DOMPurify.sanitize(dirtyHtml);

        return new Response(getTemplate({ body: cleanHtml }), {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      } catch (error) {
        return Response.json(
          { error: "could not fetch the markdown file. is the url correct?" },
          { status: 500 },
        );
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
