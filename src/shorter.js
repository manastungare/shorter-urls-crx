// Copyright 2011 Google Inc. All Rights Reserved.
// Author: manas@google.com (Manas Tungare)
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Creates shorter URLs for Google SRPs by removing unnecessary
 * parameters.
 */

'use strict';

// Enable the page action icon only for pages that look like a valid Google SRP.
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (tab.url.indexOf('google') > -1 && tab.url.indexOf('q=') > 1) {
    chrome.pageAction.show(tabId);
  }
});

chrome.pageAction.onClicked.addListener(function(tab) {
  /**
   * Valid parameters to keep in a short URL; all others will be removed.
   * @enum {boolean}
   * @const
   * @private
   */
  var VALID_PARAMS = {
    'num': true,
    'q': true,
    'tbm': true,
    'tbs': true
  };

  var url = tab.url;
  var params = url.substring(url.indexOf('?') + 1).split(/&|#/);

  var paramsToKeep = {};
  for (var i = 0; i < params.length; ++i) {
    var key = params[i].substring(0, params[i].indexOf('='));
    if (VALID_PARAMS[key]) {
      // To prevent duplicates, add to a map first, then flatten it.
      paramsToKeep[key] = params[i];
    }
  }

  var copyable = url.substring(0, url.indexOf('?') + 1);
  for (var key in paramsToKeep) {
    copyable += '&' + paramsToKeep[key];
  }
  copyable = copyable.replace('?&', '?');

  chrome.tabs.executeScript(tab.id, {
    'code': 'window.history.replaceState({}, "", "' + copyable + '")'
  })
});
