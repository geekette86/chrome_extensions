chrome.browserAction.onClicked.addListener(function(activeTab){
  var newURL = "http://myhelpster.com/get-your-call-back-in-less-than-30-min-from-our-helpster/";
  chrome.tabs.create({ url: newURL });
});
