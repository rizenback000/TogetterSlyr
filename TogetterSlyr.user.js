// ==UserScript==
// @name        TogetterSlyr
// @namespace   https://github.com/rizenback000/TogetterSlyr
// @include     https://togetter.com/li/*
// @version     1.6.0
// @description togetterのニンジャスレイヤーまとめを読みやすくする
// @author      rizenback000
// @require     https://rawgit.com/tuupola/jquery_lazyload/2.x/lazyload.js
// @grant       GM_info
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
     * clickReadMore - 続きを読むをクリック
     *
     * @return {void}
     */
    clickReadMore() {
      const readMore = this.getReadMore();
      if (readMore !== null) readMore.click();
    }


    /**
     * getReadMore - 続きを読むを取得
     *
     * @return {Element}  続きを読む
     */
    getReadMore() {
      return document.querySelector('.more_tweet_box .btn');
    }

    /**
     * getTweetBox - 全ツイートリストの取得(親を含む)
     *
     * @param  {Element=} body  description
     * @return {Element=}       description
     */
    getTweetBox(clone, body) {
      if (typeof body === 'undefined') body = document;
      return body.querySelector('.tweet_box');
    }


    /**
     * getTweetList - 全ツイートリストの取得(親を含まない)
     *
     * @param  {boolean=} clone trueでコピーを作成
     * @param  {Element=} body 探索するElementを指定する
     * @param  {string=} selector セレクター
     * @return {nodeList|Element[]}  cloneがfalseならnodeList、trueならElement配列
     */
    getTweetList(clone, body, selector) {
      if (typeof clone === 'undefined') clone = false;
      if (typeof body === 'undefined') body = document;
      if (typeof selector === 'undefined') selector = '.list_box.type_tweet';

      const tweets = body.querySelectorAll(selector);
      // console.log('getTweetList = '+selector);
      // console.log(tweets);
      if (clone) {
        const arr = [];
        for (let i = 0, ll = tweets.length; i !== ll; arr.push(tweets[i++].cloneNode(true)));
        return arr;
      }
      return tweets;
    }


    /**
     * getPagination - ページネーション取得(下部にあるほう)
     * 備忘:Togetterの2ページ目以降はページネーションが上にも出るが、常に下を取る
     * @param  {Element=} body 探索するElementを指定する
     * @return {Element}      ページネーション
     */
    getPagination(body) {
      if (typeof body === 'undefined') body = this.getTweetBox();
      return body.querySelector('.pagenation');
    }


    /**
     * getTitleBox - 各ページのサブタイトルみたいなやつ
     *
     * @param  {Element=} body 探索するElementを指定する
     * @return {ELement}  description
     */
    getTitleBox(body) {
      if (typeof body === 'undefined') body = document;
      return body.getElementsByClassName('title_box')[0];
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
     * getUserIcon - ユーザーアイコンのimg要素を取得
     *
     * @param  {Element} tweet ユーザーアイコンを含むエレメント
     * @param  {boolean} clone trueでコピーを作成
     * @param  {string} filter セレクタのフィルター(:notとか)
     * @return {ELement}       img要素
     */
    getUserIcon(tweet, clone, filter) {
      if (typeof tweet === 'undefined') tweet = document;
      if (typeof clone === 'undefined') clone = false;
      const userIcon = tweet.querySelector(`.user_link img${filter}`);
      if (clone) return userIcon.cloneNode(true);
      return userIcon;
    }


    /**
     * getUserIconList - 全ユーザーアイコン要素だけのリストを取得
     *
     * @param  {boolean} clone trueでコピーを作成
     * @param  {string} filter セレクタのフィルター(:notとか)
     * @return {nodeList|Element[]}  cloneがfalseならnodeList、trueならElement配列
     */
    getUserIconList(clone, filter) {
      if (typeof clone === 'undefined') clone = false;
      if (typeof filter === 'undefined') filter = '';
      return this.getTweetList(clone, document, `.user_link img${filter}`);
    }


    /**
     * loadPages - 現在のページから全ページ読み込み
     *
     * @param  {number=} maxPage 最大何ページ読み込むか。省略すると現在ページから最後まで。
     * @param  {string=} tgtUrl  読み込む対象URL
     * @return {void}
     */
    loadPages(maxPage, tgtUrl) {
      const self = this;
      const xhr = new XMLHttpRequest();
      if (typeof maxPage === 'undefined') maxPage = self.getMaxPage() - self.getNowPage();
      if (typeof tgtUrl === 'undefined') tgtUrl = self.getNextPageUrl();

      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            const resPage = self.getNowPage(xhr.response);
            const twList = self.getTweetList(false, xhr.response);
            const twFragment = document.createDocumentFragment();
            Array.from(twList, (tweet) => {
              tweet.dataset.acqpage = resPage;
              tweet.dataset.acqurl = xhr.response.URL;
              twFragment.appendChild(tweet);
            });
            // twBoxの末尾に追加
            self.statusBottom_.parentNode.insertBefore(twFragment, self.statusBottom_);
            maxPage--;
            // console.log(`complete maxPage=${maxPage} url=${tgtUrl}`);

            // シームレスロードのURL取得の為、maxPageがどうであれ次ページURL取得
            try {
              tgtUrl = self.getNextPageUrl(xhr.response);
              self.seamlessNextUrl_ = tgtUrl;
            } catch (e) {
              // [次へ]が見つからなかった時なので
              // 最後まで読み込んだ場合もこっちに来る
              self.seamlessNextUrl_ = '';
            }

            if (maxPage > 0) {
              // 複数ページ読む時は気持ち負荷分散(0.5～2秒)
              const max = 2000;
              const min = 500;
              const delay = Math.floor(Math.random() * (max + 1 - min)) + min;
              setTimeout(() => self.loadPages(maxPage, tgtUrl), delay);
            } else {
              self.addEventNinja();
              if ( self.getMaxPage() <= resPage ) {
                self.setStatusText('最後のページまで読み込みを完了しました');
              } else {
                self.setStatusText(resPage+'ページまで読み込み完了しました<br>次のツイートが出てこない場合はもう一度スクロールしてください');
              }
            }
          }
        }
        // console.log('readyState'+xhr.readyState+' status='+xhr.status);
      };

      if (maxPage > 0) {
        let statusText = '読み込み中...';
        if (maxPage > 1) statusText = `${statusText} / 残り:${maxPage}ページ)`;
        self.setStatusText(statusText);
        xhr.open('GET', tgtUrl, true);
        xhr.responseType = 'document';
        xhr.send();
      } else {
        this.seamlessNextUrl_ = self.getNextPageUrl();
        self.addEventNinja();
      }
    }
  }


  /**
   * モーダルウィンドウ管理
   * 参考: https://syncer.jp/jquery-modal-window
   */
  class ModalWindow {
    constructor() {
      const self = this;

      this.lazy_ = null;

      this.windowScrollXPos_ = 0;
      this.windowScrollYPos_ = 0;

      this.modalOverlay = document.createElement('div');
      this.modalContents = document.createElement('div');
      this.modalHeader = document.createElement('div');
      this.modalContentsMain = document.createElement('div');

      this.modalContents.id = 'modalContent';
      this.modalHeader.id = 'modalHeader';
      this.modalContentsMain.id = 'modalContentsMain';
      this.modalOverlay.id = 'modelOverlay';

      this.modalContents.style.width = '70%';
      this.modalContents.style.height = '80%';
      this.modalContents.style.margin = '1.5em auto 0';
      this.modalContents.style.padding = '5px 20px 10px';
      this.modalContents.style.paddingTop = '0 px';
      this.modalContents.style.border = '2px solid #aaa';
      this.modalContents.style.zIndex = '2';
      this.modalContents.style.position = 'fixed';
      this.modalContents.style.backgroundColor = '#fff';
      this.modalContents.style.overflow = 'hidden';
      this.modalContents.style.display = 'none';
      this.modalContents.style.flexDirection = 'column';

      this.modalHeader.style.borderBottom = '1px solid #aaa';
      this.modalContentsMain.style.overflowY = 'auto';

      this.modalOverlay.style.zIndex = '2';
      this.modalOverlay.style.display = 'none';
      this.modalOverlay.style.position = 'fixed';
      this.modalOverlay.style.top = '0';
      this.modalOverlay.style.left = '0';
      this.modalOverlay.style.width = '100%';
      this.modalOverlay.style.height = '120%';
      this.modalOverlay.style.backgroundColor = 'rgba(0,0,0,0.750)';

      this.modalOverlay.addEventListener('click', function(e) {
        self.hide();
      });

      this.modalContents.appendChild(this.modalHeader);
      this.modalContents.appendChild(this.modalContentsMain);
      document.body.appendChild(this.modalOverlay);
      document.body.appendChild(this.modalContents);

      // リサイズ処理中フラグ
      let queue = null;
      window.addEventListener('resize', function() {
        clearTimeout(queue);
        queue = setTimeout(() => self.centeringModalSyncer(), 300);
      });
    }

    get modalContents() {
      return this._modalContents;
    }

    set modalContents(elem) {
      this._modalContents = elem;
    }

    get modalContentsMain() {
      return this._modalContentsMain;
    }

    set modalContentsMain(elem) {
      this._modalContentsMain = elem;
    }

    get modalHeader() {
      return this._modalHeader;
    }

    set modalHeader(elem) {
      this._modalHeader = elem;
    }

    get modalOverlay() {
      return this._modalOverlay;
    }

    set modalOverlay(elem) {
      this._modalOverlay = elem;
    }

    /**
     * show - モーダルを表示する
     *
     * @param  {Element} callerTweet リアクションツイートのベースとなるツイート
     * @return {void}
     */
    show(callerTweet) {
      // console.log('show');

      // 現在のスクロール位置を記録
      const dElm = document.documentElement;
      const dBody = document.body;
      this.windowScrollXPos_ = dElm.scrollLeft || dBody.scrollLeft; // 現在位置のX座標
      this.windowScrollYPos_ = dElm.scrollTop || dBody.scrollTop; // 現在位置のY座標

      this.hide();
      this.modalHeader.innerHTML = '';
      this.modalContentsMain.innerHTML = '';

      const eve = new CustomEvent('modalShow', {detail: callerTweet});
      eve.initEvent('modalShow', true, false);
      document.body.dispatchEvent(eve);

      this.modalContents.style.display = 'flex';
      this.modalOverlay.style.display = 'block';
      this.centeringModalSyncer();

      this.modalContentsMain.scrollTop = 0;
      this.lazySet();
    }


    /**
     * hide - モーダルを非表示にする
     *
     * @return {void}
     */
    hide() {
      this.modalContents.style.display = 'none';
      this.modalOverlay.style.display = 'none';
      this.lazyDestroy();

      // スクロール位置を開く前の位置に戻す
      window.scrollTo(this.windowScrollXPos_, this.windowScrollYPos_);
    }


    /**
     * centeringModalSyncer - センタリングをする関数
     * 参考: https://syncer.jp/jquery-modal-window
     * @return {void}
     */
    centeringModalSyncer() {
      const w = window.document.documentElement.clientWidth;
      const h = window.document.documentElement.clientHeight;
      const cw = this.modalContents.offsetWidth;
      const ch = this.modalContents.offsetHeight;
      const pxleft = ((w - cw) / 2);
      const pxtop = ((h - ch) / 2);

      this.modalContents.style.left = pxleft + 'px';
      this.modalContents.style.top = pxtop + 'px';
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
      this.lazy_ = lazyload(images, opt);
    }


    /**
     * lazyDestroy - 独自lazyloadを破棄
     *
     * @return {void}
     */
    lazyDestroy() {
      // console.log('lazyDestroy');
      // 本当に効いてるかどうかわからんけどやらんよりマシ？
      if (this.lazy_ !== null) this.lazy_.destroy();
    }
  }


  /**
   * ニンジャスレイヤー実況管理
   */
  class NinjaManager extends TogetterUtil {
    constructor() {
      super();
      const self = this;
      this.SCRIPT_NAME = GM_info.script.name;
      this.ClassName = {
        STATUS: self.SCRIPT_NAME+'_status',
        EVENT_CONFIGED: '_event_configured'
      };


      // 実況まとめなのかを判断する
      const tweets = this.getTweetList();
      const nijaSoul = [].slice.call(tweets).some((tweet) => NinjaManager.isNinja(tweet));
      if (nijaSoul === false) return;

      // リアクション表示モーダルウィンドウ
      this.reactModal_ = new ModalWindow();
      // シームレスロードで次に読み込むURL
      this.seamlessNextUrl_ = '';
      // ステータステキスト
      this.statusBottom_ = document.createElement('div');
      this.statusBottom_.style.fontWeight = 'bold';
      this.statusBottom_.classList.add(self.ClassName.STATUS);

      // ページ読み込みボタン
      this.loadBtn_ = document.createElement('button');
      this.loadBtn_.textContent = 'このページからまとめ読み開始';
      this.loadBtn_.style.width = '100%';
      this.loadBtn_.addEventListener('click', (e) => {
        // 続きを読むがあればクリック
        self.clickReadMore();
        self.loadBtn_.style.display = 'none';
        self.loadPages(0);

        const pagination = self.getPagination();
        pagination.parentNode.insertBefore(self.statusBottom_, pagination);
        self.setStatusText(`スクロールしていくと自動的に次のページを読み込みます`+
        '<br>(AutoPagerizeのようなアドオンなどは無効にしてください)');
      });


      // モーダル表示時のイベント
      // 本当にこんな実装でいいのか全然わからん
      document.addEventListener('modalShow', function(e) {
        const twBox = document.createElement('div');
        const twFragment = document.createDocumentFragment();
        const twNinja = e.detail;
        const tweetsArr = self.getReactTweets(twNinja);

        tweetsArr.forEach(function(item) {
          twFragment.appendChild(item);
        });
        twBox.appendChild(twFragment);

        const ninjaTweet = document.createElement('div');
        ninjaTweet.appendChild(twNinja.cloneNode(true));
        if (typeof twNinja.dataset.acqpage !== 'undefined') {
          const dispPage = document.createElement('p');
          dispPage.style.textAlign = 'center';
          dispPage.textContent = '現在表示中のページ:';
          const a = document.createElement('a');
          a.style.fontWeight = 'bold';
          a.href = twNinja.dataset.acqurl;
          a.textContent = twNinja.dataset.acqpage;
          dispPage.appendChild(a);
          self.reactModal_.modalHeader.appendChild(dispPage);
        }
        self.reactModal_.modalHeader.appendChild(ninjaTweet);
        self.reactModal_.modalContentsMain.appendChild(twBox);
      });

      // ページに追加
      const titleBox = self.getTitleBox();
      titleBox.appendChild(this.loadBtn_);

      // シームレスロード
      window.onscroll = () => self.seamlessLoad();
    }


    /**
     * getNinjatwList - 表示中の公式ツイートリストの取得
     *
     * @param  {boolean} clone trueでコピーを作成
     * @param  {Element=} body 探索するElementを指定する
     * @return {nodeList|Element[]}  cloneがfalseならnodeList、trueならElement配列
     */
    getNinjatwList(clone, body) {
      if (typeof clone === 'undefined') clone = false;
      if (typeof body === 'undefined') body = document;
      // 非表示になっていないツイートは公式のツイートとみなす
      return this.getTweetList(clone, body, '.list_box.type_tweet:not([style*=display])');
    }

    /**
     * setStatusText - ステータステキストの設定
     *
     * @param  {string} html 任意のステータステキスト
     * @param {number=} index 0=top, 1=bottom
     * @return {void}
     */
    setStatusText(html, index) {
      const self = this;
      const statuses = document.getElementsByClassName(this.ClassName.STATUS);
      html = `◆${self.SCRIPT_NAME}◆<br>${html}`;
      if (typeof index === 'undefined') {
        Array.from(statuses, (status) => {
          status.innerHTML = html;
        });
      } else {
        statuses[index].innerHTML = html;
      }
    }


    /**
     * addEventNinja - 表示中の全ツイートを走査して
     * 公式ツイート以外を非表示/公式ツイートには反応ツイート表示イベントを設定する
     *
     * @return {void}
     */
    addEventNinja() {
      const self = this;
      const twList = this.getNinjatwList();

      Array.from(twList, (tweet, i) => {
        if (NinjaManager.isNinja(tweet)) {
          // イベント設定済みかどうかを独自クラスで判断する
          const twBox = tweet.querySelector(`.tweet_wrap:not(.${self.ClassName.EVENT_CONFIGED})`);
          if (twBox !== null) {
            // Togetter公式のLazyLoadエラー.error(ページ閲覧時に表示されたもの)未設定かつ、
            // 独自onerror未設定の公式ツイートのアイコン画像はキャッシュに残ってるはずなので
            // LazyLoadではなくsrcをそのまま変えてしまう
            const icon = self.getUserIcon(tweet, false, ':not(.error):not([onerror])');
            if (icon !== null) icon.src = icon.getAttribute('data-lazy-src');
            twBox.style.cursor = 'pointer';
            twBox.classList.add(self.ClassName.EVENT_CONFIGED);
            twBox.addEventListener('click', (e) => {
              const baseTweet = e.target.closest('.list_box.type_tweet');
              self.reactModal_.show(baseTweet);
            });
          }
        } else {
          tweet.style.display = 'none';
        }
      });

      // Togetter公式のLazyLoadエラー.error(ページ閲覧時に表示されたもの)未設定かつ、
      // 独自エラー処理未設定のアイコンにのみ画像読み込みエラー時に
      // Togetter公式が設定しているエラー画像をsrcに設定する
      // 参考: https://teratail.com/questions/15682
      const eventUnsetIcons = self.getUserIconList(false, ':not(.error):not([onerror])');
      Array.from(eventUnsetIcons, (icon) => {
        const errImg = icon.getAttribute('data-error-image');
        icon.setAttribute('onerror', `this.onerror=null; this.src='${errImg}'`);
      });
    }


    /**
     * seamlessLoad - Autopagerizeのように画面下まで来ると1ページロード
     * 参考: http://cly7796.net/wp/javascript/implement-infinite-scrolling/
     * 参考: https://q-az.net/without-jquery-height-width-offset-scrolltop/
     * @return {void}
     */
    seamlessLoad() {
      const self = this;

      // 次のページ読み込み中の場合は処理を行わない
      if (self.seamlessNextUrl_ !== '') {
        const pagination = self.getPagination();
        const winHeight = window.innerHeight;
        const scrollPos = document.documentElement.scrollTop || document.body.scrollTop;
        const rect = pagination.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const paginationTop = rect.top + scrollTop;
        const linkPos = paginationTop;

        // console.log(winHeight + scrollPos + '>'+ linkPos);

        if (winHeight + scrollPos > linkPos) {
          // console.log(self.seamlessNextUrl_);
          self.loadPages(1, self.seamlessNextUrl_);
          self.seamlessNextUrl_ = '';
        }
      }
    }


    /**
     * getReactTweets - 公式ツイートの反応ツイートを抜き出す
     *
     * @param  {Element} officialTweet 反応ツイートの基準となる公式ツイート
     * @return {Element[]}               配列に格納された反応ツイート
     */
    getReactTweets(officialTweet) {
      // console.log('getReactTweets');
      const self = this;
      const reactTweets = [];
      let ninjaFlg = false;
      let nextTweet = officialTweet.nextElementSibling;
      while (nextTweet !== null) {
        // 次の公式ツイート or 最下部のページネーションが出てきたら停止
        ninjaFlg = NinjaManager.isNinja(nextTweet);
        if (ninjaFlg) break;
        if (nextTweet.className === 'list_box type_tweet') {
          const cloneTweet = nextTweet.cloneNode(true);
          cloneTweet.style.display = 'block';
          reactTweets.push(cloneTweet);
        }
        nextTweet = nextTweet.nextElementSibling;
      }
      // 公式ツイートが出てこないまま終わった場合、次のツイートの取りこぼしがある可能性を示唆
      if (!ninjaFlg) {
        const loadedPage = parseInt(self.statusBottom_.previousElementSibling.dataset.acqpage);
        // 読み込み済み
        // console.log(`${self.getMaxPage()} > ${loadedPage}`);
        if ( self.getMaxPage() > loadedPage ) {
          const divWarn = document.createElement('div');
          divWarn.style.fontWeight = 'bold';
          divWarn.innerHTML = `◆${self.SCRIPT_NAME}◆<br>次のページにも実況ツイートが残っています。<br>`+
          'もし取りこぼした実況ツイートも確認したい場合、次の公式ツイートを読み込んでから再度表示させてください。';
          reactTweets.push(divWarn);
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
