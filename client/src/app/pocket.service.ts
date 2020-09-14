import {Injectable} from '@angular/core';
import {PocketItem, Tag} from "../common/interfaces";
import {HttpClient} from "@angular/common/http";
import {environment} from "../environments/environment";
import * as _ from "lodash";
import {NotificationService} from "./notification.service";
import {StorageService} from "./storage.service";
import {Item} from "../common/Item";

@Injectable({
  providedIn: 'root'
})
export class PocketService {
  // auth stuff
  private accessToken: string;
  private consumerKey = "71520-12304220fa8fcbd039b9be34";
  private headers = {
    "Content-Type": "application/json",
    "X-Accept": "application/json"
  };
  private requestToken: string;

  // data stuff
  username: string;
  lastUpdateTime: number;

  constructor(
    private httpClient: HttpClient,
    private storage: StorageService,
    private msg: NotificationService
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

    if (!this.storage.list || this.storage.list.length === 0) {
      this.loadAllItems(true);
    } else {
      this.loadAllItems(false);
    }
  }

  addTags(itemId: string, tags: string[]) {
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
        },
        err => {
          console.error(err.json())
        }
      )
  }

  removeTags(itemId: string, tags: string[]) {
    // todo if new tag add to this.tags and recount items
    console.log("removing tags", tags.toString());
    const body = {
      "consumer_key": this.consumerKey,
      "access_token": this.accessToken,
      actions: [{
        action: "tags_remove",
        item_id: itemId,
        tags: tags.toString(),
        time: Date.now() - 1000
      }]
    };

    this.httpClient.post(environment.pocketApiUrl + "v3/send", body)
      .subscribe(
        res => {
          // todo remove tags from local copy
        },
        err => {
          console.error(err.json())
        }
      )
  }


  deleteItem(itemId: string) {
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
        },
        err => {
          console.error(err.json())
        }
      )
  }

  archiveItem(itemId: string) {
    const body = {
      "consumer_key": this.consumerKey,
      "access_token": this.accessToken,
      actions: [{
        action: "archive",
        item_id: itemId,
        time: Date.now() - 1000
      }]
    };
    this.httpClient.post(environment.pocketApiUrl + "v3/send", body)
      .subscribe(
        res => {
          // todo add tags to local copy
          this.deleteItemFromLocalDataCopy(itemId);
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
      this.msg.send("Authenticating with pocket");

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
      this.msg.send("Connecting to pocket");
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
    this.msg.send("Fetching all items from pocket");
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
      delete body.since;
    }

    this.httpClient.post<any>(environment.pocketApiUrl + "v3/get", body, {headers: this.headers})
      .subscribe((res) => {
        this.lastUpdateTime = res.since;
        localStorage.setItem("pocket-lastUpdateTime", JSON.stringify(this.lastUpdateTime));
        // extract and count tags
        if (!forceUpdate && res.list.length === 0) {
          // no new data
          return
        }
        this.extractDataFromReponse(res.list, forceUpdate);
        console.log("loading all data done");
      })
  }

  private extractDataFromReponse(input: any, forceUpdate: boolean) {
    // get tag list from all items
    this.msg.send("Extracting metadata");

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
      this.storage.tags = tagsWithCount;
      this.storage.list = list;
    }

    this.storage.tags = _.orderBy(this.storage.tags, ["count"], ["desc"]);
    this.storage.list = _.orderBy(this.storage.list, ["time_added"], ["desc"]);
    this.storage.filteredList = this.storage.list;
  }

  private mergePartialData(inputList: Item[], inputTags: Tag[]) {
    console.log("merging items", inputList);
    inputList.forEach((item) => {
      const index = _.findIndex(this.storage.list, existing => existing.item_id === item.item_id);

      if (parseInt(item.status) === 2) {
        if (this.storage.list[index] && this.storage.list[index].item_id === item.item_id) {
          this.deleteItemFromLocalDataCopy(item.item_id);
        } else {
          console.warn("unknown error case when deleting item with index", index, this.storage.list[index]);
        }
      } else if (index >= 0) {
        this.storage.list[index] = item;
      } else {
        this.storage.list.push(item)
      }
    });

    inputTags.forEach((tag) => {
      const index = _.findIndex(this.storage.tags, existing => existing.name === tag.name);
      if (index >= 0) {
        this.storage.tags[index] = {
          name: tag.name,
          count: _.filter(this.storage.list, item => item.customTags.includes(tag.name)).length
        }
      } else {
        this.storage.tags.push({
          name: tag.name,
          count: _.filter(this.storage.list, item => item.customTags.includes(tag.name)).length
        });
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

  private deleteItemFromLocalDataCopy(itemId: string) {
    const index = _.findIndex(this.storage.list, existing => existing.item_id === itemId);
    console.log("deleting item with index", index, this.storage.list[index]);

    this.storage.list[index].customTags.forEach((tagName) => {
      const tag = _.find(this.storage.tags, tag => tag.name === tagName);
      const index = _.findIndex(this.storage.tags, tag);
      if (tag.count === 1) {
        this.storage.tags.splice(index, 1);
      } else {
        this.storage.tags[index].count = tag.count - 1;
      }
    });

    this.storage.list.splice(index, 1);
  }
}
