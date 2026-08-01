import * as migration_20260731_221916_initial from './20260731_221916_initial';
import * as migration_20260801_101212_hero_slider from './20260801_101212_hero_slider';
import * as migration_20260801_111755_site_indexable from './20260801_111755_site_indexable';
import * as migration_20260801_112000_matchday_posts from './20260801_112000_matchday_posts';

export const migrations = [
  {
    up: migration_20260731_221916_initial.up,
    down: migration_20260731_221916_initial.down,
    name: '20260731_221916_initial',
  },
  {
    up: migration_20260801_101212_hero_slider.up,
    down: migration_20260801_101212_hero_slider.down,
    name: '20260801_101212_hero_slider',
  },
  {
    up: migration_20260801_111755_site_indexable.up,
    down: migration_20260801_111755_site_indexable.down,
    name: '20260801_111755_site_indexable',
  },
  {
    up: migration_20260801_112000_matchday_posts.up,
    down: migration_20260801_112000_matchday_posts.down,
    name: '20260801_112000_matchday_posts'
  },
];
