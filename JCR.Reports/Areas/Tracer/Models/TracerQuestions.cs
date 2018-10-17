using System;
using System.Collections.Generic;
using System.Linq;


namespace JCR.Reports.Models
{
    public class TracerQuestion
    {
        public Int64 RowNumber { get; set; }
        public int TracerCustomID { get; set; }
        public int TracerQuestionID { get; set; }
        public string QuestionText { get; set; }
        public string LinkHeader { get; set; }
        public int CountTracers { get; set; }
        public string TracerCustomName { get; set; }
        public string TracerQuestionCategoryID { get; set; }
        public string QuestionCategoryName { get; set; }

        public IEnumerable<TracerQuestion> TracerQuestionList { get; set; }
    }

    //public class TracerQuestions
    //{
    //    public IEnumerable<TracerQuestion> TracerQuestionList { get; set; }
    //}
}