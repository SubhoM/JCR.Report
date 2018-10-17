using System;
using System.Collections.Generic;
using System.Linq;


namespace JCR.Reports.Models
{
    public class TracerQuestionDetail
    {
        public string TracerCustomName { get; set; }
        public int TracerCustomID { get; set; }
        public string QuestionCategoryName { get; set; }
        public string TracerQuestionCategoryID { get; set; }
        public int TracerQuestionID { get; set; }
       // public string QuestionText { get; set; }
        public int QuesNo { get; set; }
        public string StandardEP { get; set; }


        public IEnumerable<TracerQuestionDetail> TracerQuestionDetailList { get; set; }
    }
}