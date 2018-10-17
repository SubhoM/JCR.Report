using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using JCR.Reports.Models;
using JCR.Reports.ViewModels;
using JCR.Reports.Common;
using Microsoft.Reporting.WebForms;
using Kendo.Mvc.UI;
using Kendo.Mvc.Extensions;
using JCR.Reports.Services;
using JCR.Reports.Areas.Tracer.ViewModels;
using System.Linq.Expressions;
using System.Text.RegularExpressions;

namespace JCR.Reports.Areas.Tracer.Services
{
    public class TracerDepartmentDashboard : BaseService
    {
        ExceptionService _exceptionService = new ExceptionService();
        public decimal overallNum = 0;
        public decimal overallDen = 0;

        public DataSourceResult DynamicGroupByTracerDepartmentColumns([DataSourceRequest]DataSourceRequest request, Search search)
        {
            List<TracerComplianceDashboardData> tracerCompliancePivot = new List<TracerComplianceDashboardData>();
            DataTable dt = new DataTable();
            DataSourceResult result = new DataSourceResult();
            try
            {

                dt = this.TracerComplianceDepartmentData(search).Tables[0];

                List<int> departmentColumn = (from table in dt.AsEnumerable()
                                                 orderby PadNumbers(table.Field<string>("OrgName_Rank1_Dept"))
                                                 select table.Field<int>("OrgName_Rank1_DeptID")).Distinct().ToList();
                   
                search.DepartmentIDs = departmentColumn.Count() > 100 ? string.Join(",", departmentColumn.Take(100).ToList()) : string.Join(",", departmentColumn);

                var departmentTransform = dt.ToList<ComplianceQuestionDetail>();
                //convert datatable to list       
                tracerCompliancePivot = TracerPivotconvert(departmentTransform, search);
                if(tracerCompliancePivot.Count == 0)
                {
                    throw (new Exception("No Data"));
                }
                tracerCompliancePivot = tracerCompliancePivot.OrderBy(c => c.TracerCustomName).ToList();
                result = tracerCompliancePivot.ToDataSourceResult(request, tc => new TracerComplianceDashboardData
                {
                    // TO DO Get Excel View DataSet
                    TracerCustomName = tc.TracerCustomName,
                    TracerCustomID = tc.TracerCustomID,
                    OutputDepartmentIds = tc.OutputDepartmentIds,
                    OverallTotalCompletedObservation = tc.OverallTotalCompletedObservation,
                    OverallTracerCompliance = tc.OverallTracerCompliance,
                    DepartmentwiseTracer = tc.DepartmentwiseTracer,
                });
            }
            catch (Exception ex)
            {
                if (ex.Message.ToString() == "No Data")
                {
                    result.Errors = WebConstants.NO_DATA_FOUND_EXCEL_VIEW;
                }
                else if (ex.Message.ToString() == "Limit")
                {
                    result.Errors = "Maximum limit of " + ConfigurationManager.AppSettings["ReportOutputLimit"].ToString() + " records reached. Refine your criteria to narrow the result.";
                }
                if (ex.Message.ToString() != "No Data" && ex.Message.ToString() != "Limit")
                {
                    ExceptionLog exceptionLog = new ExceptionLog
                    {
                        ExceptionText = "Reports: " + ex.Message,
                        PageName = "LoadTracerComplianceDepartmentGrid",
                        MethodName = "DynamicGroupByTracerDepartmentColumns",
                        UserID = Convert.ToInt32(AppSession.UserID),
                        SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                        TransSQL = "",
                        HttpReferrer = null
                    };
                    _exceptionService.LogException(exceptionLog);
                }
            }
            return result;

        }

        private List<TracerComplianceDashboardData> TracerPivotconvert(List<ComplianceQuestionDetail> departmentTransform, Search search)
        {
            List<TracerComplianceDashboardData> tracerCompliancePivot = new List<TracerComplianceDashboardData>();
            ERSearchInputService reportservice = new ERSearchInputService();
            //var departmentList = departmentTransform.Select(i=>i.OrgName_Rank1_Dept).Distinct().ToList();
            //departmentList.OrderBy(i => PadNumbers(i));
            List<string> departmentList = new List<string>();
            if (search.OrgTypeLevel1IDs == "")
            {
                departmentList = Array.ConvertAll(search.DepartmentNames.Split('€'), p => p.Trim()).ToList();
                departmentList.RemoveAt(0);
            }
            else
            {
                departmentList = Array.ConvertAll(search.OrgTypeLevel1SpecialCaseNames.Split('€'), p => p.Trim()).ToList();
            }
            departmentList.OrderBy(i => PadNumbers(i));
            foreach (var tracer in departmentTransform)
            {
                if (tracerCompliancePivot.Any(item => tracer.TracerCustomID == item.TracerCustomID))
                {
                    var newTracer = tracerCompliancePivot.First(item => string.Equals(tracer.TracerCustomName, item.TracerCustomName, StringComparison.CurrentCultureIgnoreCase));
                    AddTracerwiseDepartment(newTracer, tracer);
                }
                else
                {
                    var newTracer = PopulateDepartmentwiseInfo(departmentList);
                    newTracer.TracerCustomName = tracer.TracerCustomName;
                    newTracer.TracerCustomID = tracer.TracerCustomID;
                    newTracer.OutputDepartmentIds = search.DepartmentIDs;
                    tracerCompliancePivot.Add(AddTracerwiseDepartment(newTracer, tracer));
                }
            }
            return tracerCompliancePivot;
        }
        private TracerComplianceDashboardData AddTracerwiseDepartment(TracerComplianceDashboardData newTracer, ComplianceQuestionDetail departmentTransform)
        {
            newTracer.OverallTotalCompletedObservation += departmentTransform.TotalCompletedObservation;
            newTracer.OverallNum += departmentTransform.TotalNumerator;
            newTracer.OverallDen += departmentTransform.TotalDenominator;
            newTracer.OverallTracerCompliance = (newTracer.OverallDen == 0 && newTracer.OverallNum == 0) ? "N/A" : ((decimal)(100 * newTracer.OverallNum) / (decimal)newTracer.OverallDen).ToString("0.0") + "% (" + newTracer.OverallNum + "/" + newTracer.OverallDen + ")";
            newTracer.OverallTracerCompliance = newTracer.OverallTotalCompletedObservation == 0 ? "" : newTracer.OverallTracerCompliance;

            if (newTracer.DepartmentwiseTracer.Any(item => string.Equals(item.OrgName_Rank1_Dept, departmentTransform.OrgName_Rank1_Dept, StringComparison.CurrentCultureIgnoreCase)))
            {
                var tracerDepartmentInfo = newTracer.DepartmentwiseTracer.First(item => string.Equals(item.OrgName_Rank1_Dept, departmentTransform.OrgName_Rank1_Dept, StringComparison.CurrentCultureIgnoreCase));
                tracerDepartmentInfo.TotalCompletedObservation = departmentTransform.TotalCompletedObservation == 0 ? "" : departmentTransform.TotalCompletedObservation.ToString();
                tracerDepartmentInfo.Compliance = (departmentTransform.TotalDenominator == 0 && departmentTransform.TotalNumerator == 0) ? "N/A" : ((decimal)(100 * departmentTransform.TotalNumerator) / (decimal)departmentTransform.TotalDenominator).ToString("0.0") + "% (" + departmentTransform.TotalNumerator + "/" + departmentTransform.TotalDenominator + ")";
            }
            return newTracer;
        }
        private TracerComplianceDashboardData PopulateDepartmentwiseInfo(List<string> departmentList)
        {
            TracerComplianceDashboardData tcd = new TracerComplianceDashboardData();
            tcd.OverallTotalCompletedObservation = 0;
            tcd.OverallNum = 0;
            tcd.OverallDen = 0;
            foreach (var dept in departmentList)
            {
                tcd.DepartmentwiseTracer.Add(new TracerComplianceDepartmentInfo
                {
                    OrgName_Rank1_Dept = dept,
                    TotalCompletedObservation = "",
                    Compliance = ""
                });
            }
            return tcd;
        }
        public DataSourceResult _tracerComplianceDepartmentExcel([DataSourceRequest]DataSourceRequest request, Search search)
        {
            DataSourceResult result = new DataSourceResult();
            try
            {   
                List<ComplianceQuestionDetail> ComplianceQuestionDetailList = new List<ComplianceQuestionDetail>();
                DataTable dt = new DataTable();

                dt = ReportTracerComplianceDepartment(search).Tables[0];

                object totalNum = dt.Compute("Sum(Num)", "");
                object totalDen = dt.Compute("Sum(Den)", "");
                object totalCompliance = Convert.ToDecimal(totalDen) == 0 ? 0 : (Convert.ToDecimal(totalNum) / Convert.ToDecimal(totalDen)) * 100;
                object totalObservationCount = dt.AsEnumerable().DistinctBy(i=>i.Field<string>("Observation")).Sum(r => r.Field<Int32>("ObservationCount"));

                dt.Select().ToList<DataRow>().ForEach(r => { r["TotalNumerator"] = Convert.ToDecimal(totalNum); r["TotalDenominator"] = Convert.ToDecimal(totalDen); r["OverallCompliance"] = Convert.ToDecimal(totalCompliance); r["TotalObservationCount"] = Convert.ToInt32(totalObservationCount); });

                ComplianceQuestionDetailList = dt.ToList<ComplianceQuestionDetail>();
                
                result = ComplianceQuestionDetailList.ToDataSourceResult(request, cqc => new ComplianceQuestionDetail
                {

                    QuestionText = cqc.QuestionText.ReplaceSpecialCharacters(),
                    TotalNumerator = cqc.TotalNumerator,
                    TotalDenominator = cqc.TotalDenominator,
                    OverallCompliance = cqc.OverallCompliance,
                    TracerCustomName = cqc.TracerCustomName,
                    TracerSection = cqc.TracerSection,
                    QuesNo = cqc.QuesNo,
                    StandardEPs = cqc.StandardEPs.ReplaceNewline(),
                    Observation = cqc.Observation.ReplaceNewline(),
                    Num = cqc.Num,
                    Den = cqc.Den,
                    Compliance = cqc.Compliance,
                    OrgName_Rank3 = cqc.OrgName_Rank3,
                    OrgName_Rank2 = cqc.OrgName_Rank2,
                    OrgName_Rank1_Dept = cqc.OrgName_Rank1_Dept,
                    SurveyTeam = cqc.SurveyTeam.ReplaceNewline(),
                    MedicalStaffInvolved = cqc.MedicalStaffInvolved.ReplaceNewline(),
                    Location = cqc.Location.ReplaceNewline(),
                    MedicalRecordNumber = cqc.MedicalRecordNumber.ReplaceNewline(),
                    EquipmentObserved = cqc.EquipmentObserved.ReplaceNewline(),
                    ContractedService = cqc.ContractedService.ReplaceNewline(),
                    StaffInterviewed = cqc.StaffInterviewed.ReplaceNewline(),
                    TracerNote = cqc.TracerNote.ReplaceNewline(),
                    UpdatedByName = cqc.UpdatedByName,
                    ObservationDate = cqc.ObservationDate,
                    LastUpdated = cqc.LastUpdated,
                    QuestionNotes = cqc.QuestionNotes.ReplaceNewline(),
                    QID = cqc.QID,
                    LimitDepartment = cqc.LimitDepartment,
                    ObservationCount = cqc.ObservationCount,
                    TotalObservationCount = cqc.TotalObservationCount
                });
            }
            catch (Exception ex)
            {
                if (ex.Message.ToString() == "No Data")
                {
                    result.Errors = WebConstants.NO_DATA_FOUND_EXCEL_VIEW;
                }
                else if (ex.Message.ToString() == "Limit")
                {
                    result.Errors = "Maximum limit of " + ConfigurationManager.AppSettings["ReportOutputLimit"].ToString() + " records reached. Refine your criteria to narrow the result.";
                }

                if (ex.Message.ToString() != "No Data" && ex.Message.ToString() != "Limit")
                {
                    ExceptionLog exceptionLog = new ExceptionLog
                    {
                        ExceptionText = "Reports: " + ex.Message,
                        PageName = "TracerDepartmentDashboard",
                        MethodName = "_tracerComplianceDepartmentExcel",
                        UserID = Convert.ToInt32(AppSession.UserID),
                        SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                        TransSQL = "",
                        HttpReferrer = null
                    };
                    _exceptionService.LogException(exceptionLog);
                }
            }
            return result;
        }
        private DataSet ReportTracerComplianceDepartment(Search search)
        {
            DataSet ds = new DataSet();
            string spName = String.Empty;
            if (search.TracerListIDs == "-1") { search.TracerListIDs = string.Empty; }
            if (search.TracerCategoryIDs == "-1") { search.TracerCategoryIDs = string.Empty; }
            if (search.OrgTypeLevel3IDs == "-1") search.OrgTypeLevel3IDs = string.Empty;
            if (search.OrgTypeLevel2IDs == "-1") search.OrgTypeLevel2IDs = string.Empty;
            if (search.OrgTypeLevel1IDs == "-1") search.OrgTypeLevel1IDs = string.Empty;
            search.EndDate = (search.EndDate != null && search.EndDate.ToString() != "") ? search.EndDate.Value.Date.AddHours(23).AddMinutes(29).AddSeconds(59) : search.EndDate;
            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd;

                    spName = "ustReport_TracerComplianceDepartmentDetail";
                    cmd = new SqlCommand(spName, cn);
                    cmd.CommandTimeout = 900;//Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                    
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("TracerIDs", search.TracerListIDs);
                    cmd.Parameters.AddWithValue("TracerCategoryIDs", search.TracerCategoryIDs);
                    cmd.Parameters.AddWithValue("SiteID", AppSession.SelectedSiteId);
                    cmd.Parameters.AddWithValue("ProgramID", AppSession.SelectedProgramId);
                    cmd.Parameters.AddWithValue("TracerCustomID", search.SelectedTracerCustomID);
                    cmd.Parameters.AddWithValue("OutputDepartmentList", search.OutputDepartmentList);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank3", search.OrgTypeLevel3IDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank2", search.OrgTypeLevel2IDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank1_Depts", search.OrgTypeLevel1IDs);
                    cmd.Parameters.AddWithValue("OrgActive", search.InActiveOrgTypes ? -1 : 1);
                    cmd.Parameters.AddWithValue("CycleID", AppSession.CycleID);
                    cmd.Parameters.AddWithValue("StartDate", search.StartDate);
                    cmd.Parameters.AddWithValue("EndDate", search.EndDate);
                    cmd.Parameters.AddWithValue("TracerTypeID", search.TracerTypeID);

                    CreateSQLExecuted(spName, cmd);
#if DEBUG
                    System.Diagnostics.Debug.WriteLine(_SQLExecuted);
#endif
                    SqlDataAdapter da = new SqlDataAdapter(cmd);

                    using (cn)
                    using (cmd)
                    using (da)
                    {
                        da.Fill(ds);
                    }
                }
            }
            catch (SqlException)
            {
                throw (new Exception("Limit"));
            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }
            int rowsCount = ds.Tables[0].Rows.Count;
            if(search.SelectedTracerCustomID == 0)
            {
                if (rowsCount == 0)
                    throw (new Exception("No Data"));
                else if (rowsCount > Convert.ToInt32(ConfigurationManager.AppSettings["ReportOutputLimitExcelView"].ToString()))
                    throw (new Exception("Limit"));
            }
            return ds;
        }
        private DataSet TracerComplianceDepartmentData(Search search)
        {
            DataSet ds = new DataSet();
            string spName = String.Empty;

            try
            {
                if (search.TracerListIDs == "-1") { search.TracerListIDs = string.Empty; }
                if (search.TracerCategoryIDs == "-1") { search.TracerCategoryIDs = string.Empty; }
                if (search.OrgTypeLevel3IDs == "-1") search.OrgTypeLevel3IDs = string.Empty;
                if (search.OrgTypeLevel2IDs == "-1") search.OrgTypeLevel2IDs = string.Empty;
                if (search.OrgTypeLevel1IDs == "-1") search.OrgTypeLevel1IDs = string.Empty;
                search.EndDate = (search.EndDate != null && search.EndDate.ToString() != "") ? search.EndDate.Value.Date.AddHours(23).AddMinutes(29).AddSeconds(59) : search.EndDate;

                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd;
                    spName = "ustReport_TracerComplianceDepartmentSummary";
                    cmd = new SqlCommand(spName, cn);
                    cmd.CommandTimeout = 900; //Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;

                    cmd.Parameters.AddWithValue("TracerIDs", search.TracerListIDs);
                    cmd.Parameters.AddWithValue("TracerCategoryIDs", search.TracerCategoryIDs);
                    cmd.Parameters.AddWithValue("SiteID", AppSession.SelectedSiteId);
                    cmd.Parameters.AddWithValue("ProgramID", AppSession.SelectedProgramId);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank3", search.OrgTypeLevel3IDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank2", search.OrgTypeLevel2IDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank1_Depts", search.OrgTypeLevel1IDs);
                    cmd.Parameters.AddWithValue("OrgActive", search.InActiveOrgTypes ? -1 : 1);
                    cmd.Parameters.AddWithValue("CycleID", AppSession.CycleID);
                    cmd.Parameters.AddWithValue("StartDate", search.StartDate);
                    cmd.Parameters.AddWithValue("EndDate", search.EndDate);
                    cmd.Parameters.AddWithValue("TracerTypeID", search.TracerTypeID);

                    CreateSQLExecuted(spName, cmd);
#if DEBUG
                    System.Diagnostics.Debug.WriteLine(_SQLExecuted);
#endif
                    SqlDataAdapter da = new SqlDataAdapter(cmd);

                    using (cn)
                    using (cmd)
                    using (da)
                    {
                        da.Fill(ds);
                    }
                }
            }
            catch (SqlException)
            {
                throw (new Exception("Limit"));
            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;

            }
            int rowsCount = ds.Tables[0].Rows.Count;

            if (rowsCount == 0)
                throw (new Exception("No Data"));
            else if (rowsCount > Convert.ToInt32(ConfigurationManager.AppSettings["ReportOutputLimitExcelView"].ToString()))
                throw (new Exception("Limit"));
            return ds;
        }
        public string PadNumbers(string input)
        {
            return Regex.Replace(input, "[0-9]+", match => match.Value.PadLeft(10, '0'));
        }
    }
}