export type Task = { id: bigint; description: string; completed: boolean };
export type LogEntry = { id: number; text: string; hash?: `0x${string}` };
export type NoticeEntry = { id: number; text: string };