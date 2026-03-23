import { describe, it, expect } from "vitest";
import { AxiosError, type AxiosResponse } from "axios";
import { tryCatch } from "@core/utils/try-catch";

function makeAxiosError(message: unknown, status: number): AxiosError {
  const response = {
    data: { message },
    status,
    statusText: String(status),
    headers: {},
    config: { headers: {} } as AxiosResponse["config"],
  } as AxiosResponse;

  return new AxiosError("Request failed", "ERR_BAD_RESPONSE", undefined, undefined, response);
}

describe("tryCatch", () => {
  it("returns [data, null] when the promise resolves", async () => {
    const [data, error] = await tryCatch(Promise.resolve({ id: 1 }));
    expect(data).toEqual({ id: 1 });
    expect(error).toBeNull();
  });

  it("returns [null, { message, status }] on an axios error with a string message", async () => {
    const [data, error] = await tryCatch(Promise.reject(makeAxiosError("No encontrado", 404)));
    expect(data).toBeNull();
    expect(error).toEqual({ message: "No encontrado", status: 404 });
  });

  it("uses the first item when the server message is an array", async () => {
    const [, error] = await tryCatch(Promise.reject(makeAxiosError(["Campo requerido", "Otro error"], 400)));
    expect(error?.message).toBe("Campo requerido");
  });

  it("returns the fallback message when server message is an empty string", async () => {
    const [, error] = await tryCatch(Promise.reject(makeAxiosError("", 500)));
    expect(error?.message).toBe("Error desconocido en el servidor");
  });

  it("returns the fallback message when server message is whitespace only", async () => {
    const [, error] = await tryCatch(Promise.reject(makeAxiosError("   ", 500)));
    expect(error?.message).toBe("Error desconocido en el servidor");
  });

  it("returns the fallback message for non-axios errors", async () => {
    const [data, error] = await tryCatch(Promise.reject(new Error("Network failure")));
    expect(data).toBeNull();
    expect(error).toEqual({ message: "Error desconocido en el servidor" });
  });
});
