using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace JCR.Reports.Areas.TracerER.ViewModels
{
    public class ErTracersbyChapterData : ERTracersResponseSummary
    {
        public int ChapterID { get; set; }
        public string ChapterCode { get; set; }
        public string ChapterName { get; set; }
    }
}