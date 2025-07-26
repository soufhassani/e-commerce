import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

export const server = setupServer(
  http.put("/api/upload", async ({ request }) => {
    /*  If you really need to inspect the body:
        const blob = await request.blob();
    */

    // 👇 craft the mock response
    return HttpResponse.json(
      { url: "https://cdn.fake/img.jpg" },
      { status: 200 }
    );
  })
);
