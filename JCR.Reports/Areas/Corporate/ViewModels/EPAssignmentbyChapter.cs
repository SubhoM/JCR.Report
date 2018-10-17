using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace JCR.Reports.Areas.Corporate.ViewModels
{
    public class EPAssignmentbyChapter : EPAssignmentSummary
    {
        public int ChapterID { get; set; }
        public string ChapterCode { get; set; }
        public string ChapterName { get; set; }
    }
}