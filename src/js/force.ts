import { Articles, Article, QiitaOrigin } from "./articles";

const LookArticleCount = 5;

const f = async () => {
  const readArticles: Article[] = await Articles.getReadArticles();
  if (readArticles.length < LookArticleCount) {
    const parser = new URL(location.href);
    if (parser.origin != QiitaOrigin) {
      alert(
        "あなたが今日見たQiitaのトレンド記事は" +
          readArticles.length +
          "記事です。\n" +
          "あと" +
          (LookArticleCount - readArticles.length) +
          "記事読んでください。"
      );
      location.href = QiitaOrigin;
    } else {
      const articles = await Articles.getNotReadArticles();
      articles.forEach((article: Article) => {
        if (location.href.indexOf(article.node.uuid) != -1) {
          Articles.setReadArticle(article.node.uuid);
        }
      });
    }
  }
};
f();
