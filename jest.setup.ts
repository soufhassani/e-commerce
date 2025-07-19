import { server } from "./test/msw/server";
import "@testing-library/jest-dom";

// Establish API mocking before all tests.
beforeAll(() => server.listen());
// Reset any request handlers that are declared as a part of our tests
afterEach(() => server.resetHandlers());
// Clean up after the tests are finished.
afterAll(() => server.close());
