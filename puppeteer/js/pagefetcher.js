class PageFetcher{
  constructor(){}

  fetch(url){
    console.log('fetch page: '+url);
  }
}

class FetcherHelper{
  log(){
    console.log('helper');
  }
}

exports = module.exports = PageFetcher;
exports.Helper = FetcherHelper;
