using System;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Mvc.Html;
using System.ComponentModel.DataAnnotations;
using System.Linq.Expressions;
using System.Text;
using System.IO;

namespace JCR.Reports.Common
{
    public static class HtmlHelpers
    {
        public static MvcHtmlString RadioButtonsForEnum<TModel, TProperty>(this HtmlHelper<TModel> htmlHelper, Expression<Func<TModel, TProperty>> expression)
        {
            var metaData = ModelMetadata.FromLambdaExpression(expression, htmlHelper.ViewData);

            var listOfValues = Enum.GetNames(metaData.ModelType);

            var sb = new StringBuilder();

            if (listOfValues != null)
            {


                // Create a radio button for each item in the list
                foreach (var name in listOfValues)
                {
                    var label = name;

                    var memInfo = metaData.ModelType.GetMember(name);

                    if (memInfo != null)
                    {
                        var attributes = memInfo[0].GetCustomAttributes(typeof(DisplayAttribute), false);

                        if (attributes != null && attributes.Length > 0)
                            label = ((DisplayAttribute)attributes[0]).Name;
                    }

                    var id = string.Format(
                        "{0}_{1}_{2}",
                        htmlHelper.ViewData.TemplateInfo.HtmlFieldPrefix,
                        metaData.PropertyName,
                        name
                    );

                    var radio = htmlHelper.RadioButtonFor(expression, name, new { id = id }).ToHtmlString();

                    sb.AppendFormat("{0}{1}{2}", radio, HttpUtility.HtmlEncode(label), " ");
                }


            }

            return MvcHtmlString.Create(sb.ToString());
        }

        /// <summary>
        /// Html Helper to load the latest script files
        /// </summary>
        /// <param name="helper"></param>
        /// <param name="contentPath"></param>
        /// <returns></returns>
        public static HtmlString Script(this UrlHelper helper, string contentPath)
        {
            return new HtmlString(string.Format("<script type='text/javascript' src='{0}'></script>", GetLatest(helper, contentPath)));
        }

        /// <summary>
        /// Checks the last modified time stamp and appends that string as a querystring for the requested file.
        /// </summary>
        /// <param name="helper"></param>
        /// <param name="contentPath"></param>
        /// <returns></returns>
        public static string GetLatest(this UrlHelper helper, string contentPath)
        {
            string file = HttpContext.Current.Server.MapPath(contentPath);
            if (File.Exists(file))
            {
               // var dateTime = File.GetLastWriteTime(file);
                contentPath = string.Format("{0}?v={1}", contentPath, DateTime.Now.Ticks);
            }

            return helper.Content(contentPath);
        }
    }

    //public static class HtmlHelpers
    //{
    //    public static MvcHtmlString RadioButtonsForEnum<TModel, TProperty>(this HtmlHelper<TModel> htmlHelper, Expression<Func<TModel, TProperty>> expression)
    //    {
    //        var metaData = ModelMetadata.FromLambdaExpression(expression, htmlHelper.ViewData);

    //        var listOfValues = Enum.GetNames(metaData.ModelType);

    //        var sb = new StringBuilder();

    //        if (listOfValues != null)
    //        {
    //            sb = sb.AppendFormat("<ul>");

    //            // Create a radio button for each item in the list
    //            foreach (var name in listOfValues)
    //            {
    //                var label = name;

    //                var memInfo = metaData.ModelType.GetMember(name);

    //                if (memInfo != null)
    //                {
    //                    var attributes = memInfo[0].GetCustomAttributes(typeof(DisplayAttribute), false);

    //                    if (attributes != null && attributes.Length > 0)
    //                        label = ((DisplayAttribute)attributes[0]).Name;
    //                }

    //                var id = string.Format(
    //                    "{0}_{1}_{2}",
    //                    htmlHelper.ViewData.TemplateInfo.HtmlFieldPrefix,
    //                    metaData.PropertyName,
    //                    name
    //                );

    //                var radio = htmlHelper.RadioButtonFor(expression, name, new { id = id }).ToHtmlString();

    //                sb.AppendFormat("<li>{0}{1}</li>", radio, HttpUtility.HtmlEncode(label));
    //            }

    //            sb = sb.AppendFormat("</ul>");
    //        }

    //        return MvcHtmlString.Create(sb.ToString());
    //    }
    //}
}