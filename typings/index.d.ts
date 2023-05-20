export type UrlString = `https://${string}`;
export type MagnetString = string & {};
export type ISO8601DateTime = string & {};

type DatabaseConfig = {
  key: 'downloader';
  value: 'system' | 'stdout' | 'aria2' | 'webhook';
} | {
  key: 'download-destination'
  value: string | null;
}| {
  key: 'aria2-jsonrpc'
  value: UrlString | null;
} | {
  key: 'webhook-url'
  value: UrlString | null;
}| {
  key: 'webhook-token'
  value: UrlString | null;
}

// I don't know why but it works! Thanks ChatGPT!
type DatabaseConfigDict = {
  [R in DatabaseConfig as R extends { key: infer N; } ? N : never]:
    R extends { value: infer V } ? V : never;
  };

interface DatabaseThread {
  id: number;
  dmhy_link: UrlString;
  magnet: MagnetString;
  title: string;
  publish_date: ISO8601DateTime;
}

interface DatabaseSubscription {
  id: number;
  sid: string & {length: 3};
  title: string;
  keywords: string[];
  episode_pattern: string;
  exclude_pattern: string;
}

interface Downloader {
  download: (thread: {title: string, magnet: string;}, config: Record<string, string | null>) => Promise<void>;
}

interface Episode {
  from: number;
  to: number;
}
