using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace JCR.Reports.Areas.TracerER.ViewModels
{
    public class ErTracersbyQuestionData : ERTracersResponseSummary
    {
        public int QuestionNo { get; set; }
        public int TracerQuestionID { get; set; }
        public string QuestionText { get; set; }
    }
}