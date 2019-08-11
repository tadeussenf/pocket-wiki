import {Injectable} from "@angular/core";
import {Tag} from "../common/interfaces";
import * as _ from "lodash";
import {environment} from "../environments/environment";
import {ReplaySubject} from "rxjs";
import {Item} from "../common/Item";
import {HttpClient} from "@angular/common/http";

@Injectable()
export class PocketService {
  // auth stuff
  private accessToken: any;
  private consumerKey = "71520-12304220fa8fcbd039b9be34";
  private headers = {
    "Content-Type": "application/json",
    "X-Accept": "application/json"
  };
  private requestToken: string;

  // data stuff
  username: string;
  lastUpdateTime: number;
  list: Item[] = [];
  filteredList: Item[];
  tags: Tag[] = [];
  private refreshDataInterval = 60; // minutes

  // observable stuff
  item$ = new ReplaySubject(1);
  tag$ = new ReplaySubject(1);
  loadingMessageSub = new ReplaySubject(1);

  constructor(
    private httpClient: HttpClient
  ) {
    this.lastUpdateTime = parseInt(localStorage.getItem("pocket-lastUpdateTime"));
    this.username = localStorage.getItem("pocket-username");
    this.accessToken = localStorage.getItem("pocket-accessToken");

    // not authenticated
    if (!this.accessToken || !this.username) {
      // todo delete data or inform user that pocket auth has been lost
      this.authenticateWithPocket();
      return;
    }

    this.tags = JSON.parse(localStorage.getItem("pocket-tags"));
    this.list = JSON.parse(localStorage.getItem("pocket-list"));

    if (!this.list || this.list.length < 1 || !this.tags || this.tags.length < 1) {
      this.loadAllItems(true);
      return;
    } else {
      this.loadAllItems(false);
    }

    this.filteredList = this.list;
    this.item$.next(this.filteredList);
    this.tag$.next(this.tags);
  }

  addTags(itemId: number, tags: string[]) {
    // todo if new tag add to this.tags and recount items
    console.log("adding tags", tags.toString());
    const body = {
      "consumer_key": this.consumerKey,
      "access_token": this.accessToken,
      actions: [{
        action: "tags_replace",
        item_id: itemId,
        tags: tags.toString(),
        time: Date.now() - 1000
      }]
    };

    this.httpClient.post(environment.pocketApiUrl + "v3/send", body)
      .subscribe(
        res => {
          // todo add tags to local copy
          this.saveAllDataToLocalStorage();
        },
        err => {
          console.error(err.json())
        }
      )
  }

  deleteItem(itemId) {
    const body = {
      "consumer_key": this.consumerKey,
      "access_token": this.accessToken,
      actions: [{
        action: "delete",
        item_id: itemId,
        time: Date.now() - 1000
      }]
    };
    this.httpClient.post(environment.pocketApiUrl + "v3/send", body)
      .subscribe(
        res => {
          // todo add tags to local copy
          this.deleteItemFromLocalDataCopy(itemId);
          this.saveAllDataToLocalStorage();
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
      this.httpClient.post<any>(environment.pocketApiUrl + "v3/oauth/authorize", {
        "consumer_key": this.consumerKey,
        "code": this.requestToken
      }, {headers: this.headers}).subscribe(
        (res) => {
          this.username = res.username;
          this.accessToken = res.access_token;
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
      this.httpClient.post(environment.pocketApiUrl + "v3/oauth/request", {
        "consumer_key": this.consumerKey,
        "redirect_uri": environment.redirectUrl
      }).subscribe((res: any) => {
          if (!res.access_token) {
            this.requestToken = res.code;
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
    console.log("loading data, force:", forceUpdate);

    const body = {
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

    this.httpClient.post<any>(environment.pocketApiUrl + "v3/get", body, {headers: this.headers})
      .subscribe((res) => {
        this.lastUpdateTime = res.since;

        // extract and count tags
        this.extractDataFromReponse(res.list, forceUpdate);

        localStorage.setItem("pocket-lastUpdateTime", JSON.stringify(this.lastUpdateTime));
        this.saveAllDataToLocalStorage();
        console.log("loading all data done");

        this.item$.next(this.filteredList);
        this.tag$.next(this.tags);
      })
  }

  showItemsForTag(tag: string) {
    console.log("showItemsForTag", tag);
    this.filteredList = _.filter(this.list, (item: Item) => {
      return item.customTags.includes(tag);
    });

    console.log("emit filteredList", this.filteredList);
    this.item$.next(this.filteredList);
  }

  filterByDate(days: number) {
    console.log("filterByDate", days);
    if (days === 0) {
      this.filteredList = this.list;
    } else {
      const range = (Date.now() / 1000) - (days * 24 * 60 * 60);
      this.filteredList = _.filter(this.list, (item: Item) => {
        return parseInt(item.time_added) > range;
      })
    }

    console.log("emit filteredList", this.filteredList);
    this.item$.next(this.filteredList);
  }

  filterNoTags() {
    console.log("filterNoTags");
    this.filteredList = _.filter(this.list, (item: Item) => {
      return item.customTags.length === 0;
    });

    console.log("emit filteredList", this.filteredList);
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
    console.log("resetFilters");
    this.filteredList = this.list;
    this.item$.next(this.filteredList);
  }

  private saveAllDataToLocalStorage() {
    this.loadingMessageSub.next("Saving data to local storage");
    localStorage.setItem("pocket-tags", JSON.stringify(this.tags));
    localStorage.setItem("pocket-list", JSON.stringify(this.list));
  }

  private extractDataFromReponse(input: any, forceUpdate: boolean) {
    // get tag list from all items
    this.loadingMessageSub.next("Extracting metadata");

    const transfer = this.convertToItem(input);
    const list: Item[] = transfer.list;
    const tags: string[] = transfer.tags;

    // get item per tag count
    const tagsWithCount: Tag[] = tags.map((tag: string) => {
      return {name: tag, count: _.filter(list, item => item.customTags.includes(tag)).length}
    });

    if (!forceUpdate) {
      console.log("merging partial data");
      this.mergePartialData(list, tagsWithCount);
    } else {
      this.tags = tagsWithCount;
      this.list = list;
    }

    this.tags = _.orderBy(this.tags, ["count"], ["desc"]);
    this.list = _.orderBy(this.list, ["time_added"], ["desc"]);
    this.filteredList = this.list;
  }

  private mergePartialData(inputList: Item[], inputTags: Tag[]) {
    console.log("merging items", inputList);
    inputList.forEach((item) => {
      const index = _.findIndex(this.list, existing => existing.item_id === item.item_id);

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

    inputTags.forEach((tag) => {
      const index = _.findIndex(this.tags, existing => existing.name === tag.name);
      if (index >= 0) {
        this.tags[index] = {
          name: tag.name,
          count: _.filter(this.list, item => item.customTags.includes(tag.name)).length
        }
      } else {
        this.tags.push({name: tag.name, count: _.filter(this.list, item => item.customTags.includes(tag.name)).length});
      }
    });
  }

  // remove not needed properties form pocket items for storage reasons and get list of all tags
  convertToItem(input: any) {
    const list: Item[] = [];
    const tags = [];

    for (const pocketItem in input) {
      const item = new Item(
        input[pocketItem].item_id,
        input[pocketItem].time_added,
        input[pocketItem].status,
        input[pocketItem].given_url,
        input[pocketItem].given_title,
        input[pocketItem].resolved_title,
        input[pocketItem].excerpt,
        new Array(0)
      );

      for (const tag in input[pocketItem].tags) {
        item.customTags.push(tag);
        if (tags.indexOf(tag) < 0) { // does not exist
          tags.push(tag)
        }
      }

      list.push(item);
    }

    return {list: list, tags: tags};
  }

  getLoadingMessageSub() {
    return this.loadingMessageSub;
  }

  private deleteItemFromLocalDataCopy(itemId: string) {
    const index = _.findIndex(this.list, existing => existing.item_id === itemId);
    console.log("deleting item with index", index, this.list[index]);

    this.list[index].customTags.forEach((tagName) => {
      const tag = _.find(this.tags, tag => tag.name === tagName);
      const index = _.findIndex(this.tags, tag);
      if (tag.count === 1) {
        this.tags.splice(index, 1);
      } else {
        this.tags[index].count = tag.count - 1;
      }
    });

    this.list.splice(index, 1);
  }
}
