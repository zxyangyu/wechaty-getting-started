var FeedParser = require('feedparser');
var fetch = require('node-fetch'); // for fetching the feed


  var req = fetch("http://139.180.191.22:1200/houxu/lives/new")
  var feedparser = new FeedParser();
  req.then(function (res) {
    if (res.status !== 200) {
    }
    else {
      // The response `body` -- res.body -- is a stream
      res.body.pipe(feedparser);
    }
  }, function (err) {
    // handle any request errors

  });

  feedparser.on('error', function (error) {
    // always handle errors
    console.log(error);
  });


  feedparser.on('readable', function () {
    // This is where the action is!
    var stream = this; // `this` is `feedparser`, which is a stream
    var meta = this.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance
    var item;

    while (item = stream.read()) {
      console.log(item);
    }
  });



