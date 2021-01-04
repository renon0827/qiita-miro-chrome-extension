import axios from "axios";
import cheerio = require("cheerio");
import { browser } from "webextension-polyfill-ts";

export const QiitaOrigin = "https://qiita.com";

class Node {
  constructor() {
    this.uuid = "";
  }
  public uuid: string;
}

export class Article {
  constructor() {
    this.node = new Node();
  }

  public node: Node;
}

export class Articles {
  constructor() {}

  /**
   * まだ読んでないQiitaのTrend記事の一覧を返す
   */
  public static async getNotReadArticles(): Promise<Article[]> {
    const out: Article[] = new Array(0);
    const readArticles: Article[] = await this.getReadArticles();
    const trendArticles = await Articles.getQiitaArticleOfTrend();

    if (trendArticles.length > 0) {
      trendArticles.forEach((trendArticle: Article) => {
        let flag: boolean = false;
        if (readArticles.length > 0) {
          readArticles.forEach((readArticle: Article) => {
            if (readArticle.node.uuid == trendArticle.node.uuid) {
              flag = true;
            }
          });
        }

        if (!flag) {
          out.push(trendArticle);
        }
      });
    }

    return out;
  }

  /**
   * 日付が更新されていた場合はローカルストレージを更新する
   */
  public static async updateLocalStrage() {
    const now = new Date();
    const localDate = (await browser.storage.local.get())["date"];

    const dateToString = function (date: Date) {
      var y = date.getFullYear();
      var m = ("00" + (date.getMonth() + 1)).slice(-2);
      var d = ("00" + date.getDate()).slice(-2);
      var result = y + "/" + m + "/" + d;
      return result;
    };

    if (dateToString(now) != (localDate as string)) {
      browser.storage.local.set({ articles: [], date: dateToString(now) });
    }
  }

  /**
   * もう読んだ記事の一覧を返す
   */
  public static async getReadArticles(): Promise<Article[]> {
    const out: Article[] = [];
    Articles.updateLocalStrage();

    const readArticles = await browser.storage.local.get();
    if (
      readArticles["articles"] != undefined &&
      readArticles["articles"].forEach != undefined
    ) {
      readArticles["articles"].forEach((article: Article) => {
        out.push(article);
      });
    }

    return out;
  }

  /**
   * 読んだ記事をセットする
   */
  public static async setReadArticle(articleUUID: string) {
    const articles: Article[] = await this.getReadArticles();

    articles.push({
      node: {
        uuid: articleUUID
      }
    });

    browser.storage.local.set({ articles: articles });
  }

  private static async getQiitaArticleOfTrend(): Promise<Article[]> {
    const url = QiitaOrigin + "/";

    axios.defaults.baseURL = "http://localhost:3000";
    axios.defaults.headers.post["Content-Type"] =
      "application/json;charset=utf-8";
    axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";
    return await axios
      .get(url)
      .then(({ data }) => {
        return this.fetchTrend(data);
      })
      .catch((err) => {
        return [];
      });
  }

  private static fetchTrend(html: string): Article[] {
    const $ = cheerio.load(html);
    const raw =
      $("script[data-component-name=HomeArticleTrendFeed]").html() ?? "";
    if (raw === undefined) return [];
    const rawData = JSON.parse(raw).trend.edges;

    return rawData.map((obj: any) => {
      delete obj.followingLikers;
      delete obj.isLikedByViewer;
      return obj;
    });
  }
}
