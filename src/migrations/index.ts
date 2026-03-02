import * as migration_20260131_161317 from './20260131_161317';
import * as migration_20260131_162318 from './20260131_162318';

export const migrations = [
  {
    up: migration_20260131_161317.up,
    down: migration_20260131_161317.down,
    name: '20260131_161317',
  },
  {
    up: migration_20260131_162318.up,
    down: migration_20260131_162318.down,
    name: '20260131_162318'
  },
];
