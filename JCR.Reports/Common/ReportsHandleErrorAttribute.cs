using System;
using System.Web;
using System.Web.Mvc;
using JCR.Reports.Services;
using JCR.Reports.Models;

namespace JCR.Reports.Common
{
    /// <summary>
    /// ERHandleErrorAttribute
    /// 
    /// Handle and log errors globally
    /// Setup in FilterConfig
    /// </summary>
    public class ReportsHandleErrorAttribute : HandleErrorAttribute
    {
        private ExceptionService _exceptionService = null;

        /// <summary>
        /// constructor
        /// </summary>
        public ReportsHandleErrorAttribute()
        {
            _exceptionService = new ExceptionService();
        }

        /// <summary>
        /// OnException: override 
        /// Handle and log errors
        /// </summary>
        /// <param name="filterContext">ExceptionContext</param>
        public override void OnException(ExceptionContext filterContext)
        {
            if (filterContext.ExceptionHandled || !filterContext.HttpContext.IsCustomErrorEnabled)
            {
                return;
            }

            if (new HttpException(null, filterContext.Exception).GetHttpCode() != 500)
            {
                return;
            }

            if (!ExceptionType.IsInstanceOfType(filterContext.Exception))
            {
                return;
            }

            string controllerName = null;
            string actionName = null;
            HandleErrorInfo model = null;

            // if the request is AJAX return JSON else view.
            if (filterContext.HttpContext.Request.Headers["X-Requested-With"] == "XMLHttpRequest")
            {
                filterContext.Result = new JsonResult
                {
                    JsonRequestBehavior = JsonRequestBehavior.AllowGet,
                    Data = new
                    {
                        error = true,
                        message = filterContext.Exception.Message
                    }
                };
            }
            else
            {
                controllerName = filterContext.RouteData.Values["controller"].ToString();
                actionName = filterContext.RouteData.Values["action"].ToString();
                model = new HandleErrorInfo(filterContext.Exception, controllerName, actionName);

                filterContext.Result = new ViewResult
                {
                    ViewName = View,
                    MasterName = Master,
                    ViewData = new ViewDataDictionary<HandleErrorInfo>(model),
                    TempData = filterContext.Controller.TempData
                };
            }

            // log the error 
            int userID = 0;
            int siteID = 0;
            if (AppSession.HasValidSession)
            {
                userID = AppSession.UserID.Value;
                siteID = AppSession.SelectedSiteId;
            }

            string transSQL = null;
            if (filterContext.Exception.Data.Count > 0)
            {
                foreach(var exceptionData in filterContext.Exception.Data)
                {
                    transSQL += exceptionData.ToString() + " ";
                }
            }
            ExceptionLog exceptionLog = new ExceptionLog
            {
                ExceptionText = "Reports: " + filterContext.Exception.Message,
                PageName = controllerName,
                MethodName = actionName,
                UserID = userID,
                SiteId = siteID,
                TransSQL = transSQL,
                HttpReferrer = null
            };
            _exceptionService.LogException(exceptionLog);

            filterContext.ExceptionHandled = true;
            filterContext.HttpContext.Response.Clear();
            filterContext.HttpContext.Response.StatusCode = 500;
            filterContext.HttpContext.Response.TrySkipIisCustomErrors = true;   
        }
    }
}