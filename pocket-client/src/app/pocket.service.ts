import {Injectable} from '@angular/core';
import {Item, Tag} from "../common/interfaces";
import {Headers, Http, RequestOptionsArgs} from "@angular/http";
import * as _ from 'lodash';
import {environment} from "../environments/environment";
import {ReplaySubject} from "rxjs/ReplaySubject";

@Injectable()
export class PocketService {
  // auth stuff
  private accessToken: any;
  private consumerKey = "71520-12304220fa8fcbd039b9be34";
  private headers: Headers = new Headers({
    'Content-Type': 'application/json',
    'X-Accept': 'application/json'
  });
  private options: RequestOptionsArgs = {'headers': this.headers};
  private requestToken: string;

  // data stuff
  username: string;
  lastUpdateTime: number;
  list: Item[] = [];
  filteredList: Item[];
  tags: Tag[] = [];
  private refreshDataInterval: number = 60; // minutes

  // observable stuff
  item$ = new ReplaySubject(1);
  tag$ = new ReplaySubject(1);
  loadingMessageSub = new ReplaySubject(1);

  constructor(private http: Http) {
    console.log("init service");
    console.log(environment);

    this.lastUpdateTime = parseInt(localStorage.getItem("pocket-lastUpdateTime"));
    this.username = localStorage.getItem("pocket-username");
    this.accessToken = localStorage.getItem("pocket-accessToken");

    // not authenticated
    if (!this.accessToken || !this.username) {
      // todo delete data or inform user that pocket auth has been lost
      this.authenticateWithPocket();
      return;
    }
    // else if (this.dataOutdated()) {
    //   this.loadAllItems(false);
    //   return;
    // }

    this.tags = JSON.parse(localStorage.getItem("pocket-tags"));
    this.list = JSON.parse(localStorage.getItem("pocket-list"));

    // todo if !lastUpdateTime
    if (this.dataOutdated() || !this.list || this.list.length < 1 || !this.tags || this.tags.length < 1) {
      this.loadAllItems(true);
      return;
    }

    console.log("sorting all items");
    this.filteredList = this.list;
    console.log(this.filteredList);
    this.item$.next(this.filteredList);
    this.tag$.next(this.tags);
  }

  addTags(itemId: number, tags: string[]) {
    // todo if new tag add to this.tags and recount items
    console.log("adding tags", tags.toString());
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

    this.http.post(environment.pocketApiUrl + "v3/send", body, this.options)
      .subscribe(
        res => {
          // todo add tags to local copy
          this.saveAllDataToLocalStorage();
          console.log(res.json());
        },
        err => {
          console.error(err.json())
        }
      )
  }

  deleteItem(itemId) {
    let body = {
      "consumer_key": this.consumerKey,
      "access_token": this.accessToken,
      actions: [{
        action: "delete",
        item_id: itemId,
        time: Date.now() - 1000
      }]
    };
    this.http.post(environment.pocketApiUrl + "v3/send", body, this.options)
      .subscribe(
        res => {
          // todo add tags to local copy
          this.deleteItemFromLocalDataCopy(itemId);
          this.saveAllDataToLocalStorage();
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
      // todo: getAccessToken()
      this.loadingMessageSub.next("Authenticating with pocket");
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
          localStorage.setItem("pocket-username", this.username);
          this.loadAllItems(true);
        },
        (err) => {
          console.log("error while authorizing");
          localStorage.removeItem("pocket-requestToken")
        }
      )
    } else {
      // todo: getRequestToken()
      this.loadingMessageSub.next("Connecting to pocket");
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

  public loadAllItems(forceUpdate: boolean) {
    this.loadingMessageSub.next("Fetching all items from pocket");
    console.log("loading all data, force:", forceUpdate);

    let body = {
      "consumer_key": this.consumerKey,
      "access_token": this.accessToken,
      "detailType": "complete",
      "state": "all",
      "since": this.lastUpdateTime
      // "count": 10
    };

    if (forceUpdate) {
      this.list = [];
      delete body.since;
    }

    this.http.post(environment.pocketApiUrl + "v3/get", body)
      .subscribe((res) => {
        let response = res.json();
        this.lastUpdateTime = response.since;

        // extract and count tags
        this.extractDataFromReponse(response.list, forceUpdate);

        localStorage.setItem("pocket-lastUpdateTime", JSON.stringify(this.lastUpdateTime));
        this.saveAllDataToLocalStorage();
        console.log("loading all data done");

        this.item$.next(this.filteredList);
        this.tag$.next(this.tags);
      })
  }

  showItemsForTag(tag: string) {
    console.log("showItemsForTag");
    this.filteredList = _.filter(this.list, (item) => {
      return item.customTags.includes(tag);
    });

    console.log(this.filteredList);
    this.item$.next(this.filteredList);
  }

  filterByDate(days: number) {
    console.log("filterByDate");
    if (days === 0) {
      this.filteredList = this.list;
    } else {
      let range = (Date.now() / 1000) - (days * 24 * 60 * 60);
      this.filteredList = _.filter(this.list, (item) => {
        return parseInt(item.time_added) > range;
      })
    }
    this.item$.next(this.filteredList);
  }

  filterNoTags() {
    console.log("filterNoTags");
    this.filteredList = _.filter(this.list, (item) => {
      return item.customTags.length === 0;
    });
    this.item$.next(this.filteredList);
  }

  simpleDrop($event: Event) {
    console.log($event);
  }

  getItemsSub() {
    return this.item$;
  }

  getTagSub() {
    return this.tag$;
  }

  resetFilter() {
    console.log("resetFilter");
    this.filteredList = this.list;
    this.item$.next(this.filteredList);
  }

  private dataOutdated(): boolean {
    let boolean = this.lastUpdateTime < (Date.now() / 1000) - (60 * this.refreshDataInterval);
    console.log("Data outdated: " + boolean);
    return boolean // if last time update was more than 5 min ago
  }

  private saveAllDataToLocalStorage() {
    console.log("saveAllDataToLocalStorage");
    this.loadingMessageSub.next("Saving data to local storage");
    localStorage.setItem("pocket-tags", JSON.stringify(this.tags));
    localStorage.setItem("pocket-list", JSON.stringify(this.list));
  }

  private extractDataFromReponse(input: Item[], forceUpdate: boolean) {
    // get tag list from all items
    this.loadingMessageSub.next("Extracting metadata");
    console.log("extractDataFromReponse");

    let transfer = this.addCustomTagsToItems(input);
    let list: Item[] = transfer.list;
    let tags: string[] = transfer.tags;

    // get item per tag count
    let tagsWithCount: Tag[] = tags.map((tag: string) => {
      return {name: tag, count: _.filter(list, item => item.customTags.includes(tag)).length}
    });

    if (!forceUpdate) {
      console.log("merging partial data");
      this.mergePartialData(list, tagsWithCount);
    } else {
      console.log("replace data");
      this.tags = tagsWithCount;
      this.list = list;
    }

    console.log("sorting tags");
    this.tags = _.orderBy(this.tags, ['count'], ['desc']);
    console.log("sorting items");
    this.list = _.orderBy(this.list, ['time_added'], ['desc']);
    this.filteredList = this.list;

    console.log(this.tags);
    console.log(this.list);
    console.log(this.filteredList);
  }

  private mergePartialData(inputList: Item[], inputTags: Tag[]) {
    console.log("merging items", inputList);
    inputList.forEach((item) => {
      let index = _.findIndex(this.list, existing => existing.item_id === item.item_id);

      if (parseInt(item.status) === 2) {
        if (this.list[index] && this.list[index].item_id === item.item_id) {
          this.deleteItemFromLocalDataCopy(item.item_id);
        } else {
          console.warn("unknown error case when deleting item with index", index, this.list[index]);
        }
      } else if (index >= 0) {
        this.list[index] = item;
      } else {
        this.list.push(item)
      }
    });

    console.log("merging tags");
    inputTags.forEach((tag) => {
      let index = _.findIndex(this.tags, existing => existing.name === tag.name);
      if (index >= 0) {
        this.tags[index] = {
          name: tag.name,
          count: _.filter(this.list, item => item.customTags.includes(tag.name)).length
        }
      } else {
        this.tags.push({name: tag.name, count: _.filter(this.list, item => item.customTags.includes(tag.name)).length});
      }

      // todo support delete case for tags
    });
  }

  addCustomTagsToItems(input: Item[]) {
    let list: Item[] = [];
    let tags: string[] = [];
    for (let item in input) {
      input[item].customTags = [];

      for (let tag in input[item].tags) {
        input[item].customTags.push(tag);
        if (!tags.includes(tag)) {
          tags.push(tag)
        }
      }

      list.push(input[item]);
    }

    return {list: list, tags: tags};
  }

  getLoadingMessageSub() {
    return this.loadingMessageSub;
  }

  private deleteItemFromLocalDataCopy(itemId: string) {
    let index = _.findIndex(this.list, existing => existing.item_id === itemId);
    console.log("deleting item with index", index, this.list[index]);

    this.list[index].customTags.forEach((tagName) => {
      let tag = _.find(this.tags, tag => tag.name === tagName);
      let index = _.findIndex(this.tags, tag);
      if (tag.count === 1) {
        this.tags.splice(index, 1);
      } else {
        this.tags[index].count = tag.count - 1;
      }
    });

    this.list.splice(index, 1);
  }
}
