import {Injectable} from "@angular/core";
import {PocketConfig, PocketItem, Tag} from "../common/interfaces";
import {HttpClient} from "@angular/common/http";
import {environment} from "../environments/environment";
import {NotificationService} from "./notification.service";
import {StorageService} from "./storage.service";
import {Item} from "../common/Item";
import {take} from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class PocketService {
  private readonly config: PocketConfig;

  constructor(
    private httpClient: HttpClient,
    private storage: StorageService,
    private msg: NotificationService
  ) {
    this.config = this.storage.getPocketAuthData();
  }

  async addTags(itemId: string, tags: string[]) {
    // todo if new tag add to this.tags and recount items
    console.log("adding tags", tags.toString());
    await this.httpSendPocketAction([{
        action: "tags_replace",
        item_id: itemId,
        tags: tags.toString(),
        time: Date.now() - 1000
      }]
    )
  }

  async removeTags(itemId: string, tags: string[]) {
    // todo if new tag add to this.tags and recount items
    await this.httpSendPocketAction([{
        action: "tags_remove",
        item_id: itemId,
        tags: tags.toString(),
        time: Date.now() - 1000
      }]
    );
  }


  async deleteItem(itemId: string) {
    await this.httpSendPocketAction([{
      action: "delete",
      item_id: itemId,
      time: Date.now() - 1000
    }]);

    // todo add tags to local copy
    this.deleteItemFromLocalDataCopy(itemId);
  }

  async archiveItem(itemId: string) {
    await this.httpSendPocketAction([{
        action: "archive",
        item_id: itemId,
        time: Date.now() - 1000
      }]
    )
    // todo add tags to local copy
    this.deleteItemFromLocalDataCopy(itemId);
  }

  async authenticateWithPocket() {
    if (this.config.requestToken) {
      // received pocket auth callback
      await this.getAccessToken()
    } else {
      await this.getRequestToken()
    }
  }

  async loadAllItems(forceUpdate: boolean) {
    if (forceUpdate) {
      this.msg.send("Fetching all items from pocket");
    } else {
      this.msg.send("Fetching latest items from pocket");
    }
    console.log("loading data, force:", forceUpdate);

    const body = {
      "consumer_key": this.config.consumerKey,
      "access_token": this.config.accessToken,
      "detailType": "complete",
      "state": "all",
      "since": this.config.lastUpdateTime
      // "count": 10
    };

    if (forceUpdate) {
      delete body.since;
    }

    const res = await this.httpClient.post<any>(this.config.apiUrl + "v3/get", body, {headers: this.config.headers}).pipe(take(1)).toPromise()

    this.config.lastUpdateTime = res.since;
    this.storage.setPocketConfig(this.config)
    this.extractDataFromReponse(res.list, forceUpdate);
    console.log("refreshed data");
  }

  private async httpSendPocketAction(actions: any[]) {
    const body = {
      "consumer_key": this.config.consumerKey,
      "access_token": this.config.accessToken,
      actions: actions
    };

    return await this.httpClient.post(this.config.apiUrl + "v3/send", body).pipe(take(1)).toPromise()
  }

  private extractDataFromReponse(input: { [key: string]: PocketItem }, forceUpdate: boolean) {
    // get tag list from all items
    this.msg.send("Extracting metadata");
    console.log("Extracting metadata", input);

    const extracted = this.convertToItemsAndTags(input);
    const list: Item[] = extracted.list;
    const tags: string[] = extracted.tags;

    // get item per tag count
    const tagsWithCount: Tag[] = tags.map(tag => ({
      name: tag,
      count: list.filter(item => item.customTags.includes(tag)).length
    }));

    let tagsToSort: Tag[];
    let listToSort: Item[];
    if (!forceUpdate) {
      console.log("merging partial data");
      this.mergePartialData(list, tagsWithCount);
      tagsToSort = this.storage.tags;
      listToSort = this.storage.list;
    } else {
      tagsToSort = tagsWithCount;
      listToSort = list;
    }

    this.storage.tags = tagsToSort.sort((a, b) => b.count - a.count);
    this.storage.list = listToSort.sort((a, b) => parseInt(b.time_added) - parseInt(a.time_added));
    this.storage.filteredList = this.storage.list;
  }

  private mergePartialData(inputList: Item[], inputTags: Tag[]) {
    console.log("merging items", inputList);
    inputList.forEach((item) => {
      const index = this.storage.list.findIndex(existing => existing.item_id === item.item_id);

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
      const index = this.storage.tags.findIndex(existing => existing.name === tag.name);
      if (index >= 0) {
        this.storage.tags[index] = {
          name: tag.name,
          count: this.storage.list.filter(item => item.customTags.includes(tag.name)).length
        }
      } else {
        this.storage.tags.push({
          name: tag.name,
          count: this.storage.list.filter(item => item.customTags.includes(tag.name)).length
        });
      }
    });
  }

  // remove not needed properties form pocket items for storage reasons and get list of all tags
  convertToItemsAndTags(input: { [key: string]: PocketItem }) {
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
    const index = this.storage.list.findIndex(existing => existing.item_id === itemId);
    console.log("deleting item with index", index, this.storage.list[index]);

    this.storage.list[index].customTags.forEach((tagName) => {
      const tag = this.storage.tags.find(tag => tag.name === tagName);
      const index = this.storage.tags.findIndex(tag => tag.name === tagName);
      if (tag.count === 1) {
        this.storage.tags.splice(index, 1);
      } else {
        this.storage.tags[index].count = tag.count - 1;
      }
    });

    this.storage.list.splice(index, 1);
  }

  private async getAccessToken() {
    try {
      this.msg.send("Authenticating with pocket");

      const res = await this.httpClient.post<any>(this.config.apiUrl + "v3/oauth/authorize", {
        "consumer_key": this.config.consumerKey,
        "code": this.config.requestToken
      }, {headers: this.config.headers}).pipe(take(1)).toPromise()

      this.config.username = res.username;
      this.config.accessToken = res.access_token;
      this.storage.setPocketConfig(this.config);
      await this.loadAllItems(true);
    } catch (err) {
      console.log("error while authorizing", err);
      this.storage.removePocketConfig();
    }
  }

  private async getRequestToken() {
    try {
      this.msg.send("Connecting to pocket");

      const res: any = await this.httpClient.post(environment.pocketApiUrl + "v3/oauth/request", {
        "consumer_key": this.config.consumerKey,
        "redirect_uri": this.config.redirectUrl
      }).pipe(take(1)).toPromise();

      if (!res.access_token) {
        this.config.requestToken = res.code;
        this.storage.setPocketConfig(this.config);

        location.href = `https://getpocket.com/auth/authorize?request_token=${this.config.requestToken}&redirect_uri=${this.config.redirectUrl}`
      }
    } catch (err) {
      console.log("err", err);
    }
  }

  isAuthenticated(): boolean {
    return !!this.config.accessToken || !!this.config.username;
  }
}
