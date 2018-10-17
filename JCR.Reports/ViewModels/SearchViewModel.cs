using System;
using System.Collections.Generic;
using System.Linq;
using JCR.Reports.Models;
namespace JCR.Reports.ViewModels
{
    public class SearchViewModel
    {


        public List<ReportDetail> ERReportList { get; set; }
        public List<MyReportDetail> ERMyReportList { get; set; }
        public string SelectedCreatedByUserIds { get; set; }
        public Nullable<DateTime> SelectedCreateDateFrom { get; set; }
        public Nullable<DateTime> SelectedCreateDateThru { get; set; }
        public string SelectSearchReportID { get; set; }
     
        public string SelectedScheduleTypeIds { get; set; }
        public List<UserInfo> CreatedByUsers;

        public List<ScheduleRecurrenceType> ScheduleTypes;
    }
}