using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace JCR.Reports.Areas.Tracer.ViewModels
{
    public class QuestionEpRelation
    {
        
        public int SiteID { get; set; }
        public string TracerTemplateName { get; set; }
        public string TemplateStatus { get; set; }

        public string TracerCustomName { get; set; }
        public string TracerStatusName { get; set; }

        public int SortOrder { get; set; }

        public string QuestionText { get; set; }

        public DateTime StdEffectiveBeginDate { get; set; }

        public string EPChangeStatus { get; set; }

        public string ImpactOnQuestion { get; set; }

        public string StdEPMappingToQuestion { get; set; }

        public string EPTextMappingToQuestion { get; set; }

        public string ComparedStdEP { get; set; }

        public string ComparedEPText { get; set; }
        public string EpChangeDescription { get; set; }



    }
}