﻿export interface Item {
  item_id: string;
  resolved_id: string;
  given_url: string;
  given_title: string;
  favorite: string;
  status: string;
  time_added: string;
  time_updated: string;
  time_read: string;
  time_favorited: string;
  sort_id: number;
  resolved_title: string;
  resolved_url: string;
  excerpt: string;
  is_article: string;
  is_index: string;
  has_video: string;
  has_image: string;
  word_count: string;
  amp_url: string;
  tags: Tags;
  authors: any;
  image: Image;
  images: Images;
  customTags?: (string)[] | null;
}
export interface Tags {
  [key: string]: string
}

export interface Image {
  item_id: string;
  src: string;
  width: string;
  height: string;
}
export interface Images {
  [key: number]: Image[];
}
export interface Image {
  item_id: string;
  image_id: string;
  src: string;
  width: string;
  height: string;
  credit: string;
  caption: string;
}
