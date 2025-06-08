declare module "@tauri-apps/api/core" {
  interface InvokeArgs {
    generate_ulid: { count: number };
    generate_nanoid: { count: number };
    generate_uuid_v4: { count: number };
    generate_uuid_v7: { count: number; timestamp?: number };
  }

  interface InvokeReturns {
    generate_ulid: string;
    generate_nanoid: string;
    generate_uuid_v4: string;
    generate_uuid_v7: string;
  }

  function invoke<T extends keyof InvokeArgs>(
    cmd: T,
    args: InvokeArgs[T],
    options?: InvokeOptions
  ): Promise<InvokeReturns[T]>;
}
