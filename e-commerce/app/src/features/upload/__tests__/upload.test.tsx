import { render, screen } from "@testing-library/react";
import user from "@testing-library/user-event";
import { renderWithQuery } from "../../../../test/renderWithQuery";
import UploadPage from "@/app/upload/page";

test("each thumbnail shows its own progress bar", async () => {
  renderWithQuery(<UploadPage />);
  const file = new File(["hello"], "hello.png", { type: "image/png" });

  console.log("file: ", file);
  await user.upload(screen.getByLabelText(/click to upload/i), file);

  // progress bar starts at 0 %
  const bar = await screen.findByRole("progressbar");
  console.log("bar: ", bar);
  expect(bar).toHaveStyle({ width: "0%" });

  // eventually hits 100 %
  //   await screen.findByText(/upload complete/i, {}, { timeout: 2000 });
  //   expect(bar).toHaveStyle({ width: "100%" });
});
