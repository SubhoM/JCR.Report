using System;
using System.ComponentModel.DataAnnotations;
namespace JCR.Reports.Services
{
    public enum CategoryHierarchy
    {
        Campus = 3,
        Building = 2,
        Department = 1
    }

    public enum ReportType
    {
        
        [Display(Name = "Graph",Order =0)]
        GraphOnly = 1,
        [Display(Name = "Data", Order = 1)]
        DataOnly = 2,
        [Display(Name = "Graph & Data", Order = 2)]
        GraphandData =3,
        [Display(Name = "Excel View", Order = 3)]
        ExcelView = 100
    }

    public enum RegulationType
    {

        [Display(Name = "TJC", Order = 0)]
        TJC = 1,
        [Display(Name = "CMS", Order = 1)]
        CMS = 2
    }


    public enum ReportTypeNoExcel
    {
        [Display(Name = "Graph")]
        GraphOnly = 1,
        [Display(Name = "Data")]
        DataOnly = 2,
        [Display(Name = "Graph & Data")]
        GraphandData = 3
    }
    public enum ReportTypeExcel
    {
        [Display(Name = "Graph")]
        GraphOnly = 1,
        [Display(Name = "Excel View", Order = 2)]
        ExcelView = 2
    }
    public enum ReportTypeGraphData
    {
        [Display(Name = "Graph")]
        GraphOnly = 1,
        [Display(Name = "Data", Order = 2)]
        Data = 2
    }
    public enum GroupByObsQues
    {
        [Display(Name = "Question")]
        Question = 0,
        [Display(Name = "Observation")]
        Observation = 1
    }
    public enum GroupBy
    {
        Observation = 0,
        Question = 1
    }
    
    public enum TracerComplianceGroupBy
    {
        [Display(Name = "Monthly")]
        Monthly = 1,
        [Display(Name = "Quarterly")]
        Quarterly = 2,
        [Display(Name = "Weekly")]
        Weekly = 3,
        [Display(Name = "Daily")]
        Daily = 4
    }

    public enum TracerDepartmentFrequencyEnum
    {
        [Display(Name ="Daily")]
        Daily = 1,
        [Display(Name = "Weekly")]
        Weekly = 2,
        [Display(Name = "Monthly")]
        Monthly = 3,
        [Display(Name = "Quarterly")]
        Quarterly = 4,
        [Display(Name = "Semi-Annually")]
        SemiAnnualy =5,
        [Display(Name = "Annually")]
        Annually = 6

    }

    public enum GroupByDepartment
    {
        [Display(Name = "Tracer")]
        Tracer = 1,
        [Display(Name = "Department")]
        Department = 2,
        

    }
    public enum ReportTypeSumDet
    {
        Summary = 0,
        Detail = 1,
        [Display(Name = "Excel View")]
        ExcelView = 2
    }

    public enum ReportGroupByType
    {
        Standard = 0,
        EP = 1,
        [Display(Name = "EP with Questions")]
        EPWithQuestions = 2,
        [Display(Name = "EP with Department")]
        EpWithDepartment = 3
    }

    public enum ObservationStatusReportType
    {
        [Display(Name = "Detail")]
        Detail = 0,
        [Display(Name = "Summary (Monthly)")]
        Monthly = 1

    }

    public enum TracerStatusType
    {
        Tracer = 3,
        Task = 4,
        Observation = 5,
        Question = 6
    }

    public enum ERGroupBYProgramLevel
    {
        [Display(Name = "By Site")]
        BySite = 1,
        [Display(Name = "By Chapter", Order = 2)]
        ByChapter = 2
    }

    public enum ERGroupBYTracerLevel
    {
        [Display(Name = "By Site")]
        BySite = 1,
        [Display(Name = "By Tracer", Order = 2)]
        ByTracer = 2
    }

}