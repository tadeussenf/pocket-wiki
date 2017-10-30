import {Injectable} from '@angular/core';
import {Item} from "../common/interfaces";
import {Http, RequestOptionsArgs, Headers} from "@angular/http";
import * as _ from 'lodash';
import {environment} from "../environments/environment";

@Injectable()
export class PocketService {
  lastUpdateTime: any;
  username: any;
  accessToken: any;
  title = 'app';
  consumerKey = "71520-12304220fa8fcbd039b9be34";
  headers: Headers = new Headers({
    'Content-Type': 'application/json',
    'X-Accept': 'application/json'
  });
  private requestToken: string;
  authBody = {
    "consumer_key": this.consumerKey,
    "access_token": this.accessToken
  };
  list: Item[] = [];
  filteredList: Item[];
  options: RequestOptionsArgs = {'headers': this.headers};
  tags: { name: any; count: number }[];

  constructor(private http: Http) {
    console.log("init service");
    console.log(environment);

    this.lastUpdateTime = localStorage.getItem("pocket-lastUpdateTime");
    this.username = localStorage.getItem("pocket-username");
    this.accessToken = localStorage.getItem("pocket-accessToken");
    this.tags = JSON.parse(localStorage.getItem("pocket-tags"));
    this.list = JSON.parse(localStorage.getItem("pocket-list"));

    // not authenticated
    if (!this.accessToken || !this.username) {
      // todo delete data or inform user that pocket auth has been lost
      this.authenticateWithPocket()
    } else if (!this.list || this.list.length < 1 || !this.tags || this.tags.length < 1 || this.dataOutdated()) {
      this.loadAllItems()
    }

    console.log("sorting all items");
    this.list = _.orderBy(this.list, ['time_added'], ['desc']);
    this.filteredList = this.list;
    console.log(this.filteredList);
  }

  addTags(itemId: number, tags: string[]) {
    console.log(tags.toString());
    let body = {
      "consumer_key": this.consumerKey,
      "access_token": this.accessToken,
      actions: [{
        action: "tags_replace",
        item_id: itemId,
        tags: tags.toString(),
        time: Date.now() - 1000
      }]
    };
    console.log(body);
    this.http.post(environment.pocketApiUrl + "v3/send", body, this.options)
      .subscribe(
        res => {
          // todo add tags to local copy
          this.saveToLocalStorage();
          console.log(res.json());
        },
        err => {
          console.error(err.json())
        }
      )
  }

  private authenticateWithPocket() {
    console.log("not authenticated");
    this.requestToken = localStorage.getItem("pocket-requestToken");

    // recieved pocket auth callback
    if (this.requestToken) {
      console.log("found requestToken in LS");
      this.http.post(environment.pocketApiUrl + "v3/oauth/authorize", {
        "consumer_key": this.consumerKey,
        "code": this.requestToken
      }, this.options).subscribe(
        (res) => {
          let response = res.json();
          console.log(response);
          this.username = response.username;
          this.accessToken = response.access_token;
          localStorage.setItem("pocket-accessToken", this.accessToken);
          localStorage.setItem("pocket-username", this.username)
        },
        (err) => {
          console.log("error while authorizing");
          localStorage.removeItem("pocket-requestToken")
        }
      )
    } else {
      this.http.post(environment.pocketApiUrl + "v3/oauth/request", {
        "consumer_key": this.consumerKey,
        "redirect_uri": environment.redirectUrl
      }, this.options).subscribe((res: any) => {
          let response = res.json();
          console.log(response);

          if (!response.access_token) {
            this.requestToken = response.code;
            localStorage.setItem("pocket-requestToken", this.requestToken);
            console.log("requestToken", this.requestToken);

            location.href = "https://getpocket.com/auth/authorize?request_token=" + this.requestToken + "&redirect_uri=" + environment.redirectUrl
          }
        },
        (err) => {
          console.log("err", err);
        })
    }
  }

  public loadAllItems() {
    console.log("loading all data");
    this.list = [];
    let tags = [];
    this.http.post(environment.pocketApiUrl + "v3/get", {
      "consumer_key": this.consumerKey,
      "access_token": this.accessToken,
      "detailType": "complete",
      "state": "all",
      // "count": 10
    }).subscribe((res) => {
      let response = res.json();
      this.lastUpdateTime = response.since;
      let json = response.list;

      for (let item in json) {
        json[item].customTags = [];

        for (let tag in json[item].tags) {
          json[item].customTags.push(tag);
          if (!tags.includes(tag)) {
            tags.push(tag)
          }
        }

        this.list.push(json[item]);
      }

      this.tags = tags.map((tag) => {
        return {name: tag, count: _.filter(this.list, item => item.customTags.includes(tag)).length}
      });

      this.tags = _.orderBy(this.tags, ['count'], ['desc']);

      // todo fix semantics of tags and tags (tags not really needed)
      console.log(this.tags);

      this.filteredList = this.list;
      console.log(this.filteredList);
      localStorage.setItem("pocket-lastUpdateTime", JSON.stringify(this.lastUpdateTime));
      this.saveToLocalStorage();
      console.log("loading all data done");
    })
  }

  showItemsForTag(tag: string) {
    this.filteredList = _.filter(this.list, (item) => {
      return item.customTags.includes(tag);
    });

    console.log(this.filteredList);
  }

  filterByDate(days: number) {
    if (days === 0) {
      this.filteredList = this.list;
    } else {
      let range = (Date.now() / 1000) - (days * 24 * 60 * 60);
      this.filteredList = _.filter(this.list, (item) => {
        return parseInt(item.time_added) > range;
      })
    }
  }

  filterNoTags() {
    this.filteredList = _.filter(this.list, (item) => {
      return item.customTags.length === 0;
    })
  }

  simpleDrop($event: Event) {
    console.log($event);
  }

  getItems() {
    return this.filteredList;
  }

  getTags() {
    return this.tags;
  }

  resetFilter() {
    this.filteredList = this.list;
  }

  private dataOutdated(): boolean {
    let boolean = this.lastUpdateTime < (Date.now() / 1000) - (60 * 5);
    console.log("Data outdated: " + boolean);
    return boolean // if last time update was more than 5 min ago
  }

  private saveToLocalStorage() {
    localStorage.setItem("pocket-tags", JSON.stringify(this.tags));
    localStorage.setItem("pocket-list", JSON.stringify(this.list));
  }
}
