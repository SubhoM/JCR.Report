var hMenuBuilder = (function () {

    var objMenuState,
        $listItems,
        isUserGlobalAdmin,
        //isTeaserEnabledForTracers,
        //isTeaserEnabledForCMS,
        isFirstTimeClicked = true,
        navElementID = "",                   // Contains DOM Element ID (DIV tag) where markup for horizontal menu gets inserted.
        baseAddress = "",
        numberOfItemsInLastColumn = 0,
        currentElementID,
        firstTimeThru = true,
        current,
        menuTemplates = {},
        ENTRY_IS_HIDDEN = "IsHidden",

        AMP_LICENSE_REQUIRED = "AMP",
        CMS_LICENSE_REQUIRED = "CMS",
        TRACERS_LICENSE_REQUIRED = "Tracers",
        HAS_ACCESS_TO_MOCK_SURVEY = "MockSurvey",
        REQUIRES_PROGRAM_ADMIN_ACCESS_TO_MULTIPLE_SITES = "MultiSiteAdmin",
        REQUIRES_ACCESS_TO_MULTIPLE_SITES = "MultiSite",
        CURRENT_CYCLE_SELECTED = "CurrCycle";
        //TRACER_TEASER_MSG = "<span class='mnuMessage'>Click <a href='https://www.youtube.com/watch?v=oKfn6PXVkhI' target='_blank'>here</a> to learn more about the advantages of adding Tracers to your JCR subscription. <a href='mailto:bmishra@jcrinc.com'>Contact your JCR Representative</a> to schedule a demo or attend one of our free webinars.</span>";
        //CMS_TEASER_MSG = "<span class='mnuMessage'>Click <a href='http://www.imiaweb.org/uploads/pages/275_2.pdf' target='_blank'>here</a> to learn more about the benefits of adding CMS to your JCR subscription.";

    menuTemplates.breadCrumbTrail = [
        "<div style='float: left;'>",
        "<span class='breadCrumbSubheader' style='padding-right:5px;'>{{submenuTitle}}</span>",
        "<span id='oneFineDot' class='glyphicon glyphicon-one-fine-dot' style='width:12px; z-index: -1;'></span>",
        "<span class='breadCrumbMenuLink'>{{itemTitle}}</span>",
        "</div>"
    ].join('').split(/\{\{(.+?)\}\}/g);

    menuTemplates.tabWithoutSubmenu = [
        "<li><a class='mnuActiveLink' id='{{menuTabID}}' onclick='hMenuBuilder.itemClicked(this);'>{{menuTabTitle}}</a></li>"
    ].join('').split(/\{\{(.+?)\}\}/g);

    menuTemplates.tabWithSubmenu = [
        "<li><a id='{{menuTabID}}'>{{menuTabTitle}} <span class='caret caret-large navArrowSpacing'></span></a><div class='cbp-hrsub'><div class='cbp-hrsub-inner'>"
    ].join('').split(/\{\{(.+?)\}\}/g);

    menuTemplates.submenu = ["<div class='submenu'><h4 id='{{id}}'>{{descr}}</h4>"].join('').split(/\{\{(.+?)\}\}/g);

    menuTemplates.disabledLink = ['<li><span  class="disabledLink" data-toggle="tooltip" data-trigger="hover" data-placement="bottom" data-html=true title="{{displayMessage}}">{{descr}}</span></li>'].join('').split(/\{\{(.+?)\}\}/g);

    menuTemplates.enabledLink = [
        "<li><a class='mnuLink' id='{{id}}' onclick='hMenuBuilder.itemClicked(this);'>{{descr}}</a></li>"
    ].join('').split(/\{\{(.+?)\}\}/g);

    function refresh() {
        var topNav;

        generateDocumentIDs();

        // x = buildMarkup();

        document.getElementById(navElementID).innerHTML = buildMarkup();

        $listItems = $('#' + navElementID + ' > ul > li');     // $listItems is an array of the menu tabs.

        $Links = $listItems.children('a');              // $Links is an array of anchor tags found in menu tabs

        //$Links.hover(open);

        $listItems.hover(open);

        $('#navbarMenu').mouseleave(closemenu);

        $listItems.mouseleave(closemenu);

        $listItems.on('click', function (event) { event.stopPropagation(); });

        if (isNaN(objMenuState.pageID)) {
            topNav = getItemByElementID(objMenuState.pageID);
            setActiveTab(topNav);
        } else {
            topNav = getItemByPageID(objMenuState.pageID);
            setActiveTab(topNav[0]);
        }

        // This line is needed to track the currently selected tab.
        currentElementID = Array.isArray(topNav) ? topNav[0].elementID : topNav.elementID;
    }

    function setActiveTab(menuEntry) {
        try {
            var i = 0, j = 0, foundIt = false, breadCrumb = null, menuTab;

            if (IsTrue(ENTRY_IS_HIDDEN, hMenuData.Tabs[i].Rules) === false) {
                menuTab = document.getElementById(hMenuData.Tabs[i].ElementID);
                if (menuTab !== null) {
                    for (j = 0; j < menuTab.classList.length; j++) {
                        if (menuTab.classList[j] === "cbp-hrmenu-active") {
                            menuTab.classList.remove("cbp-hrmenu-active");
                            foundIt = true;
                            break;
                        }
                    }
                }
            }

            // To render a tab as selected, you need to add the "cbp-hrmenu-active" class to the anchor tag.
            document.getElementById(menuEntry.menuTabId).classList.add("cbp-hrmenu-active");
        }
        catch (err) {
            alert("No menu tab was selected by default because the criteria you set on test page would no longer have access to menu tab '" + menuEntry.menuTitle + "'.");
        }
    }

    function buildMarkup() {
        var markup = "<ul>", tabMenuID = 0, firstTabWithSubmenus, isFirstTabWithSubMenus, isFirstTab;

        
        var _tempHMenuData = $.extend(true, [], hMenuData.Tabs);

        _tempHMenuData = $.grep(_tempHMenuData, function (element) {
            var itemMenuPresent = filterfunction(element);

            if (itemMenuPresent == false)
                return false;


            if (element.SubMenus.length > 0) {

                var originalSubmenu = element.SubMenus;

                var subMenus = $.grep(originalSubmenu, function (subMenu) {

                    let itemSubMenuPresent = filterfunction(subMenu);

                    if (itemSubMenuPresent == false)
                        return false;

                    if (subMenu.Links.length > 0) {

                        let originalMenuLinks = subMenu.Links;

                        let menuLinks = $.grep(originalMenuLinks, function (menuLink) {

                            return filterfunction(menuLink);

                        });

                        subMenu.Links = menuLinks;
                    }

                    return true;

                }
                );

                element.SubMenus = subMenus;

            }

            tabMenuID += 1;

            markup = markup + BuildMenuMarkUp(element, tabMenuID);

            return true;

        });

        return markup + "</ul>";
    }

    function filterfunction(element) {

        var menuState = objMenuState;

        if (element.AuthorizedRoles.indexOf(menuState.userRoleID.toString(), 0) == -1) {
            return false;
        }

        if (!menuState.accessToMockSurvey && element.Rules.indexOf("CorpSite", 0) > -1) {
            return false;
        }

        if (!menuState.userIsMultiSiteAdmin && element.Rules.indexOf("MultiSiteAdmin", 0) > -1) {
            return false;
        }

        if (!menuState.isCurrentCycle && element.Rules.indexOf('CurrCycle', 0) > -1) {
            element.cssClass = 'inactive';
            element.displayMessage = "Please select current standards effective date in standards and scoring page to enable this link.";
        }

        if (!menuState.accessToTracers && element.Rules.indexOf('Tracers', 0) > -1) {
            element.cssClass = 'inactive';
            element.displayMessage = "You do not have access. If any questions about 'how access works' call Customer Support at 1-877-223-6866 option 2.";
        }

        if (!menuState.accessToAMP && element.Rules.indexOf('AMP', 0) > -1) {
            element.cssClass = 'inactive';
            element.displayMessage = "You do not have access. If any questions about 'how access works' call Customer Support at 1-877-223-6866 option 2.";
        }

        if (menuState.programID != 2 && menuState.programID != 69 && element.Rules.indexOf('CMS', 0) > -1) {
            return false;
        }

        if (!menuState.accessToCMS && element.Rules.indexOf('CMS', 0) > -1) {
            element.cssClass = 'inactive';
            element.displayMessage = "You do not have access. If any questions about 'how access works' call Customer Support at 1-877-223-6866 option 2.";
        }

        if (!menuState.accessToERTracers && element.Rules.indexOf('ERTracers', 0) > -1) {
            element.cssClass = 'inactive';
            element.displayMessage = "You do not have access. If any questions about 'how access works' call Customer Support at 1-877-223-6866 option 2.";
        }

        return true;

    }


    function BuildMenuMarkUp(menuItem, tabMenuID) {

        var markup = '', subMenuID = 0;

        if (menuItem.SubMenus.length === 0) {
            menuParts = menuTemplates.tabWithoutSubmenu.slice();   // Array.prototype.slice copies array instead of setting a reference to original.
            menuParts[1] = menuItem.ElementID
            menuParts[3] = menuItem.Title;
            markup = markup + menuParts.join('');
        }
        else {

            menuParts = menuTemplates.tabWithSubmenu.slice();
            menuParts[1] = menuItem.ElementID;
            menuParts[3] = menuItem.Title;
            markup = markup + menuParts.join('');



            for (var i = 0; i < menuItem.SubMenus.length; i++) {
                subMenuID += 1;
                subMenuItemID = 0;


                markup = markup + buildSubmenu(tabMenuID, subMenuID, menuItem.SubMenus[i], menuItem);

            }

            markup = markup + "</div>";
                        

            //if ((tabMenuID === 3 || tabMenuID === 4) && objMenuState.isCurrentCycle === false) {
            //    markup = markup + "<span class='mnuMessage'>Menu entries are disabled because you selected a standards effective date other than the current one.</span>";
            //}

            //if (IsTrue(TRACERS_LICENSE_REQUIRED, menuItem.Rules) && isTeaserEnabledForTracers) {
            //    markup = markup + TRACER_TEASER_MSG;
            //}

            //isTeaserEnabledForCMS = true;
            //isTeaserEnabledForTracers = true;

            //switch (objMenuState.userRoleID) {
            //    case 4:
            //    case 5:
            //    isTeaserEnabledForTracers = false;
            //case 8:
            //case 9:
            //    isTeaserEnabledForCMS = false;                
            //default:
            //    break;
            //}

            //if(objMenuState.accessToTracers){
            //    isTeaserEnabledForTracers = false;
            //}

            //if (menuItem.Title == "Tracers" && isTeaserEnabledForTracers){
            //    markup = markup + TRACER_TEASER_MSG;
            //}
         
            //if (objMenuState.programID != 2 && objMenuState.programID != 69) {
            //    isTeaserEnabledForCMS = false;
            //} else if (objMenuState.accessToCMS) {
            //    isTeaserEnabledForCMS = false;
            //}
                        
            //if (menuItem.Title != "Assignments" && isTeaserEnabledForCMS) {
            //    markup = markup + CMS_TEASER_MSG;
            //}
            
            markup = markup + "</div></li>";
        }

        return markup;

    }

    function generateDocumentIDs() {
        // Calculate unique DOM element IDs for each menu, submenu and menu item. Applications sometimes need to hide/show items based
        // on various business rules. These IDs are calculated prior to filtering so the IDs are constant unless menu entries are 
        // added or removed to the JSON file.
        var x, y, z, tens, hundreds, itemCtr = 0;
        for (x = 0; x < hMenuData.Tabs.length; x++) {
            hMenuData.Tabs[x].ElementID = "menuNav" + (x + 1);

            itemCtr = 0;
            for (y = 0; y < hMenuData.Tabs[x].SubMenus.length; y++) {

                tens = ((x + 1) * 10);
                hMenuData.Tabs[x].SubMenus[y].ElementID = "menuNav" + (tens + y);

                for (z = 0; z < hMenuData.Tabs[x].SubMenus[y].Links.length; z++) {
                    hundreds = ((x + 1) * 100);
                    hMenuData.Tabs[x].SubMenus[y].Links[z].ElementID = "menuNav" + (hundreds + itemCtr++);
                }
            }

        }
    }

    
    function isRoleAuthorizedToAccess(authorizedRoles) {
        var strAuthorizedRoles = objMenuState.userRoleID.toString();

        if (authorizedRoles.length === 0) {
            return true;
        } else {
            if (authorizedRoles.indexOf(",") !== -1) {
                var arr = authorizedRoles.split(",");

                for (var i = 0; i < arr.length; i++) {
                    if (arr[i] === strAuthorizedRoles) {
                        return true;
                    }
                }
            } else {
                if (strAuthorizedRoles === authorizedRoles) {
                    return true;
                }
            }
            return false;
        }
    }

    function buildSubmenu(tabMenuID, subMenuID, subMenu, menuItem) {
        var markup,
            subMenuHdr,
            subMenuItemID = 0, itemsToRender, maxLinksPerColumn = 5,
            whatsNewMarkup = "",
            groupIDs = [],
            divHeight = 0;

        if (subMenu.WhatsNewUrl.length > 0) {
            whatsNewMarkup = "<a class='mnuWhatsNew' href='" + subMenu.WhatsNewUrl + "' target='_blank'>What\'s New</a>";
        }

        // On Reports tab, if site doesn't have Tracers license we don't render Tracers or Tracers ER submenus.
        if (IsTrue(TRACERS_LICENSE_REQUIRED, subMenu.Rules)) {
            if (objMenuState.accessToTracers === false) {
                if (menuItem.Title === "Reports") {
                    return "";
                }
            }
        }

        subMenuHdr = menuTemplates.submenu.slice();
        subMenuHdr[1] = subMenu.ElementID;
        subMenuHdr[3] = subMenu.Title;
        markup = subMenuHdr.join('');

        numberOfItemsInLastColumn = 0;

        itemsToRender = lineItemsToRender(tabMenuID, subMenuID, subMenu);
        

        if (itemsToRender.length > numberOfItemsInLastColumn) {
            numberOfItemsInLastColumn = itemsToRender.length;
        }

        if (itemsToRender.length > maxLinksPerColumn) {

            var quotient, remainder, timesToLoop = 0, groupID = "", itemsInGroup = 0, idx = -1;

            markup = markup + "<ul>";

            quotient = Math.floor(itemsToRender.length / maxLinksPerColumn);
            remainder = (itemsToRender.length % maxLinksPerColumn) > 0 ? 1 : 0;
            timesToLoop = quotient + remainder;

            var z = 0;

            for (var x = 0; x < timesToLoop; x++) {
                if (x < timesToLoop - 1) {
                    markup = markup + '<div class="newspaperLeft"><ul>';
                } else {
                    markup = markup + '<div class="newspaperRight"><ul>';
                }

                for (var y = 0; y < maxLinksPerColumn; y++) {
                    var idx = (maxLinksPerColumn * x) + y;
                    if (idx < itemsToRender.length) {
                        markup = markup + itemsToRender[idx];
                    } else {
                        break;
                    }
                }

                if (x === 0) {
                    markup = markup + "</ul>" + whatsNewMarkup + "</div>";
                } else {
                    markup = markup + "</ul></div>";
                }
            }
        } else {
            markup = markup + "<ul>";
            for (var i = 0; i < itemsToRender.length; i++) {
                markup = markup + itemsToRender[i];
            }
        }

        markup = markup + "</ul></div>";

        return markup;
    }

    function lineItemsToRender(tabMenuID, subMenuID, subMenu) {
        var arr = [], skipMenuItem, subMenuItemID = 0, isDisabledLink = false

        for (var i = 0; i < subMenu.Links.length; i++) {
            
            subMenuItemID += 1;
            arr.push(buildMenuItem(tabMenuID, subMenuID, subMenuItemID, subMenu.Links[i]));
            
        }
        return arr;
    }

    function buildMenuItem(tabMenuID, subMenuID, subMenuItemID, menuItem) {
        // This function is not called outside of this component. Its only called from renderBreadCrumbTrail().
        var markup, disableLink = false, markupToReturn;

        if (menuItem.cssClass == 'inactive') {
            disableLink = true;
        }
        
        if (disableLink) {
            markup = menuTemplates.disabledLink.slice();
            markup[1] = menuItem.displayMessage;
            markup[3] = menuItem.Title;
        } else {
            markup = menuTemplates.enabledLink.slice();
            markup[1] = menuItem.ElementID;
            markup[3] = menuItem.Title;
        }
        markupToReturn = markup.join('');

        return markupToReturn;
    }

    var OpenMenuTimer;
    var CloseMenuTimer;
    var CloseCount=0;


    function open(event) {
        
        $('.disabledLink').tooltip({
            template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner large"></div></div>'
        });
        
        var $item = $(event.currentTarget),
            idx = $item.index();

        console.log("Index" + idx);

        clearTimeout(CloseMenuTimer);
        clearTimeout(OpenMenuTimer);

        CloseCount = 0;

        OpenMenuTimer = setTimeout(function () {
            openSubMenu($item, idx);
            return false;
        }, 500);
        
        return false;
    }

    function openSubMenu($item, idx) {

        console.log("Opening Submenu");

        CloseCount = 0;

        if (current !== idx) {
            $listItems.removeClass('cbp-hropen');
            $('#mainLayoutBody').removeClass('setOpaque');
        }
        if (!$item.hasClass('cbp-hropen')) {
            $item.addClass('cbp-hropen');
            $('#mainLayoutBody').addClass('setOpaque');
        }

        current = idx;

        return false;
    }

    function closemenu(event) {

        console.log("Entering Close");
        
        CloseCount += 1;

        clearTimeout(OpenMenuTimer);
        
        if (CloseCount == 1) {
            CloseMenuTimer = setTimeout(function () {
                $listItems.removeClass('cbp-hropen');
                $('#mainLayoutBody').removeClass('setOpaque');
                return false;
            }, 500);
        }
    }

    function itemClicked(e) {

        // When user clicks Reports|Reports Menu|Compliance: e.id will be "menuNav600". In markup, class='mnuLink' id='menuNav600'
        // When user clicks Reports|Reports Menu|Tracers:    e.id will be "menuNav601". In markup, class='mnuLink' id='menuNav601'
        // When user clicks Reports|Reports Menu|ER Tracers: e.id will be "menuNav602". In markup, class='mnuLink' id='menuNav602'
        var obj = document.getElementById(e.id);

        menuObject = getItemByElementID(e.id);

        objMenuState.pageID = menuObject.pageId;
        objMenuState.menuNavID = menuObject.elementID;

        var owner = menuObject.owner.toLowerCase();
        if (owner === "reports") {
            var u = menuObject.internalUrl + "?pageID=" + objMenuState.pageID;
            // Mark Orlando 12/5/2017. When moving between web pages in reports, the client must tell the server what pageId the user
            // is clicking on. This is required because AppSession.LinkType is read-only and derived from the pageID.
            window.location.href = menuObject.internalUrl + "?pageId=" + objMenuState.pageID;
        } else {
            window.location.href = "/Transfer/RedirectToWebApp?webapp=" + owner + "&pageId=" + menuObject.pageId;
        }
    }

    function getItemByElementID(requestedID) {
        var num = Number(requestedID.replace("menuNav", "")),
            subMenuTitle = "",
            menuSelected,
            itemFound = false,
            itemSelected = new menuItemSelected();

        if (num < 10) {
            menuSelected = hMenuData.Tabs[num - 1];

            itemSelected.menuTabId = hMenuData.Tabs[num - 1].ElementID;
            itemSelected.internalUrl = menuSelected.InternalUrl;
            itemSelected.externalUrl = menuSelected.ExternalUrl;
            itemSelected.elementID = menuSelected.ElementID;
            itemSelected.pageId = menuSelected.PageID;
            itemSelected.owner = menuSelected.Owner;
            itemSelected.menuTitle = menuSelected.Title;
            itemSelected.tabTitle = menuSelected.TabTitle;
            if (menuSelected.SubMenus.length === 0) {
                itemSelected.authorizedRoles = menuSelected.AuthorizedRoles;
            } else {
                itemSelected.authorizedRoles = menuItem.AuthorizedRoles;
            }
            itemSelected.rules = menuSelected.Rules;
        } else {
            var mainIdx = truncate((num / 100) - 1, 0);
            itemSelected.menuTitle = hMenuData.Tabs[mainIdx].Title;
            itemSelected.menuTabId = hMenuData.Tabs[mainIdx].ElementID;

            for (var i = 0; i < hMenuData.Tabs[mainIdx].SubMenus.length; i++) {
                if (itemFound) {
                    break;
                } else {
                    itemSelected.submenuTitle = hMenuData.Tabs[mainIdx].SubMenus[i].Title;
                }

                for (j = 0; j < hMenuData.Tabs[mainIdx].SubMenus[i].Links.length; j++) {
                    menuItem = hMenuData.Tabs[mainIdx].SubMenus[i].Links[j];
                    if (menuItem.ElementID === requestedID) {
                        itemSelected.internalUrl = menuItem.InternalUrl;
                        itemSelected.externalUrl = menuItem.ExternalUrl;
                        itemSelected.elementID = menuItem.ElementID;
                        itemSelected.pageId = menuItem.PageID;
                        itemSelected.owner = menuItem.Owner;
                        itemSelected.itemTitle = menuItem.Title;
                        itemFound = true;
                        itemSelected.authorizedRoles = menuItem.AuthorizedRoles;
                        itemSelected.rules = menuItem.Rules;
                        break;
                    }
                }
            }
        }
        return itemSelected;
    }

    function getItemByPageID(pageID) {
        // Example calls:   var downloadRFI  = hMenuBuilder.getItemByPageID(43);   -- Returns array with one element.
        //                  var noIdOnFile   = hMenuBuilder.getItemByPageID(0);    -- Can return MANY items.
        //                  var doesnotExist = hMenuBuilder.getItemByPageID(666);  -- Will return [].
        //                  var doesnotExist = hMenuBuilder.getItemByPageID('menuNav602'); 
        arr = [];

        for (var x = 0; x < hMenuData.Tabs.length; x++) {

            if (hMenuData.Tabs[x].PageID > 0) {
                if (pageID === hMenuData.Tabs[x].PageID) {
                    arr.push(getItemByElementID(hMenuData.Tabs[x].ElementID));
                }
            }

            for (var y = 0; y < hMenuData.Tabs[x].SubMenus.length; y++) {
                for (var z = 0; z < hMenuData.Tabs[x].SubMenus[y].Links.length; z++) {

                    if (hMenuData.Tabs[x].SubMenus[y].Links[z].PageID > 0) {
                        if (hMenuData.Tabs[x].SubMenus[y].Links[z].PageID === pageID) {
                            arr.push(getItemByElementID(hMenuData.Tabs[x].SubMenus[y].Links[z].ElementID));
                        }
                    }
                }
            }
        }
        return arr;
    }

    truncate = function (number, places) {
        var shift = Math.pow(10, places);
        return ((number * shift) | 0) / shift;
    };

    function menuItemSelected() {
        this.internalUrl = '';
        this.externalUrl = '';
        this.elementID = '';
        this.pageId = 0;
        this.owner = '';
        this.menuTitle = '';
        this.submenuTitle = '';
        this.itemTitle = '';
        this.menuTabId = '';
        this.rules = '';
    }

    function hideMenuItem(elementID) {
        hideShowMenuEntry(true, elementID);
    }

    function showMenuItem(elementID) {
        hideShowMenuEntry(false, elementID);
    }

    function hideShowMenuEntry(hideIt, elementID) {
        var num = Number(elementID.replace("menuNav", "")),
            subMenuTitle = "", i, j,
            menuSelected, itemFound = false;

        if (num < 10) {
            if (hMenuData.Tabs[num - 1].ElementID === elementID) {
                SetIsHidden(hideIt, hMenuData.Tabs[num - 1]);
            }
        } else {
            var mainIdx = truncate((num / 100) - 1, 0);

            for (var i = 0; i < hMenuData.Tabs[mainIdx].SubMenus.length; i++) {
                for (j = 0; j < hMenuData.Tabs[mainIdx].SubMenus[i].Links.length; j++) {
                    if (hMenuData.Tabs[mainIdx].SubMenus[i].Links[j].ElementID === elementID) {
                        SetIsHidden(hideIt, hMenuData.Tabs[mainIdx].SubMenus[i].Links[j]);
                        break;
                    }
                }
            }
        }
        buildByElementID(currentElementID)
    }

    function renderBreadCrumbTrail() {
        // This method is called by each web page in the reports application. For example, this function is
        // called at the bottom of the page: JCR.Reports\Areas\Corporate\Views\Home\Index.cshtml
        // $(document).ready(hMenuBuilder.renderBreadCrumbTrail("Reports"));

        var left = "",
            right = "",
            items, clone,
            isFound = false;
        htmlElement = document.getElementById("mnuBreadCrumbTrail");

        if (htmlElement !== null) {
            for (x = 0; x < hMenuData.Tabs.length; x++) {
                for (y = 0; y < hMenuData.Tabs[x].SubMenus.length; y++) {

                    left = hMenuData.Tabs[x].SubMenus[y].Title;

                    for (z = 0; z < hMenuData.Tabs[x].SubMenus[y].Links.length; z++) {

                        // location.pathname might look like: /Corporate/Home/Index
                        // Look through menu data to find entry that matches URL in address line.

                        if ((location.pathname === hMenuData.Tabs[x].SubMenus[y].Links[z].InternalUrl)) {
                            right = hMenuData.Tabs[x].SubMenus[y].Links[z].Title;

                            // Array.prototype.slice returns shallow copy of a portion of an array. Giving it 0 as the 
                            // first parameter means we're returning a copy of all the elements (starting at index 0).
                            clone = menuTemplates.breadCrumbTrail.slice(0);
                            clone[1] = left;
                            clone[3] = right;

                            htmlElement.innerHTML = clone.join('');

                            isFound = true;
                            break;
                        }
                    }
                }
            }
            return isFound;
        }
    }

    function SetIsHidden(hideIt, obj) {
        var isCurrentlyHidden = IsTrue(ENTRY_IS_HIDDEN, obj.Rules),
            rulesParsed = obj.Rules.split(" ");

        if (hideIt) {
            if (!isCurrentlyHidden) {
                // Add IsHidden
                rulesParsed.push("IsHidden");
                obj.Rules = rulesParsed.join(" ");
            }
        } else {
            if (isCurrentlyHidden) {
                // Remove IsHidden
                for (var i = 0; i < rulesParsed.length; i++) {
                    if (rulesParsed[i] === "IsHidden") {
                        rulesParsed[i] = "";
                    }
                }
                obj.Rules = rulesParsed.join(" ");
            }
        }
    }

    function IsTrue(ruleToFind, rules) {
        var result = false, rulesParsed;
        if (rules.length === 0) {
            return false;
        } else {
            rulesParsed = rules.split(" ");
            for (var i = 0; i < rules.length; i++) {
                if (rulesParsed[i] === ruleToFind) {
                    result = true;
                    break;
                }
            }
        }
        return result;
    }

    function setArg(key, value) {
        switch (key) {
            case "accessToAMP":
                objMenuState.accessToAMP = value;
                break;
            case "accessToCMS":
                objMenuState.accessToCMS = value;
                break;
            case "accessToEdition":
                objMenuState.accessToEdition = value;
                break;
            case "accessToERAMP":
                objMenuState.accessToERAMP = value;
                break;
            case "accessToERTracers":
                objMenuState.accessToERTracers = value;
                break;
            case "accessToMockSurvey":
                objMenuState.accessToMockSurvey = value;
                break;
            case "accessToTracers":
                objMenuState.accessToTracers = value;
                break;
            case "cycleEffectiveDate":
                objMenuState.cycleEffectiveDate = value;
                break;
            case "eProductID":
                objMenuState.eProductID = parseInt(value);
                break;
            case "isCurrentCycle":
                objMenuState.isCurrentCycle = value;
                break;
            case "menuNavID":
                objMenuState.menuNavID = value;
                break;
            case "navElementID":
                navElementID = value;
                break;
            case "pageID":
                objMenuState.pageID = parseInt(value);
                break;
            case "programID":
                objMenuState.programID = parseInt(value);
                break;
            case "siteID":
                objMenuState.siteID = parseInt(value);
                break;
            case "userIsMultiSiteAdmin":
                objMenuState.userIsMultiSiteAdmin = value;
                break;
            case "userRoleID":
                objMenuState.userRoleID = parseInt(value);
                break;
        }

        $.ajax({
            type: 'POST',
            url: baseAddress + 'MenuInfo/MenuStateSaveArg?userId=' + objMenuState.userID + '&key=' + key + '&value=' + value,
            data: {},
            dataType: 'json',
            contentType: 'application/json',
            headers: {
                'Token': objMenuState.authToken,
                'UserID': objMenuState.userID
            },
            success: function (data) {
                // console.log('SaveArg successfully completed.');
            },
            error: function (data) {
                // console.log(data.Content.ReadAsStringAsync().Result);
            }
        });
    }

    function init(userMenuState, webApiUrl, elementID) {
        if (objMenuState === undefined) {
            objMenuState = new IntegratedMenu.CommonCode.menuState;
        }
        objMenuState = userMenuState;
        baseAddress = webApiUrl;
        navElementID = elementID;
        refresh();
    }

    return {
        setArg: setArg,
        init: init,
        refresh: refresh,
        hideMenuItem: hideMenuItem,
        itemClicked: itemClicked,
        showMenuItem: showMenuItem,
        renderBreadCrumbTrail: renderBreadCrumbTrail
    };
})();