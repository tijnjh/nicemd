// @ts-expect-error
import { tryCatch } from "typecatch";
import twTypographyCss from "./tw-typography.css" with { type: "text" };
import DOMPurify from "isomorphic-dompurify";
import { markdown } from "bun";

Bun.serve({
  routes: {
    "/*": async (c) => {
      let errorMessage: string | undefined = undefined;

      try {
        const urlObj = new URL(c.url);
        const pathname = urlObj.pathname.substring(1);

        // const markdown = await tryCatch(() => ) await fetch(pathname)).text());

        const markdownResponse = await tryCatch(fetch(pathname));

        if (markdownResponse.error) {
          errorMessage =
            "could not fetch the markdown file. is the file path correct?";
          throw new Error(errorMessage);
        }

        const markdown = await tryCatch(markdownResponse.data.text());

        if (markdown.error) {
          errorMessage =
            "could not read the markdown file. is the file accessible?";
          throw new Error(errorMessage);
        }

        const dirtyHtml = tryCatch(() => Bun.markdown.html(markdown.data));

        if (dirtyHtml.error) {
          errorMessage =
            "could not parse the markdown file. is the file valid markdown?";
          throw new Error(errorMessage);
        }

        const cleanHtml = tryCatch(() => DOMPurify.sanitize(dirtyHtml.data));

        if (cleanHtml.error) {
          errorMessage = "could not sanitize the HTML content.";
          throw new Error(errorMessage);
        }

        return new Response(getTemplate({ body: cleanHtml.data }), {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      } catch (error) {
        return Response.json({ errorMessage, error }, { status: 500 });
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
