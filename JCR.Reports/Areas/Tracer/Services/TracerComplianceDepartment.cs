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
    public class TracerComplianceDepartment : BaseService
    {
        ExceptionService _exceptionService = new ExceptionService();

        private const int MaxBuckets = 100;
        public string ExceedLimit = string.Empty;
        public string RecordStatus = string.Empty;
        public string OutputDepartmentIds = string.Empty;
        //public char[] specialChar = { '.', ' ','*','|'};
        public int NumberOfBuckets { get; set; }
        public DataTable DynamicGroupByDepartmentColumns(Search search)
        {
            ExceedLimit = "false";
            DataTable oGroupByDepartment = new DataTable();
            DataTable oPivotData = new DataTable();
            DataTable oDynamicColumns = new DataTable();

            try
            {
                //dynamic column generation


                RecordStatus = "FALSE";

                oGroupByDepartment = this.ComplianceDepartmentData(search).Tables[0];

                oDynamicColumns = GenerateDynamicColumns(oGroupByDepartment);

                if (oGroupByDepartment != null)
                {
                    if (oGroupByDepartment.Rows.Count > 0)
                    {

                        var groupedTracerData = (from row in oGroupByDepartment.AsEnumerable()
                                                 group row by new
                                                 {
                                                     QID = row.Field<Int32>("QID"),
                                                     QuesNo = row.Field<Int32>("QuesNo"),
                                                     QuestionText = row.Field<String>("QuestionText"),
                                                     QuestionID = row.Field<Int32>("QuestionID"),
                                                     TracerQuestionRank = row.Field<Int32>("TracerQuestionRank"),
                                                     OrgName_Rank1_DeptID = row.Field<Int32>("OrgName_Rank1_DeptID"),
                                                     OrgName_Rank1_Dept = row.Field<String>("OrgName_Rank1_Dept"),
                                                     TotalNumerator = row.Field<Decimal>("TotalNumerator"),
                                                     TotalDenominator = row.Field<Decimal>("TotalDenominator"),
                                                     Compliance = row.Field<Decimal>("Compliance")
                                                 } into g
                                                 select new
                                                 {
                                                     QID = g.Key.QID,
                                                     QuesNo = g.Key.QuesNo,
                                                     QuestionText = g.Key.QuestionText,
                                                     QuestionID = g.Key.QuestionID,
                                                     TracerQuestionRank = g.Key.TracerQuestionRank,
                                                     OrgName_Rank1_DeptID = g.Key.OrgName_Rank1_DeptID,
                                                     OrgName_Rank1_Dept = g.Key.OrgName_Rank1_Dept,
                                                     TotalNumerator = g.Key.TotalNumerator,
                                                     TotalDenominator = g.Key.TotalDenominator,
                                                     Compliance = g.Key.Compliance
                                                 }).Distinct()
                                  .ToList().ToDataTable();


                        if (groupedTracerData != null)
                        {
                            if (groupedTracerData.Rows.Count > 0)
                            {
                                oPivotData = Pivotconvert(groupedTracerData, oDynamicColumns);
                                if (search.TracerListNames.Split(',').ToArray().Count() == 1)
                                {
                                    if (search.TracerListNames.Contains("All"))
                                    {
                                        oPivotData.Columns.Remove("QuesNo");
                                        oPivotData = oPivotData.AsEnumerable().OrderBy(i => PadNumbers(i.Field<string>("OverallComp"))).CopyToDataTable();
                                    }
                                    else
                                    {
                                        oPivotData = oPivotData.AsEnumerable().OrderBy(i => i.Field<Int32>("QuesNo")).CopyToDataTable();
                                    }

                                }
                                else
                                {
                                    oPivotData.Columns.Remove("QuesNo");
                                    oPivotData = oPivotData.AsEnumerable().OrderBy(i => PadNumbers(i.Field<string>("OverallComp"))).CopyToDataTable();

                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ExceedLimit = "false";
                if (ex.Message.ToString() != "No Data" && ex.Message.ToString() != "Limit")
                {
                    ExceptionLog exceptionLog = new ExceptionLog
                    {
                        ExceptionText = "Reports: " + ex.Message,
                        PageName = "_ComplianceDepartmentChart",
                        MethodName = "DynamicGroupByDepartmentColumns",
                        UserID = Convert.ToInt32(AppSession.UserID),
                        SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                        TransSQL = "",
                        HttpReferrer = null
                    };
                    _exceptionService.LogException(exceptionLog);
                }
                if(ex.Message.ToString() == "Limit"){
                    throw ex;
                }
            }
            return oPivotData;
        }
        private DataTable Pivotconvert(DataTable dt, DataTable dynamicColumns)
        {

            DataTable flatTDSData = new DataTable();
            DataTable dtc = new DataTable();
            DataTable result = new DataTable();
            DataTable table = new DataTable();


            string[] pkColumnsFlatData = new string[] {
                         "QID" };

            try
            {
                //pivot  column name column definition
                DataColumn pivotColumn = new DataColumn();
                pivotColumn.ColumnName = "OrgName_Rank1_Dept";

                //pivot  column vlue column definition
                DataColumn pivotValue = new DataColumn();
                pivotValue.ColumnName = "Compliance";

                DataColumn avgCompValue = new DataColumn();
                avgCompValue.ColumnName = "OverallComp";

                var deptList = dynamicColumns.AsEnumerable().Select(r => r[pivotColumn.ColumnName].ToString()).Distinct().ToList();
                dtc = (from depRows in dt.AsEnumerable()
                       where deptList.Any(r => depRows.Field<string>("OrgName_Rank1_Dept") == r.ToString())
                       select depRows).CopyToDataTable();

                OutputDepartmentIds = string.Join(",",dtc.AsEnumerable().Select(i => i.Field<Int32>("OrgName_Rank1_DeptID")).ToArray());

                flatTDSData = dtc.Copy();

                flatTDSData.Columns.Remove(pivotColumn.ColumnName);
                flatTDSData.Columns.Remove("OrgName_Rank1_DeptID");
                flatTDSData.Columns.Remove(pivotValue.ColumnName);

                string[] pkColumnNames = flatTDSData.Columns.Cast<DataColumn>()
                    .Select(c => c.ColumnName)
                    .ToArray();

                // prep results table
                result = flatTDSData.DefaultView.ToTable(true, pkColumnNames).Copy();
                var primaryColumnIDS = from l in result.Columns.Cast<DataColumn>().AsEnumerable()
                                       where pkColumnsFlatData.Contains(l.ColumnName) == true
                                       select l;

                //all static column defined as primary keys
                result.PrimaryKey = primaryColumnIDS.ToArray();

                //Average overall comp%
                result.Columns.Add(avgCompValue.ColumnName, avgCompValue.DataType);

                //add dynamic column into result table
                deptList.ForEach(c => result.Columns.Add(c, pivotValue.DataType));

                /*throw an exception for more than 50000 combination
                int pivotCount = deptList.Count * dtc.Rows.Count;
                if(pivotCount > Convert.ToInt32(ConfigurationManager.AppSettings["ReportPivotLimit"].ToString()))
                    throw (new Exception("Limit"));
                */
                // respective value to placed in pivot column
                var questionRankList = new List<int>();
                foreach (DataRow row in dtc.Rows)
                {
                    int QuestionRank = Convert.ToInt32(row["TracerQuestionRank"]);
                    if (!(questionRankList.Any(cus => cus == QuestionRank)))
                    {
                        questionRankList.Add(QuestionRank);
                        var dataList = dtc.AsEnumerable().Where(i => i.Field<int>("TracerQuestionRank") == QuestionRank).Select(i => i).ToList();
                        DataRow[] rows = result.AsEnumerable().Where(i => i.Field<int>("TracerQuestionRank") == QuestionRank).Select(i => i).ToArray();

                        var sumNum = rows.Sum(r => r.Field<decimal>("TotalNumerator"));
                        var sumDen = rows.Sum(r => r.Field<decimal>("TotalDenominator"));
                        var avgCom = sumDen == 0 ? "0.0" : ((decimal)(100 * sumNum) / (decimal)sumDen).ToString("0.0");
                        foreach (var foundRow in rows)
                        {
                            if (foundRow != null)
                            {
                                // the aggregate used here is LATEST 
                                // adjust the next line if you want (SUM, MAX, etc...)
                                //foundRow[row[avgCompValue.ColumnName].ToString()] = dt.Compute("AVG(["+row[pivotValue.ColumnName].ToString()+"])",string.Empty) + "%(" + dt.Compute(row["TotalNumerator"].ToString(),string.Empty) + "/" + dt.Compute(row["TotalDenominator"].ToString(),string.Empty) + ")";
                                foreach(var dataRow in dataList)
                                {
                                    foundRow[dataRow[pivotColumn.ColumnName].ToString()] = dataRow[pivotValue.ColumnName] + "% (" + dataRow["TotalNumerator"].ToString() + "/" + dataRow["TotalDenominator"].ToString() + ")";
                                }
                                foundRow[avgCompValue.ColumnName.ToString()] = avgCom + "% (" + sumNum + "/" + sumDen + ")";
                                for (int i = pkColumnNames.Length - 1; i < result.Columns.Count; i++)
                                {
                                    if (string.IsNullOrEmpty(foundRow[i].ToString()))
                                    {
                                        foundRow[i] = "";
                                    }
                                    if (foundRow[i].ToString() == "0.0% (0/0)")
                                    {
                                        foundRow[i] = "N/A";
                                    }
                                }

                            }
                        }
                    }
                }

                result.PrimaryKey = null;
                result.Columns.Remove("QID");
                result.Columns.Remove("TotalNumerator");
                result.Columns.Remove("TotalDenominator");
                result = result.AsEnumerable().DistinctBy(i=>i.Field<int>("TracerQuestionRank")).CopyToDataTable();
                result.Columns.Remove("TracerQuestionRank");
                /*
                result = result.AsEnumerable()
                       .GroupBy(x => x.Field<string>("QuestionText"))
                       .Select(g => g.First()).CopyToDataTable();
                var colCount = result.Columns.Count;
                while (colCount > (MaxBuckets + 2))
                {
                    result.Columns.RemoveAt(colCount - 1);
                    colCount = colCount - 1;
                }
                */
            }
            catch (Exception ex)
            {
                ExceedLimit = "false";
                if (ex.Message.ToString() != "No Data" && ex.Message.ToString() != "Limit")
                {
                    ExceptionLog exceptionLog = new ExceptionLog
                    {
                        ExceptionText = "Reports: " + ex.Message,
                        PageName = "_ComplianceDepartmentChart",
                        MethodName = "Pivotconvert",
                        UserID = Convert.ToInt32(AppSession.UserID),
                        SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                        TransSQL = "",
                        HttpReferrer = null
                    };
                    _exceptionService.LogException(exceptionLog);
                }
                if (ex.Message.ToString() == "Limit")
                {
                    throw ex;
                }
            }
            return result;
        }
        private DataSet ComplianceDepartmentData(Search search)
        {
            DataSet ds = new DataSet();
            int topLeastDropdownValue = Convert.ToInt32(search.TopLeastCompliantQuestions);
            string spName = String.Empty;
            /*
            var minCompliance = 0;
            var maxCompliance = 100;

            if (search.IncludeHavingComplianceValue)
                if (string.Equals(search.HavingComplianceOperator, "lt"))
                    maxCompliance = search.HavingComplianceValue - 1;
                else
                    minCompliance = search.HavingComplianceValue + 1;
            */
            try
            {
                if (search.TracerListIDs == "-1") { search.TracerListIDs = string.Empty; }
                if (search.OrgTypeLevel3IDs == "-1") search.OrgTypeLevel3IDs = string.Empty;
                if (search.OrgTypeLevel2IDs == "-1") search.OrgTypeLevel2IDs = string.Empty;
                if (search.OrgTypeLevel1IDs == "-1") search.OrgTypeLevel1IDs = string.Empty;
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd;
                    if (topLeastDropdownValue == 0)
                    {
                        spName = "ustReport_ComplianceByDepartmentSummary_ByQuestion";
                        cmd = new SqlCommand(spName, cn);
                        cmd.Parameters.AddWithValue("TracerQuestionIDs", search.TracerQuestionIDs);
                        cmd.CommandTimeout = Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                    }
                    else
                    {
                        spName = "ustReport_ComplianceByDepartmentSummary_ByTop";
                        cmd = new SqlCommand(spName, cn);
                        cmd.Parameters.AddWithValue("TopN", topLeastDropdownValue + 1);
                        cmd.CommandTimeout = 900; //Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());

                    }
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;

                    cmd.Parameters.AddWithValue("All", search.AllTracers ? 1 : 0);
                    cmd.Parameters.AddWithValue("TracerIDs", search.TracerListIDs);
                    cmd.Parameters.AddWithValue("SiteID", AppSession.SelectedSiteId);
                    cmd.Parameters.AddWithValue("ProgramID", AppSession.SelectedProgramId);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank3", search.OrgTypeLevel3IDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank2", search.OrgTypeLevel2IDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank1_Depts", search.OrgTypeLevel1IDs);
                    cmd.Parameters.AddWithValue("OrgActive", search.InActiveOrgTypes ? -1 : 1);
                    cmd.Parameters.AddWithValue("CycleID", AppSession.CycleID);
                    cmd.Parameters.AddWithValue("StartDate", search.StartDate);
                    cmd.Parameters.AddWithValue("EndDate", search.EndDate);
                    cmd.Parameters.AddWithValue("MinDenominator", search.IncludeMinimalDenomValue ? search.MinimalDenomValue : -1);
                    //cmd.Parameters.AddWithValue("MinCompliance", minCompliance);
                    //cmd.Parameters.AddWithValue("MaxCompliance", maxCompliance);
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
        private DataTable GenerateDynamicColumns(DataTable dt)
        {
            DataTable dtDynamicLabels = new DataTable();
            DataColumn col;
            SearchList s1 = new SearchList();
            col = new DataColumn();
            col.ColumnName = "OrgName_Rank1_Dept";
            col.DataType = typeof(string);
            dtDynamicLabels.Columns.Add(col);

            col = new DataColumn();
            col.ColumnName = "Compliance";
            col.DefaultValue = 0;
            col.DataType = typeof(string);
            dtDynamicLabels.Columns.Add(col);

            var dynamicColumns = new List<string>();

            System.Globalization.CultureInfo culture = System.Threading.Thread.CurrentThread.CurrentCulture;

            List<string> departmentColumn = (from table in dt.AsEnumerable()
                                             select table.Field<string>("OrgName_Rank1_Dept")).OrderBy(x => PadNumbers(x)).Distinct().ToList();
            dynamicColumns = Enumerable.Range(0, departmentColumn.Count())
                .Select(offset => departmentColumn[offset].ToString()).ToList();

            int dynamicColumnsCount = dynamicColumns.Count();
            NumberOfBuckets = dynamicColumnsCount;
            
            if(dynamicColumnsCount > MaxBuckets)
            {
                dynamicColumns.RemoveRange(100,dynamicColumnsCount - MaxBuckets);
                ExceedLimit = "TRUE";
            }
            
            foreach (string ColumnName in dynamicColumns.AsEnumerable().ToArray())
            {
                DataRow orowDynamic = dtDynamicLabels.NewRow();
                orowDynamic[0] = ColumnName;
                orowDynamic[1] = 0;
                dtDynamicLabels.Rows.Add(orowDynamic);
            }
            return dtDynamicLabels;

        }
        public DataSourceResult _complianceDepartmentExcel([DataSourceRequest]DataSourceRequest request, Search search)
        {
            DataSourceResult result = new DataSourceResult();
            try
            {
                search.EndDate = (search.EndDate != null && search.EndDate.ToString() != "") ? search.EndDate.Value.Date.AddHours(23).AddMinutes(29).AddSeconds(59) : search.EndDate;
                search.OrgTypeLevel1IDs = (search.OrgTypeLevel1IDs != null && search.OrgTypeLevel1IDs != "-1") ? search.OrgTypeLevel1IDs : "";
                search.OrgTypeLevel2IDs = (search.OrgTypeLevel2IDs != null && search.OrgTypeLevel2IDs != "-1") ? search.OrgTypeLevel2IDs : "";
                search.OrgTypeLevel3IDs = (search.OrgTypeLevel3IDs != null && search.OrgTypeLevel3IDs != "-1") ? search.OrgTypeLevel3IDs : "";

                List<ComplianceQuestionDetail> ComplianceQuestionDetailList = new List<ComplianceQuestionDetail>();
                DataTable dt = new DataTable();

                dt = ReportComplianceDepartment(search).Tables[0];

                object totalNum = dt.Compute("Sum(Num)", "");
                object totalDen = dt.Compute("Sum(Den)", "");
                object totalCompliance = (Convert.ToDecimal(totalNum) / Convert.ToDecimal(totalDen)) * 100;

                dt.Select().ToList<DataRow>().ForEach(r => { r["TotalNumerator"] = Convert.ToDecimal(totalNum); r["TotalDenominator"] = Convert.ToDecimal(totalDen); r["OverallCompliance"] = Convert.ToDecimal(totalCompliance); });

                ComplianceQuestionDetailList = dt.ToList<ComplianceQuestionDetail>();
                if (search.TracerListNames.Split(',').ToArray().Count() == 1)
                {
                    if (search.TracerListNames.Contains("All"))
                    {
                        ComplianceQuestionDetailList = ComplianceQuestionDetailList.OrderBy(i => i.OverallCompliance).ToList();
                    }
                    else
                    {
                        ComplianceQuestionDetailList = ComplianceQuestionDetailList.OrderBy(i => i.QuesNo).ToList();
                    }

                }
                else
                {
                    ComplianceQuestionDetailList = ComplianceQuestionDetailList.OrderBy(i => i.OverallCompliance).ToList();
                }
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
                    LimitDepartment = cqc.LimitDepartment

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
                        PageName = "TracerComplianceDepartment",
                        MethodName = "_ComplianceQuestionDepartmentExcel",
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
        private DataSet ReportComplianceDepartment(Search search)
        {

            DataSet ds = new DataSet();
            int topLeastDropdownValue = Convert.ToInt32(search.TopLeastCompliantQuestions);
            string spName = String.Empty;
            if (search.TracerListIDs == "-1") { search.TracerListIDs = string.Empty; }
            if (search.OrgTypeLevel3IDs == "-1") search.OrgTypeLevel3IDs = string.Empty;
            if (search.OrgTypeLevel2IDs == "-1") search.OrgTypeLevel2IDs = string.Empty;
            if (search.OrgTypeLevel1IDs == "-1") search.OrgTypeLevel1IDs = string.Empty;
            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd;

                    if (topLeastDropdownValue == 0)
                    {
                        spName = "ustReport_ComplianceByDepartmentDetail_ByQuestion";
                        cmd = new SqlCommand(spName, cn);
                        cmd.Parameters.AddWithValue("TracerQuestionIDs", search.TracerQuestionIDs);
                        cmd.CommandTimeout = Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                    }
                    else
                    {
                        spName = "ustReport_ComplianceByDepartmentDetail_ByTop";
                        cmd = new SqlCommand(spName, cn);
                        cmd.Parameters.AddWithValue("TopN", topLeastDropdownValue + 1);
                        cmd.CommandTimeout = 900;//Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                    }

                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("TracerIDs", search.TracerListIDs);
                    cmd.Parameters.AddWithValue("All", search.AllTracers ? 1 : 0);
                    cmd.Parameters.AddWithValue("SiteID", AppSession.SelectedSiteId);
                    cmd.Parameters.AddWithValue("ProgramID", AppSession.SelectedProgramId);
                    cmd.Parameters.AddWithValue("QuestionID", search.QuestionID);
                    cmd.Parameters.AddWithValue("OutputDepartmentList", search.OutputDepartmentList); 
                    cmd.Parameters.AddWithValue("OrgIDs_Rank3", search.OrgTypeLevel3IDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank2", search.OrgTypeLevel2IDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank1_Depts", search.OrgTypeLevel1IDs);
                    cmd.Parameters.AddWithValue("OrgActive", search.InActiveOrgTypes ? -1 : 1);
                    cmd.Parameters.AddWithValue("CycleID", AppSession.CycleID);
                    cmd.Parameters.AddWithValue("StartDate", search.StartDate);
                    cmd.Parameters.AddWithValue("EndDate", search.EndDate);
                    cmd.Parameters.AddWithValue("MinDenominator", search.IncludeMinimalDenomValue ? search.MinimalDenomValue : -1);
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

        private static string PadNumbers(string input)
        {
            return Regex.Replace(input, "[0-9]+", match => match.Value.PadLeft(10, '0'));
        }
    }
}