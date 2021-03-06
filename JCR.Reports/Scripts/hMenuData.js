﻿// In Tracers,        the URL to access the portal is: http://tracers.dev.devjcrinc.com/Transfer/Portal
// In Tracer Reports, the URL to access the portal is: http://reports.dev.devjcrinc.com/Transfer/Portal
// In AMP,            the URL to access the portal is: http://amp2.dev.devjcrinc.com/Home#/Portal
// In Admin,          the URL to access the portal is: http://amp.dev.devjcrinc.com/OwnerAdmin.aspx
var hMenuData = {
    "Tabs": [        
        {
            "Title": "Tracers",
            "AuthorizedRoles": "1,2,4,5,8,9",
            "Owner": "Tracers",
            "InternalUrl": "",
            "ExternalUrl": "",
            "Rules": "Tracers",
            "ElementID": "",
            "PageID": 0,
            "TabTitle": "",
            "SubMenus": [
                {
                    "Title": "Tracers",
                    "AuthorizedRoles": "1,2,4,8,9",
                    "Owner": "Tracers",
                    "WhatsNewUrl": "",
                    "Rules": "Tracers",
                    "ElementID": "",
                    "Links": [
                        {
                            "Title": "Tracers & Observations",
                            "AuthorizedRoles": "1,2,4,8,9",
                            "Owner": "Tracers",
                            "InternalUrl": "/Tracers/Tracers/ManageTracers",
                            "ExternalUrl": "",
                            "PageID": 1,
                            "Rules": "Tracers",
                            "ElementID": "",
                        },
                        {
                            "Title": "Create New TJC Tracer",
                            "AuthorizedRoles": "1,8,9",
                            "Owner": "Tracers",
                            "InternalUrl": "/Tracers/Tracers/CreateNewTJCTracer",
                            "ExternalUrl": "",
                            "PageID": 19,
                            "Rules": "Tracers",
                            "ElementID": "",
                        },
                        {
                            "Title": "Create New CMS Tracer",
                            "AuthorizedRoles": "1,8,9",
                            "Owner": "Tracers",
                            "InternalUrl": "/Tracers/Tracers/CreateNewCMSTracer",
                            "ExternalUrl": "",
                            "PageID": 20,
                            "Rules": "CMS Tracers",
                            "ElementID": "",
                        }
                    ]
                },                
                {
                    "Title": "Global Administration",
                    "AuthorizedRoles": "5",
                    "Owner": "Tracers",
                    "WhatsNewUrl": "",
                    "Rules": "IsHidden",
                    "ElementID": "",
                    "Links": [
                        {
                            "Title": "Home",
                            "AuthorizedRoles": "5",
                            "Owner": "Tracers",
                            "InternalUrl": "/Tracers/GlobalAdmin/ManageTemplates",
                            "ExternalUrl": "",
                            "PageID": 13,
                            "Rules": "",
                            "ElementID": "",
                        },
                        {
                            "Title": "EPs Not Referenced",
                            "AuthorizedRoles": "5",
                            "Owner": "Tracers",
                            "InternalUrl": "/Tracers/GlobalAdmin/EPsNotReferenced",
                            "ExternalUrl": "",
                            "PageID": 10,
                            "Rules": "",
                            "ElementID": "",
                        }
                    ]
                },                
            ]
        },
        {
            "Title": "Standards",
            "AuthorizedRoles": "1,2,4,8,9",
            "Owner": "AMP",
            "InternalUrl": "",
            "ExternalUrl": "",
            "Rules": "",
            "ElementID": "",
            "PageID": 0,
            "TabTitle": "",
            "SubMenus": [
                {
                    "Title": "Joint Commission Scoring",
                    "AuthorizedRoles": "1,2,4,8,9",
                    "Owner": "AMP",
                    "WhatsNewUrl": "http://www.jcrinc.com/",
                    "Rules": "",
                    "ElementID": "",
                    "Links": [
                        {
                            "Title": "Standards and Scoring",
                            "AuthorizedRoles": "1,2,4,8,9",
                            "Owner": "AMP",
                            "InternalUrl": "/AMP/JointCommission/StandardsAndScoring",
                            "ExternalUrl": "/Transfer/AppRedirect?pageName=StandardsAndScoring",
                            "PageID": 31,
                            "Rules": "ShowTitle AMP",
                            "ElementID": "",
                        },
                        {
                            "Title": "Bulk Scoring",
                            "AuthorizedRoles": "1,2,4",
                            "Owner": "AMP",
                            "InternalUrl": "",
                            "ExternalUrl": "/Transfer/AppRedirect?pageName=BulkUpdateScore",
                            "PageID": 40,
                            "Rules": "CurrCycle AMP",
                            "ElementID": "AMP",
                        },
                        {
                            "Title": "Bulk Plan of Action",
                            "AuthorizedRoles": "1,2,4",
                            "Owner": "AMP",
                            "InternalUrl": "",
                            "ExternalUrl": "/Transfer/AppRedirect?pageName=BulkUpdatePOA",
                            "PageID": 41,
                            "Rules": "CurrCycle AMP",
                            "ElementID": "AMP",
                        },
                        //{
                        //    "Title": "Mock Survey Setup",
                        //    "AuthorizedRoles": "1,2,8,9",
                        //    "Owner": "CurrCycle CorpSite AMP",
                        //    "InternalUrl": "/AMP/MockSurvey/Setup",
                        //    "ExternalUrl": "/Transfer/AppRedirect?pageName=MockSurveySetUp",
                        //    "PageID": 32,
                        //    "Rules": "CorpSite CurrCycle",
                        //    "ElementID": "",
                        //},                        
                    ]
                },
                {
                    "Title": "CMS Compliance",
                    "AuthorizedRoles": "1,2,4,8,9",
                    "Owner": "AMP",
                    "WhatsNewUrl": "",
                    "Rules": "CMS",
                    "ElementID": "",
                    "Links": [
                        {
                            "Title": "Regulations and Compliance",
                            "AuthorizedRoles": "1,2,4,8,9",
                            "Owner": "AMP",
                            "InternalUrl": "/AMP/CMSCompliance/RegulationsAndCompliance",
                            "ExternalUrl": "/Transfer/AppRedirect?pageName=CMSScoring",
                            "PageID": 47,
                            "Rules": "AMP CMS",
                            "ElementID": "",
                        }
                    ]
                }
            ]
        },
        {
            "Title": "Assignments",
            "AuthorizedRoles": "1,2,4,8,9",
            "Owner": "Tracers",
            "InternalUrl": "",
            "ExternalUrl": "",
            "Rules": "",
            "ElementID": "",
            "PageID": 0,
            "TabTitle": "",
            "SubMenus": [
                {
                    "Title": "Task Assignment",
                    "AuthorizedRoles": "1,2,4,8,9",
                    "Owner": "Tracers",
                    "WhatsNewUrl": "",
                    "Rules": "",
                    "ElementID": "",
                    "Links": [
                        {
                            "Title": "Manage Tasks",
                            "AuthorizedRoles": "1,2,4,8,9",
                            "Owner": "Tracers",
                            "InternalUrl": "/TaskAssignment/Tasks/ManageTasks",
                            "ExternalUrl": "/Transfer/AppRedirect?pageName=TaskAssignments",
                            "PageID": 25,
                            "Rules": "",
                            "ElementID": "",
                        },
                        {
                            "Title": "Create Tasks",
                            "AuthorizedRoles": "1,2,4,8,9",
                            "Owner": "Tracers",
                            "InternalUrl": "/TaskAssignment/Tasks/CreateNewTasks",
                            "ExternalUrl": "",
                            "PageID": 26,
                            "Rules": "",
                            "ElementID": "",
                        }
                    ]
                },
                {
                    "Title": "TJC Scoring Assignment",
                    "AuthorizedRoles": "1,2,4",
                    "Owner": "AMP",
                    "WhatsNewUrl": "",
                    "Rules": "",
                    "ElementID": "",
                    "Links": [
                        {
                            "Title": "New Scoring Assignments",
                            "AuthorizedRoles": "1,2,4",
                            "Owner": "AMP",
                            "InternalUrl": "/Corporate/Home/RedirectToApp?pageID=39",
                            "ExternalUrl": "/Transfer/AppRedirect?pageName=Assignment",
                            "PageID": 39,
                            "Rules": "AMP CurrCycle",
                            "ElementID": "",
                        },
                        {
                            "Title": "Re-assign EPs",
                            "AuthorizedRoles": "1,2,4",
                            "Owner": "AMP",
                            "InternalUrl": "",
                            "ExternalUrl": "",
                            "PageID": 42,
                            "Rules": "AMP CurrCycle",
                            "ElementID": "",
                        },
                    ]
                },
            ]
        },
        {
            "Title": "Reports",
            "AuthorizedRoles": "1,2,4,5,8,9",
            "Owner": "Reports",
            "InternalUrl": "",
            "ExternalUrl": "",
            "Rules": "",
            "ElementID": "",
            "PageID": 0,
            "TabTitle": "",
            "SubMenus": [
                {
                    "Title": "Create Report",
                    "AuthorizedRoles": "1,2,4,5,8,9",
                    "Owner": "Reports",
                    "WhatsNewUrl": "",
                    "Rules": "",
                    "ElementID": "",
                    "Links": [
                        {
                            "Title": "Tracers",
                            "AuthorizedRoles": "1,2,4,8,9",
                            "Owner": "Reports",
                            "InternalUrl": "/Tracer/Home/Index",
                            "ExternalUrl": "",
                            "PageID": 48,
                            "Rules": "Tracers",
                            "ElementID": "",
                        },
                        {
                            "Title": "Standards Update",
                            "AuthorizedRoles": "5",
                            "Owner": "Reports",
                            "InternalUrl": "/Tracer/Home/Index",
                            "ExternalUrl": "",
                            "Rules": "",
                            "ElementID": "",
                            "PageID": 48,
                            "Rules": "",
                        }, //Global Admin
                        {
                            "Title": "Standards",
                            "AuthorizedRoles": "1,2,4,8,9",
                            "Owner": "Reports",
                            "InternalUrl": "/Corporate/Home/Index",
                            "ExternalUrl": "/Corporate/Home/RedirectToApp?pageID=14",
                            "PageID": 14,
                            "ElementID": "",
                            "Rules": "AMP",
                        },
                        {
                            "Title": "Enterprise Tracers",
                            "AuthorizedRoles": "1,2,4,8,9",
                            "Owner": "Reports",
                            "InternalUrl": "/TracerER/Home/Index",
                            "ExternalUrl": "",
                            "PageID": 49,
                            "Rules": "ERTracers Tracers",
                            "ElementID": "",
                        },
                        {
                            "Title": "Score Analyzer",
                            "AuthorizedRoles": "1,2,4,8,9",
                            "Owner": "AMP",
                            "InternalUrl": "/Corporate/Home/RedirectToApp?pageID=34",
                            "ExternalUrl": "",
                            "Rules": "",
                            "ElementID": "",
                            "PageID": 34,
                            "TabTitle": "<div style='float: left;'><span class='breadCrumbSubheader'>Tracers with AMP</span><span class='glyphicon glyphicon-one-fine-dot'></span><span class='breadCrumbMenuLink'>Home Page</span></div>",
                            "Rules": "AMP",
                        }, // Score Analyzer
                        {
                            "Title": "Documentation Analyzer",
                            "AuthorizedRoles": "1,2,4,8,9",
                            "Owner": "AMP",
                            "InternalUrl": "/Corporate/Home/RedirectToApp?pageID=34",
                            "ExternalUrl": "",
                            "Rules": "",
                            "ElementID": "",
                            "PageID": 35,
                            "TabTitle": "<div style='float: left;'><span class='breadCrumbSubheader'>Tracers with AMP</span><span class='glyphicon glyphicon-one-fine-dot'></span><span class='breadCrumbMenuLink'>Home Page</span></div>",
                            "Rules": "AMP",
                        }, //Document Analyzer                       
                    ]
                },
                {
                    "Title": "My Saved Reports",
                    "AuthorizedRoles": "1,2,4,5,8,9",
                    "Owner": "Reports",
                    "WhatsNewUrl": "",
                    "Rules": "",
                    "ElementID": "",
                    "Links": [
                        {
                            "Title": "Tracers",
                            "AuthorizedRoles": "1,2,4,8,9",
                            "Owner": "Reports",
                            "InternalUrl": "/Tracer/Home/MyReports",
                            "ExternalUrl": "",
                            "PageID": 50,
                            "Rules": "Tracers",
                            "ElementID": "",
                        },
                        {
                            "Title": "Standards Update",
                            "AuthorizedRoles": "5",
                            "Owner": "Reports",
                            "InternalUrl": "/Tracer/Home/MyReports",
                            "ExternalUrl": "",
                            "PageID": 50,
                            "Rules": "",
                            "ElementID": "",
                        },
                        {
                            "Title": "Standards",
                            "AuthorizedRoles": "1,2,4,8,9",
                            "Owner": "Reports",
                            "InternalUrl": "/Corporate/Home/MyReports",
                            "ExternalUrl": "/Corporate/Home/RedirectToApp?pageID=15",
                            "PageID": 15,
                            "Rules": "AMP",
                            "ElementID": "",
                        },
                        {
                            "Title": "Enterprise Tracers",
                            "AuthorizedRoles": "1,2,4,8,9",
                            "Owner": "Reports",
                            "InternalUrl": "/TracerER/Home/MyReports",
                            "ExternalUrl": "",
                            "PageID": 51,
                            "Rules": "ERTracers Tracers",
                            "ElementID": "",
                        },
                    ]
                },
                {
                    "Title": "Site Saved Reports",
                    "AuthorizedRoles": "1,2,4,5,8,9",
                    "Owner": "Reports",
                    "WhatsNewUrl": "",
                    "Rules": "",
                    "ElementID": "",
                    "Links": [
                        {
                            "Title": "Tracers",
                            "AuthorizedRoles": "1,2,4,8,9",
                            "Owner": "Reports",
                            "InternalUrl": "/Tracer/Home/SearchReports",
                            "ExternalUrl": "",
                            "PageID": 52,
                            "Rules": "Tracers",
                            "ElementID": "",
                        },
                        {
                            "Title": "Standards Update",
                            "AuthorizedRoles": "5",
                            "Owner": "Reports",
                            "InternalUrl": "/Tracer/Home/SearchReports",
                            "ExternalUrl": "",
                            "PageID": 52,
                            "Rules": "",
                            "ElementID": "",
                        },
                        {
                            "Title": "Standards",
                            "AuthorizedRoles": "1,2,4,8,9",
                            "Owner": "Reports",
                            "InternalUrl": "/Corporate/Home/SearchReports",
                            "ExternalUrl": "/Corporate/Home/RedirectToApp?pageID=16",
                            "PageID": 16,
                            "Rules": "AMP",
                            "ElementID": "",
                        },
                        {
                            "Title": "Enterprise Tracers",
                            "AuthorizedRoles": "1,2,4,8,9",
                            "Owner": "Reports",
                            "InternalUrl": "/TracerER/Home/SearchReports",
                            "ExternalUrl": "",
                            "PageID": 53,
                            "Rules": "ERTracers Tracers",
                            "ElementID": "",
                        }
                    ]
                }
            ]
        }
    ]
};