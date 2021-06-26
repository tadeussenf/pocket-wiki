export interface PocketItemResponse {
  since: number;
  list: { [key: string]: PocketItem }
}

export interface PocketAuthorizeResponse {
  username: string;
  access_token: string
}

export interface PocketRequestResponse {
  code: string;
}

export interface PocketItem {
  customTags: string[];
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
  authors: any[];
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
  itemId: string,
  title: string,
  tags: string[],
  allTags: Tag[]
}

export interface Tag {
  name: string;
  count: number
}

export interface PocketConfig {
  username: string,
  lastUpdateTime: number;
  accessToken?: string;
  requestToken?: string;
  consumerKey: string;
  apiUrl: string;
  redirectUrl: string;
  headers: { [key: string]: string }
}

