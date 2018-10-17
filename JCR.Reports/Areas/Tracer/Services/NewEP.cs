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
namespace JCR.Reports.Areas.Tracer.Services
{
    public class NewEP : BaseService
    {
        ExceptionService _exceptionService = new ExceptionService();
        public DataSourceResult NewEPExcel([DataSourceRequest]DataSourceRequest request, Search search)
        {
            DataSourceResult result = new DataSourceResult();
            try
            {
                SearchFormat sf = new SearchFormat();
                sf.CheckInputs(search);

                  List<NewEp> newEPExcel = new List<NewEp>();
                  DataTable dt = new DataTable();

                  dt = newEPData(search).Tables[0];

                //convert datatable to list       
                newEPExcel = dt.ToList<NewEp>();

               
                result = newEPExcel.ToDataSourceResult(request, tc => new NewEp
                {
                   
                    StdEffectiveBeginDate = tc.StdEffectiveBeginDate,
                    StdEP = tc.StdEP,
                    EPText = tc.EPText

                });
              

            }
            catch (Exception ex)
            {
                if (ex.Message.ToString() == "No Data")
                {
                    result.Errors = "No Data found matching your criteria.";
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
                        PageName = "NewEP",
                        MethodName = "NewEPExcel",
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
        public DataSet newEPData(Search search)
        {
          
            DataSet ds = new DataSet();
         
            try
            {
                // need to be modified based on SP.
                using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBMEdition01"].ToString()))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustReport_NewEPs", cn);
                    cmd.CommandTimeout = Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("CycleID", search.EPMigrationChangeDate == "-1" ? "" : search.EPMigrationChangeDate);
                    cmd.Parameters.AddWithValue("ProgramID", AppSession.SelectedProgramId);
                   
                    CreateSQLExecuted("uspExceptionLogInsert", cmd);

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
          //  else if (rowsCount > Convert.ToInt32(ConfigurationManager.AppSettings["ReportOutputLimit"].ToString()))
           //     throw (new Exception("Limit"));
            
            return ds;
        }
    }
}