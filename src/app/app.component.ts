import {Component} from '@angular/core';
import {Http, RequestOptionsArgs, Headers} from "@angular/http";
import * as _ from 'lodash';
import {Item} from "common/interfaces";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  username: any;
  accessToken: any;
  title = 'app';
  consumerKey = "71520-12304220fa8fcbd039b9be34";
  headers: Headers = new Headers({
    'Content-Type': 'application/json',
    'X-Accept': 'application/json'
  });
  list: Item[] = [];
  filteredList: Item[];
  tags: any[] = [];
  options: RequestOptionsArgs = {'headers': this.headers};
  private requestToken: string;
  tagCount: { name: any; count: number }[];

  constructor(private http: Http) {
    this.username = localStorage.getItem("pocket-username");
    this.accessToken = localStorage.getItem("pocket-accessToken");
    this.tagCount = JSON.parse(localStorage.getItem("pocket-tags"));
    this.list = JSON.parse(localStorage.getItem("pocket-list"));

    // not authenticated
    if (!this.accessToken || !this.username) {
      this.authenticateWithPocket()
    } else if (!this.list || this.list.length < 1 || !this.tagCount || this.tagCount.length < 1) {
      this.loadAllItems()
    }

    console.log("sorting all items");
    this.list = _.orderBy(this.list, ['time_added'], ['desc']);
    this.filteredList = this.list;
    console.log(this.filteredList);
  }

  private authenticateWithPocket() {
    console.log("not authenticated");
    this.requestToken = localStorage.getItem("pocket-requestToken");

    // recieved pocket auth callback
    if (this.requestToken) {
      console.log("found requestToken in LS");
      this.http.post("/v3/oauth/authorize", {
        "consumer_key": this.consumerKey,
        "code": this.requestToken
      }, this.options).subscribe(
        (res) => {
          console.log(res.json());
          this.username = res.json().username;
          this.accessToken = res.json().access_token;
          localStorage.setItem("pocket-accessToken", this.accessToken)
          localStorage.setItem("pocket-username", this.username)
        },
        (err) => {
          console.log("error while authorizing");
          localStorage.removeItem("pocket-requestToken")
        }
      )
    } else {
      this.http.post("/v3/oauth/request", {
        "consumer_key": this.consumerKey,
        "redirect_uri": "localhost:4200"
      }, this.options).subscribe((res: any) => {
          console.log(res.json());

          if (!res.json().access_token) {
            this.requestToken = res.json().code;
            localStorage.setItem("pocket-requestToken", this.requestToken);
            console.log("requestToken", this.requestToken);

            location.href = "https://getpocket.com/auth/authorize?request_token=" + this.requestToken + "&redirect_uri=https://localhost:4200"
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
    this.tags = [];
    this.http.post("/v3/get", {
      "consumer_key": this.consumerKey,
      "access_token": this.accessToken,
      "detailType": "complete",
      "state": "all",
      // "count": 10
    }).subscribe((res) => {
      // console.log(res.json().since); // date of last list all request
      let json = res.json().list;

      for (let item in json) {
        json[item].customTags = [];

        for (let tag in json[item].tags) {
          json[item].customTags.push(tag);
          if (!this.tags.includes(tag)) {
            //{name: tag, count: json[item].tags[tag]}
            this.tags.push(tag)
          }
        }

        this.list.push(json[item]);
      }

      this.tagCount = this.tags.map((tag) => {
        return {name: tag, count: _.filter(this.list, item => item.customTags.includes(tag)).length}
      });

      this.tagCount = _.orderBy(this.tagCount, ['count'], ['desc']);

      // todo fix semantics of tags and tagCount (tags not really needed)
      console.log(this.tagCount);

      this.filteredList = this.list;
      console.log(this.filteredList);
      localStorage.setItem("pocket-tags", JSON.stringify(this.tagCount));
      localStorage.setItem("pocket-list", JSON.stringify(this.list));
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
}
