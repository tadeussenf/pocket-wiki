import {Tags} from "./interfaces";

export class Item {
  // item_id: string;
  // time_added: string;
  // tags: Tags;
  // status: string;
  // given_url: string;
  // given_title: string;
  // resolved_title: string;
  // excerpt: string;
  // customTags: string[];

  constructor(public item_id: string,
              public time_added: string,
              // public tags: Tags,
              public status: string,
              public given_url: string,
              public given_title: string,
              public resolved_title: string,
              public excerpt: string,
              public customTags: string[]) {
  }
}
