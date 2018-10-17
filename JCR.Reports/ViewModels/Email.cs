using System;
using System.Collections.Generic;
using System.Linq;


namespace JCR.Reports.ViewModels
{
    public class Email
    {
        public string To  { get; set; }
        public string Cc { get; set; }
        public string Bcc { get; set; }

        public string Subject { get; set; }
        public string  Comments { get; set; }

        public string Body { get; set; }

        public string Attachment { get; set; }

        public string From { get; set; }
        public string Title { get; set; }
        public bool MultipleAttachment { get; set; }
        public string ReportName { get; set; }

        public string[] GuidList { get; set; }

        public byte[] FileContents { get; set; }

        public List<string> AttachmentLocation { get; set; }
    }
}