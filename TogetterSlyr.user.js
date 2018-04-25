// ==UserScript==
// @name        TogetterSlyr
// @namespace   https://github.com/rizenback000/TogetterSlyr
// @include     https://togetter.com/li/*
// @version     1.1.0
// @description togetterのニンジャスレイヤーまとめを読みやすくする
// @author      rizenback000
// @require     https://rawgit.com/tuupola/jquery_lazyload/2.x/lazyload.js
// @grant       none
// ==/UserScript==

/*
The MIT License (MIT)

Copyright (c) 2015 bpyamasinn.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

(function() {
  'use strict';

  /**
   * Togetter全般のユーティリティ
   */
  class TogetterUtil {
    constructor() {}

    /**
     * getTweetList - 表示中の全ツイートリストの取得
     *
     * @param  {boolean} clone trueでコピーを作成
     * @param  {Element=} body 探索するElementを指定する
     * @return {nodeList|Element[]}  cloneがfalseならnodeList、trueならElement配列
     */
    getTweetList(clone, body) {
      if (typeof clone === 'undefined') clone = false;
      if (typeof body === 'undefined') body = document;

      const tweets = body.querySelectorAll('.list_box.type_tweet');
      if (clone) {
        const arr = [];
        for (let i = 0, ll = tweets.length; i !== ll; arr.push(tweets[i++].cloneNode(true)));
        return arr;
      }
      return body.querySelectorAll('.list_box.type_tweet');
    }


    /**
     * getPagination - ページネーション取得(下部にあるほう)
     * 備忘:Togetterの2ページ目以降はページネーションが上にも出るが、常に下を取る
     * @param  {Element=} body 探索するElementを指定する
     * @return {Element}      ページネーション
     */
    getPagination(body) {
      if (typeof body === 'undefined') body = document;
      return body.querySelector('.tweet_box .pagenation');
    }


    /**
     * getMaxPage - 最大ページ数を取得
     *
     * @param  {Element=} body 探索するElementを指定
     * @return {number}      最大ページ数
     */
    getMaxPage(body) {
      // 備忘: togetterは2ページでも[次へ]があるので、ページネーションの最初から
      // [次へ]が見つかるまで走査していけば最後のページ数が見つかる
      if (typeof body === 'undefined') body = document;
      let page = this.getPagination(body).getElementsByTagName('a')[0];
      while (page !== null) {
        if (page.nextElementSibling.textContent === '次へ') break;
        page = page.nextElementSibling;
      }
      return Number(page.textContent);
    }


    /**
     * getNowPage - 現在のページが何ページ目かを取得
     *
     * @param  {Element=} body 探索するElementを指定
     * @return {number}      現在のページ
     */
    getNowPage(body) {
      if (typeof body === 'undefined') body = document;
      return Number(this.getPagination(body).querySelector('.current').textContent);
    }


    /**
     * getNextPageUrl - 次ページのURLを取得
     *
     * @param  {ELement=} body 探索するElementを指定
     * @return {string}      次ページのURL
     */
    getNextPageUrl(body) {
      if (typeof body === 'undefined') body = document;
      return this.getPagination(body).querySelector('a[rel=next]').href;
    }


    /**
     * loadPages - 現在のページから全ページ読み込み
     *
     * @param  {number=} maxPage description
     * @param  {number=} tgtPage description
     * @param  {string=} tgtUrl  description
     * @return {void}         description
     */
    loadPages(maxPage, tgtPage, tgtUrl) {
      const self = this;
      const xhr = new XMLHttpRequest();
      if (typeof maxPage === 'undefined') maxPage = self.getMaxPage();
      if (typeof tgtPage === 'undefined') tgtPage = self.getNowPage();
      if (typeof tgtUrl === 'undefined') tgtUrl = self.getNextPageUrl();

      let nextPageUrl = self.getNextPageUrl();
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            const resTweets = xhr.response.querySelectorAll('.tweet_box ul');
            const pagination = self.getPagination();
            // ページネーションの直後に追加(末尾のulに追加)
            Array.from(resTweets, (ul) => {
              pagination.parentNode.insertBefore(ul, pagination);
            });
            tgtPage++;
            console.log('complete now='+tgtPage+', maxPage='+maxPage+' url='+tgtUrl);

            if (tgtPage < maxPage) {
              // 次ページURL取得
              try {
                nextPageUrl = self.getNextPageUrl(xhr.response);
              } catch (e) {
                self.setStatusText('次のURLの読み込み失敗('+e.message+')');
                return;
              }
              // 申し訳程度の負荷分散
              // できればautopagerizeのようにしたいけどアイディアが無いのでとりあえず全読み込み
              const delayMin = 1; //秒指定
              const delayMax = 5;
              const delay = (Math.floor( Math.random() * (delayMax + 1 - delayMin) ) + delayMin) * 1000;
              setTimeout( () => self.loadPages(maxPage, tgtPage, nextPageUrl), delay);
            } else {
              self.addEventNinja();
              self.setStatusText('全ページ読み込み完了');
              console.log('loadend');
            }
          }
        }
        // console.log('readyState'+xhr.readyState+' status='+xhr.status);
      };

      // console.log('try now='+tgtPage+', maxPage='+maxPage+' url='+tgtUrl);
      self.setStatusText(tgtPage+' ページ目読み込み中...(残り:'+(maxPage-tgtPage)+'ページ)');
      xhr.open('GET', tgtUrl, true);
      xhr.responseType = 'document';
      xhr.send();
    }
  }


  /**
   * モーダルウィンドウ管理
   * 参考: https://syncer.jp/jquery-modal-window
   */
  class ModalWindow {
    constructor() {
      const self = this;

      this.lazy = null;

      this.modalOverlay_ = document.createElement('div');
      this.modalContents_ = document.createElement('div');
      this.modalHeader_ = document.createElement('div');
      this.modalContentsMain_ = document.createElement('div');

      this.modalContents_.id = 'modalContent';
      this.modalHeader_.id = 'modalHeader';
      this.modalContentsMain_.id = 'modalContentsMain';
      this.modalOverlay_.id = 'modelOverlay';

      this.modalContents_.style.width = '50%';
      this.modalContents_.style.height = '80%';
      this.modalContents_.style.margin = '1.5em auto 0';
      this.modalContents_.style.padding = '10px 20px';
      this.modalContents_.style.border = '2px solid #aaa';
      this.modalContents_.style.zIndex = '2';
      this.modalContents_.style.position = 'fixed';
      this.modalContents_.style.backgroundColor = '#fff';
      this.modalContents_.style.overflow = 'hidden';
      this.modalContents_.style.display = 'none';
      this.modalContents_.style.flexDirection = 'column';

      this.modalHeader_.style.borderBottom = '1px solid #aaa';
      this.modalContentsMain_.style.overflowY = 'auto';

      this.modalOverlay_.style.zIndex = '2';
      this.modalOverlay_.style.display = 'none';
      this.modalOverlay_.style.position = 'fixed';
      this.modalOverlay_.style.top = '0';
      this.modalOverlay_.style.left = '0';
      this.modalOverlay_.style.width = '100%';
      this.modalOverlay_.style.height = '120%';
      this.modalOverlay_.style.backgroundColor = 'rgba(0,0,0,0.750)';

      this.modalOverlay_.addEventListener('click', function(e) {
        self.hide();
      });

      document.body.appendChild(this.modalOverlay_);
      document.body.appendChild(this.modalContents_);
      this.modalContents_.appendChild(this.modalHeader_);
      this.modalContents_.appendChild(this.modalContentsMain_);

      let queue = null;
      window.addEventListener('resize', function() {
        clearTimeout(queue);
        queue = setTimeout( ()=> self.centeringModalSyncer(), 300);
      });
    }


    /**
     * show - モーダルを表示する
     *
     * @param  {Element} baseTweet リアクションツイートのベースとなるツイート
     * @return {void}
     */
    show(baseTweet) {
      // console.log('show');

      this.hide();
      const ul = document.createElement('ul');
      const liFragment = document.createDocumentFragment();
      const tweetsArr = NinjaManager.getReactTweets(baseTweet);

      tweetsArr.forEach(function(item) {
        liFragment.appendChild(item);
      });
      ul.appendChild(liFragment);

      const ulHeader = document.createElement('ul');
      ulHeader.appendChild(baseTweet.cloneNode(true));
      this.modalHeader_.append(ulHeader);

      this.modalContentsMain_.innerHTML = '';
      this.modalContentsMain_.appendChild(ul);
      this.modalContentsMain_.scrollTop = 0;

      this.modalContents_.style.display = 'flex';
      this.modalOverlay_.style.display = 'block';
      this.centeringModalSyncer();
      this.lazySet();
    }


    /**
     * hide - モーダルを非表示にする
     *
     * @return {void}
     */
    hide() {
      this.modalContents_.style.display = 'none';
      this.modalOverlay_.style.display = 'none';
      this.lazyDestroy();
    }


    /**
     * centeringModalSyncer - センタリングをする関数
     * 参考: https://syncer.jp/jquery-modal-window
     * @return {void}
     */
    centeringModalSyncer() {
      const w = window.document.documentElement.clientWidth;
      const h = window.document.documentElement.clientHeight;
      const cw = this.modalContents_.offsetWidth;
      const ch = this.modalContents_.offsetHeight;
      const pxleft = ((w - cw) / 2);
      const pxtop = ((h - ch) / 2);

      this.modalContents_.style.left = pxleft + 'px';
      this.modalContents_.style.top = pxtop + 'px';


    }


    /**
     * lazySet - togetterのlazyloadを動かせないので独自で動かす
     * 既に存在しない画像の場合、togetter公式ではエラー画像に差し替わるが
     * こちらはプラグインの仕様上できない。対応できそうならいつかやる。
     *
     * @return {void}
     */
    lazySet() {
      // console.log('lazySet');
      const opt = {
        selector: 'lazy',
        src: 'data-lazy-src',
      };
      const images = document.querySelectorAll('#modalContent .lazy');
      this.lazy = lazyload(images, opt);
    }


    /**
     * lazyDestroy - 独自lazyloadを破棄
     *
     * @return {void}
     */
    lazyDestroy() {
      // console.log('lazyDestroy');
      // 本当に効いてるかどうかわからんけどやらんよりマシ？
      if ( this.lazy !== null) this.lazy.destroy();
    }
  }


  /**
   * ニンジャスレイヤー実況管理
   */
  class NinjaManager extends TogetterUtil {
    constructor() {
      super();
      const self = this;

      // 実況まとめなのかを判断する
      const tweets = this.getTweetList();
      const nijaSoul = [].slice.call(tweets).some((tweet)=>NinjaManager.isNinja(tweet));
      if (nijaSoul === false) return;

      // リアクション表示モーダルウィンドウ
      this.reactModal_ = new ModalWindow();
      // ステータステキスト
      this.statusDiv_ = document.createElement('div');
      // 全ページ読み込みボタン
      this.loadBtn_ = document.createElement('button');
      this.loadBtn_.textContent = '全ページ読み';
      this.loadBtn_.style.width = '100%';
      this.loadBtn_.addEventListener('click', function(e) {
        self.loadBtn_.style.display = 'none';
        document.getElementsByClassName('contents_main')[0].style.display = 'none';
        self.loadPages();
        document.getElementsByClassName('contents_main')[0].style.display = 'block';
      });
      document.getElementsByClassName('title_box')[0].append(this.loadBtn_);
      document.getElementsByClassName('title_box')[0].append(this.statusDiv_);

      // 続きを読むがあればクリック
      const readMore = document.querySelector('.more_tweet_box .btn');
      if (readMore !== null) readMore.click();
    }


    /**
     * setStatusText - ステータステキストの設定
     *
     * @param  {string} text 任意のステータステキスト
     * @return {void}
     */
    setStatusText(text) {
      this.statusDiv_.textContent = text;
    }


    /**
     * addEventNinja - 公式ツイートクリック時にイベントを開く
     *
     * @return {void}
     */
    addEventNinja() {
      const self = this;
      const tweetList = this.getTweetList();
      Array.from(tweetList, (tweet, i) => {
        if (NinjaManager.isNinja(tweet)) {
          // 公式ツイートクリック時に反応ツイートのモーダルを表示させる
          const tweetBox = tweet.querySelector('.tweet_wrap');
          tweetBox.style.cursor = 'pointer';
          tweetBox.addEventListener('click', (e) => {
            const baseTweet = e.target.closest('.list_box.type_tweet');
            self.reactModal_.show(baseTweet);
          });
        } else {
          tweet.style.display = 'none';
        }
      });
    }


    /**
     * getReactTweets - 公式ツイートの反応ツイートを抜き出す
     *
     * @param  {Element} officialTweet 反応ツイートの基準となる公式ツイート
     * @return {Element[]}               配列に格納された反応ツイート
     */
    static getReactTweets(officialTweet) {
      // console.log('getReactTweets');
      const reactTweets = [];
      let nextTweet = officialTweet.nextElementSibling;
      while (nextTweet !== null) {
        // 次の公式ツイートが出てきたら停止
        if ( NinjaManager.isNinja(nextTweet) ) break;
        const cloneTweet = nextTweet.cloneNode(true);
        cloneTweet.style.display = 'block';
        reactTweets.push(cloneTweet);
        // liの最後まで到達したらnullが返ってくるので次のulに進む
        if (nextTweet.nextElementSibling === null) {
          nextTweet = nextTweet.parentElement.nextElementSibling;
          if (nextTweet.tagName !== 'UL') break;
          nextTweet = nextTweet.children[0];
        } else {
          nextTweet = nextTweet.nextElementSibling;
        }
      }
      return reactTweets;
    }


    /**
     * isNinja - ニンジャソウル検知
     *
     * @param  {Element} tweet .user_linkを含むElement
     * @return {boolean}       ニンジャならtrue,それ以外はfalse
     */
    static isNinja(tweet) {
      const userLink = tweet.querySelector('.user_link[href="https://twitter.com/NJSLYR"]');
      return userLink !== null;
    }
  }

  const nsm = new NinjaManager();
})();
