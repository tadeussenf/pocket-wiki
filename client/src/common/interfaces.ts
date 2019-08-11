export interface PocketItem {
  customTags: Tags;
  item_id: string;
  status: string;
  time_added: string;
  tags: Tags;
  given_url: string;
  given_title: string;
  resolved_title: string;
  excerpt: string;
  resolved_id: string;
  favorite: string;
  time_updated: string;
  time_read: string;
  time_favorited: string;
  sort_id: number;
  resolved_url: string;
  is_article: string;
  is_index: string;
  has_video: string;
  has_image: string;
  word_count: string;
  amp_url: string;
  authors: any;
  image: Image;
  images: Images;
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

export interface AddTagModalData {
  itemId: number,
  title: string,
  tags: string[],
  allTags: Tag[]
}

export interface Tag {
  name: string;
  count: number
}

