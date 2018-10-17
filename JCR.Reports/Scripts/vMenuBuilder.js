var vMenuBuilder = (function () {

    var objMenuState,
        isUserGlobalAdmin,
        isTeaserEnabledForTracers,
        isTeaserEnabledForCMS,
        isFirstTimeClicked = true,
        navElementID   = "",                   // Contains DOM Element ID (DIV tag) where markup for dropdown menu gets inserted.
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
        SHOW_MOCK_SURVEY_TITLE_FOR_THIS_PAGE = "ShowTitle",
        REQUIRES_PROGRAM_ADMIN_ACCESS_TO_MULTIPLE_SITES = "MultiSiteAdmin",
        REQUIRES_ACCESS_TO_MULTIPLE_SITES = "MultiSite",
        CURRENT_CYCLE_SELECTED = "CurrCycle",
        ACCREDITATION = "Accreditation"

    menuTemplates.disabledLink = [
        '<div class="programElement text-left setupLink" style="padding-top:10px;"><span class="inactive" style="padding-left:15px; color: silver;" data-toggle="tooltip" data-trigger="hover" data-placement="bottom" data-html=true title="{{displayMessage}}">{{descr}}</span></div>'
    ].join('').split(/\{\{(.+?)\}\}/g);

    menuTemplates.disabledLinkTop = [
        '<div class="programElement text-left setupLink" style="padding-top:10px;"><span class="inactive" style="padding-left:15px; color: silver;" data-toggle="tooltip" data-trigger="hover" data-placement="top" data-html=true title="{{displayMessage}}">{{descr}}</span></div>'
    ].join('').split(/\{\{(.+?)\}\}/g);

    menuTemplates.enabledLink = [
        "<div class='programElement text-left setupLink'><a class='disabled-link' style='margin-left:-30px' id='{{id}}' onclick='vMenuBuilder.itemClicked(this);'>{{descr}}</a></div>"
    ].join('').split(/\{\{(.+?)\}\}/g);

    menuTemplates.breadCrumbTrail = [
        "<div style='float: left;'>",
             "<span class='breadCrumbSubheader'>{{submenuTitle}}</span>",
             "<span class='glyphicon glyphicon-one-fine-dot'></span>",
             "<span class='breadCrumbMenuLink'>{{itemTitle}}</span>",
        "</div>",
        "<div class='mockSurveyTitle'>{{mockSurveyTitle}}</div>"
    ].join('').split(/\{\{(.+?)\}\}/g);

    function refresh() {
        document.getElementById(navElementID).innerHTML = buildMarkup();
        
        $('.inactive').tooltip({
            template: '<div class="tooltip" role="tooltip" style="overflow:visible;"><div class="tooltip-arrow"></div><div class="tooltip-inner medium"></div></div>'
        });
    }

    function buildMarkup() {
        var markup = "", arr = [];

        var _tempVMenuData = $.extend(true, [], vMenuData.Links);

        var index = 0;

        _tempVMenuData = $.grep(_tempVMenuData, function (element) {

            var itemMenuPresent = filterfunction(element);

            if (itemMenuPresent == false)
                return false;

         

            if (element.cssClass == 'inactive') {                
                markup = index > 2 ? menuTemplates.disabledLinkTop.slice() : menuTemplates.disabledLink.slice();
                markup[1] = element.displayMessage;
                markup[3] = element.Title;
            } else {
                markup = menuTemplates.enabledLink.slice();
                markup[1] = element.ElementID;
                markup[3] = element.Title;
            }

            index += 1;
            
            arr.push(markup.join(''));

            return true;

        });

        
    
        return arr.join('\r\n');
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

    function isAuthorizedToAccess(authorizedRoles, userRoleID) {

        if (authorizedRoles.length === 0) {
            return true;
        } else {
            if (authorizedRoles.indexOf(",") !== -1) {
                var arr = authorizedRoles.split(",");

                for (var i = 0; i < arr.length; i++) {
                    if (arr[i] === userRoleID) {
                        return true;
                    }
                }
            } else {
                if (userRoleID === authorizedRoles) {
                    return true;
                }
            }
            return false;
        }
    }

    function hasValidLicense(license) {
        if (license === TRACERS_LICENSE_REQUIRED) {
            if (objMenuState.accessToTracers) {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    }

    function menuItemTemplate(rules) {
        var template = menuTemplates.enabledLink.slice();

        if (rules.length > 0) {
            rulesParsed = rules.split(" ");
            for (var i = 0; i < rules.length; i++) {
                if (rulesParsed[i] === CURRENT_CYCLE_SELECTED) {
                    if (!objMenuState.isCurrentCycle) {
                        template = menuTemplates.disabledLink.slice();
                    }
                }

                if (rulesParsed[i] === ACCREDITATION) {
                    if (objMenuState.programGroupTypeID > 1) {
                        template = menuTemplates.disabledLink.slice();
                    }
                }
            }
        }
        return template;
    }

    function itemClicked(e) {
        // When user clicks Reports|Reports Menu|Compliance: e.id will be "menuNav600". In markup, class='mnuLink' id='menuNav600'
        // When user clicks Reports|Reports Menu|Tracers:    e.id will be "menuNav601". In markup, class='mnuLink' id='menuNav601'
        // When user clicks Reports|Reports Menu|ER Tracers: e.id will be "menuNav602". In markup, class='mnuLink' id='menuNav602'
        //var obj = document.getElementById(e.id);

        menuObject = getItemByElementID(e.text);

        objMenuState.pageID = menuObject.pageId;
        objMenuState.menuNavID = menuObject.elementID;

        var owner = menuObject.owner.toLowerCase();
        if (owner === "reports") {
            window.location.href = menuObject.internalUrl;
        } else {
            if (owner === "admin") {
                window.location.href = "/Transfer/AdminRedirect";
            } else {
                window.location.href = "/Transfer/RedirectToWebApp?webapp=" + owner + "&pageId=" + menuObject.pageId;
            }
        }
    }

    function getItemByElementID(title) {
        //var idx = Number(requestedID.replace("menuNav", "")) - 101,
       var  menuSelected,
            itemFound = false,
            itemSelected = new menuItemSelected();

        menuSelected = search(vMenuData.Links, 'Title', title);

        itemSelected.internalUrl = menuSelected.InternalUrl;
        itemSelected.externalUrl = menuSelected.ExternalUrl;
        itemSelected.elementID = menuSelected.ElementID;
        itemSelected.pageId = menuSelected.PageID;
        itemSelected.owner = menuSelected.Owner;
        itemSelected.menuTitle = menuSelected.Title;
        itemSelected.authorizedRoles = menuSelected.AuthorizedRoles;
        itemSelected.rules = menuSelected.Rules;

        return itemSelected;
    }

    function search(myArray, fieldName, value) {
        for (var i = 0; i < myArray.length; i++) {
            if (myArray[i][fieldName] === value) {
                return myArray[i];
            }
        }
    }

    function menuItemSelected() {
        this.internalUrl = '';
        this.externalUrl = '';
        this.elementID = '';
        this.pageId = 0;
        this.owner = '';
        this.menuTitle = '';
        this.itemTitle = '';
        this.rules = '';
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

    function renderBreadCrumbTrail() {
        // This method is called by each web page in the reports application. For example, this function is
        // called at the bottom of the page: JCR.Reports\Areas\Corporate\Views\Home\Index.cshtml
        // $(document).ready(vMenuBuilder.renderBreadCrumbTrail("Reports"));

        var left = "Setup",
            right = "",
            showTitle = false,
            items, clone, msTitle = '',
            isFound = false;
        htmlElement = document.getElementById("mnuBreadCrumbTrail");

        if (htmlElement !== null) {
            for (z = 0; z < menuData.Links.length; z++) {

                // location.pathname might look like: /Corporate/Home/Index
                // Look through menu data to find entry that matches URL in address line.

                if ((location.pathname === menuData.Links[z].InternalUrl)) {
                    right = menuData.Links[z].Title;
                    showTitle = IsTrue(SHOW_MOCK_SURVEY_TITLE_FOR_THIS_PAGE, menuData.Links[z].Rules);

                    if (showTitle === true) {
                        msTitle = objMenuState.mockSurveyTitle;
                    }

                    // Array.prototype.slice returns shallow copy of a portion of an array. Giving it 0 as the 
                    // first parameter means we're returning a copy of all the elements (starting at index 0).
                    clone = menuTemplates.breadCrumbTrail.slice(0);
                    clone[1] = left;
                    clone[3] = right;
                    clone[5] = msTitle;

                    htmlElement.innerHTML = clone.join('');

                    isFound = true;
                    break;
                }
            }
            return isFound;
        }
    }

    return {
        init: init,
        refresh: refresh,
        itemClicked: itemClicked,
        renderBreadCrumbTrail: renderBreadCrumbTrail
    };
})();