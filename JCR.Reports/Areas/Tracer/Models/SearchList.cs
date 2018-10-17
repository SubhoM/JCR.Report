using System;
using System.Collections.Generic;
using System.Linq;
using JCR.Reports.Services;
namespace JCR.Reports.Models
{
    public class SearchList
    {
        public string ReportTitle { get; set; }
        public bool hasRanking1 { get; set; }
        public bool hasRanking2 { get; set; }
        public bool hasRanking3 { get; set; }

        public IEnumerable<TracersCategory> TracersCategories { get; set; }
        public IEnumerable<Tracers> TracersLists { get; set; }

        public IEnumerable<TracerSections> TracerSectionsLists { get; set; }

        public IEnumerable<TracerFrequency> TracerFrequencyLists { get; set; }

        public IEnumerable<TracersChapters> TracersChapters { get; set; }
        public IEnumerable<TracersStandards> TracersStandards { get; set; }
        public IEnumerable<CMSTags> CMSTags { get; set; }
        public IEnumerable<TracersEP> TracersEPs { get; set; }
        //public IEnumerable<UserSite> UserSiteLists { get; set; }

        //public IEnumerable<Program> ProgramLists { get; set; }
        public IEnumerable<OrgnizationType> OrganizationlevelLists { get; set; }
        public IEnumerable<OrgnizationType> CampusLists { get; set; }
        public IEnumerable<OrgnizationType> BuildingLists { get; set; }
        public IEnumerable<OrgnizationType> DepartmentLists { get; set; }

        public IEnumerable<TracersUser> TracersObsEnteredBy { get; set; }

        public string OrgRanking1Name { get; set; }
        public string OrgRanking2Name { get; set; }
        public string OrgRanking3Name { get; set; }

        public ReportType ReportType { get; set; }
        public RegulationType RegulationType { get; set; }


        public ReportTypeSumDet ReportTypeSumDet { get; set; }
        public GroupByObsQues GroupByObsQues { get; set; }
        public ReportTypeNoExcel ReportTypeNoExcel { get; set; }
        public ReportTypeExcel ReportTypeExcel { get; set; }

        public GroupByDepartment ReportTypeDepartmentAssignment { get; set; }

        public GroupBy GroupBy { get; set; }

        public TracerComplianceGroupBy TracerComplianceGroupBy { get; set; }
        public ReportGroupByType ReportGroupByType { get; set; }
        public ReportTypeGraphData ReportTypeGraphData { get; set; }

        public IEnumerable<TracersUser> AssignedTo { get; set; }
        public ObservationStatusReportType ObservationStatusReportType { get; set; }

        public IEnumerable<TracersStatus> TracerStatuses { get; set; }
       
    }

  
}