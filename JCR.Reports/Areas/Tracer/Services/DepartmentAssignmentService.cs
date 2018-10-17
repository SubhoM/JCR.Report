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

namespace JCR.Reports.Areas.Tracer.Services
{
    public class DepartmentAssignmentService : BaseService
    {
        ExceptionService _exceptionService = new ExceptionService();

        private const int MaxBuckets = 90;
        public string ExceedLimit = string.Empty;
        public string RecordStatus = string.Empty;
        public int TracerObsFrequencyTypeID { get; set; }
        public int NumberOfBuckets { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }



        private string removeHypen(string frequencyType)
        {
            if (frequencyType == "Semi-Annually") { frequencyType = "SemiAnnualy"; }
            return frequencyType;
        }

        public DataTable DynamicGroupByTracerColumns(Search search)
        {
            ExceedLimit = "false";
            DataTable oGroupByTracer = new DataTable();
            DataTable oPivotData = new DataTable();
            DataTable oDynamicColumns = new DataTable();

            try
            {
                string frequencyName = removeHypen(search.ActiveFrequencyName);

                //to find start and end date based on input actual start and end date.
                TracerScheduleFrequencyData(search.StartDate, search.EndDate, ((int)Enum.Parse(typeof(TracerDepartmentFrequencyEnum), frequencyName)));

                //dynamic column generation
                oDynamicColumns = GenerateDynamicColumns(StartDate, EndDate, ((int)Enum.Parse(typeof(TracerDepartmentFrequencyEnum), frequencyName)));

                RecordStatus = "FALSE";
                // This Validation part is moved in the functionality where only Active Frequncy Tabs are loaded.
                //var isValid = this.ReportValidateDepartmentAssignmentData(search, StartDate, EndDate);

                //if (!isValid)
                //{
                //    RecordStatus = "TRUE";
                //    return oPivotData;
                //}


                oGroupByTracer = this.ReportDepartmentAssignmentData(search, StartDate, EndDate).Tables[0];

                if (oGroupByTracer != null)
                {
                    if (oGroupByTracer.Rows.Count > 0)
                    {

                        var groupedTracerData = (from row in oGroupByTracer.AsEnumerable()
                                                 group row by new
                                                 {
                                                     DateLabel = row.Field<String>("DateLabel"),
                                                     OrgName_Rank3 = row.Field<String>("OrgName_Rank3"),
                                                     OrgName_Rank2 = row.Field<String>("OrgName_Rank2"),
                                                     OrgName_Rank1_Dept = row.Field<String>("OrgName_Rank1_Dept"),
                                                     OrgID_Rank1_Dept = row.Field<Int32>("OrgID_Rank1_Dept"),
                                                     OrgID_Rank2 = row.Field<Int32>("OrgID_Rank2"),
                                                     OrgID_Rank3 = row.Field<Int32>("OrgID_Rank3"),
                                                     TracerName = row.Field<String>("TracerName"),
                                                     ExpectedObsCt = row.Field<Int32>("ExpectedObsCt"),
                                                     TracerCustomID = row.Field<Int32>("TracerCustomID"),
                                                     TracerObsFrequencyTypeID = row.Field<Int32>("TracerObsFrequencyTypeID"),
                                                     Department = row.Field<String>("Department"),
                                                     ReportOutputID = row.Field<Int64>("ReportOutputID")
                                                 } into g
                                                 select new
                                                 {

                                                     ExpectedObsCt = g.Key.ExpectedObsCt,
                                                     TracerName = g.Key.TracerName,
                                                     DateLabel = g.Key.DateLabel,
                                                     OrgName_Rank3 = g.Key.OrgName_Rank3,
                                                     OrgName_Rank2 = g.Key.OrgName_Rank2,
                                                     OrgName_Rank1_Dept = g.Key.OrgName_Rank1_Dept,
                                                     ReportOutputID = g.Key.ReportOutputID,
                                                     Department = g.Key.Department,
                                                     TracerResponseCount = g.Sum(x => x.Field<Int32>("TracerResponseCount"))
                                                 })
                                  .ToList().ToDataTable();


                        if (groupedTracerData != null)
                        {
                            if (groupedTracerData.Rows.Count > 0)
                            {
                                if (NumberOfBuckets >= MaxBuckets - 1)
                                {
                                    ExceedLimit = "TRUE";
                                }
                                oPivotData = Pivotconvert(groupedTracerData, oDynamicColumns);
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
                        PageName = "_TracerDepartmentAssignment",
                        MethodName = "DynamicGroupByTracerColumns",
                        UserID = Convert.ToInt32(AppSession.UserID),
                        SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                        TransSQL = "",
                        HttpReferrer = null
                    };
                    _exceptionService.LogException(exceptionLog);
                }
            }
            return oPivotData;
        }

        /// <summary>
        /// Datatable Convert to PIVOT 
        /// </summary>
        /// <param name="dt"></param>
        /// <returns></returns>
        private DataTable Pivotconvert(DataTable dt, DataTable dynamicColumns)
        {

            DataTable flatTDSData = new DataTable();
            DataTable result = new DataTable();
            DataTable table = new DataTable();


            string[] pkColumnsFlatData = new string[] {
                         "ReportOutputID" };

            try
            {

                flatTDSData = dt.Copy();

                //pivot  column name column definition
                DataColumn pivotColumn = new DataColumn();
                pivotColumn.ColumnName = "DateLabel";

                //pivot  column vlue column definition
                DataColumn pivotValue = new DataColumn();

                pivotValue.ColumnName = "TracerResponseCount";
                pivotValue.DataType = typeof(Int32);

                flatTDSData.Columns.Remove(pivotColumn.ColumnName);
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

                //add dynamic column into result table
                dynamicColumns.AsEnumerable()
                  .Select(r => r[pivotColumn.ColumnName].ToString())
                  .Distinct().ToList()
               .ForEach(c => result.Columns.Add(c, pivotValue.DataType));


                // respective value to placed in pivot column
                foreach (DataRow row in dt.Rows)
                {

                    DataRow foundRow = result.Rows.Find(row["ReportOutputID"]);


                    if (foundRow != null)
                    {
                        // the aggregate used here is LATEST 
                        // adjust the next line if you want (SUM, MAX, etc...)
                        foundRow[row[pivotColumn.ColumnName].ToString()] = row[pivotValue.ColumnName];

                        for (int i = pkColumnNames.Length - 1; i < result.Columns.Count; i++)
                        {
                            if (string.IsNullOrEmpty(foundRow[i].ToString()))
                            {
                                foundRow[i] = 0;
                            }
                        }
                    }
                }

                result.PrimaryKey = null;
                result.Columns.Remove("ReportOutputID");
            }
            catch (Exception ex)
            {
                ExceedLimit = "false";
                if (ex.Message.ToString() != "No Data" && ex.Message.ToString() != "Limit")
                {
                    ExceptionLog exceptionLog = new ExceptionLog
                    {
                        ExceptionText = "Reports: " + ex.Message,
                        PageName = "_TracerDepartmentAssignment",
                        MethodName = "Pivotconvert",
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

//        private bool ReportValidateDepartmentAssignmentData(Search search, DateTime? startDate, DateTime? endDate)
//        {

//            var isValid = false;

//            try
//            {
//                if (search.TracerListIDs == "-1") { search.TracerListIDs = string.Empty; }
//                if (search.TracerCategoryIDs == "-1") search.TracerCategoryIDs = string.Empty;
//                if (search.TracerFrequencyIDs == "-1") search.TracerFrequencyIDs = string.Empty;
//                if (search.OrgTypeLevel3IDs == "-1") search.OrgTypeLevel3IDs = string.Empty;
//                if (search.OrgTypeLevel2IDs == "-1") search.OrgTypeLevel2IDs = string.Empty;
//                if (search.OrgTypeLevel1IDs == "-1") search.OrgTypeLevel1IDs = string.Empty;


//                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
//                {
//                    cn.Open();
//                    SqlCommand cmd = new SqlCommand("ustReport_ValidateTracerDepartmentScheduleData", cn);
//                    cmd.CommandTimeout = Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
//                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
//                    cmd.Parameters.AddWithValue("SiteID", AppSession.SelectedSiteId);
//                    cmd.Parameters.AddWithValue("ProgramID", AppSession.SelectedProgramId);
//                    cmd.Parameters.AddWithValue("TracerIDs", search.TracerListIDs);
//                    cmd.Parameters.AddWithValue("TracerCategoryIDs", search.TracerCategoryIDs);
//                    cmd.Parameters.AddWithValue("FrequencyIDs", search.TracerFrequencyIDs);
//                    cmd.Parameters.AddWithValue("OrgIDs_Rank3", search.OrgTypeLevel3IDs);
//                    cmd.Parameters.AddWithValue("OrgIDs_Rank2", search.OrgTypeLevel2IDs);
//                    cmd.Parameters.AddWithValue("OrgIDs_Rank1_Depts", search.OrgTypeLevel1IDs);
//                    cmd.Parameters.AddWithValue("OrgActive", search.InActiveOrgTypes ? -1 : 1);                               //     -1 => All Active/Inactive Orgs;  1 = => Only Active Orgs; 0 => Only Inactive Orgs                    

//                    CreateSQLExecuted("ustReport_ValidateTracerDepartmentScheduleData", cmd);
//#if DEBUG
//                    System.Diagnostics.Debug.WriteLine(_SQLExecuted);
//#endif

//                    using (cn)
//                    using (cmd)
//                    {
//                        var noDataFlag = cmd.ExecuteScalar();

//                        if ((int)noDataFlag == 0)
//                            isValid = true;
//                    }
//                }
//            }
//            catch (SqlException)
//            {
//                throw (new Exception("Limit"));
//            }
//            catch (Exception ex)
//            {
//                ex.Data.Add(TSQL, _SQLExecuted);
//                throw ex;

//            }

//            return isValid;
//        }


        private DataSet ReportDepartmentAssignmentData(Search search, DateTime? startDate, DateTime? endDate)
        {

            DataSet ds = new DataSet();

            try
            {
                if (search.TracerListIDs == "-1") { search.TracerListIDs = string.Empty; }
                if (search.TracerCategoryIDs == "-1") search.TracerCategoryIDs = string.Empty;
                if (search.TracerFrequencyIDs == "-1") search.TracerFrequencyIDs = string.Empty;
                if (search.OrgTypeLevel3IDs == "-1") search.OrgTypeLevel3IDs = string.Empty;
                if (search.OrgTypeLevel2IDs == "-1") search.OrgTypeLevel2IDs = string.Empty;
                if (search.OrgTypeLevel1IDs == "-1") search.OrgTypeLevel1IDs = string.Empty;


                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustReport_TracerDepartmentScheduleData", cn);
                    cmd.CommandTimeout = Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("SiteID", AppSession.SelectedSiteId);
                    cmd.Parameters.AddWithValue("ProgramID", AppSession.SelectedProgramId);
                    cmd.Parameters.AddWithValue("TracerIDs", search.TracerListIDs);
                    cmd.Parameters.AddWithValue("TracerCategoryIDs", search.TracerCategoryIDs);
                    cmd.Parameters.AddWithValue("FrequencyIDs", ((int)Enum.Parse(typeof(TracerDepartmentFrequencyEnum), removeHypen(search.ActiveFrequencyName))));
                    cmd.Parameters.AddWithValue("OrgIDs_Rank3", search.OrgTypeLevel3IDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank2", search.OrgTypeLevel2IDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank1_Depts", search.OrgTypeLevel1IDs);
                    cmd.Parameters.AddWithValue("OrgActive", search.InActiveOrgTypes ? -1 : 1);                               //     -1 => All Active/Inactive Orgs;  1 = => Only Active Orgs; 0 => Only Inactive Orgs                    
                    cmd.Parameters.AddWithValue("ResponseStartDate", startDate);
                    cmd.Parameters.AddWithValue("ResponseEndDate", endDate);
                    cmd.Parameters.AddWithValue("ReportGroupByType", search.ReportType);
                    cmd.Parameters.AddWithValue("CriteriaFrequencyIDs", search.TracerFrequencyIDs);

                    CreateSQLExecuted("uspExceptionLogInsert", cmd);
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

            return ds;


        }


        private void TracerScheduleFrequencyData(DateTime? startdate, DateTime? enddate, int tracerObsFrequencyTypeID)
        {



            DateTime dateBegin = Convert.ToDateTime(startdate);
            DateTime dateEnd = Convert.ToDateTime(enddate);



            switch (tracerObsFrequencyTypeID)
            {
                case ((int)TracerDepartmentFrequencyEnum.Daily):
                    {
                        double numberBuckets = (dateEnd - dateBegin).TotalDays + 1;
                        NumberOfBuckets = Convert.ToInt32(numberBuckets);
                        if (NumberOfBuckets > MaxBuckets)
                        {
                            NumberOfBuckets = MaxBuckets - 1;
                            StartDate = dateEnd.AddDays(-NumberOfBuckets);
                        }
                        else
                        {
                            StartDate = dateBegin;
                        }
                        EndDate = dateEnd;

                        break;
                    }
                case ((int)TracerDepartmentFrequencyEnum.Weekly):
                    {
                        double numberBuckets = ((dateEnd - dateBegin).TotalDays / 7) + 1;
                        NumberOfBuckets = Convert.ToInt32(numberBuckets);
                        NumberOfBuckets = Convert.ToInt32(numberBuckets);
                        if (NumberOfBuckets > MaxBuckets)
                        {
                            NumberOfBuckets = MaxBuckets - 1;
                            StartDate = dateEnd.AddDays(-NumberOfBuckets * 7);
                        }
                        else
                        {
                            StartDate = dateBegin;
                        }
                        EndDate = dateEnd;
                        break;
                    }
                case ((int)TracerDepartmentFrequencyEnum.Monthly):
                    {
                        NumberOfBuckets = ((dateEnd.Year - dateBegin.Year) * 12) + dateEnd.Month - dateBegin.Month + 1;
                        if (NumberOfBuckets > MaxBuckets)
                        {
                            NumberOfBuckets = MaxBuckets - 1;
                            StartDate = dateEnd.AddMonths(-NumberOfBuckets);
                        }
                        else
                        {
                            StartDate = dateBegin;
                        }
                        EndDate = dateEnd;
                        break;
                    }
                case ((int)TracerDepartmentFrequencyEnum.Quarterly):
                    {
                        double numberBuckets = GetQuarters(dateBegin, dateEnd);
                        NumberOfBuckets = Convert.ToInt32(numberBuckets);
                        if (NumberOfBuckets > MaxBuckets)
                        {
                            NumberOfBuckets = MaxBuckets - 1;
                            StartDate = dateEnd.AddMonths(-NumberOfBuckets * 3);
                        }
                        else
                        {
                            StartDate = dateBegin;
                        }
                        EndDate = dateEnd;

                        break;
                    }
                case ((int)TracerDepartmentFrequencyEnum.SemiAnnualy):
                    {
                        NumberOfBuckets = ((dateEnd.Year - dateBegin.Year) * 12) + dateEnd.Month - dateBegin.Month;
                        NumberOfBuckets = (int)Math.Ceiling(Convert.ToDecimal(NumberOfBuckets) / 6) + 1;
                        if (NumberOfBuckets > MaxBuckets)
                        {
                            NumberOfBuckets = MaxBuckets - 1;
                            StartDate = dateEnd.AddMonths(-NumberOfBuckets * 6);
                        }
                        else
                        {
                            StartDate = dateBegin;
                        }
                        EndDate = dateEnd;
                        break;
                    }
                case ((int)TracerDepartmentFrequencyEnum.Annually):
                    {
                        NumberOfBuckets = dateEnd.Year - dateBegin.Year + 1;
                        if (NumberOfBuckets > MaxBuckets)
                        {
                            NumberOfBuckets = MaxBuckets - 1;
                            StartDate = dateEnd.AddMonths(-NumberOfBuckets * 12);
                        }
                        else
                        {
                            StartDate = dateBegin;
                        }
                        EndDate = dateEnd;
                        break;
                    }
            }
        }

        private DataTable GenerateDynamicColumns(DateTime? start, DateTime? end, int tracerObsFrequencyTypeID)
        {
            DataTable dtDynamicLabels = new DataTable();
            bool semiAnnualList = false;
            DataColumn col;

            col = new DataColumn();
            col.ColumnName = "DateLabel";
            col.DataType = typeof(string);
            dtDynamicLabels.Columns.Add(col);

            col = new DataColumn();
            col.ColumnName = "TracerResponseCount";
            col.DefaultValue = 0;
            col.DataType = typeof(int);
            dtDynamicLabels.Columns.Add(col);

            var dynamicColumns = new List<string>();

            System.Globalization.CultureInfo culture = System.Threading.Thread.CurrentThread.CurrentCulture;

            switch (tracerObsFrequencyTypeID)
            {
                case ((int)TracerDepartmentFrequencyEnum.Daily):
                    {
                        //daily
                        dynamicColumns = Enumerable.Range(0, 1 + end.Value.Subtract(start.Value).Days)
                          .Select(offset => "DayOf" + start.Value.AddDays(offset).ToString("yyyyMMdd")).ToList();
                        break;
                    }
                case ((int)TracerDepartmentFrequencyEnum.Weekly):
                    {
                        //weekly.
                        dynamicColumns = Enumerable.Range(0, (end.Value - start.Value.AddDays(-7)).Days)
                   .Where(x => start.Value.AddDays(x).DayOfWeek == culture.DateTimeFormat.FirstDayOfWeek)
                   .Select(x => start.Value.AddDays(-7).AddDays(x))
                   .Where(x => x < end)
                   .Select(x => "WeekOf" + x.ToString("yyyyMMdd")).ToList();
                        break;
                    }
                case ((int)TracerDepartmentFrequencyEnum.Monthly):
                    {
                        //monthly
                        dynamicColumns = Enumerable.Range(0, (end.Value.Year - start.Value.Year) * 12 + (end.Value.Month - start.Value.Month + 1))
                     .Select(m => "MonthOf" + new DateTime(start.Value.Year, start.Value.Month, 1).AddMonths(m).ToString("MMMyy")).ToList();
                        break;
                    }
                case ((int)TracerDepartmentFrequencyEnum.Quarterly):
                    {

                        //quarter
                        dynamicColumns = Enumerable.Range(0, (end.Value.Year - start.Value.Year) * 12 + (end.Value.Month - start.Value.Month + 1))
                     .Select(m => new DateTime(start.Value.Year, start.Value.Month, 1).AddMonths(m))
                     .GroupBy(a => ("Q" + (((a.Month - 1) / 3) + 1) + a.Year).ToString())
                     .Select(a => a.Key).ToList();
                        break;
                    }
                case ((int)TracerDepartmentFrequencyEnum.SemiAnnualy):
                    {
                        //semi annually
                        var semiAnnual = Enumerable.Range(0, (end.Value.Year - start.Value.Year) * 12 + (end.Value.Month - start.Value.Month + 1))
                       .Select(m => new DateTime(start.Value.Year, start.Value.Month, 1).AddMonths(m))
                       .GroupBy(a => new { H = ((((a.Month - 1) / 6) + 1)), Year = a.Year })
                       .Select(a => new { date = "SA" + ((a.Key.H == 1) ? a.Key.Year + "01" + "01" : a.Key.Year + "07" + "01") + "_" + ((a.Key.H == 1) ? a.Key.Year + "06" + "30" : a.Key.Year + "12" + "31") }).ToList();
                        semiAnnualList = true;
                        if (semiAnnual.Count() > MaxBuckets) { semiAnnual.RemoveAt(0); }
                        foreach (DataRow oRowSemiAnnual in semiAnnual.ToDataTable().Rows)
                        {
                            DataRow orow = dtDynamicLabels.NewRow();
                            orow[0] = oRowSemiAnnual[0];
                            orow[1] = 0;
                            dtDynamicLabels.Rows.Add(orow);
                        }
                        break;
                    }
                case ((int)TracerDepartmentFrequencyEnum.Annually):
                    {

                        //annually
                        dynamicColumns = Enumerable.Range(0, (end.Value.Year - start.Value.Year) * 12 + (end.Value.Month - start.Value.Month + 1))
                     .Select(m => new DateTime(start.Value.Year, start.Value.Month, 1).AddMonths(m))
                     .GroupBy(a => ("Year_" + a.Year).ToString())
                     .Select(a => a.Key).ToList();
                        break;
                    }
            }
            if (semiAnnualList == false)
            {
                if (dynamicColumns.Count() > MaxBuckets) { dynamicColumns.RemoveAt(0); }
                foreach (string ColumnName in dynamicColumns.AsEnumerable().ToArray())
                {
                    DataRow orowDynamic = dtDynamicLabels.NewRow();
                    orowDynamic[0] = ColumnName;
                    orowDynamic[1] = 0;
                    dtDynamicLabels.Rows.Add(orowDynamic);
                }
            }

            return dtDynamicLabels;

        }

        private static double GetQuarters(DateTime dt1, DateTime dt2)
        {
            double d1Quarter = GetQuarter(dt1.Month);
            double d2Quarter = GetQuarter(dt2.Month);
            double d1 = d2Quarter - d1Quarter;
            double d2 = (4 * (dt2.Year - dt1.Year));
            return Math.Ceiling(d1 + d2);
        }
        private static int GetQuarter(int nMonth)
        {
            if (nMonth <= 3)
                return 1;
            if (nMonth <= 6)
                return 2;
            if (nMonth <= 9)
                return 3;
            return 4;
        }

        private DateTime GetQuarterStartingDate(DateTime myDate)
        {
            return new DateTime(myDate.Year, (3 * GetQuarterName(myDate)) - 2, 1);
        }
        int GetQuarterName(DateTime myDate)
        {
            return (int)Math.Ceiling(myDate.Month / 3.0);
        }

        public List<TracerFrequency> GetValidFrequencyForDepartmentAssignmentData(Search search)
        {

            List<TracerFrequency> list = null;
            try
            {
                if (search.TracerListIDs == "-1") { search.TracerListIDs = string.Empty; }
                if (search.TracerCategoryIDs == "-1") search.TracerCategoryIDs = string.Empty;
                if (search.TracerFrequencyIDs == "-1") search.TracerFrequencyIDs = string.Empty;
                if (search.OrgTypeLevel3IDs == "-1") search.OrgTypeLevel3IDs = string.Empty;
                if (search.OrgTypeLevel2IDs == "-1") search.OrgTypeLevel2IDs = string.Empty;
                if (search.OrgTypeLevel1IDs == "-1") search.OrgTypeLevel1IDs = string.Empty;


                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustReport_ValidateTracerDepartmentScheduleData", cn);
                    cmd.CommandTimeout = Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("SiteID", AppSession.SelectedSiteId);
                    cmd.Parameters.AddWithValue("ProgramID", AppSession.SelectedProgramId);
                    cmd.Parameters.AddWithValue("TracerIDs", search.TracerListIDs);
                    cmd.Parameters.AddWithValue("TracerCategoryIDs", search.TracerCategoryIDs);
                    cmd.Parameters.AddWithValue("FrequencyIDs", search.TracerFrequencyIDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank3", search.OrgTypeLevel3IDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank2", search.OrgTypeLevel2IDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank1_Depts", search.OrgTypeLevel1IDs);
                    cmd.Parameters.AddWithValue("OrgActive", search.InActiveOrgTypes ? -1 : 1);                               //     -1 => All Active/Inactive Orgs;  1 = => Only Active Orgs; 0 => Only Inactive Orgs                    
                    cmd.Parameters.AddWithValue("GetValidFrequencies", 1);

                    CreateSQLExecuted("ustReport_ValidateTracerDepartmentScheduleData", cmd);
#if DEBUG
                    System.Diagnostics.Debug.WriteLine(_SQLExecuted);
#endif
                    SqlDataAdapter da = new SqlDataAdapter(cmd);
                    DataSet ds = new DataSet();

                    using (cn)
                    using (cmd)
                    using (da)
                    {
                        da.Fill(ds);
                    }

                    DataTable dt = ds.Tables[0];
                    list = dt.ToList<TracerFrequency>();
                }
                return list;
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
        }
    }
}