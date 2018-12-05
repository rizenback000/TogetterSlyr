# TogetterSlyr
Togetterのニンジャスレイヤー実況まとめを見やすくする

# どんな風になるの？
![sample](https://github.com/rizenback000/TogetterSlyr/blob/media/sample.gif)

# 動作確認済み環境
- Firefox 63.0.3 + Tamppermonkey
- GoogleChrome 71.0.3578.80 + Tamppermonkey

# インストール方法
FirefoxかGoogleChromeのどちらかでアドオン「Tampermonkey」をインストールする。
- [Tampermonkey - Chromeウェブストア](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=ja)
- [Tampermonkey - Firefox向けアドオン](https://addons.mozilla.org/ja/firefox/addon/tampermonkey/)
1. TogetterSlyr.user.jsの[Raw](https://github.com/rizenback000/TogetterSlyr/raw/master/TogetterSlyr.user.js)を開くとスクリプトをインストールするか聞かれるのでインストール
2. Togetterの実況まとめを開く

# 使い方
1. Togetter上部にあるメニューボタンの下の「このページからまとめ読み開始」ボタンを押す
1. 気になった公式ツイートの発言をクリックすると直後の実況が見れるようになる

# 使用上の注意
~~1つのツイートにすごい数の反応があるとPCパワーが足りないと重くなります。
場合によってはブラウザがぷちフリーズするかも…~~
⇒コメント逐次読み込み形式に変更した為、発生しなくなりました。
　ただしものすごい量を読み込み続ければ当然ブラウザ自体が重くなる(はず)なのでご注意を。

# 既知の不具合
1. [実況ツイートの逐次読み込み時に「次のページにも実況ツイートが残っている～」が表示されることがある](https://github.com/rizenback000/TogetterSlyr/issues/6)

## License
MIT
