using System;
using System.Collections.Generic;
using System.Linq;
using JCR.Reports.Services;
namespace JCR.Reports.Models
{
    public class ERSearchList
    {
        public string ReportTitle { get; set; }
        public IEnumerable<Tracers> TracersLists { get; set; }
        public IEnumerable<TracersCategory> TracerCategoryLists { get; set; }
        public IEnumerable<Department> DepartmentLists { get; set; }
        public IEnumerable<TracersStandards> TracersStandards { get; set; }
        public IEnumerable<TracersEP> TracersEPs { get; set; }
        public ERGroupBYProgramLevel ERGroupBYProgramLevel { get; set; }
        public ERGroupBYTracerLevel ERGroupBYTracerLevel { get; set; }
        public IEnumerable<Quarters> QuartersLists { get; set; }

    }
}