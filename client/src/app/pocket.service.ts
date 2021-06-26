import {Injectable} from "@angular/core";
import {PocketAuthorizeResponse, PocketConfig, PocketItem, PocketItemResponse, Tag} from "../common/interfaces";
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
    this.storage.deleteItemFromLocalDataCopy(itemId);
  }

  async archiveItem(itemId: string) {
    await this.httpSendPocketAction([{
        action: "archive",
        item_id: itemId,
        time: Date.now() - 1000
      }]
    )
    // todo add tags to local copy
    this.storage.deleteItemFromLocalDataCopy(itemId);
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
      "sort": "newest",
      "since": this.config.lastUpdateTime
      // "count": 10
    };

    if (forceUpdate) {
      delete body.since;
    }

    const res = await this.httpClient.post<PocketItemResponse>(this.config.apiUrl + "v3/get", body, {headers: this.config.headers}).pipe(take(1)).toPromise()

    this.config.lastUpdateTime = res.since;
    this.storage.setPocketConfig(this.config)
    const extracted = this.extractDataFromReponse(res.list);
    this.storage.importData(forceUpdate, extracted.list, extracted.tags)
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

  private extractDataFromReponse(input: { [key: string]: PocketItem }): { list: Item[]; tags: string[] } {
    // get tag list from all items
    this.msg.send("Extracting metadata");
    console.log("Extracting metadata", input);

    return this.convertToItemsAndTags(input);
  }

  // remove not needed properties form pocket items for storage reasons and get list of all tags
  convertToItemsAndTags(input: { [key: string]: PocketItem }): { list: Item[]; tags: string[] } {
    const list: Item[] = [];
    const tags: string[] = [];

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
    console.log(tags);
    return {list: list, tags: tags};
  }

  private async getAccessToken() {
    try {
      this.msg.send("Authenticating with pocket");

      const res = await this.httpClient.post<PocketAuthorizeResponse>(this.config.apiUrl + "v3/oauth/authorize", {
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
