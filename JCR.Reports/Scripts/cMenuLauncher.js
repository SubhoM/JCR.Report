var IntegratedMenu = IntegratedMenu || {};

IntegratedMenu.CommonCode = function () {
    function menuState() {
        var obj = {
            accessToAMP: false,
            accessToCMS: false,
            accessToEdition: false,
            accessToERAMP: false,
            accessToERTracers: false,
            accessToMockSurvey: false,
            accessToTracers: false,
            authToken: "",
            currentWebApp: "",
            cycleEffectiveDate: "",
            isCurrentCycle: true,
            mockSurveyTitle: "",
            pageID: 0,
            menuNavID: "",
            programID: 0,
            siteID: 0,
            userID: 0,
            userIsMultiSiteAdmin: false,
            userRoleID: 0,
            programGroupTypeID: 0
        };
        return obj;
    }

    function init(userID, authToken, baseAddress, pageID, currentWebApp, hNavElement, vNavElement) {

	    var objMenuState = new menuState;

	    currentWebApp = currentWebApp.toLowerCase();
	    if (currentWebApp == 'amp' || currentWebApp == 'tracers' || currentWebApp == 'reports') {
		    objMenuState.currentWebApp = currentWebApp;
	    } else {
		    alert('Developer: Parameter currentWebApp does not contain a valid value.')
	    }

	    objMenuState.userID = parseInt(userID);
	    objMenuState.authToken = authToken;
	    objMenuState.pageID = parseInt(pageID);       

	    $.ajax({
	        type: 'GET',
	        crossDomain: true,
	        url: baseAddress + 'MenuInfo/GetMenuState?userId=' + userID,
	        data: { },
	        dataType: 'json',
	        contentType: 'application/json',
	        headers: {                                             
	            'Token': authToken,
	            'UserID': userID
	        },
	        success: function (data) {                                               
	            objMenuState.siteID               = data.SiteID;
	            objMenuState.userRoleID           = data.UserRoleID;
	            objMenuState.programID            = data.ProgramID;
	            objMenuState.certificationItemID  = data.CertificationItemID;
	            objMenuState.isCurrentCycle       = data.IsCurrentCycle;
	            objMenuState.cycleEffectiveDate   = data.CycleEffectiveDate;
	            objMenuState.mockSurveyTitle      = data.MockSurveyTitle;
	            objMenuState.accessToEdition      = data.AccessToEdition;
	            objMenuState.accessToAMP          = data.AccessToAMP;
	            objMenuState.accessToTracers      = data.AccessToTracers;
	            objMenuState.accessToERAMP        = data.AccessToERAMP;
	            objMenuState.accessToERTracers    = data.AccessToERTracers;
	            objMenuState.accessToCMS          = data.AccessToCMS;
	            objMenuState.accessToMockSurvey   = data.AccessToMockSurvey;               
	            objMenuState.userIsMultiSiteAdmin = data.UserIsMultiSiteAdmin;
	            objMenuState.programGroupTypeID   = data.ProgramGroupTypeID;

	            hMenuBuilder.init(objMenuState, baseAddress, hNavElement);
	            vMenuBuilder.init(objMenuState, baseAddress, vNavElement);                 
	        },
	        error: function (data) {
	            console.log(data);
	        }
	    });
    }

    return {
        init: init,
        menuState: menuState
    };
}();