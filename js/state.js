/* ================================================================
   OpenScript — App State
   Central state object shared across all modules.
   ================================================================ */

var currentUser    = null;
var currentPage    = 'home';
var allPosts       = [];
var activeFilter   = 'all';
var activePostType = 'localscript';
var activeExt      = '.lua';
var codeTab        = 'paste';
var treeItems      = [];
var treeIdCounter  = 0;
var authMode       = 'login';
var currentPost    = null;
