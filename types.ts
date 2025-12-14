export enum TimerMode {
  WORK = 'WORK',
  BREAK = 'BREAK',
}

export enum TimerState {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
}

export interface TimeLog {
  id: string;
  startTime: number;
  endTime: number;
  durationSeconds: number; // Actual recorded duration
  mode: TimerMode;
  tags: string[];
  note?: string;
}

export interface TagStats {
  tag: string;
  totalSeconds: number;
  sessions: number;
}

export const WORK_DURATION = 53 * 60; // 53 minutes
export const BREAK_DURATION = 17 * 60; // 17 minutes