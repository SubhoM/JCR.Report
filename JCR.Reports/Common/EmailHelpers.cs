
using System;
using System.Collections.Specialized;
using System.IO;
using System.Net.Mail;
using System.Web;
using JCR.Reports.ViewModels;
using System.Text;
using System.Data;
using System.Configuration;
using System.Xml.Linq;
using System.Collections.Generic;
using JCR.Reports.Models;
using System.Net;

namespace JCR.Reports.Common 
{ 
    public static class EmailHelpers
    {
        #region Public Methods and Operators

        public static string LoadEmailTemplate(string templateFileName, NameValueCollection nvc)
        {
            return LoadEmailTemplate(
                HttpContext.Current.Server.MapPath(@"~\EmailTemplates\"), 
                templateFileName, 
                nvc);
        }

        private static string LoadEmailTemplate(string templateFolder, string templateFileName, NameValueCollection nvc)
        {
            string html;
            using (var reader = new StreamReader(templateFolder + templateFileName))
            {
                html = reader.ReadToEnd();
                reader.Close();
            }

            if (nvc != null)
            {
                foreach (string key in nvc.AllKeys)
                {
                    html = html.Replace("%%" + key + "%%", nvc.Get(key));
                }
            }

            return html;
        }

        public static string ToCSV(this DataTable table, string delimator)
        {
            var result = new StringBuilder();
            for (int i = 0; i < table.Columns.Count; i++)
            {
                result.Append(table.Columns[i].ColumnName);
                result.Append(i == table.Columns.Count - 1 ? "\n" : delimator);
            }
            foreach (DataRow row in table.Rows)
            {
                for (int i = 0; i < table.Columns.Count; i++)
                {
                    result.Append(row[i].ToString());
                    result.Append(i == table.Columns.Count - 1 ? "\n" : delimator);
                }
            }
            return result.ToString().TrimEnd(new char[] { '\r', '\n' });
            //return result.ToString();
        }
        public static XDocument ConvertCsvToXML(string csvString, string[] separatorField)
        {
            //split the rows
            var sep = new[] { "\n" };
            string[] rows = csvString.Split(sep, StringSplitOptions.RemoveEmptyEntries);
            //Create the declaration
            var xsurvey = new XDocument(
                new XDeclaration("1.0", "UTF-8", "yes"));
            var xroot = new XElement("root"); //Create the root
            for (int i = 0; i < rows.Length; i++)
            {
                //Create each row
                if (i > 0)
                {
                    xroot.Add(rowCreator(rows[i], rows[0], separatorField));
                }
            }
            xsurvey.Add(xroot);
            return xsurvey;
        }
        public static DataTable ToDataTable(this XElement element)
        {
            DataSet ds = new DataSet();
            string rawXml = element.ToString();
            ds.ReadXml(new StringReader(rawXml));
            return ds.Tables[0];
        }


        public static DataTable ToDataTable(this IEnumerable<XElement> elements)
        {
            return ToDataTable(new XElement("Root", elements));
        }


        /// <summary>
        /// Private. Take a csv line and convert in a row - var node
        /// with the fields values as attributes. 
        /// <param name=""row"" />csv row to process</param />
        /// <param name=""firstRow"" />First row with the fields names</param />
        /// <param name=""separatorField"" />separator string use in the csv fields</param />
        /// </summary></returns />
        private static XElement rowCreator(string row,
                       string firstRow, string[] separatorField)
        {

            string[] temp = row.Split(separatorField, StringSplitOptions.None);
            string[] names = firstRow.Split(separatorField, StringSplitOptions.None);
            var xrow = new XElement("row");
            for (int i = 0; i < temp.Length; i++)
            {
                //Create the element var and Attributes with the field name and value
                var xvar = new XElement("var",
                                       new XAttribute("name", names[i]),
                                       new XAttribute("value", temp[i]));
                //var xvar = new XElement(names[i]);
                //var xvar1 = new XElement(temp[i]);

                //xvar.Add(xvar1);
                xrow.Add(xvar);
            }
            return xrow;
        }
        #endregion

        private static MailAddressCollection emaillist(string emailaddress)
        { 
         MailAddressCollection addressList = new MailAddressCollection();

            foreach (var curr_address in emailaddress.Split(new[] { ";" }, StringSplitOptions.RemoveEmptyEntries))
            {
                if (curr_address.Trim() != "")
                { 
                MailAddress myAddress = new MailAddress(curr_address.Trim());
                addressList.Add(myAddress);
                }
            }
            return addressList;
        }
        
        public static void SendEmail(Email email,int actionTypeId, string EmailFrom="")
        {
           
            SmtpClient smt = new SmtpClient();
            MailMessage siteEmail = new MailMessage();
            siteEmail.IsBodyHtml = true;
            siteEmail.Body = email.Body;
          //  ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
            if (EmailFrom.Length > 0)
            {
                siteEmail.From = new MailAddress(ConfigurationManager.AppSettings[EmailFrom]);
            }
            else {
                if (AppSession.LinkType == 10)
                {
                    siteEmail.From = new MailAddress(ConfigurationManager.AppSettings["FromEREmailAddress"]);

                }
                else if (AppSession.LinkType == 11)
                {
                    siteEmail.From = new MailAddress(ConfigurationManager.AppSettings["FromAMPEmailAddress"]);
                }
                else
                {
                    siteEmail.From = new MailAddress(ConfigurationManager.AppSettings["FromEmailAddress"]);
                }
            }
           

            siteEmail.To.Add(emaillist(email.To).ToString());

            if (email.Cc != null && email.Cc.Length > 0)
            {
                if (email.Cc != "abc@example.com;xyz@etc.com") { siteEmail.CC.Add(emaillist(email.Cc).ToString()); }
                
            }
            if (email.Bcc != null &&  email.Bcc.Length > 0)
            {
                if (email.Bcc != "abc@example.com;xyz@etc.com") { siteEmail.Bcc.Add(emaillist(email.Bcc).ToString()); }
               
            }
            //siteEmail.Bcc.Add(emaillist(ConfigurationManager.AppSettings["BCCEmailAddress"]).ToString());

            //Subject Line: 
            //[HCOID/SiteID] -  [Application Name]:  Report Name – “Sent to you by”  [first name]&[Last Name]
            //HCO ID:  337845:  Tracers:  Comprehensive Scoring Report – Sent to you by Chastity Dailey

            if (email.Subject != null && email.Subject.Length > 0)
            {
                siteEmail.Subject = email.Subject; // +"-" + AppSession.SelectedSiteName + "-Tracers: " + email.Title + " Sent to you by " + AppSession.FullName;
           
            }
            else
            {
                if (AppSession.LinkType == 11)
                {
                    siteEmail.Subject = "AMP: " + email.Title + " Sent to you by " + AppSession.FullName;
                }
                else
                {
                    siteEmail.Subject = AppSession.SelectedSiteName + "-Tracers: " + email.Title + " Sent to you by " + AppSession.FullName;
                }

                

            }

         
            string smtpServer = null;
            //****************Send It!!!

            try
            {
                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
                smtpServer = ConfigurationManager.AppSettings["SMTPserver"];
              

               //if (email.AttachmentLocation != null && email.AttachmentLocation.Capacity > 0)
               //{
               //    foreach (string filelocation in email.AttachmentLocation)
               //    {
               //        if (filelocation != "")
               //        {

               //        var item = new Attachment(filelocation);
               //        siteEmail.Attachments.Add(item);
               //        }
               //    }

                   
               //}

                string applicationCode = ApplicationCode.Reports.ToString();
                int userId = (int)AppSession.UserID;
                string fnReturnValue = string.Empty;
                int siteId = (int)AppSession.SelectedSiteId;
                List<string> guidList = new List<string>();
                // Invoke the CCM Service to send the email
               
                CCMService.ProcessEmailClient oEmail = new CCMService.ProcessEmailClient();
                CCMService.MailDetails mailDetails = new CCMService.MailDetails();
                mailDetails.EmailTo = siteEmail.To.ToString();
                mailDetails.FromEmail = siteEmail.From.ToString();
                mailDetails.EmailCC = email.Cc;
                mailDetails.EmailBCC = email.Bcc;
                mailDetails.MailSubject = siteEmail.Subject;
                mailDetails.MailContent = siteEmail.Body;
                mailDetails.SiteID = siteId;

                if(email.GuidList!=null && email.GuidList.Length>0)
                {
                    foreach(string guid in email.GuidList)
                    {
                        if(guid!=null)
                        {
                            guidList.Add(guid);
                        }
                    }
                }

                mailDetails.GuidList = guidList.ToArray();
                int result = oEmail.SendGeneralEmail(mailDetails, ref fnReturnValue, applicationCode, actionTypeId, userId);

                if (result != 1)
                    throw new Exception(fnReturnValue);

            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}