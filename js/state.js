/* ================================================================
   OpenScript — App State
   Central state object shared across all modules.
   ================================================================ */

let currentUser    = null;
let currentPage    = 'home';
let allPosts       = [];
let activeFilter   = 'all';
let activePostType = 'localscript';
let activeExt      = '.lua';
let codeTab        = 'paste';
let treeItems      = [];
let treeIdCounter  = 0;
let authMode       = 'login';
let currentPost    = null;
