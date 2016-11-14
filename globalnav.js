"option strict"
/* Global Navigation
 */

var GNav = GNav || {};
/* gets a property from an item in the seacrh results */
GNav.getProperty = function (site, propertyName) {
    for (var propidx = 0; propidx < site.Cells.results.length; propidx++) {
        if (site.Cells.results[propidx].Key === propertyName) {
            return site.Cells.results[propidx].Value
        }
    }
};
/* create update global Nav witgh the search results */
GNav.findSubWebsForWeb = function (sites, parentLink) {
    var subwebs = [];
    for (var subwebidx = 0; subwebidx < sites.length; subwebidx++) {
        var thisParent = GNav.getProperty(sites[subwebidx], "ParentLink");
        if (thisParent === parentLink) {
            subwebs.push(sites[subwebidx]);
        }
    }
    return subwebs;
};
/* fill in child ndes for a site */
GNav.fillSubsites = function (sites, site, level) {

    var siteName = GNav.getProperty(site, "Title");
    var siteUrl = GNav.getProperty(site, "Path");
    site.subwebs = GNav.findSubWebsForWeb(sites, siteUrl);

    for (var webidx = 0; webidx < site.subwebs.length; webidx++) {
        GNav.fillSubsites(sites, site.subwebs[webidx], level + 1)
    }
};

/* cobverts the search results to a tree structure by adding a 'subsites' property to each site*/ 
GNav.convertsitesToTree = function (sites) {

    var rootTree = GNav.findSubWebsForWeb(sites, _spPageContextInfo.siteAbsoluteUrl)
    for (var i = 0; i < rootTree.length; i++) {
        GNav.fillSubsites(sites, rootTree[i], 1)
    }
    return rootTree;
};
/* adds the html fopr the 3rd level menu items*/
GNav.addLevel3Nav = function (html, subweb, tree, level) {
    var templateNoChildren = '<li class="dynamic"><a class="dynamic menu-item ms-core-listMenu-item ms-displayInline ms-navedit-linkNode" href="{0}"><span class="additional-background ms-navedit-flyoutArrow"><span class="menu-item-text">{1}</span></span></a></li>';
    var templateWithChildren = '<a class="dynamic dynamic-children menu-item ms-core-listMenu-item ms-displayInline ms-navedit-linkNode" title="{0}" href="{1}"><span aria-haspopup="true" class="additional-background ms-navedit-flyoutArrow dynamic-children"><span class="menu-item-text">{2}</span></span></a>'
    var siteName = GNav.getProperty(subweb, "Title");
    var siteUrl = GNav.getProperty(subweb, "Path");
    var siteDescription = GNav.getProperty(subweb, "Description");

    
    if (subweb.subwebs && subweb.subwebs.length == 0) {
        var item = templateNoChildren.replace("{0}", siteUrl).replace("{1}", siteName);
        html += item;
    }
    else {
        //**** NO MORE LEVELS for now
        html += '<li class="dynamic dynamic-children">';
        var item = templateWithChildren.replace("{0}", siteName).replace("{1}", siteUrl).replace("{2}", siteDescription);
        html += item;
        html += '<ul class="dynamic">'
        for (var i=0; i<subweb.subwebs.length; i++){
            GNav.addLevel3Nav(html, subweb.subwebs[i], tree, level+1) 
        }  
        html += '</ul>'
        html += '</li>';
    }
    return html;
};
/* adds the html fopr the 2nd level menu items*/
GNav.addLevel2Nav = function (html, subweb, tree, level) {
    var templateNoChildren = ' <li class="dynamic"><a class="dynamic menu-item ms-core-listMenu-item ms-displayInline ms-navedit-linkNode" title="{2}" href="{0}"><span class="additional-background ms-navedit-flyoutArrow"><span class="menu-item-text">{1}</span></span></a></li>'
    var templateWithChildren = '<a class="dynamic dynamic-children menu-item ms-core-listMenu-item ms-displayInline ms-navedit-linkNode" title="{0}" href="{1}"><span aria-haspopup="true" class="additional-background ms-navedit-flyoutArrow dynamic-children"><span class="menu-item-text">{2}</span></span></a>'
    var siteName = GNav.getProperty(subweb, "Title");
    var siteUrl = GNav.getProperty(subweb, "Path");
    var siteDescription = GNav.getProperty(subweb, "Description");
    
    if (subweb.subwebs.length == 0) {
        var item = templateNoChildren.replace("{0}", siteUrl).replace("{1}", siteName).replace("{2}", siteDescription);
        html += item;
    }
    else {
        html += '<li class="dynamic dynamic-children">';
        var item = templateWithChildren.replace("{2}", siteName).replace("{1}", siteUrl).replace("{0}", siteDescription);
        html += item;
        html += '<ul class="dynamic" style="z-index: 1100;" >';
        for (var i=0; i<subweb.subwebs.length; i++){
            html=GNav.addLevel3Nav(html, subweb.subwebs[i], tree, level+1); 
        }  
        
        html += '</ul>'
        html += '</li>';
    }
    return html;
};
/* adds the html fopr the top level menu items*/
GNav.addTopNav = function (html, subweb, tree, level) {
    var templateNoChildren = '<li class="static"><a class="static menu-item ms-core-listMenu-item ms-displayInline ms-navedit-linkNode" title="{0}" href="{1}"><span class="additional-background ms-navedit-flyoutArrow"><span class="menu-item-text">{2}</span></span></a></li>'
    var templateWithChildren = '<a class="static dynamic-children menu-item ms-core-listMenu-item ms-displayInline ms-navedit-linkNode" title="{0}" href="{1}"><span aria-haspopup="true" class="additional-background ms-navedit-flyoutArrow dynamic-children"><span class="menu-item-text">{2}</span></span></a>'
    var siteName = GNav.getProperty(subweb, "Title");
    var siteUrl = GNav.getProperty(subweb, "Path");
    var siteDescription = GNav.getProperty(subweb, "Description");

    if (subweb.subwebs.length == 0) {
        var item = templateNoChildren.replace("{0}",  siteDescription).replace("{1}", siteUrl).replace("{2}",siteName);
        html += item;
    }
    else {
        html += '<li class="static dynamic-children">';
        var item = templateWithChildren.replace("{0}",  siteDescription).replace("{1}", siteUrl).replace("{2}", siteName);
        html += item;
        html += '<ul class="dynamic" style="z-index: 1100;">'
        for (var i=0; i<subweb.subwebs.length; i++){
            html=GNav.addLevel2Nav (html, subweb.subwebs[i], tree, level+1);
        }
        html += '</ul>'
        html += '</li>';
    }
    return html;
};

/* gets tghe html to render the Global Navigation */
GNav.getHtmlMenuFromTree = function (tree) {
    var html = '<!– BEGIN CUSTOM NAVIGATION –><ul class="static">';
    for (var i = 0; i < tree.length; i++){
        html=GNav.addTopNav(html, tree[i], tree, 1);
    }

    html += '</ul><!– END CUSTOM NAVIGATION –>';
    return html;

}
/* updatse the global navigation*/
GNav.updateGlobalNav = function (sites) {
    var tree = GNav.convertsitesToTree(sites); // given a list of sites, each of which has a ParentLink pointying
    
    var html = GNav.getHtmlMenuFromTree(tree);
    debugger;   
    var navRoot=$('#DeltaTopNavigation>div.ms-core-listMenu-horizontalBox>ul.ms-core-listMenu-root>li.static');
    $(navRoot[0]).append(html);

     var topNavigationMenu=$('#DeltaTopNavigation>div.ms-core-listMenu-horizontalBox');
    var topNavigationMenuID=topNavigationMenu.attr('id'); //zz11_TopNavigationMenu
    var topNavigationMenubackingVariableName='g_'+topNavigationMenuID;
    var topNavigationMenuInitializationMethodName='init_'+topNavigationMenuID;//init_zz11_TopNavigationMenu
    window[topNavigationMenubackingVariableName]= null; // g_zz11_TopNavigationMenu = null;
    window[topNavigationMenuInitializationMethodName]();//init_zz11_TopNavigationMenu()
   

};
/* create a new OData request for JSON response */
GNav.getRequest = function (endpoint) {
    var request = {}
    request.type = "GET";
    request.url = endpoint;
    request.headers = { ACCEPT: "application/json;odata=verbose" };
    return request;
};
GNav.init = function () {
    if (!window.jQuery) {
        // jQuery is needed for PnP Responsive UI to run, and is not fully loaded yet, try later
        setTimeout(GNav.init, 100);
    } else {
        $(function () { // only execute when DOM is fully loaded
            var root = _spPageContextInfo.siteAbsoluteUrl;
            var baseUrl = root + "/_api/search/query?querytext=";
            //* title is not sortable, It has been mpped to refinablestring00 for sorting
            var query = baseUrl + "'contentClass=\"STS_Web\"+path:" + root + "'&trimduplicates=false&rowlimit=300&selectProperties='Title,Path,Description,ParentLink'&SortList='refinablestring00:ascending'";
            var oDataRequest = GNav.getRequest(query);
            $.ajax(oDataRequest).done(function (data) {
                localStorage.setItem("GlobalNavigation:_spPageContextInfo.siteAbsoluteUrl", data.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results)
                GNav.updateGlobalNav(data.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results);
            });
        });
    }

};



/* Dynamic CSS/JS embedding and loading */
function loadScript(url, callback) {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onreadystatechange = callback;
    script.onload = callback;
    head.appendChild(script);
}


// embedding of jQuery, and initialization of responsiveness when ready
loadScript("//code.jquery.com/jquery-1.12.0.min.js", function () {
    GNav.init();
});

