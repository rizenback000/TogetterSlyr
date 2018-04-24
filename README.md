# TogetterSlyr
Togetterのニンジャスレイヤー実況まとめを見やすくする

# 動作確認環境
- Firefox 59.0.2 + Tamppermonkey
- GoogleChrome 66.0.3359.117 + Tamppermonkey

# インストール方法
FirefoxかGoogleChromeのどちらかでアドオン「Tampermonkey」をインストールする。
- [Tampermonkey - Chromeウェブストア](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=ja)
- [Tampermonkey - Firefox向けアドオン](https://addons.mozilla.org/ja/firefox/addon/tampermonkey/)
1. TogetterSlyr.user.jsの[Raw][https://github.com/rizenback000/TogetterSlyr/raw/master/TogetterSlyr.user.js]を開くとスクリプトをインストールするか聞かれるのでインストール
2. Togetterの実況まとめを開く

# 使い方
1. Togetter上部にあるメニューボタンの下の「全ページ読み」ボタンを押す
1. 気になった公式ツイートの発言をクリックすると直後の実況が見れるようになる

# より快適に使うために
## ページあたりの表示数を変更する
TogetterはTwitterと連携するとページあたりの表示数を変更できるので、PCスペックが許すなら、1ページあたりの表示数を「250」が推奨。
負荷分散のため1ページあたりの読み込みに1～5秒のディレイを設けているので、全体ページ数をできるだけ少なくしたほうがより早く全ページ読み込みが完了します。
1. ページの下の方に「ページあたりの表示数を変更する?」というリンクがあるので指示に従ってTogetterにログインする
1. 1ページあたりの表示数を「250」を選んで、[設定する]をクリック
1. ページを更新して使い始める


## License
MIT
