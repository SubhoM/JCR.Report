using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using JCR.Reports.Models;
using System.ComponentModel.DataAnnotations;

namespace JCR.Reports.Areas.TracerER.ViewModels
{
    public class CompliaceByTracerDetails
    {
        private List<QuestionBySiteInfo> _questionSite = new List<QuestionBySiteInfo>();

        public List<QuestionBySiteInfo> QuestionwiseSite
        {
            get { return _questionSite; }
            set { _questionSite = value; }
        }

        [Display(Name = "Question")]
        public string QuestionText { get; set; }

        public int QuesNo { get; set; }

        public int tracerquestion_rank { get; set; }

        public int tracercustom_rank { get; set; }

        public string Tracer { get; set; }
        public string OverallTracerCompliance { get; set; }
        public decimal OverallNum { get; set; }
        public decimal OverallDen { get; set; }

    }
}